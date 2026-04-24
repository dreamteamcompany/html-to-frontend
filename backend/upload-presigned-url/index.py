import json
import os
import base64
import boto3
import jwt
from datetime import datetime
from typing import Optional, Dict, Any

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Authorization, X-Authorization',
}

def verify_token(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    headers = event.get('headers', {})
    token = (headers.get('X-Auth-Token') or
             headers.get('x-auth-token') or
             headers.get('X-Authorization') or
             headers.get('x-authorization', ''))
    if token:
        token = token.replace('Bearer ', '').strip()
    if not token:
        return None
    try:
        secret = os.environ.get('JWT_SECRET')
        if not secret:
            return None
        return jwt.decode(token, secret, algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

ALLOWED_TYPES = {
    'application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
    'image/gif', 'image/webp', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

def handler(event: dict, context) -> dict:
    '''Загрузка файла счёта в S3. Принимает base64-encoded файл, сохраняет в хранилище, возвращает публичный CDN-URL.'''

    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    payload = verify_token(event)
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }

    try:
        body = json.loads(event.get('body', '{}'))

        file_name = body.get('file_name')
        file_type = body.get('file_type')
        file_data = body.get('file_data')

        if not file_name or not file_type:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
                'body': json.dumps({'error': 'file_name and file_type are required'})
            }

        if file_type not in ALLOWED_TYPES:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
                'body': json.dumps({'error': 'Недопустимый тип файла'})
            }

        import re
        safe_name = re.sub(r'[^\w.\-]', '_', os.path.basename(file_name))[:100]

        aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')

        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_file_name = f"{timestamp}_{safe_name}"
        file_key = f'invoices/{unique_file_name}'

        if file_data:
            # Прямая загрузка: принимаем base64, кладём в S3
            if ',' in file_data:
                file_data = file_data.split(',')[1]
            file_bytes = base64.b64decode(file_data)
            if len(file_bytes) > MAX_FILE_SIZE_BYTES:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
                    'body': json.dumps({'error': 'Файл слишком большой (максимум 10 МБ)'})
                }
            s3.put_object(Bucket='files', Key=file_key, Body=file_bytes, ContentType=file_type)
            cdn_url = f"https://cdn.poehali.dev/projects/{aws_access_key}/bucket/{file_key}"
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
                'body': json.dumps({'file_url': cdn_url, 'file_key': file_key})
            }
        else:
            # Fallback: возвращаем presigned URL для PUT с браузера
            presigned_url = s3.generate_presigned_url(
                'put_object',
                Params={'Bucket': 'files', 'Key': file_key, 'ContentType': file_type},
                ExpiresIn=600
            )
            cdn_url = f"https://cdn.poehali.dev/projects/{aws_access_key}/bucket/{file_key}"
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
                'body': json.dumps({'presigned_url': presigned_url, 'file_url': cdn_url, 'file_key': file_key})
            }

    except Exception as e:
        import sys
        print(f"[upload-presigned-url] Error: {e}", file=sys.stderr, flush=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Ошибка загрузки файла'})
        }