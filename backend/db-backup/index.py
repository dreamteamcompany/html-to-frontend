import json
import os
import sys
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo
import base64

SCHEMA = 't_p61788166_html_to_frontend'

TABLES_ORDER = [
    'departments',
    'permissions',
    'roles',
    'role_permissions',
    'users',
    'user_roles',
    'categories',
    'contractors',
    'customer_departments',
    'legal_entities',
    'custom_fields',
    'saving_reasons',
    'services',
    'service_balances',
    'site_settings',
    'ticket_categories',
    'ticket_priorities',
    'ticket_statuses',
    'ticket_service_categories',
    'tickets',
    'ticket_comments',
    'ticket_custom_fields',
    'ticket_custom_field_values',
    'ticket_approvals',
    'comment_attachments',
    'comment_reactions',
    'payments',
    'approvals',
    'custom_field_values',
    'notifications',
    'payment_comments',
    'comment_likes',
    'payment_custom_field_values',
    'payment_custom_values',
    'payment_documents',
    'payment_views',
    'planned_payments',
    'planned_payment_custom_field_values',
    'savings',
    'audit_logs',
    'log_files',
    'log_entries',
    'log_statistics',
    'login_attempts',
    'push_subscriptions',
    'dashboard_layouts',
    'webauthn_challenges',
    'webauthn_credentials',
]

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

def verify_admin(event):
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return None
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None
    try:
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except Exception:
        return None

def check_admin_permission(conn, user_id):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT r.name FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s AND r.name IN ('Администратор', 'Admin')
    """, (user_id,))
    admin_roles = cur.fetchall()
    if len(admin_roles) > 0:
        cur.close()
        return True
    cur.execute(f"""
        SELECT DISTINCT p.name FROM {SCHEMA}.permissions p
        JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id
        JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s AND p.name IN ('settings.write', 'roles.write')
    """, (user_id,))
    perms = cur.fetchall()
    cur.close()
    return len(perms) > 0

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, bytes):
        return base64.b64encode(obj).decode('utf-8')
    if isinstance(obj, memoryview):
        return base64.b64encode(bytes(obj)).decode('utf-8')
    return str(obj)

def get_existing_tables(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = %s AND table_type = 'BASE TABLE'
    """, (SCHEMA,))
    existing = {row[0] for row in cur.fetchall()}
    cur.close()
    return existing

def log_backup_action(conn, user_id, username, action, metadata=None):
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.audit_logs
        (entity_type, entity_id, action, user_id, username, metadata, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
    """, ('backup', 0, action, user_id, username, json.dumps(metadata or {})))
    conn.commit()
    cur.close()

def get_last_backup_info(conn):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT action, username, created_at, metadata
        FROM {SCHEMA}.audit_logs
        WHERE entity_type = 'backup'
        ORDER BY created_at DESC LIMIT 5
    """)
    rows = cur.fetchall()
    cur.close()
    return [dict(r) for r in rows]

def handle_export(conn, user_id=None, username=None):
    existing = get_existing_tables(conn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    backup = {
        'version': '1.0',
        'created_at': datetime.now(ZoneInfo('Europe/Moscow')).isoformat(),
        'schema': SCHEMA,
        'tables': {}
    }
    total_rows = 0
    for table in TABLES_ORDER:
        if table not in existing:
            continue
        cur.execute(f'SELECT * FROM {SCHEMA}."{table}" ORDER BY 1')
        rows = cur.fetchall()
        backup['tables'][table] = [dict(row) for row in rows]
        total_rows += len(rows)
    cur.close()
    if user_id:
        log_backup_action(conn, user_id, username, 'export', {'tables': len(backup['tables']), 'rows': total_rows})
    return response(200, backup)

def handle_import(conn, event, user_id=None, username=None):
    body = json.loads(event.get('body', '{}'))
    backup_data = body.get('backup')
    if not backup_data:
        return response(400, {'error': 'Отсутствуют данные бэкапа'})

    if not isinstance(backup_data, dict) or 'tables' not in backup_data:
        return response(400, {'error': 'Некорректный формат бэкапа'})

    existing = get_existing_tables(conn)
    cur = conn.cursor()

    try:
        cur.execute('BEGIN')

        reversed_tables = list(reversed(TABLES_ORDER))
        for table in reversed_tables:
            if table not in existing:
                continue
            cur.execute(f'DELETE FROM {SCHEMA}."{table}"')

        tables_restored = 0
        rows_restored = 0

        for table in TABLES_ORDER:
            if table not in existing:
                continue
            rows = backup_data['tables'].get(table, [])
            if not rows:
                continue

            columns = list(rows[0].keys())
            cols_str = ', '.join(f'"{c}"' for c in columns)
            placeholders = ', '.join(['%s'] * len(columns))

            for row in rows:
                values = []
                for c in columns:
                    v = row.get(c)
                    values.append(v)
                cur.execute(
                    f'INSERT INTO {SCHEMA}."{table}" ({cols_str}) VALUES ({placeholders})',
                    values
                )

            tables_restored += 1
            rows_restored += len(rows)

        for table in TABLES_ORDER:
            if table not in existing:
                continue
            cur.execute(f"""
                SELECT column_name FROM information_schema.columns
                WHERE table_schema = '{SCHEMA}' AND table_name = '{table}'
                AND column_default LIKE 'nextval%%'
            """)
            seq_cols = cur.fetchall()
            for (col_name,) in seq_cols:
                cur.execute(f"""
                    SELECT setval(
                        pg_get_serial_sequence('{SCHEMA}."{table}"', '{col_name}'),
                        COALESCE((SELECT MAX("{col_name}") FROM {SCHEMA}."{table}"), 0) + 1,
                        false
                    )
                """)

        cur.execute('COMMIT')

        if user_id:
            log_backup_action(conn, user_id, username, 'import', {'tables': tables_restored, 'rows': rows_restored})

        return response(200, {
            'success': True,
            'tables_restored': tables_restored,
            'rows_restored': rows_restored,
        })

    except Exception as e:
        cur.execute('ROLLBACK')
        log(f"Import error: {e}")
        return response(500, {'error': f'Ошибка восстановления: {str(e)}'})
    finally:
        cur.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Резервное копирование и восстановление базы данных"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return response(200, {})

    payload = verify_admin(event)
    if not payload:
        return response(401, {'error': 'Требуется авторизация'})

    conn = get_db_connection()
    try:
        if not check_admin_permission(conn, payload['user_id']):
            return response(403, {'error': 'Недостаточно прав'})

        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'export')
        user_id = payload.get('user_id')
        username = payload.get('username', '')

        if method == 'GET' and action == 'history':
            history = get_last_backup_info(conn)
            return response(200, {'history': history})
        elif method == 'GET' and action == 'export':
            return handle_export(conn, user_id, username)
        elif method == 'POST' and action == 'import':
            return handle_import(conn, event, user_id, username)
        else:
            return response(400, {'error': 'Неизвестное действие'})
    finally:
        conn.close()