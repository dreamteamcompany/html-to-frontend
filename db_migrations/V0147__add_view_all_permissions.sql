-- Add payments.view_all and users.view_all permissions, grant to Admin (id=1) and Финансист (id=8)

INSERT INTO t_p61788166_html_to_frontend.permissions (name, description, resource, action)
VALUES ('payments.view_all', 'Просмотр всех платежей компании', 'payments', 'view_all')
ON CONFLICT DO NOTHING;

INSERT INTO t_p61788166_html_to_frontend.permissions (name, description, resource, action)
VALUES ('users.view_all', 'Просмотр списка пользователей', 'users', 'view_all')
ON CONFLICT DO NOTHING;

INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 1, p.id FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name = 'payments.view_all'
AND NOT EXISTS (
    SELECT 1 FROM t_p61788166_html_to_frontend.role_permissions rp
    WHERE rp.role_id = 1 AND rp.permission_id = p.id
);

INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 1, p.id FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name = 'users.view_all'
AND NOT EXISTS (
    SELECT 1 FROM t_p61788166_html_to_frontend.role_permissions rp
    WHERE rp.role_id = 1 AND rp.permission_id = p.id
);

INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 8, p.id FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name = 'payments.view_all'
AND NOT EXISTS (
    SELECT 1 FROM t_p61788166_html_to_frontend.role_permissions rp
    WHERE rp.role_id = 8 AND rp.permission_id = p.id
);

INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 8, p.id FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name = 'users.view_all'
AND NOT EXISTS (
    SELECT 1 FROM t_p61788166_html_to_frontend.role_permissions rp
    WHERE rp.role_id = 8 AND rp.permission_id = p.id
);
