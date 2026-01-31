"""
Payment Repository Implementation
Полная реализация репозитория платежей.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
import psycopg2.extras

from domain import Payment, PaymentStatus, IPaymentRepository
from core import DatabaseError, EntityNotFoundError
from ..connection import DatabaseConnection


class PaymentRepositoryImpl(IPaymentRepository):
    """Реализация репозитория платежей"""
    
    def __init__(self, db: DatabaseConnection):
        self._db = db
        self._schema = db.schema
    
    def get_by_id(self, payment_id: int) -> Optional[Payment]:
        """Получить платёж по ID"""
        conn = self._db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            cur.execute(f"""
                SELECT p.*, c.name as category_name, c.icon as category_icon,
                       le.name as legal_entity_name, ct.name as contractor_name,
                       cd.name as department_name, s.name as service_name,
                       u.username as created_by_name
                FROM {self._schema}.payments p
                LEFT JOIN {self._schema}.categories c ON p.category_id = c.id
                LEFT JOIN {self._schema}.legal_entities le ON p.legal_entity_id = le.id
                LEFT JOIN {self._schema}.contractors ct ON p.contractor_id = ct.id
                LEFT JOIN {self._schema}.customer_departments cd ON p.department_id = cd.id
                LEFT JOIN {self._schema}.services s ON p.service_id = s.id
                LEFT JOIN {self._schema}.users u ON p.created_by = u.id
                WHERE p.id = %s
            """, (payment_id,))
            
            row = cur.fetchone()
            if not row:
                return None
            
            return self._map_to_payment(row)
            
        except Exception as e:
            raise DatabaseError(f"Failed to get payment: {str(e)}")
        finally:
            cur.close()
    
    def get_all(
        self,
        user_id: Optional[int] = None,
        status: Optional[PaymentStatus] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Payment]:
        """Получить список платежей"""
        conn = self._db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            query = f"""
                SELECT p.*, c.name as category_name, c.icon as category_icon,
                       le.name as legal_entity_name, ct.name as contractor_name,
                       cd.name as department_name, s.name as service_name,
                       u.username as created_by_name
                FROM {self._schema}.payments p
                LEFT JOIN {self._schema}.categories c ON p.category_id = c.id
                LEFT JOIN {self._schema}.legal_entities le ON p.legal_entity_id = le.id
                LEFT JOIN {self._schema}.contractors ct ON p.contractor_id = ct.id
                LEFT JOIN {self._schema}.customer_departments cd ON p.department_id = cd.id
                LEFT JOIN {self._schema}.services s ON p.service_id = s.id
                LEFT JOIN {self._schema}.users u ON p.created_by = u.id
                WHERE 1=1
            """
            params = []
            
            if user_id:
                query += " AND p.created_by = %s"
                params.append(user_id)
            
            if status:
                query += " AND p.status = %s"
                params.append(status.value)
            
            query += " ORDER BY p.payment_date DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            
            cur.execute(query, tuple(params))
            rows = cur.fetchall()
            
            return [self._map_to_payment(row) for row in rows]
            
        except Exception as e:
            raise DatabaseError(f"Failed to get payments: {str(e)}")
        finally:
            cur.close()
    
    def get_pending_for_approval(self, approver_id: int, is_final: bool) -> List[Payment]:
        """Получить платежи для согласования"""
        status = 'awaiting_final' if is_final else 'awaiting_intermediate'
        conn = self._db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            cur.execute(f"""
                SELECT p.* FROM {self._schema}.payments p
                JOIN {self._schema}.services s ON p.service_id = s.id
                WHERE p.status = %s
                AND (
                    (%s AND s.final_approver_id = %s)
                    OR (NOT %s AND s.intermediate_approver_id = %s)
                )
                ORDER BY p.submitted_at
            """, (status, is_final, approver_id, is_final, approver_id))
            
            rows = cur.fetchall()
            return [self._map_to_payment(row) for row in rows]
            
        except Exception as e:
            raise DatabaseError(f"Failed to get pending approvals: {str(e)}")
        finally:
            cur.close()
    
    def create(self, payment: Payment) -> Payment:
        """Создать платёж"""
        conn = self._db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            cur.execute(f"""
                INSERT INTO {self._schema}.payments 
                (category, category_id, amount, description, payment_date, 
                 legal_entity_id, contractor_id, department_id, service_id,
                 invoice_number, invoice_date, created_by, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                payment.category_name, payment.category_id, payment.amount,
                payment.description, payment.payment_date, payment.legal_entity_id,
                payment.contractor_id, payment.department_id, payment.service_id,
                payment.invoice_number, payment.invoice_date, payment.created_by,
                payment.status.value
            ))
            
            row = cur.fetchone()
            conn.commit()
            
            return self._map_to_payment(row)
            
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Failed to create payment: {str(e)}")
        finally:
            cur.close()
    
    def update(self, payment: Payment) -> Payment:
        """Обновить платёж"""
        conn = self._db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            cur.execute(f"""
                UPDATE {self._schema}.payments
                SET category_id = %s, amount = %s, description = %s,
                    payment_date = %s, legal_entity_id = %s, contractor_id = %s,
                    department_id = %s, status = %s
                WHERE id = %s
                RETURNING *
            """, (
                payment.category_id, payment.amount, payment.description,
                payment.payment_date, payment.legal_entity_id, payment.contractor_id,
                payment.department_id, payment.status.value, payment.id
            ))
            
            row = cur.fetchone()
            if not row:
                raise EntityNotFoundError("Payment", payment.id)
            
            conn.commit()
            return self._map_to_payment(row)
            
        except EntityNotFoundError:
            raise
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Failed to update payment: {str(e)}")
        finally:
            cur.close()
    
    def delete(self, payment_id: int) -> bool:
        """Удалить платёж"""
        conn = self._db.get_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(f"DELETE FROM {self._schema}.payments WHERE id = %s", (payment_id,))
            deleted = cur.rowcount > 0
            conn.commit()
            return deleted
            
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Failed to delete payment: {str(e)}")
        finally:
            cur.close()
    
    def count_by_status(self, status: PaymentStatus) -> int:
        """Подсчитать платежи по статусу"""
        conn = self._db.get_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(
                f"SELECT COUNT(*) FROM {self._schema}.payments WHERE status = %s",
                (status.value,)
            )
            return cur.fetchone()[0]
            
        except Exception as e:
            raise DatabaseError(f"Failed to count payments: {str(e)}")
        finally:
            cur.close()
    
    def get_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Получить статистику"""
        conn = self._db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            query = f"""
                SELECT 
                    c.id, c.name, c.icon,
                    COALESCE(SUM(p.amount), 0) as total
                FROM {self._schema}.categories c
                LEFT JOIN {self._schema}.payments p ON c.id = p.category_id
            """
            params = []
            
            if start_date or end_date:
                query += " WHERE"
                conditions = []
                if start_date:
                    conditions.append(" p.payment_date >= %s")
                    params.append(start_date)
                if end_date:
                    conditions.append(" p.payment_date <= %s")
                    params.append(end_date)
                query += " AND".join(conditions)
            
            query += " GROUP BY c.id, c.name, c.icon ORDER BY total DESC"
            
            cur.execute(query, tuple(params))
            categories = [dict(row) for row in cur.fetchall()]
            
            cur.execute(
                f"SELECT COALESCE(SUM(amount), 0) as grand_total FROM {self._schema}.payments",
                ()
            )
            grand_total = cur.fetchone()['grand_total']
            
            return {
                'categories': categories,
                'grand_total': float(grand_total)
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get statistics: {str(e)}")
        finally:
            cur.close()
    
    def _map_to_payment(self, row: Dict) -> Payment:
        """Маппинг строки БД в объект Payment"""
        return Payment(
            id=row['id'],
            category_id=row['category_id'],
            category_name=row.get('category_name', ''),
            amount=float(row['amount']),
            description=row.get('description', ''),
            payment_date=row.get('payment_date'),
            created_at=row.get('created_at'),
            legal_entity_id=row.get('legal_entity_id'),
            contractor_id=row.get('contractor_id'),
            department_id=row.get('department_id'),
            service_id=row.get('service_id'),
            invoice_number=row.get('invoice_number'),
            invoice_date=row.get('invoice_date'),
            status=PaymentStatus(row.get('status', 'draft')),
            created_by=row.get('created_by')
        )