import json
import os
import base64
import boto3
import requests
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61788166_html_to_frontend')
HEADERS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}


def handler(event: dict, context) -> dict:
    """Загрузка счёта в S3, OCR через Yandex Vision, анализ через Yandex GPT и автозаполнение полей формы"""

    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return resp(405, {'error': 'Method not allowed'})

    body = json.loads(event.get('body', '{}') or '{}')
    file_data = body.get('file')
    file_name = body.get('fileName', 'invoice.jpg')

    if not file_data:
        return resp(400, {'error': 'File data is required'})

    if ',' in file_data:
        file_data = file_data.split(',')[1]
    file_bytes = base64.b64decode(file_data)

    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    s3_key = f'invoices/{timestamp}_{file_name}'
    content_type = 'application/pdf' if file_name.lower().endswith('.pdf') else 'image/jpeg'

    s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes, ContentType=content_type)
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"

    api_key = os.environ.get('API_KEY_SECRET', '')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', '')

    if not api_key or not folder_id:
        return resp(200, {'file_url': cdn_url, 'extracted_data': None, 'warning': 'OCR не настроен — нужны API_KEY_SECRET и YANDEX_FOLDER_ID'})

    ocr_text = run_vision_ocr(file_data, api_key, folder_id)

    if not ocr_text:
        return resp(200, {'file_url': cdn_url, 'extracted_data': None, 'raw_text': '', 'warning': 'Текст не распознан'})

    ref_data = load_reference_data()
    extracted = analyze_with_gpt(ocr_text, ref_data, api_key, folder_id)

    return resp(200, {
        'file_url': cdn_url,
        'extracted_data': extracted,
        'raw_text': ocr_text[:500]
    })


def resp(status: int, body: dict) -> dict:
    return {'statusCode': status, 'headers': HEADERS, 'body': json.dumps(body, ensure_ascii=False, default=str), 'isBase64Encoded': False}


def run_vision_ocr(file_data_b64: str, api_key: str, folder_id: str) -> str:
    r = requests.post(
        'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze',
        headers={'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'},
        json={
            'folderId': folder_id,
            'analyze_specs': [{
                'content': file_data_b64,
                'features': [{'type': 'TEXT_DETECTION', 'text_detection_config': {'language_codes': ['ru', 'en']}}]
            }]
        },
        timeout=30
    )

    if r.status_code != 200:
        print(f"[OCR ERROR] {r.status_code}: {r.text[:500]}")
        return ''

    data = r.json()
    full_text = ''

    try:
        pages = data['results'][0]['results'][0]['textDetection']['pages']
        for page in pages:
            for block in page.get('blocks', []):
                for line in block.get('lines', []):
                    words = [w.get('text', '') for w in line.get('words', [])]
                    full_text += ' '.join(words) + '\n'
    except (KeyError, IndexError) as e:
        print(f"[OCR PARSE] {e}")

    return full_text.strip()


def load_reference_data() -> dict:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    ref = {}
    queries = {
        'categories': f'SELECT id, name FROM {SCHEMA}.categories ORDER BY name',
        'services': f'SELECT id, name FROM {SCHEMA}.services ORDER BY name',
        'departments': f'SELECT id, name FROM {SCHEMA}.customer_departments ORDER BY name',
        'legal_entities': f'SELECT id, name FROM {SCHEMA}.legal_entities ORDER BY name',
        'contractors': f'SELECT id, name, inn FROM {SCHEMA}.contractors ORDER BY name',
    }

    for key, query in queries.items():
        cur.execute(query)
        ref[key] = [dict(row) for row in cur.fetchall()]

    cur.close()
    conn.close()
    return ref


