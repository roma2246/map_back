# Mob Map Backend

Backend API для приложения Mob Map на Node.js и Express.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`:
   - `PORT` - порт сервера (по умолчанию 3000)
   - `MONGODB_URI` - URI подключения к MongoDB
   - `JWT_SECRET` - секретный ключ для JWT (измените на случайную строку!)
   - `JWT_EXPIRE` - время жизни токена (по умолчанию 7d)

## Запуск

### Режим разработки (с автоперезагрузкой):
```bash
npm run dev
```

### Продакшн режим:
```bash
npm start
```

## API Endpoints

### Регистрация
```
POST /api/auth/register
Body:
{
  "name": "Имя пользователя",
  "email": "user@example.com",
  "password": "password123"
}
```

### Вход
```
POST /api/auth/login
Body:
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Получение информации о текущем пользователе
```
GET /api/auth/me
Headers:
  Authorization: Bearer <token>
```

### Health Check
```
GET /api/health
```

## База данных

Проект использует MongoDB. Убедитесь, что MongoDB установлена и запущена.

Для локальной разработки можно использовать:
- Локальная установка MongoDB
- MongoDB Atlas (облачный сервис)

## Структура проекта

```
backend/
├── models/          # Модели данных (Mongoose)
│   └── User.js
├── routes/          # Маршруты API
│   └── auth.js
├── middleware/      # Middleware
│   └── auth.js
├── server.js        # Главный файл сервера
├── package.json     # Зависимости
└── .env             # Переменные окружения (не в git)
```


