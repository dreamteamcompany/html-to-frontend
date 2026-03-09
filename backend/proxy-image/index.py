import urllib.request
import base64

def handler(event: dict, context) -> dict:
    """Проксирует изображение кота для обхода CORS при скачивании раскраски"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    url = (event.get('queryStringParameters') or {}).get('url', '')
    if not url:
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': 'Missing url param'}

    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
        content_type = resp.headers.get('Content-Type', 'image/jpeg')

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': content_type,
        },
        'body': base64.b64encode(data).decode('utf-8'),
        'isBase64Encoded': True,
    }
