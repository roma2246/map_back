-- ============================================
-- Шаг 4: Добавление поля is_admin для пользователей
-- ============================================
-- Выполнить: psql -U postgres -d mob_map -f 04_add_admin.sql
-- Или запустить в pgAdmin / psql:

-- Добавляем поле is_admin
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.is_admin IS 'Флаг администратора. true = может управлять пользователями';

-- Создадим индекс (полезно если будем часто фильтровать)
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Проверка результата
SELECT id, name, email, is_admin, created_at FROM users;
