-- Добавление новых прав доступа в систему

-- ПЛАТЕЖИ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('payments.change_status',  'payments', 'change_status',  'Изменение статуса платежа'),
  ('payments.bulk',           'payments', 'bulk',           'Массовые операции с платежами'),
  ('payments.reapprove',      'payments', 'reapprove',      'Повторное согласование платежа'),
  ('payments.view_history',   'payments', 'view_history',   'Просмотр истории изменений платежа'),
  ('payments.import',         'payments', 'import',         'Импорт платежей'),
  ('payments.export',         'payments', 'export',         'Экспорт платежей')
ON CONFLICT (name) DO NOTHING;

-- СОГЛАСОВАНИЯ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('approvals.assign',        'approvals', 'assign',        'Назначение согласующих'),
  ('approvals.change_route',  'approvals', 'change_route',  'Изменение маршрута согласования'),
  ('approvals.cancel',        'approvals', 'cancel',        'Отмена согласования'),
  ('approvals.resubmit',      'approvals', 'resubmit',      'Повторная отправка на согласование')
ON CONFLICT (name) DO NOTHING;

-- АУДИТ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('audit_logs.export',       'audit_logs', 'export',       'Экспорт журнала аудита'),
  ('audit_logs.filter',       'audit_logs', 'filter',       'Расширенная фильтрация журнала аудита')
ON CONFLICT (name) DO NOTHING;

-- ПОЛЬЗОВАТЕЛИ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('users.block',             'users', 'block',             'Блокировка и разблокировка пользователей'),
  ('users.reset_password',    'users', 'reset_password',    'Сброс пароля пользователя'),
  ('users.assign_roles',      'users', 'assign_roles',      'Назначение ролей пользователям')
ON CONFLICT (name) DO NOTHING;

-- РОЛИ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('roles.assign_permissions','roles', 'assign_permissions','Назначение прав ролям'),
  ('roles.copy',              'roles', 'copy',              'Копирование ролей'),
  ('roles.protect',           'roles', 'protect',           'Защита критичных ролей от изменений')
ON CONFLICT (name) DO NOTHING;

-- КОНТРАГЕНТЫ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('contractors.archive',     'contractors', 'archive',     'Архивация контрагентов'),
  ('contractors.import',      'contractors', 'import',      'Импорт контрагентов'),
  ('contractors.export',      'contractors', 'export',      'Экспорт контрагентов')
ON CONFLICT (name) DO NOTHING;

-- ЮРИДИЧЕСКИЕ ЛИЦА: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('legal_entities.archive',  'legal_entities', 'archive',  'Архивация юридических лиц'),
  ('legal_entities.import',   'legal_entities', 'import',   'Импорт юридических лиц'),
  ('legal_entities.export',   'legal_entities', 'export',   'Экспорт юридических лиц')
ON CONFLICT (name) DO NOTHING;

-- ДАШБОРД: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('dashboard.export',        'dashboard', 'export',        'Экспорт данных дашборда'),
  ('dashboard.details',       'dashboard', 'details',       'Просмотр детализации дашборда'),
  ('dashboard.financials',    'dashboard', 'financials',    'Доступ к финансовым показателям')
ON CONFLICT (name) DO NOTHING;

-- МОНИТОРИНГ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('monitoring.configure',    'monitoring', 'configure',    'Настройка параметров мониторинга'),
  ('monitoring.system_logs',  'monitoring', 'system_logs',  'Доступ к системным логам'),
  ('monitoring.errors',       'monitoring', 'errors',       'Просмотр ошибок системы')
ON CONFLICT (name) DO NOTHING;

-- ЗАПЛАНИРОВАННЫЕ ПЛАТЕЖИ: новые права
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('planned_payments.remove',       'planned_payments', 'remove',       'Удаление запланированных платежей'),
  ('planned_payments.bulk',         'planned_payments', 'bulk',         'Массовое редактирование запланированных платежей'),
  ('planned_payments.generate',     'planned_payments', 'generate',     'Генерация платежей из шаблонов')
ON CONFLICT (name) DO NOTHING;

-- СИСТЕМНЫЕ ПРАВА
INSERT INTO t_p61788166_html_to_frontend.permissions (name, resource, action, description) VALUES
  ('system.production',       'system', 'production',       'Доступ к продакшен-серверу'),
  ('system.testing',          'system', 'testing',          'Доступ к тестовому серверу'),
  ('system.integrations',     'system', 'integrations',     'Управление интеграциями (API, GitHub)'),
  ('system.settings_read',    'system', 'settings_read',    'Просмотр системных настроек'),
  ('system.settings_update',  'system', 'settings_update',  'Изменение системных настроек'),
  ('system.import',           'system', 'import',           'Глобальный импорт данных'),
  ('system.export',           'system', 'export',           'Глобальный экспорт данных')
ON CONFLICT (name) DO NOTHING;

-- Привязка всех новых прав к роли "Администратор" (id=1)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN (
  'payments.change_status','payments.bulk','payments.reapprove','payments.view_history','payments.import','payments.export',
  'approvals.assign','approvals.change_route','approvals.cancel','approvals.resubmit',
  'audit_logs.export','audit_logs.filter',
  'users.block','users.reset_password','users.assign_roles',
  'roles.assign_permissions','roles.copy','roles.protect',
  'contractors.archive','contractors.import','contractors.export',
  'legal_entities.archive','legal_entities.import','legal_entities.export',
  'dashboard.export','dashboard.details','dashboard.financials',
  'monitoring.configure','monitoring.system_logs','monitoring.errors',
  'planned_payments.remove','planned_payments.bulk','planned_payments.generate',
  'system.production','system.testing','system.integrations',
  'system.settings_read','system.settings_update','system.import','system.export'
)
ON CONFLICT DO NOTHING;

-- Привязка прав к роли CEO (id=7)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 7, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN (
  'payments.change_status','payments.bulk','payments.reapprove','payments.view_history','payments.export',
  'approvals.assign','approvals.cancel','approvals.resubmit',
  'dashboard.export','dashboard.details','dashboard.financials',
  'system.settings_read'
)
ON CONFLICT DO NOTHING;

-- Привязка прав к роли Финансист (id=8)
INSERT INTO t_p61788166_html_to_frontend.role_permissions (role_id, permission_id)
SELECT 8, p.id
FROM t_p61788166_html_to_frontend.permissions p
WHERE p.name IN (
  'payments.change_status','payments.bulk','payments.reapprove','payments.view_history','payments.import','payments.export',
  'approvals.resubmit',
  'audit_logs.export','audit_logs.filter',
  'contractors.archive','contractors.import','contractors.export',
  'legal_entities.archive','legal_entities.import','legal_entities.export',
  'dashboard.export','dashboard.details','dashboard.financials',
  'planned_payments.remove','planned_payments.bulk','planned_payments.generate',
  'system.export','system.import'
)
ON CONFLICT DO NOTHING;
