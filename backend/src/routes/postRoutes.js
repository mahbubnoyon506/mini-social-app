const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require('../controllers/postController');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Post text is required')
      .isLength({ max: 2000 })
      .withMessage('Post text must be under 2000 characters'),
  ],
  validate,
  createPost
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('username').optional().isString().trim(),
  ],
  validate,
  getPosts
);

router.post(
  '/:id/like',
  [param('id').isMongoId().withMessage('Invalid post id')],
  validate,
  toggleLike
);

router.post(
  '/:id/comment',
  [
    param('id').isMongoId().withMessage('Invalid post id'),
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Comment text is required')
      .isLength({ max: 500 })
      .withMessage('Comment must be under 500 characters'),
  ],
  validate,
  addComment
);

module.exports = router;
