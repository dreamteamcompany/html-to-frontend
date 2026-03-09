-- Обновляем существующие сервисы: описание и юр.лицо

-- Timeweb Cloud → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Сервера банков бухгалтерии', legal_entity_id = 23
WHERE id = 20;

-- 1Dedic → ООО "Дрим Тим" (id 22)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Сервера основной инфраструктуры: 1С, Битрикс, Удалённые рабочие столы и пр.', legal_entity_id = 22
WHERE id = 39;

-- Mango Office → ИП Петросян (id 5)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Резервная телефония КЦ', legal_entity_id = 5
WHERE id = 22;

-- Плюсофон 1 → ООО "Стоматология Питер" (id 14)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Виртуальные сим-карты', legal_entity_id = 14
WHERE id = 27;

-- Timeweb 2 → ООО "Дрим Тим" (id 22)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Домен корпоративной почты dreamteamcompany.ru', legal_entity_id = 22
WHERE id = 23;

-- Wazzup → без привязки к юр.лицу (Юр.лица/ИП — описание в поле)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Сервис подписки работы с мессенджерами. Тип оплаты: Юр.лица/ИП', legal_entity_id = NULL
WHERE id = 17;

-- OpenAI → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Для команды Ильи', legal_entity_id = 23
WHERE id = 38;

-- ChatGPT → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Для команды Ильи', legal_entity_id = 23
WHERE id = 14;

-- Timeweb 3 → ООО "Медицина" (id 18)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Домен permdental.ru', legal_entity_id = 18
WHERE id = 21;

-- Timeweb 4 → ООО "Стоматология Омск" (id 15)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Домен omskdental.ru', legal_entity_id = 15
WHERE id = 34;

-- Timeweb 1 → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Домен server.server41.ru', legal_entity_id = 23
WHERE id = 32;

-- Рег.ру 1 → переименовать и Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET name = 'Рег.ру 1 (it-services@dreamteamcompany.ru)', description = 'Домены и хостинги корпоративной почты', legal_entity_id = 23
WHERE id = 37;

-- Рег.ру 2 → ООО "Стоматология Питер" (id 14)
UPDATE t_p61788166_html_to_frontend.services
SET name = 'Рег.ру 2 (it-services@world-dent.ru)', description = 'Домены сайтов Департамента маркетинга', legal_entity_id = 14
WHERE id = 24;

-- SmsFast → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Иностранные сим-карты для регистрации иностранных сервисов', legal_entity_id = 23
WHERE id = 16;

-- iSpring → без юр.лица, описание с доп. информацией
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Система iSpring для Отдела обучения. Оплата через менеджера, +7 937 9372180 Илья', legal_entity_id = NULL
WHERE id = 29;

-- Zoom 1 → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Корпоративный Zoom', legal_entity_id = 23
WHERE id = 19;

-- Zoom 2 → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Корпоративный Zoom', legal_entity_id = 23
WHERE id = 36;

-- Контур Фокус → ООО "Дрим Тим" (id 22)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Система проверки контрагентов', legal_entity_id = 22
WHERE id = 35;

-- Билайн Этикетка ЛК → ООО "Ворлд Дент" (id 21)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Сим-карты "Этикетка" Билайн для г. Краснодар, СПБ, Ростов, КЦ Вторичного отдела продаж', legal_entity_id = 21
WHERE id = 31;

-- Билайн Этикетка ОАТС → без юр.лица (не указано в задании)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Сим-карты "Этикетка" Билайн для г. Краснодар, СПБ, Ростов, КЦ Вторичного отдела продаж', legal_entity_id = NULL
WHERE id = 15;

-- MyBI Connect → ИП Петросян (id 5)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Сервис для добавления поставщиков рекламных интеграций в аналитику', legal_entity_id = 5
WHERE id = 26;

-- Касперский Password Manager → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Централизованное хранилище паролей IT', legal_entity_id = 23
WHERE id = 40;

-- sms.ru → переименовать в SMS.RU, ИП Петросян (id 5)
UPDATE t_p61788166_html_to_frontend.services
SET name = 'SMS.RU', description = 'Рассылки сообщений КЦ', legal_entity_id = 5
WHERE id = 25;

