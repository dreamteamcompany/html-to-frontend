INSERT INTO t_p61788166_html_to_frontend.contractors (name, notes)
VALUES ('Cloud AI', 'Сервисы искусственного интеллекта: обработка данных, OCR, автоматизация и аналитика');

INSERT INTO t_p61788166_html_to_frontend.services (name, description, category_id, legal_entity_id, contractor_id, customer_department_id)
VALUES (
    'Cloud AI',
    'Для команды Ильи - сервисы искусственного интеллекта: обработка данных, OCR, автоматизация и аналитика',
    20,
    23,
    (SELECT id FROM t_p61788166_html_to_frontend.contractors WHERE name = 'Cloud AI' ORDER BY id DESC LIMIT 1),
    22
);