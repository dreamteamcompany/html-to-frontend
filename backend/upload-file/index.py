import json
import os
import base64
import boto3
import uuid
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для загрузки файлов в S3 хранилище"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        chunk_data = body.get('chunk')
        chunk_index = body.get('chunkIndex', 0)
        total_chunks = body.get('totalChunks', 1)
        file_name = body.get('fileName')
        file_type = body.get('fileType', 'application/pdf')
        folder = body.get('folder', 'works')
        upload_id = body.get('uploadId')
        
        if not chunk_data or not file_name:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Отсутствует chunk или fileName'}),
                'isBase64Encoded': False
            }
        
        if not upload_id:
            upload_id = str(uuid.uuid4())
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        
        temp_key = f"temp/{upload_id}_chunk_{chunk_index}"
        chunk_bytes = base64.b64decode(chunk_data)
        
        s3.put_object(
            Bucket='files',
            Key=temp_key,
            Body=chunk_bytes
        )
        
        if chunk_index == total_chunks - 1:
            file_extension = file_name.split('.')[-1] if '.' in file_name else 'pdf'
            final_key = f"{folder}/{uuid.uuid4()}.{file_extension}"
            
            chunks = []
            for i in range(total_chunks):
                chunk_key = f"temp/{upload_id}_chunk_{i}"
                response = s3.get_object(Bucket='files', Key=chunk_key)
                chunks.append(response['Body'].read())
            
            final_data = b''.join(chunks)
            
            s3.put_object(
                Bucket='files',
                Key=final_key,
                Body=final_data,
                ContentType=file_type
            )
            
            for i in range(total_chunks):
                chunk_key = f"temp/{upload_id}_chunk_{i}"
                s3.delete_object(Bucket='files', Key=chunk_key)
            
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{final_key}"
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'url': cdn_url,
                    'fileName': file_name,
                    'message': 'Файл успешно загружен',
                    'complete': True
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'uploadId': upload_id,
                    'chunkIndex': chunk_index,
                    'complete': False
                }),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }