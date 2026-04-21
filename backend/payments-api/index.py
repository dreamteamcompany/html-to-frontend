import json
import os
import sys
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

try:
    import boto3
except Exception:
    boto3 = None

SCHEMA = 't_p61788166_html_to_frontend'

def log(msg):
    print(msg, file=sys.stderr, flush=True)

class PaymentRequest(BaseModel):
    category_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    description: str = Field(default='')
    payment_date: str = Field(default='')
    legal_entity_id: int | None = None
    contractor_id: int | None = None
    department_id: int | None = None
    service_id: int | None = None
    invoice_number: str | None = None
    invoice_date: str | None = None
    invoice_file_url: str | None = None

def response(status_code: int, data: Any) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not set')
    return psycopg2.connect(dsn)

def verify_token(event: Dict[str, Any]) -> Dict[str, Any]:
    headers = event.get('headers', {})
    # Try different case variations as cloud functions may normalize headers
    token = (headers.get('X-Auth-Token') or 
             headers.get('x-auth-token') or 
             headers.get('X-Authorization') or
             headers.get('x-authorization', ''))
    
    if token:
        token = token.replace('Bearer ', '').strip()
    
    if not token:
        return None
    
    try:
        secret = os.environ.get('JWT_SECRET')
        if not secret:
            return None
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def check_user_permission(conn, user_id: int, required_permission: str) -> bool:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT COUNT(*) as count
            FROM {SCHEMA}.user_roles ur
            JOIN {SCHEMA}.role_permissions rp ON ur.role_id = rp.role_id
            JOIN {SCHEMA}.permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = %s AND p.name = %s
        """, (user_id, required_permission))
        result = cur.fetchone()
        return result['count'] > 0
    finally:
        cur.close()

def extract_s3_key_from_url(file_url: str) -> str:
    """Извлекает S3 key из CDN-ссылки вида https://cdn.poehali.dev/projects/{KEY}/bucket/{path}"""
    if not file_url or not isinstance(file_url, str):
        return ''
    marker = '/bucket/'
    idx = file_url.find(marker)
    if idx == -1:
        return ''
    return file_url[idx + len(marker):]


def delete_from_s3(file_url: str) -> bool:
    """Удаляет файл из S3 по CDN-ссылке. Возвращает True при успехе. Ошибки не прерывают поток."""
    try:
        if not boto3:
            return False
        key = extract_s3_key_from_url(file_url)
        if not key:
            return False
        aws_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY')
        if not aws_key or not aws_secret:
            return False
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
        )
        s3.delete_object(Bucket='files', Key=key)
        return True
    except Exception as e:
        log(f'[S3 DELETE ERROR] {e}')
        return False


def derive_file_name(file_url: str, file_name: str | None) -> str:
    if file_name:
        return file_name
    raw = (file_url or '').split('/')[-1] or 'Файл'
    parts = raw.split('_')
    return '_'.join(parts[2:]) if len(parts) > 2 else raw


def fetch_payment_documents(cur, payment_id: int) -> list:
    cur.execute(
        f"""SELECT id, file_url, file_name, document_type, uploaded_at, uploaded_by
            FROM {SCHEMA}.payment_documents
            WHERE payment_id = %s
            ORDER BY uploaded_at ASC, id ASC""",
        (payment_id,)
    )
    docs = []
    for r in cur.fetchall():
        d = dict(r)
        if d.get('uploaded_at'):
            d['uploaded_at'] = d['uploaded_at'].isoformat()
        docs.append(d)
    return docs


def write_audit_approval(cur, payment_id: int, user_id: int, comment: str):
    """Пишет запись в approvals как аудит-событие по платежу."""
    cur.execute(f"""
        SELECT r.name FROM {SCHEMA}.roles r
        JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = %s LIMIT 1
    """, (user_id,))
    role_row = cur.fetchone()
    approver_role = role_row['name'] if role_row else 'Пользователь'
    try:
        import pytz
        moscow_tz = pytz.timezone('Europe/Moscow')
        now_moscow = datetime.now(moscow_tz)
    except Exception:
        now_moscow = datetime.now()
    cur.execute(
        f"""INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)""",
        (payment_id, user_id, approver_role, 'updated', comment, now_moscow)
    )


