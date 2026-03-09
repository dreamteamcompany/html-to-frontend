INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('custom_fields.remove', 'custom_fields', 'remove', 'Удаление дополнительных полей'),
  ('contractors.remove', 'contractors', 'remove', 'Удаление контрагентов')
ON CONFLICT (name) DO NOTHING;

INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 1, id FROM t_p61788166_html_to_frontend.permissions 
WHERE name IN ('custom_fields.remove', 'contractors.remove')
ON CONFLICT DO NOTHING;