import json
import os
import psycopg2
import base64

def handler(event: dict, context) -> dict:
    '''API для подачи заявок на участие в конкурсах'''
    
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
            raw_body = event.get('body', '{}')
            if event.get('isBase64Encoded'):
                raw_body = base64.b64decode(raw_body).decode('utf-8')
            body = json.loads(raw_body)
            
            full_name = body.get('full_name')
            age = body.get('age')
            teacher = body.get('teacher')
            institution = body.get('institution')
            work_title = body.get('work_title')
            email = body.get('email')
            contest_name = body.get('contest_name')
            work_file_url = body.get('work_file_url')
            gallery_consent = body.get('gallery_consent', True)
            
            if not all([full_name, age, work_title, email, contest_name, work_file_url]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            dsn = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO applications 
                (full_name, age, teacher, institution, work_title, email, contest_name, work_file_url, status, gallery_consent, payment_status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'new', %s, 'paid')
                RETURNING id
            """, (full_name, age, teacher, institution, work_title, email, contest_name, work_file_url, gallery_consent))
            
            app_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'application_id': app_id,
                    'work_url': work_file_url
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