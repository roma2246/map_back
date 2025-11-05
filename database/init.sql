-- ============================================
-- Создание базы данных и таблиц для Mob Map
-- ============================================
-- 
-- ИСПОЛЬЗОВАНИЕ:
-- 1. Создайте БД: psql -U postgres -c "CREATE DATABASE mob_map;"
-- 2. Выполните скрипт: psql -U postgres -d mob_map -f init.sql
-- 
-- Или выполните в psql:
--    CREATE DATABASE mob_map;
--    \c mob_map
--    \i init.sql
-- ============================================

-- Удаление таблицы если существует
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP VIEW IF EXISTS users_public CASCADE;

-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Создание индексов
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Представление пользователей без пароля
CREATE VIEW users_public AS
SELECT 
    id,
    name,
    email,
    created_at,
    updated_at
FROM users;

-- ============================================
-- Таблица избранных мест
-- ============================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id VARCHAR(255) NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    place_address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    place_type VARCHAR(100),
    rating DOUBLE PRECISION,
    photo_reference VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальная комбинация пользователя и места (чтобы не дублировать)
    CONSTRAINT unique_user_place UNIQUE (user_id, place_id)
);

-- Создание индексов для избранных мест
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_place_id ON favorites(place_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE favorites IS 'Таблица избранных мест пользователей';
COMMENT ON COLUMN favorites.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN favorites.user_id IS 'ID пользователя (внешний ключ)';
COMMENT ON COLUMN favorites.place_id IS 'ID места из Google Places API';
COMMENT ON COLUMN favorites.place_name IS 'Название места';
COMMENT ON COLUMN favorites.place_address IS 'Адрес места';
COMMENT ON COLUMN favorites.latitude IS 'Широта места';
COMMENT ON COLUMN favorites.longitude IS 'Долгота места';
COMMENT ON COLUMN favorites.place_type IS 'Тип места';
COMMENT ON COLUMN favorites.rating IS 'Рейтинг места';
COMMENT ON COLUMN favorites.photo_reference IS 'Ссылка на фото места';
COMMENT ON COLUMN favorites.created_at IS 'Дата и время добавления в избранное';

-- ============================================
-- Таблица истории поиска
-- ============================================
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    place_type VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для истории поиска
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);
CREATE INDEX idx_search_history_query ON search_history(query);

-- Комментарии к таблице истории поиска
COMMENT ON TABLE search_history IS 'Таблица истории поисковых запросов пользователей';
COMMENT ON COLUMN search_history.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN search_history.user_id IS 'ID пользователя (внешний ключ)';
COMMENT ON COLUMN search_history.query IS 'Поисковый запрос';
COMMENT ON COLUMN search_history.place_type IS 'Тип места (если был указан фильтр)';
COMMENT ON COLUMN search_history.latitude IS 'Широта центра поиска';
COMMENT ON COLUMN search_history.longitude IS 'Долгота центра поиска';
COMMENT ON COLUMN search_history.results_count IS 'Количество найденных результатов';
COMMENT ON COLUMN search_history.created_at IS 'Дата и время поиска';

-- ============================================
-- Таблица сохраненных поисковых запросов
-- ============================================
CREATE TABLE saved_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    place_type VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для сохраненных запросов
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_created_at ON saved_searches(created_at);

-- Триггер для автоматического обновления updated_at для сохраненных запросов
CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице сохраненных запросов
COMMENT ON TABLE saved_searches IS 'Таблица сохраненных поисковых запросов пользователей';
COMMENT ON COLUMN saved_searches.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN saved_searches.user_id IS 'ID пользователя (внешний ключ)';
COMMENT ON COLUMN saved_searches.name IS 'Название сохраненного запроса';
COMMENT ON COLUMN saved_searches.query IS 'Поисковый запрос';
COMMENT ON COLUMN saved_searches.place_type IS 'Тип места (если был указан фильтр)';
COMMENT ON COLUMN saved_searches.latitude IS 'Широта центра поиска';
COMMENT ON COLUMN saved_searches.longitude IS 'Долгота центра поиска';
COMMENT ON COLUMN saved_searches.created_at IS 'Дата и время создания';
COMMENT ON COLUMN saved_searches.updated_at IS 'Дата и время последнего обновления';

