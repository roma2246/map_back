const pool = require('../config/database');

class Favorite {
  // Создание нового избранного места
  static async create({ userId, placeId, placeName, placeAddress, latitude, longitude, placeType, rating, photoReference }) {
    const result = await pool.query(
      `INSERT INTO favorites 
       (user_id, place_id, place_name, place_address, latitude, longitude, place_type, rating, photo_reference) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, placeId, placeName, placeAddress, latitude, longitude, placeType, rating, photoReference]
    );
    return result.rows[0];
  }

  // Получение всех избранных мест пользователя
  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  // Проверка, существует ли место в избранном
  static async exists(userId, placeId) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND place_id = $2',
      [userId, placeId]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // Удаление избранного места
  static async delete(userId, placeId) {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND place_id = $2 RETURNING *',
      [userId, placeId]
    );
    return result.rows[0];
  }

  // Получение избранного места по ID
  static async findById(userId, favoriteId) {
    const result = await pool.query(
      'SELECT * FROM favorites WHERE id = $1 AND user_id = $2',
      [favoriteId, userId]
    );
    return result.rows[0];
  }
}

module.exports = Favorite;


