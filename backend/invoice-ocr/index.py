import json
import os
import base64
import re
import unicodedata
import boto3
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61788166_html_to_frontend')
HEADERS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}


def handler(event: dict, context) -> dict:
    """Загрузка счёта в S3, OCR через Yandex Vision, regex-парсинг данных и автозаполнение полей"""

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
        return resp(200, {
            'file_url': cdn_url,
            'extracted_data': None,
            'warning': 'OCR не настроен — нужны API_KEY_SECRET и YANDEX_FOLDER_ID'
        })

    ocr_text = run_vision_ocr(file_data, api_key, folder_id)

    if not ocr_text:
        return resp(200, {
            'file_url': cdn_url,
            'extracted_data': None,
            'raw_text': '',
            'warning': 'Текст не распознан'
        })

    ref_data = load_reference_data()
    extracted = parse_invoice_text(ocr_text, ref_data)

    return resp(200, {
        'file_url': cdn_url,
        'extracted_data': extracted,
        'raw_text': ocr_text[:1000]
    })


def resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': HEADERS,
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


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
        'services': f'SELECT id, name, category_id FROM {SCHEMA}.services ORDER BY name',
        'departments': f'SELECT id, name FROM {SCHEMA}.customer_departments ORDER BY name',
        'legal_entities': f'SELECT id, name, inn, kpp FROM {SCHEMA}.legal_entities ORDER BY name',
        'contractors': f'SELECT id, name, inn, kpp FROM {SCHEMA}.contractors ORDER BY name',
    }

    for key, query in queries.items():
        cur.execute(query)
        ref[key] = [dict(row) for row in cur.fetchall()]

    cur.close()
    conn.close()
    return ref


