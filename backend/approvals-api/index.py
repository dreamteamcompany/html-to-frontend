"""API для управления согласованиями платежей"""
import json
import os
import sys
import base64
import urllib.request
from urllib.parse import urlencode, quote
from typing import Dict, Any, List
from datetime import datetime
from zoneinfo import ZoneInfo
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, Field

SCHEMA = 't_p61788166_html_to_frontend'
DSN = os.environ['DATABASE_URL']

PUSH_API_URL = 'https://functions.poehali.dev/cc67e884-8946-4bcd-939d-ea3c195a6598'
APP_BASE_URL = 'https://finance-km.ru'

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def response(status: int, body: Any) -> Dict[str, Any]:
    """Формирует HTTP ответ"""
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id'
        },
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }

def verify_token(event: Dict[str, Any], conn=None) -> tuple:
    """Проверяет JWT токен"""
    headers = event.get('headers', {})
    token = (headers.get('X-Auth-Token') or 
             headers.get('x-auth-token') or 
             headers.get('X-Authorization') or
             headers.get('x-authorization', ''))
    if token:
        token = token.replace('Bearer ', '').strip()
    
    if not token:
        return None, response(401, {'error': 'Unauthorized'})
    
    try:
        secret = os.environ.get('JWT_SECRET')
        if not secret:
            return None, response(500, {'error': 'Server configuration error'})
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, response(401, {'error': 'Token expired'})
    except jwt.InvalidTokenError:
        return None, response(401, {'error': 'Invalid token'})

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
    """Модель запроса на утверждение/отклонение/отзыв"""
    payment_id: int = Field(..., gt=0)
    action: str = Field(..., pattern='^(approve|reject|submit|revoke)$')
    comment: str = Field(default='')

def handle_payment_history(event: Dict[str, Any], conn, payment_id: int, user_id: int) -> Dict[str, Any]:
    """Получение истории согласования платежа"""
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Проверяем права доступа к конкретному платежу:
    # пользователь должен быть создателем, согласующим или администратором
    cur.execute(f"""
        SELECT
            p.created_by,
            s.intermediate_approver_id,
            s.final_approver_id
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        WHERE p.id = %s
    """, (payment_id,))
    payment_row = cur.fetchone()
    if not payment_row:
        cur.close()
        return response(404, {'error': 'Платёж не найден'})

    # Проверяем роли пользователя
    cur.execute(f"""
        SELECT r.name
        FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s
    """, (user_id,))
    user_roles = {row['name'] for row in cur.fetchall()}
    is_admin_or_ceo = bool(user_roles & {'Администратор', 'Admin', 'CEO', 'Генеральный директор'})

    is_creator = payment_row['created_by'] == user_id
    is_approver = user_id in (payment_row['intermediate_approver_id'], payment_row['final_approver_id'])

    if not is_creator and not is_approver and not is_admin_or_ceo:
        cur.close()
        return response(403, {'error': 'Нет доступа к истории этого платежа'})

    cur.execute(f"""
        SELECT 
            a.id,
            a.payment_id,
            a.approver_id,
            a.approver_role,
            a.action,
            a.comment,
            a.created_at,
            u.username,
            u.full_name,
            u.photo_url
        FROM {SCHEMA}.approvals a
        LEFT JOIN {SCHEMA}.users u ON a.approver_id = u.id
        WHERE a.payment_id = %s
        ORDER BY a.created_at DESC
    """, (payment_id,))

    history = [dict(row) for row in cur.fetchall()]
    cur.close()

    return response(200, {'history': history})

