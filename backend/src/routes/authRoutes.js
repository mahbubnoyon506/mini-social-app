const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  signup,
  login,
  me,
  updateFcmToken,
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3-30 characters')
      .matches(/^[a-zA-Z0-9_.]+$/)
      .withMessage('Username may only contain letters, numbers, underscores and dots'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', auth, me);

router.patch(
  '/fcm-token',
  auth,
  [body('fcmToken').optional({ nullable: true }).isString()],
  validate,
  updateFcmToken
);

module.exports = router;
