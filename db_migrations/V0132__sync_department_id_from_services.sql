
-- Синхронизация department_id в payments по текущим данным сервисов
UPDATE t_p61788166_html_to_frontend.payments p
SET department_id = s.customer_department_id
FROM t_p61788166_html_to_frontend.services s
WHERE p.service_id = s.id
  AND p.department_id IS DISTINCT FROM s.customer_department_id;

-- Синхронизация department_id в planned_payments по текущим данным сервисов
UPDATE t_p61788166_html_to_frontend.planned_payments pp
SET department_id = s.customer_department_id
FROM t_p61788166_html_to_frontend.services s
WHERE pp.service_id = s.id
  AND pp.department_id IS DISTINCT FROM s.customer_department_id;
