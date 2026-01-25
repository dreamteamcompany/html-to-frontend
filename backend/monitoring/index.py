import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для мониторинга балансов сервисов - получение, обновление и управление интеграциями'''
    
    method = event.get('httpMethod', 'GET')
    path = event.get('pathParams', {})
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET' and not path:
            return get_all_services(conn)
        elif method == 'POST' and path.get('action') == 'refresh' and path.get('serviceId'):
            return refresh_service_balance(conn, int(path['serviceId']))
        elif method == 'POST':
            return create_service(conn, event)
        elif method == 'PUT' and path.get('serviceId'):
            return update_service(conn, int(path['serviceId']), event)
        elif method == 'DELETE' and path.get('serviceId'):
            return delete_service(conn, int(path['serviceId']))
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint not found'})
            }
    finally:
        conn.close()

def get_all_services(conn) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT 
                id, service_name, balance, currency, status, 
                last_updated, api_endpoint, threshold_warning, 
                threshold_critical, auto_refresh, refresh_interval_minutes
            FROM service_balances
            ORDER BY service_name
        ''')
        services = cur.fetchall()
        
        services_list = []
        for service in services:
            service_dict = dict(service)
            service_dict['balance'] = float(service_dict['balance']) if service_dict['balance'] else 0
            service_dict['threshold_warning'] = float(service_dict['threshold_warning']) if service_dict['threshold_warning'] else None
            service_dict['threshold_critical'] = float(service_dict['threshold_critical']) if service_dict['threshold_critical'] else None
            service_dict['last_updated'] = service_dict['last_updated'].isoformat() if service_dict['last_updated'] else None
            services_list.append(service_dict)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'services': services_list})
        }

def create_service(conn, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    required_fields = ['service_name', 'currency']
    for field in required_fields:
        if field not in body:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Missing required field: {field}'})
            }
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            INSERT INTO service_balances (
                service_name, balance, currency, status, 
                api_endpoint, api_key_secret_name, 
                threshold_warning, threshold_critical,
                auto_refresh, refresh_interval_minutes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, service_name, balance, currency, status, last_updated
        ''', (
            body['service_name'],
            body.get('balance', 0),
            body['currency'],
            body.get('status', 'ok'),
            body.get('api_endpoint'),
            body.get('api_key_secret_name'),
            body.get('threshold_warning'),
            body.get('threshold_critical'),
            body.get('auto_refresh', False),
            body.get('refresh_interval_minutes', 60)
        ))
        
        service = cur.fetchone()
        conn.commit()
        
        service_dict = dict(service)
        service_dict['balance'] = float(service_dict['balance'])
        service_dict['last_updated'] = service_dict['last_updated'].isoformat()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'service': service_dict})
        }

def update_service(conn, service_id: int, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    with conn.cursor() as cur:
        cur.execute('SELECT id FROM service_balances WHERE id = %s', (service_id,))
        if not cur.fetchone():
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Service not found'})
            }
        
        fields = []
        values = []
        
        if 'service_name' in body:
            fields.append('service_name = %s')
            values.append(body['service_name'])
        if 'balance' in body:
            fields.append('balance = %s')
            values.append(body['balance'])
        if 'currency' in body:
            fields.append('currency = %s')
            values.append(body['currency'])
        if 'status' in body:
            fields.append('status = %s')
            values.append(body['status'])
        if 'api_endpoint' in body:
            fields.append('api_endpoint = %s')
            values.append(body['api_endpoint'])
        if 'api_key_secret_name' in body:
            fields.append('api_key_secret_name = %s')
            values.append(body['api_key_secret_name'])
        if 'threshold_warning' in body:
            fields.append('threshold_warning = %s')
            values.append(body['threshold_warning'])
        if 'threshold_critical' in body:
            fields.append('threshold_critical = %s')
            values.append(body['threshold_critical'])
        if 'auto_refresh' in body:
            fields.append('auto_refresh = %s')
            values.append(body['auto_refresh'])
        if 'refresh_interval_minutes' in body:
            fields.append('refresh_interval_minutes = %s')
            values.append(body['refresh_interval_minutes'])
        
        fields.append('updated_at = CURRENT_TIMESTAMP')
        values.append(service_id)
        
        cur.execute(f'''
            UPDATE service_balances 
            SET {', '.join(fields)}
            WHERE id = %s
        ''', values)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True})
        }

def refresh_service_balance(conn, service_id: int) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, service_name, api_endpoint, api_key_secret_name,
                   threshold_warning, threshold_critical
            FROM service_balances 
            WHERE id = %s
        ''', (service_id,))
        
        service = cur.fetchone()
        if not service:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Service not found'})
            }
        
        balance = 0
        status = 'ok'
        
        cur.execute('''
            UPDATE service_balances 
            SET balance = %s, 
                status = %s, 
                last_updated = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (balance, status, service_id))
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'balance': balance,
                'status': status
            })
        }

def delete_service(conn, service_id: int) -> dict:
    with conn.cursor() as cur:
        cur.execute('DELETE FROM service_balances WHERE id = %s', (service_id,))
        
        if cur.rowcount == 0:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Service not found'})
            }
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True})
        }
