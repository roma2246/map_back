const pool = require('../config/database');

class SavedSearch {
  // Создать сохраненный поисковый запрос
  static async create({ userId, name, query, placeType, latitude, longitude }) {
    const result = await pool.query(
      `INSERT INTO saved_searches (user_id, name, query, place_type, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, query, placeType || null, latitude || null, longitude || null]
    );
    return result.rows[0];
  }

  // Получить все сохраненные запросы пользователя
  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  // Получить сохраненный запрос по ID
  static async findById(userId, searchId) {
    const result = await pool.query(
      'SELECT * FROM saved_searches WHERE id = $1 AND user_id = $2',
      [searchId, userId]
    );
    return result.rows[0];
  }

  // Обновить сохраненный запрос
  static async update(userId, searchId, { name, query, placeType, latitude, longitude }) {
    const result = await pool.query(
      `UPDATE saved_searches 
       SET name = COALESCE($3, name),
           query = COALESCE($4, query),
           place_type = COALESCE($5, place_type),
           latitude = COALESCE($6, latitude),
           longitude = COALESCE($7, longitude)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [searchId, userId, name, query, placeType, latitude, longitude]
    );
    return result.rows[0];
  }

  // Удалить сохраненный запрос
  static async delete(userId, searchId) {
    const result = await pool.query(
      'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING *',
      [searchId, userId]
    );
    return result.rows[0];
  }
}

module.exports = SavedSearch;

