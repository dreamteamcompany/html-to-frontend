"""API для уведомлений о платежах"""
import json
import os
from typing import Dict, Any
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61788166_html_to_frontend'
DSN = os.environ['DATABASE_URL']


def make_response(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def verify_token(event: Dict[str, Any]) -> tuple:
    headers = event.get('headers', {})
    token = (
        headers.get('X-Auth-Token') or
        headers.get('x-auth-token') or
        headers.get('X-Authorization') or
        headers.get('x-authorization', '')
    )
    if token:
        token = token.replace('Bearer ', '').strip()
    if not token:
        return None, make_response(401, {'error': 'Unauthorized'})
    try:
        secret = os.environ.get('JWT_SECRET', '')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, make_response(401, {'error': 'Token expired'})
    except jwt.InvalidTokenError:
        return None, make_response(401, {'error': 'Invalid token'})


def handler(event: dict, context) -> dict:
    """
    API уведомлений о платежах.

    GET  / — список уведомлений текущего пользователя + unread_count
    PUT  / — отметить прочитанным: { notification_ids: [id, ...] } или { mark_all: true }
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return make_response(200, {})

    payload, error = verify_token(event)
    if error:
        return error

    user_id = payload['user_id']
    conn = psycopg2.connect(DSN)

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if method == 'GET':
            cur.execute(f"""
                SELECT
                    n.id,
                    n.user_id,
                    n.ticket_id,
                    n.payment_id,
                    n.type,
                    n.message,
                    n.is_read,
                    n.created_at,
                    n.metadata
                FROM {SCHEMA}.notifications n
                WHERE n.user_id = %s
                ORDER BY n.created_at DESC
                LIMIT 50
            """, (user_id,))
            rows = cur.fetchall()
            notifications = []
            for row in rows:
                item = dict(row)
                notifications.append(item)

            cur.execute(f"""
                SELECT COUNT(*) AS cnt
                FROM {SCHEMA}.notifications
                WHERE user_id = %s AND is_read = false
            """, (user_id,))
            unread_count = cur.fetchone()['cnt']
            cur.close()

            return make_response(200, {
                'notifications': notifications,
                'unread_count': unread_count,
            })

        elif method == 'PUT':
            body_raw = event.get('body') or '{}'
            try:
                body = json.loads(body_raw)
            except Exception:
                body = {}

            mark_all = body.get('mark_all', False)
            notification_ids = body.get('notification_ids', [])

            if mark_all:
                cur.execute(f"""
                    UPDATE {SCHEMA}.notifications
                    SET is_read = true
                    WHERE user_id = %s AND is_read = false
                """, (user_id,))
                conn.commit()
                cur.close()
                return make_response(200, {'message': 'Все уведомления прочитаны'})

            if notification_ids:
                ids_tuple = tuple(int(i) for i in notification_ids)
                if len(ids_tuple) == 1:
                    cur.execute(f"""
                        UPDATE {SCHEMA}.notifications
                        SET is_read = true
                        WHERE id = %s AND user_id = %s
                    """, (ids_tuple[0], user_id))
                else:
                    cur.execute(f"""
                        UPDATE {SCHEMA}.notifications
                        SET is_read = true
                        WHERE id = ANY(%s) AND user_id = %s
                    """, (list(ids_tuple), user_id))
                conn.commit()
                cur.close()
                return make_response(200, {'message': 'Уведомления прочитаны'})

            cur.close()
            return make_response(400, {'error': 'Укажите notification_ids или mark_all'})

        return make_response(405, {'error': 'Method not allowed'})

    finally:
        conn.close()
