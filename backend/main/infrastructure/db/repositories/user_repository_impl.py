"""
User Repository Implementation
Реализация IUserRepository с использованием PostgreSQL + psycopg2.
"""
from typing import Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from domain import User, Role, Permission, UserWithPermissions, IUserRepository
from core import DatabaseError, EntityNotFoundError, EntityAlreadyExistsError
from ..connection import DatabaseConnection


class UserRepositoryImpl(IUserRepository):
    """
    Реализация репозитория пользователей для PostgreSQL.
    Использует Simple Query Protocol (требование платформы).
    """
    
    def __init__(self, db: DatabaseConnection):
        self._db = db
        self._schema = db.schema
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Получить пользователя по ID"""
        try:
            with self._db.cursor() as cur:
                cur.execute(f"""
                    SELECT id, username, full_name, email, password_hash, 
                           position, photo_url, is_active, created_at, last_login
                    FROM {self._schema}.users
                    WHERE id = %s
                """, (user_id,))
                
                row = cur.fetchone()
                if not row:
                    return None
                
                return self._row_to_user(row)
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to get user by id: {str(e)}")
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Получить пользователя по username"""
        try:
            with self._db.cursor() as cur:
                cur.execute(f"""
                    SELECT id, username, full_name, email, password_hash,
                           position, photo_url, is_active, created_at, last_login
                    FROM {self._schema}.users
                    WHERE username = %s
                """, (username,))
                
                row = cur.fetchone()
                if not row:
                    return None
                
                return self._row_to_user(row)
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to get user by username: {str(e)}")
    
    def get_with_permissions(self, user_id: int) -> Optional[UserWithPermissions]:
        """Получить пользователя с ролями и разрешениями"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        try:
            # Получить роли
            with self._db.cursor() as cur:
                cur.execute(f"""
                    SELECT r.id, r.name, r.description
                    FROM {self._schema}.roles r
                    JOIN {self._schema}.user_roles ur ON r.id = ur.role_id
                    WHERE ur.user_id = %s
                """, (user_id,))
                
                roles = [
                    Role(id=row['id'], name=row['name'], description=row['description'])
                    for row in cur.fetchall()
                ]
            
            # Получить разрешения
            with self._db.cursor() as cur:
                cur.execute(f"""
                    SELECT DISTINCT p.id, p.name, p.resource, p.action, p.description
                    FROM {self._schema}.permissions p
                    JOIN {self._schema}.role_permissions rp ON p.id = rp.permission_id
                    JOIN {self._schema}.user_roles ur ON rp.role_id = ur.role_id
                    WHERE ur.user_id = %s
                """, (user_id,))
                
                permissions = [
                    Permission(
                        id=row['id'],
                        name=row['name'],
                        resource=row['resource'],
                        action=row['action'],
                        description=row['description']
                    )
                    for row in cur.fetchall()
                ]
            
            return UserWithPermissions(user=user, roles=roles, permissions=permissions)
            
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to get user with permissions: {str(e)}")
    
    def get_all_active(self) -> list[User]:
        """Получить всех активных пользователей"""
        try:
            with self._db.cursor() as cur:
                cur.execute(f"""
                    SELECT id, username, full_name, email, password_hash,
                           position, photo_url, is_active, created_at, last_login
                    FROM {self._schema}.users
                    WHERE is_active = true
                    ORDER BY full_name
                """)
                
                return [self._row_to_user(row) for row in cur.fetchall()]
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to get all active users: {str(e)}")
    
    def create(self, user: User) -> User:
        """Создать нового пользователя"""
        if self.exists_by_username(user.username):
            raise EntityAlreadyExistsError('User', 'username', user.username)
        
        try:
            with self._db.transaction():
                with self._db.cursor() as cur:
                    cur.execute(f"""
                        INSERT INTO {self._schema}.users 
                        (username, full_name, email, password_hash, position, 
                         photo_url, is_active, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        user.username,
                        user.full_name,
                        user.email,
                        user.password_hash,
                        user.position,
                        user.photo_url,
                        user.is_active,
                        user.created_at
                    ))
                    
                    row = cur.fetchone()
                    user.id = row['id']
                    return user
        except psycopg2.IntegrityError:
            raise EntityAlreadyExistsError('User', 'username', user.username)
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to create user: {str(e)}")
    
    def update(self, user: User) -> User:
        """Обновить существующего пользователя"""
        try:
            with self._db.transaction():
                with self._db.cursor() as cur:
                    cur.execute(f"""
                        UPDATE {self._schema}.users
                        SET username = %s, full_name = %s, email = %s,
                            password_hash = %s, position = %s, photo_url = %s,
                            is_active = %s, last_login = %s
                        WHERE id = %s
                        RETURNING id
                    """, (
                        user.username,
                        user.full_name,
                        user.email,
                        user.password_hash,
                        user.position,
                        user.photo_url,
                        user.is_active,
                        user.last_login,
                        user.id
                    ))
                    
                    if not cur.fetchone():
                        raise EntityNotFoundError('User', user.id)
                    
                    return user
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to update user: {str(e)}")
    
    def delete(self, user_id: int) -> bool:
        """Удалить пользователя"""
        try:
            with self._db.transaction():
                # Сначала удаляем связи
                with self._db.cursor() as cur:
                    cur.execute(f"""
                        DELETE FROM {self._schema}.user_roles WHERE user_id = %s
                    """, (user_id,))
                
                # Затем удаляем пользователя
                with self._db.cursor() as cur:
                    cur.execute(f"""
                        DELETE FROM {self._schema}.users WHERE id = %s
                    """, (user_id,))
                    
                    return cur.rowcount > 0
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to delete user: {str(e)}")
    
    def exists_by_username(self, username: str) -> bool:
        """Проверить существование пользователя с данным username"""
        try:
            with self._db.cursor() as cur:
                cur.execute(f"""
                    SELECT EXISTS(
                        SELECT 1 FROM {self._schema}.users WHERE username = %s
                    )
                """, (username,))
                
                return cur.fetchone()['exists']
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to check user existence: {str(e)}")
    
    def update_last_login(self, user_id: int, login_time: datetime) -> None:
        """Обновить время последнего входа"""
        try:
            with self._db.transaction():
                with self._db.cursor() as cur:
                    cur.execute(f"""
                        UPDATE {self._schema}.users
                        SET last_login = %s
                        WHERE id = %s
                    """, (login_time, user_id))
        except psycopg2.Error as e:
            raise DatabaseError(f"Failed to update last login: {str(e)}")
    
    @staticmethod
    def _row_to_user(row: dict) -> User:
        """Преобразовать строку БД в доменную сущность User"""
        return User(
            id=row['id'],
            username=row['username'],
            full_name=row['full_name'],
            email=row.get('email'),
            password_hash=row['password_hash'],
            position=row.get('position'),
            photo_url=row.get('photo_url'),
            is_active=row['is_active'],
            created_at=row['created_at'],
            last_login=row.get('last_login')
        )
