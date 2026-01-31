"""
Payment Repository Interface
Интерфейс для работы с платежами.
"""
from abc import ABC, abstractmethod
from typing import Optional
from datetime import datetime

from ..entities import Payment, PaymentStatus


class IPaymentRepository(ABC):
    """
    Интерфейс репозитория платежей.
    Определяет операции с платежами без привязки к конкретной реализации БД.
    """
    
    @abstractmethod
    def get_by_id(self, payment_id: int) -> Optional[Payment]:
        """Получить платёж по ID"""
        pass
    
    @abstractmethod
    def get_all(
        self,
        user_id: Optional[int] = None,
        status: Optional[PaymentStatus] = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[Payment]:
        """
        Получить список платежей с фильтрацией.
        user_id: фильтр по создателю
        status: фильтр по статусу
        """
        pass
    
    @abstractmethod
    def get_pending_for_approval(self, approver_id: int, is_final: bool) -> list[Payment]:
        """
        Получить платежи, ожидающие согласования конкретным пользователем.
        is_final: True для финального согласования, False для промежуточного.
        """
        pass
    
    @abstractmethod
    def create(self, payment: Payment) -> Payment:
        """
        Создать новый платёж.
        Возвращает созданный платёж с заполненным ID.
        """
        pass
    
    @abstractmethod
    def update(self, payment: Payment) -> Payment:
        """Обновить существующий платёж"""
        pass
    
    @abstractmethod
    def delete(self, payment_id: int) -> bool:
        """
        Удалить платёж.
        Возвращает True если удалён, False если не найден.
        """
        pass
    
    @abstractmethod
    def count_by_status(self, status: PaymentStatus) -> int:
        """Подсчитать количество платежей в определённом статусе"""
        pass
    
    @abstractmethod
    def get_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """
        Получить статистику по платежам за период.
        Возвращает dict с ключами: total_amount, count, by_status и т.д.
        """
        pass
