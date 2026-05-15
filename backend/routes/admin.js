const express = require('express');
const { query, run }      = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', adminMiddleware, (req, res) => {
  const [{ total: totalRevenue }] = query('SELECT COALESCE(SUM(amount),0) as total FROM payments');
  const [{ c: totalUsers }]    = query('SELECT COUNT(*) as c FROM users');
  const [{ c: totalProducts }] = query('SELECT COUNT(*) as c FROM products');
  const [{ c: totalOrders }]   = query('SELECT COUNT(*) as c FROM orders');
  const recentOrders = query('SELECT * FROM orders ORDER BY orderId DESC LIMIT 5');

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: parseFloat(totalRevenue).toFixed(2),
    recentOrders
  });
});

router.get('/users', adminMiddleware, (req, res) => {
  res.json(query('SELECT userId, name, email FROM users'));
});

router.get('/orders', adminMiddleware, (req, res) => {
  const orders = query('SELECT * FROM orders ORDER BY orderId DESC');
  const result = orders.map(o => {
    const [user] = query('SELECT name FROM users WHERE userId = ?', [o.userId]);
    const [{ c: itemCount }] = query('SELECT COUNT(*) as c FROM orderItems WHERE orderId = ?', [o.orderId]);
    return { ...o, userName: user?.name || '—', itemCount };
  });
  res.json(result);
});

router.put('/orders/:id', adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const [order] = query('SELECT * FROM orders WHERE orderId = ?', [id]);
  if (!order) return res.status(404).json({ error: 'Not found' });
  run('UPDATE orders SET status = ? WHERE orderId = ?', [req.body.status, id]);
  const [updated] = query('SELECT * FROM orders WHERE orderId = ?', [id]);
  res.json(updated);
});

module.exports = router;
