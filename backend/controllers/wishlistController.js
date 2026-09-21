const pool = require('../config/db');

// @route GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.id AS wishlist_id, p.* FROM wishlists w
       JOIN products p ON w.product_id = p.id WHERE w.user_id = ? ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    const items = rows.map((p) => ({
      ...p,
      images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
    }));
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

// @route POST /api/wishlist  { product_id }
exports.addToWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'Product is required' });
    await pool.query(
      `INSERT INTO wishlists (user_id, product_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = user_id`,
      [req.user.id, product_id]
    );
    res.status(201).json({ success: true, message: 'Added to your favourites' });
  } catch (err) { next(err); }
};

// @route DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    res.json({ success: true, message: 'Removed from your favourites' });
  } catch (err) { next(err); }
};
