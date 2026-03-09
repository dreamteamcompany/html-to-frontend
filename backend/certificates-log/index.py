import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Чтение и запись лога выданных справок"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        result_id    = body.get('result_id')
        full_name    = body.get('full_name', '')
        contest_name = body.get('contest_name', '')

        if not result_id:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'result_id required'})}

        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            'INSERT INTO certificates_log (result_id, full_name, contest_name) VALUES (%s, %s, %s) RETURNING *',
            (result_id, full_name, contest_name)
        )
        row = dict(cur.fetchone())
        conn.commit()
        cur.close()
        conn.close()
        row['issued_at'] = str(row['issued_at'])
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(row)}

    # GET — список
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM certificates_log ORDER BY issued_at DESC LIMIT 500')
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    for r in rows:
        r['issued_at'] = str(r['issued_at'])
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(rows)}
