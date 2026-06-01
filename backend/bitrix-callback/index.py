"""Webhook от Битрикс24: обработка нажатий кнопок (COMMAND) и текстовых ответов (reply)
на уведомления о платежах. Превращает действия CEO в Битриксе в реальные изменения
статуса платежа и в комментарии к платежу.
"""
import json
import os
import sys
import base64
import urllib.request
import urllib.error
import urllib.parse
from typing import Dict, Any, Optional
from datetime import datetime
from zoneinfo import ZoneInfo

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61788166_html_to_frontend'
DSN = os.environ['DATABASE_URL']
APP_BASE_URL = 'https://finance-km.ru'


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def response(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def _parse_event_body(event: Dict[str, Any]) -> Dict[str, Any]:
    body_raw = event.get('body') or ''
    if event.get('isBase64Encoded'):
        try:
            body_raw = base64.b64decode(body_raw).decode('utf-8')
        except Exception:
            body_raw = ''

    headers = event.get('headers') or {}
    ctype = (headers.get('Content-Type') or headers.get('content-type') or '').lower()

    if 'application/json' in ctype:
        try:
            return json.loads(body_raw or '{}')
        except Exception:
            return {}

    if 'application/x-www-form-urlencoded' in ctype or '=' in body_raw:
        parsed = urllib.parse.parse_qs(body_raw, keep_blank_values=True)
        flat: Dict[str, Any] = {}
        for k, v in parsed.items():
            flat[k] = v[0] if len(v) == 1 else v
        nested: Dict[str, Any] = {}
        for k, v in flat.items():
            if '[' in k and k.endswith(']'):
                head, _, rest = k.partition('[')
                sub = rest[:-1]
                nested.setdefault(head, {})[sub] = v
            else:
                nested[k] = v
        return nested

    try:
        return json.loads(body_raw or '{}')
    except Exception:
        return {}


def _get_payload(body: Dict[str, Any]) -> Dict[str, Any]:
    if 'data' in body and isinstance(body['data'], dict):
        return body['data']
    return body


def _find_user_by_bitrix_id(conn, bitrix_user_id: str) -> Optional[Dict[str, Any]]:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT u.id, u.full_name, u.bitrix_id, u.is_active
        FROM {SCHEMA}.users u
        WHERE u.bitrix_id = %s AND u.is_active = true
        LIMIT 1
    """, (str(bitrix_user_id),))
    row = cur.fetchone()
    cur.close()
    return dict(row) if row else None


def _user_has_role(conn, user_id: int, role_names) -> bool:
    cur = conn.cursor()
    placeholders = ','.join(['%s'] * len(role_names))
    cur.execute(
        f"""
        SELECT COUNT(*) FROM {SCHEMA}.user_roles ur
        JOIN {SCHEMA}.roles r ON ur.role_id = r.id
        WHERE ur.user_id = %s AND r.name IN ({placeholders})
        """,
        (user_id, *role_names),
    )
    has = (cur.fetchone() or [0])[0] > 0
    cur.close()
    return has


def _send_bot_text(bitrix_user_id: str, text: str) -> None:
    """Простое текстовое сообщение пользователю в Битрикс (без кнопок)."""
    webhook_url = os.environ.get('BITRIX_WEBHOOK_URL', '').rstrip('/')
    if not webhook_url or not bitrix_user_id:
        return
    bot_id = os.environ.get('BITRIX_BOT_ID', '')
    bot_client_id = os.environ.get('BITRIX_BOT_CLIENT_ID', '')

    if bot_id:
        url = f'{webhook_url}/imbot.message.add.json'
        attempts = []
        base_payload = {'BOT_ID': bot_id, 'DIALOG_ID': str(bitrix_user_id), 'MESSAGE': text}
        if bot_client_id:
            attempts.append({**base_payload, 'CLIENT_ID': bot_client_id})
        attempts.append(base_payload)
        for payload in attempts:
            try:
                data = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
                resp = urllib.request.urlopen(req, timeout=10)
                result = json.loads(resp.read().decode())
                if result.get('result'):
                    return
            except Exception as e:
                log(f'[CALLBACK] imbot.message.add reply failed: {e}')

    try:
        data = json.dumps({'DIALOG_ID': str(bitrix_user_id), 'MESSAGE': text, 'SYSTEM': 'N'}).encode('utf-8')
        req = urllib.request.Request(f'{webhook_url}/im.message.add.json', data=data, headers={'Content-Type': 'application/json'}, method='POST')
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        log(f'[CALLBACK] im.message.add reply failed: {e}')


def _payment_summary(conn, payment_id: int) -> str:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT p.id, p.amount, s.name AS service_name
        FROM {SCHEMA}.payments p
        LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
        WHERE p.id = %s
    """, (payment_id,))
    row = cur.fetchone()
    cur.close()
    if not row:
        return f'Платёж №{payment_id}'
    try:
        amount = f"{float(row['amount']):,.0f}".replace(',', ' ') + ' ₽'
    except Exception:
        amount = str(row['amount']) + ' ₽'
    return f"«{row['service_name'] or 'Платёж'}» №{row['id']} на {amount}"


