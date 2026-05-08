// ============================================================
//  api.js — Frontend API Service
//
//  ⚠️ مهم جداً: نستخدم '/api' وليس 'http://localhost:3000/api'
//  بهذه الطريقة يشتغل محلياً وعلى Render بنفس الكود
// ============================================================

const BASE = '/api';  // ← هذا هو الفرق عن النسخة المحلية

// ── Auth Helpers ───────────────────────────────────────
function getToken()   { return localStorage.getItem('tr_token'); }
function authHeader() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

// ── Generic Fetch Wrapper ──────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const response = await fetch(BASE + endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers
    },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ════════════════════════════════════════════════════════
//  AUTH API — يتعامل مع User class و Admin class
// ════════════════════════════════════════════════════════
const AuthAPI = {
  // User.Save() — تسجيل مستخدم جديد
  register: (name, email, password) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  // User.login() — تسجيل الدخول
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  // Admin login
  adminLogin: (email, password) =>
    apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};

// ════════════════════════════════════════════════════════
//  PRODUCT API — يتعامل مع Product class و Category class
// ════════════════════════════════════════════════════════
const ProductAPI = {
  // Category.getProduct() — جلب المنتجات مع فلترة اختيارية
  getAll: (category) => {
    const q = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return apiFetch('/products' + q);
  },

  // جلب Product object واحد
  getOne: (id) => apiFetch(`/products/${id}`),

  // Product.Save() — إضافة منتج (Admin)
  create: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),

  // Product.Update() — تعديل منتج (Admin)
  update: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Product.Delete() + Category.removeProduct() — حذف منتج (Admin)
  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' })
};

// ════════════════════════════════════════════════════════
//  CART API — يتعامل مع ShoppingCart class و CartItem class
// ════════════════════════════════════════════════════════
const CartAPI = {
  // جلب ShoppingCart الخاص بالمستخدم
  get: () => apiFetch('/cart'),

  // ShoppingCart.addProduct(int productId)
  add: (productId, size, quantity = 1) =>
    apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, size, quantity })
    }),

  // ShoppingCart.updateProduct(int product)
  update: (cartItemId, quantity) =>
    apiFetch(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),

  // ShoppingCart.removeProduct(int productId)
  remove: (cartItemId) => apiFetch(`/cart/${cartItemId}`, { method: 'DELETE' }),

  // ShoppingCart.clearCart()
  clear: () => apiFetch('/cart', { method: 'DELETE' })
};

// ════════════════════════════════════════════════════════
//  ORDER API — يتعامل مع Order + OrderItem + Payment
// ════════════════════════════════════════════════════════
const OrderAPI = {
  // Order.Save() + Payment.processPayment()
  place: (paymentMethod, address) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, address })
    }),

  // جلب كل طلبات المستخدم
  getAll: () => apiFetch('/orders'),

  // جلب Order object واحد
  getOne: (id) => apiFetch(`/orders/${id}`)
};

// ════════════════════════════════════════════════════════
//  ADMIN API — Admin class
// ════════════════════════════════════════════════════════
const AdminAPI = {
  dashboard:   ()           => apiFetch('/admin/dashboard'),
  getUsers:    ()           => apiFetch('/admin/users'),
  getOrders:   ()           => apiFetch('/admin/orders'),
  updateOrder: (id, status) => apiFetch(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
};
