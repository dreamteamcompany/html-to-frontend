CREATE TABLE t_p93576920_talent_studio_projec.certificates_log (
    id SERIAL PRIMARY KEY,
    result_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    contest_name TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);