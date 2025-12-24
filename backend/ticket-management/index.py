import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61788166_html_to_frontend'

def handler(event: dict, context) -> dict:
    """API для управления заявками и справочниками"""
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    endpoint = params.get('action', 'tickets')
    
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
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(f"SELECT id, username FROM {SCHEMA}.users WHERE token = %s", (token,))
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'}),
                'isBase64Encoded': False
            }
        
        user_id = user['id']
        
        if endpoint == 'dictionaries':
            if method != 'GET':
                return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Только GET'}), 'isBase64Encoded': False}
            
            cur.execute(f"SELECT id, name FROM {SCHEMA}.ticket_categories WHERE deleted_at IS NULL ORDER BY name")
            categories = [dict(row) for row in cur.fetchall()]
            
            cur.execute(f"SELECT id, name, level FROM {SCHEMA}.ticket_priorities WHERE deleted_at IS NULL ORDER BY level DESC")
            priorities = [dict(row) for row in cur.fetchall()]
            
            cur.execute(f"SELECT id, name, color FROM {SCHEMA}.ticket_statuses WHERE deleted_at IS NULL ORDER BY id")
            statuses = [dict(row) for row in cur.fetchall()]
            
            cur.execute(f"SELECT id, name FROM {SCHEMA}.departments WHERE deleted_at IS NULL ORDER BY name")
            departments = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'categories': categories,
                    'priorities': priorities,
                    'statuses': statuses,
                    'departments': departments,
                    'custom_fields': []
                }),
                'isBase64Encoded': False
            }
        
        else:  # tickets
            if method == 'GET':
                search = params.get('search', '')
                
                query = f"""
                    SELECT 
                        t.id, t.title, t.description, t.due_date,
                        c.name as category, c.name as category_name,
                        p.name as priority_name, p.level as priority_level,
                        s.name as status_name, s.color as status_color,
                        d.name as department,
                        t.created_at, t.updated_at,
                        u.username as creator_name
                    FROM {SCHEMA}.tickets t
                    LEFT JOIN {SCHEMA}.ticket_categories c ON t.category_id = c.id
                    LEFT JOIN {SCHEMA}.ticket_priorities p ON t.priority_id = p.id
                    LEFT JOIN {SCHEMA}.ticket_statuses s ON t.status_id = s.id
                    LEFT JOIN {SCHEMA}.departments d ON t.department_id = d.id
                    LEFT JOIN {SCHEMA}.users u ON t.creator_id = u.id
                    WHERE t.deleted_at IS NULL
                """
                
                params_list = []
                if search:
                    query += " AND (t.title ILIKE %s OR t.description ILIKE %s OR c.name ILIKE %s)"
                    search_pattern = f'%{search}%'
                    params_list.extend([search_pattern, search_pattern, search_pattern])
                
                query += " ORDER BY t.created_at DESC"
                
                cur.execute(query, params_list)
                tickets = []
                for row in cur.fetchall():
                    tickets.append({
                        'id': row['id'],
                        'title': row['title'],
                        'description': row['description'],
                        'dueDate': row['due_date'].isoformat() if row['due_date'] else None,
                        'category': row['category'],
                        'priority': {'name': row['priority_name'], 'level': row['priority_level']},
                        'status': {'name': row['status_name'], 'color': row['status_color']},
                        'department': row['department'],
                        'createdAt': row['created_at'].isoformat() if row['created_at'] else None,
                        'updatedAt': row['updated_at'].isoformat() if row['updated_at'] else None,
                        'creatorName': row['creator_name']
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
                
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.tickets (title, description, category_id, priority_id, department_id, due_date, creator_id, status_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
                    RETURNING id
                """, (title, description, category_id, priority_id, department_id, due_date, user_id))
                
                ticket_id = cur.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': ticket_id, 'message': 'Заявка создана'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'trace': traceback.format_exc()}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
