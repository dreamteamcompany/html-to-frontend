INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 7, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name = 'services.read'
  AND NOT EXISTS (
    SELECT 1 FROM t_p61788166_html_to_frontend.role_permissions rp
    WHERE rp.role_id = 7 AND rp.permission_id = p.id
  );
