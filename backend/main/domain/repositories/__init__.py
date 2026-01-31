"""
Domain Repositories Interfaces
Интерфейсы для работы с данными.
Domain слой определяет контракты, infrastructure слой их реализует.
"""
from .user_repository import IUserRepository
from .payment_repository import IPaymentRepository

__all__ = [
    'IUserRepository',
    'IPaymentRepository',
]
