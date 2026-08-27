CREATE TABLE t_p61788166_html_to_frontend.bitrix_chat_messages (
    id SERIAL PRIMARY KEY,
    bitrix_user_id VARCHAR(64) NOT NULL,
    user_id INTEGER NULL REFERENCES t_p61788166_html_to_frontend.users(id),
    message_text TEXT NOT NULL,
    bitrix_message_id VARCHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bitrix_chat_messages_user ON t_p61788166_html_to_frontend.bitrix_chat_messages(user_id);
CREATE INDEX idx_bitrix_chat_messages_created ON t_p61788166_html_to_frontend.bitrix_chat_messages(created_at DESC);

INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('chat.read', 'chat', 'read', 'Просмотр чата с ботом Битрикс24')
ON CONFLICT (name) DO NOTHING;

INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM t_p61788166_html_to_frontend.roles r
CROSS JOIN t_p61788166_html_to_frontend.permissions p
WHERE r.name IN ('Администратор', 'CEO')
  AND p.resource = 'chat' AND p.action = 'read'
ON CONFLICT DO NOTHING;
