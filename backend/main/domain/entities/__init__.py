"""
Domain Entities
Чистые бизнес-сущности без зависимостей от фреймворков и инфраструктуры.
"""
from .user import User, Role, Permission, UserWithPermissions
from .payment import Payment, PaymentStatus
from .category import Category
from .contractor import Contractor, LegalEntity, CustomerDepartment
from .service import Service, Saving, SavingReason
from .approval import ApprovalHistory, ApprovalAction

__all__ = [
    'User',
    'Role',
    'Permission',
    'UserWithPermissions',
    'Payment',
    'PaymentStatus',
    'Category',
    'Contractor',
    'LegalEntity',
    'CustomerDepartment',
    'Service',
    'Saving',
    'SavingReason',
    'ApprovalHistory',
    'ApprovalAction',
]