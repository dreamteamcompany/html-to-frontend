INSERT INTO t_p61788166_html_to_frontend.services (name)
SELECT v.name
FROM (VALUES
  ('Wazzup'),
  ('ChatGPT'),
  ('OpenAI'),
  ('1Dedic'),
  ('Timeweb Cloud'),
  ('Timeweb 1'),
  ('Timeweb 2'),
  ('Рег.ру 1'),
  ('Рег.ру 2'),
  ('Плюсофон 1'),
  ('SmsFast'),
  ('iSpring'),
  ('МТС Бизнес (Предприниматели патриоты)'),
  ('Zoom 1'),
  ('Zoom 2'),
  ('Контур Фокус'),
  ('Билайн Этикетка ЛК'),
  ('Билайн Этикетка ОАТС'),
  ('MyBI Connect'),
  ('Касперский Password Manager'),
  ('Mango Office'),
  ('sms.ru'),
  ('Power BI 1'),
  ('Power BI 2'),
  ('Фастком (телефония Voximplant)'),
  ('Timeweb 3'),
  ('Timeweb 4'),
  ('Cursor')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM t_p61788166_html_to_frontend.services s WHERE s.name = v.name
);
