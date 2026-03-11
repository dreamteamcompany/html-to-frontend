CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(128) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time
    ON t_p61788166_html_to_frontend.login_attempts (ip_address, attempted_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_time
    ON t_p61788166_html_to_frontend.login_attempts (username, attempted_at);