def _approve_or_reject(conn, payment_id: int, user_id: int, action: str) -> Dict[str, Any]:
    """Меняет статус платежа и пишет запись в approvals. Возвращает dict со статусом действия."""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT id, status FROM {SCHEMA}.payments WHERE id = %s", (payment_id,))
    payment = cur.fetchone()
    if not payment:
        cur.close()
        return {'ok': False, 'reason': 'not_found'}

    current_status = str(payment['status'] or '')
    if current_status in ('approved', 'rejected'):
        cur.close()
        return {'ok': False, 'reason': 'already', 'status': current_status}
    if not current_status.startswith('pending_'):
        cur.close()
        return {'ok': False, 'reason': 'wrong_status', 'status': current_status}

    moscow_tz = ZoneInfo('Europe/Moscow')
    now_moscow = datetime.now(moscow_tz).replace(tzinfo=None)

    if action == 'approve':
        cur.execute(f"""
            UPDATE {SCHEMA}.payments
            SET status = 'approved',
                ceo_approved_at = %s,
                ceo_approved_by = %s,
                submitted_at = CASE WHEN submitted_at IS NULL THEN %s ELSE submitted_at END
            WHERE id = %s
        """, (now_moscow, user_id, now_moscow, payment_id))
        action_label = 'approve'
        comment_text = 'Согласовано через Битрикс'
    else:
        cur.execute(
            f"UPDATE {SCHEMA}.payments SET status = 'rejected' WHERE id = %s",
            (payment_id,),
        )
        action_label = 'reject'
        comment_text = 'Отклонено через Битрикс'

    cur.execute(f"""
        INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (payment_id, user_id, 'ceo', action_label, comment_text, now_moscow))
    conn.commit()
    cur.close()
    return {'ok': True}


def _add_payment_comment(conn, payment_id: int, user_id: int, text: str) -> None:
    if not text or not text.strip():
        return
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.payment_comments (payment_id, user_id, comment_text)
        VALUES (%s, %s, %s)
    """, (payment_id, user_id, text.strip()))
    conn.commit()
    cur.close()


def _find_link_by_message_id(conn, bitrix_user_id: str, message_id: str) -> Optional[Dict[str, Any]]:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT payment_id, purpose
        FROM {SCHEMA}.bitrix_message_links
        WHERE bitrix_user_id = %s AND bitrix_message_id = %s
        LIMIT 1
    """, (str(bitrix_user_id), str(message_id)))
    row = cur.fetchone()
    cur.close()
    return dict(row) if row else None


def _pop_pending_comment(conn, bitrix_user_id: str) -> Optional[Dict[str, Any]]:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT id, user_id, payment_id
        FROM {SCHEMA}.bitrix_pending_comments
        WHERE bitrix_user_id = %s AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1
    """, (str(bitrix_user_id),))
    row = cur.fetchone()
    if not row:
        cur.close()
        return None
    cur.execute(
        f"DELETE FROM {SCHEMA}.bitrix_pending_comments WHERE id = %s",
        (row['id'],),
    )
    conn.commit()
    cur.close()
    return dict(row)


