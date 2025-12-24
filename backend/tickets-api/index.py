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
                    t.priority_id,
                    p.name as priority_name,
                    t.category_id,
                    c.name as category_name,
                    t.department_id,
                    d.name as department_name,
                    t.assigned_to,
                    t.created_by,
                    t.created_at,
                    t.updated_at,
                    t.custom_fields
                FROM tickets t
                LEFT JOIN ticket_statuses s ON t.status_id = s.id
                LEFT JOIN ticket_priorities p ON t.priority_id = p.id
                LEFT JOIN ticket_categories c ON t.category_id = c.id
                LEFT JOIN ticket_departments d ON t.department_id = d.id
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
                INSERT INTO tickets 
                (title, description, status_id, priority_id, category_id, department_id, created_by, custom_fields)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, title, description, status_id, priority_id, category_id, department_id, created_by, created_at, custom_fields
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('status_id', 1),
                body.get('priority_id'),
                body.get('category_id'),
                body.get('department_id'),
                body.get('created_by'),
                json.dumps(body.get('custom_fields', {}))
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
                UPDATE tickets 
                SET title = %s, description = %s, status_id = %s, priority_id = %s, 
                    category_id = %s, department_id = %s, assigned_to = %s, custom_fields = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, title, description, status_id, priority_id, category_id, department_id, assigned_to, updated_at, custom_fields
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('status_id'),
                body.get('priority_id'),
                body.get('category_id'),
                body.get('department_id'),
                body.get('assigned_to'),
                json.dumps(body.get('custom_fields', {})),
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
