import os
import requests
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

def fetch_service_balance(service_name: str, api_endpoint: Optional[str] = None, 
                         api_key_secret_name: Optional[str] = None) -> Dict[str, any]:
    """Универсальная функция для получения баланса сервиса"""
    
    if service_name.lower() == 'timeweb cloud' or (api_endpoint and 'timeweb' in api_endpoint):
        return fetch_timeweb_balance()
    
    raise ValueError(f'Service {service_name} not supported yet')

def calculate_status(balance: float, threshold_warning: Optional[float], 
                    threshold_critical: Optional[float]) -> str:
    """Расчет статуса баланса на основе порогов"""
    if threshold_critical is not None and balance < threshold_critical:
        return 'critical'
    if threshold_warning is not None and balance < threshold_warning:
        return 'warning'
    return 'ok'
