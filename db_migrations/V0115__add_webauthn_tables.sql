
CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.webauthn_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p61788166_html_to_frontend.users(id),
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    sign_count INTEGER NOT NULL DEFAULT 0,
    device_name VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_webauthn_creds_user_id ON t_p61788166_html_to_frontend.webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_creds_cred_id ON t_p61788166_html_to_frontend.webauthn_credentials(credential_id);

CREATE TABLE IF NOT EXISTS t_p61788166_html_to_frontend.webauthn_challenges (
    id SERIAL PRIMARY KEY,
    challenge TEXT NOT NULL UNIQUE,
    user_id INTEGER NULL,
    challenge_type VARCHAR(20) NOT NULL DEFAULT 'authentication',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes')
);

CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_ch ON t_p61788166_html_to_frontend.webauthn_challenges(challenge);
