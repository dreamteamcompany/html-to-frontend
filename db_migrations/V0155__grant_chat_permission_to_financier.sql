INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 8, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.resource = 'chat' AND p.action = 'read'
ON CONFLICT DO NOTHING;
