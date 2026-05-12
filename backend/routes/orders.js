const express = require('express');
const {
  orders, orderItems, payments,
  cartItems, carts, products, nextId
} = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


router.post('/', authMiddleware, (req, res) => {
  try {
    const { paymentMethod, address } = req.body;
    if (!paymentMethod || !address)
      return res.status(400).json({ error: 'paymentMethod and address required' });

    const cart = carts.find(c => c.userId === req.user.userId);
    if (!cart) return res.status(400).json({ error: 'Cart is empty' });

    const items = cartItems.filter(i => i.cartId === cart.cartId);
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    let totalAmount = 0;
    const itemsWithProduct = items.map(i => {
      const product = products.find(p => p.productId === i.productId);
      totalAmount += product.price * i.quantity;
      return { ...i, product };
    });

    const payment = {
      paymentId:     nextId('payment'),
      paymentMethod,
      amount:        totalAmount,
      date:          new Date(),
      status:        'Completed'
    };
    payments.push(payment);

    const order = {
      orderId:     nextId('order'),
      date:        new Date(),
      status:      'Confirmed',
      totalAmount,
      userId:      req.user.userId,
      payment:     payment.paymentId,
      address,
      orderRef:    `TRD-${Date.now()}`
    };
    orders.push(order);

    itemsWithProduct.forEach(i => {
      const orderItem = {
        orderItemId: nextId('orderItem'),
        orderId:     order.orderId,
        productId:   i.productId,
        priceOrder:  i.product.price,
        quantity:    i.quantity,
        size:        i.size
      };
      orderItems.push(orderItem);
    });

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


router.get('/:id', authMiddleware, (req, res) => {
  const order = orders.find(o => o.orderId === parseInt(req.params.id) && o.userId === req.user.userId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items   = orderItems.filter(i => i.orderId === order.orderId)
                            .map(i => ({ ...i, product: products.find(p => p.productId === i.productId) }));
  const payment = payments.find(p => p.paymentId === order.payment);
  res.json({ ...order, items, payment });
});


router.put('/:id/status', authMiddleware, (req, res) => {
  const order = orders.find(o => o.orderId === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = req.body.status;
  res.json(order);
});


module.exports = router;
