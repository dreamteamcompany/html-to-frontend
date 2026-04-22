-- Grant 'monitoring.read' permission to CEO role (view access to Monitoring section)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM t_p61788166_html_to_frontend.roles r
CROSS JOIN t_p61788166_html_to_frontend.permissions p
WHERE r.name = 'CEO'
  AND p.resource = 'monitoring'
  AND p.action = 'read'
  AND NOT EXISTS (
    SELECT 1
    FROM t_p61788166_html_to_frontend.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
