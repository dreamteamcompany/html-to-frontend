"""
API для управления согласованиями заявок
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id'
            },
            'body': ''
        }
    
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    try:
        if method == 'POST':
            return submit_for_approval(event, user_id)
        elif method == 'PUT':
            return process_approval(event, user_id)
        elif method == 'GET':
            return get_approval_history(event)
        else:
            return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def submit_for_approval(event: dict, user_id: str):
    """Отправка заявки на согласование"""
    data = json.loads(event.get('body', '{}'))
    ticket_id = data.get('ticket_id')
    approver_ids = data.get('approver_ids', [])
    
    if not ticket_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ticket_id is required'})
        }
    
    if not approver_ids or len(approver_ids) == 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'approver_ids is required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем список выбранных согласующих
    placeholders = ','.join(['%s'] * len(approver_ids))
    cur.execute(f"""
        SELECT u.id, u.full_name as name, u.username as email
        FROM t_p61788166_html_to_frontend.users u
        WHERE u.id IN ({placeholders}) AND u.is_active = true
    """, tuple(approver_ids))
    approvers = cur.fetchall()
    
    # Обновляем статус заявки на "На согласовании"
    cur.execute("""
        UPDATE t_p61788166_html_to_frontend.tickets
        SET status_id = (SELECT id FROM t_p61788166_html_to_frontend.ticket_statuses WHERE name = 'На согласовании'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (ticket_id,))
    
    # Создаем записи о согласовании
    cur.execute("""
        INSERT INTO t_p61788166_html_to_frontend.ticket_approvals
        (ticket_id, approver_id, action, comment)
        VALUES (%s, %s, 'submitted', 'Отправлено на согласование')
    """, (ticket_id, user_id))
    
    # Логируем в audit_logs
    cur.execute("""
        SELECT username FROM t_p61788166_html_to_frontend.users WHERE id = %s
    """, (user_id,))
    username = cur.fetchone()['username']
    
    approver_names = ', '.join([a['name'] for a in approvers])
    cur.execute("""
        INSERT INTO t_p61788166_html_to_frontend.audit_logs 
        (entity_type, entity_id, action, user_id, username, metadata)
        VALUES ('ticket', %s, 'approval_sent', %s, %s, %s::jsonb)
    """, (ticket_id, user_id, username, json.dumps({'approvers': approver_names})))
    
    for approver in approvers:
        cur.execute("""
            INSERT INTO t_p61788166_html_to_frontend.ticket_approvals
            (ticket_id, approver_id, action)
            VALUES (%s, %s, 'pending')
        """, (ticket_id, approver['id']))
        
        # Создаем уведомление для каждого согласующего
        cur.execute("""
            INSERT INTO t_p61788166_html_to_frontend.notifications
            (user_id, ticket_id, type, message)
            VALUES (%s, %s, 'approval_request', %s)
        """, (approver['id'], ticket_id, f'Заявка #{ticket_id} требует вашего согласования'))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': 'Заявка отправлена на согласование', 'approvers_count': len(approvers)})
    }

def process_approval(event: dict, user_id: str):
    """Обработка решения по согласованию (одобрить/отклонить)"""
    data = json.loads(event.get('body', '{}'))
    ticket_id = data.get('ticket_id')
    action = data.get('action')  # 'approved' или 'rejected'
    comment = data.get('comment', '')
    
    if not ticket_id or not action:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ticket_id and action are required'})
        }
    
    if action not in ['approved', 'rejected']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'action must be approved or rejected'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем, является ли пользователь согласующим
    cur.execute("""
        SELECT id FROM t_p61788166_html_to_frontend.ticket_approvals
        WHERE ticket_id = %s AND approver_id = %s AND action = 'pending'
    """, (ticket_id, user_id))
    
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'У вас нет прав на согласование этой заявки'})
        }
    
    # Обновляем запись о согласовании
    cur.execute("""
        UPDATE t_p61788166_html_to_frontend.ticket_approvals
        SET action = %s, comment = %s, created_at = CURRENT_TIMESTAMP
        WHERE ticket_id = %s AND approver_id = %s AND action = 'pending'
    """, (action, comment, ticket_id, user_id))
    
    # Получаем информацию о согласующем
    cur.execute("""
        SELECT name FROM t_p61788166_html_to_frontend.users WHERE id = %s
    """, (user_id,))
    approver_name = cur.fetchone()['name']
    
    # Получаем создателя заявки
    cur.execute("""
        SELECT created_by FROM t_p61788166_html_to_frontend.tickets WHERE id = %s
    """, (ticket_id,))
    creator_id = cur.fetchone()['created_by']
    
    if action == 'approved':
        # Обновляем статус заявки на "Одобрена"
        cur.execute("""
            UPDATE t_p61788166_html_to_frontend.tickets
            SET status_id = (SELECT id FROM t_p61788166_html_to_frontend.ticket_statuses WHERE name = 'Одобрена'),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (ticket_id,))
        
        # Уведомление исполнителю
        cur.execute("""
            INSERT INTO t_p61788166_html_to_frontend.notifications
            (user_id, ticket_id, type, message)
            VALUES (%s, %s, 'approval_approved', %s)
        """, (creator_id, ticket_id, f'Заявка #{ticket_id} одобрена ({approver_name})'))
        
        # Логируем в audit_logs
        cur.execute("""
            INSERT INTO t_p61788166_html_to_frontend.audit_logs 
            (entity_type, entity_id, action, user_id, username, metadata)
            VALUES ('ticket', %s, 'approved', %s, %s, %s::jsonb)
        """, (ticket_id, user_id, approver_name, json.dumps({'comment': comment if comment else None})))
        
    else:  # rejected
        # Обновляем статус заявки на "Отклонена"
        cur.execute("""
            UPDATE t_p61788166_html_to_frontend.tickets
            SET status_id = (SELECT id FROM t_p61788166_html_to_frontend.ticket_statuses WHERE name = 'Отклонена'),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (ticket_id,))
        
        # Уведомление исполнителю с причиной
        message = f'Заявка #{ticket_id} отклонена ({approver_name})'
        
        # Логируем в audit_logs
        cur.execute("""
            INSERT INTO t_p61788166_html_to_frontend.audit_logs 
            (entity_type, entity_id, action, user_id, username, metadata)
            VALUES ('ticket', %s, 'rejected', %s, %s, %s::jsonb)
        """, (ticket_id, user_id, approver_name, json.dumps({'comment': comment})))
        if comment:
            message += f'. Причина: {comment}'
        
        cur.execute("""
            INSERT INTO t_p61788166_html_to_frontend.notifications
            (user_id, ticket_id, type, message)
            VALUES (%s, %s, 'approval_rejected', %s)
        """, (creator_id, ticket_id, message))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'message': f'Заявка {"одобрена" if action == "approved" else "отклонена"}'})
    }

def get_approval_history(event: dict):
    """Получение истории согласований по заявке"""
    params = event.get('queryStringParameters') or {}
    ticket_id = params.get('ticket_id')
    
    if not ticket_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ticket_id is required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT 
            ta.id,
            ta.action,
            ta.comment,
            ta.created_at,
            ta.approver_id,
            u.full_name as approver_name,
            u.username as approver_email
        FROM t_p61788166_html_to_frontend.ticket_approvals ta
        LEFT JOIN t_p61788166_html_to_frontend.users u ON ta.approver_id = u.id
        WHERE ta.ticket_id = %s
        ORDER BY ta.created_at DESC
    """, (ticket_id,))
    
    history = cur.fetchall() or []
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps([dict(h) for h in history], default=str)
    }