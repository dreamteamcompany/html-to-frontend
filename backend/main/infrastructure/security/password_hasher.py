"""
Password Hasher
Сервис для хеширования и проверки паролей с использованием bcrypt.
"""
import bcrypt


class PasswordHasher:
    """
    Сервис хеширования паролей.
    Использует bcrypt для безопасного хранения паролей.
    """
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Захешировать пароль.
        Returns: строка с хешем пароля (bcrypt salt + hash).
        """
        if not password:
            raise ValueError("Password cannot be empty")
        
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """
        Проверить соответствие пароля хешу.
        Returns: True если пароль верный, False иначе.
        """
        if not password or not password_hash:
            return False
        
        try:
            password_bytes = password.encode('utf-8')
            hash_bytes = password_hash.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hash_bytes)
        except Exception:
            return False
