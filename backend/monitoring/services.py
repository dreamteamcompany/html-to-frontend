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

def fetch_timeweb_hosting_balance() -> Dict[str, any]:
    """Получение баланса из Timeweb Hosting API (виртуальный хостинг/домены)"""
    api_token = os.environ.get('TIMEWEB_HOSTING_API_TOKEN')
    app_key = os.environ.get('TIMEWEB_HOSTING_APP_KEY')
    login = os.environ.get('TIMEWEB_HOSTING_LOGIN')
    
    if not api_token or not app_key or not login:
        raise ValueError('TIMEWEB_HOSTING_API_TOKEN, TIMEWEB_HOSTING_APP_KEY and TIMEWEB_HOSTING_LOGIN not configured')
    
    response = requests.get(
        f'https://api.timeweb.ru/v1.1/finances/accounts/{login}',
        headers={
            'Accept': 'application/json',
            'x-app-key': app_key,
            'Authorization': f'Bearer {api_token}'
        },
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'Timeweb Hosting API error: {response.status_code} - {response.text}')
    
    data = response.json()
    balance = float(data.get('available_balance', 0))
    currency = data.get('currency', 'RUB')
    
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
    
    print(f"[DEBUG] PLUSOFON_API_TOKEN exists: {bool(api_token)}")
    
    if not api_token:
        raise ValueError('PLUSOFON_API_TOKEN not configured')
    
    print(f"[DEBUG] Making request to Plusofon API with Client: 10553")
    print(f"[DEBUG] Token (first 20 chars): {api_token[:20] if api_token else 'N/A'}...")
    
    headers = {
        'Accept': 'application/json',
        'Client': '10553',
        'Authorization': f'Bearer {api_token.strip()}'
    }
    
    print(f"[DEBUG] Request headers: {headers}")
    
    response = requests.get(
        'https://restapi.plusofon.ru/api/v1/payment/balance',
        headers=headers,
        timeout=10
    )
    
    print(f"[DEBUG] Plusofon response status: {response.status_code}")
    print(f"[DEBUG] Plusofon response headers: {dict(response.headers)}")
    print(f"[DEBUG] Plusofon response body: {response.text}")
    
    if response.status_code != 200:
        if response.status_code == 404:
            raise Exception(f'Plusofon API error 404: Проверьте правильность токена. Ответ: {response.text}')
        elif response.status_code == 401:
            raise Exception(f'Plusofon API error 401: Неверная авторизация. Проверьте токен.')
        elif response.status_code == 403:
            raise Exception(f'Plusofon API error 403: Доступ запрещен. Проверьте права токена.')
        raise Exception(f'Plusofon API error: {response.status_code} - {response.text}')
    
    data = response.json()
    
    if 'balance' not in data:
        raise Exception(f'Plusofon API error: {data}')
    
    balance = float(data.get('balance', 0))
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_regru_balance(account_id: Optional[str] = None) -> Dict[str, any]:
    """Получение баланса услуги из Reg.ru API"""
    username = os.environ.get('REGRU_USERNAME_2')
    password = os.environ.get('REGRU_PASSWORD_2')
    
    print(f"[DEBUG] Reg.ru - username exists: {bool(username)}, password exists: {bool(password)}, account_id: {account_id}")
    
    if not username or not password:
        raise ValueError('REGRU_USERNAME_2 and REGRU_PASSWORD_2 not configured')
    
    if not account_id:
        raise ValueError('service_id (account_id) is required for Reg.ru balance check')
    
    response = requests.post(
        'https://api.reg.ru/api/regru2/service/get_balance',
        data={
            'username': username,
            'password': password,
            'service_id': account_id,
            'output_format': 'json'
        },
        timeout=10
    )
    
    print(f"[DEBUG] Reg.ru response status: {response.status_code}")
    print(f"[DEBUG] Reg.ru response body: {response.text}")
    
    if response.status_code != 200:
        raise Exception(f'Reg.ru API error: {response.status_code} - {response.text}')
    
    data = response.json()
    
    if data.get('result') != 'success':
        error_code = data.get('error_code', 'UNKNOWN')
        error_text = data.get('error_text', 'Unknown error')
        raise Exception(f'Reg.ru API error {error_code}: {error_text}')
    
    answer = data.get('answer', {})
    balance_str = answer.get('balance', '0')
    
    try:
        balance = float(balance_str)
    except (ValueError, TypeError):
        balance = 0.0
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_service_balance(service_name: str, api_endpoint: Optional[str] = None, 
                         api_key_secret_name: Optional[str] = None, account_id: Optional[str] = None) -> Dict[str, any]:
    """Универсальная функция для получения баланса сервиса"""
    
    print(f"[DEBUG] fetch_service_balance called with service_name='{service_name}', api_endpoint='{api_endpoint}', account_id='{account_id}'")
    
    if service_name.lower() == 'timeweb cloud' or (api_endpoint and 'api.timeweb.cloud' in api_endpoint):
        return fetch_timeweb_balance()
    
    if service_name.lower() == 'timeweb hosting' or (api_endpoint and 'api.timeweb.ru' in api_endpoint):
        return fetch_timeweb_hosting_balance()
    
    if service_name.lower() == 'sms.ru' or (api_endpoint and 'sms.ru' in api_endpoint):
        return fetch_smsru_balance()
    
    if service_name.lower() == 'mango office' or (api_endpoint and 'mango-office' in api_endpoint):
        return fetch_mango_office_balance()
    
    if service_name.lower() == 'plusofon' or service_name.lower() == 'плюсофон' or (api_endpoint and 'plusofon' in api_endpoint):
        return fetch_plusofon_balance()
    
    if 'reg.ru' in service_name.lower() or (api_endpoint and 'api.reg.ru' in api_endpoint):
        return fetch_regru_balance(account_id)
    
    raise ValueError(f'Service {service_name} not supported yet')

def calculate_status(balance: float, threshold_warning: Optional[float], 
                    threshold_critical: Optional[float]) -> str:
    """Расчет статуса баланса на основе порогов"""
    if threshold_critical is not None and balance < threshold_critical:
        return 'critical'
    if threshold_warning is not None and balance < threshold_warning:
        return 'warning'
    return 'ok'