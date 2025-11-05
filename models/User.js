const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Создание нового пользователя
  static async create(userData) {
    const { name, email, password } = userData;
    
    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at, updated_at
    `;
    
    const result = await pool.query(query, [name, email.toLowerCase().trim(), hashedPassword]);
    return result.rows[0];
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    return result.rows[0] || null;
  }

  // Поиск пользователя по ID
  static async findById(id) {
    const query = `
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Сравнение пароля
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Проверка существования пользователя с email
  static async emailExists(email) {
    const query = `
      SELECT COUNT(*) as count
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = User;