def normalize(text: str) -> str:
    if not text:
        return ''
    text = unicodedata.normalize('NFKC', text)
    text = text.lower().strip()
    text = re.sub(r'[«»""\'\"]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text


def extract_all_inn(text: str) -> list:
    return re.findall(r'\b(\d{10}|\d{12})\b', text)


def extract_all_kpp(text: str) -> list:
    return re.findall(r'\b(\d{9})\b', text)


def extract_amount(text: str) -> float | None:
    patterns = [
        r'(?:итого\s*(?:к\s*оплате)?|всего\s*(?:к\s*оплате)?|сумма\s*(?:к\s*оплате)?|к\s*оплате|итого\s*с\s*ндс|всего\s*с\s*ндс|общая\s*сумма)\s*[:\s]*(\d[\d\s\u00a0]*[.,]\d{2})',
        r'(?:итого\s*(?:к\s*оплате)?|всего\s*(?:к\s*оплате)?|сумма\s*(?:к\s*оплате)?|к\s*оплате|итого\s*с\s*ндс|всего\s*с\s*ндс|общая\s*сумма)\s*[:\s]*(\d[\d\s\u00a0]*)',
    ]
    text_lower = text.lower()

    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            raw = matches[-1]
            cleaned = re.sub(r'[\s\u00a0]', '', raw).replace(',', '.')
            try:
                val = float(cleaned)
                if val > 0:
                    return val
            except ValueError:
                continue

    amount_pattern = r'(\d[\d\s\u00a0]+[.,]\d{2})\s*(?:руб|₽|rub)'
    matches = re.findall(amount_pattern, text_lower)
    if matches:
        raw = matches[-1]
        cleaned = re.sub(r'[\s\u00a0]', '', raw).replace(',', '.')
        try:
            val = float(cleaned)
            if val > 0:
                return val
        except ValueError:
            pass

    return None


def extract_invoice_number(text: str) -> str | None:
    patterns = [
        r'(?:счёт|счет|сч[её]т\s*на\s*оплату|invoice)\s*(?:на\s*оплату\s*)?(?:№|#|N|No\.?|номер)?\s*[:\s]*([A-Za-zА-Яа-я0-9\-/]+)',
        r'(?:№|#)\s*([A-Za-zА-Яа-я0-9\-/]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            num = match.group(1).strip()
            if len(num) >= 1 and len(num) <= 50:
                return num
    return None


def extract_invoice_date(text: str) -> str | None:
    patterns = [
        r'(?:от|дата|date)\s*[:\s]*(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})',
        r'(?:от|дата|date)\s*[:\s]*(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2})\b',
        r'(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})',
    ]

    months_ru = {
        'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
        'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
        'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12',
        'январь': '01', 'февраль': '02', 'март': '03', 'апрель': '04',
        'май': '05', 'июнь': '06', 'июль': '07', 'август': '08',
        'сентябрь': '09', 'октябрь': '10', 'ноябрь': '11', 'декабрь': '12',
    }

    ru_date = re.search(
        r'(\d{1,2})\s+(' + '|'.join(months_ru.keys()) + r')\s+(\d{4})',
        text.lower()
    )
    if ru_date:
        day = ru_date.group(1).zfill(2)
        month = months_ru[ru_date.group(2)]
        year = ru_date.group(3)
        return f"{year}-{month}-{day}"

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            day = match.group(1).zfill(2)
            month = match.group(2).zfill(2)
            year = match.group(3)
            if len(year) == 2:
                year = '20' + year
            if 1 <= int(day) <= 31 and 1 <= int(month) <= 12 and 2000 <= int(year) <= 2099:
                return f"{year}-{month}-{day}"
    return None


def find_entity_by_inn(entities: list, inns: list) -> dict | None:
    for inn in inns:
        for entity in entities:
            if entity.get('inn') and entity['inn'].strip() == inn:
                return entity
    return None


def find_entity_by_name(entities: list, text: str) -> dict | None:
    text_norm = normalize(text)
    best_match = None
    best_score = 0

    for entity in entities:
        name_norm = normalize(entity['name'])
        if not name_norm:
            continue

        core_words = re.findall(r'[а-яёa-z]{3,}', name_norm)
        if not core_words:
            continue

        matched_words = sum(1 for w in core_words if w in text_norm)
        score = matched_words / len(core_words) if core_words else 0

        if score > best_score and score >= 0.5:
            best_score = score
            best_match = entity

    return best_match


def identify_parties(text: str, legal_entities: list, contractors: list) -> dict:
    result = {
        'legal_entity_id': None,
        'legal_entity_name': None,
        'legal_entity_inn': None,
        'contractor_id': None,
        'contractor_name': None,
        'contractor_inn': None,
    }

    all_inns = extract_all_inn(text)
    print(f"[PARSE] Found INNs in text: {all_inns}")

    le_match = find_entity_by_inn(legal_entities, all_inns)
    if le_match:
        result['legal_entity_id'] = le_match['id']
        matched_inn = le_match['inn'].strip()
        remaining_inns = [i for i in all_inns if i != matched_inn]
    else:
        remaining_inns = all_inns

    ctr_match = find_entity_by_inn(contractors, remaining_inns)
    if ctr_match:
        result['contractor_id'] = ctr_match['id']
    elif remaining_inns:
        if not le_match:
            le_by_name = find_entity_by_name(legal_entities, text)
            if le_by_name:
                result['legal_entity_id'] = le_by_name['id']

    if not le_match and not result['legal_entity_id']:
        le_by_name = find_entity_by_name(legal_entities, text)
        if le_by_name:
            result['legal_entity_id'] = le_by_name['id']

    if not ctr_match:
        ctr_by_name = find_entity_by_name(contractors, text)
        if ctr_by_name and ctr_by_name.get('id') != result.get('legal_entity_id'):
            result['contractor_id'] = ctr_by_name['id']

    text_lower = text.lower()
    supplier_section = ''
    supplier_patterns = [
        r'(?:поставщик|исполнитель|продавец|получатель\s*(?:платежа)?)\s*[:\s]*(.*?)(?:\n|покупатель|заказчик|плательщик|$)',
    ]
    for pat in supplier_patterns:
        m = re.search(pat, text_lower, re.DOTALL)
        if m:
            supplier_section = m.group(1)[:300]
            break

    buyer_section = ''
    buyer_patterns = [
        r'(?:покупатель|заказчик|плательщик)\s*[:\s]*(.*?)(?:\n|поставщик|исполнитель|продавец|$)',
    ]
    for pat in buyer_patterns:
        m = re.search(pat, text_lower, re.DOTALL)
        if m:
            buyer_section = m.group(1)[:300]
            break

    if supplier_section and not result['contractor_id']:
        supplier_inns = extract_all_inn(supplier_section)
        ctr_by_inn = find_entity_by_inn(contractors, supplier_inns)
        if ctr_by_inn:
            result['contractor_id'] = ctr_by_inn['id']
        else:
            ctr_by_name = find_entity_by_name(contractors, supplier_section)
            if ctr_by_name:
                result['contractor_id'] = ctr_by_name['id']
            elif supplier_inns:
                name_match = re.search(r'(?:ООО|ОАО|ЗАО|ПАО|АО|ИП)\s*[«""]?([^»"""\n]{2,50})', supplier_section, re.IGNORECASE)
                if name_match:
                    result['contractor_name'] = name_match.group(0).strip()
                    result['contractor_inn'] = supplier_inns[0]

    if buyer_section and not result['legal_entity_id']:
        buyer_inns = extract_all_inn(buyer_section)
        le_by_inn = find_entity_by_inn(legal_entities, buyer_inns)
        if le_by_inn:
            result['legal_entity_id'] = le_by_inn['id']
        else:
            le_by_name = find_entity_by_name(legal_entities, buyer_section)
            if le_by_name:
                result['legal_entity_id'] = le_by_name['id']
            elif buyer_inns:
                name_match = re.search(r'(?:ООО|ОАО|ЗАО|ПАО|АО|ИП)\s*[«""]?([^»"""\n]{2,50})', buyer_section, re.IGNORECASE)
                if name_match:
                    result['legal_entity_name'] = name_match.group(0).strip()
                    result['legal_entity_inn'] = buyer_inns[0]

    return result


def match_category(text: str, categories: list) -> int | None:
    text_norm = normalize(text)
    best = None
    best_score = 0

    for cat in categories:
        name_norm = normalize(cat['name'])
        words = re.findall(r'[а-яёa-z]{3,}', name_norm)
        if not words:
            continue
        matched = sum(1 for w in words if w in text_norm)
        score = matched / len(words)
        if score > best_score and score >= 0.4:
            best_score = score
            best = cat['id']

    return best


def match_service(text: str, services: list) -> int | None:
    text_norm = normalize(text)
    best = None
    best_score = 0

    for svc in services:
        name_norm = normalize(svc['name'])
        words = re.findall(r'[а-яёa-z]{3,}', name_norm)
        if not words:
            continue
        matched = sum(1 for w in words if w in text_norm)
        score = matched / len(words)
        if score > best_score and score >= 0.3:
            best_score = score
            best = svc

    if best:
        return best['id']
    return None


def extract_description(text: str) -> str:
    patterns = [
        r'(?:наименование\s*(?:товара|услуги|работ))\s*[:\s]*(.*?)(?:\n|кол|ед\.)',
        r'(?:за\s+)((?:оказание|предоставление|выполнение|поставку|обслуживание|услуги).*?)(?:\n|$)',
        r'(?:назначение\s*платежа|основание)\s*[:\s]*(.*?)(?:\n|$)',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            desc = m.group(1).strip()
            desc = re.sub(r'\s+', ' ', desc)
            if 5 <= len(desc) <= 200:
                return desc

    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if 10 <= len(line) <= 150 and any(w in line.lower() for w in ['услуг', 'обслуживан', 'лицензи', 'подписк', 'поставк', 'работ', 'сервис', 'хостинг', 'домен', 'сопровожден']):
            return line

    return ''


def parse_invoice_text(text: str, ref_data: dict) -> dict:
    print(f"[PARSE] OCR text length: {len(text)}")
    print(f"[PARSE] First 500 chars: {text[:500]}")

    result = {
        'amount': None,
        'invoice_number': None,
        'invoice_date': None,
        'description': None,
        'category_id': None,
        'service_id': None,
        'department_id': None,
        'legal_entity_id': None,
        'legal_entity_name': None,
        'legal_entity_inn': None,
        'contractor_id': None,
        'contractor_name': None,
        'contractor_inn': None,
    }

    result['amount'] = extract_amount(text)
    result['invoice_number'] = extract_invoice_number(text)
    result['invoice_date'] = extract_invoice_date(text)
    result['description'] = extract_description(text)

    parties = identify_parties(text, ref_data['legal_entities'], ref_data['contractors'])
    result.update(parties)

    result['service_id'] = match_service(text, ref_data['services'])

    if result['service_id']:
        svc = next((s for s in ref_data['services'] if s['id'] == result['service_id']), None)
        if svc and svc.get('category_id'):
            result['category_id'] = svc['category_id']

    if not result['category_id']:
        result['category_id'] = match_category(text, ref_data['categories'])

    print(f"[PARSE] Extracted: {json.dumps(result, ensure_ascii=False, default=str)}")
    return result
