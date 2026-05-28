const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, restrictTo('Admin'), orderController.getOrders);
router.post('/', protect, orderController.createOrder);
router.delete('/:id', protect, restrictTo('Admin'), orderController.deleteOrder);
router.put('/:id', protect, restrictTo('Admin'), orderController.updateOrder);

module.exports = router;