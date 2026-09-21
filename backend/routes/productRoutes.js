const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, addReview } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
