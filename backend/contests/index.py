import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления конкурсами: получение списка, создание, обновление и удаление конкурсов"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            category_id = params.get('category_id')
            
            if category_id:
                cur.execute("""
                    SELECT id, title, description, category_id as "categoryId", 
                           deadline, price, status, rules_file_url as "rulesLink",
                           diploma_sample_url as "diplomaImage", image_url as image,
                           participants_count as participants, is_popular as "isPopular"
                    FROM contests 
                    WHERE category_id = %s
                    ORDER BY deadline ASC
                """, (category_id,))
            else:
                cur.execute("""
                    SELECT id, title, description, category_id as "categoryId", 
                           deadline, price, status, rules_file_url as "rulesLink",
                           diploma_sample_url as "diplomaImage", image_url as image,
                           participants_count as participants, is_popular as "isPopular"
                    FROM contests 
                    ORDER BY deadline ASC
                """)
            
            contests = cur.fetchall()
            
            for contest in contests:
                if contest.get('deadline'):
                    contest['deadline'] = contest['deadline'].strftime('%d %B %Y')
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(contests, ensure_ascii=False, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO contests 
                (title, description, category_id, deadline, price, status, 
                 rules_file_url, diploma_sample_url, image_url, is_popular)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                body.get('title'),
                body.get('description'),
                body.get('categoryId'),
                body.get('deadline'),
                body.get('price', 200),
                body.get('status', 'active'),
                body.get('rulesLink'),
                body.get('diplomaImage'),
                body.get('image'),
                body.get('isPopular', False)
            ))
            
            contest_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': contest_id, 'message': 'Конкурс создан'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            contest_id = body.get('id')
            
            cur.execute("""
                UPDATE contests 
                SET title = %s, description = %s, category_id = %s, deadline = %s,
                    price = %s, status = %s, rules_file_url = %s, 
                    diploma_sample_url = %s, image_url = %s, is_popular = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                body.get('title'),
                body.get('description'),
                body.get('categoryId'),
                body.get('deadline'),
                body.get('price'),
                body.get('status'),
                body.get('rulesLink'),
                body.get('diplomaImage'),
                body.get('image'),
                body.get('isPopular', False),
                contest_id
            ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Конкурс обновлен'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            contest_id = params.get('id')
            
            cur.execute("DELETE FROM contests WHERE id = %s", (contest_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Конкурс удален'}),
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
        import traceback
        print(f"ERROR: {str(e)}\n{traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }