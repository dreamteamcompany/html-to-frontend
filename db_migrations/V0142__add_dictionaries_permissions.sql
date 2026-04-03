
-- Новый ресурс "Справочники" — общий уровень доступа ко всем справочникам
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('dictionaries.create', 'dictionaries', 'create', 'Создание записей в справочниках'),
  ('dictionaries.read',   'dictionaries', 'read',   'Просмотр справочников'),
  ('dictionaries.update', 'dictionaries', 'update',  'Редактирование записей в справочниках'),
  ('dictionaries.remove', 'dictionaries', 'remove',  'Удаление записей из справочников')
ON CONFLICT (name) DO NOTHING;

-- Привязка к роли Администратор (id=1)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN ('dictionaries.create','dictionaries.read','dictionaries.update','dictionaries.remove')
ON CONFLICT DO NOTHING;

-- Привязка к роли CEO (id=7)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 7, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN ('dictionaries.create','dictionaries.read','dictionaries.update','dictionaries.remove')
ON CONFLICT DO NOTHING;

-- Привязка к роли Финансист (id=8)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 8, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN ('dictionaries.create','dictionaries.read','dictionaries.update','dictionaries.remove')
ON CONFLICT DO NOTHING;
