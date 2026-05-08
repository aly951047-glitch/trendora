// ============================================================
//  routes/cart.js
//  يمثل: ShoppingCart.addProduct(), removeProduct(),
//        updateProduct(), clearCart()
//        CartItem (cartItemId, cartId, productId)
// ============================================================

const express = require('express');
const { carts, cartItems, products, nextId } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


// ── Helper: جلب أو إنشاء ShoppingCart object للمستخدم ──
// يمثل: ShoppingCart constructor من الـ UML
function getOrCreateCart(userId) {
  let cart = carts.find(c => c.userId === userId);
  if (!cart) {
    // إنشاء ShoppingCart Object جديد
    cart = {
      cartId: nextId('cart'),  // int cartId
      userId                   // int userId
    };
    carts.push(cart);
  }
  return cart;
}


// ── Helper: بناء response مع تفاصيل المنتجات ───────────
function buildCartResponse(cart) {
  const items = cartItems
    .filter(i => i.cartId === cart.cartId)
    .map(i => ({
      ...i,
      product: products.find(p => p.productId === i.productId)
    }));
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return { cartId: cart.cartId, userId: cart.userId, items, total };
}


// ── GET /api/cart ───────────────────────────────────────
// يجلب ShoppingCart الخاص بالمستخدم
router.get('/', authMiddleware, (req, res) => {
  const cart = getOrCreateCart(req.user.userId);
  res.json(buildCartResponse(cart));
});


// ── POST /api/cart ──────────────────────────────────────
// يمثل: ShoppingCart.addProduct(int productId) من الـ UML
router.post('/', authMiddleware, (req, res) => {
  const { productId, size, quantity = 1 } = req.body;
  if (!productId || !size)
    return res.status(400).json({ error: 'productId and size required' });

  const product = products.find(p => p.productId === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const cart = getOrCreateCart(req.user.userId);

  // البحث إذا CartItem موجود مسبقاً بنفس المنتج والمقاس
  const existing = cartItems.find(
    i => i.cartId === cart.cartId && i.productId === productId && i.size === size
  );

  if (existing) {
    existing.quantity += quantity; // CartItem.Update()
  } else {
    // إنشاء CartItem Object جديد (يطابق UML attributes)
    const cartItem = {
      cartItemId: nextId('cartItem'), // int cartItemId
      cartId:     cart.cartId,        // int cartId
      productId,                      // int productId
      size,
      quantity
    };
    cartItems.push(cartItem); // CartItem.Save()
  }

  res.json(buildCartResponse(cart));
});


// ── PUT /api/cart/:cartItemId ───────────────────────────
// يمثل: ShoppingCart.updateProduct(int product) من الـ UML
router.put('/:cartItemId', authMiddleware, (req, res) => {
  const item = cartItems.find(i => i.cartItemId === parseInt(req.params.cartItemId));
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  const { quantity } = req.body;
  if (quantity <= 0) {
    cartItems.splice(cartItems.indexOf(item), 1); // CartItem.Delete()
  } else {
    item.quantity = quantity;
  }

  const cart = getOrCreateCart(req.user.userId);
  res.json(buildCartResponse(cart));
});


// ── DELETE /api/cart/:cartItemId ────────────────────────
// يمثل: ShoppingCart.removeProduct(int productId) من الـ UML
router.delete('/:cartItemId', authMiddleware, (req, res) => {
  const idx = cartItems.findIndex(i => i.cartItemId === parseInt(req.params.cartItemId));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  cartItems.splice(idx, 1);
  const cart = getOrCreateCart(req.user.userId);
  res.json(buildCartResponse(cart));
});


// ── DELETE /api/cart ────────────────────────────────────
// يمثل: ShoppingCart.clearCart() من الـ UML
router.delete('/', authMiddleware, (req, res) => {
  const cart = carts.find(c => c.userId === req.user.userId);
  if (cart) {
    // حذف كل CartItem objects تبع هذا الـ cart
    const toRemove = cartItems
      .reduce((acc, item, i) => { if (item.cartId === cart.cartId) acc.push(i); return acc; }, []);
    toRemove.reverse().forEach(i => cartItems.splice(i, 1));
  }
  res.json({ message: 'Cart cleared' });
});


module.exports = router;