def is_admin_user(conn, user_id: int) -> bool:
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT r.name
            FROM {SCHEMA}.roles r
            JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = %s
        """, (user_id,))
        roles = [row['name'] for row in cur.fetchall()]
        return 'Администратор' in roles or 'Admin' in roles
    finally:
        cur.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления платежами (создание, чтение, обновление, удаление).
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
    except Exception as e:
        return response(500, {'error': f'Database connection failed: {str(e)}'})
    
    try:
        payload = verify_token(event)
        if not payload:
            conn.close()
            return response(401, {'error': 'Unauthorized'})
        
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            if not check_user_permission(conn, payload['user_id'], 'payments.read'):
                conn.close()
                return response(403, {'error': 'Forbidden'})
            
            is_admin = is_admin_user(conn, payload['user_id'])
            query_params = event.get('queryStringParameters') or {}
            scope = query_params.get('scope', 'my')
            
            if scope == 'all':
                # Проверяем роли: администратор, CEO или утверждающий могут видеть все платежи
                cur2 = conn.cursor(cursor_factory=RealDictCursor)
                cur2.execute(f"""
                    SELECT r.name FROM {SCHEMA}.roles r
                    JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
                    WHERE ur.user_id = %s
                """, (payload['user_id'],))
                user_roles_list = [row['name'] for row in cur2.fetchall()]
                cur2.close()
                is_ceo = 'CEO' in user_roles_list or 'Генеральный директор' in user_roles_list
                is_approver_role = check_user_permission(conn, payload['user_id'], 'approvals.read')
                has_view_all = check_user_permission(conn, payload['user_id'], 'payments.view_all')
                if not is_admin and not is_ceo and not is_approver_role and not has_view_all:
                    conn.close()
                    return response(403, {'error': 'Недостаточно прав для просмотра всех платежей'})
                where_clause = ""
                params = tuple()
            else:
                where_clause = "WHERE p.created_by = %s"
                params = (payload['user_id'],)
            
            cur.execute(f"""
                SELECT 
                    p.id, 
                    p.category_id,
                    c.name as category_name,
                    c.icon as category_icon,
                    p.amount, 
                    p.description, 
                    p.payment_date,
                    p.created_at,
                    p.legal_entity_id,
                    le.name as legal_entity_name,
                    p.contractor_id,
                    ct.name as contractor_name,
                    p.department_id,
                    cd.name as department_name,
                    p.status,
                    p.created_by,
                    u.username as created_by_name,
                    p.submitted_at,
                    p.tech_director_approved_at,
                    p.tech_director_approved_by,
                    p.ceo_approved_at,
                    p.ceo_approved_by,
                    p.service_id,
                    s.name as service_name,
                    s.description as service_description,
                    p.invoice_number,
                    p.invoice_date,
                    p.invoice_file_url,
                    p.invoice_file_uploaded_at,
                    p.payment_type,
                    p.cash_receipt_url,
                    p.cash_receipt_uploaded_at
                FROM {SCHEMA}.payments p
                LEFT JOIN {SCHEMA}.categories c ON p.category_id = c.id
                LEFT JOIN {SCHEMA}.legal_entities le ON p.legal_entity_id = le.id
                LEFT JOIN {SCHEMA}.contractors ct ON p.contractor_id = ct.id
                LEFT JOIN {SCHEMA}.customer_departments cd ON p.department_id = cd.id
                LEFT JOIN {SCHEMA}.users u ON p.created_by = u.id
                LEFT JOIN {SCHEMA}.services s ON p.service_id = s.id
                {where_clause}
                ORDER BY p.payment_date DESC
            """, params)
            rows = cur.fetchall()
            payments = []

            payment_ids = [row['id'] for row in rows]
            custom_fields_map = {}
            documents_map = {}
            cash_receipts_map = {}
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

                cur.execute(f"""
                    SELECT id, payment_id, file_url, file_name, uploaded_at
                    FROM {SCHEMA}.payment_cash_receipts
                    WHERE payment_id IN ({ids_placeholder})
                    ORDER BY uploaded_at ASC, id ASC
                """, tuple(payment_ids))
                for r_row in cur.fetchall():
                    rd = dict(r_row)
                    pid = rd.pop('payment_id')
                    if rd.get('uploaded_at'):
                        rd['uploaded_at'] = rd['uploaded_at'].isoformat()
                    cash_receipts_map.setdefault(pid, []).append(rd)

            for row in rows:
                payment = dict(row)
                payment['amount'] = float(payment['amount'])
                
                if payment['payment_date']:
                    payment['payment_date'] = payment['payment_date'].isoformat()
                if payment['created_at']:
                    payment['created_at'] = payment['created_at'].isoformat()
                if payment['submitted_at']:
                    payment['submitted_at'] = payment['submitted_at'].isoformat()
                if payment['tech_director_approved_at']:
                    payment['tech_director_approved_at'] = payment['tech_director_approved_at'].isoformat()
                if payment['ceo_approved_at']:
                    payment['ceo_approved_at'] = payment['ceo_approved_at'].isoformat()
                if payment['invoice_date']:
                    payment['invoice_date'] = payment['invoice_date'].isoformat()
                if payment.get('invoice_file_uploaded_at'):
                    payment['invoice_file_uploaded_at'] = payment['invoice_file_uploaded_at'].isoformat()
                if payment.get('cash_receipt_uploaded_at'):
                    payment['cash_receipt_uploaded_at'] = payment['cash_receipt_uploaded_at'].isoformat()
                
                payment['custom_fields'] = custom_fields_map.get(payment['id'], [])
                payment['documents'] = documents_map.get(payment['id'], [])
                payment['cash_receipts'] = cash_receipts_map.get(payment['id'], [])
                payments.append(payment)
            
            cur.close()
            conn.close()
            return response(200, payments)
        
        elif method == 'POST':
            if not check_user_permission(conn, payload['user_id'], 'payments.create'):
                conn.close()
                return response(403, {'error': 'Forbidden'})
            
            try:
                body = json.loads(event.get('body', '{}'))
                pay_req = PaymentRequest(**body)
            except Exception as e:
                conn.close()
                return response(400, {'error': f'Validation error: {str(e)}'})
            
            # Приоритет: payment_date из запроса → invoice_date → текущая дата
            payment_date = pay_req.payment_date or pay_req.invoice_date or datetime.now().strftime('%Y-%m-%d')
            
            cur.execute(
                f"""SELECT name FROM {SCHEMA}.categories WHERE id = %s""",
                (pay_req.category_id,)
            )
            category = cur.fetchone()
            if not category:
                cur.close()
                conn.close()
                return response(400, {'error': 'Category not found'})
            
            category_name = category['name']
            
            file_uploaded_at = datetime.now().isoformat() if pay_req.invoice_file_url else None
            cur.execute(
                f"""INSERT INTO {SCHEMA}.payments (category, category_id, amount, description, payment_date, legal_entity_id, contractor_id, department_id, service_id, invoice_number, invoice_date, invoice_file_url, invoice_file_uploaded_at, created_by, status) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'draft') 
                   RETURNING id, category_id, amount, description, payment_date, created_at, legal_entity_id, contractor_id, department_id, service_id, invoice_number, invoice_date, invoice_file_url, invoice_file_uploaded_at, status, created_by""",
                (category_name, pay_req.category_id, pay_req.amount, pay_req.description, payment_date, 
                 pay_req.legal_entity_id, pay_req.contractor_id, pay_req.department_id, pay_req.service_id, 
                 pay_req.invoice_number, pay_req.invoice_date, pay_req.invoice_file_url, file_uploaded_at, payload['user_id'])
            )
            row = cur.fetchone()
            payment_id = row['id']
            
            custom_fields_data = body.get('custom_fields', {})
            if custom_fields_data:
                for field_id_str, field_value in custom_fields_data.items():
                    field_id = int(field_id_str)
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.custom_field_values (payment_id, custom_field_id, value) VALUES (%s, %s, %s)",
                        (payment_id, field_id, str(field_value))
                    )
            
            if pay_req.invoice_file_url:
                raw_name = pay_req.invoice_file_url.split('/')[-1]
                parts = raw_name.split('_')
                file_name = '_'.join(parts[2:]) if len(parts) > 2 else raw_name
                cur.execute(
                    f"INSERT INTO {SCHEMA}.payment_documents (payment_id, file_name, file_url, document_type, uploaded_at, uploaded_by) VALUES (%s, %s, %s, 'invoice', %s, %s)",
                    (payment_id, file_name, pay_req.invoice_file_url, file_uploaded_at, payload['user_id'])
                )
            
            conn.commit()
            
            result = dict(row)
            result['amount'] = float(result['amount'])
            if result['payment_date']:
                result['payment_date'] = result['payment_date'].isoformat()
            if result['created_at']:
                result['created_at'] = result['created_at'].isoformat()
            if result.get('invoice_date'):
                result['invoice_date'] = result['invoice_date'].isoformat()
            if result.get('invoice_file_uploaded_at'):
                result['invoice_file_uploaded_at'] = result['invoice_file_uploaded_at'].isoformat()
            
            cur.close()
            conn.close()
            return response(200, result)
        
        elif method == 'PUT':
            if not check_user_permission(conn, payload['user_id'], 'payments.update'):
                conn.close()
                return response(403, {'error': 'Forbidden'})
            
            try:
                body = json.loads(event.get('body', '{}'))
                payment_id = body.get('payment_id') or body.get('id')
                
                # Извлекаем ID из пути, если он есть
                path = event.get('path', '')
                if not payment_id and '/' in path:
                    path_parts = path.rstrip('/').split('/')
                    if path_parts[-1].isdigit():
                        payment_id = int(path_parts[-1])
                
                if not payment_id:
                    conn.close()
                    return response(400, {'error': 'Payment ID is required'})

                # Проверяем ownership платежа (только создатель или администратор)
                is_admin = is_admin_user(conn, payload['user_id'])
                cur.execute(f'SELECT created_by, status FROM {SCHEMA}.payments WHERE id = %s', (payment_id,))
                existing_payment = cur.fetchone()
                if not existing_payment:
                    cur.close()
                    conn.close()
                    return response(404, {'error': 'Платёж не найден'})
                if not is_admin and existing_payment['created_by'] != payload['user_id']:
                    cur.close()
                    conn.close()
                    return response(403, {'error': 'Вы можете редактировать только свои платежи'})

                # Если передан только статус, обновляем только его
                if 'status' in body and len(body) <= 2:  # payment_id/id + status
                    new_status = body.get('status')
                    cur.execute(
                        f"""UPDATE {SCHEMA}.payments SET status = %s WHERE id = %s""",
                        (new_status, payment_id)
                    )
                    conn.commit()
                    cur.close()
                    conn.close()
                    return response(200, {'success': True, 'payment_id': payment_id})

                # Полное обновление платежа
                pay_req = PaymentRequest(**body)
            except Exception as e:
                conn.close()
                return response(400, {'error': f'Validation error: {str(e)}'})
            
            cur.execute(
                f"""SELECT name FROM {SCHEMA}.categories WHERE id = %s""",
                (pay_req.category_id,)
            )
            category = cur.fetchone()
            if not category:
                cur.close()
                conn.close()
                return response(400, {'error': 'Category not found'})
            
            category_name = category['name']
            
            # Приоритет: payment_date из запроса → invoice_date → текущая дата
            update_payment_date = pay_req.payment_date or pay_req.invoice_date or datetime.now().strftime('%Y-%m-%d')
            
            file_uploaded_at = datetime.now().isoformat() if pay_req.invoice_file_url else None
            cur.execute(f"""
                UPDATE {SCHEMA}.payments 
                SET category = %s, category_id = %s, amount = %s, description = %s, 
                    payment_date = %s, legal_entity_id = %s, contractor_id = %s, 
                    department_id = %s, service_id = %s, invoice_number = %s, invoice_date = %s,
                    invoice_file_url = COALESCE(%s, invoice_file_url),
                    invoice_file_uploaded_at = COALESCE(%s, invoice_file_uploaded_at)
                WHERE id = %s
                RETURNING id, category_id, amount, description, payment_date, created_at, status, invoice_file_url, invoice_file_uploaded_at
            """, (category_name, pay_req.category_id, pay_req.amount, pay_req.description, 
                  update_payment_date, pay_req.legal_entity_id, pay_req.contractor_id, 
                  pay_req.department_id, pay_req.service_id, pay_req.invoice_number, 
                  pay_req.invoice_date, pay_req.invoice_file_url, file_uploaded_at, payment_id))
            
            row = cur.fetchone()
            if not row:
                cur.close()
                conn.close()
                return response(404, {'error': 'Payment not found'})
            
            cur.execute(f"DELETE FROM {SCHEMA}.custom_field_values WHERE payment_id = %s", (payment_id,))
            
            custom_fields_data = body.get('custom_fields', {})
            if custom_fields_data:
                for field_id_str, field_value in custom_fields_data.items():
                    field_id = int(field_id_str)
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.custom_field_values (payment_id, custom_field_id, value) VALUES (%s, %s, %s)",
                        (payment_id, field_id, str(field_value))
                    )
            
            if pay_req.invoice_file_url:
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.payment_documents WHERE payment_id = %s AND file_url = %s",
                    (payment_id, pay_req.invoice_file_url)
                )
                if not cur.fetchone():
                    raw_name = pay_req.invoice_file_url.split('/')[-1]
                    parts = raw_name.split('_')
                    file_name = '_'.join(parts[2:]) if len(parts) > 2 else raw_name
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.payment_documents (payment_id, file_name, file_url, document_type, uploaded_at, uploaded_by) VALUES (%s, %s, %s, 'invoice', %s, %s)",
                        (payment_id, file_name, pay_req.invoice_file_url, file_uploaded_at, payload['user_id'])
                    )
            
            conn.commit()
            
            result = dict(row)
            result['amount'] = float(result['amount'])
            if result['payment_date']:
                result['payment_date'] = result['payment_date'].isoformat()
            if result['created_at']:
                result['created_at'] = result['created_at'].isoformat()
            if result.get('invoice_file_uploaded_at'):
                result['invoice_file_uploaded_at'] = result['invoice_file_uploaded_at'].isoformat()
            
            cur.close()
            conn.close()
            return response(200, result)
        
        elif method == 'PATCH':
            query_params = event.get('queryStringParameters') or {}
            action = query_params.get('action')

            # Отдельное действие: работа с чеками наличного платежа (до 10 шт)
            if action == 'cash_receipt':
                try:
                    body = json.loads(event.get('body', '{}'))
                except Exception:
                    conn.close()
                    return response(400, {'error': 'Неверный формат тела запроса'})

                payment_id = body.get('payment_id')
                receipt_action = body.get('receipt_action', 'upload')  # upload | delete
                receipt_url = body.get('cash_receipt_url')
                receipt_id = body.get('receipt_id')
                file_name = body.get('file_name')

                if not payment_id:
                    conn.close()
                    return response(400, {'error': 'Не указан payment_id'})

                cur.execute(
                    f'SELECT created_by, status, payment_type FROM {SCHEMA}.payments WHERE id = %s',
                    (payment_id,)
                )
                pay_row = cur.fetchone()
                if not pay_row:
                    cur.close()
                    conn.close()
                    return response(404, {'error': 'Платёж не найден'})

                if pay_row['created_by'] != payload['user_id']:
                    cur.close()
                    conn.close()
                    return response(403, {'error': 'Чек может загружать только создатель платежа'})

                if pay_row['status'] != 'approved':
                    cur.close()
                    conn.close()
                    return response(403, {'error': 'Чек можно прикрепить только к согласованному платежу'})

                if (pay_row['payment_type'] or '').lower() != 'cash':
                    cur.close()
                    conn.close()
                    return response(403, {'error': 'Чек доступен только для наличных платежей'})

                if receipt_action == 'delete':
                    if not receipt_id:
                        cur.close()
                        conn.close()
                        return response(400, {'error': 'Не указан receipt_id'})

                    cur.execute(
                        f"SELECT id, payment_id FROM {SCHEMA}.payment_cash_receipts WHERE id = %s",
                        (receipt_id,)
                    )
                    r_row = cur.fetchone()
                    if not r_row or r_row['payment_id'] != payment_id:
                        cur.close()
                        conn.close()
                        return response(404, {'error': 'Чек не найден'})

                    remove_sql = f"DELETE FROM {SCHEMA}.payment_cash_receipts WHERE id = %s AND payment_id = %s"
                    cur.execute(remove_sql, (receipt_id, payment_id))
                    conn.commit()
                    cur.execute(
                        f"""SELECT id, file_url, file_name, uploaded_at
                            FROM {SCHEMA}.payment_cash_receipts
                            WHERE payment_id = %s
                            ORDER BY uploaded_at ASC, id ASC""",
                        (payment_id,)
                    )
                    receipts = []
                    for rr in cur.fetchall():
                        rd = dict(rr)
                        if rd.get('uploaded_at'):
                            rd['uploaded_at'] = rd['uploaded_at'].isoformat()
                        receipts.append(rd)
                    cur.close()
                    conn.close()
                    return response(200, {
                        'success': True,
                        'payment_id': payment_id,
                        'receipts': receipts,
                    })

                if receipt_action == 'list':
                    cur.execute(
                        f"""SELECT id, file_url, file_name, uploaded_at
                            FROM {SCHEMA}.payment_cash_receipts
                            WHERE payment_id = %s
                            ORDER BY uploaded_at ASC, id ASC""",
                        (payment_id,)
                    )
                    receipts = []
                    for rr in cur.fetchall():
                        rd = dict(rr)
                        if rd.get('uploaded_at'):
                            rd['uploaded_at'] = rd['uploaded_at'].isoformat()
                        receipts.append(rd)
                    cur.close()
                    conn.close()
                    return response(200, {
                        'success': True,
                        'payment_id': payment_id,
                        'receipts': receipts,
                    })

                # upload (добавить новый чек)
                if not receipt_url or not isinstance(receipt_url, str):
                    cur.close()
                    conn.close()
                    return response(400, {'error': 'Не указан URL чека'})

                cur.execute(
                    f"SELECT COUNT(*) AS cnt FROM {SCHEMA}.payment_cash_receipts WHERE payment_id = %s",
                    (payment_id,)
                )
                cnt_row = cur.fetchone()
                current_count = int(cnt_row['cnt']) if cnt_row else 0
                if current_count >= 10:
                    cur.close()
                    conn.close()
                    return response(400, {'error': 'Достигнут лимит: не более 10 чеков на платёж'})

                if not file_name:
                    raw_name = receipt_url.split('/')[-1]
                    parts = raw_name.split('_')
                    file_name = '_'.join(parts[2:]) if len(parts) > 2 else raw_name

                uploaded_at = datetime.now()
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.payment_cash_receipts
                            (payment_id, file_url, file_name, uploaded_at, uploaded_by)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id""",
                    (payment_id, receipt_url, file_name, uploaded_at, payload['user_id'])
                )
                new_id = cur.fetchone()['id']
                conn.commit()

                cur.execute(
                    f"""SELECT id, file_url, file_name, uploaded_at
                        FROM {SCHEMA}.payment_cash_receipts
                        WHERE payment_id = %s
                        ORDER BY uploaded_at ASC, id ASC""",
                    (payment_id,)
                )
                receipts = []
                for rr in cur.fetchall():
                    rd = dict(rr)
                    if rd.get('uploaded_at'):
                        rd['uploaded_at'] = rd['uploaded_at'].isoformat()
                    receipts.append(rd)

                cur.close()
                conn.close()
                return response(200, {
                    'success': True,
                    'payment_id': payment_id,
                    'receipt_id': new_id,
                    'receipts': receipts,
                })

            # Отдельное действие: работа с файлами счёта/чека платежа (до 10 шт., все форматы)
            if action == 'invoice_files':
                try:
                    body = json.loads(event.get('body', '{}'))
                except Exception:
                    conn.close()
                    return response(400, {'error': 'Неверный формат тела запроса'})

                payment_id = body.get('payment_id')
                sub_action = body.get('sub_action') or 'list'  # list | upload | delete | replace
                file_url = body.get('file_url')
                file_name_in = body.get('file_name')
                document_id = body.get('document_id')

                if not payment_id:
                    conn.close()
                    return response(400, {'error': 'Не указан payment_id'})

                cur.execute(
                    f'SELECT created_by, status FROM {SCHEMA}.payments WHERE id = %s',
                    (payment_id,)
                )
                pay_row = cur.fetchone()
                if not pay_row:
                    cur.close()
                    conn.close()
                    return response(404, {'error': 'Платёж не найден'})

                is_admin = is_admin_user(conn, payload['user_id'])
                is_owner = pay_row['created_by'] == payload['user_id']
                if not is_admin and not is_owner:
                    cur.close()
                    conn.close()
                    return response(403, {'error': 'Нет прав на управление файлами платежа'})

                if sub_action == 'list':
                    docs = fetch_payment_documents(cur, payment_id)
                    cur.close()
                    conn.close()
                    return response(200, {'success': True, 'payment_id': payment_id, 'documents': docs})

                if sub_action == 'delete':
                    if not document_id:
                        cur.close()
                        conn.close()
                        return response(400, {'error': 'Не указан document_id'})
                    cur.execute(
                        f"SELECT id, file_url, file_name FROM {SCHEMA}.payment_documents WHERE id = %s AND payment_id = %s",
                        (document_id, payment_id)
                    )
                    doc = cur.fetchone()
                    if not doc:
                        cur.close()
                        conn.close()
                        return response(404, {'error': 'Файл не найден'})
                    cur.execute(
                        f"DELETE FROM {SCHEMA}.payment_documents WHERE id = %s AND payment_id = %s",
                        (document_id, payment_id)
                    )
                    delete_from_s3(doc['file_url'])

                    # Если удалён файл, совпадающий с payments.invoice_file_url — подменим на другой/NULL
                    cur.execute(
                        f"SELECT invoice_file_url FROM {SCHEMA}.payments WHERE id = %s",
                        (payment_id,)
                    )
                    p_row = cur.fetchone()
                    if p_row and p_row['invoice_file_url'] == doc['file_url']:
                        cur.execute(
                            f"""SELECT file_url, uploaded_at FROM {SCHEMA}.payment_documents
                                WHERE payment_id = %s
                                ORDER BY uploaded_at ASC, id ASC LIMIT 1""",
                            (payment_id,)
                        )
                        next_doc = cur.fetchone()
                        if next_doc:
                            cur.execute(
                                f"""UPDATE {SCHEMA}.payments
                                    SET invoice_file_url = %s, invoice_file_uploaded_at = %s
                                    WHERE id = %s""",
                                (next_doc['file_url'], next_doc['uploaded_at'], payment_id)
                            )
                        else:
                            cur.execute(
                                f"""UPDATE {SCHEMA}.payments
                                    SET invoice_file_url = NULL, invoice_file_uploaded_at = NULL
                                    WHERE id = %s""",
                                (payment_id,)
                            )

                    write_audit_approval(
                        cur, payment_id, payload['user_id'],
                        f'Файл «{doc["file_name"] or "без имени"}» удалён'
                    )
                    conn.commit()
                    docs = fetch_payment_documents(cur, payment_id)
                    cur.close()
                    conn.close()
                    return response(200, {'success': True, 'payment_id': payment_id, 'documents': docs})

                if sub_action == 'replace':
                    if not document_id or not file_url:
                        cur.close()
                        conn.close()
                        return response(400, {'error': 'Не указан document_id или file_url'})
                    cur.execute(
                        f"SELECT id, file_url, file_name FROM {SCHEMA}.payment_documents WHERE id = %s AND payment_id = %s",
                        (document_id, payment_id)
                    )
                    doc = cur.fetchone()
                    if not doc:
                        cur.close()
                        conn.close()
                        return response(404, {'error': 'Файл не найден'})
                    new_name = derive_file_name(file_url, file_name_in)
                    now = datetime.now()
                    cur.execute(
                        f"""UPDATE {SCHEMA}.payment_documents
                            SET file_url = %s, file_name = %s, uploaded_at = %s, uploaded_by = %s
                            WHERE id = %s AND payment_id = %s""",
                        (file_url, new_name, now, payload['user_id'], document_id, payment_id)
                    )
                    # Синхронизируем payments.invoice_file_url, если он указывал на заменяемый файл
                    cur.execute(
                        f"SELECT invoice_file_url FROM {SCHEMA}.payments WHERE id = %s",
                        (payment_id,)
                    )
                    p_row = cur.fetchone()
                    if p_row and p_row['invoice_file_url'] == doc['file_url']:
                        cur.execute(
                            f"""UPDATE {SCHEMA}.payments
                                SET invoice_file_url = %s, invoice_file_uploaded_at = %s
                                WHERE id = %s""",
                            (file_url, now, payment_id)
                        )
                    # Удаляем старый физический файл из S3 (если CDN-ссылка)
                    if doc['file_url'] and doc['file_url'] != file_url:
                        delete_from_s3(doc['file_url'])
                    write_audit_approval(
                        cur, payment_id, payload['user_id'],
                        f'Файл «{doc["file_name"] or "без имени"}» заменён на «{new_name}»'
                    )
                    conn.commit()
                    docs = fetch_payment_documents(cur, payment_id)
                    cur.close()
                    conn.close()
                    return response(200, {'success': True, 'payment_id': payment_id, 'documents': docs})

                # upload (добавить новый файл)
                if not file_url or not isinstance(file_url, str):
                    cur.close()
                    conn.close()
                    return response(400, {'error': 'Не указан file_url'})

                cur.execute(
                    f"SELECT COUNT(*) AS cnt FROM {SCHEMA}.payment_documents WHERE payment_id = %s",
                    (payment_id,)
                )
                cnt_row = cur.fetchone()
                current_count = int(cnt_row['cnt']) if cnt_row else 0
                if current_count >= 10:
                    cur.close()
                    conn.close()
                    return response(400, {'error': 'Достигнут лимит: не более 10 файлов на платёж'})

                new_name = derive_file_name(file_url, file_name_in)
                now = datetime.now()
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.payment_documents
                            (payment_id, file_name, file_url, document_type, uploaded_at, uploaded_by)
                        VALUES (%s, %s, %s, 'invoice', %s, %s)
                        RETURNING id""",
                    (payment_id, new_name, file_url, now, payload['user_id'])
                )
                new_id = cur.fetchone()['id']

                # Если в payments ещё не был привязан главный файл — подставим этот
                cur.execute(
                    f"SELECT invoice_file_url FROM {SCHEMA}.payments WHERE id = %s",
                    (payment_id,)
                )
                p_row = cur.fetchone()
                if p_row and not p_row['invoice_file_url']:
                    cur.execute(
                        f"""UPDATE {SCHEMA}.payments
                            SET invoice_file_url = %s, invoice_file_uploaded_at = %s
                            WHERE id = %s""",
                        (file_url, now, payment_id)
                    )

                write_audit_approval(
                    cur, payment_id, payload['user_id'],
                    f'Добавлен файл «{new_name}»'
                )
                conn.commit()
                docs = fetch_payment_documents(cur, payment_id)
                cur.close()
                conn.close()
                return response(200, {
                    'success': True,
                    'payment_id': payment_id,
                    'document_id': new_id,
                    'documents': docs,
                })

            # Редактирование разрешённых полей согласованного платежа (только для администраторов)
            if not is_admin_user(conn, payload['user_id']):
                conn.close()
                return response(403, {'error': 'Доступ разрешён только администраторам'})

            try:
                body = json.loads(event.get('body', '{}'))
            except Exception:
                conn.close()
                return response(400, {'error': 'Неверный формат тела запроса'})

            payment_id = body.get('payment_id')
            new_department_id = body.get('department_id')
            new_legal_entity_id = body.get('legal_entity_id')
            new_invoice_number = body.get('invoice_number')
            new_invoice_file_url = body.get('invoice_file_url') if 'invoice_file_url' in body else None
            new_invoice_file_name = body.get('invoice_file_name')

            if not payment_id:
                conn.close()
                return response(400, {'error': 'Не указан payment_id'})

            cur.execute(
                f'SELECT id, department_id, legal_entity_id, invoice_number, invoice_file_url, status FROM {SCHEMA}.payments WHERE id = %s',
                (payment_id,)
            )
            existing = cur.fetchone()
            if not existing:
                cur.close()
                conn.close()
                return response(404, {'error': 'Платёж не найден'})

            # Собираем изменения только для переданных полей
            update_parts = []
            update_values = []
            audit_changes = []

            # Обновление отдела-заказчика
            if 'department_id' in body:
                old_department_id = existing['department_id']
                old_dept_name = None
                new_dept_name = None
                if old_department_id:
                    cur.execute(f'SELECT name FROM {SCHEMA}.customer_departments WHERE id = %s', (old_department_id,))
                    row = cur.fetchone()
                    if row:
                        old_dept_name = row['name']
                if new_department_id:
                    cur.execute(f'SELECT name FROM {SCHEMA}.customer_departments WHERE id = %s', (new_department_id,))
                    row = cur.fetchone()
                    if row:
                        new_dept_name = row['name']
                update_parts.append('department_id = %s')
                update_values.append(new_department_id)
                audit_changes.append(
                    f'Отдел-заказчик: «{old_dept_name or "не указан"}» → «{new_dept_name or "не указан"}»'
                )

            # Обновление юридического лица
            if 'legal_entity_id' in body:
                old_le_id = existing['legal_entity_id']
                old_le_name = None
                new_le_name = None
                if old_le_id:
                    cur.execute(f'SELECT name FROM {SCHEMA}.legal_entities WHERE id = %s', (old_le_id,))
                    row = cur.fetchone()
                    if row:
                        old_le_name = row['name']
                if new_legal_entity_id:
                    cur.execute(f'SELECT name FROM {SCHEMA}.legal_entities WHERE id = %s', (new_legal_entity_id,))
                    row = cur.fetchone()
                    if row:
                        new_le_name = row['name']
                update_parts.append('legal_entity_id = %s')
                update_values.append(new_legal_entity_id)
                audit_changes.append(
                    f'Юридическое лицо: «{old_le_name or "не указано"}» → «{new_le_name or "не указано"}»'
                )

            # Обновление номера счёта
            if 'invoice_number' in body:
                old_invoice_number = existing['invoice_number']
                update_parts.append('invoice_number = %s')
                update_values.append(new_invoice_number)
                audit_changes.append(
                    f'Номер счёта: «{old_invoice_number or "не указан"}» → «{new_invoice_number or "не указан"}»'
                )

            # Обновление файла счёта (загрузка/замена/удаление)
            invoice_doc_changed = False
            if 'invoice_file_url' in body:
                old_file_url = existing['invoice_file_url']
                if new_invoice_file_url:
                    update_parts.append('invoice_file_url = %s')
                    update_values.append(new_invoice_file_url)
                    update_parts.append('invoice_file_uploaded_at = %s')
                    update_values.append(datetime.now())
                    if old_file_url:
                        audit_changes.append('Файл счёта: заменён')
                    else:
                        audit_changes.append('Файл счёта: загружен')
                    invoice_doc_changed = True
                else:
                    update_parts.append('invoice_file_url = NULL')
                    update_parts.append('invoice_file_uploaded_at = NULL')
                    if old_file_url:
                        audit_changes.append('Файл счёта: удалён')
                        invoice_doc_changed = True

            if not update_parts:
                cur.close()
                conn.close()
                return response(400, {'error': 'Нет полей для обновления'})

            update_values.append(payment_id)
            cur.execute(
                f'UPDATE {SCHEMA}.payments SET {", ".join(update_parts)} WHERE id = %s',
                tuple(update_values)
            )

            # Работа с записями документов счёта
            if invoice_doc_changed:
                if new_invoice_file_url:
                    # Проверяем, нет ли уже такой записи
                    cur.execute(
                        f"SELECT id FROM {SCHEMA}.payment_documents WHERE payment_id = %s AND file_url = %s",
                        (payment_id, new_invoice_file_url)
                    )
                    if not cur.fetchone():
                        if new_invoice_file_name:
                            file_name = new_invoice_file_name
                        else:
                            raw_name = new_invoice_file_url.split('/')[-1]
                            parts = raw_name.split('_')
                            file_name = '_'.join(parts[2:]) if len(parts) > 2 else raw_name
                        cur.execute(
                            f"""INSERT INTO {SCHEMA}.payment_documents
                                    (payment_id, file_name, file_url, document_type, uploaded_at, uploaded_by)
                                VALUES (%s, %s, %s, 'invoice', %s, %s)""",
                            (payment_id, file_name, new_invoice_file_url, datetime.now(), payload['user_id'])
                        )

            # Получаем данные администратора
            cur.execute(
                f'SELECT username, full_name FROM {SCHEMA}.users WHERE id = %s',
                (payload['user_id'],)
            )
            admin_row = cur.fetchone()
            admin_name = (admin_row['full_name'] or admin_row['username']) if admin_row else str(payload['user_id'])

            # Получаем роль для записи в журнал
            cur.execute(f"""
                SELECT r.name FROM {SCHEMA}.roles r
                JOIN {SCHEMA}.user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = %s LIMIT 1
            """, (payload['user_id'],))
            role_row = cur.fetchone()
            approver_role = role_row['name'] if role_row else 'Администратор'

            import pytz
            moscow_tz = pytz.timezone('Europe/Moscow')
            now_moscow = datetime.now(moscow_tz)

            audit_comment = f'Редактирование согласованного платежа администратором {admin_name}. ' + '; '.join(audit_changes)

            cur.execute(
                f"""INSERT INTO {SCHEMA}.approvals (payment_id, approver_id, approver_role, action, comment, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)""",
                (payment_id, payload['user_id'], approver_role, 'updated', audit_comment, now_moscow)
            )

            conn.commit()

            # Возвращаем актуальные данные платежа
            cur.execute(
                f'''SELECT p.*, le.name as legal_entity_name, cd.name as department_name
                    FROM {SCHEMA}.payments p
                    LEFT JOIN {SCHEMA}.legal_entities le ON p.legal_entity_id = le.id
                    LEFT JOIN {SCHEMA}.customer_departments cd ON p.department_id = cd.id
                    WHERE p.id = %s''',
                (payment_id,)
            )
            updated = cur.fetchone()
            cur.close()
            conn.close()
            return response(200, {
                'success': True,
                'payment_id': payment_id,
                'department_id': updated['department_id'] if updated else new_department_id,
                'department_name': updated['department_name'] if updated else None,
                'legal_entity_id': updated['legal_entity_id'] if updated else new_legal_entity_id,
                'legal_entity_name': updated['legal_entity_name'] if updated else None,
                'invoice_number': updated['invoice_number'] if updated else new_invoice_number,
                'invoice_file_url': updated['invoice_file_url'] if updated else new_invoice_file_url,
                'invoice_file_uploaded_at': (
                    updated['invoice_file_uploaded_at'].isoformat()
                    if updated and updated.get('invoice_file_uploaded_at')
                    else None
                ),
            })

        elif method == 'DELETE':
            if not check_user_permission(conn, payload['user_id'], 'payments.delete'):
                conn.close()
                return response(403, {'error': 'Forbidden'})
            
            params = event.get('queryStringParameters', {})
            payment_id = params.get('id')
            
            if not payment_id:
                conn.close()
                return response(400, {'error': 'Payment ID is required'})

            is_admin = is_admin_user(conn, payload['user_id'])

            cur.execute(f'SELECT created_by, status FROM {SCHEMA}.payments WHERE id = %s', (payment_id,))
            payment_row = cur.fetchone()
            if not payment_row:
                cur.close()
                conn.close()
                return response(404, {'error': 'Платёж не найден'})

            if not is_admin and payment_row['status'] != 'draft':
                cur.close()
                conn.close()
                return response(403, {'error': 'Можно удалять только платежи со статусом "Черновик"'})

            if not is_admin and payment_row['created_by'] != payload['user_id']:
                cur.close()
                conn.close()
                return response(403, {'error': 'Вы можете удалять только свои платежи'})

            cur.execute(f'DELETE FROM {SCHEMA}.custom_field_values WHERE payment_id = %s', (payment_id,))
            cur.execute(f'DELETE FROM {SCHEMA}.payments WHERE id = %s', (payment_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            return response(200, {'success': True})
        
        conn.close()
        return response(405, {'error': 'Method not allowed'})
        
    except Exception as e:
        import traceback
        log(f"[payments-api] Error: {str(e)}")
        log(f"[payments-api] Traceback: {traceback.format_exc()}")
        try:
            conn.close()
        except Exception:
            pass
        return response(500, {'error': 'Внутренняя ошибка сервера'})