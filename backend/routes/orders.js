// ============================================================
//  routes/orders.js
//  Represents: Order.Save(), calculateTotal(), setStatues()
//              OrderItem (orderItemId, orderId, productId, priceOrder)
//              Payment.save(), processPayment()
// ============================================================

const express = require('express');
const {
  orders, orderItems, payments,
  cartItems, carts, products, nextId
} = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


// ── POST /api/orders ────────────────────────────────────────
// Represents: Order.Save() + Payment.processPayment() from the UML
router.post('/', authMiddleware, (req, res) => {
  try {
    const { paymentMethod, address } = req.body;
    if (!paymentMethod || !address)
      return res.status(400).json({ error: 'paymentMethod and address required' });

    // Get the user's shopping cart
    const cart = carts.find(c => c.userId === req.user.userId);
    if (!cart) return res.status(400).json({ error: 'Cart is empty' });

    const items = cartItems.filter(i => i.cartId === cart.cartId);
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    // ── Order.calculateTotal() ──────────────────────────────
    let totalAmount = 0;
    const itemsWithProduct = items.map(i => {
      const product = products.find(p => p.productId === i.productId);
      totalAmount += product.price * i.quantity;
      return { ...i, product };
    });

    // ── Create a new Payment Object (matches UML attributes) ─
    const payment = {
      paymentId:     nextId('payment'),  // int paymentId
      paymentMethod,                     // String paymentMethod
      amount:        totalAmount,        // double amount
      date:          new Date(),         // Date date
      status:        'Completed'         // String status
    };
    payments.push(payment); // Payment.save()

    // ── Create a new Order Object (matches UML attributes) ───
    const order = {
      orderId:     nextId('order'),    // int orderId
      date:        new Date(),         // Date date
      status:      'Confirmed',        // String Status → Order.setStatues()
      totalAmount,                     // double totalAmount
      userId:      req.user.userId,    // int userid
      payment:     payment.paymentId,  // int payment
      address,
      orderRef:    `TRD-${Date.now()}`
    };
    orders.push(order); // Order.Save()

    // ── Create OrderItem Objects for each item in the cart ───
    itemsWithProduct.forEach(i => {
      const orderItem = {
        orderItemId: nextId('orderItem'), // int orderItemId
        orderId:     order.orderId,       // int orderId
        productId:   i.productId,         // int productId
        priceOrder:  i.product.price,     // double priceOrder
        quantity:    i.quantity,
        size:        i.size
      };
      orderItems.push(orderItem); // OrderItem.Save()
    });

    // ── ShoppingCart.clearCart() after placing the order ─────
    const toRemove = cartItems
      .reduce((acc, item, i) => { if (item.cartId === cart.cartId) acc.push(i); return acc; }, []);
    toRemove.reverse().forEach(i => cartItems.splice(i, 1));

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        ...order,
        items: itemsWithProduct.map(i => ({
          productName: i.product.name,
          size:        i.size,
          quantity:    i.quantity,
          price:       i.product.price
        })),
        payment
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/orders ──────────────────────────────────────────
// Get all orders for the logged-in user
router.get('/', authMiddleware, (req, res) => {
  const userOrders = orders
    .filter(o => o.userId === req.user.userId)
    .map(o => ({
      ...o,
      items:   orderItems.filter(i => i.orderId === o.orderId)
                         .map(i => ({ ...i, product: products.find(p => p.productId === i.productId) })),
      payment: payments.find(p => p.paymentId === o.payment)
    }));
  res.json(userOrders.reverse());
});


// ── GET /api/orders/:id ──────────────────────────────────────
// Get a single Order object by ID
router.get('/:id', authMiddleware, (req, res) => {
  const order = orders.find(o => o.orderId === parseInt(req.params.id) && o.userId === req.user.userId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items   = orderItems.filter(i => i.orderId === order.orderId)
                            .map(i => ({ ...i, product: products.find(p => p.productId === i.productId) }));
  const payment = payments.find(p => p.paymentId === order.payment);
  res.json({ ...order, items, payment });
});


// ── PUT /api/orders/:id/status ───────────────────────────────
// Represents: Order.setStatues(String status) from the UML
router.put('/:id/status', authMiddleware, (req, res) => {
  const order = orders.find(o => o.orderId === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = req.body.status; // Order.setStatues()
  res.json(order);
});


module.exports = router;
