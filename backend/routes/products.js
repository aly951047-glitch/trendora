const express = require('express');
const { products, categories } = require('../db');
const { adminMiddleware }      = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  const result = category
    ? products.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : products;
  res.json(result);
});

router.get('/categories/all', (req, res) => {
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const product = products.find(p => p.productId === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', adminMiddleware, (req, res) => {
  const { name, price, category, image, badge } = req.body;
  if (!name || !price || !category)
    return res.status(400).json({ error: 'name, price, category required' });

  const product = {
    productId: products.length + 1,
    name,
    price:    parseFloat(price),
    category,
    image:    image || '',
    badge:    badge || ''
  };
  products.push(product);
  res.status(201).json(product);
});

router.put('/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.productId === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.productId === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products.splice(idx, 1);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
