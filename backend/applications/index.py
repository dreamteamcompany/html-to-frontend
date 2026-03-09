import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления заявками на конкурсы'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    if method == 'GET':
        try:
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            query_params = event.get('queryStringParameters', {}) or {}
            show_deleted = query_params.get('deleted') == 'true'
            
            if show_deleted:
                cursor.execute("""
                    SELECT id, full_name, age, teacher, institution, work_title, 
                           email, contest_id, contest_name, work_file_url, 
                           status, result, gallery_consent, created_at, updated_at, deleted_at,
                           diploma_issued_at, is_featured
                    FROM applications
                    WHERE deleted_at IS NOT NULL
                    ORDER BY deleted_at DESC
                """)
            else:
                cursor.execute("""
                    SELECT id, full_name, age, teacher, institution, work_title, 
                           email, contest_id, contest_name, work_file_url, 
                           status, result, gallery_consent, created_at, updated_at, deleted_at,
                           diploma_issued_at, is_featured
                    FROM applications
                    WHERE deleted_at IS NULL
                    ORDER BY created_at DESC
                """)
            
            rows = cursor.fetchall()
            
            applications = []
            for row in rows:
                app_data = {
                    'id': row[0],
                    'full_name': row[1],
                    'age': row[2],
                    'teacher': row[3],
                    'institution': row[4],
                    'work_title': row[5],
                    'email': row[6],
                    'contest_id': row[7],
                    'contest_name': row[8],
                    'work_file_url': row[9],
                    'status': row[10],
                    'result': row[11],
                    'gallery_consent': row[12],
                    'created_at': row[13].isoformat() if row[13] else None,
                    'updated_at': row[14].isoformat() if row[14] else None,
                    'deleted_at': row[15].isoformat() if row[15] else None,
                    'diploma_issued_at': row[16].isoformat() if row[16] else None,
                    'is_featured': row[17] if row[17] is not None else False
                }
                applications.append(app_data)
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(applications)
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    if method == 'PUT':
        try:
            body = json.loads(event.get('body', '{}'))
            
            app_id = body.get('id')
            if not app_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing id'})
                }
            
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            if body.get('work_file_url'):
                cursor.execute("""
                    UPDATE applications 
                    SET full_name = %s, age = %s, teacher = %s, institution = %s,
                        work_title = %s, email = %s, status = %s, result = %s,
                        diploma_issued_at = %s, is_featured = %s, work_file_url = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (
                    body.get('full_name'),
                    body.get('age'),
                    body.get('teacher'),
                    body.get('institution'),
                    body.get('work_title'),
                    body.get('email'),
                    body.get('status'),
                    body.get('result'),
                    body.get('diploma_issued_at'),
                    body.get('is_featured', False),
                    body.get('work_file_url'),
                    app_id
                ))
            else:
                cursor.execute("""
                    UPDATE applications 
                    SET full_name = %s, age = %s, teacher = %s, institution = %s,
                        work_title = %s, email = %s, status = %s, result = %s,
                        diploma_issued_at = %s, is_featured = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (
                    body.get('full_name'),
                    body.get('age'),
                    body.get('teacher'),
                    body.get('institution'),
                    body.get('work_title'),
                    body.get('email'),
                    body.get('status'),
                    body.get('result'),
                    body.get('diploma_issued_at'),
                    body.get('is_featured', False),
                    app_id
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    if method == 'DELETE':
        try:
            query_params = event.get('queryStringParameters', {}) or {}
            app_id = query_params.get('id')
            restore = query_params.get('restore') == 'true'
            
            if not app_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing id'})
                }
            
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            permanent = query_params.get('permanent') == 'true'

            if restore:
                cursor.execute("""
                    UPDATE applications 
                    SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (app_id,))
            elif permanent:
                cursor.execute("DELETE FROM applications WHERE id = %s AND deleted_at IS NOT NULL", (app_id,))
            else:
                cursor.execute("""
                    UPDATE applications 
                    SET deleted_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (app_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
            
        except Exception as e:
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