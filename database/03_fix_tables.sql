-- ============================================
-- Шаг 3: Исправление структуры таблиц (если нужно)
-- ============================================
-- Этот скрипт проверяет и исправляет структуру таблицы users
-- Выполните: psql -U postgres -d mob_map -f 03_fix_tables.sql

-- Удаляем таблицу если она существует с неправильной структурой
DROP TABLE IF EXISTS users CASCADE;

-- Пересоздаем таблицу с правильной структурой
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ограничения
    CONSTRAINT check_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE users IS 'Таблица пользователей приложения Mob Map';
COMMENT ON COLUMN users.id IS 'Уникальный идентификатор пользователя';
COMMENT ON COLUMN users.name IS 'Имя пользователя (2-50 символов)';
COMMENT ON COLUMN users.email IS 'Email пользователя (уникальный)';
COMMENT ON COLUMN users.password IS 'Хешированный пароль пользователя';
COMMENT ON COLUMN users.created_at IS 'Дата и время создания записи';
COMMENT ON COLUMN users.updated_at IS 'Дата и время последнего обновления записи';

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Представление пользователей без пароля
DROP VIEW IF EXISTS users_public;
CREATE VIEW users_public AS
SELECT 
    id,
    name,
    email,
    created_at,
    updated_at
FROM users;


