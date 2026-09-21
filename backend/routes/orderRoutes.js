const express = require('express');
const router = express.Router();
const { getMyOrders, getOrderById, placeCodOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyOrders);
router.post('/cod', placeCodOrder);
router.get('/:id', getOrderById);

module.exports = router;
