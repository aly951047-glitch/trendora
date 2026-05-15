const express = require('express');
const { query, run }     = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  try {
    const { paymentMethod, address } = req.body;
    if (!paymentMethod || !address)
      return res.status(400).json({ error: 'paymentMethod and address required' });

    const [cart] = query('SELECT * FROM carts WHERE userId = ?', [req.user.userId]);
    if (!cart) return res.status(400).json({ error: 'Cart is empty' });

    const items = query('SELECT * FROM cartItems WHERE cartId = ?', [cart.cartId]);
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    const itemsWithProduct = items.map(i => ({
      ...i,
      product: query('SELECT * FROM products WHERE productId = ?', [i.productId])[0]
    }));

    const totalAmount = itemsWithProduct.reduce(
      (sum, i) => sum + i.product.price * i.quantity, 0
    );

    const { lastInsertRowid: paymentId } = run(
      'INSERT INTO payments (paymentMethod, amount, date, status) VALUES (?, ?, ?, ?)',
      [paymentMethod, totalAmount, new Date().toISOString(), 'Completed']
    );

    const orderRef = `TRD-${Date.now()}`;
    const { lastInsertRowid: orderId } = run(
      `INSERT INTO orders (date, status, totalAmount, userId, paymentId, address, orderRef)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [new Date().toISOString(), 'Confirmed', totalAmount, req.user.userId, paymentId, address, orderRef]
    );

    itemsWithProduct.forEach(i => {
      run(
        'INSERT INTO orderItems (orderId, productId, priceOrder, quantity, size) VALUES (?, ?, ?, ?, ?)',
        [orderId, i.productId, i.product.price, i.quantity, i.size]
      );
    });

    run('DELETE FROM cartItems WHERE cartId = ?', [cart.cartId]);

    const [payment] = query('SELECT * FROM payments WHERE paymentId = ?', [paymentId]);
    const [order]   = query('SELECT * FROM orders   WHERE orderId   = ?', [orderId]);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        ...order,
        items: itemsWithProduct.map(i => ({
          productName: i.product.name, size: i.size, quantity: i.quantity, price: i.product.price
        })),
        payment
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', authMiddleware, (req, res) => {
  const orders = query('SELECT * FROM orders WHERE userId = ? ORDER BY orderId DESC', [req.user.userId]);
  const result = orders.map(o => ({
    ...o,
    items: query('SELECT * FROM orderItems WHERE orderId = ?', [o.orderId]).map(i => ({
      ...i, product: query('SELECT * FROM products WHERE productId = ?', [i.productId])[0]
    })),
    payment: query('SELECT * FROM payments WHERE paymentId = ?', [o.paymentId])[0]
  }));
  res.json(result);
});

router.get('/:id', authMiddleware, (req, res) => {
  const [order] = query(
    'SELECT * FROM orders WHERE orderId = ? AND userId = ?',
    [parseInt(req.params.id), req.user.userId]
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = query('SELECT * FROM orderItems WHERE orderId = ?', [order.orderId]).map(i => ({
    ...i, product: query('SELECT * FROM products WHERE productId = ?', [i.productId])[0]
  }));
  const [payment] = query('SELECT * FROM payments WHERE paymentId = ?', [order.paymentId]);
  res.json({ ...order, items, payment });
});

router.put('/:id/status', authMiddleware, (req, res) => {
  const [order] = query('SELECT * FROM orders WHERE orderId = ?', [parseInt(req.params.id)]);
  if (!order) return res.status(404).json({ error: 'Not found' });
  run('UPDATE orders SET status = ? WHERE orderId = ?', [req.body.status, order.orderId]);
  const [updated] = query('SELECT * FROM orders WHERE orderId = ?', [order.orderId]);
  res.json(updated);
});

module.exports = router;
