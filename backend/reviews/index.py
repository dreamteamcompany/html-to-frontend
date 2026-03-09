import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления отзывами: создание, модерация, получение опубликованных отзывов'''
    
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
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            status = params.get('status', 'approved')
            
            if status == 'all':
                cur.execute("""
                    SELECT id, author_name, author_role, rating, text, status,
                           created_at, updated_at, published_at
                    FROM t_p93576920_talent_studio_projec.reviews
                    ORDER BY created_at DESC
                """)
            else:
                cur.execute("""
                    SELECT id, author_name, author_role, rating, text, status,
                           created_at, updated_at, published_at
                    FROM t_p93576920_talent_studio_projec.reviews
                    WHERE status = %s
                    ORDER BY created_at DESC
                """, (status,))
            
            reviews = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(reviews, ensure_ascii=False, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO t_p93576920_talent_studio_projec.reviews 
                (author_name, author_role, rating, text, status)
                VALUES (%s, %s, %s, %s, 'pending')
                RETURNING id
            """, (
                body.get('author_name'),
                body.get('author_role'),
                body.get('rating'),
                body.get('text')
            ))
            
            review_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': review_id, 'message': 'Отзыв отправлен на модерацию'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            review_id = body.get('id')
            status = body.get('status')
            
            if status == 'approved':
                cur.execute("""
                    UPDATE t_p93576920_talent_studio_projec.reviews 
                    SET status = %s, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (status, review_id))
            else:
                cur.execute("""
                    UPDATE t_p93576920_talent_studio_projec.reviews 
                    SET status = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (status, review_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Статус отзыва обновлен'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            review_id = params.get('id')
            
            cur.execute("DELETE FROM t_p93576920_talent_studio_projec.reviews WHERE id = %s", (review_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Отзыв удален'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
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
