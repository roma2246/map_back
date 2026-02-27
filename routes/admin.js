const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Все маршруты защищены adminAuth
router.use(adminAuth);

// ============================================
// ПОЛЬЗОВАТЕЛИ
// ============================================

// GET /api/admin/users — список всех пользователей
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, users, count: users.length });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении списка пользователей' });
    }
});

// GET /api/admin/users/:id — данные одного пользователя
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Admin get user error:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении пользователя' });
    }
});

// PATCH /api/admin/users/:id — редактирование имени и email
router.patch(
    '/users/:id',
    [
        body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Имя от 2 до 50 символов'),
        body('email').optional().isEmail().normalizeEmail().withMessage('Некорректный email'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { name, email } = req.body;
            const userId = req.params.id;

            // Нельзя редактировать самого себя через admin (защита от случайных ошибок)
            if (parseInt(userId) === req.user.userId) {
                return res.status(400).json({ success: false, message: 'Нельзя редактировать собственный аккаунт через панель' });
            }

            // Если меняют email — проверяем уникальность
            if (email) {
                const existing = await User.findByEmail(email);
                if (existing && existing.id !== parseInt(userId)) {
                    return res.status(400).json({ success: false, message: 'Email уже занят другим пользователем' });
                }
            }

            const user = await User.update(userId, { name, email });
            if (!user) {
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
            }

            res.json({ success: true, message: 'Данные пользователя обновлены', user });
        } catch (error) {
            console.error('Admin update user error:', error);
            res.status(500).json({ success: false, message: 'Ошибка при обновлении пользователя' });
        }
    }
);

// PATCH /api/admin/users/:id/password — смена пароля пользователя
router.patch(
    '/users/:id/password',
    [
        body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { password } = req.body;
            const userId = req.params.id;

            // Защита от редактирования себя
            if (parseInt(userId) === req.user.userId) {
                return res.status(400).json({ success: false, message: 'Свой пароль нужно менять в профиле' });
            }

            const user = await User.adminUpdatePassword(userId, password);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
            }

            res.json({ success: true, message: 'Пароль пользователя успешно изменён', user });
        } catch (error) {
            console.error('Admin update password error:', error);
            res.status(500).json({ success: false, message: 'Ошибка при смене пароля' });
        }
    }
);

// DELETE /api/admin/users/:id — удаление пользователя
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({ success: false, message: 'Нельзя удалить собственный аккаунт' });
        }

        const user = await User.delete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        res.json({ success: true, message: `Пользователь ${user.name} удалён`, user });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении пользователя' });
    }
});

// ============================================
// ИЗБРАННЫЕ МЕСТА
// ============================================

// GET /api/admin/users/:id/favorites — избранные места пользователя
router.get('/users/:id/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        const favorites = await Favorite.findAllByUserId(req.params.id);
        res.json({ success: true, favorites, count: favorites.length, user });
    } catch (error) {
        console.error('Admin get user favorites error:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении избранных мест' });
    }
});

// DELETE /api/admin/favorites/:favId — удаление конкретного избранного по его ID
router.delete('/favorites/:favId', async (req, res) => {
    try {
        const favorite = await Favorite.deleteById(req.params.favId);
        if (!favorite) {
            return res.status(404).json({ success: false, message: 'Запись не найдена' });
        }
        res.json({ success: true, message: 'Избранное место удалено', favorite });
    } catch (error) {
        console.error('Admin delete favorite error:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении избранного' });
    }
});

module.exports = router;
