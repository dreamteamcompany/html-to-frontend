ALTER TABLE t_p61788166_html_to_frontend.bitrix_chat_messages
    ADD COLUMN direction VARCHAR(10) NOT NULL DEFAULT 'user';

COMMENT ON COLUMN t_p61788166_html_to_frontend.bitrix_chat_messages.direction IS 'user — сообщение от человека боту, bot — ответ/уведомление бота человеку';