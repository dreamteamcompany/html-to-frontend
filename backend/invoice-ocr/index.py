import json
import os
import base64
import boto3
import requests
import re
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Backend функция для загрузки счёта в S3 и распознавания данных через Яндекс Vision OCR'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
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
    
    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str == '':
            body_str = '{}'
        
        body = json.loads(body_str)
        file_data = body.get('file')
        file_name = body.get('fileName', 'invoice.jpg')
        
        if not file_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'File data is required'}),
                'isBase64Encoded': False
            }
        
        # Декодируем base64
        if ',' in file_data:
            file_data = file_data.split(',')[1]
        file_bytes = base64.b64decode(file_data)
        
        # Загружаем в S3
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        # Генерируем уникальное имя файла
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        s3_key = f'invoices/{timestamp}_{file_name}'
        
        # Определяем Content-Type
        content_type = 'application/pdf' if file_name.lower().endswith('.pdf') else 'image/jpeg'
        
        s3.put_object(
            Bucket='files',
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type
        )
        
        # CDN URL
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
        
        # OCR через Яндекс Vision API
        yandex_api_key = os.environ.get('YANDEX_CLOUD_API_KEY')
        
        if not yandex_api_key:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'file_url': cdn_url,
                    'extracted_data': None,
                    'warning': 'OCR не настроен - добавьте YANDEX_CLOUD_API_KEY'
                }),
                'isBase64Encoded': False
            }
        
        # Распознавание текста
        ocr_response = requests.post(
            'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze',
            headers={
                'Authorization': f'Api-Key {yandex_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'folderId': os.environ.get('YANDEX_FOLDER_ID', ''),
                'analyze_specs': [{
                    'content': file_data,
                    'features': [{
                        'type': 'TEXT_DETECTION',
                        'text_detection_config': {
                            'language_codes': ['ru', 'en']
                        }
                    }]
                }]
            },
            timeout=30
        )
        
        if ocr_response.status_code != 200:
            print(f"[ERROR] Yandex Vision API error: {ocr_response.status_code} - {ocr_response.text}")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'file_url': cdn_url,
                    'extracted_data': None,
                    'error': f'OCR ошибка: {ocr_response.status_code}'
                }),
                'isBase64Encoded': False
            }
        
        ocr_data = ocr_response.json()
        
        # Извлекаем текст
        full_text = ''
        if 'results' in ocr_data and len(ocr_data['results']) > 0:
            result = ocr_data['results'][0]
            if 'results' in result and len(result['results']) > 0:
                text_detection = result['results'][0].get('textDetection', {})
                full_text = text_detection.get('text', '')
        
        # Парсим данные
        extracted_data = parse_invoice_data(full_text)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'file_url': cdn_url,
                'extracted_data': extracted_data,
                'raw_text': full_text[:500]  # Первые 500 символов для отладки
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def parse_invoice_data(text: str) -> dict:
    '''Извлекает данные из текста счёта'''
    data = {
        'amount': None,
        'invoice_number': None,
        'invoice_date': None,
        'legal_entity': None,
        'contractor': None
    }
    
    if not text:
        return data
    
    text_lower = text.lower()
    
    # Сумма (ищем паттерны: "итого: 1000", "сумма: 1000.50", "к оплате: 1000")
    amount_patterns = [
        r'итого[:\s]+(\d+[\s\d]*[.,]?\d*)',
        r'сумма[:\s]+(\d+[\s\d]*[.,]?\d*)',
        r'к\s+оплате[:\s]+(\d+[\s\d]*[.,]?\d*)',
        r'всего[:\s]+(\d+[\s\d]*[.,]?\d*)'
    ]
    
    for pattern in amount_patterns:
        match = re.search(pattern, text_lower)
        if match:
            amount_str = match.group(1).replace(' ', '').replace(',', '.')
            try:
                data['amount'] = float(amount_str)
                break
            except:
                pass
    
    # Номер счёта
    invoice_patterns = [
        r'счет[:\s№]+(\d+)',
        r'счёт[:\s№]+(\d+)',
        r'invoice[:\s#]+(\d+)',
        r'№\s*(\d+)'
    ]
    
    for pattern in invoice_patterns:
        match = re.search(pattern, text_lower)
        if match:
            data['invoice_number'] = match.group(1)
            break
    
    # Дата счёта (ищем паттерны: "01.01.2024", "2024-01-01", "от 01 января 2024")
    date_patterns = [
        r'(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})',
        r'(\d{4}[./-]\d{1,2}[./-]\d{1,2})',
        r'от\s+(\d{1,2}\s+\w+\s+\d{4})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            date_str = match.group(1)
            # Пытаемся распарсить дату
            try:
                for fmt in ['%d.%m.%Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y']:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt)
                        data['invoice_date'] = parsed_date.strftime('%Y-%m-%d')
                        break
                    except:
                        continue
                if data['invoice_date']:
                    break
            except:
                pass
    
    # Юридическое лицо (ищем ИНН и название рядом)
    inn_pattern = r'инн[:\s]+(\d{10,12})'
    inn_match = re.search(inn_pattern, text_lower)
    if inn_match:
        inn_pos = inn_match.start()
        # Берём текст за 100 символов до ИНН
        context = text[max(0, inn_pos - 100):inn_pos]
        # Ищем строку с названием (обычно перед ИНН)
        lines = context.split('\n')
        if len(lines) >= 2:
            data['legal_entity'] = lines[-2].strip()[:100]
    
    # Контрагент (обычно в начале счёта, ищем "Поставщик:", "Исполнитель:")
    contractor_patterns = [
        r'поставщик[:\s]+([^\n]{5,100})',
        r'исполнитель[:\s]+([^\n]{5,100})',
        r'продавец[:\s]+([^\n]{5,100})'
    ]
    
    for pattern in contractor_patterns:
        match = re.search(pattern, text_lower)
        if match:
            data['contractor'] = match.group(1).strip()[:100]
            break
    
    return data