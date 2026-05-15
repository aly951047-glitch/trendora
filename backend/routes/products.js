const express = require('express');
const { query, run }      = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  const rows = category
    ? query('SELECT * FROM products WHERE LOWER(category) = LOWER(?)', [category])
    : query('SELECT * FROM products');
  res.json(rows);
});

router.get('/categories/all', (req, res) => {
  res.json(query('SELECT * FROM categories'));
});

router.get('/:id', (req, res) => {
  const [product] = query('SELECT * FROM products WHERE productId = ?', [parseInt(req.params.id)]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', adminMiddleware, (req, res) => {
  const { name, price, category, image, badge } = req.body;
  if (!name || !price || !category)
    return res.status(400).json({ error: 'name, price, category required' });

  const { lastInsertRowid } = run(
    'INSERT INTO products (name, price, category, image, badge) VALUES (?, ?, ?, ?, ?)',
    [name, parseFloat(price), category, image || '', badge || '']
  );
  const [product] = query('SELECT * FROM products WHERE productId = ?', [lastInsertRowid]);
  res.status(201).json(product);
});

router.put('/:id', adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const [existing] = query('SELECT * FROM products WHERE productId = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { name, price, category, image, badge } = req.body;
  run(
    `UPDATE products SET name=?, price=?, category=?, image=?, badge=? WHERE productId=?`,
    [name ?? existing.name, price != null ? parseFloat(price) : existing.price,
     category ?? existing.category, image ?? existing.image, badge ?? existing.badge, id]
  );
  const [updated] = query('SELECT * FROM products WHERE productId = ?', [id]);
  res.json(updated);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const [existing] = query('SELECT productId FROM products WHERE productId = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  run('DELETE FROM products WHERE productId = ?', [id]);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
