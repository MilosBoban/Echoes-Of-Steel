const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', itemController.getItems);
router.post('/', protect, restrictTo('Admin'), itemController.createItems);
router.delete('/:id', protect, restrictTo('Admin'), itemController.deleteItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', protect, restrictTo('Admin'), itemController.updateItem); 

module.exports = router;