def handle_approvals_list(event: Dict[str, Any], conn, user_id: int) -> Dict[str, Any]:
    """Получение списка платежей на утверждение"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем платежи, где текущий пользователь - промежуточный или финальный утверждающий
    cur.execute(f"""
        SELECT DISTINCT
            p.id, p.category_id, p.amount, p.description, p.payment_date,
            p.status, p.created_at, p.created_by,
            p.legal_entity_id, p.contractor_id, p.department_id, p.service_id,
            p.invoice_number, p.invoice_date, p.invoice_file_url, p.invoice_file_uploaded_at, p.payment_type,
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
        LEFT JOIN {SCHEMA}.users u ON p.created_by = u.id
        WHERE p.status IN ('pending_ceo', 'pending_tech_director', 'pending_ib', 'pending_cfo')
        ORDER BY p.created_at DESC
    """)
    
    payments_data = cur.fetchall()
    payments = []

    payment_ids = [row['id'] for row in payments_data]
    custom_fields_map = {}
    documents_map = {}
    if payment_ids:
        ids_placeholder = ','.join(['%s'] * len(payment_ids))
        cur.execute(f"""
            SELECT cfv.payment_id, cf.id, cf.name, cf.field_type, cfv.value
            FROM {SCHEMA}.custom_field_values cfv
            JOIN {SCHEMA}.custom_fields cf ON cfv.custom_field_id = cf.id
            WHERE cfv.payment_id IN ({ids_placeholder})
        """, tuple(payment_ids))
        for cf_row in cur.fetchall():
            cf = dict(cf_row)
            pid = cf.pop('payment_id')
            custom_fields_map.setdefault(pid, []).append(cf)
        cur.execute(f"""
            SELECT id, payment_id, file_name, file_url, document_type, uploaded_at
            FROM {SCHEMA}.payment_documents
            WHERE payment_id IN ({ids_placeholder})
            ORDER BY uploaded_at ASC
        """, tuple(payment_ids))
        for doc_row in cur.fetchall():
            doc = dict(doc_row)
            pid = doc['payment_id']
            if doc.get('uploaded_at'):
                doc['uploaded_at'] = doc['uploaded_at'].isoformat()
            documents_map.setdefault(pid, []).append(doc)
    
    for payment in payments_data:
        payment_dict = dict(payment)
        payment_dict['custom_fields'] = custom_fields_map.get(payment['id'], [])
        payment_dict['documents'] = documents_map.get(payment['id'], [])
        
        # Получаем историю утверждений
        cur.execute(f"""
            SELECT a.id, a.payment_id, a.approver_id, a.action, a.comment, a.created_at,
                   u.username as approver_username,
                   u.full_name as approver_full_name,
                   u.photo_url as approver_photo_url
            FROM {SCHEMA}.approvals a
            LEFT JOIN {SCHEMA}.users u ON a.approver_id = u.id
            WHERE a.payment_id = %s
            ORDER BY a.created_at DESC
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

def send_bitrix_bot_message(bitrix_user_id: str, message: str, payment_id: int):
    """Отправляет сообщение от бота в Битрикс24 пользователю"""
    webhook_url = os.environ.get('BITRIX_WEBHOOK_URL', '').rstrip('/')
    bot_id = os.environ.get('BITRIX_BOT_ID', '')
    bot_client_id = os.environ.get('BITRIX_BOT_CLIENT_ID', '')
    
    if not webhook_url or not bitrix_user_id:
        log(f'[BITRIX-BOT] Missing config: webhook={bool(webhook_url)}, user={bitrix_user_id}')
        return

    payment_url = f'{APP_BASE_URL}/payments?payment_id={payment_id}'
    full_message = f"{message}\n[url={payment_url}]Перейти к платежу[/url]"

    if bot_id:
        url = f'{webhook_url}/imbot.message.add.json'

        attempts = []
        base_payload = {
            'BOT_ID': bot_id,
            'DIALOG_ID': str(bitrix_user_id),
            'MESSAGE': full_message,
        }
        if bot_client_id:
            attempts.append({**base_payload, 'CLIENT_ID': bot_client_id})
        attempts.append({
            'BOT_ID': bot_id,
            'FROM_USER_ID': bot_id,
            'TO_USER_ID': str(bitrix_user_id),
            'MESSAGE': full_message,
        })
        attempts.append(base_payload)

        for idx, payload in enumerate(attempts):
            try:
                post_data = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(url, data=post_data, headers={'Content-Type': 'application/json'}, method='POST')
                resp = urllib.request.urlopen(req, timeout=10)
                result = json.loads(resp.read().decode())
                log(f'[BITRIX-BOT] imbot.message.add attempt {idx+1} to user {bitrix_user_id}: {result}')
                if result.get('result'):
                    return
            except urllib.error.HTTPError as e:
                error_body = ''
                try:
                    error_body = e.read().decode()
                except Exception:
                    pass
                log(f'[BITRIX-BOT] imbot.message.add attempt {idx+1} HTTP {e.code} for user {bitrix_user_id}: {error_body}')
            except Exception as e:
                log(f'[BITRIX-BOT] imbot.message.add attempt {idx+1} failed for user {bitrix_user_id}: {e}')

    im_data = json.dumps({
        'DIALOG_ID': str(bitrix_user_id),
        'MESSAGE': full_message,
        'SYSTEM': 'N',
    }).encode('utf-8')
    im_url = f'{webhook_url}/im.message.add.json'

    try:
        req3 = urllib.request.Request(im_url, data=im_data, headers={'Content-Type': 'application/json'}, method='POST')
        resp3 = urllib.request.urlopen(req3, timeout=10)
        result3 = json.loads(resp3.read().decode())
        log(f'[BITRIX-BOT] im.message.add to user {bitrix_user_id}: {result3}')
        if result3.get('result'):
            return
    except Exception as e:
        log(f'[BITRIX-BOT] im.message.add failed for user {bitrix_user_id}: {e}')

    notify_data = json.dumps({
        'to': str(bitrix_user_id),
        'message': full_message,
        'type': 'SYSTEM',
    }).encode('utf-8')
    notify_url = f'{webhook_url}/im.notify.system.add.json'

    try:
        req2 = urllib.request.Request(notify_url, data=notify_data, headers={'Content-Type': 'application/json'}, method='POST')
        resp2 = urllib.request.urlopen(req2, timeout=10)
        result2 = json.loads(resp2.read().decode())
        log(f'[BITRIX-BOT] im.notify.system.add to user {bitrix_user_id}: {result2}')
    except Exception as e2:
        log(f'[BITRIX-BOT] im.notify.system.add also failed for user {bitrix_user_id}: {e2}')


