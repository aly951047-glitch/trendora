const express = require('express');
const { users, orders, products, payments, orderItems } = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', adminMiddleware, (req, res) => {
  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  res.json({
    totalUsers:    users.length,
    totalProducts: products.length,
    totalOrders:   orders.length,
    totalRevenue:  totalRevenue.toFixed(2),
    recentOrders:  orders.slice(-5).reverse()
  });
});

router.get('/users', adminMiddleware, (req, res) => {
  res.json(users.map(u => ({ userId: u.userId, name: u.name, email: u.email })));
});

router.get('/orders', adminMiddleware, (req, res) => {
  const result = orders.map(o => ({
    ...o,
    userName:  users.find(u => u.userId === o.userId)?.name || '—',
    itemCount: orderItems.filter(i => i.orderId === o.orderId).length
  }));
  res.json(result.reverse());
});

router.put('/orders/:id', adminMiddleware, (req, res) => {
  const order = orders.find(o => o.orderId === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = req.body.status;
  res.json(order);
});

module.exports = router;
