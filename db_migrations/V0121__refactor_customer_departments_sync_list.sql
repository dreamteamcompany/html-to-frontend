-- Шаг 1: Переносим данные дублей на каноничные ID
UPDATE t_p61788166_html_to_frontend.payments SET department_id = 7 WHERE department_id = 15;
UPDATE t_p61788166_html_to_frontend.payments SET department_id = 2 WHERE department_id = 20;

-- Шаг 2: Сначала помечаем дубли (чтобы освободить уникальные имена)
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id4 Отдел информационных технологий' WHERE id = 4;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id6 Отдел Обучения'                  WHERE id = 6;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id8 Отдел безопасности'              WHERE id = 8;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id15 Отдел Юристов'                  WHERE id = 15;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id17 Информационная безопасность'    WHERE id = 17;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id19 Отдел маркетинга'               WHERE id = 19;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id20 Отдел Маркетинга'               WHERE id = 20;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '[УДАЛИТЬ] id24 МИС дубль'                      WHERE id = 24;

-- Шаг 3: Переименовываем каноничные записи
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'Отдел разработки и поддержки МИС'                             WHERE id = 1;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'Финансовая служба'                                              WHERE id = 3;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'Департамент управления персоналом и организационного развития'  WHERE id = 5;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'Бухгалтерия'                                                    WHERE id = 16;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'Служба технической поддержки'                                  WHERE id = 18;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'Отдел развития IT продуктов'                                   WHERE id = 22;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = 'КЦ вторичного отдела продаж УК'                                WHERE id = 23;

-- Шаг 4: Добавляем новые отделы
INSERT INTO t_p61788166_html_to_frontend.customer_departments (name) VALUES
  ('Отделы УК'),
  ('Отдел перспективного развития'),
  ('Главный врач УК'),
  ('Отдел закупок и логистики'),
  ('Отдел контроля качества');