def send_bitrix_notifications(conn, payment_id: int, action: str, actor_id: int, comment: str = ''):
    """Отправляет уведомления через Битрикс бота по ролям"""
    log(f'[BITRIX-BOT] send_bitrix_notifications called: payment_id={payment_id}, action={action}, actor_id={actor_id}')
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT p.id, p.description, p.amount, p.payment_date, p.service_id, p.created_by,
               s.name AS service_name
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        WHERE p.id = %s
    """, (payment_id,))
    payment = cur.fetchone()
    if not payment:
        log(f'[BITRIX-BOT] Payment {payment_id} not found')
        cur.close()
        return

    service_name = payment['service_name'] or payment['description'] or f'Платёж #{payment_id}'
    try:
        amount_fmt = f"{float(payment['amount']):,.0f}".replace(',', ' ') + ' ₽'
    except Exception:
        amount_fmt = str(payment['amount']) + ' ₽'

    cur.execute(f"SELECT full_name FROM {SCHEMA}.users WHERE id = %s", (actor_id,))
    actor_row = cur.fetchone()
    actor_name = actor_row['full_name'] if actor_row else 'Пользователь'

    action_labels = {
        'approve': 'согласован',
        'reject': 'отклонён',
        'revoke': 'отозван',
        'submit': 'на согласование',
    }
    action_label = action_labels.get(action, action)

    recipients_bitrix_ids: List[str] = []

    if action == 'submit':
        cur.execute(f"""
            SELECT DISTINCT u.bitrix_id FROM {SCHEMA}.user_roles ur
            JOIN {SCHEMA}.roles r ON ur.role_id = r.id
            JOIN {SCHEMA}.users u ON ur.user_id = u.id
            WHERE r.name IN ('CEO', 'Генеральный директор')
              AND u.bitrix_id IS NOT NULL AND u.bitrix_id != ''
              AND u.is_active = true AND ur.user_id != %s
        """, (actor_id,))
        for row in cur.fetchall():
            recipients_bitrix_ids.append(row['bitrix_id'])

        msg = f"📋 Новый счёт на согласование\n{service_name} — {amount_fmt}\nОт: {actor_name}"

    elif action in ('approve', 'reject', 'revoke'):
        cur.execute(f"""
            SELECT DISTINCT u.bitrix_id FROM {SCHEMA}.user_roles ur
            JOIN {SCHEMA}.roles r ON ur.role_id = r.id
            JOIN {SCHEMA}.users u ON ur.user_id = u.id
            WHERE r.name IN ('Администратор', 'Admin', 'Финансист')
              AND u.bitrix_id IS NOT NULL AND u.bitrix_id != ''
              AND u.is_active = true AND ur.user_id != %s
        """, (actor_id,))
        for row in cur.fetchall():
            recipients_bitrix_ids.append(row['bitrix_id'])

        emoji = {'approve': '✅', 'reject': '❌', 'revoke': '↩️'}.get(action, '📋')
        msg = f"{emoji} Счёт {action_label}: {service_name} — {amount_fmt}\n{actor_name}"
        if comment:
            msg += f"\nКомментарий: {comment}"
    else:
        cur.close()
        return

    cur.close()

    log(f'[BITRIX-BOT] Recipients for action={action}: {recipients_bitrix_ids}')

    seen = set()
    for bx_id in recipients_bitrix_ids:
        if bx_id not in seen:
            seen.add(bx_id)
            send_bitrix_bot_message(bx_id, msg, payment_id)


def create_approval_notifications(conn, payment_id: int, action: str, actor_id: int):
    """Создаёт уведомления согласующим при изменении статуса платежа"""
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT
            p.id, p.description, p.amount, p.payment_date, p.service_id, p.created_by,
            s.name AS service_name, s.intermediate_approver_id, s.final_approver_id,
            u.full_name AS creator_name
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        LEFT JOIN {SCHEMA}.users u ON p.created_by = u.id
        WHERE p.id = %s
    """, (payment_id,))
    payment = cur.fetchone()
    cur.close()

    if not payment:
        return

    service_name = payment['service_name'] or payment['description'] or f'Платёж #{payment_id}'
    amount = payment['amount']
    payment_date = payment['payment_date']
    creator_name = payment['creator_name'] or 'Пользователь'

    try:
        amount_fmt = f"{float(amount):,.0f}".replace(',', ' ') + ' ₽'
    except Exception:
        amount_fmt = str(amount) + ' ₽'

    if payment_date:
        try:
            if hasattr(payment_date, 'strftime'):
                date_fmt = payment_date.strftime('%d.%m.%Y')
            else:
                date_fmt = str(payment_date)[:10]
        except Exception:
            date_fmt = str(payment_date)[:10]
    else:
        date_fmt = '—'

    recipients = []

    if action == 'submit':
        if payment['final_approver_id'] and payment['final_approver_id'] != actor_id:
            recipients.append(payment['final_approver_id'])
        if payment['intermediate_approver_id'] and payment['intermediate_approver_id'] != actor_id:
            recipients.append(payment['intermediate_approver_id'])

        # Фоллбэк: если у сервиса не назначены согласующие — уведомляем CEO и Администраторов
        if not recipients:
            cur2 = conn.cursor(cursor_factory=RealDictCursor)
            cur2.execute(f"""
                SELECT DISTINCT ur.user_id
                FROM {SCHEMA}.user_roles ur
                JOIN {SCHEMA}.roles r ON ur.role_id = r.id
                WHERE r.name IN ('CEO', 'Администратор', 'Admin', 'Генеральный директор')
                  AND ur.user_id != %s
            """, (actor_id,))
            for row in cur2.fetchall():
                recipients.append(row['user_id'])
            cur2.close()

        message = (
            f"Новый счёт на согласование: {service_name} — {amount_fmt} "
            f"(дата: {date_fmt}), от {creator_name}"
        )
        notif_type = 'approval_request'

    elif action == 'approve':
        if payment['created_by'] and payment['created_by'] != actor_id:
            recipients.append(payment['created_by'])
        message = (
            f"Счёт согласован: {service_name} — {amount_fmt} (дата: {date_fmt})"
        )
        notif_type = 'approval_approved'

    elif action == 'reject':
        if payment['created_by'] and payment['created_by'] != actor_id:
            recipients.append(payment['created_by'])
        message = (
            f"Счёт отклонён: {service_name} — {amount_fmt} (дата: {date_fmt})"
        )
        notif_type = 'approval_rejected'

    elif action == 'revoke':
        if payment['final_approver_id'] and payment['final_approver_id'] != actor_id:
            recipients.append(payment['final_approver_id'])
        if payment['intermediate_approver_id'] and payment['intermediate_approver_id'] != actor_id:
            recipients.append(payment['intermediate_approver_id'])
        message = (
            f"Счёт отозван: {service_name} — {amount_fmt} (дата: {date_fmt}), от {creator_name}"
        )
        notif_type = 'approval_revoked'

    else:
        return

    if not recipients:
        return

    seen = set()
    unique_recipients = [r for r in recipients if not (r in seen or seen.add(r))]

    cur = conn.cursor()
    for recipient_id in unique_recipients:
        cur.execute(f"""
            INSERT INTO {SCHEMA}.notifications (user_id, payment_id, type, message, is_read)
            VALUES (%s, %s, %s, %s, false)
        """, (recipient_id, payment_id, notif_type, message))
    conn.commit()
    cur.close()

    # Отправляем Web Push для каждого получателя (работает когда сайт закрыт)
    push_title = 'Новый счёт на согласование'
    if action == 'approve':
        push_title = 'Счёт согласован'
    elif action == 'reject':
        push_title = 'Счёт отклонён'
    elif action == 'revoke':
        push_title = 'Счёт отозван'

    push_url = f'/payments?payment_id={payment_id}'

    for recipient_id in unique_recipients:
        try:
            push_payload = json.dumps({
                'user_id': recipient_id,
                'title': push_title,
                'body': message,
                'url': push_url,
                'payment_id': payment_id,
                'tag': f'payment-{payment_id}',
            }).encode('utf-8')
            req = urllib.request.Request(
                f'{PUSH_API_URL}?endpoint=send-push',
                data=push_payload,
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            urllib.request.urlopen(req, timeout=5)
        except Exception as e:
            print(f'[WARN] Push notification failed for user {recipient_id}: {e}')


def handle_approval_action(event: Dict[str, Any], conn, user_id: int) -> Dict[str, Any]:
    """Утверждение или отклонение платежа"""
    try:
        body_str = event.get('body', '{}')
        
        # Проверяем, закодировано ли body в base64
        if event.get('isBase64Encoded', False):
            body_str = base64.b64decode(body_str).decode('utf-8')
        
        body = json.loads(body_str)
        print(f"[DEBUG] Received body: {body}")
        approval_action = ApprovalActionRequest(**body)
    except Exception as e:
        print(f"[ERROR] Validation failed: {str(e)}, body: {event.get('body', '{}')}")
        return response(400, {'error': f'Ошибка валидации: {str(e)}'})
    
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем существование платежа и получаем его статус
    cur.execute(f"""
        SELECT p.id, p.status, p.service_id, p.created_by, s.intermediate_approver_id, s.final_approver_id
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        WHERE p.id = %s
    """, (approval_action.payment_id,))
    
    payment = cur.fetchone()
    
    if not payment:
        cur.close()
        return response(404, {'error': 'Платеж не найден'})
    
    is_intermediate_approver = payment['intermediate_approver_id'] == user_id
    is_final_approver = payment['final_approver_id'] == user_id
    
    # Проверяем, является ли пользователь администратором или CEO
    cur.execute(f"""
        SELECT r.name FROM {SCHEMA}.user_roles ur
        JOIN {SCHEMA}.roles r ON ur.role_id = r.id
        WHERE ur.user_id = %s
    """, (user_id,))
    user_roles = [row['name'] for row in cur.fetchall()]
    is_admin = 'Администратор' in user_roles or 'Admin' in user_roles
    is_ceo = 'CEO' in user_roles or 'Генеральный директор' in user_roles
    
    # Определяем новый статус
    if approval_action.action == 'submit':
        if payment['status'] not in ('draft', 'rejected', None):
            cur.close()
            return response(400, {'error': 'Только черновики и отклонённые платежи можно отправить на согласование'})
        new_status = 'pending_ceo'
    elif approval_action.action == 'approve':
        # Администратор и CEO могут согласовывать любые платежи
        if not is_admin and not is_ceo and not is_intermediate_approver and not is_final_approver:
            cur.close()
            return response(403, {'error': 'Вы не являетесь утверждающим для этого платежа'})
        if not str(payment['status']).startswith('pending_'):
            cur.close()
            return response(400, {'error': 'Неверный статус платежа для утверждения'})
        new_status = 'approved'
    elif approval_action.action == 'revoke':
        # Проверяем, что платёж можно отозвать (на согласовании или одобрен)
        if payment['status'] not in ('pending_ceo', 'pending_tech_director', 'approved'):
            cur.close()
            return response(400, {'error': 'Можно отозвать только платежи на согласовании или одобренные'})
        
        # Проверяем, что отзывает создатель платежа, администратор или CEO
        is_creator = payment.get('created_by') == user_id
        
        if not is_creator and not is_admin and not is_ceo:
            cur.close()
            return response(403, {'error': 'Только создатель платежа, администратор или CEO может его отозвать'})
        
        # Проверяем наличие причины отзыва
        if not approval_action.comment or not approval_action.comment.strip():
            cur.close()
            return response(400, {'error': 'Причина отзыва обязательна'})
        
        new_status = 'draft'  # Возвращаем в черновики
    elif approval_action.action == 'reject':
        # Администратор и CEO могут отклонять любые платежи
        if not is_admin and not is_ceo and not is_intermediate_approver and not is_final_approver:
            cur.close()
            return response(403, {'error': 'Вы не являетесь утверждающим для этого платежа'})
        new_status = 'rejected'
    else:
        new_status = 'rejected'
    
    # Московское время без timezone info (для timestamp without time zone)
    moscow_tz = ZoneInfo('Europe/Moscow')
    now_moscow = datetime.now(moscow_tz).replace(tzinfo=None)
    
    # Обновляем статус платежа
    if new_status == 'approved' and (is_final_approver or is_admin or is_ceo or str(payment['status']).startswith('pending_')):
        cur.execute(f"""
            UPDATE {SCHEMA}.payments
            SET status = %s, 
                ceo_approved_at = %s,
                ceo_approved_by = %s,
                submitted_at = CASE WHEN submitted_at IS NULL THEN %s ELSE submitted_at END
            WHERE id = %s
        """, (new_status, now_moscow, user_id, now_moscow, approval_action.payment_id))
    elif new_status == 'pending_ceo':
        cur.execute(f"""
            UPDATE {SCHEMA}.payments
            SET status = %s,
                submitted_at = %s
            WHERE id = %s
        """, (new_status, now_moscow, approval_action.payment_id))
    else:
        cur.execute(f"""
            UPDATE {SCHEMA}.payments
            SET status = %s
            WHERE id = %s
        """, (new_status, approval_action.payment_id))
    
    # Добавляем запись в историю утверждений с московским временем
    cur.execute(f"""
        INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (approval_action.payment_id, user_id, 'submitter', approval_action.action, approval_action.comment, now_moscow))
    
    conn.commit()
    cur.close()

    if approval_action.action in ('submit', 'approve', 'reject', 'revoke'):
        try:
            create_approval_notifications(conn, approval_action.payment_id, approval_action.action, user_id)
        except Exception as e:
            log(f"[WARN] Notification creation failed: {e}")

        log(f"[BITRIX-BOT] About to call send_bitrix_notifications for payment {approval_action.payment_id}")
        try:
            send_bitrix_notifications(conn, approval_action.payment_id, approval_action.action, user_id, approval_action.comment)
        except Exception as e:
            import traceback
            log(f"[WARN] Bitrix bot notification failed: {e}\n{traceback.format_exc()}")

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
            if method == 'GET':
                payload, error = verify_token_and_permission(event, conn, 'approvals.read')
                if error:
                    return error
                return handle_approvers_list(event, conn)
            return response(405, {'error': 'Method not allowed'})
        
        else:
            payload, error = verify_token_and_permission(event, conn, 'approvals.read' if method == 'GET' else 'payments.update')
            if error:
                return error
            
            user_id = payload['user_id']
            
            if method == 'GET':
                # Проверяем, запрашивается ли история конкретного платежа
                query_params = event.get('queryStringParameters') or {}
                if query_params.get('history') == 'true' and query_params.get('payment_id'):
                    payment_id = int(query_params.get('payment_id'))
                    return handle_payment_history(event, conn, payment_id, user_id)
                return handle_approvals_list(event, conn, user_id)
            elif method == 'POST' or method == 'PUT':
                return handle_approval_action(event, conn, user_id)
            
            return response(405, {'error': 'Method not allowed'})
    
    finally:
        conn.close()