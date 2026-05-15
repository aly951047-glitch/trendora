const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { DatabaseConnection } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

DatabaseConnection.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅  Trendora running → http://localhost:${PORT}\n`);
    console.log(`📦  Database: SQLite → trendora.db\n`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

process.on('SIGINT',  () => { DatabaseConnection.disConnect(); process.exit(0); });
process.on('SIGTERM', () => { DatabaseConnection.disConnect(); process.exit(0); });
