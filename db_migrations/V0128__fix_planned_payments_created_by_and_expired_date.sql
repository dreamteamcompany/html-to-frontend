-- Проставляем created_by = 1 (admin) для всех planned_payments где created_by IS NULL
UPDATE t_p61788166_html_to_frontend.planned_payments
SET created_by = 1
WHERE created_by IS NULL;

-- Обновляем просроченный платёж id=1 (дата 13 марта 2026 уже прошла) на следующий месяц
UPDATE t_p61788166_html_to_frontend.planned_payments
SET planned_date = '2026-04-13 00:00:00'
WHERE id = 1 AND planned_date < NOW() AND converted_to_payment_id IS NULL;