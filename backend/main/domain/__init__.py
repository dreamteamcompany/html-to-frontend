"""
Domain Layer
Содержит бизнес-логику: entities, value objects, repository interfaces.
НЕ зависит от внешних фреймворков, БД, HTTP.
"""
from .entities import (
    User,
    Role,
    Permission,
    UserWithPermissions,
    Payment,
    PaymentStatus,
)
from .repositories import (
    IUserRepository,
    IPaymentRepository,
)

__all__ = [
    # Entities
    'User',
    'Role',
    'Permission',
    'UserWithPermissions',
    'Payment',
    'PaymentStatus',
    
    # Repository Interfaces
    'IUserRepository',
    'IPaymentRepository',
]
