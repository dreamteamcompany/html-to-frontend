"""
Main Entry Point
Минимальный роутер - делегирует все запросы в handler.py.
"""
from typing import Dict, Any
from handler import handler as main_handler


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Точка входа Cloud Function.
    Просто делегирует в handler.py (Clean Architecture).
    """
    return main_handler(event, context)
