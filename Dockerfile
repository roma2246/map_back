# Указываем базовый образ Node.js
FROM node:18-alpine

# Создаем рабочую директорию приложения
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт, на котором работает приложение
EXPOSE 5000

# Команда для запуска сервера
CMD [ "npm", "start" ]
