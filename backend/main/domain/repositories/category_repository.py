"""
Category Repository Interface
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities import Category


class CategoryRepository(ABC):
    """Интерфейс репозитория категорий"""
    
    @abstractmethod
    def get_all(self) -> List[Category]:
        """Получить все категории"""
        pass
    
    @abstractmethod
    def get_by_id(self, category_id: int) -> Optional[Category]:
        """Получить категорию по ID"""
        pass
    
    @abstractmethod
    def create(self, name: str, icon: str) -> Category:
        """Создать новую категорию"""
        pass
    
    @abstractmethod
    def update(self, category_id: int, name: str, icon: str) -> Optional[Category]:
        """Обновить категорию"""
        pass
    
    @abstractmethod
    def delete(self, category_id: int) -> bool:
        """Удалить категорию"""
        pass
    
    @abstractmethod
    def has_payments(self, category_id: int) -> bool:
        """Проверить, есть ли платежи в категории"""
        pass
