"""
Approval Entity
Бизнес-сущность согласования платежей.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class ApprovalAction(str, Enum):
    """Действия по согласованию"""
    APPROVE = 'approve'
    REJECT = 'reject'


@dataclass
class ApprovalHistory:
    """История согласования"""
    id: int
    payment_id: int
    user_id: int
    username: str
    action: str
    comment: str
    created_at: datetime
