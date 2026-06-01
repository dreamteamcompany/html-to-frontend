"""Служебная функция: привязка обработчика событий чат-бота Битрикс24 к нашему webhook.

Через метод imbot.update прописывает боту правильный EVENT_HANDLER для:
- ONIMBOTMESSAGEADD (текстовые ответы пользователя боту);
- ONIMCOMMANDADD (нажатие интерактивных кнопок в сообщении).

После вызова Битрикс начинает доставлять нажатия кнопок «Согласовать/Отклонить/Комментарий»
на функцию bitrix-callback. Запускается вручную (GET/POST), без авторизации пользователя.
"""
import json
import os
import sys
import urllib.request
import urllib.error
from typing import Dict, Any

CALLBACK_URL = 'https://functions.poehali.dev/3c243638-1075-4f08-bc82-a5969a271d2d'


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def response(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
        },
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def _bitrix_call(webhook_url: str, method: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    url = f'{webhook_url}/{method}.json'
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace')
        log(f'[BOT-REGISTER] {method} HTTPError {e.code}: {body}')
        try:
            return json.loads(body)
        except Exception:
            return {'error': f'HTTP {e.code}', 'error_description': body}
    except Exception as e:
        log(f'[BOT-REGISTER] {method} failed: {e}')
        return {'error': 'request_failed', 'error_description': str(e)}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Привязывает обработчик событий чат-бота Битрикс24 к нашему webhook bitrix-callback."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Auth-Token, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    webhook_url = os.environ.get('BITRIX_WEBHOOK_URL', '').rstrip('/')
    bot_id = os.environ.get('BITRIX_BOT_ID', '')
    bot_client_id = os.environ.get('BITRIX_BOT_CLIENT_ID', '')

    if not webhook_url:
        return response(400, {
            'ok': False,
            'error': 'BITRIX_WEBHOOK_URL не настроен',
        })

    qs = event.get('queryStringParameters') or {}
    if str(qs.get('info', '')) in ('1', 'true', 'yes'):
        domain = ''
        user_id = ''
        webhook_code = ''
        try:
            parts = webhook_url.split('/rest/')
            domain = parts[0].replace('https://', '').replace('http://', '')
            rest = parts[1].split('/') if len(parts) > 1 else []
            if len(rest) >= 1:
                user_id = rest[0]
            if len(rest) >= 2:
                code = rest[1]
                webhook_code = (code[:3] + '***' + code[-3:]) if len(code) > 6 else '***'
        except Exception:
            pass
        return response(200, {
            'ok': True,
            'mode': 'info',
            'domain': domain,
            'webhook_user_id': user_id,
            'webhook_code_masked': webhook_code,
            'hint': 'Найди в Битриксе входящий вебхук, созданный пользователем с этим ID, на этом домене. Добавь ему право imbot.',
        })

    if not bot_id:
        return response(400, {
            'ok': False,
            'error': 'BITRIX_BOT_ID не настроен',
        })

    update_payload: Dict[str, Any] = {
        'BOT_ID': bot_id,
        'FIELDS': {
            'EVENT_MESSAGE_ADD': CALLBACK_URL,
            'EVENT_WELCOME_MESSAGE': CALLBACK_URL,
            'EVENT_BOT_DELETE': CALLBACK_URL,
        },
    }
    if bot_client_id:
        update_payload['CLIENT_ID'] = bot_client_id

    update_result = _bitrix_call(webhook_url, 'imbot.update', update_payload)

    commands = [
        ('approve', 'Согласовать платёж'),
        ('reject', 'Отклонить платёж'),
        ('comment', 'Оставить комментарий к платежу'),
        ('approve_all', 'Согласовать все платежи'),
    ]
    command_results = {}
    for cmd, title in commands:
        cmd_payload: Dict[str, Any] = {
            'BOT_ID': bot_id,
            'COMMAND': cmd,
            'COMMON': 'N',
            'HIDDEN': 'Y',
            'EXTRANET_SUPPORT': 'N',
            'EVENT_COMMAND_ADD': CALLBACK_URL,
            'LANG': [{'LANGUAGE_ID': 'ru', 'TITLE': title, 'PARAMS': ''}],
        }
        if bot_client_id:
            cmd_payload['CLIENT_ID'] = bot_client_id
        command_results[cmd] = _bitrix_call(webhook_url, 'imbot.command.register', cmd_payload)

    ok = bool(update_result.get('result'))

    return response(200, {
        'ok': ok,
        'callback_url': CALLBACK_URL,
        'bot_id': bot_id,
        'imbot_update': update_result,
        'imbot_command_register': command_results,
        'hint': 'Если ok=true — обработчик событий бота привязан. Нажми кнопку в Битриксе и проверь логи bitrix-callback.',
    })