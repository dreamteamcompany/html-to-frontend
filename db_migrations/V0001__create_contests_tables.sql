-- Создание таблицы категорий конкурсов
CREATE TABLE contest_categories (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы конкурсов
CREATE TABLE contests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(100) REFERENCES contest_categories(category_id),
    deadline DATE NOT NULL,
    price INTEGER DEFAULT 200,
    status VARCHAR(20) DEFAULT 'active',
    rules_file_url TEXT,
    diploma_sample_url TEXT,
    image_url TEXT,
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка категорий конкурсов
INSERT INTO contest_categories (category_id, name) VALUES
('visual-arts', 'Конкурсы изобразительного искусства'),
('decorative-arts', 'Конкурсы декоративно-прикладного искусства'),
('nature', 'Конкурсы, посвященные теме природы'),
('animals', 'Конкурсы, посвященные теме животных'),
('plants', 'Конкурсы, посвященные теме растений');

-- Вставка начальных конкурсов из существующих данных
INSERT INTO contests (title, description, category_id, deadline, price, status, rules_file_url, diploma_sample_url, image_url, participants_count) VALUES
('Искусство натюрморта', 'Раскройте красоту повседневных предметов через натюрморт', 'visual-arts', '2026-03-15', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/48ff83da-4e09-4b07-a560-059b852682d8.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/4b6a84c1-0d14-4cd0-808d-931cf4717fc6.png', 127),
('Искусство пейзажа', 'Покажите великолепие природы акварельными красками', 'visual-arts', '2026-03-22', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/30e5847b-04a5-478c-a023-a40545b07c2d.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c292555b-b350-4398-84d2-4cabd4ba840a.png', 89),
('Креативный скетчинг', 'Быстрые зарисовки, полные эмоций и творчества', 'visual-arts', '2026-04-10', 200, 'new', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/11b0ba7c-caaa-4e51-9b85-e2de7846f707.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/de6860cc-96a4-410b-979a-3824771d6fb6.png', 156),
('Разноцветные карандаши', 'Графические работы, наполненные яркими красками', 'visual-arts', '2026-04-05', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/48ff83da-4e09-4b07-a560-059b852682d8.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/fc222fbf-474a-4d96-8496-24c5edfe83eb.png', 73),
('Мастерство керамики', 'Создайте уникальные изделия из глины своими руками', 'decorative-arts', '2026-03-20', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/30e5847b-04a5-478c-a023-a40545b07c2d.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/4b6a84c1-0d14-4cd0-808d-931cf4717fc6.png', 64),
('Волшебство вышивки', 'Вышитые узоры, передающие красоту и традиции', 'decorative-arts', '2026-04-01', 200, 'new', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/11b0ba7c-caaa-4e51-9b85-e2de7846f707.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c292555b-b350-4398-84d2-4cabd4ba840a.png', 98),
('Красота родной природы', 'Пейзажи, вдохновленные природой родного края', 'nature', '2026-04-15', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/30e5847b-04a5-478c-a023-a40545b07c2d.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/de6860cc-96a4-410b-979a-3824771d6fb6.png', 142),
('Времена года', 'Отразите смену сезонов и их неповторимую атмосферу', 'nature', '2026-03-25', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/48ff83da-4e09-4b07-a560-059b852682d8.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/fc222fbf-474a-4d96-8496-24c5edfe83eb.png', 87),
('Мир животных', 'Портреты животных, передающие их характер и грацию', 'animals', '2026-04-10', 200, 'new', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/11b0ba7c-caaa-4e51-9b85-e2de7846f707.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/4b6a84c1-0d14-4cd0-808d-931cf4717fc6.png', 176),
('Мой любимый питомец', 'Изобразите своего домашнего любимца с любовью', 'animals', '2026-04-05', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/48ff83da-4e09-4b07-a560-059b852682d8.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c292555b-b350-4398-84d2-4cabd4ba840a.png', 203),
('Цветочная фантазия', 'Нежные цветочные композиции в акварельной технике', 'plants', '2026-03-18', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/30e5847b-04a5-478c-a023-a40545b07c2d.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/de6860cc-96a4-410b-979a-3824771d6fb6.png', 112),
('Сад чудес', 'Волшебные растительные миры в графике', 'plants', '2026-03-30', 200, 'active', '#', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/11b0ba7c-caaa-4e51-9b85-e2de7846f707.png', 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/fc222fbf-474a-4d96-8496-24c5edfe83eb.png', 95);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_contests_category ON contests(category_id);
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_deadline ON contests(deadline);