const express = require('express');
const { query, run }     = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function getOrCreateCart(userId) {
  let [cart] = query('SELECT * FROM carts WHERE userId = ?', [userId]);
  if (!cart) {
    const { lastInsertRowid } = run('INSERT INTO carts (userId) VALUES (?)', [userId]);
    cart = { cartId: lastInsertRowid, userId };
  }
  return cart;
}

function buildCartResponse(cart) {
  const items = query('SELECT * FROM cartItems WHERE cartId = ?', [cart.cartId]).map(item => ({
    ...item,
    product: query('SELECT * FROM products WHERE productId = ?', [item.productId])[0]
  }));
  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  return { cartId: cart.cartId, userId: cart.userId, items, total };
}

router.get('/', authMiddleware, (req, res) => {
  const cart = getOrCreateCart(req.user.userId);
  res.json(buildCartResponse(cart));
});

router.post('/', authMiddleware, (req, res) => {
  const { productId, size, quantity = 1 } = req.body;
  if (!productId || !size)
    return res.status(400).json({ error: 'productId and size required' });

  const [product] = query('SELECT * FROM products WHERE productId = ?', [productId]);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const cart = getOrCreateCart(req.user.userId);
  const [existing] = query(
    'SELECT * FROM cartItems WHERE cartId = ? AND productId = ? AND size = ?',
    [cart.cartId, productId, size]
  );

  if (existing) {
    run('UPDATE cartItems SET quantity = ? WHERE cartItemId = ?',
        [existing.quantity + quantity, existing.cartItemId]);
  } else {
    run('INSERT INTO cartItems (cartId, productId, size, quantity) VALUES (?, ?, ?, ?)',
        [cart.cartId, productId, size, quantity]);
  }

  res.json(buildCartResponse(cart));
});

router.put('/:cartItemId', authMiddleware, (req, res) => {
  const cartItemId = parseInt(req.params.cartItemId);
  const [item] = query('SELECT * FROM cartItems WHERE cartItemId = ?', [cartItemId]);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  const { quantity } = req.body;
  if (quantity <= 0) {
    run('DELETE FROM cartItems WHERE cartItemId = ?', [cartItemId]);
  } else {
    run('UPDATE cartItems SET quantity = ? WHERE cartItemId = ?', [quantity, cartItemId]);
  }

  const cart = getOrCreateCart(req.user.userId);
  res.json(buildCartResponse(cart));
});

router.delete('/:cartItemId', authMiddleware, (req, res) => {
  const cartItemId = parseInt(req.params.cartItemId);
  run('DELETE FROM cartItems WHERE cartItemId = ?', [cartItemId]);
  const cart = getOrCreateCart(req.user.userId);
  res.json(buildCartResponse(cart));
});

router.delete('/', authMiddleware, (req, res) => {
  const [cart] = query('SELECT * FROM carts WHERE userId = ?', [req.user.userId]);
  if (cart) run('DELETE FROM cartItems WHERE cartId = ?', [cart.cartId]);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
