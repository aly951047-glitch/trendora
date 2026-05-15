const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, '..', 'trendora.db');

const DatabaseConnection = {
  url:       `sqlite://${DB_PATH}`,
  username:  'trendora_admin',
  password:  'secret123',
  connected: false,
  _db:       null,

  async connect() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      this._db = new SQL.Database(buffer);
      console.log('[DB] DatabaseConnection.connect() → Loaded existing DB ✅');
    } else {
      this._db = new SQL.Database();
      console.log('[DB] DatabaseConnection.connect() → Created new DB ✅');
    }
    this.connected = true;
    this._createTables();
    this._seed();
    return this._db;
  },

  save() {
    if (!this._db) return;
    const data = this._db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  },

  disConnect() {
    this.save();
    this.connected = false;
    console.log('[DB] DatabaseConnection.disConnect() → Disconnected');
  },

  _createTables() {
    const db = this._db;
    db.run(`CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      adminId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      categoryId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      productId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, price REAL NOT NULL, category TEXT NOT NULL,
      badge TEXT DEFAULT '', image TEXT DEFAULT ''
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS carts (
      cartId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE, FOREIGN KEY (userId) REFERENCES users(userId)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cartItems (
      cartItemId INTEGER PRIMARY KEY AUTOINCREMENT,
      cartId INTEGER NOT NULL, productId INTEGER NOT NULL,
      size TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (cartId) REFERENCES carts(cartId),
      FOREIGN KEY (productId) REFERENCES products(productId)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      orderId INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Confirmed',
      totalAmount REAL NOT NULL, userId INTEGER NOT NULL,
      paymentId INTEGER, address TEXT NOT NULL, orderRef TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS orderItems (
      orderItemId INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL, productId INTEGER NOT NULL,
      priceOrder REAL NOT NULL, quantity INTEGER NOT NULL, size TEXT NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(orderId),
      FOREIGN KEY (productId) REFERENCES products(productId)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      paymentId INTEGER PRIMARY KEY AUTOINCREMENT,
      paymentMethod TEXT NOT NULL, amount REAL NOT NULL,
      date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Completed'
    )`);
    this.save();
    console.log('[DB] Tables created ✅');
  },

  _seed() {
    const db = this._db;
    const userCount = db.exec('SELECT COUNT(*) as c FROM users')[0]?.values[0][0];
    if (userCount > 0) { console.log('[DB] Seed skipped ✅'); return; }

    db.run(`INSERT INTO admins (name,email,passwordHash) VALUES ('Super Admin','admin@trendora.com','$2a$10$nwrzsZ5RDYVaRMHmzeUyi.0F4Ppj3Z52JM9ZEmLvLzub9jI4vIhd6')`);
    db.run(`INSERT INTO users  (name,email,passwordHash) VALUES ('Ahmed Ali','ahmed@test.com','$2a$10$nwrzsZ5RDYVaRMHmzeUyi.0F4Ppj3Z52JM9ZEmLvLzub9jI4vIhd6')`);

    ['Shirts','Pants','Jackets','Suits','Accessories','Shoes'].forEach(n => {
      db.run(`INSERT INTO categories (name) VALUES ('${n}')`);
    });

    const P = [
      ['Oxford Button Shirt',89,'Shirts','New','https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
      ['Slim Fit Chinos',120,'Pants','Best','https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
      ['Wool Blazer',240,'Suits','New','https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'],
      ['Leather Belt',55,'Accessories','','https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80'],
      ['Derby Leather Shoes',195,'Shoes','Best','https://unsplash.com/photos/a-pair-of-black-shoes-2nST4hbvTkc'],
      ['Linen Summer Shirt',75,'Shirts','Sale','https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80'],
      ['Trench Coat',310,'Jackets','New','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
      ['Casual Polo Shirt',65,'Shirts','New','https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80'],
      ['Denim Jacket',185,'Jackets','','https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80'],
      ['Classic White Shirt',70,'Shirts','Best','https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80'],
      ['Slim Fit Suit',380,'Suits','New','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80'],
      ['Formal Oxford Shoes',210,'Shoes','Best','https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80'],
      ['Striped Dress Shirt',80,'Suits','','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'],
      ['Casual Sneakers',120,'Shoes','New','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    ];
    P.forEach(([name,price,cat,badge,img]) => {
      const esc = s => String(s).replace(/'/g,"''");
      db.run(`INSERT INTO products (name,price,category,badge,image) VALUES ('${esc(name)}',${price},'${cat}','${badge}','${esc(img)}')`);
    });
    this.save();
    console.log('[DB] Seed data inserted ✅');
  }
};

function query(sql, params = []) {
  const db = DatabaseConnection._db;
  let i = 0;
  const filled = sql.replace(/\?/g, () => {
    const val = params[i++];
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  });
  const result = db.exec(filled);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => Object.fromEntries(columns.map((col, j) => [col, row[j]])));
}

function run(sql, params = []) {
  const db = DatabaseConnection._db;
  let i = 0;
  const filled = sql.replace(/\?/g, () => {
    const val = params[i++];
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  });
  db.run(filled);
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
  DatabaseConnection.save();
  return { lastInsertRowid: id };
}

module.exports = { DatabaseConnection, query, run };
