import json
import os
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

SCHEMA = 't_p61788166_html_to_frontend'

class ApprovalActionRequest(BaseModel):
    payment_id: int = Field(..., gt=0)
    action: str = Field(..., pattern='^(approve|reject)$')
    comment: str = Field(default='')

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(dsn)

def verify_token(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return None
    
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None
    
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except:
        return None

def get_user_role(conn, user_id: int) -> str:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT r.name 
        FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
        LIMIT 1
    """, (user_id,))
    
    result = cur.fetchone()
    cur.close()
    return result['name'] if result else 'user'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Бизнес-логика: Система согласования платежей с двумя уровнями (тех.директор → CEO)
    Аргументы: event - словарь с httpMethod, body, queryStringParameters
    Возвращает: HTTP ответ с результатом операции
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return response(200, {})
    
    payload = verify_token(event)
    if not payload:
        return response(401, {'error': 'Требуется авторизация'})
    
    conn = get_db_connection()
    
    try:
        if method == 'POST':
            return handle_submit_for_approval(event, conn, payload)
        elif method == 'PUT':
            return handle_approval_action(event, conn, payload)
        elif method == 'GET':
            return handle_get_approvals(event, conn, payload)
        else:
            return response(405, {'error': 'Метод не поддерживается'})
    
    finally:
        conn.close()

def handle_submit_for_approval(event: Dict[str, Any], conn, payload: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    payment_id = body_data.get('payment_id')
    
    if not payment_id:
        return response(400, {'error': 'payment_id обязателен'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT status, created_by FROM {SCHEMA}.payments WHERE id = %s
    """, (payment_id,))
    
    payment = cur.fetchone()
    if not payment:
        cur.close()
        return response(404, {'error': 'Платеж не найден'})
    
    if payment['status'] != 'draft':
        cur.close()
        return response(400, {'error': 'Платеж уже отправлен на согласование'})
    
    cur.execute(f"""
        UPDATE {SCHEMA}.payments 
        SET status = 'pending_tech_director', submitted_at = NOW()
        WHERE id = %s
    """, (payment_id,))
    
    cur.execute(f"""
        INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment)
        VALUES (%s, %s, 'creator', 'submitted', 'Отправлено на согласование')
    """, (payment_id, payload['user_id']))
    
    conn.commit()
    cur.close()
    
    return response(200, {'message': 'Платеж отправлен на согласование', 'status': 'pending_tech_director'})

def handle_approval_action(event: Dict[str, Any], conn, payload: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    req = ApprovalActionRequest(**body_data)
    user_id = payload['user_id']
    user_role = get_user_role(conn, user_id)
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT status FROM {SCHEMA}.payments WHERE id = %s
    """, (req.payment_id,))
    
    payment = cur.fetchone()
    if not payment:
        cur.close()
        return response(404, {'error': 'Платеж не найден'})
    
    current_status = payment['status']
    
    if current_status == 'pending_tech_director' and user_role == 'tech_director':
        if req.action == 'approve':
            new_status = 'pending_ceo'
            cur.execute(f"""
                UPDATE {SCHEMA}.payments 
                SET status = %s, tech_director_approved_at = NOW(), tech_director_approved_by = %s
                WHERE id = %s
            """, (new_status, user_id, req.payment_id))
        else:
            new_status = 'rejected'
            cur.execute(f"""
                UPDATE {SCHEMA}.payments 
                SET status = %s, tech_director_approved_at = NOW(), tech_director_approved_by = %s
                WHERE id = %s
            """, (new_status, user_id, req.payment_id))
    
    elif current_status == 'pending_ceo' and user_role == 'ceo':
        if req.action == 'approve':
            new_status = 'approved'
            cur.execute(f"""
                UPDATE {SCHEMA}.payments 
                SET status = %s, ceo_approved_at = NOW(), ceo_approved_by = %s
                WHERE id = %s
            """, (new_status, user_id, req.payment_id))
        else:
            new_status = 'rejected'
            cur.execute(f"""
                UPDATE {SCHEMA}.payments 
                SET status = %s, ceo_approved_at = NOW(), ceo_approved_by = %s
                WHERE id = %s
            """, (new_status, user_id, req.payment_id))
    
    else:
        cur.close()
        return response(403, {'error': 'У вас нет прав для этого действия'})
    
    cur.execute(f"""
        INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment)
        VALUES (%s, %s, %s, %s, %s)
    """, (req.payment_id, user_id, user_role, req.action, req.comment))
    
    conn.commit()
    cur.close()
    
    return response(200, {'message': 'Решение принято', 'status': new_status})

def handle_get_approvals(event: Dict[str, Any], conn, payload: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    payment_id = params.get('payment_id')
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if payment_id:
        cur.execute(f"""
            SELECT a.*, u.full_name as approver_name
            FROM {SCHEMA}.approvals a
            JOIN {SCHEMA}.users u ON a.approver_id = u.id
            WHERE a.payment_id = %s
            ORDER BY a.created_at DESC
        """, (payment_id,))
    else:
        cur.execute(f"""
            SELECT a.*, u.full_name as approver_name, p.amount, p.description
            FROM {SCHEMA}.approvals a
            JOIN {SCHEMA}.users u ON a.approver_id = u.id
            JOIN {SCHEMA}.payments p ON a.payment_id = p.id
            ORDER BY a.created_at DESC
            LIMIT 100
        """)
    
    approvals = [dict(row) for row in cur.fetchall()]
    cur.close()
    
    return response(200, approvals)
