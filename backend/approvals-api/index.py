"""API для управления согласованиями платежей"""
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, Field

# Environment
SCHEMA = 't_p61788166_html_to_frontend'
DSN = os.environ['DATABASE_URL']

def response(status: int, body: Any) -> Dict[str, Any]:
    """Формирует HTTP ответ"""
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id'
        },
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }

def verify_token(event: Dict[str, Any], conn) -> tuple:
    """Проверяет токен и возвращает (payload, error_response)"""
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    
    if not token:
        return None, response(401, {'error': 'Unauthorized'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT user_id, expires_at 
        FROM {SCHEMA}.auth_tokens 
        WHERE token = %s AND expires_at > NOW()
    """, (token,))
    
    row = cur.fetchone()
    cur.close()
    
    if not row:
        return None, response(401, {'error': 'Invalid or expired token'})
    
    return {'user_id': row['user_id']}, None

def verify_token_and_permission(event: Dict[str, Any], conn, required_permission: str) -> tuple:
    """Проверяет токен и права доступа"""
    payload, error = verify_token(event, conn)
    if error:
        return None, error
    
    cur = conn.cursor()
    cur.execute(f"""
        SELECT COUNT(*) FROM {SCHEMA}.permissions p
        JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id
        JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s AND p.name = %s
    """, (payload['user_id'], required_permission))
    
    has_permission = cur.fetchone()[0] > 0
    cur.close()
    
    if not has_permission:
        return None, response(403, {'error': 'Forbidden'})
    
    return payload, None

class ApprovalActionRequest(BaseModel):
    """Модель запроса на утверждение/отклонение"""
    payment_id: int = Field(..., gt=0)
    action: str = Field(..., pattern='^(approve|reject)$')
    comment: str = Field(default='')

def handle_approvals_list(event: Dict[str, Any], conn, user_id: int) -> Dict[str, Any]:
    """Получение списка платежей на утверждение"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем платежи, где текущий пользователь - промежуточный или финальный утверждающий
    cur.execute(f"""
        SELECT DISTINCT
            p.id, p.category_id, p.amount, p.description, p.payment_date,
            p.status, p.created_at, p.updated_at, p.created_by_user_id,
            p.legal_entity_id, p.contractor_id, p.department_id, p.service_id,
            p.invoice_number, p.invoice_date,
            c.name as category_name,
            le.name as legal_entity_name,
            cont.name as contractor_name,
            dep.name as department_name,
            s.name as service_name,
            u.username as created_by_username,
            u.full_name as created_by_full_name
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.categories c ON p.category_id = c.id
        LEFT JOIN {SCHEMA}.legal_entities le ON p.legal_entity_id = le.id
        LEFT JOIN {SCHEMA}.contractors cont ON p.contractor_id = cont.id
        LEFT JOIN {SCHEMA}.customer_departments dep ON p.department_id = dep.id
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        LEFT JOIN {SCHEMA}.users u ON p.created_by_user_id = u.id
        WHERE 
            (p.status = 'pending_approval' AND s.intermediate_approver_id = %s)
            OR (p.status = 'intermediate_approved' AND s.final_approver_id = %s)
        ORDER BY p.created_at DESC
    """, (user_id, user_id))
    
    payments_data = cur.fetchall()
    payments = []
    
    for payment in payments_data:
        payment_dict = dict(payment)
        
        # Получаем историю утверждений
        cur.execute(f"""
            SELECT id, payment_id, approver_id, action, comment, created_at,
                   (SELECT username FROM {SCHEMA}.users WHERE id = approver_id) as approver_username,
                   (SELECT full_name FROM {SCHEMA}.users WHERE id = approver_id) as approver_full_name
            FROM {SCHEMA}.approval_history
            WHERE payment_id = %s
            ORDER BY created_at DESC
        """, (payment['id'],))
        
        approval_history = [dict(row) for row in cur.fetchall()]
        payment_dict['approval_history'] = approval_history
        
        # Получаем информацию об утверждающих через сервис
        if payment['service_id']:
            cur.execute(f"""
                SELECT intermediate_approver_id, final_approver_id
                FROM {SCHEMA}.services
                WHERE id = %s
            """, (payment['service_id'],))
            service_info = cur.fetchone()
            
            if service_info:
                # Получаем информацию о промежуточном утверждающем
                cur.execute(f"""
                    SELECT id, username, full_name
                    FROM {SCHEMA}.users
                    WHERE id = %s
                """, (service_info['intermediate_approver_id'],))
                intermediate_approver = cur.fetchone()
                payment_dict['intermediate_approver'] = dict(intermediate_approver) if intermediate_approver else None
                
                # Получаем информацию о финальном утверждающем
                cur.execute(f"""
                    SELECT id, username, full_name
                    FROM {SCHEMA}.users
                    WHERE id = %s
                """, (service_info['final_approver_id'],))
                final_approver = cur.fetchone()
                payment_dict['final_approver'] = dict(final_approver) if final_approver else None
        
        payments.append(payment_dict)
    
    cur.close()
    return response(200, {'payments': payments})

def handle_approval_action(event: Dict[str, Any], conn, user_id: int) -> Dict[str, Any]:
    """Утверждение или отклонение платежа"""
    try:
        body = json.loads(event.get('body', '{}'))
        approval_action = ApprovalActionRequest(**body)
    except Exception as e:
        return response(400, {'error': f'Ошибка валидации: {str(e)}'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем существование платежа и получаем его статус
    cur.execute(f"""
        SELECT p.id, p.status, p.service_id, s.intermediate_approver_id, s.final_approver_id
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        WHERE p.id = %s
    """, (approval_action.payment_id,))
    
    payment = cur.fetchone()
    
    if not payment:
        cur.close()
        return response(404, {'error': 'Платеж не найден'})
    
    # Проверяем, что пользователь является утверждающим
    is_intermediate_approver = payment['intermediate_approver_id'] == user_id
    is_final_approver = payment['final_approver_id'] == user_id
    
    if not is_intermediate_approver and not is_final_approver:
        cur.close()
        return response(403, {'error': 'Вы не являетесь утверждающим для этого платежа'})
    
    # Определяем новый статус
    if approval_action.action == 'approve':
        if payment['status'] == 'pending_approval' and is_intermediate_approver:
            new_status = 'intermediate_approved'
        elif payment['status'] == 'intermediate_approved' and is_final_approver:
            new_status = 'approved'
        else:
            cur.close()
            return response(400, {'error': 'Неверный статус платежа для утверждения'})
    else:  # reject
        new_status = 'rejected'
    
    # Обновляем статус платежа
    cur.execute(f"""
        UPDATE {SCHEMA}.payments
        SET status = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (new_status, approval_action.payment_id))
    
    # Добавляем запись в историю утверждений
    cur.execute(f"""
        INSERT INTO {SCHEMA}.approval_history (payment_id, approver_id, action, comment)
        VALUES (%s, %s, %s, %s)
    """, (approval_action.payment_id, user_id, approval_action.action, approval_action.comment))
    
    conn.commit()
    cur.close()
    
    return response(200, {'message': 'Действие выполнено успешно', 'new_status': new_status})

def handle_approvers_list(event: Dict[str, Any], conn) -> Dict[str, Any]:
    """Получение списка утверждающих"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем всех активных пользователей которые могут быть утверждающими
    cur.execute(f"""
        SELECT DISTINCT u.id, u.username, u.full_name, u.email
        FROM {SCHEMA}.users u
        WHERE u.is_active = true
        ORDER BY u.full_name
    """)
    
    approvers = [dict(row) for row in cur.fetchall()]
    cur.close()
    
    return response(200, {'approvers': approvers})

def handler(event: dict, context) -> dict:
    """
    API для управления согласованиями платежей.
    
    Endpoints:
    - GET /approvals - список платежей на утверждение
    - POST /approvals - утвердить/отклонить платеж
    - GET /approvers - список всех утверждающих
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    # CORS preflight
    if method == 'OPTIONS':
        return response(200, {})
    
    conn = psycopg2.connect(DSN)
    
    try:
        # Определяем endpoint из query параметров или пути
        query_params = event.get('queryStringParameters', {}) or {}
        endpoint = query_params.get('endpoint', '')
        
        # Если endpoint не в query, пробуем извлечь из пути
        if not endpoint:
            path_parts = [p for p in path.strip('/').split('/') if p]
            endpoint = path_parts[-1] if path_parts else ''
        
        if endpoint == 'approvers':
            # GET /approvers - список утверждающих
            if method == 'GET':
                payload, error = verify_token_and_permission(event, conn, 'approval:read')
                if error:
                    return error
                return handle_approvers_list(event, conn)
            return response(405, {'error': 'Method not allowed'})
        
        else:
            # /approvals endpoint
            payload, error = verify_token_and_permission(event, conn, 'approval:read' if method == 'GET' else 'approval:execute')
            if error:
                return error
            
            user_id = payload['user_id']
            
            if method == 'GET':
                return handle_approvals_list(event, conn, user_id)
            elif method == 'POST':
                return handle_approval_action(event, conn, user_id)
            
            return response(405, {'error': 'Method not allowed'})
    
    finally:
        conn.close()