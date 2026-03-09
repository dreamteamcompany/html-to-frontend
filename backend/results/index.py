import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для работы с результатами конкурсов: получение, создание, обновление и удаление результатов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        result_id = params.get('id')
        
        if result_id:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('SELECT * FROM results WHERE id = %s', (result_id,))
                result = cur.fetchone()
                conn.close()
                
                if result:
                    result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None
                    result['updated_at'] = result['updated_at'].isoformat() if result.get('updated_at') else None
                    result['score'] = float(result['score']) if result.get('score') else None
                    result['diploma_issued_at'] = result['diploma_issued_at'].isoformat() if result.get('diploma_issued_at') else None
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Result not found'}),
                        'isBase64Encoded': False
                    }
        
        contest_id = params.get('contest_id')
        contest_name = params.get('contest_name')
        result_type = params.get('result')
        place = params.get('place')
        
        query = 'SELECT * FROM results WHERE 1=1'
        query_params = []
        
        if contest_id:
            query += ' AND contest_id = %s'
            query_params.append(contest_id)
        
        if contest_name:
            query += ' AND contest_name ILIKE %s'
            query_params.append(f'%{contest_name}%')
        
        if result_type:
            query += ' AND result = %s'
            query_params.append(result_type)
        
        if place:
            query += ' AND place = %s'
            query_params.append(place)
        
        query += ' ORDER BY created_at DESC'
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, query_params)
            results = cur.fetchall()
            conn.close()
            
            for res in results:
                res['created_at'] = res['created_at'].isoformat() if res.get('created_at') else None
                res['updated_at'] = res['updated_at'].isoformat() if res.get('updated_at') else None
                res['score'] = float(res['score']) if res.get('score') else None
                res['diploma_issued_at'] = res['diploma_issued_at'].isoformat() if res.get('diploma_issued_at') else None
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(results),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        data = json.loads(event.get('body', '{}'))
        application_id = data.get('application_id')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if application_id:
                cur.execute('SELECT id FROM results WHERE application_id = %s', (application_id,))
                existing = cur.fetchone()
                
                if existing:
                    conn.close()
                    return {
                        'statusCode': 409,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Result from this application already exists'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute('''
                INSERT INTO results (
                    application_id, full_name, age, teacher, institution,
                    work_title, email, contest_id, contest_name, work_file_url,
                    result, place, score, diploma_url, notes, gallery_consent, diploma_issued_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            ''', (
                application_id,
                data.get('full_name'),
                data.get('age'),
                data.get('teacher'),
                data.get('institution'),
                data.get('work_title'),
                data.get('email'),
                data.get('contest_id'),
                data.get('contest_name'),
                data.get('work_file_url'),
                data.get('result'),
                data.get('place'),
                data.get('score'),
                data.get('diploma_url'),
                data.get('notes'),
                data.get('gallery_consent', True),
                data.get('diploma_issued_at')
            ))
            result = cur.fetchone()
            conn.commit()
            conn.close()
            
            result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None
            result['updated_at'] = result['updated_at'].isoformat() if result.get('updated_at') else None
            result['score'] = float(result['score']) if result.get('score') else None
            result['diploma_issued_at'] = result['diploma_issued_at'].isoformat() if result.get('diploma_issued_at') else None
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
    
    elif method == 'PUT':
        data = json.loads(event.get('body', '{}'))
        result_id = data.get('id')
        
        if not result_id:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Result ID is required'}),
                'isBase64Encoded': False
            }
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                UPDATE results SET
                    full_name = %s, age = %s, teacher = %s, institution = %s,
                    work_title = %s, email = %s, contest_id = %s, contest_name = %s,
                    work_file_url = %s, result = %s, place = %s, score = %s,
                    diploma_url = %s, notes = %s, gallery_consent = %s,
                    diploma_issued_at = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
            ''', (
                data.get('full_name'),
                data.get('age'),
                data.get('teacher'),
                data.get('institution'),
                data.get('work_title'),
                data.get('email'),
                data.get('contest_id'),
                data.get('contest_name'),
                data.get('work_file_url'),
                data.get('result'),
                data.get('place'),
                data.get('score'),
                data.get('diploma_url'),
                data.get('notes'),
                data.get('gallery_consent', True),
                data.get('diploma_issued_at'),
                result_id
            ))
            result = cur.fetchone()
            conn.commit()
            conn.close()
            
            if result:
                result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None
                result['updated_at'] = result['updated_at'].isoformat() if result.get('updated_at') else None
                result['score'] = float(result['score']) if result.get('score') else None
                result['diploma_issued_at'] = result['diploma_issued_at'].isoformat() if result.get('diploma_issued_at') else None
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Result not found'}),
                    'isBase64Encoded': False
                }
    
    elif method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        result_id = params.get('id')
        
        if not result_id:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Result ID is required'}),
                'isBase64Encoded': False
            }
        
        with conn.cursor() as cur:
            cur.execute('DELETE FROM results WHERE id = %s', (result_id,))
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Result deleted'}),
                'isBase64Encoded': False
            }
    
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }