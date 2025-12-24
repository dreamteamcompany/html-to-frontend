import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """API для управления справочниками заявок (категории, приоритеты, статусы, отделы)"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM users WHERE token = %s", (token,))
        if not cur.fetchone():
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'})
            }
        
        query_params = event.get('queryStringParameters') or {}
        dict_type = query_params.get('type', 'all')
        
        if method == 'GET':
            result = {}
            
            if dict_type in ['all', 'categories']:
                cur.execute("SELECT id, name, description, icon FROM ticket_categories ORDER BY name")
                result['categories'] = [
                    {'id': r[0], 'name': r[1], 'description': r[2], 'icon': r[3]}
                    for r in cur.fetchall()
                ]
            
            if dict_type in ['all', 'priorities']:
                cur.execute("SELECT id, name, level, color FROM ticket_priorities ORDER BY level")
                result['priorities'] = [
                    {'id': r[0], 'name': r[1], 'level': r[2], 'color': r[3]}
                    for r in cur.fetchall()
                ]
            
            if dict_type in ['all', 'statuses']:
                cur.execute("SELECT id, name, color, is_closed FROM ticket_statuses ORDER BY id")
                result['statuses'] = [
                    {'id': r[0], 'name': r[1], 'color': r[2], 'is_closed': r[3]}
                    for r in cur.fetchall()
                ]
            
            if dict_type in ['all', 'departments']:
                cur.execute("SELECT id, name, description FROM departments ORDER BY name")
                result['departments'] = [
                    {'id': r[0], 'name': r[1], 'description': r[2]}
                    for r in cur.fetchall()
                ]
            
            if dict_type in ['all', 'custom_fields']:
                cur.execute("SELECT id, name, field_type, options, is_required FROM ticket_custom_fields ORDER BY name")
                result['custom_fields'] = [
                    {'id': r[0], 'name': r[1], 'field_type': r[2], 'options': r[3], 'is_required': r[4]}
                    for r in cur.fetchall()
                ]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            dict_type = body.get('type')
            
            if dict_type == 'category':
                name = body.get('name')
                description = body.get('description')
                icon = body.get('icon', 'AlertCircle')
                
                cur.execute(
                    "INSERT INTO ticket_categories (name, description, icon) VALUES (%s, %s, %s) RETURNING id",
                    (name, description, icon)
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'Категория создана'})
                }
            
            elif dict_type == 'priority':
                name = body.get('name')
                level = body.get('level')
                color = body.get('color')
                
                cur.execute(
                    "INSERT INTO ticket_priorities (name, level, color) VALUES (%s, %s, %s) RETURNING id",
                    (name, level, color)
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'Приоритет создан'})
                }
            
            elif dict_type == 'status':
                name = body.get('name')
                color = body.get('color')
                is_closed = body.get('is_closed', False)
                
                cur.execute(
                    "INSERT INTO ticket_statuses (name, color, is_closed) VALUES (%s, %s, %s) RETURNING id",
                    (name, color, is_closed)
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'Статус создан'})
                }
            
            elif dict_type == 'department':
                name = body.get('name')
                description = body.get('description')
                
                cur.execute(
                    "INSERT INTO departments (name, description) VALUES (%s, %s) RETURNING id",
                    (name, description)
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'Отдел создан'})
                }
            
            elif dict_type == 'custom_field':
                name = body.get('name')
                field_type = body.get('field_type', 'text')
                options = body.get('options')
                is_required = body.get('is_required', False)
                
                cur.execute(
                    "INSERT INTO ticket_custom_fields (name, field_type, options, is_required) VALUES (%s, %s, %s, %s) RETURNING id",
                    (name, field_type, options, is_required)
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'Поле создано'})
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный тип справочника'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()
