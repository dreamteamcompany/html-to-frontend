"""
Database Connection Management
Управление подключениями к PostgreSQL.
Использует psycopg2 с Simple Query Protocol (требование платформы).
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, Any
from contextlib import contextmanager

from core import DatabaseError, get_config


class DatabaseConnection:
    """
    Менеджер подключений к БД.
    Поддерживает работу с транзакциями и курсорами.
    """
    
    def __init__(self):
        self._config = get_config().db
        self._conn: Optional[Any] = None
    
    def connect(self) -> Any:
        """Установить подключение к БД"""
        if self._conn is not None and not self._conn.closed:
            return self._conn
        
        try:
            self._conn = psycopg2.connect(self._config.dsn)
            self._conn.autocommit = False  # Явные транзакции
            return self._conn
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to connect to database: {str(e)}")
    
    def close(self) -> None:
        """Закрыть подключение"""
        if self._conn is not None and not self._conn.closed:
            self._conn.close()
            self._conn = None
    
    def cursor(self, dict_cursor: bool = True):
        """
        Создать курсор.
        dict_cursor: если True, возвращает RealDictCursor (строки как dict)
        """
        conn = self.connect()
        if dict_cursor:
            return conn.cursor(cursor_factory=RealDictCursor)
        return conn.cursor()
    
    def commit(self) -> None:
        """Зафиксировать транзакцию"""
        if self._conn is not None:
            try:
                self._conn.commit()
            except psycopg2.Error as e:
                raise DatabaseError(f"Failed to commit transaction: {str(e)}")
    
    def rollback(self) -> None:
        """Откатить транзакцию"""
        if self._conn is not None:
            try:
                self._conn.rollback()
            except psycopg2.Error as e:
                raise DatabaseError(f"Failed to rollback transaction: {str(e)}")
    
    @contextmanager
    def transaction(self):
        """
        Context manager для работы с транзакциями.
        
        Usage:
            with db.transaction():
                # выполнение операций
                pass  # автоматический commit при успехе
        
        При исключении автоматически выполняется rollback.
        """
        conn = self.connect()
        try:
            yield conn
            self.commit()
        except Exception as e:
            self.rollback()
            raise
    
    @property
    def schema(self) -> str:
        """Получить имя схемы БД"""
        return self._config.schema


# Singleton instance
_db_connection: Optional[DatabaseConnection] = None


def get_db_connection() -> DatabaseConnection:
    """
    Получить глобальное подключение к БД.
    Используется для DI в repositories.
    """
    global _db_connection
    if _db_connection is None:
        _db_connection = DatabaseConnection()
    return _db_connection


def close_db_connection() -> None:
    """Закрыть глобальное подключение (cleanup)"""
    global _db_connection
    if _db_connection is not None:
        _db_connection.close()
        _db_connection = None
