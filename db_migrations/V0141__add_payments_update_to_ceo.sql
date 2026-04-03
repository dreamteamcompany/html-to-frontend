
-- Добавляем право payments.update для CEO (id=7), которое требуется для согласования
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 7, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name = 'payments.update'
ON CONFLICT DO NOTHING;
