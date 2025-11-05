const pool = require('../config/database');

class SearchHistory {
  // Создать запись в истории поиска
  static async create({ userId, query, placeType, latitude, longitude, resultsCount }) {
    const result = await pool.query(
      `INSERT INTO search_history (user_id, query, place_type, latitude, longitude, results_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, query, placeType || null, latitude || null, longitude || null, resultsCount || 0]
    );
    return result.rows[0];
  }

  // Получить историю поиска пользователя
  static async findByUserId(userId, limit = 20) {
    const result = await pool.query(
      `SELECT * FROM search_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // Удалить запись из истории
  static async delete(userId, historyId) {
    const result = await pool.query(
      'DELETE FROM search_history WHERE id = $1 AND user_id = $2 RETURNING *',
      [historyId, userId]
    );
    return result.rows[0];
  }

  // Очистить историю пользователя
  static async clearUserHistory(userId) {
    const result = await pool.query(
      'DELETE FROM search_history WHERE user_id = $1 RETURNING id',
      [userId]
    );
    return result.rows.length;
  }

  // Получить популярные запросы пользователя
  static async getPopularQueries(userId, limit = 10) {
    const result = await pool.query(
      `SELECT query, COUNT(*) as count, MAX(created_at) as last_used
       FROM search_history
       WHERE user_id = $1
       GROUP BY query
       ORDER BY count DESC, last_used DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

module.exports = SearchHistory;

