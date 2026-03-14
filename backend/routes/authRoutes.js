const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/v1/register', register);
router.post('/v1/login', login);
router.get('/me', protect, getMe);
router.post('/v1/forgot-password', forgotPassword);
router.post('/v1/reset-password/:token', resetPassword);

module.exports = router;
