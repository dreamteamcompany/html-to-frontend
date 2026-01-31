"""
Contractor Entity
Бизнес-сущность контрагента.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Contractor:
    """Контрагент"""
    id: int
    name: str
    inn: str = ''
    kpp: str = ''
    ogrn: str = ''
    legal_address: str = ''
    actual_address: str = ''
    phone: str = ''
    email: str = ''
    contact_person: str = ''
    bank_name: str = ''
    bank_bik: str = ''
    bank_account: str = ''
    correspondent_account: str = ''
    notes: str = ''
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Contractor name cannot be empty")


@dataclass
class LegalEntity:
    """Юридическое лицо"""
    id: int
    name: str
    inn: str = ''
    kpp: str = ''
    address: str = ''
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Legal entity name cannot be empty")


@dataclass
class CustomerDepartment:
    """Подразделение клиента"""
    id: int
    name: str
    description: str = ''
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Department name cannot be empty")
