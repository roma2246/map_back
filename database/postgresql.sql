-- ============================================
-- PostgreSQL Database Schema for Mob Map
-- ============================================

-- Создание базы данных
-- Выполните эту команду от имени суперпользователя (postgres)
-- Используем template0 для избежания проблем с локалью
CREATE DATABASE mob_map
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Альтернативный вариант (использует локаль по умолчанию системы):
-- CREATE DATABASE mob_map
--     WITH 
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- Подключение к базе данных
\c mob_map;

-- Создание расширения для UUID (опционально, если нужно использовать UUID)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Таблица пользователей
-- ============================================
CREATE TABLE IF NOT EXISTS users (
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

-- ============================================
-- Функция для автоматического обновления updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Триггер для автоматического обновления updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Представления (Views) - опционально
-- ============================================

-- Представление пользователей без пароля (для безопасности)
CREATE OR REPLACE VIEW users_public AS
SELECT 
    id,
    name,
    email,
    created_at,
    updated_at
FROM users;

-- ============================================
-- Примеры данных для тестирования (опционально)
-- ============================================

-- ВНИМАНИЕ: Пароли в примере - это хеши от "password123"
-- В реальном приложении используйте bcrypt для хеширования!

-- INSERT INTO users (name, email, password) VALUES
-- ('Тестовый Пользователь', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
-- ('Демо Пользователь', 'demo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

