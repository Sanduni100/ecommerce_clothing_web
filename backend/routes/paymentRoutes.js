const express = require('express');
const router = express.Router();
const { createCheckoutSession, getOrderPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/session/:orderId', protect, getOrderPaymentStatus);
// Note: the raw webhook route is mounted separately in server.js (needs raw body, not JSON-parsed)

module.exports = router;
