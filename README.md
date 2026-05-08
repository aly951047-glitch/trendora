# 🛍️ TRENDORA — Men's Fashion Store

## 📁 Project Structure
```
trendora/
├── backend/
│   ├── server.js              ← Entry point (Express)
│   ├── db.js                  ← ALL UML Classes as Objects
│   ├── middleware/auth.js     ← JWT Protection
│   └── routes/
│       ├── auth.js            ← User.login(), User.Save()
│       ├── products.js        ← Product + Category CRUD
│       ├── cart.js            ← ShoppingCart + CartItem
│       ├── orders.js          ← Order + OrderItem + Payment
│       └── admin.js           ← Admin Dashboard
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js             ← All HTTP calls (/api — works on Render)
│       └── app.js             ← UI Logic + Objects
└── package.json
```



## 🔑 Login Credentials
| Type  | Email | Password |
|-------|-------|----------|
| User  | ahmed@test.com | 123456 |
| Admin | admin@trendora.com | 123456 |

## 📊 UML Classes → Code Mapping
| UML Class | File | Methods |
|-----------|------|---------|
| DatabaseConnection | db.js | connect(), disConnect() |
| User | routes/auth.js | Save(), login(), logout() |
| Admin | routes/admin.js | dashboard, updateOrder |
| Product | routes/products.js | Save(), Update(), Delete() |
| Category | routes/products.js | getProduct(), addProduct(), removeProduct() |
| ShoppingCart | routes/cart.js | addProduct(), removeProduct(), updateProduct(), clearCart() |
| CartItem | routes/cart.js | Save(), Delete() |
| Order | routes/orders.js | Save(), calculateTotal(), setStatues() |
| OrderItem | routes/orders.js | Save() |
| Payment | routes/orders.js | save(), processPayment() |
