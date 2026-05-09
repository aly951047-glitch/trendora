// ============================================================
//  server.js — Trendora Backend Entry Point
//  Uses Express to run the server and connect all Routes
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();

// process.env.PORT → Render sets this automatically
const PORT = process.env.PORT || 3000;


// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());


// ── Serve Frontend Static Files ────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));


// ── API Routes (each route represents a Class from the UML) 
app.use('/api/auth',     require('./routes/auth'));      // User class
app.use('/api/products', require('./routes/products'));  // Product + Category
app.use('/api/cart',     require('./routes/cart'));      // ShoppingCart + CartItem
app.use('/api/orders',   require('./routes/orders'));    // Order + OrderItem + Payment
app.use('/api/admin',    require('./routes/admin'));     // Admin class


// ── Serve index.html for all other routes ─────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


app.listen(PORT, () => {
  console.log(`\n✅  Trendora running → http://localhost:${PORT}\n`);
});