def _set_pending_comment(conn, bitrix_user_id: str, user_id: int, payment_id: int) -> None:
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.bitrix_pending_comments (bitrix_user_id, user_id, payment_id, expires_at)
        VALUES (%s, %s, %s, CURRENT_TIMESTAMP + INTERVAL '30 minutes')
        ON CONFLICT (bitrix_user_id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            payment_id = EXCLUDED.payment_id,
            created_at = CURRENT_TIMESTAMP,
            expires_at = CURRENT_TIMESTAMP + INTERVAL '30 minutes'
    """, (str(bitrix_user_id), user_id, payment_id))
    conn.commit()
    cur.close()


def _extract_payment_id_from_params(params: Any) -> Optional[int]:
    if isinstance(params, dict):
        v = params.get('payment_id') or params.get('PAYMENT_ID')
        if v is not None:
            try:
                return int(v)
            except Exception:
                return None
    if isinstance(params, str):
        for part in params.split('&'):
            if '=' in part:
                k, val = part.split('=', 1)
                if k.strip().lower() == 'payment_id':
                    try:
                        return int(val.strip())
                    except Exception:
                        return None
    return None


def handle_command_event(conn, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Обрабатывает нажатие кнопки (COMMAND) в сообщении Битрикса."""
    command = (payload.get('COMMAND') or payload.get('command') or '').strip().lower()
    params_raw = payload.get('COMMAND_PARAMS') or payload.get('command_params') or payload.get('PARAMS')
    payment_id = _extract_payment_id_from_params(params_raw)
    bitrix_user_id = str(payload.get('USER_ID') or payload.get('FROM_USER_ID') or payload.get('user_id') or '')

    log(f'[CALLBACK] command keys={list(payload.keys())[:20]} command={command!r} payment_id={payment_id} user={bitrix_user_id!r} params_raw={params_raw!r}')

    if not bitrix_user_id or not command or not payment_id:
        return response(200, {'ok': False, 'reason': 'missing_fields'})

    user = _find_user_by_bitrix_id(conn, bitrix_user_id)
    if not user:
        _send_bot_text(bitrix_user_id, 'Вы не привязаны к системе финансов. Действие не выполнено.')
        return response(200, {'ok': False, 'reason': 'no_user'})

    if not _user_has_role(conn, user['id'], ('CEO', 'Генеральный директор', 'Администратор', 'Admin')):
        _send_bot_text(bitrix_user_id, 'У вас нет прав на согласование платежей.')
        return response(200, {'ok': False, 'reason': 'forbidden'})

    summary = _payment_summary(conn, payment_id)

    if command == 'approve':
        result = _approve_or_reject(conn, payment_id, user['id'], 'approve')
        if not result['ok'] and result.get('reason') == 'already':
            _send_bot_text(bitrix_user_id, f'Платёж уже обработан ранее: {summary}.')
        elif not result['ok']:
            _send_bot_text(bitrix_user_id, f'Не удалось согласовать {summary}.')
        else:
            _send_bot_text(bitrix_user_id, f'✅ Согласовано: {summary}.')
        return response(200, {'ok': result.get('ok', False)})

    if command == 'reject':
        result = _approve_or_reject(conn, payment_id, user['id'], 'reject')
        if not result['ok'] and result.get('reason') == 'already':
            _send_bot_text(bitrix_user_id, f'Платёж уже обработан ранее: {summary}.')
        elif not result['ok']:
            _send_bot_text(bitrix_user_id, f'Не удалось отклонить {summary}.')
        else:
            _send_bot_text(bitrix_user_id, f'❌ Отклонено: {summary}.')
        return response(200, {'ok': result.get('ok', False)})

    if command == 'comment':
        _set_pending_comment(conn, bitrix_user_id, user['id'], payment_id)
        _send_bot_text(
            bitrix_user_id,
            f'💬 Напишите комментарий следующим сообщением — он будет добавлен к {summary}.',
        )
        return response(200, {'ok': True})

    return response(200, {'ok': False, 'reason': 'unknown_command'})


def handle_message_event(conn, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Обрабатывает текстовое сообщение пользователя боту (reply или ожидание комментария)."""
    bitrix_user_id = str(
        payload.get('FROM_USER_ID')
        or payload.get('USER_ID')
        or payload.get('user_id')
        or ''
    )
    message_text = (payload.get('MESSAGE') or payload.get('message') or '').strip()

    reply_to_id = payload.get('REPLY_ID')
    params = payload.get('PARAMS')
    if not reply_to_id and isinstance(params, dict):
        reply_to_id = params.get('REPLY_ID') or params.get('REPLY_TO_ID')

    if not bitrix_user_id or not message_text:
        return response(200, {'ok': False, 'reason': 'empty'})

    user = _find_user_by_bitrix_id(conn, bitrix_user_id)
    if not user:
        return response(200, {'ok': False, 'reason': 'no_user'})

    pending = _pop_pending_comment(conn, bitrix_user_id)
    if pending:
        payment_id = pending['payment_id']
        _add_payment_comment(conn, payment_id, user['id'], message_text)
        summary = _payment_summary(conn, payment_id)
        _send_bot_text(bitrix_user_id, f'💬 Комментарий добавлен к {summary}.')
        return response(200, {'ok': True, 'mode': 'pending_comment'})

    if reply_to_id:
        link = _find_link_by_message_id(conn, bitrix_user_id, str(reply_to_id))
        if link:
            payment_id = link['payment_id']
            _add_payment_comment(conn, payment_id, user['id'], message_text)
            summary = _payment_summary(conn, payment_id)
            _send_bot_text(bitrix_user_id, f'💬 Комментарий добавлен к {summary}.')
            return response(200, {'ok': True, 'mode': 'reply'})

    return response(200, {'ok': True, 'mode': 'ignored'})


def handler(event: dict, context) -> dict:
    """
    Вебхук от Битрикс24 для обработки нажатий кнопок и ответных сообщений CEO
    на уведомления о согласовании платежей.

    Принимает события:
    - ONIMCOMMANDADD / command — нажатие кнопки (approve / reject / comment)
    - ONIMBOTMESSAGEADD / message — текстовое сообщение пользователя
    """
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return response(200, {})

    body = _parse_event_body(event)
    event_name = (body.get('event') or body.get('EVENT') or '').upper()
    payload = _get_payload(body)

    log(f'[CALLBACK] event={event_name} keys={list(body.keys())[:10]} payload_keys={list(payload.keys())[:20] if isinstance(payload, dict) else payload}')

    conn = psycopg2.connect(DSN)
    try:
        is_command = (
            event_name in ('ONIMCOMMANDADD', 'ONAPPCOMMANDADD')
            or 'COMMAND' in payload
            or 'command' in payload
        )
        if is_command:
            return handle_command_event(conn, payload)

        is_message = event_name in ('ONIMBOTMESSAGEADD', 'ONIMBOTMESSAGEUPDATE') or 'MESSAGE' in payload
        if is_message:
            return handle_message_event(conn, payload)

        return response(200, {'ok': True, 'ignored': True})
    except Exception as e:
        import traceback
        log(f'[CALLBACK] handler error: {e}\n{traceback.format_exc()}')
        return response(200, {'ok': False, 'error': str(e)})
    finally:
        try:
            conn.close()
        except Exception:
            pass