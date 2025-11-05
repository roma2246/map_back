const express = require('express');
const { body, validationResult } = require('express-validator');
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

const router = express.Router();

// Валидация для добавления в избранное
const addFavoriteValidation = [
  body('placeId')
    .notEmpty()
    .withMessage('ID места обязателен'),
  body('placeName')
    .trim()
    .notEmpty()
    .withMessage('Название места обязательно'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Некорректная широта'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Некорректная долгота'),
];

// @route   POST /api/favorites
// @desc    Добавить место в избранное
// @access  Private
router.post('/', auth, addFavoriteValidation, async (req, res) => {
  try {
    // Проверка ошибок валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { placeId, placeName, placeAddress, latitude, longitude, placeType, rating, photoReference } = req.body;
    const userId = req.user.userId;

    // Проверка, не добавлено ли уже это место в избранное
    const exists = await Favorite.exists(userId, placeId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Место уже добавлено в избранное'
      });
    }

    // Создание избранного места
    const favorite = await Favorite.create({
      userId,
      placeId,
      placeName,
      placeAddress: placeAddress || null,
      latitude,
      longitude,
      placeType: placeType || null,
      rating: rating || null,
      photoReference: photoReference || null,
    });

    res.status(201).json({
      success: true,
      message: 'Место добавлено в избранное',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении в избранное',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/favorites
// @desc    Получить все избранные места пользователя
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const favorites = await Favorite.findByUserId(userId);

    res.json({
      success: true,
      favorites,
      count: favorites.length
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении избранных мест',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/favorites/:placeId
// @desc    Удалить место из избранного
// @access  Private
router.delete('/:placeId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { placeId } = req.params;

    const favorite = await Favorite.delete(userId, placeId);
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Место не найдено в избранном'
      });
    }

    res.json({
      success: true,
      message: 'Место удалено из избранного',
      favorite
    });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении из избранного',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/favorites/check/:placeId
// @desc    Проверить, добавлено ли место в избранное
// @access  Private
router.get('/check/:placeId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { placeId } = req.params;

    const exists = await Favorite.exists(userId, placeId);

    res.json({
      success: true,
      isFavorite: exists
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при проверке избранного',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;


