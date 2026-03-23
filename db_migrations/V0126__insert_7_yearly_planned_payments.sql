-- 7 запланированных ежегодных платежей с датой окончания 31.12.2030

-- 1. Timeweb 3 — Домен permdental.ru — ООО «МЕДИЦИНА» — Служба технической поддержки
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (11, 2990.00, 'Домен permdental.ru', '2027-01-11 00:00:00', 18, 18, 50, 'yearly', '2030-12-31', true);

-- 2. Timeweb 3 — Домен permdental.ru — ООО «СТОМАТОЛОГИЯ ОМСК» — Служба технической поддержки
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (11, 2990.00, 'Домен permdental.ru', '2027-01-11 00:00:00', 15, 18, 50, 'yearly', '2030-12-31', true);

-- 3. iSpring — Система iSpring — Отдел Обучения (без юр. лица)
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (15, 327000.00, 'Система iSpring', '2026-05-25 00:00:00', 6, 29, 'yearly', '2030-12-31', true);

-- 4. Zoom 1 — Корпоративный Zoom — наличные (legal_entity_id=23) — Отдел Обучения
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (12, 16000.00, 'Корпоративный Zoom', '2027-03-15 00:00:00', 23, 6, 19, 'yearly', '2030-12-31', true);

-- 5. Zoom 2 — Корпоративный Zoom — наличные (legal_entity_id=23) — Руководство компании
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (12, 16000.00, 'Корпоративный Zoom', '2027-03-05 00:00:00', 23, 31, 36, 'yearly', '2030-12-31', true);

-- 6. Контур Фокус — Система проверки контрагентов — ООО «ДРИМ ТИМ» — Отдел Юристов
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (19, 85236.00, 'Система проверки контрагентов', '2027-02-28 00:00:00', 22, 15, 35, 'yearly', '2030-12-31', true);

-- 7. Kaspersky Password Manager — наличные (legal_entity_id=23) — Служба технической поддержки
INSERT INTO t_p61788166_html_to_frontend.planned_payments
  (category_id, amount, description, planned_date, legal_entity_id, department_id, service_id, recurrence_type, recurrence_end_date, is_active)
VALUES
  (18, 1490.00, 'Централизованное хранилище паролей IT', '2027-03-18 00:00:00', 23, 18, 40, 'yearly', '2030-12-31', true);
