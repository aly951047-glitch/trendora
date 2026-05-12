const BASE = '/api';

function getToken()   { return localStorage.getItem('tr_token'); }
function authHeader() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

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

const AuthAPI = {
  register: (name, email, password) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  adminLogin: (email, password) =>
    apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};

const ProductAPI = {
  getAll: (category) => {
    const q = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return apiFetch('/products' + q);
  },

  getOne: (id) => apiFetch(`/products/${id}`),

  create: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' })
};

const CartAPI = {
  get: () => apiFetch('/cart'),

  add: (productId, size, quantity = 1) =>
    apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, size, quantity })
    }),

  update: (cartItemId, quantity) =>
    apiFetch(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),

  remove: (cartItemId) => apiFetch(`/cart/${cartItemId}`, { method: 'DELETE' }),

  clear: () => apiFetch('/cart', { method: 'DELETE' })
};

const OrderAPI = {
  place: (paymentMethod, address) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, address })
    }),

  getAll: () => apiFetch('/orders'),

  getOne: (id) => apiFetch(`/orders/${id}`)
};

const AdminAPI = {
  dashboard:   ()           => apiFetch('/admin/dashboard'),
  getUsers:    ()           => apiFetch('/admin/users'),
  getOrders:   ()           => apiFetch('/admin/orders'),
  updateOrder: (id, status) => apiFetch(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
};
