const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/promoCodeController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', promoCodeController.getPromoCode);
router.post('/', protect, restrictTo('Admin'), promoCodeController.createPromoCode);
router.delete('/:id', protect, restrictTo('Admin'), promoCodeController.deletePromoCode);
router.put('/:id', protect, restrictTo('Admin'), promoCodeController.updatePromoCode);
router.get('/:kod', promoCodeController.getPromoCodeByString);

module.exports = router;
