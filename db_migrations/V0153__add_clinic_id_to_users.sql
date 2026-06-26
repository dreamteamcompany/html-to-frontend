ALTER TABLE t_p61788166_html_to_frontend.users
  ADD COLUMN IF NOT EXISTS clinic_id INTEGER NULL;

CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON t_p61788166_html_to_frontend.users(clinic_id);