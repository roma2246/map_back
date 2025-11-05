const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const SearchHistory = require('../models/SearchHistory');
const SavedSearch = require('../models/SavedSearch');

const router = express.Router();

// @route   POST /api/search/history
// @desc    Добавить запрос в историю поиска
// @access  Private
router.post('/history', auth, [
  body('query').notEmpty().withMessage('Поисковый запрос обязателен'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { query, placeType, latitude, longitude, resultsCount } = req.body;

    console.log('📝 Сохранение истории поиска:', {
      userId,
      query,
      placeType,
      latitude,
      longitude,
      resultsCount,
    });

    try {
      const historyItem = await SearchHistory.create({
        userId,
        query,
        placeType: placeType || null,
        latitude: latitude || null,
        longitude: longitude || null,
        resultsCount: resultsCount || 0,
      });

      console.log('✅ История сохранена:', historyItem);

      res.status(201).json({
        success: true,
        historyItem
      });
    } catch (dbError) {
      console.error('❌ Ошибка БД при сохранении истории:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Add search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при сохранении истории поиска',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/search/history
// @desc    Получить историю поиска пользователя
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    console.log('📥 Запрос истории поиска для userId:', userId, 'лимит:', limit);

    const history = await SearchHistory.findByUserId(userId, limit);

    console.log('✅ Найдено записей истории:', history.length);
    if (history.length > 0) {
      console.log('📋 Первая запись:', JSON.stringify(history[0], null, 2));
    }

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('❌ Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении истории поиска',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/search/history/popular
// @desc    Получить популярные поисковые запросы пользователя
// @access  Private
router.get('/history/popular', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const popularQueries = await SearchHistory.getPopularQueries(userId, limit);

    res.json({
      success: true,
      popularQueries
    });
  } catch (error) {
    console.error('Get popular queries error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении популярных запросов',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/search/history/:id
// @desc    Удалить запись из истории поиска
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await SearchHistory.delete(userId, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Запись истории не найдена'
      });
    }

    res.json({
      success: true,
      message: 'Запись удалена из истории'
    });
  } catch (error) {
    console.error('Delete search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении из истории',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/search/history
// @desc    Очистить всю историю поиска пользователя
// @access  Private
router.delete('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedCount = await SearchHistory.clearUserHistory(userId);

    res.json({
      success: true,
      message: 'История поиска очищена',
      deletedCount
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при очистке истории',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/search/saved
// @desc    Создать сохраненный поисковый запрос
// @access  Private
router.post('/saved', auth, [
  body('name').notEmpty().withMessage('Название сохраненного запроса обязательно'),
  body('query').notEmpty().withMessage('Поисковый запрос обязателен'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { name, query, placeType, latitude, longitude } = req.body;

    const savedSearch = await SavedSearch.create({
      userId,
      name,
      query,
      placeType,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: 'Поисковый запрос сохранен',
      savedSearch
    });
  } catch (error) {
    console.error('Create saved search error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при сохранении запроса',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/search/saved
// @desc    Получить все сохраненные поисковые запросы пользователя
// @access  Private
router.get('/saved', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const savedSearches = await SavedSearch.findByUserId(userId);

    res.json({
      success: true,
      savedSearches,
      count: savedSearches.length
    });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении сохраненных запросов',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/search/saved/:id
// @desc    Обновить сохраненный поисковый запрос
// @access  Private
router.put('/saved/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, query, placeType, latitude, longitude } = req.body;

    const updated = await SavedSearch.update(userId, id, {
      name,
      query,
      placeType,
      latitude,
      longitude,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Сохраненный запрос не найден'
      });
    }

    res.json({
      success: true,
      message: 'Сохраненный запрос обновлен',
      savedSearch: updated
    });
  } catch (error) {
    console.error('Update saved search error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении запроса',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/search/saved/:id
// @desc    Удалить сохраненный поисковый запрос
// @access  Private
router.delete('/saved/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await SavedSearch.delete(userId, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Сохраненный запрос не найден'
      });
    }

    res.json({
      success: true,
      message: 'Сохраненный запрос удален'
    });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении запроса',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

