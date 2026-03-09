-- Добавляем колонки для хранения файла и статуса оплаты
ALTER TABLE t_p93576920_talent_studio_projec.applications 
ADD COLUMN IF NOT EXISTS work_file TEXT,
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';