const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Создание нового пользователя
  static async create(userData) {
    const { name, email, password } = userData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, is_admin, created_at, updated_at
    `;

    const result = await pool.query(query, [name, email.toLowerCase().trim(), hashedPassword]);
    return result.rows[0];
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, is_admin, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email.toLowerCase().trim()]);
    return result.rows[0] || null;
  }

  // Поиск пользователя по ID
  static async findById(id) {
    const query = `
      SELECT id, name, email, is_admin, created_at, updated_at
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

  // [ADMIN] Получить всех пользователей
  static async findAll() {
    const query = `
      SELECT id, name, email, is_admin, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // [ADMIN] Обновить данные пользователя
  static async update(id, { name, email }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name.trim());
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(email.toLowerCase().trim());
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE users SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, name, email, is_admin, created_at, updated_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // [ADMIN] Удалить пользователя
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [id]
    );
    return result.rows[0] || null;
  }

  // [ADMIN] Установить/снять права администратора
  static async setAdmin(id, isAdmin) {
    const result = await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, name, email, is_admin',
      [isAdmin, id]
    );
    return result.rows[0] || null;
  }

  // [ADMIN] Принудительная смена пароля
  static async adminUpdatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, name, email',
      [hashedPassword, id]
    );
    return result.rows[0] || null;
  }
}

module.exports = User;
