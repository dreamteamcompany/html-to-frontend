
-- Новые права: согласование / отмена согласования / отклонение запланированных платежей
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('planned_payments.approve',   'planned_payments', 'approve',   'Согласование запланированных платежей'),
  ('planned_payments.unapprove', 'planned_payments', 'unapprove', 'Отмена согласования запланированных платежей'),
  ('planned_payments.reject',    'planned_payments', 'reject',    'Отклонение запланированных платежей')
ON CONFLICT (name) DO NOTHING;

-- Привязка к роли Администратор (id=1)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN ('planned_payments.approve','planned_payments.unapprove','planned_payments.reject')
ON CONFLICT DO NOTHING;

-- Привязка к роли CEO (id=7)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 7, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN ('planned_payments.approve','planned_payments.unapprove','planned_payments.reject')
ON CONFLICT DO NOTHING;

-- Привязка к роли Финансист (id=8)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 8, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN ('planned_payments.approve','planned_payments.unapprove','planned_payments.reject')
ON CONFLICT DO NOTHING;
