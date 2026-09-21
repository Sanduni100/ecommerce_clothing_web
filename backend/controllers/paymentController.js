const Stripe = require('stripe');
const pool = require('../config/db');

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const stripeConfigured = STRIPE_KEY && !STRIPE_KEY.includes('xxxx');
const stripe = stripeConfigured ? Stripe(STRIPE_KEY) : null;

// @route POST /api/payment/create-checkout-session
// Creates a Stripe Checkout Session from the user's current cart, and stores a pending order.
exports.createCheckoutSession = async (req, res, next) => {
  try {
    if (!stripeConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Payments are not configured yet: STRIPE_SECRET_KEY in backend/.env is still a placeholder. Add your real Stripe test key and restart the server.',
      });
    }
    const { shippingAddress } = req.body;

    const [cartRows] = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, ci.size, ci.color,
              p.id AS product_id, p.name, p.price, p.images, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?`,
      [req.user.id]
    );
    if (!cartRows.length) return res.status(400).json({ success: false, message: 'Your cart is empty' });

    for (const item of cartRows) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${item.name} is out of stock` });
      }
    }

    const subtotal = cartRows.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const shippingFee = subtotal > 100 ? 0 : 9.99;
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();

    // Create a pending order first so we can reconcile it in the webhook
    const [orderResult] = await pool.query(
      `INSERT INTO orders (user_id, order_number, subtotal, shipping_fee, total, shipping_address, payment_method, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'stripe', 'pending', 'unpaid')`,
      [req.user.id, orderNumber, subtotal, shippingFee, subtotal + shippingFee, JSON.stringify(shippingAddress || {})]
    );
    const orderId = orderResult.insertId;
    for (const item of cartRows) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.quantity, item.size, item.color]
      );
    }

    const line_items = cartRows.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));
    if (shippingFee > 0) {
      line_items.push({
        price_data: { currency: 'usd', product_data: { name: 'Shipping' }, unit_amount: Math.round(shippingFee * 100) },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.CLIENT_URL}/checkout/success?order=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      metadata: { order_id: orderId, user_id: req.user.id },
    });

    await pool.query('UPDATE orders SET stripe_session_id = ? WHERE id = ?', [session.id, orderId]);
    res.json({ success: true, url: session.url });
  } catch (err) { next(err); }
};

// @route POST /api/payment/webhook  (raw body - Stripe signature verification)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;
    try {
      await pool.query(
        `UPDATE orders SET status = 'paid', payment_status = 'paid' WHERE id = ?`,
        [orderId]
      );
      // Decrement stock and clear the buyer's cart now that payment is confirmed
      const [items] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }
      await pool.query('DELETE FROM cart_items WHERE user_id = ?', [session.metadata.user_id]);
    } catch (err) {
      console.error('Error reconciling order after payment:', err);
    }
  }

  res.json({ received: true });
};

// @route GET /api/payment/session/:orderId  (used by success page to confirm status)
exports.getOrderPaymentStatus = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, order_number, status, payment_status, payment_method, total FROM orders WHERE id = ? AND user_id = ?', [
      req.params.orderId, req.user.id,
    ]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: rows[0] });
  } catch (err) { next(err); }
};
