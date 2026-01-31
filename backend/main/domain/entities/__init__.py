"""
Domain Entities
Чистые бизнес-сущности без зависимостей от фреймворков и инфраструктуры.
"""
from .user import User, Role, Permission, UserWithPermissions
from .payment import Payment, PaymentStatus

__all__ = [
    'User',
    'Role',
    'Permission',
    'UserWithPermissions',
    'Payment',
    'PaymentStatus',
]
