-- Update admin email to real address for password recovery
UPDATE t_p61788166_html_to_frontend.users
SET email = 'rlaliev@dreamteamcompany.ru'
WHERE id = 1 AND username = 'dt.system.admin';
