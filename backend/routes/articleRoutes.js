const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', articleController.getArticles);
router.post('/', protect, restrictTo('Admin'), articleController.createArticle);
router.delete('/:id', protect, restrictTo('Admin'), articleController.deleteArticle);
router.get('/:id', articleController.getArticleById);
router.put('/:id', protect, restrictTo('Admin'), articleController.updateArticle);

module.exports = router;
