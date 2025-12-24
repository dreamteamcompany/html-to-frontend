import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для получения справочников заявок"""
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
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
        
        cur.execute('SELECT id, name FROM ticket_categories ORDER BY name')
        categories = cur.fetchall()
        
        cur.execute('SELECT id, name, level FROM ticket_priorities ORDER BY level')
        priorities = cur.fetchall()
        
        cur.execute('SELECT id, name FROM ticket_statuses ORDER BY id')
        statuses = cur.fetchall()
        
        cur.execute('SELECT id, name FROM ticket_departments ORDER BY name')
        departments = cur.fetchall()
        
        cur.execute('SELECT id, field_name, field_type, required, options FROM ticket_custom_fields ORDER BY field_name')
        custom_fields = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'categories': categories,
                'priorities': priorities,
                'statuses': statuses,
                'departments': departments,
                'custom_fields': custom_fields
            }, default=str),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
