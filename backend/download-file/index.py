import urllib.request
import urllib.parse
import base64
import re

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def _safe_ascii_name(name: str) -> str:
    safe = re.sub(r'[\r\n"\\]', '_', name or 'file')
    return safe.encode('ascii', 'replace').decode('ascii').replace('?', '_')


def handler(event: dict, context) -> dict:
    '''Прокси-скачивание файла: тянет файл по url, возвращает с Content-Disposition: attachment, чтобы браузер скачал, а не открыл.'''

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if event.get('httpMethod') != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': '{"error":"Method not allowed"}'
        }

    qs = event.get('queryStringParameters') or {}
    url = qs.get('url', '')
    suggested = qs.get('name', '') or 'file'

    if not url:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': '{"error":"Missing url param"}'
        }

    if not (url.startswith('https://cdn.poehali.dev/') or url.startswith('https://bucket.poehali.dev/')):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': '{"error":"URL domain not allowed"}'
        }

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            content_type = resp.headers.get('Content-Type', 'application/octet-stream')
    except Exception as e:
        return {
            'statusCode': 502,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': f'{{"error":"Upstream fetch failed: {str(e)[:200]}"}}'
        }

    ascii_name = _safe_ascii_name(suggested)
    utf8_name = urllib.parse.quote(suggested, safe='')
    disposition = f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{utf8_name}"

    return {
        'statusCode': 200,
        'headers': {
            **CORS_HEADERS,
            'Content-Type': content_type,
            'Content-Disposition': disposition,
            'Cache-Control': 'private, max-age=60',
        },
        'body': base64.b64encode(data).decode('utf-8'),
        'isBase64Encoded': True,
    }
