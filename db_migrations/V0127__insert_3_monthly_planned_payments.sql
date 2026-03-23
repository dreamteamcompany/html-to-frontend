-- 3 запланированных ежемесячных платежа с датой окончания 31.12.2030

-- 1. ChatGPT — Для команды Ильи — наличные — Отдел развития IT продуктов — 25 числа
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (20, 2350.00, 'Для команды Ильи', '2026-04-25 00:00:00', 23, 22, 14, 'monthly', '2030-12-31', true);

-- 2. SmsFast — Иностранные сим-карты — наличные — Служба технической поддержки — 25 числа
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (17, 1700.00, 'Иностранные сим-карты для регистрации иностранных сервисов', '2026-04-25 00:00:00', 23, 18, 16, 'monthly', '2030-12-31', true);

-- 3. MyBI Connect — Сервис для поставщиков рекламных интеграций — ИП Петросян — Отдел развития IT продуктов — 8 числа
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (14, 8250.00, 'Сервис для добавления поставщиков рекламных интеграций в аналитику', '2026-04-08 00:00:00', 5, 22, 26, 'monthly', '2030-12-31', true);
