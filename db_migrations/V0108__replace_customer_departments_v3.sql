-- Деактивируем все существующие отделы
UPDATE t_p61788166_html_to_frontend.customer_departments SET is_active = false;

-- Добавляем только новые отделы (без "Отдел обучения" - он уже есть, активируем его отдельно)
INSERT INTO t_p61788166_html_to_frontend.customer_departments (name, description, is_active, created_at, updated_at) VALUES
  ('Юристы', NULL, true, NOW(), NOW()),
  ('Бухгалтерия', NULL, true, NOW(), NOW()),
  ('Информационная безопасность', NULL, true, NOW(), NOW()),
  ('Техническая поддержка', NULL, true, NOW(), NOW()),
  ('Отдел маркетинга', NULL, true, NOW(), NOW()),
  ('Отлел маркетинга', NULL, true, NOW(), NOW()),
  ('Клиники', NULL, true, NOW(), NOW());

-- Реактивируем "Отдел обучения" который уже был в таблице
UPDATE t_p61788166_html_to_frontend.customer_departments SET is_active = true WHERE name = 'Отдел обучения';
