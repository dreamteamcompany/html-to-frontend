"""
JWT Service
Сервис для создания и валидации JWT токенов.
Токены НЕ хранятся в БД (stateless).
"""
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from core import get_config, InvalidTokenError, TokenExpiredError


class JWTService:
    """
    Сервис для работы с JWT токенами.
    Генерирует access и refresh токены, валидирует их.
    """
    
    def __init__(self):
        self._config = get_config().jwt
    
    def create_access_token(self, user_id: int, additional_claims: Optional[Dict[str, Any]] = None) -> str:
        """
        Создать access токен.
        
        Args:
            user_id: ID пользователя
            additional_claims: дополнительные claims (например, роли)
        
        Returns:
            JWT токен (строка)
        """
        now = datetime.utcnow()
        expires = now + timedelta(minutes=self._config.access_token_expire_minutes)
        
        payload = {
            'user_id': user_id,
            'type': 'access',
            'iat': now,
            'exp': expires
        }
        
        if additional_claims:
            payload.update(additional_claims)
        
        token = jwt.encode(
            payload,
            self._config.secret_key,
            algorithm=self._config.algorithm
        )
        
        return token
    
    def create_refresh_token(self, user_id: int) -> str:
        """
        Создать refresh токен.
        Живёт дольше access токена.
        """
        now = datetime.utcnow()
        expires = now + timedelta(days=self._config.refresh_token_expire_days)
        
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': now,
            'exp': expires
        }
        
        token = jwt.encode(
            payload,
            self._config.secret_key,
            algorithm=self._config.algorithm
        )
        
        return token
    
    def verify_token(self, token: str, token_type: str = 'access') -> Dict[str, Any]:
        """
        Проверить и декодировать токен.
        
        Args:
            token: JWT токен
            token_type: тип токена ('access' или 'refresh')
        
        Returns:
            Payload токена (dict с user_id и другими claims)
        
        Raises:
            InvalidTokenError: если токен невалиден
            TokenExpiredError: если токен истёк
        """
        try:
            payload = jwt.decode(
                token,
                self._config.secret_key,
                algorithms=[self._config.algorithm]
            )
            
            # Проверка типа токена
            if payload.get('type') != token_type:
                raise InvalidTokenError()
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except jwt.InvalidTokenError:
            raise InvalidTokenError()
        except Exception:
            raise InvalidTokenError()
    
    def refresh_access_token(self, refresh_token: str) -> str:
        """
        Обновить access токен используя refresh токен.
        
        Args:
            refresh_token: валидный refresh токен
        
        Returns:
            Новый access токен
        """
        payload = self.verify_token(refresh_token, token_type='refresh')
        user_id = payload['user_id']
        return self.create_access_token(user_id)
