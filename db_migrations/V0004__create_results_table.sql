-- Создание таблицы для хранения результатов конкурсов
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id),
    full_name VARCHAR(255) NOT NULL,
    age INTEGER,
    teacher VARCHAR(255),
    institution VARCHAR(255),
    work_title VARCHAR(255),
    email VARCHAR(255),
    contest_id INTEGER,
    contest_name VARCHAR(255),
    work_file_url TEXT,
    result VARCHAR(100),
    place INTEGER,
    score DECIMAL(5,2),
    diploma_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрой фильтрации
CREATE INDEX IF NOT EXISTS idx_results_contest_id ON results(contest_id);
CREATE INDEX IF NOT EXISTS idx_results_contest_name ON results(contest_name);
CREATE INDEX IF NOT EXISTS idx_results_result ON results(result);
CREATE INDEX IF NOT EXISTS idx_results_place ON results(place);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at);