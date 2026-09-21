const pool = require('../config/db');

// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS totalRevenue FROM orders WHERE payment_status = 'paid'"
    );
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ totalCustomers }]] = await pool.query("SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'");
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name AS customer_name
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`
    );
    const [lowStock] = await pool.query('SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5');

    res.json({
      success: true,
      stats: { totalRevenue, totalOrders, totalProducts, totalCustomers },
      recentOrders,
      lowStock,
    });
  } catch (err) { next(err); }
};

// @route GET /api/admin/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
    );
    res.json({ success: true, customers: rows });
  } catch (err) { next(err); }
};
