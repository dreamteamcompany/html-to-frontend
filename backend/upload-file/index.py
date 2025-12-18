import json
import boto3
import os
import base64
import uuid
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Загрузка файлов в S3 хранилище
    Args: event - dict с httpMethod, body
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с URL загруженного файла
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    file_base64: str = body_data.get('file')
    file_name: str = body_data.get('fileName', 'file')
    content_type: str = body_data.get('contentType', 'application/octet-stream')
    
    if not file_base64:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'File data is required'}),
            'isBase64Encoded': False
        }
    
    file_data = base64.b64decode(file_base64)
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    
    unique_id = str(uuid.uuid4())
    extension = file_name.split('.')[-1] if '.' in file_name else ''
    key = f'uploads/{unique_id}.{extension}' if extension else f'uploads/{unique_id}'
    
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=file_data,
        ContentType=content_type
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'url': cdn_url,
            'fileName': file_name,
            'key': key
        }),
        'isBase64Encoded': False
    }
