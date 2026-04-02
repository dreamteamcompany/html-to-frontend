CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP DEFAULT NOW()
);