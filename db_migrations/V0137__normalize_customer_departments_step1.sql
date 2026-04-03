
-- 1. Объединяем id=15 "Отдел Юристов" → id=7 "Юридический отдел" (перенос связей)
UPDATE payments SET department_id = 7 WHERE department_id = 15;
UPDATE planned_payments SET department_id = 7 WHERE department_id = 15;
UPDATE services SET customer_department_id = 7 WHERE customer_department_id = 15;

-- 2. Объединяем id=20 "Отдел Маркетинга" → id=2 "Департамент маркетинга" (перенос связей)
UPDATE payments SET department_id = 2 WHERE department_id = 20;
UPDATE planned_payments SET department_id = 2 WHERE department_id = 20;
UPDATE services SET customer_department_id = 2 WHERE customer_department_id = 20;

-- 3. Исправляем название: IT → ИТ
UPDATE customer_departments SET name = 'Отдел развития ИТ продуктов' WHERE id = 22;

-- 4. Исправляем регистр: вторичного → Вторичного
UPDATE customer_departments SET name = 'КЦ Вторичного отдела продаж УК' WHERE id = 23;

-- 5. Помечаем дубли и лишние записи как архивные (мягкое удаление)
UPDATE customer_departments SET name = '[АРХИВ] Отдел Юристов → Юридический отдел' WHERE id = 15;
UPDATE customer_departments SET name = '[АРХИВ] Отдел маркетинга → Департамент маркетинга' WHERE id = 19;
UPDATE customer_departments SET name = '[АРХИВ] Отдел Маркетинга → Департамент маркетинга' WHERE id = 20;
UPDATE customer_departments SET name = '[АРХИВ] МИС дубль → Отдел разработки и поддержки МИС' WHERE id = 24;
UPDATE customer_departments SET name = '[АРХИВ] Финансовая служба' WHERE id = 3;
UPDATE customer_departments SET name = '[АРХИВ] Отдел информационных технологий' WHERE id = 4;
UPDATE customer_departments SET name = '[АРХИВ] Отдел безопасности' WHERE id = 8;
UPDATE customer_departments SET name = '[АРХИВ] Информационная безопасность' WHERE id = 17;
UPDATE customer_departments SET name = '[АРХИВ] Отдел контроля качества' WHERE id = 30;

-- 6. Добавляем недостающий из эталона
INSERT INTO customer_departments (name) VALUES ('Отдел связей с общественностью');
