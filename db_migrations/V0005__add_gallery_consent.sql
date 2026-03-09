-- Добавление поля согласия на публикацию в галерее
ALTER TABLE applications ADD COLUMN IF NOT EXISTS gallery_consent BOOLEAN DEFAULT true;

-- Добавление того же поля в таблицу results
ALTER TABLE results ADD COLUMN IF NOT EXISTS gallery_consent BOOLEAN DEFAULT true;