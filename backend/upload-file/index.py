import json
import os
import base64
import boto3
import uuid
import jwt
from datetime import datetime

SCHEMA = 't_p61788166_html_to_frontend'

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'doc', 'docx', 'xls', 'xlsx'}
ALLOWED_MIME_TYPES = {
    'application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}
ALLOWED_FOLDERS = {'works', 'payments', 'invoices', 'documents', 'avatars'}
MAX_FILE_SIZE_MB = 20
MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024


def make_response(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token',
        },
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def verify_token(event: dict):
    headers = event.get('headers', {})
    token = (
        headers.get('X-Auth-Token') or
        headers.get('x-auth-token') or
        headers.get('X-Authorization') or
        headers.get('x-authorization', '')
    )
    if token:
        token = token.replace('Bearer ', '').strip()
    if not token:
        return None
    try:
        secret = os.environ.get('JWT_SECRET', '')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None


def handler(event: dict, context) -> dict:
    """API для загрузки файлов в S3. Требует авторизацию. Только разрешённые типы файлов."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return make_response(200, {})

    if method != 'POST':
        return make_response(405, {'error': 'Method not allowed'})

    payload = verify_token(event)
    if not payload:
        return make_response(401, {'error': 'Unauthorized'})

    try:
        body = json.loads(event.get('body', '{}'))

        chunk_data = body.get('chunk')
        chunk_index = int(body.get('chunkIndex', 0))
        total_chunks = int(body.get('totalChunks', 1))
        file_name = body.get('fileName', '')
        file_type = body.get('fileType', 'application/pdf')
        folder = body.get('folder', 'documents')
        upload_id = body.get('uploadId')

        if not chunk_data or not file_name:
            return make_response(400, {'error': 'Отсутствует chunk или fileName'})

        if '.' not in file_name:
            return make_response(400, {'error': 'Файл должен иметь расширение'})
        file_extension = file_name.rsplit('.', 1)[-1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            return make_response(400, {'error': f'Тип файла не разрешён. Допустимые: {", ".join(sorted(ALLOWED_EXTENSIONS))}'})

        if file_type not in ALLOWED_MIME_TYPES:
            file_type = 'application/octet-stream'

        folder = folder.strip('/')
        if folder not in ALLOWED_FOLDERS:
            folder = 'documents'

        if total_chunks < 1 or total_chunks > 100:
            return make_response(400, {'error': 'Некорректное количество частей файла'})

        try:
            chunk_bytes = base64.b64decode(chunk_data)
        except Exception:
            return make_response(400, {'error': 'Некорректные данные файла (base64)'})

        if len(chunk_bytes) > MAX_CHUNK_SIZE_BYTES:
            return make_response(400, {'error': f'Размер части файла превышает допустимый ({MAX_CHUNK_SIZE_BYTES // 1024 // 1024} МБ)'})

        if not upload_id:
            upload_id = str(uuid.uuid4())
        upload_id = str(upload_id).replace('..', '').replace('/', '')[:64]

        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )

        temp_key = f"temp/{upload_id}_chunk_{chunk_index}"
        s3.put_object(Bucket='files', Key=temp_key, Body=chunk_bytes)

        if chunk_index == total_chunks - 1:
            chunks = []
            total_size = 0
            for i in range(total_chunks):
                chunk_key = f"temp/{upload_id}_chunk_{i}"
                resp = s3.get_object(Bucket='files', Key=chunk_key)
                data = resp['Body'].read()
                total_size += len(data)
                if total_size > MAX_FILE_SIZE_MB * 1024 * 1024:
                    for j in range(total_chunks):
                        try:
                            s3.delete_object(Bucket='files', Key=f"temp/{upload_id}_chunk_{j}")
                        except Exception:
                            pass
                    return make_response(400, {'error': f'Размер файла превышает {MAX_FILE_SIZE_MB} МБ'})
                chunks.append(data)

            final_data = b''.join(chunks)
            safe_name = f"{uuid.uuid4()}.{file_extension}"
            final_key = f"{folder}/{safe_name}"

            s3.put_object(Bucket='files', Key=final_key, Body=final_data, ContentType=file_type)

            for i in range(total_chunks):
                try:
                    s3.delete_object(Bucket='files', Key=f"temp/{upload_id}_chunk_{i}")
                except Exception:
                    pass

            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{final_key}"

            return make_response(200, {
                'url': cdn_url,
                'fileName': file_name,
                'message': 'Файл успешно загружен',
                'complete': True,
            })

        return make_response(200, {
            'uploadId': upload_id,
            'chunkIndex': chunk_index,
            'complete': False,
        })

    except Exception:
        return make_response(500, {'error': 'Ошибка загрузки файла'})