-- Power BI 1 → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Для команды Ильи', legal_entity_id = 23
WHERE id = 33;

-- Power BI 2 → Наличные (id 23)
UPDATE t_p61788166_html_to_frontend.services
SET description = 'Для команды Ильи', legal_entity_id = 23
WHERE id = 30;

-- Фастком (телефония Voximplant) → переименовать в Voximplant Control Panel, Юр.лица/ИП
UPDATE t_p61788166_html_to_frontend.services
SET name = 'Voximplant Control Panel', description = 'Фастком (телефония Voximplant). Тип оплаты: Юр.лица/ИП', legal_entity_id = NULL
WHERE id = 18;

-- МТС Бизнес (Предприниматели патриоты) → оставить, обновить описание
UPDATE t_p61788166_html_to_frontend.services
SET description = 'МТС Бизнес для Предпринимателей Патриотов'
WHERE id = 13;

-- Cursor → без изменений (не в списке задания, оставляем как есть)

-- Создаём новые сервисы которых нет

-- Telegram Предприниматели Патриоты → Наличные (id 23)
INSERT INTO t_p61788166_html_to_frontend.services (name, description, legal_entity_id)
SELECT 'Telegram Предприниматели Патриоты', 'Подписка Telegram', 23
WHERE NOT EXISTS (SELECT 1 FROM t_p61788166_html_to_frontend.services WHERE name = 'Telegram Предприниматели Патриоты');

-- Сим-карты Предприниматели Патриоты (ООО "Дрим Тим") → id 22
INSERT INTO t_p61788166_html_to_frontend.services (name, description, legal_entity_id)
SELECT 'Сим-карты Предприниматели Патриоты (ООО "Дрим Тим")', 'Сим-карты "Предприниматели Патриоты"', 22
WHERE NOT EXISTS (SELECT 1 FROM t_p61788166_html_to_frontend.services WHERE name = 'Сим-карты Предприниматели Патриоты (ООО "Дрим Тим")');

-- Сим-карты Предприниматели Патриоты (ИП Петросян С.А.) → id 5
INSERT INTO t_p61788166_html_to_frontend.services (name, description, legal_entity_id)
SELECT 'Сим-карты Предприниматели Патриоты (ИП Петросян С.А.)', 'Сим-карты "Предприниматели Патриоты"', 5
WHERE NOT EXISTS (SELECT 1 FROM t_p61788166_html_to_frontend.services WHERE name = 'Сим-карты Предприниматели Патриоты (ИП Петросян С.А.)');

-- Сим-карты МТС (УК СПБ) → ООО "Дрим Тим" (id 22)
INSERT INTO t_p61788166_html_to_frontend.services (name, description, legal_entity_id)
SELECT 'Сим-карты МТС (УК СПБ)', 'Сим-карты УК СПБ (М. Проскурдина)', 22
WHERE NOT EXISTS (SELECT 1 FROM t_p61788166_html_to_frontend.services WHERE name = 'Сим-карты МТС (УК СПБ)');

-- Сим-карты МТС (КЦ вторичного отдела) → ООО "Дрим Тим" (id 22)
INSERT INTO t_p61788166_html_to_frontend.services (name, description, legal_entity_id)
SELECT 'Сим-карты МТС (КЦ вторичного отдела)', 'Сим-карты УК Краснодар (КЦ вторичного отдела продаж), сим-карты команды Юлии Вадимовны', 22
WHERE NOT EXISTS (SELECT 1 FROM t_p61788166_html_to_frontend.services WHERE name = 'Сим-карты МТС (КЦ вторичного отдела)');

-- Calltouch → Юр.лица/ИП
INSERT INTO t_p61788166_html_to_frontend.services (name, description, legal_entity_id)
SELECT 'Calltouch', 'Сервис аналитики звонков и заявок. Тип оплаты: Юр.лица/ИП', NULL
WHERE NOT EXISTS (SELECT 1 FROM t_p61788166_html_to_frontend.services WHERE name = 'Calltouch');
