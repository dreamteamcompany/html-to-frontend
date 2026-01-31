"""
Category Entity
Бизнес-сущность категории платежей.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Category:
    """Категория платежей"""
    id: int
    name: str
    icon: str
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Category name cannot be empty")
