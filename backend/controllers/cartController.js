const pool = require('../config/db');

// @route GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.quantity, ci.size, ci.color,
              p.id AS product_id, p.name, p.slug, p.price, p.images, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    const items = rows.map((r) => ({ ...r, images: JSON.parse(r.images || '[]') }));
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    res.json({ success: true, items, subtotal });
  } catch (err) { next(err); }
};

// @route POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1, size = null, color = null } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'Product is required' });

    const [product] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (!product.length) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product[0].stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=? AND size<=>? AND color<=>?',
      [req.user.id, product_id, size, color]
    );
    if (existing.length) {
      await pool.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, product_id, quantity, size, color]
      );
    }
    res.status(201).json({ success: true, message: 'Added to cart' });
  } catch (err) { next(err); }
};

// @route PUT /api/cart/:id
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) { next(err); }
};

// @route DELETE /api/cart/:id
exports.removeCartItem = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) { next(err); }
};

// @route DELETE /api/cart  (clear cart, used after successful order)
exports.clearCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
