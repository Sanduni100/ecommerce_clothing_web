const pool = require('../config/db');

const parseJsonFields = (product) => ({
  ...product,
  images: safeParse(product.images, []),
  sizes: safeParse(product.sizes, []),
  colors: safeParse(product.colors, []),
});
function safeParse(val, fallback) {
  if (val == null) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// @route GET /api/products  (supports ?category=&search=&featured=&page=&limit=&sort=)
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, page = 1, limit = 12, sort = 'newest' } = req.query;
    const where = [];
    const params = [];

    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (search) { where.push('p.name LIKE ?'); params.push(`%${search}%`); }
    if (featured === 'true') { where.push('p.is_featured = 1'); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.rating DESC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;

    const offset = (Number(page) - 1) * Number(limit);
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );

    res.json({
      success: true,
      products: rows.map(parseJsonFields),
      total: countRows[0].total,
      page: Number(page),
      totalPages: Math.ceil(countRows[0].total / Number(limit)),
    });
  } catch (err) { next(err); }
};

// @route GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const [reviews] = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [rows[0].id]
    );

    res.json({ success: true, product: parseJsonFields(rows[0]), reviews });
  } catch (err) { next(err); }
};

// @route POST /api/admin/products  (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, slug, description, price, compare_price, category_id, stock, sku, images, sizes, colors, is_featured } = req.body;
    if (!name || !slug || !price) {
      return res.status(400).json({ success: false, message: 'Name, slug and price are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, price, compare_price, category_id, stock, sku, images, sizes, colors, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || '', price, compare_price || null, category_id || null, stock || 0, sku || '',
        JSON.stringify(images || []), JSON.stringify(sizes || []), JSON.stringify(colors || []), !!is_featured]
    );
    res.status(201).json({ success: true, message: 'Product created successfully', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A product with this slug already exists' });
    }
    next(err);
  }
};

// @route PUT /api/admin/products/:id  (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, compare_price, category_id, stock, sku, images, sizes, colors, is_featured } = req.body;
    const [result] = await pool.query(
      `UPDATE products SET name=?, description=?, price=?, compare_price=?, category_id=?, stock=?, sku=?, images=?, sizes=?, colors=?, is_featured=?
       WHERE id=?`,
      [name, description, price, compare_price || null, category_id || null, stock, sku,
        JSON.stringify(images || []), JSON.stringify(sizes || []), JSON.stringify(colors || []), !!is_featured, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) { next(err); }
};

// @route DELETE /api/admin/products/:id  (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) { next(err); }
};

// @route POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ success: false, message: 'Rating is required' });

    await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, rating, comment || '']
    );
    const [agg] = await pool.query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE product_id = ?',
      [req.params.id]
    );
    await pool.query('UPDATE products SET rating = ?, num_reviews = ? WHERE id = ?', [
      Number(agg[0].avg_rating).toFixed(1), agg[0].cnt, req.params.id,
    ]);
    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (err) { next(err); }
};
