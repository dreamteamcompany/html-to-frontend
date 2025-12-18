import json
import base64
import os
import boto3
from typing import Dict, Any
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Загружает фото пользователя в S3 и возвращает публичный URL
    Args: event - dict с httpMethod, body (file в base64, filename)
          context - объект с request_id, function_name и другими атрибутами
    Returns: HTTP response с URL загруженного фото
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        body_str = '{}'
    
    body_data = json.loads(body_str)
    file_base64 = body_data.get('file')
    filename = body_data.get('filename', 'photo.jpg')
    
    if not file_base64:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'No file provided'}),
            'isBase64Encoded': False
        }
    
    file_data = base64.b64decode(file_base64)
    
    extension = filename.split('.')[-1] if '.' in filename else 'jpg'
    unique_filename = f'users/{uuid.uuid4()}.{extension}'
    
    content_type = 'image/jpeg'
    if extension.lower() == 'png':
        content_type = 'image/png'
    elif extension.lower() == 'gif':
        content_type = 'image/gif'
    elif extension.lower() in ['jpg', 'jpeg']:
        content_type = 'image/jpeg'
    
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    
    s3.put_object(
        Bucket='files',
        Key=unique_filename,
        Body=file_data,
        ContentType=content_type
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{unique_filename}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'url': cdn_url}),
        'isBase64Encoded': False
    }