INSERT INTO t_p61788166_html_to_frontend.categories (name, icon)
SELECT v.name, v.icon
FROM (VALUES
  ('Телефония / Виртуальная АТС', 'Phone'),
  ('Серверы и инфраструктура', 'Server'),
  ('Домены и хостинг', 'Globe'),
  ('Мессенджеры и коммуникации', 'MessageSquare'),
  ('Подписки и SaaS сервисы', 'Layers'),
  ('Аналитика и BI', 'BarChart2'),
  ('Обучение и развитие', 'GraduationCap'),
  ('Сим-карты и мобильная связь', 'Smartphone'),
  ('SMS-рассылки', 'Mail'),
  ('Информационная безопасность', 'ShieldCheck'),
  ('Проверка контрагентов', 'SearchCheck'),
  ('AI и автоматизация', 'Bot'),
  ('Маркетинговые сервисы', 'TrendingUp'),
  ('Корпоративные сервисы', 'Building2'),
  ('Прочие IT-расходы', 'Monitor')
) AS v(name, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM t_p61788166_html_to_frontend.categories c WHERE c.name = v.name
);
