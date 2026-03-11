ALTER TABLE t_p61788166_html_to_frontend.notifications
    ADD COLUMN IF NOT EXISTS payment_id INTEGER NULL REFERENCES t_p61788166_html_to_frontend.payments(id),
    ADD COLUMN IF NOT EXISTS metadata JSONB NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON t_p61788166_html_to_frontend.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_payment_id ON t_p61788166_html_to_frontend.notifications(payment_id);
