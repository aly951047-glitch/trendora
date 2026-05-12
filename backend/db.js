// ============================================================
//  db.js — In-Memory Database
//  Every Class from the UML Diagram is represented here
//  as an Object or Array
// ============================================================


// ════════════════════════════════════════════════════════════
//  CLASS: DatabaseConnection (from UML)
//  Attributes : url, username, password
//  Methods    : connect(), disConnect()
// ════════════════════════════════════════════════════════════
const DatabaseConnection = {
  url:       'memory://trendora-db',
  username:  'trendora_admin',
  password:  'secret123',
  connected: false,

  connect() {
    this.connected = true;
    console.log('[DB] DatabaseConnection.connect() → Connected ✅');
  },

  disConnect() {
    this.connected = false;
    console.log('[DB] DatabaseConnection.disConnect() → Disconnected');
  }
};

// Call connect() on the DatabaseConnection object
DatabaseConnection.connect();


// ════════════════════════════════════════════════════════════
//  CLASS: User (from UML)
//  Attributes : userId, name, email, passwordHash
//  Methods    : Save(), Update(), Delete(), login(), logout()
// ════════════════════════════════════════════════════════════

// users = Array of User objects
let users = [
  {
    userId:       1,
    name:         'Ahmed Ali',
    email:        'ahmed@test.com',
    passwordHash: '$2a$10$nwrzsZ5RDYVaRMHmzeUyi.0F4Ppj3Z52JM9ZEmLvLzub9jI4vIhd6' // bcrypt hash for "123456"
  }
];


// ════════════════════════════════════════════════════════════
//  CLASS: Admin (from UML)
//  Attributes : adminId, name, PasswordHash
//  Methods    : Save(), Update(), Delete()
// ════════════════════════════════════════════════════════════

// admins = Array of Admin objects
let admins = [
  {
    adminId:      1,
    name:         'Super Admin',
    email:        'admin@trendora.com',
    passwordHash: '$2a$10$nwrzsZ5RDYVaRMHmzeUyi.0F4Ppj3Z52JM9ZEmLvLzub9jI4vIhd6' // bcrypt hash for "123456"
  }
];


// ════════════════════════════════════════════════════════════
//  CLASS: Category (from UML)
//  Attributes : categoryId, name
//  Methods    : addProduct(), removeProduct(), getProduct()
// ════════════════════════════════════════════════════════════

// categories = Array of Category objects
let categories = [
  { categoryId: 1, name: 'Shirts'      },
  { categoryId: 2, name: 'Pants'       },
  { categoryId: 3, name: 'Jackets'     },
  { categoryId: 4, name: 'Suits'       },
  { categoryId: 5, name: 'Accessories' },
  { categoryId: 6, name: 'Shoes'       }
];


// ════════════════════════════════════════════════════════════
//  CLASS: Product (from UML)
//  Attributes : productId, name, price, category
//  Methods    : Save(), Update(), Delete()
// ════════════════════════════════════════════════════════════

// products = Array of Product objects
let products = [
  { productId:1,  name:'Oxford Button Shirt',  price:89,  category:'Shirts',      badge:'New',  image:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
  { productId:2,  name:'Slim Fit Chinos',       price:120, category:'Pants',       badge:'Best', image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
  { productId:3,  name:'Wool Blazer',           price:240, category:'Jackets',     badge:'New',  image:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' },
  { productId:4,  name:'Classic Suit',          price:450, category:'Suits',       badge:'',     image:'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80' },
  { productId:5,  name:'Leather Belt',          price:55,  category:'Accessories', badge:'',     image:'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80' },
  { productId:6,  name:'Derby Leather Shoes',   price:195, category:'Shoes',       badge:'Best', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { productId:7,  name:'Linen Summer Shirt',    price:75,  category:'Shirts',      badge:'Sale', image:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80' },
  { productId:8,  name:'Trench Coat',           price:310, category:'Jackets',     badge:'New',  image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
  { productId:9,  name:'Casual Polo Shirt',   price:65,  category:'Shirts',      badge:'New',  image:'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80' },
  { productId:10, name:'Denim Jacket',         price:185, category:'Jackets',     badge:'',     image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
  { productId:11, name:'Classic White Shirt',  price:70,  category:'Shirts',      badge:'Best', image:'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80' },
  { productId:12, name:'Slim Fit Suit',        price:380, category:'Suits',       badge:'New',  image:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80' },
  { productId:13, name:'Leather Wallet',       price:35,  category:'Accessories', badge:'',     image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
  { productId:14, name:'Formal Oxford Shoes',  price:210, category:'Shoes',       badge:'Best', image:'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80' },
  { productId:15, name:'Striped Dress Shirt',  price:80,  category:'Shirts',      badge:'',     image:'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80' },
  { productId:16, name:'Casual Sneakers',      price:120, category:'Shoes',       badge:'New',  image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },

];


// ════════════════════════════════════════════════════════════
//  CLASS: ShoppingCart (from UML)
//  Attributes : cartId, userId
//  Methods    : addProduct(), removeProduct(), updateProduct(), clearCart()
// ════════════════════════════════════════════════════════════

let carts = []; // Array of ShoppingCart objects


// ════════════════════════════════════════════════════════════
//  CLASS: CartItem (from UML)
//  Attributes : cartItemId, cartId, productId
//  Extra      : size, quantity
// ════════════════════════════════════════════════════════════

let cartItems = []; // Array of CartItem objects


// ════════════════════════════════════════════════════════════
//  CLASS: Order (from UML)
//  Attributes : orderId, date, status, totalAmount, userId, payment
//  Methods    : Save(), Update(), Delete(), calculateTotal(), setStatues()
// ════════════════════════════════════════════════════════════

let orders = []; // Array of Order objects


// ════════════════════════════════════════════════════════════
//  CLASS: OrderItem (from UML)
//  Attributes : orderItemId, orderId, productId, priceOrder
// ════════════════════════════════════════════════════════════

let orderItems = []; // Array of OrderItem objects


// ════════════════════════════════════════════════════════════
//  CLASS: Payment (from UML)
//  Attributes : paymentId, paymentMethod, amount, date, status
//  Methods    : save(), processPayment()
// ════════════════════════════════════════════════════════════

let payments = []; // Array of Payment objects


// ── ID Auto-increment (simulates Database AUTO_INCREMENT) ──
const IDs = { user:2, cart:1, cartItem:1, order:1, orderItem:1, payment:1 };
const nextId = (key) => IDs[key]++;


module.exports = {
  DatabaseConnection,
  users, admins, categories, products,
  carts, cartItems, orders, orderItems, payments,
  nextId
};
