-- Делаем work_file_url необязательным путем изменения типа колонки
ALTER TABLE t_p93576920_talent_studio_projec.applications 
ALTER COLUMN work_file_url TYPE text,
ALTER COLUMN work_file_url SET DEFAULT '';