-- Переносим связанные сервисы с удаляемых отделов на каноничные
UPDATE t_p61788166_html_to_frontend.services SET customer_department_id = 7    WHERE customer_department_id = 15;
UPDATE t_p61788166_html_to_frontend.services SET customer_department_id = 2    WHERE customer_department_id = 20;
UPDATE t_p61788166_html_to_frontend.services SET customer_department_id = NULL WHERE customer_department_id = 6;

-- Переименовываем в _ARCHIVE_ чтобы скрыть из UI
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Отдел информационных технологий' WHERE id = 4;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Отдел Обучения'                  WHERE id = 6;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Отдел безопасности'              WHERE id = 8;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Отдел Юристов'                   WHERE id = 15;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Информационная безопасность'     WHERE id = 17;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Отдел маркетинга'                WHERE id = 19;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ Отдел Маркетинга'                WHERE id = 20;
UPDATE t_p61788166_html_to_frontend.customer_departments SET name = '_ARCHIVE_ МИС дубль'                       WHERE id = 24;
