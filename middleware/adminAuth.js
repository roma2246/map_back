const jwt = require('jsonwebtoken');
const pool = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_secret_key'
    );

    // Проверяем is_admin прямо из БД (надёжнее чем хранить в токене)
    const result = await pool.query(
      'SELECT id, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещён. Требуются права администратора'
      });
    }

    req.user = decoded;
    req.user.isAdmin = true;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Токен истёк' });
    }
    res.status(500).json({ success: false, message: 'Ошибка при проверке токена' });
  }
};
