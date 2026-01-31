"""
Payment Domain Entity
Агрегат платежа с бизнес-логикой согласования.
"""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from decimal import Decimal


class PaymentStatus(Enum):
    """Статусы платежа"""
    PENDING = 'pending'
    INTERMEDIATE_APPROVED = 'intermediate_approved'
    FINAL_APPROVED = 'final_approved'
    REJECTED = 'rejected'
    PAID = 'paid'


@dataclass
class Payment:
    """
    Агрегат платежа.
    Инвариант: сумма должна быть положительной.
    Бизнес-логика: workflow согласования платежа.
    """
    id: int
    category_id: int
    amount: Decimal
    description: str
    payment_date: Optional[datetime]
    status: PaymentStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    # Связанные данные
    legal_entity_id: Optional[int]
    contractor_id: Optional[int]
    department_id: Optional[int]
    service_id: Optional[int]
    
    # Данные о согласовании
    intermediate_approver_id: Optional[int]
    intermediate_approved_at: Optional[datetime]
    intermediate_comment: Optional[str]
    
    final_approver_id: Optional[int]
    final_approved_at: Optional[datetime]
    final_comment: Optional[str]
    
    # Данные о счёте
    invoice_number: Optional[str]
    invoice_date: Optional[datetime]
    
    def __post_init__(self):
        """Валидация инвариантов"""
        if self.amount <= 0:
            raise ValueError("Payment amount must be positive")
    
    def can_be_approved_by(self, user_id: int, is_final: bool) -> bool:
        """
        Проверить, может ли пользователь согласовать платёж.
        Бизнес-правило: промежуточное согласование -> финальное согласование.
        """
        if self.status == PaymentStatus.REJECTED:
            return False
        
        if is_final:
            # Финальное согласование возможно только после промежуточного
            if self.status != PaymentStatus.INTERMEDIATE_APPROVED:
                return False
            return self.final_approver_id is None or user_id == self.final_approver_id
        else:
            # Промежуточное согласование
            if self.status != PaymentStatus.PENDING:
                return False
            return self.intermediate_approver_id is None or user_id == self.intermediate_approver_id
    
    def approve_intermediate(self, approver_id: int, comment: Optional[str] = None) -> None:
        """
        Промежуточное согласование.
        Бизнес-правило: только из статуса PENDING.
        """
        if self.status != PaymentStatus.PENDING:
            raise ValueError(f"Cannot approve payment in status {self.status.value}")
        
        self.status = PaymentStatus.INTERMEDIATE_APPROVED
        self.intermediate_approver_id = approver_id
        self.intermediate_approved_at = datetime.utcnow()
        self.intermediate_comment = comment
        self.updated_at = datetime.utcnow()
    
    def approve_final(self, approver_id: int, comment: Optional[str] = None) -> None:
        """
        Финальное согласование.
        Бизнес-правило: только после промежуточного согласования.
        """
        if self.status != PaymentStatus.INTERMEDIATE_APPROVED:
            raise ValueError(f"Cannot final approve payment in status {self.status.value}")
        
        self.status = PaymentStatus.FINAL_APPROVED
        self.final_approver_id = approver_id
        self.final_approved_at = datetime.utcnow()
        self.final_comment = comment
        self.updated_at = datetime.utcnow()
    
    def reject(self, approver_id: int, comment: str, is_final: bool) -> None:
        """
        Отклонить платёж.
        Может быть отклонён на любом этапе согласования.
        """
        if self.status in [PaymentStatus.REJECTED, PaymentStatus.PAID]:
            raise ValueError(f"Cannot reject payment in status {self.status.value}")
        
        self.status = PaymentStatus.REJECTED
        
        if is_final:
            self.final_approver_id = approver_id
            self.final_approved_at = datetime.utcnow()
            self.final_comment = comment
        else:
            self.intermediate_approver_id = approver_id
            self.intermediate_approved_at = datetime.utcnow()
            self.intermediate_comment = comment
        
        self.updated_at = datetime.utcnow()
    
    def mark_as_paid(self) -> None:
        """
        Отметить как оплаченный.
        Бизнес-правило: только после финального согласования.
        """
        if self.status != PaymentStatus.FINAL_APPROVED:
            raise ValueError(f"Cannot mark as paid payment in status {self.status.value}")
        
        self.status = PaymentStatus.PAID
        self.updated_at = datetime.utcnow()
    
    @property
    def is_approved(self) -> bool:
        """Проверить, согласован ли платёж полностью"""
        return self.status == PaymentStatus.FINAL_APPROVED
    
    @property
    def is_rejected(self) -> bool:
        """Проверить, отклонён ли платёж"""
        return self.status == PaymentStatus.REJECTED
    
    @property
    def requires_intermediate_approval(self) -> bool:
        """Требуется ли промежуточное согласование"""
        return self.status == PaymentStatus.PENDING
    
    @property
    def requires_final_approval(self) -> bool:
        """Требуется ли финальное согласование"""
        return self.status == PaymentStatus.INTERMEDIATE_APPROVED
