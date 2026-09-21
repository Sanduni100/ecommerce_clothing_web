const pool = require('../config/db');

exports.getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, categories: rows });
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, image } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and slug are required' });
    const [result] = await pool.query('INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)', [name, slug, image || null]);
    res.status(201).json({ success: true, message: 'Category created successfully', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Category slug already exists' });
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) { next(err); }
};
