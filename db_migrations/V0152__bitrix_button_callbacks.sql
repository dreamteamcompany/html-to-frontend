CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.bitrix_message_links (
    id SERIAL PRIMARY KEY,
    bitrix_user_id VARCHAR(64) NOT NULL,
    bitrix_message_id VARCHAR(64) NOT NULL,
    bitrix_dialog_id VARCHAR(64),
    payment_id INTEGER NOT NULL,
    user_id INTEGER,
    purpose VARCHAR(32) NOT NULL DEFAULT 'approval',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (bitrix_user_id, bitrix_message_id)
);

CREATE INDEX IF NOT EXISTS idx_bitrix_msg_links_user ON t_p61788166_html_to_frontend.bitrix_message_links(bitrix_user_id);
CREATE INDEX IF NOT EXISTS idx_bitrix_msg_links_payment ON t_p61788166_html_to_frontend.bitrix_message_links(payment_id);

CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.bitrix_pending_comments (
    id SERIAL PRIMARY KEY,
    bitrix_user_id VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER,
    payment_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 minutes')
);

CREATE INDEX IF NOT EXISTS idx_bitrix_pending_user ON t_p61788166_html_to_frontend.bitrix_pending_comments(bitrix_user_id);
