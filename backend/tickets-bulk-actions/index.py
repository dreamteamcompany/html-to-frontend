import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для массовых операций над заявками"""
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
        }
    
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен авторизации не предоставлен'})
        }
    
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL не настроен'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('SELECT id, role FROM users WHERE session_token = %s', (auth_token,))
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный токен'})
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            ticket_ids = body.get('ticket_ids', [])
            action = body.get('action')
            
            if not ticket_ids or not action:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указаны ticket_ids или action'})
                }
            
            results = []
            
            if action == 'change_status':
                status_id = body.get('status_id')
                if not status_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Не указан status_id'})
                    }
                
                for ticket_id in ticket_ids:
                    try:
                        cur.execute(
                            'UPDATE tickets SET status_id = %s, updated_at = NOW() WHERE id = %s',
                            (status_id, ticket_id)
                        )
                        results.append({'ticket_id': ticket_id, 'success': True})
                    except Exception as e:
                        results.append({'ticket_id': ticket_id, 'success': False, 'error': str(e)})
            
            elif action == 'change_priority':
                priority_id = body.get('priority_id')
                if not priority_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Не указан priority_id'})
                    }
                
                for ticket_id in ticket_ids:
                    try:
                        cur.execute(
                            'UPDATE tickets SET priority_id = %s, updated_at = NOW() WHERE id = %s',
                            (priority_id, ticket_id)
                        )
                        results.append({'ticket_id': ticket_id, 'success': True})
                    except Exception as e:
                        results.append({'ticket_id': ticket_id, 'success': False, 'error': str(e)})
            
            elif action == 'delete':
                if user['role'] not in ('admin', 'manager'):
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно прав для удаления'})
                    }
                
                for ticket_id in ticket_ids:
                    try:
                        cur.execute('DELETE FROM ticket_custom_field_values WHERE ticket_id = %s', (ticket_id,))
                        cur.execute('DELETE FROM ticket_comments WHERE ticket_id = %s', (ticket_id,))
                        cur.execute('DELETE FROM tickets WHERE id = %s', (ticket_id,))
                        results.append({'ticket_id': ticket_id, 'success': True})
                    except Exception as e:
                        results.append({'ticket_id': ticket_id, 'success': False, 'error': str(e)})
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Неизвестное действие: {action}'})
                }
            
            conn.commit()
            
            success_count = sum(1 for r in results if r['success'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'total': len(ticket_ids),
                    'successful': success_count,
                    'failed': len(ticket_ids) - success_count,
                    'results': results
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            cur.close()
            conn.close()