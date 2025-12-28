import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: dict, context) -> dict:
    """API для работы с заявками техподдержки"""
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
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cur.execute('''
                SELECT 
                    t.id,
                    t.title,
                    t.description,
                    t.status_id,
                    s.name as status_name,
                    s.color as status_color,
                    t.priority_id,
                    p.name as priority_name,
                    p.color as priority_color,
                    t.category_id,
                    c.name as category_name,
                    c.icon as category_icon,
                    t.department_id,
                    t.service_id,
                    srv.name as service_name,
                    t.assigned_to,
                    u_assigned.full_name as assigned_to_name,
                    t.created_by,
                    u_creator.full_name as customer_name,
                    t.created_at,
                    t.updated_at,
                    t.due_date
                FROM "t_p61788166_html_to_frontend"."tickets" t
                LEFT JOIN "t_p61788166_html_to_frontend"."ticket_statuses" s ON t.status_id = s.id
                LEFT JOIN "t_p61788166_html_to_frontend"."ticket_priorities" p ON t.priority_id = p.id
                LEFT JOIN "t_p61788166_html_to_frontend"."ticket_categories" c ON t.category_id = c.id
                LEFT JOIN "t_p61788166_html_to_frontend"."services" srv ON t.service_id = srv.id
                LEFT JOIN "t_p61788166_html_to_frontend"."users" u_assigned ON t.assigned_to = u_assigned.id
                LEFT JOIN "t_p61788166_html_to_frontend"."users" u_creator ON t.created_by = u_creator.id
                ORDER BY t.created_at DESC
            ''')
            tickets = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tickets': tickets}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO "t_p61788166_html_to_frontend"."tickets" 
                (title, description, status_id, priority_id, category_id, department_id, service_id, created_by, assigned_to, due_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, title, description, status_id, priority_id, category_id, department_id, service_id, created_by, assigned_to, created_at, due_date
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('status_id', 1),
                body.get('priority_id'),
                body.get('category_id'),
                body.get('department_id'),
                body.get('service_id'),
                body.get('created_by'),
                body.get('assigned_to'),
                body.get('due_date')
            ))
            
            ticket = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ticket': ticket}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            ticket_id = body.get('id')
            
            if not ticket_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Ticket ID required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE "t_p61788166_html_to_frontend"."tickets" 
                SET title = %s, description = %s, status_id = %s, priority_id = %s, 
                    category_id = %s, department_id = %s, service_id = %s, assigned_to = %s, due_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, title, description, status_id, priority_id, category_id, department_id, service_id, assigned_to, updated_at, due_date
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('status_id'),
                body.get('priority_id'),
                body.get('category_id'),
                body.get('department_id'),
                body.get('service_id'),
                body.get('assigned_to'),
                body.get('due_date'),
                ticket_id
            ))
            
            ticket = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ticket': ticket}, default=str),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }