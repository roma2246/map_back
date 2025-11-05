-- ============================================
-- Добавление таблиц для истории поиска
-- (без удаления существующих данных)
-- ============================================
-- 
-- ИСПОЛЬЗОВАНИЕ:
-- psql -U postgres -d mob_map -f add_search_tables.sql
-- 
-- Или выполните в psql:
--    \c mob_map
--    \i add_search_tables.sql
-- ============================================

-- Создание таблицы истории поиска (если не существует)
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    place_type VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для истории поиска (если не существуют)
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- Создание таблицы сохраненных поисковых запросов (если не существует)
CREATE TABLE IF NOT EXISTS saved_searches (
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

-- Создание индексов для сохраненных запросов (если не существуют)
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at);

-- Проверка существования таблиц
SELECT 
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'search_history') AS search_history_exists,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_searches') AS saved_searches_exists;


