INSERT INTO t_p61788166_html_to_frontend.legal_entities (name)
SELECT 'Наличные'
WHERE NOT EXISTS (
  SELECT 1 FROM t_p61788166_html_to_frontend.legal_entities WHERE name = 'Наличные'
);
