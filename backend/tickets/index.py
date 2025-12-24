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
        cur.execute("SELECT id, username FROM users WHERE token = %s", (token,))
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'})
            }
        
        user_id, username = user
        
        if method == 'GET':
            cur.execute("""
                SELECT 
                    t.id, t.title, t.description, t.due_date,
                    t.created_at, t.updated_at, t.closed_at,
                    tc.id as category_id, tc.name as category_name, tc.icon as category_icon,
                    tp.id as priority_id, tp.name as priority_name, tp.color as priority_color,
                    ts.id as status_id, ts.name as status_name, ts.color as status_color,
                    d.id as department_id, d.name as department_name,
                    t.created_by, t.assigned_to
                FROM tickets t
                LEFT JOIN ticket_categories tc ON t.category_id = tc.id
                LEFT JOIN ticket_priorities tp ON t.priority_id = tp.id
                LEFT JOIN ticket_statuses ts ON t.status_id = ts.id
                LEFT JOIN departments d ON t.department_id = d.id
                ORDER BY t.created_at DESC
            """)
            
            tickets = []
            for row in cur.fetchall():
                ticket = {
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'due_date': row[3].isoformat() if row[3] else None,
                    'created_at': row[4].isoformat() if row[4] else None,
                    'updated_at': row[5].isoformat() if row[5] else None,
                    'closed_at': row[6].isoformat() if row[6] else None,
                    'category_id': row[7],
                    'category_name': row[8],
                    'category_icon': row[9],
                    'priority_id': row[10],
                    'priority_name': row[11],
                    'priority_color': row[12],
                    'status_id': row[13],
                    'status_name': row[14],
                    'status_color': row[15],
                    'department_id': row[16],
                    'department_name': row[17],
                    'created_by': row[18],
                    'assigned_to': row[19]
                }
                
                cur.execute("""
                    SELECT tcf.id, tcf.name, tcf.field_type, tcfv.value
                    FROM ticket_custom_field_values tcfv
                    JOIN ticket_custom_fields tcf ON tcfv.field_id = tcf.id
                    WHERE tcfv.ticket_id = %s
                """, (ticket['id'],))
                
                ticket['custom_fields'] = [
                    {'id': r[0], 'name': r[1], 'field_type': r[2], 'value': r[3]}
                    for r in cur.fetchall()
                ]
                
                tickets.append(ticket)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tickets': tickets})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            title = body.get('title')
            description = body.get('description')
            category_id = body.get('category_id')
            priority_id = body.get('priority_id')
            status_id = body.get('status_id', 1)
            department_id = body.get('department_id')
            due_date = body.get('due_date')
            custom_fields = body.get('custom_fields', {})
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Название заявки обязательно'})
                }
            
            cur.execute("""
                INSERT INTO tickets (
                    title, description, category_id, priority_id, status_id,
                    department_id, created_by, due_date
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (title, description, category_id, priority_id, status_id, 
                  department_id, user_id, due_date))
            
            ticket_id = cur.fetchone()[0]
            
            for field_id, value in custom_fields.items():
                if value:
                    cur.execute("""
                        INSERT INTO ticket_custom_field_values (ticket_id, field_id, value)
                        VALUES (%s, %s, %s)
                    """, (ticket_id, field_id, value))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': ticket_id, 'message': 'Заявка создана'})
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            ticket_id = body.get('ticket_id')
            
            if not ticket_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID заявки обязателен'})
                }
            
            updates = []
            params = []
            
            if 'title' in body:
                updates.append('title = %s')
                params.append(body['title'])
            if 'description' in body:
                updates.append('description = %s')
                params.append(body['description'])
            if 'status_id' in body:
                updates.append('status_id = %s')
                params.append(body['status_id'])
            if 'priority_id' in body:
                updates.append('priority_id = %s')
                params.append(body['priority_id'])
            if 'assigned_to' in body:
                updates.append('assigned_to = %s')
                params.append(body['assigned_to'])
            if 'due_date' in body:
                updates.append('due_date = %s')
                params.append(body['due_date'])
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            
            if updates:
                params.append(ticket_id)
                query = f"UPDATE tickets SET {', '.join(updates)} WHERE id = %s"
                cur.execute(query, params)
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Заявка обновлена'})
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
