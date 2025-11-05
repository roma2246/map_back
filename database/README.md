# База данных Mob Map

Этот каталог содержит SQL скрипты для создания базы данных и таблиц для приложения Mob Map.

## Доступные скрипты

### 1. PostgreSQL (`postgresql.sql`)
Для использования с PostgreSQL:
```bash
psql -U postgres -f postgresql.sql
```

Или выполните команды в psql:
```sql
\i postgresql.sql
```

### 2. MySQL (`mysql.sql`)
Для использования с MySQL:
```bash
mysql -u root -p < mysql.sql
```

Или выполните в MySQL клиенте:
```sql
source mysql.sql;
```

### 3. SQLite (`sqlite.sql`)
Для использования с SQLite:
```bash
sqlite3 mob_map.db < sqlite.sql
```

Или в SQLite:
```sql
.read sqlite.sql
```

## Структура таблицы users

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER/SERIAL | Первичный ключ, автоинкремент |
| name | VARCHAR(50) | Имя пользователя (2-50 символов) |
| email | VARCHAR(100) | Email (уникальный) |
| password | VARCHAR(255) | Хешированный пароль |
| created_at | TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | Дата последнего обновления |

## Индексы

- `idx_users_email` - индекс по email для быстрого поиска
- `idx_users_created_at` - индекс по дате создания

## Важные замечания

1. **Пароли**: В примерах данных используются хеши паролей. В реальном приложении всегда используйте bcrypt для хеширования паролей перед сохранением в базу данных.

2. **Безопасность**: 
   - Никогда не храните пароли в открытом виде
   - Используйте сильные пароли для пользователей базы данных
   - Ограничьте доступ к базе данных

3. **Миграции**: Для продакшн окружения рекомендуется использовать систему миграций (например, Knex.js, Sequelize, TypeORM).

## Подключение к базе данных

### PostgreSQL
```javascript
// В .env файле
MONGODB_URI=postgresql://username:password@localhost:5432/mob_map
```

### MySQL
```javascript
// В .env файле
MONGODB_URI=mysql://username:password@localhost:3306/mob_map
```

### SQLite
```javascript
// В .env файле
MONGODB_URI=sqlite://./database/mob_map.db
```

## Тестирование

После создания базы данных вы можете протестировать подключение:

```sql
-- Проверка таблицы
SELECT * FROM users;

-- Проверка структуры
\d users  -- PostgreSQL
DESCRIBE users;  -- MySQL
.schema users  -- SQLite
```


