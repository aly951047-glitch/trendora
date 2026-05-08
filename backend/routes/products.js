// ============================================================
//  routes/products.js
//  يمثل: Product.Save(), Update(), Delete()
//        Category.addProduct(), removeProduct(), getProduct()
// ============================================================

const express = require('express');
const { products, categories } = require('../db');
const { adminMiddleware }      = require('../middleware/auth');

const router = express.Router();


// ── GET /api/products ───────────────────────────────────
// يمثل: Category.getProduct() من الـ UML
// يرجع كل المنتجات، مع فلترة اختيارية بالـ category
router.get('/', (req, res) => {
  const { category } = req.query;
  const result = category
    ? products.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : products;
  res.json(result);
});


// ── GET /api/products/categories ───────────────────────
// يرجع كل الـ Category objects
router.get('/categories/all', (req, res) => {
  res.json(categories);
});


// ── GET /api/products/:id ───────────────────────────────
// يرجع Product object واحد
router.get('/:id', (req, res) => {
  const product = products.find(p => p.productId === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});


// ── POST /api/products ──────────────────────────────────
// يمثل: Product.Save() + Category.addProduct() من الـ UML
// Admin فقط
router.post('/', adminMiddleware, (req, res) => {
  const { name, price, category, image, badge } = req.body;
  if (!name || !price || !category)
    return res.status(400).json({ error: 'name, price, category required' });

  // إنشاء Product Object (يطابق UML attributes)
  const product = {
    productId: products.length + 1,  // int productId
    name,                             // String name
    price:    parseFloat(price),      // double price
    category,                         // String category
    image:    image  || '',
    badge:    badge  || ''
  };

  products.push(product); // Product.Save()
  res.status(201).json(product);
});


// ── PUT /api/products/:id ───────────────────────────────
// يمثل: Product.Update() من الـ UML
router.put('/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.productId === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});


// ── DELETE /api/products/:id ────────────────────────────
// يمثل: Product.Delete() + Category.removeProduct() من الـ UML
router.delete('/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.productId === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products.splice(idx, 1);
  res.json({ message: 'Product deleted' });
});


module.exports = router;
