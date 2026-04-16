"""Автоматическое резервное копирование БД в S3 и управление расписанием"""
import json
import os
import sys
import jwt
import psycopg2
import boto3
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo
import base64

SCHEMA = 't_p61788166_html_to_frontend'

TABLES_ORDER = [
    'departments', 'permissions', 'roles', 'role_permissions',
    'users', 'user_roles', 'categories', 'contractors',
    'customer_departments', 'legal_entities', 'custom_fields',
    'saving_reasons', 'services', 'service_balances', 'site_settings',
    'ticket_categories', 'ticket_priorities', 'ticket_statuses',
    'ticket_service_categories', 'tickets', 'ticket_comments',
    'ticket_custom_fields', 'ticket_custom_field_values',
    'ticket_approvals', 'comment_attachments', 'comment_reactions',
    'payments', 'approvals', 'custom_field_values', 'notifications',
    'payment_comments', 'comment_likes', 'payment_custom_field_values',
    'payment_custom_values', 'payment_documents', 'payment_views',
    'planned_payments', 'planned_payment_custom_field_values',
    'savings', 'audit_logs', 'log_files', 'log_entries',
    'log_statistics', 'login_attempts', 'push_subscriptions',
    'dashboard_layouts', 'webauthn_challenges', 'webauthn_credentials',
]

def log(msg):
    print(msg, file=sys.stderr, flush=True)

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

def verify_admin(event):
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return None
    secret = os.environ.get('JWT_SECRET')
    if not secret:
        return None
    try:
        return jwt.decode(token, secret, algorithms=['HS256'])
    except Exception:
        return None

def check_admin(conn, user_id):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT r.name FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s AND r.name IN ('Администратор', 'Admin')
    """, (user_id,))
    if cur.fetchall():
        cur.close()
        return True
    cur.execute(f"""
        SELECT DISTINCT p.name FROM {SCHEMA}.permissions p
        JOIN {SCHEMA}.role_permissions rp ON p.id = rp.permission_id
        JOIN {SCHEMA}.user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = %s AND p.name IN ('settings.write', 'roles.write')
    """, (user_id,))
    result = len(cur.fetchall()) > 0
    cur.close()
    return result

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (bytes, memoryview)):
        return base64.b64encode(bytes(obj)).decode('utf-8')
    return str(obj)

def get_setting(conn, key):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT value FROM {SCHEMA}.site_settings WHERE key = %s", (key,))
    row = cur.fetchone()
    cur.close()
    return row['value'] if row else None

def set_setting(conn, key, value):
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.site_settings (key, value) VALUES (%s, %s)
        ON CONFLICT (key) DO UPDATE SET value = %s
    """, (key, value, value))
    conn.commit()
    cur.close()

def get_existing_tables(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = %s AND table_type = 'BASE TABLE'
    """, (SCHEMA,))
    existing = {row[0] for row in cur.fetchall()}
    cur.close()
    return existing

def create_backup_data(conn):
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
    return backup, total_rows

def save_to_s3(backup_data):
    s3 = get_s3()
    now = datetime.now(ZoneInfo('Europe/Moscow'))
    filename = f"backups/backup_{now.strftime('%Y-%m-%d_%H-%M-%S')}.json"
    body = json.dumps(backup_data, ensure_ascii=False, default=json_serial)
    s3.put_object(
        Bucket='files',
        Key=filename,
        Body=body.encode('utf-8'),
        ContentType='application/json',
    )
    size_mb = round(len(body.encode('utf-8')) / (1024 * 1024), 2)
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
    return filename, cdn_url, size_mb

def log_action(conn, action, username, metadata):
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.audit_logs
        (entity_type, entity_id, action, user_id, username, metadata, created_at)
        VALUES ('backup', 0, %s, NULL, %s, %s, NOW())
    """, (action, username or 'system', json.dumps(metadata)))
    conn.commit()
    cur.close()

