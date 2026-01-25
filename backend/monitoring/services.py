import os
import requests
import hashlib
from typing import Dict, Optional

def fetch_timeweb_balance() -> Dict[str, any]:
    """Получение баланса из Timeweb Cloud API"""
    api_token = os.environ.get('TIMEWEB_API_TOKEN')
    if not api_token:
        raise ValueError('TIMEWEB_API_TOKEN not configured')
    
    if not api_token.startswith('Bearer '):
        api_token = f'Bearer {api_token}'
    
    response = requests.get(
        'https://api.timeweb.cloud/api/v1/account/finances',
        headers={'Authorization': api_token},
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'Timeweb API error: {response.status_code} - {response.text}')
    
    data = response.json()
    balance = float(data.get('finances', {}).get('balance', 0))
    currency = data.get('finances', {}).get('currency', 'RUB')
    
    return {
        'balance': balance,
        'currency': currency
    }

def fetch_smsru_balance() -> Dict[str, any]:
    """Получение баланса из sms.ru API"""
    api_id = os.environ.get('SMSRU_API_ID')
    if not api_id:
        raise ValueError('SMSRU_API_ID not configured')
    
    response = requests.get(
        'https://sms.ru/my/balance',
        params={'api_id': api_id, 'json': 1},
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'sms.ru API error: {response.status_code} - {response.text}')
    
    data = response.json()
    
    if data.get('status') != 'OK':
        raise Exception(f'sms.ru API error: {data.get("status_text", "Unknown error")}')
    
    balance = float(data.get('balance', 0))
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_mango_office_balance() -> Dict[str, any]:
    """Получение баланса из Mango Office API"""
    api_key = os.environ.get('MANGO_OFFICE_API_KEY')
    api_salt = os.environ.get('MANGO_OFFICE_API_SALT')
    
    if not api_key or not api_salt:
        raise ValueError('MANGO_OFFICE_API_KEY and MANGO_OFFICE_API_SALT not configured')
    
    json_data = '{}'
    sign = hashlib.sha256(f'{api_key}{json_data}{api_salt}'.encode()).hexdigest()
    
    response = requests.post(
        'https://app.mango-office.ru/vpbx/account/balance',
        data={
            'vpbx_api_key': api_key,
            'sign': sign,
            'json': json_data
        },
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'Mango Office API error: {response.status_code} - {response.text}')
    
    data = response.json()
    
    if 'balance' not in data:
        raise Exception(f'Mango Office API error: {data}')
    
    balance = float(data.get('balance', 0))
    currency = data.get('currency', 'RUB')
    
    return {
        'balance': balance,
        'currency': currency
    }

def fetch_plusofon_balance() -> Dict[str, any]:
    """Получение баланса из Plusofon API"""
    api_token = os.environ.get('PLUSOFON_API_TOKEN')
    client_id = os.environ.get('PLUSOFON_CLIENT_ID')
    
    print(f"[DEBUG] PLUSOFON_API_TOKEN exists: {bool(api_token)}")
    print(f"[DEBUG] PLUSOFON_CLIENT_ID exists: {bool(client_id)}")
    
    if not api_token or not client_id:
        raise ValueError('PLUSOFON_API_TOKEN and PLUSOFON_CLIENT_ID not configured')
    
    print(f"[DEBUG] Making request to Plusofon API with Client: {client_id}")
    
    response = requests.get(
        'https://restapi.plusofon.ru/api/v1/payment/balance',
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Client': client_id,
            'Authorization': f'Bearer {api_token}'
        },
        timeout=10
    )
    
    print(f"[DEBUG] Plusofon response status: {response.status_code}")
    print(f"[DEBUG] Plusofon response body: {response.text}")
    
    if response.status_code != 200:
        if response.status_code == 404:
            raise Exception(f'Plusofon API error 404: Проверьте правильность Client ID ({client_id}) и токена. Ответ: {response.text}')
        raise Exception(f'Plusofon API error: {response.status_code} - {response.text}')
    
    data = response.json()
    
    if 'balance' not in data:
        raise Exception(f'Plusofon API error: {data}')
    
    balance = float(data.get('balance', 0))
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_service_balance(service_name: str, api_endpoint: Optional[str] = None, 
                         api_key_secret_name: Optional[str] = None) -> Dict[str, any]:
    """Универсальная функция для получения баланса сервиса"""
    
    if service_name.lower() == 'timeweb cloud' or (api_endpoint and 'timeweb' in api_endpoint):
        return fetch_timeweb_balance()
    
    if service_name.lower() == 'sms.ru' or (api_endpoint and 'sms.ru' in api_endpoint):
        return fetch_smsru_balance()
    
    if service_name.lower() == 'mango office' or (api_endpoint and 'mango-office' in api_endpoint):
        return fetch_mango_office_balance()
    
    if service_name.lower() == 'plusofon' or service_name.lower() == 'плюсофон' or (api_endpoint and 'plusofon' in api_endpoint):
        return fetch_plusofon_balance()
    
    raise ValueError(f'Service {service_name} not supported yet')

def calculate_status(balance: float, threshold_warning: Optional[float], 
                    threshold_critical: Optional[float]) -> str:
    """Расчет статуса баланса на основе порогов"""
    if threshold_critical is not None and balance < threshold_critical:
        return 'critical'
    if threshold_warning is not None and balance < threshold_warning:
        return 'warning'
    return 'ok'