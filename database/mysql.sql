-- ============================================
-- MySQL Database Schema for Mob Map
-- ============================================

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS mob_map 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Использование базы данных
USE mob_map;

-- ============================================
-- Таблица пользователей
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Индексы
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    
    -- Ограничения
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 2 AND CHAR_LENGTH(name) <= 50)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Таблица пользователей приложения Mob Map';

-- ============================================
-- Примеры данных для тестирования (опционально)
-- ============================================

-- ВНИМАНИЕ: Пароли в примере - это хеши от "password123"
-- В реальном приложении используйте bcrypt для хеширования!

-- INSERT INTO users (name, email, password) VALUES
-- ('Тестовый Пользователь', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
-- ('Демо Пользователь', 'demo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');


