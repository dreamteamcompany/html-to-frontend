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
        raise Exception(f'Timeweb API error: {response.status_code}')
    
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
        raise Exception(f'Timeweb Hosting API error: {response.status_code}')
    
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
        raise Exception(f'sms.ru API error: {response.status_code}')
    
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
        raise Exception(f'Mango Office API error: {response.status_code}')
    
    data = response.json()
    
    if 'balance' not in data:
        raise Exception('Mango Office API: balance not found in response')
    
    balance = float(data.get('balance', 0))
    currency = data.get('currency', 'RUB')
    
    return {
        'balance': balance,
        'currency': currency
    }

def fetch_plusofon_balance() -> Dict[str, any]:
    """Получение баланса из Plusofon API"""
    api_token = os.environ.get('PLUSOFON_API_TOKEN')
    
    if not api_token:
        raise ValueError('PLUSOFON_API_TOKEN not configured')
    
    headers = {
        'Accept': 'application/json',
        'Client': '10553',
        'Authorization': f'Bearer {api_token.strip()}'
    }
    
    response = requests.get(
        'https://restapi.plusofon.ru/api/v1/payment/balance',
        headers=headers,
        timeout=10
    )
    
    if response.status_code != 200:
        if response.status_code == 401:
            raise Exception('Plusofon API: неверная авторизация')
        elif response.status_code == 403:
            raise Exception('Plusofon API: доступ запрещен')
        raise Exception(f'Plusofon API error: {response.status_code}')
    
    data = response.json()
    
    if 'balance' not in data:
        raise Exception('Plusofon API: balance not found in response')
    
    balance = float(data.get('balance', 0))
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_regru_balance(account_id: Optional[str] = None) -> Dict[str, any]:
    """Получение общего баланса аккаунта из Reg.ru API"""
    if account_id == '2':
        username = os.environ.get('REGRU_USERNAME_2')
        password = os.environ.get('REGRU_PASSWORD_2')
        account_label = 'аккаунт 2'
    else:
        username = os.environ.get('REGRU_USERNAME')
        password = os.environ.get('REGRU_PASSWORD')
        account_label = 'аккаунт 1'
    
    if not username or not password:
        raise ValueError(f'REGRU_USERNAME and REGRU_PASSWORD not configured for {account_label}')
    
    response = requests.post(
        'https://api.reg.ru/api/regru2/user/get_balance',
        data={
            'username': username,
            'password': password,
            'output_format': 'json'
        },
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'Reg.ru API error: {response.status_code}')
    
    data = response.json()
    
    if data.get('result') != 'success':
        error_code = data.get('error_code', 'UNKNOWN')
        error_text = data.get('error_text', 'Unknown error')
        raise Exception(f'Reg.ru API error {error_code}: {error_text}')
    
    answer = data.get('answer', {})
    balance_str = answer.get('prepay', answer.get('balance', '0'))
    
    try:
        balance = float(balance_str)
    except (ValueError, TypeError):
        balance = 0.0
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_smsfast_balance() -> Dict[str, any]:
    """Получение баланса из SmsFast API"""
    api_key = os.environ.get('SMSFAST_API_KEY')
    if not api_key:
        raise ValueError('SMSFAST_API_KEY not configured')
    
    response = requests.get(
        'https://smsfastapi.com/stubs/handler_api.php',
        params={
            'api_key': api_key,
            'action': 'getBalance'
        },
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'SmsFast API error: {response.status_code}')
    
    text = response.text.strip()
    
    if not text.startswith('ACCESS_BALANCE:'):
        raise Exception('SmsFast: unexpected response format')
    
    balance_str = text.replace('ACCESS_BALANCE:', '')
    
    try:
        balance = float(balance_str)
    except (ValueError, TypeError):
        raise Exception('SmsFast: invalid balance format')
    
    return {
        'balance': balance,
        'currency': 'RUB'
    }

def fetch_openai_balance() -> Dict[str, any]:
    """Получение баланса из OpenAI API"""
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('OPENAI_API_KEY not configured')
    
    response = requests.get(
        'https://api.openai.com/v1/dashboard/billing/credit_grants',
        headers={
            'Authorization': f'Bearer {api_key}'
        },
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'OpenAI API error: {response.status_code}')
    
    data = response.json()
    balance = data.get('total_available', 0.0)
    
    return {
        'balance': float(balance),
        'currency': 'USD'
    }

def fetch_1dedic_balance() -> Dict[str, any]:
    """Получение баланса из 1Dedic (BILLmanager) API"""
    username = os.environ.get('DEDIC_USERNAME')
    password = os.environ.get('DEDIC_PASSWORD')
    
    if not username or not password:
        raise ValueError('DEDIC_USERNAME and DEDIC_PASSWORD not configured')
    
    from requests.auth import HTTPBasicAuth
    
    response = requests.post(
        'https://my.1dedic.ru/billmgr',
        data={
            'func': 'invoice',
            'out': 'json'
        },
        auth=HTTPBasicAuth(username, password),
        timeout=10
    )
    
    if response.status_code != 200:
        raise Exception(f'1Dedic API error: {response.status_code}')
    
    data = response.json()
    
    if data.get('doc', {}).get('error'):
        error = data['doc']['error']
        error_obj = error.get('$object', 'unknown')
        error_msg = error.get('$msg') or error.get('msg', {}).get('$', 'Unknown error')
        raise Exception(f'1Dedic API error ({error_obj}): {error_msg}')
    
    balance_str = data.get('doc', {}).get('balance', {}).get('$', '0')
    
    try:
        balance = float(balance_str)
    except (ValueError, TypeError):
        balance = 0.0
    
    currency = data.get('doc', {}).get('balance', {}).get('$currency', 'RUB')
    
    return {
        'balance': balance,
        'currency': currency
    }

def fetch_service_balance(service_name: str, api_endpoint: Optional[str] = None, 
                         api_key_secret_name: Optional[str] = None, account_id: Optional[str] = None) -> Dict[str, any]:
    """Универсальная функция для получения баланса сервиса"""
    
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
        if 'аккаунт 2' in service_name.lower():
            return fetch_regru_balance('2')
        else:
            return fetch_regru_balance('1')
    
    if '1dedic' in service_name.lower() or 'dedic' in service_name.lower() or (api_endpoint and '1dedic.ru' in api_endpoint):
        return fetch_1dedic_balance()
    
    if 'smsfast' in service_name.lower() or (api_endpoint and 'smsfast' in api_endpoint):
        return fetch_smsfast_balance()
    
    if 'openai' in service_name.lower() or (api_endpoint and 'api.openai.com' in api_endpoint):
        return fetch_openai_balance()
    
    raise ValueError(f'Service not supported')

def calculate_status(balance: float, threshold_warning: Optional[float], 
                    threshold_critical: Optional[float]) -> str:
    """Расчет статуса баланса на основе порогов"""
    if threshold_critical is not None and balance < threshold_critical:
        return 'critical'
    if threshold_warning is not None and balance < threshold_warning:
        return 'warning'
    return 'ok'
