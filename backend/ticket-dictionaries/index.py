import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """API для получения справочников заявок (категории, приоритеты, статусы, отделы)"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только GET запросы'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM users WHERE token = %s", (token,))
        if not cur.fetchone():
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT id, name FROM ticket_categories WHERE deleted_at IS NULL ORDER BY name")
        categories = [{'id': row[0], 'name': row[1]} for row in cur.fetchall()]
        
        cur.execute("SELECT id, name, level FROM ticket_priorities WHERE deleted_at IS NULL ORDER BY level DESC")
        priorities = [{'id': row[0], 'name': row[1], 'level': row[2]} for row in cur.fetchall()]
        
        cur.execute("SELECT id, name, color FROM ticket_statuses WHERE deleted_at IS NULL ORDER BY id")
        statuses = [{'id': row[0], 'name': row[1], 'color': row[2]} for row in cur.fetchall()]
        
        cur.execute("SELECT id, name FROM departments WHERE deleted_at IS NULL ORDER BY name")
        departments = [{'id': row[0], 'name': row[1]} for row in cur.fetchall()]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'categories': categories,
                'priorities': priorities,
                'statuses': statuses,
                'departments': departments
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
