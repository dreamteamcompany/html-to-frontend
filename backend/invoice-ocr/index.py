import json
import os
import sys
import base64
import boto3
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61788166_html_to_frontend')
HEADERS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

ROUTERAI_URL = 'https://routerai.ru/api/v1/chat/completions'
ROUTERAI_MODEL = 'openai/gpt-4o-mini'

ALLOWED_CONTENT_TYPES = {
    'application/pdf': '.pdf',
    'image/png': '.png',
    'image/jpeg': '.jpeg',
}


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def handler(event: dict, context) -> dict:
    """Обработка финансовых документов: загрузка → распознавание через RouterAI (GPT-4o mini) → сохранение в БД"""

    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id, X-Clinic-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return resp(405, {'error': 'Method not allowed'})

    try:
        body = json.loads(event.get('body', '{}') or '{}')
    except (ValueError, TypeError):
        return resp(400, {'error': 'Invalid JSON body'})

    file_data = body.get('file')
    file_name = body.get('fileName', 'invoice.jpg')
    user_id = body.get('user_id')
    upload_only = bool(body.get('upload_only', False))

    if not file_data:
        return resp(400, {'error': 'File data is required'})

    mime_type, encoded = split_data_url(file_data)
    try:
        file_bytes = base64.b64decode(encoded)
    except Exception:
        return resp(400, {'error': 'Некорректный base64 файла'})

    max_bytes = 20 * 1024 * 1024
    if len(file_bytes) > max_bytes:
        return resp(400, {'error': 'Файл превышает допустимый размер (20 МБ)'})

    content_type = resolve_content_type(mime_type, file_name)
    if not content_type:
        return resp(400, {'error': 'Допустимы только PDF, JPG и PNG'})

    try:
        cdn_url = upload_to_s3(file_bytes, file_name, content_type)
    except Exception as e:
        log(f"[UPLOAD ERROR] {e}")
        return resp(500, {'error': 'Не удалось сохранить файл'})

    # ===== Режим "только загрузка" (без распознавания) =====
    if upload_only:
        return resp(200, {'file_url': cdn_url, 'file_name': file_name})

    # ===== Распознавание через RouterAI (GPT-4o mini) =====
    api_key = os.environ.get('ROUTERAI_API_KEY')
    if not api_key:
        return resp(200, {
            'file_url': cdn_url,
            'extracted_data': None,
            'warning': 'Отсутствует API-ключ RouterAI. Сохраните его в переменной окружения ROUTERAI_API_KEY'
        })

    if content_type not in ('image/png', 'image/jpeg'):
        return resp(200, {
            'file_url': cdn_url,
            'extracted_data': None,
            'warning': 'Распознавание доступно только для изображений (PDF конвертируется на стороне браузера)'
        })

    ref_data = load_reference_data()

    legal_entities_list = ', '.join(
        [f'id={le["id"]} "{le["name"]}" ИНН:{le.get("inn", "")}'.strip() for le in ref_data['legal_entities']]
    )
    contractors_list = ', '.join(
        [f'id={c["id"]} "{c["name"]}" ИНН:{c.get("inn", "")}'.strip() for c in ref_data['contractors']]
    )

    gpt_prompt = f"""Ты — финансовый аналитик. Проанализируй изображение счёта/финансового документа и извлеки данные.

Верни СТРОГО JSON с ТОЛЬКО этими полями:
{{
  "counterparty": {{"id": число_или_null, "name": "строка_или_null", "inn": "строка_или_null"}},
  "legal_entity": {{"id": число_или_null, "name": "строка_или_null", "inn": "строка_или_null"}},
  "invoice_number": "строка_или_null",
  "invoice_date": "YYYY-MM-DD_или_null",
  "purpose": "строка_или_null",
  "amount": число_или_null
}}

Правила:
1. counterparty — это ПОСТАВЩИК/ИСПОЛНИТЕЛЬ (кто выставил счёт). Попробуй сопоставить с существующими: [{contractors_list}]. Если нашёл совпадение по ИНН или названию — укажи id. Если не нашёл — id=null, но обязательно заполни name и inn.
2. legal_entity — это ПОКУПАТЕЛЬ/ЗАКАЗЧИК (кому выставлен счёт). Попробуй сопоставить с: [{legal_entities_list}]. Если нашёл — укажи id. Если нет — id=null, заполни name и inn.
3. invoice_number — номер счёта/документа.
4. invoice_date — дата документа в формате YYYY-MM-DD.
5. purpose — назначение платежа, описание за что выставлен счёт.
6. amount — итоговая сумма к оплате (число без валюты).

При отсутствии явных данных определи по контексту документа. Пустое значение null допустимо только при объективном отсутствии информации.

ВАЖНО: Верни ТОЛЬКО JSON без markdown-разметки, без комментариев, без дополнительного текста."""

    gpt_result = call_router_ai(api_key, gpt_prompt, encoded, content_type)

    if not gpt_result:
        return resp(200, {
            'file_url': cdn_url,
            'extracted_data': None,
            'warning': 'Не удалось распознать документ'
        })

    extracted = map_gpt_to_db(gpt_result, ref_data)

    return resp(200, {
        'file_url': cdn_url,
        'extracted_data': extracted,
        'gpt_raw': gpt_result
    })


def resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': HEADERS,
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


def split_data_url(file_data: str):
    """Разбирает data:<mime>;base64,<data> при наличии префикса. Возвращает (mime|None, base64-строка)."""
    if file_data.startswith('data:') and ',' in file_data:
        header, encoded = file_data.split(',', 1)
        try:
            mime = header.split(':', 1)[1].split(';')[0].strip().lower()
        except Exception:
            mime = None
        return mime, encoded
    return None, file_data


def resolve_content_type(mime_type: str | None, file_name: str) -> str | None:
    """Определяет content-type файла: сперва по data-URL, затем по расширению имени."""
    if mime_type in ALLOWED_CONTENT_TYPES:
        return mime_type

    name_lower = (file_name or '').lower()
    if name_lower.endswith('.pdf'):
        return 'application/pdf'
    if name_lower.endswith('.png'):
        return 'image/png'
    if name_lower.endswith('.jpg') or name_lower.endswith('.jpeg'):
        return 'image/jpeg'
    return None


def upload_to_s3(file_bytes: bytes, file_name: str, content_type: str) -> str:
    aws_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY')
    if not aws_key or not aws_secret:
        raise RuntimeError('S3 credentials are not configured')

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=aws_key,
        aws_secret_access_key=aws_secret,
    )
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_name = (file_name or 'file').replace('/', '_').replace('\\', '_')
    s3_key = f'invoices/{timestamp}_{safe_name}'
    s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{aws_key}/bucket/{s3_key}"


def load_reference_data() -> dict:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    ref = {}
    queries = {
        'categories': f'SELECT id, name FROM {SCHEMA}.categories ORDER BY name',
        'services': f'SELECT id, name, category_id FROM {SCHEMA}.services ORDER BY name',
        'departments': f'SELECT id, name FROM {SCHEMA}.customer_departments ORDER BY name',
        'legal_entities': f'SELECT id, name, inn, kpp FROM {SCHEMA}.legal_entities WHERE is_active = true ORDER BY name',
        'contractors': f'SELECT id, name, inn, kpp FROM {SCHEMA}.contractors ORDER BY name',
    }

    for key, query in queries.items():
        cur.execute(query)
        ref[key] = [dict(row) for row in cur.fetchall()]

    cur.close()
    conn.close()
    return ref


def call_router_ai(api_key: str, prompt: str, image_base64: str, mime_type: str) -> dict | None:
    """Отправляет изображение и промпт в RouterAI (GPT-4o mini, OpenAI-совместимый API)."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
    }

    payload = {
        'model': ROUTERAI_MODEL,
        'temperature': 0.1,
        'max_tokens': 2000,
        'messages': [
            {
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': prompt},
                    {'type': 'image_url', 'image_url': {'url': f'data:{mime_type};base64,{image_base64}'}}
                ]
            }
        ]
    }

    try:
        r = requests.post(ROUTERAI_URL, headers=headers, json=payload, timeout=60)
        log(f"[ROUTERAI] Status: {r.status_code}")

        if r.status_code != 200:
            log(f"[ROUTERAI ERROR] {r.text[:500]}")
            return None

        data = r.json()
        text = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        return parse_gpt_json(text)

    except Exception as e:
        log(f"[ROUTERAI EXCEPTION] {e}")
        return None


def parse_gpt_json(text: str) -> dict | None:
    text = text.strip()
    if text.startswith('```'):
        lines = text.split('\n')
        lines = [l for l in lines if not l.strip().startswith('```')]
        text = '\n'.join(lines).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        import re
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    log("[GPT PARSE FAIL] Could not parse AI response")
    return None


def map_gpt_to_db(gpt_data: dict, ref_data: dict) -> dict:
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

    result['amount'] = gpt_data.get('amount')
    result['invoice_number'] = gpt_data.get('invoice_number')
    result['invoice_date'] = gpt_data.get('invoice_date')
    result['description'] = gpt_data.get('purpose')

    counterparty = gpt_data.get('counterparty') or {}
    if isinstance(counterparty, dict):
        cp_id = counterparty.get('id')
        if cp_id and any(c['id'] == cp_id for c in ref_data['contractors']):
            result['contractor_id'] = cp_id
        else:
            if counterparty.get('inn'):
                for c in ref_data['contractors']:
                    if c.get('inn') and c['inn'].strip() == str(counterparty['inn']).strip():
                        result['contractor_id'] = c['id']
                        break
            if not result['contractor_id'] and counterparty.get('name'):
                result['contractor_name'] = counterparty['name']
                result['contractor_inn'] = counterparty.get('inn')

    legal_entity = gpt_data.get('legal_entity') or {}
    if isinstance(legal_entity, dict):
        le_id = legal_entity.get('id')
        if le_id and any(le['id'] == le_id for le in ref_data['legal_entities']):
            result['legal_entity_id'] = le_id
        else:
            if legal_entity.get('inn'):
                for le in ref_data['legal_entities']:
                    if le.get('inn') and le['inn'].strip() == str(legal_entity['inn']).strip():
                        result['legal_entity_id'] = le['id']
                        break
            if not result['legal_entity_id'] and legal_entity.get('name'):
                result['legal_entity_name'] = legal_entity['name']
                result['legal_entity_inn'] = legal_entity.get('inn')

    if result['description']:
        desc_lower = result['description'].lower()
        best_svc = None
        best_score = 0
        for svc in ref_data['services']:
            svc_words = [w.lower() for w in svc['name'].split() if len(w) >= 3]
            if not svc_words:
                continue
            matched = sum(1 for w in svc_words if w in desc_lower)
            score = matched / len(svc_words)
            if score > best_score and score >= 0.3:
                best_score = score
                best_svc = svc
        if best_svc:
            result['service_id'] = best_svc['id']
            if best_svc.get('category_id'):
                result['category_id'] = best_svc['category_id']

    return result