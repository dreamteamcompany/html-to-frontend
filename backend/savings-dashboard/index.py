import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получение статистики по экономии для дашборда
    Args: event - словарь с httpMethod, headers
          context - объект с атрибутами request_id, function_name
    Returns: JSON с общей суммой экономии и топом отделов-заказчиков
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        cursor.execute('''
            WITH total_stats AS (
                SELECT 
                    COALESCE(SUM(amount), 0) as total_amount,
                    COUNT(id) as count
                FROM t_p61788166_html_to_frontend.savings
            ),
            dept_stats AS (
                SELECT 
                    cd.name as department_name,
                    SUM(s.amount) as total_saved
                FROM t_p61788166_html_to_frontend.savings s
                JOIN t_p61788166_html_to_frontend.services srv ON s.service_id = srv.id
                LEFT JOIN t_p61788166_html_to_frontend.customer_departments cd ON srv.customer_department_id = cd.id
                WHERE srv.customer_department_id IS NOT NULL
                GROUP BY cd.id, cd.name
                ORDER BY total_saved DESC
                LIMIT 5
            )
            SELECT 
                (SELECT total_amount FROM total_stats) as total_amount,
                (SELECT count FROM total_stats) as count,
                COALESCE(json_agg(dept_stats.*), '[]'::json) as departments
            FROM dept_stats
        ''')
        
        row = cursor.fetchone()
        total_amount = float(row[0]) if row and row[0] else 0
        count = int(row[1]) if row and row[1] else 0
        departments_json = row[2] if row and row[2] else []
        
        top_departments: List[Dict[str, Any]] = []
        if departments_json and departments_json != '[]':
            import json as json_module
            dept_list = json_module.loads(departments_json) if isinstance(departments_json, str) else departments_json
            for dept in dept_list:
                if dept.get('department_name'):
                    top_departments.append({
                        'department_name': dept['department_name'],
                        'total_saved': float(dept['total_saved'])
                    })
        
        cursor.close()
        conn.close()
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    result = {
        'total_amount': total_amount,
        'count': count,
        'top_departments': top_departments
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result),
        'isBase64Encoded': False
    }