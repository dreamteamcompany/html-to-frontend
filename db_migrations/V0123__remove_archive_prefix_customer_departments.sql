UPDATE t_p61788166_html_to_frontend.customer_departments
SET name = TRIM(SUBSTRING(name FROM 11))
WHERE name LIKE '_ARCHIVE_ %';
