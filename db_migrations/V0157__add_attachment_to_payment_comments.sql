ALTER TABLE t_p61788166_html_to_frontend.payment_comments
    ADD COLUMN attachment_url TEXT NULL,
    ADD COLUMN attachment_name VARCHAR(255) NULL;

COMMENT ON COLUMN t_p61788166_html_to_frontend.payment_comments.attachment_url IS 'Ссылка на прикреплённый к комментарию файл (S3/CDN)';
COMMENT ON COLUMN t_p61788166_html_to_frontend.payment_comments.attachment_name IS 'Исходное имя прикреплённого файла';