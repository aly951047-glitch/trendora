// ============================================================
//  db.js — In-Memory Database
//  كل Class من الـ UML Diagram موجود هنا كـ Object أو Array
// ============================================================


// ════════════════════════════════════════════════════════════
//  CLASS: DatabaseConnection (من الـ UML)
//  الخصائص: url, username, password
//  الميثودز: connect(), disConnect()
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
// Object مباشر → نستدعي connect()
DatabaseConnection.connect();


// ════════════════════════════════════════════════════════════
//  CLASS: User (من الـ UML)
//  الخصائص: userId, name, email, passwordHash
//  الميثودز: Save(), Update(), Delete(), login(), logout()
// ════════════════════════════════════════════════════════════
// users = Array of User objects
let users = [
  {
    userId:       1,
    name:         'Ahmed Ali',
    email:        'ahmed@test.com',
    // passwordHash لـ "123456" مشفر بـ bcrypt
    passwordHash: '$2a$10$nwrzsZ5RDYVaRMHmzeUyi.0F4Ppj3Z52JM9ZEmLvLzub9jI4vIhd6'
  }
];


// ════════════════════════════════════════════════════════════
//  CLASS: Admin (من الـ UML)
//  الخصائص: adminId, name, PasswordHash
//  الميثودز: Save(), Update(), Delete()
// ════════════════════════════════════════════════════════════
let admins = [
  {
    adminId:      1,
    name:         'Super Admin',
    email:        'admin@trendora.com',
    passwordHash: '$2a$10$nwrzsZ5RDYVaRMHmzeUyi.0F4Ppj3Z52JM9ZEmLvLzub9jI4vIhd6'
  }
];


// ════════════════════════════════════════════════════════════
//  CLASS: Category (من الـ UML)
//  الخصائص: categoryId, name
//  الميثودز: addProduct(), removeProduct(), getProduct()
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
//  CLASS: Product (من الـ UML)
//  الخصائص: productId, name, price, category
//  الميثودز: Save(), Update(), Delete()
// ════════════════════════════════════════════════════════════
// products = Array of Product objects
let products = [
  { productId:1,  name:'Oxford Button Shirt',    price:89,  category:'Shirts',      badge:'New',  image:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
  { productId:2,  name:'Slim Fit Chinos',         price:120, category:'Pants',       badge:'Best', image:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
  { productId:3,  name:'Wool Blazer',             price:240, category:'Jackets',     badge:'New',  image:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' },
  { productId:4,  name:'Classic Suit',            price:450, category:'Suits',       badge:'',     image:'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80' },
  { productId:5,  name:'Leather Belt',            price:55,  category:'Accessories', badge:'',     image:'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80' },
  { productId:6,  name:'Derby Leather Shoes',     price:195, category:'Shoes',       badge:'Best', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { productId:7,  name:'Linen Summer Shirt',      price:75,  category:'Shirts',      badge:'Sale', image:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80' },
  { productId:8,  name:'Trench Coat',             price:310, category:'Jackets',     badge:'New',  image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
  { productId:9,  name:'Formal Dress Pants',      price:130, category:'Pants',       badge:'',     image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80' },
  { productId:10, name:'Silk Tie',                price:45,  category:'Accessories', badge:'',     image:'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80' }
];


// ════════════════════════════════════════════════════════════
//  CLASS: ShoppingCart (من الـ UML)
//  الخصائص: cartId, userId
//  الميثودز: addProduct(), removeProduct(), updateProduct(), clearCart()
// ════════════════════════════════════════════════════════════
let carts = [];  // Array of ShoppingCart objects


// ════════════════════════════════════════════════════════════
//  CLASS: CartItem (من الـ UML)
//  الخصائص: cartItemId, cartId, productId
//  + إضافات: size, quantity
// ════════════════════════════════════════════════════════════
let cartItems = [];  // Array of CartItem objects


// ════════════════════════════════════════════════════════════
//  CLASS: Order (من الـ UML)
//  الخصائص: orderId, date, status, totalAmount, userId, payment
//  الميثودز: Save(), Update(), Delete(), calculateTotal(), setStatues()
// ════════════════════════════════════════════════════════════
let orders = [];  // Array of Order objects


// ════════════════════════════════════════════════════════════
//  CLASS: OrderItem (من الـ UML)
//  الخصائص: orderItemId, orderId, productId, priceOrder
// ════════════════════════════════════════════════════════════
let orderItems = [];  // Array of OrderItem objects


// ════════════════════════════════════════════════════════════
//  CLASS: Payment (من الـ UML)
//  الخصائص: paymentId, paymentMethod, amount, date, status
//  الميثودز: save(), processPayment()
// ════════════════════════════════════════════════════════════
let payments = [];  // Array of Payment objects


// ── ID Auto-increment (يحاكي الـ Database AUTO_INCREMENT) ─
const IDs = { user:2, cart:1, cartItem:1, order:1, orderItem:1, payment:1 };
const nextId = (key) => IDs[key]++;


module.exports = {
  DatabaseConnection,
  users, admins, categories, products,
  carts, cartItems, orders, orderItems, payments,
  nextId
};
