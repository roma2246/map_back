-- ============================================
-- SQLite Database Schema for Mob Map
-- ============================================
-- SQLite - легковесная база данных, не требует отдельного сервера

-- ============================================
-- Таблица пользователей
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 50),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL CHECK(length(password) >= 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- Триггер для автоматического обновления updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
BEGIN
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- ============================================
-- Примеры данных для тестирования (опционально)
-- ============================================

-- ВНИМАНИЕ: Пароли в примере - это хеши от "password123"
-- В реальном приложении используйте bcrypt для хеширования!

-- INSERT INTO users (name, email, password) VALUES
-- ('Тестовый Пользователь', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
-- ('Демо Пользователь', 'demo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');


