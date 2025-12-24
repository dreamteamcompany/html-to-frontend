import json
import os
import psycopg2
from datetime import datetime


def handler(event: dict, context) -> dict:
    """API для управления заявками в техподдержку"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id, username FROM users WHERE token = %s", (token,))
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'}),
                'isBase64Encoded': False
            }
        
        user_id, username = user
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            search = query_params.get('search', '')
            
            query = """
                SELECT 
                    t.id, t.title, t.description, t.due_date,
                    c.name as category_name,
                    p.name as priority_name, p.level as priority_level,
                    s.name as status_name, s.color as status_color,
                    d.name as department_name,
                    t.created_at, t.updated_at,
                    u.username as creator_name
                FROM tickets t
                LEFT JOIN ticket_categories c ON t.category_id = c.id
                LEFT JOIN ticket_priorities p ON t.priority_id = p.id
                LEFT JOIN ticket_statuses s ON t.status_id = s.id
                LEFT JOIN departments d ON t.department_id = d.id
                LEFT JOIN users u ON t.creator_id = u.id
                WHERE t.deleted_at IS NULL
            """
            
            params = []
            if search:
                query += " AND (t.title ILIKE %s OR t.description ILIKE %s OR c.name ILIKE %s)"
                search_pattern = f'%{search}%'
                params.extend([search_pattern, search_pattern, search_pattern])
            
            query += " ORDER BY t.created_at DESC"
            
            cur.execute(query, params)
            tickets = []
            for row in cur.fetchall():
                tickets.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'dueDate': row[3].isoformat() if row[3] else None,
                    'category': row[4],
                    'priority': {'name': row[5], 'level': row[6]},
                    'status': {'name': row[7], 'color': row[8]},
                    'department': row[9],
                    'createdAt': row[10].isoformat() if row[10] else None,
                    'updatedAt': row[11].isoformat() if row[11] else None,
                    'creatorName': row[12]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tickets': tickets}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            
            title = data.get('title')
            description = data.get('description')
            category_id = data.get('category_id')
            priority_id = data.get('priority_id')
            department_id = data.get('department_id')
            due_date = data.get('due_date')
            
            if not title or not description:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Название и описание обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO tickets (title, description, category_id, priority_id, department_id, due_date, creator_id, status_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
                RETURNING id
            """, (title, description, category_id, priority_id, department_id, due_date, user_id))
            
            ticket_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': ticket_id, 'message': 'Заявка создана'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParameters') or event.get('params') or {}
            ticket_id = path_params.get('id')
            
            if not ticket_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID заявки не указан'}),
                    'isBase64Encoded': False
                }
            
            data = json.loads(event.get('body', '{}'))
            status_id = data.get('status_id')
            
            if status_id:
                cur.execute("""
                    UPDATE tickets 
                    SET status_id = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s AND deleted_at IS NULL
                """, (status_id, ticket_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Статус обновлен'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()