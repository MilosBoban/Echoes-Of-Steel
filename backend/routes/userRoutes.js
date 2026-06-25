const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', userController.getUsers);
router.delete('/:id', protect, restrictTo('Admin'), userController.deleteUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', protect, userController.updateUser);

module.exports = router;