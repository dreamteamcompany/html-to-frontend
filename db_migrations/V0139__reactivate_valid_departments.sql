
UPDATE customer_departments SET is_active = true WHERE id IN (1, 2, 5, 7) AND name NOT LIKE '[АРХИВ]%';
