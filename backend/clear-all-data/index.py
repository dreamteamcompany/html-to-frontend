import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Очистка данных проекта.
    POST /          — удаляет только платежи и историю (справочники не трогает)
    POST /?mode=all — удаляет всё включая справочники (старое поведение)
    """
    method: str = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only POST allowed'}),
            'isBase64Encoded': False
        }

    params = event.get('queryStringParameters') or {}
    mode = params.get('mode', 'payments')

    if mode == 'all':
        tables_to_clear = [
            'payment_custom_field_values',
            'payment_custom_values',
            'planned_payment_custom_field_values',
            'planned_payments',
            'comment_attachments',
            'comment_likes',
            'comment_reactions',
            'payment_comments',
            'payment_documents',
            'payment_views',
            'custom_field_values',
            'approvals',
            'notifications',
            'audit_logs',
            'payments',
            'savings',
            'saving_reasons',
            'legal_entities',
            'categories',
            'custom_fields',
            'contractors',
            'customer_departments',
            'services',
            'payment_comments',
            'log_files',
            'log_entries',
            'log_statistics',
            'dashboard_layouts',
        ]
    else:
        # Только платежи и история — справочники сохраняются
        tables_to_clear = [
            'payment_custom_field_values',
            'payment_custom_values',
            'planned_payment_custom_field_values',
            'planned_payments',
            'comment_attachments',
            'comment_likes',
            'comment_reactions',
            'payment_comments',
            'payment_documents',
            'payment_views',
            'custom_field_values',
            'approvals',
            'notifications',
            'audit_logs',
            'payments',
        ]

    conn = psycopg2.connect(os.environ['DATABASE_URL'])

    try:
        cleared_count = 0

        with conn.cursor() as cur:
            for table in tables_to_clear:
                try:
                    cur.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE")
                    cleared_count += 1
                except Exception as e:
                    print(f"Failed to clear {table}: {e}")

            conn.commit()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'mode': mode,
                'tables_cleared': cleared_count,
                'message': 'Платежи и история успешно удалены' if mode != 'all' else 'Все данные успешно удалены'
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

    finally:
        conn.close()
