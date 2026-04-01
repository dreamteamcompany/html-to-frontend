-- Исправление: обновляем payment_date на invoice_date для платежей,
-- у которых payment_date совпадает с created_at (баг: дата платежа была = дате создания)
-- и при этом есть реальная дата счёта (invoice_date)
UPDATE t_p61788166_html_to_frontend.payments
SET payment_date = invoice_date::timestamp
WHERE invoice_date IS NOT NULL
  AND ABS(EXTRACT(EPOCH FROM (payment_date - created_at))) < 1;