def analyze_with_gpt(ocr_text: str, ref_data: dict, api_key: str, folder_id: str) -> dict:
    cats = '\n'.join([f"  id={c['id']}: {c['name']}" for c in ref_data['categories']])
    svcs = '\n'.join([f"  id={s['id']}: {s['name']}" for s in ref_data['services']])
    deps = '\n'.join([f"  id={d['id']}: {d['name']}" for d in ref_data['departments']])
    les = '\n'.join([f"  id={le['id']}: {le['name']}" for le in ref_data['legal_entities']])
    ctrs = '\n'.join([f"  id={c['id']}: {c['name']} (ИНН: {c.get('inn', '')})" for c in ref_data['contractors']])

    prompt = f"""Из текста документа извлеки данные и сопоставь с справочниками.

ТЕКСТ ДОКУМЕНТА:
{ocr_text[:3000]}

СПРАВОЧНИКИ:
Категории:
{cats}

Сервисы/Услуги:
{svcs}

Отделы:
{deps}

Юридические лица (наши компании-покупатели):
{les}

Контрагенты (поставщики):
{ctrs}

ПРАВИЛА:
1. Извлеки сумму (итого к оплате с НДС), номер счёта, дату счёта
2. Сопоставь ПОСТАВЩИКА/ИСПОЛНИТЕЛЯ с контрагентом из списка по названию или ИНН. Если нет совпадения — верни contractor_name и contractor_inn
3. Сопоставь ПОКУПАТЕЛЯ/ЗАКАЗЧИКА с юридическим лицом из списка
4. Подбери категорию и сервис по содержимому счёта
5. Определи отдел (IT для технических услуг, Бухгалтерия для финансовых)
6. Сформируй краткое описание за что платим

Верни ТОЛЬКО валидный JSON без markdown:
{{"amount": 12345.67, "invoice_number": "123", "invoice_date": "2025-01-15", "description": "краткое описание", "category_id": 1, "service_id": 1, "department_id": 1, "legal_entity_id": 1, "legal_entity_name": null, "legal_entity_inn": null, "contractor_id": 1, "contractor_name": null, "contractor_inn": null}}

Если поле не определено — ставь null.
Для contractor: если найден в списке — только contractor_id, если нет — contractor_name и contractor_inn (без contractor_id).
Для legal_entity: если найден в списке — только legal_entity_id, если нет — legal_entity_name и legal_entity_inn (без legal_entity_id)."""

    r = requests.post(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        headers={'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'},
        json={
            'modelUri': f'gpt://{folder_id}/yandexgpt/latest',
            'completionOptions': {'stream': False, 'temperature': 0.1, 'maxTokens': 1000},
            'messages': [
                {'role': 'system', 'text': 'Ты — система распознавания данных из счетов. Отвечай строго в формате JSON без markdown-обёрток.'},
                {'role': 'user', 'text': prompt}
            ]
        },
        timeout=60
    )

    if r.status_code != 200:
        print(f"[GPT ERROR] {r.status_code}: {r.text[:500]}")
        return parse_basic(ocr_text)

    try:
        text_resp = r.json()['result']['alternatives'][0]['message']['text'].strip()
        if text_resp.startswith('```'):
            text_resp = text_resp.split('\n', 1)[1] if '\n' in text_resp else text_resp[3:]
        if text_resp.endswith('```'):
            text_resp = text_resp[:-3]
        return json.loads(text_resp.strip())
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"[GPT PARSE ERROR] {e}")
        return parse_basic(ocr_text)


def parse_basic(text: str) -> dict:
    data = {'amount': None, 'invoice_number': None, 'invoice_date': None, 'description': None,
            'category_id': None, 'service_id': None, 'department_id': None,
            'legal_entity_id': None, 'legal_entity_name': None, 'legal_entity_inn': None,
            'contractor_id': None, 'contractor_name': None, 'contractor_inn': None}

    if not text:
        return data

    tl = text.lower()

    for p in [r'итого[:\s]+(\d[\d\s]*[.,]?\d*)', r'сумма[:\s]+(\d[\d\s]*[.,]?\d*)', r'к\s+оплате[:\s]+(\d[\d\s]*[.,]?\d*)', r'всего[:\s]+(\d[\d\s]*[.,]?\d*)']:
        m = re.search(p, tl)
        if m:
            try:
                data['amount'] = float(m.group(1).replace(' ', '').replace(',', '.'))
                break
            except ValueError:
                pass

    for p in [r'сч[её]т[:\s№]+(\d+)', r'№\s*(\d+)']:
        m = re.search(p, tl)
        if m:
            data['invoice_number'] = m.group(1)
            break

    for p in [r'(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})', r'(\d{4}[./-]\d{1,2}[./-]\d{1,2})']:
        m = re.search(p, text)
        if m:
            for fmt in ['%d.%m.%Y', '%d/%m/%Y', '%Y-%m-%d']:
                try:
                    data['invoice_date'] = datetime.strptime(m.group(1), fmt).strftime('%Y-%m-%d')
                    break
                except ValueError:
                    continue
            if data['invoice_date']:
                break

    inn_m = re.search(r'инн[:\s]+(\d{10,12})', tl)
    if inn_m:
        data['contractor_inn'] = inn_m.group(1)

    return data