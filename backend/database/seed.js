// Seeds sample categories, an admin user, and demo products.
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['Store Admin', 'admin@coopshop.com', adminPassword]
    );

    const categories = [
      { name: 'Women', slug: 'women' },
      { name: 'Men', slug: 'men' },
      { name: 'Accessories', slug: 'accessories' },
    ];
    for (const c of categories) {
      await pool.query(
        `INSERT INTO categories (name, slug) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [c.name, c.slug]
      );
    }
    const [cats] = await pool.query('SELECT id, slug FROM categories');
    const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

    const products = [
      {
        name: 'Trendy Brown Jacket',
        slug: 'trendy-brown-jacket',
        description: 'A cozy brown jacket perfect for autumn layering.',
        price: 75.0,
        compare_price: 95.0,
        category_id: catMap.women,
        stock: 40,
        sku: 'WMN-JKT-001',
        images: JSON.stringify(['/uploads/placeholder-1.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Brown', 'Black']),
        is_featured: true,
      },
      {
        name: 'Classic White Shirt',
        slug: 'classic-white-shirt',
        description: 'A timeless white shirt for any occasion.',
        price: 45.0,
        compare_price: null,
        category_id: catMap.men,
        stock: 60,
        sku: 'MEN-SHT-002',
        images: JSON.stringify(['/uploads/placeholder-2.jpg']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['White']),
        is_featured: true,
      },
      {
        name: 'Modern Tote Bag',
        slug: 'modern-tote-bag',
        description: 'Spacious tote bag for everyday essentials.',
        price: 60.0,
        compare_price: 80.0,
        category_id: catMap.accessories,
        stock: 25,
        sku: 'ACC-BAG-003',
        images: JSON.stringify(['/uploads/placeholder-3.jpg']),
        sizes: JSON.stringify([]),
        colors: JSON.stringify(['Tan', 'Black']),
        is_featured: false,
      },
    ];

    for (const p of products) {
      await pool.query(
        `INSERT INTO products
          (name, slug, description, price, compare_price, category_id, stock, sku, images, sizes, colors, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE price = VALUES(price)`,
        [
          p.name, p.slug, p.description, p.price, p.compare_price,
          p.category_id, p.stock, p.sku, p.images, p.sizes, p.colors, p.is_featured,
        ]
      );
    }

    console.log('Seed complete. Admin login: admin@coopshop.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
