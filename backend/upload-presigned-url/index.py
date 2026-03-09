import json
import os
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для генерации presigned URL для загрузки файлов в S3'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            file_name = body.get('file_name')
            file_type = body.get('file_type')
            
            if not file_name or not file_type:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'file_name and file_type are required'})
                }
            
            aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
            aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key
            )
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_file_name = f"{timestamp}_{file_name}"
            file_key = f'works/{unique_file_name}'
            
            presigned_url = s3.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': 'files',
                    'Key': file_key,
                    'ContentType': file_type
                },
                ExpiresIn=600
            )
            
            cdn_url = f"https://cdn.poehali.dev/projects/{aws_access_key}/bucket/{file_key}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'presigned_url': presigned_url,
                    'file_url': cdn_url,
                    'file_key': file_key
                })
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
