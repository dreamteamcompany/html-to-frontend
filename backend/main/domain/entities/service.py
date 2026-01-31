"""
Service Entity
Бизнес-сущность услуги.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Service:
    """Услуга"""
    id: int
    name: str
    description: str
    intermediate_approver_id: int
    final_approver_id: int
    customer_department_id: Optional[int] = None
    category_id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Service name cannot be empty")
        if self.intermediate_approver_id <= 0:
            raise ValueError("Invalid intermediate approver ID")
        if self.final_approver_id <= 0:
            raise ValueError("Invalid final approver ID")


@dataclass
class Saving:
    """Экономия"""
    id: int
    service_id: int
    description: str
    amount: float
    frequency: str  # once, monthly, quarterly, yearly
    currency: str
    employee_id: int
    saving_reason_id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.amount <= 0:
            raise ValueError("Saving amount must be positive")
        if self.frequency not in ('once', 'monthly', 'quarterly', 'yearly'):
            raise ValueError(f"Invalid frequency: {self.frequency}")


@dataclass
class SavingReason:
    """Причина экономии"""
    id: int
    name: str
    icon: str = 'Target'
    is_active: bool = True
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Saving reason name cannot be empty")
