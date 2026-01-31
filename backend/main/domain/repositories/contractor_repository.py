"""
Contractor Repository Interface
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities import Contractor, LegalEntity, CustomerDepartment


class ContractorRepository(ABC):
    """Интерфейс репозитория контрагентов"""
    
    @abstractmethod
    def get_all(self) -> List[Contractor]:
        pass
    
    @abstractmethod
    def get_by_id(self, contractor_id: int) -> Optional[Contractor]:
        pass
    
    @abstractmethod
    def create(self, **data) -> Contractor:
        pass
    
    @abstractmethod
    def update(self, contractor_id: int, **data) -> Optional[Contractor]:
        pass
    
    @abstractmethod
    def delete(self, contractor_id: int) -> bool:
        pass


class LegalEntityRepository(ABC):
    """Интерфейс репозитория юридических лиц"""
    
    @abstractmethod
    def get_all(self) -> List[LegalEntity]:
        pass
    
    @abstractmethod
    def get_by_id(self, entity_id: int) -> Optional[LegalEntity]:
        pass
    
    @abstractmethod
    def create(self, name: str, inn: str, kpp: str, address: str) -> LegalEntity:
        pass
    
    @abstractmethod
    def update(self, entity_id: int, name: str, inn: str, kpp: str, address: str) -> Optional[LegalEntity]:
        pass
    
    @abstractmethod
    def delete(self, entity_id: int) -> bool:
        pass


class DepartmentRepository(ABC):
    """Интерфейс репозитория подразделений"""
    
    @abstractmethod
    def get_all(self) -> List[CustomerDepartment]:
        pass
    
    @abstractmethod
    def get_by_id(self, dept_id: int) -> Optional[CustomerDepartment]:
        pass
    
    @abstractmethod
    def create(self, name: str, description: str) -> CustomerDepartment:
        pass
    
    @abstractmethod
    def update(self, dept_id: int, name: str, description: str) -> Optional[CustomerDepartment]:
        pass
    
    @abstractmethod
    def delete(self, dept_id: int) -> bool:
        pass
