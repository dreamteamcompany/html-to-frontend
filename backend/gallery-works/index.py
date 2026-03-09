import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения работ галереи. ?featured=true — только лучшие работы (для главной). Без параметра — все с согласием на публикацию.'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method == 'GET':
        try:
            query_params = event.get('queryStringParameters') or {}
            featured_only = query_params.get('featured') == 'true'

            dsn = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()

            if featured_only:
                cur.execute("""
                    SELECT id, full_name, age, work_title, contest_name, work_file_url, result, created_at
                    FROM applications
                    WHERE is_featured = true
                        AND gallery_consent = true
                        AND result IS NOT NULL
                        AND work_file_url IS NOT NULL
                        AND deleted_at IS NULL
                    ORDER BY created_at DESC
                """)
            else:
                cur.execute("""
                    SELECT id, full_name, age, work_title, contest_name, work_file_url, result, created_at
                    FROM applications
                    WHERE gallery_consent = true
                        AND result IS NOT NULL
                        AND work_file_url IS NOT NULL
                        AND deleted_at IS NULL
                    ORDER BY created_at DESC
                """)

            rows = cur.fetchall()
            works = []
            for row in rows:
                works.append({
                    'id': row[0],
                    'full_name': row[1],
                    'age': row[2],
                    'work_title': row[3],
                    'contest_name': row[4],
                    'work_file_url': row[5],
                    'result': row[6],
                    'created_at': row[7].isoformat() if row[7] else None
                })

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(works, ensure_ascii=False)
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)
            }

    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False)
    }