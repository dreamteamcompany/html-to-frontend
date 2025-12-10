import json
import os
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ValidationError
import psycopg2

class PaymentRequest(BaseModel):
    category: str = Field(..., pattern='^(servers|communications|websites|security)$')
    amount: float = Field(..., gt=0)
    description: str = Field(default='')
    payment_date: str = Field(default='')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Добавляет новый платёж в базу данных
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами: request_id, function_name
    Returns: JSON с информацией о добавленном платеже
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    payment_req = PaymentRequest(**body_data)
    
    # Если дата не указана, используем текущую
    payment_date = payment_req.payment_date if payment_req.payment_date else datetime.now().isoformat()
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO payments (category, amount, description, payment_date)
        VALUES (%s, %s, %s, %s)
        RETURNING id, category, amount, description, payment_date, created_at
    """, (payment_req.category, payment_req.amount, payment_req.description, payment_date))
    
    row = cur.fetchone()
    conn.commit()
    
    result = {
        'id': row[0],
        'category': row[1],
        'amount': float(row[2]),
        'description': row[3],
        'payment_date': row[4].isoformat(),
        'created_at': row[5].isoformat()
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result),
        'isBase64Encoded': False
    }
