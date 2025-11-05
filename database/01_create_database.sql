-- ============================================
-- Шаг 1: Создание базы данных
-- ============================================
-- Выполните эту команду от имени суперпользователя (postgres)
-- В psql: \i 01_create_database.sql
-- Или: psql -U postgres -f 01_create_database.sql

-- Вариант 1: Использовать template0 (рекомендуется, если есть проблемы с локалью)
CREATE DATABASE mob_map
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Вариант 2: Использовать локаль по умолчанию (раскомментируйте, если вариант 1 не подходит)
-- CREATE DATABASE mob_map
--     WITH 
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