def list_s3_backups():
    s3 = get_s3()
    try:
        resp = s3.list_objects_v2(Bucket='files', Prefix='backups/')
    except Exception:
        return []
    if 'Contents' not in resp:
        return []
    aws_key = os.environ['AWS_ACCESS_KEY_ID']
    backups = []
    for obj in sorted(resp['Contents'], key=lambda x: x['LastModified'], reverse=True):
        key = obj['Key']
        if not key.endswith('.json'):
            continue
        name = key.replace('backups/', '')
        size_mb = round(obj['Size'] / (1024 * 1024), 2)
        cdn_url = f"https://cdn.poehali.dev/projects/{aws_key}/bucket/{key}"
        backups.append({
            'key': key,
            'name': name,
            'size_mb': size_mb,
            'created_at': obj['LastModified'].isoformat(),
            'url': cdn_url,
        })
    return backups[:20]

def delete_s3_backup(key):
    s3 = get_s3()
    s3.delete_object(Bucket='files', Key=key)

def handle_run_backup(conn, username=None):
    backup_data, total_rows = create_backup_data(conn)
    filename, cdn_url, size_mb = save_to_s3(backup_data)
    log_action(conn, 'auto_export', username, {
        'tables': len(backup_data['tables']),
        'rows': total_rows,
        'file': filename,
        'size_mb': size_mb,
    })
    set_setting(conn, 'last_auto_backup', datetime.now(ZoneInfo('Europe/Moscow')).isoformat())
    return response(200, {
        'success': True,
        'file': filename,
        'url': cdn_url,
        'size_mb': size_mb,
        'tables': len(backup_data['tables']),
        'rows': total_rows,
    })

def handle_get_settings(conn):
    schedule = get_setting(conn, 'backup_schedule') or 'off'
    last_auto = get_setting(conn, 'last_auto_backup')
    backups = list_s3_backups()
    return response(200, {
        'schedule': schedule,
        'last_auto_backup': last_auto,
        'backups': backups,
    })

def handle_save_settings(conn, event):
    body = json.loads(event.get('body', '{}'))
    schedule = body.get('schedule')
    if schedule not in ('off', 'daily', 'weekly', 'monthly'):
        return response(400, {'error': 'Некорректное расписание'})
    set_setting(conn, 'backup_schedule', schedule)
    return response(200, {'success': True, 'schedule': schedule})

def handle_trigger(conn):
    schedule = get_setting(conn, 'backup_schedule') or 'off'
    if schedule == 'off':
        return response(200, {'skipped': True, 'reason': 'Автобэкап отключен'})

    last_str = get_setting(conn, 'last_auto_backup')
    now = datetime.now(ZoneInfo('Europe/Moscow'))

    if last_str:
        last = datetime.fromisoformat(last_str)
        if last.tzinfo is None:
            last = last.replace(tzinfo=ZoneInfo('Europe/Moscow'))
        diff_hours = (now - last).total_seconds() / 3600
        if schedule == 'daily' and diff_hours < 23:
            return response(200, {'skipped': True, 'reason': 'Еще не прошли сутки'})
        if schedule == 'weekly' and diff_hours < 167:
            return response(200, {'skipped': True, 'reason': 'Еще не прошла неделя'})
        if schedule == 'monthly' and diff_hours < 719:
            return response(200, {'skipped': True, 'reason': 'Еще не прошел месяц'})

    return handle_run_backup(conn, 'system (auto)')

def handle_delete(conn, event):
    body = json.loads(event.get('body', '{}'))
    key = body.get('key')
    if not key or not key.startswith('backups/'):
        return response(400, {'error': 'Некорректный ключ файла'})
    delete_s3_backup(key)
    log_action(conn, 'delete_backup', 'admin', {'file': key})
    return response(200, {'success': True})

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Автоматическое резервное копирование: расписание, S3 хранение, управление копиями"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return response(200, {})

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'settings')

    if action == 'trigger':
        conn = get_db()
        try:
            return handle_trigger(conn)
        finally:
            conn.close()

    payload = verify_admin(event)
    if not payload:
        return response(401, {'error': 'Требуется авторизация'})

    conn = get_db()
    try:
        if not check_admin(conn, payload['user_id']):
            return response(403, {'error': 'Недостаточно прав'})

        username = payload.get('username', '')

        if method == 'GET' and action == 'settings':
            return handle_get_settings(conn)
        elif method == 'POST' and action == 'save':
            return handle_save_settings(conn, event)
        elif method == 'POST' and action == 'run':
            return handle_run_backup(conn, username)
        elif method == 'DELETE' and action == 'delete':
            return handle_delete(conn, event)
        else:
            return response(400, {'error': 'Неизвестное действие'})
    finally:
        conn.close()
