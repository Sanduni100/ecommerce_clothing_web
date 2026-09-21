const pool = require('../config/db');

function generateOrderNumber() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
}

// Creates an order + order_items from the user's current cart. Called internally after payment succeeds,
// or directly for "cash on delivery" style flows.
async function createOrderFromCart(userId, shippingAddress, paymentMethod = 'stripe') {
  const [cartRows] = await pool.query(
    `SELECT ci.quantity, ci.size, ci.color, p.id AS product_id, p.name, p.price, p.stock
     FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?`,
    [userId]
  );
  if (!cartRows.length) throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });

  for (const item of cartRows) {
    if (item.stock < item.quantity) {
      throw Object.assign(new Error(`${item.name} is out of stock`), { statusCode: 400 });
    }
  }

  const subtotal = cartRows.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const shippingFee = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  const [orderResult] = await pool.query(
    `INSERT INTO orders (user_id, order_number, subtotal, shipping_fee, total, shipping_address, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, orderNumber, subtotal, shippingFee, total, JSON.stringify(shippingAddress || {}), paymentMethod]
  );
  const orderId = orderResult.insertId;

  for (const item of cartRows) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.name, item.price, item.quantity, item.size, item.color]
    );
    await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
  }
  await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  return { orderId, orderNumber, total };
}

// @route GET /api/orders  (current user's orders)
exports.getMyOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @route GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ success: true, order: orders[0], items });
  } catch (err) { next(err); }
};

// @route GET /api/admin/orders  (admin - all orders)
exports.getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
    );
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status value' });

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: `Order marked as ${status}` });
  } catch (err) { next(err); }
};

// @route POST /api/orders/cod  (Cash on Delivery - creates the order immediately, no payment gateway)
exports.placeCodOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress?.full_name || !shippingAddress?.line1 || !shippingAddress?.city) {
      return res.status(400).json({ success: false, message: 'Please provide a complete shipping address' });
    }
    const { orderId, orderNumber, total } = await createOrderFromCart(req.user.id, shippingAddress, 'cod');
    res.status(201).json({
      success: true,
      message: 'Order placed successfully - pay in cash when it arrives',
      orderId, orderNumber, total,
    });
  } catch (err) { next(err); }
};

exports.createOrderFromCart = createOrderFromCart;
