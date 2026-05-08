// ============================================================
//  app.js — Trendora Frontend Application Logic
//
//  الـ Objects المستخدمة هنا تطابق Classes الـ UML Diagram:
//  - currentUser  → User object
//  - cartData     → ShoppingCart object
//  - detailItem   → Product object
// ============================================================


// ════════════════════════════════════════════════════════
//  STATE — الـ Objects الرئيسية في التطبيق
// ════════════════════════════════════════════════════════

// User Object (من الـ UML: userId, name, email)
let currentUser = JSON.parse(localStorage.getItem('tr_user') || 'null');

// هل المستخدم الحالي Admin؟
let isAdmin = JSON.parse(localStorage.getItem('tr_is_admin') || 'false');

// ShoppingCart Object (من الـ UML: cartId, userId, items)
let cartData = null;

// Product Object المحدد لصفحة التفاصيل
let detailItem = null;

// المقاس المختار في صفحة التفاصيل
let selectedSize = '';

// وضع صفحة المصادقة: 'login' أو 'register'
let authMode = 'login';


// ════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════
function goTo(page) {
  // إخفاء كل الصفحات
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // إظهار الصفحة المطلوبة
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // تحميل البيانات حسب الصفحة
  if (page === 'cart')   renderCart();
  if (page === 'orders') loadOrders();
  if (page === 'admin' && isAdmin) loadAdminDashboard();
}

function toggleMobileMenu() {
  document.getElementById('nav-center').classList.toggle('open');
}


// ════════════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ════════════════════════════════════════════════════════
let _toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}


// ════════════════════════════════════════════════════════
//  NAVBAR UI
// ════════════════════════════════════════════════════════
function refreshNavUI() {
  const loggedIn = !!currentUser;

  document.getElementById('nav-login-link').style.display   = loggedIn ? 'none' : '';
  document.getElementById('nav-logout-link').style.display  = loggedIn ? '' : 'none';
  document.getElementById('nav-orders-link').style.display  = loggedIn ? '' : 'none';
  document.getElementById('nav-admin-link').style.display   = (loggedIn && isAdmin) ? '' : 'none';

  const nameEl = document.getElementById('nav-username');
  if (loggedIn) {
    nameEl.style.display = '';
    nameEl.textContent   = currentUser.name;
  } else {
    nameEl.style.display = 'none';
  }
}


// ════════════════════════════════════════════════════════
//  PRODUCTS — Product objects
// ════════════════════════════════════════════════════════
async function loadProducts(category = 'All') {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<div class="grid-loader">Loading collection...</div>';

  try {
    // جلب Array of Product objects من الـ Backend
    const products = await ProductAPI.getAll(category);

    if (!products.length) {
      grid.innerHTML = '<div class="grid-loader">No products found.</div>';
      return;
    }

    // رسم كل Product object كـ card
    grid.innerHTML = products.map((product, i) => {
      const badgeClass = product.badge === 'Sale' ? 'sale'
                       : product.badge === 'Best' ? 'best' : '';
      return `
        <div class="prod-card" style="animation-delay:${i * .055}s"
             onclick="openProductDetail(${product.productId})">
          <div class="prod-img-wrap">
            <img class="prod-img" src="${product.image}" alt="${product.name}" loading="lazy"/>
            ${product.badge
              ? `<span class="prod-badge ${badgeClass}">${product.badge}</span>`
              : ''}
          </div>
          <div class="prod-info">
            <div class="prod-name">${product.name}</div>
            <div class="prod-cat">${product.category}</div>
            <div class="prod-footer">
              <span class="prod-price">$${product.price}</span>
              <button class="quick-btn"
                onclick="event.stopPropagation(); quickAdd(${product.productId})">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    grid.innerHTML = `<div class="grid-loader">Error: ${err.message}</div>`;
  }
}

function filterCat(cat, btn) {
  // تحديث الـ active button
  if (btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  loadProducts(cat);
}


// ════════════════════════════════════════════════════════
//  PRODUCT DETAIL — Product object
// ════════════════════════════════════════════════════════
async function openProductDetail(productId) {
  try {
    // جلب Product object محدد
    const product = await ProductAPI.getOne(productId);
    detailItem   = product;  // حفظ Product object في الـ state
    selectedSize = '';

    // تحديث الـ UI بـ attributes من Product object
    document.getElementById('det-img').src          = product.image;
    document.getElementById('det-cat').textContent  = product.category;
    document.getElementById('det-name').textContent = product.name;
    document.getElementById('det-price').textContent = `$${product.price}`;

    const badgeEl        = document.getElementById('det-badge');
    badgeEl.textContent  = product.badge || '';
    badgeEl.className    = 'det-badge' + (product.badge === 'Sale' ? ' sale-b' : '');

    // رسم أزرار المقاسات
    document.getElementById('size-grid').innerHTML =
      ['XS','S','M','L','XL','XXL'].map(size =>
        `<button class="sz" onclick="pickSize('${size}', this)">${size}</button>`
      ).join('');

    goTo('detail');
  } catch (err) {
    toast('Error loading product');
  }
}

function pickSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.sz').forEach(b => b.classList.remove('picked'));
  btn.classList.add('picked');
}

async function addDetailToCart() {
  if (!selectedSize)  { toast('Please choose a size first'); return; }
  if (!currentUser)   { toast('Please login first'); goTo('auth'); return; }

  try {
    // ShoppingCart.addProduct(productId) — إضافة Product object للسلة
    await CartAPI.add(detailItem.productId, selectedSize);
    toast(`${detailItem.name} added to bag!`);
    await refreshCartBadge();
    goTo('home');
  } catch (err) { toast(err.message); }
}

async function quickAdd(productId) {
  if (!currentUser) { toast('Please login first'); goTo('auth'); return; }
  try {
    await CartAPI.add(productId, 'M');
    toast('Added to bag!');
    await refreshCartBadge();
    popBadge();
  } catch (err) { toast(err.message); }
}


// ════════════════════════════════════════════════════════
//  CART — ShoppingCart object + CartItem objects
// ════════════════════════════════════════════════════════
async function refreshCartBadge() {
  if (!currentUser) {
    document.getElementById('cart-count').textContent = '0';
    return;
  }
  try {
    // جلب ShoppingCart object من الـ Backend
    cartData = await CartAPI.get();
    // حساب عدد CartItem objects
    const count = cartData.items.reduce((s, item) => s + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
  } catch {}
}

function popBadge() {
  const b = document.getElementById('cart-count');
  b.classList.add('pop');
  setTimeout(() => b.classList.remove('pop'), 300);
}

async function renderCart() {
  const el = document.getElementById('cart-body');

  if (!currentUser) {
    el.innerHTML = `<div class="empty-note">Please <a href="#" onclick="goTo('auth')" style="color:var(--gold)">login</a> to view your bag.</div>`;
    return;
  }

  try {
    // جلب ShoppingCart object مع CartItem objects
    cartData = await CartAPI.get();

    if (!cartData.items.length) {
      el.innerHTML = '<div class="empty-note">Your bag is empty.</div>';
      return;
    }

    // رسم كل CartItem object
    el.innerHTML = cartData.items.map(item => `
      <div class="cart-row">
        <img src="${item.product.image}" alt="${item.product.name}"/>
        <div>
          <div class="cr-name">${item.product.name}</div>
          <div class="cr-meta">Size: ${item.size}</div>
          <div class="cr-price">$${(item.product.price * item.quantity).toFixed(0)}</div>
          <div class="qty-row">
            <button class="qbtn" onclick="changeQty(${item.cartItemId}, ${item.quantity - 1})">−</button>
            <span class="qnum">${item.quantity}</span>
            <button class="qbtn" onclick="changeQty(${item.cartItemId}, ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="cr-del" onclick="removeItem(${item.cartItemId})">✕</button>
      </div>
    `).join('') + `
      <div class="total-row">
        <span class="total-lbl">Total</span>
        <span class="total-val">$${cartData.total}</span>
      </div>
      <div class="cart-btns">
        <button class="btn-primary" onclick="goCheckout()">Checkout →</button>
        <button class="btn-ghost"   onclick="clearCart()">Clear Bag</button>
      </div>
    `;
  } catch (err) {
    el.innerHTML = `<div class="empty-note">${err.message}</div>`;
  }
}

async function changeQty(cartItemId, newQty) {
  try {
    // ShoppingCart.updateProduct()
    cartData = await CartAPI.update(cartItemId, newQty);
    renderCart();
    refreshCartBadge();
  } catch (err) { toast(err.message); }
}

async function removeItem(cartItemId) {
  try {
    // ShoppingCart.removeProduct()
    cartData = await CartAPI.remove(cartItemId);
    renderCart();
    refreshCartBadge();
    toast('Item removed');
  } catch (err) { toast(err.message); }
}

async function clearCart() {
  try {
    // ShoppingCart.clearCart()
    await CartAPI.clear();
    cartData = null;
    renderCart();
    refreshCartBadge();
    toast('Bag cleared');
  } catch (err) { toast(err.message); }
}

function goCheckout() {
  if (!cartData || !cartData.items.length) { toast('Your bag is empty'); return; }
  if (!currentUser) { toast('Please login first'); goTo('auth'); return; }

  // تعبئة بيانات المستخدم تلقائياً من User object
  document.getElementById('co-name').value  = currentUser.name  || '';
  document.getElementById('co-email').value = currentUser.email || '';
  document.getElementById('co-err').textContent = '';

  // رسم ملخص الطلب
  const sumEl = document.getElementById('co-summary');
  sumEl.innerHTML = `
    <h3 style="font-family:var(--serif);font-weight:300;margin-bottom:1rem">Order Summary</h3>
    ${cartData.items.map(i => `
      <div class="sum-row">
        <span>${i.product.name} ×${i.quantity} (${i.size})</span>
        <span>$${i.product.price * i.quantity}</span>
      </div>
    `).join('')}
    <div class="sum-total">
      <span>Total</span>
      <span>$${cartData.total}</span>
    </div>
  `;
  goTo('checkout');
}


// ════════════════════════════════════════════════════════
//  ORDERS — Order + Payment objects
// ════════════════════════════════════════════════════════
async function submitOrder() {
  const address = document.getElementById('co-addr').value.trim();
  const payment = document.getElementById('co-pay').value;
  const errEl   = document.getElementById('co-err');

  if (!address) { errEl.textContent = 'Please enter your shipping address'; return; }
  errEl.textContent = '';

  try {
    // Order.Save() + Payment.processPayment()
    const result = await OrderAPI.place(payment, address);

    // عرض تفاصيل Order object في صفحة النجاح
    document.getElementById('success-detail').innerHTML = `
      Order <strong>${result.order.orderRef}</strong><br>
      Total: <strong>$${result.order.totalAmount}</strong><br>
      Payment: ${result.order.payment.paymentMethod}<br>
      <span style="color:var(--muted)">Thank you, ${currentUser.name}!</span>
    `;

    cartData = null;
    refreshCartBadge();
    goTo('success');
  } catch (err) { errEl.textContent = err.message; }
}

async function loadOrders() {
  const el = document.getElementById('orders-body');
  if (!currentUser) { el.innerHTML = '<div class="empty-note">Please login to view your orders.</div>'; return; }
  el.innerHTML = '<div class="empty-note">Loading...</div>';

  try {
    // جلب Array of Order objects
    const ordersList = await OrderAPI.getAll();

    if (!ordersList.length) { el.innerHTML = '<div class="empty-note">No orders yet.</div>'; return; }

    // رسم كل Order object
    el.innerHTML = ordersList.map(order => `
      <div class="order-card">
        <div class="oc-head">
          <span class="oc-ref">${order.orderRef}</span>
          <span class="oc-status">${order.status}</span>
        </div>
        <div class="oc-meta">
          📅 ${new Date(order.date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}<br>
          📦 ${order.items.length} item(s) — $${order.totalAmount}<br>
          💳 ${order.payment?.paymentMethod || '—'}<br>
          📍 ${order.address}
        </div>
      </div>
    `).join('');
  } catch (err) { el.innerHTML = `<div class="empty-note">${err.message}</div>`; }
}


// ════════════════════════════════════════════════════════
//  AUTH — User object
// ════════════════════════════════════════════════════════
function swapAuthMode(e) {
  e.preventDefault();
  authMode = authMode === 'login' ? 'register' : 'login';
  const isReg = authMode === 'register';

  document.getElementById('auth-h1').textContent        = isReg ? 'Create Account' : 'Welcome Back';
  document.getElementById('auth-sub').textContent       = isReg ? 'Join Trendora today.' : 'Login to your account.';
  document.getElementById('reg-name-row').style.display = isReg ? '' : 'none';
  document.getElementById('auth-submit-btn').textContent= isReg ? 'Register →' : 'Login →';
  document.getElementById('toggle-txt').textContent     = isReg ? 'Already have an account?' : 'No account?';
  document.getElementById('toggle-link').textContent    = isReg ? 'Login here' : 'Register here';
  document.getElementById('auth-err').textContent       = '';
}

async function submitAuth() {
  const email  = document.getElementById('a-email').value.trim();
  const pass   = document.getElementById('a-pass').value;
  const errEl  = document.getElementById('auth-err');

  if (!email || !pass) { errEl.textContent = 'Please fill all fields'; return; }
  errEl.textContent = '';

  try {
    if (authMode === 'register') {
      // User.Save() — إنشاء User object جديد
      const name = document.getElementById('a-name').value.trim();
      if (!name) { errEl.textContent = 'Please enter your name'; return; }
      const data = await AuthAPI.register(name, email, pass);
      saveSession(data.token, data.user, false);
      toast(`Welcome, ${data.user.name}! 🎉`);

    } else {
      // User.login() — محاولة دخول كـ User ثم كـ Admin
      try {
        const data = await AuthAPI.login(email, pass);
        saveSession(data.token, data.user, false);
        toast(`Welcome back, ${data.user.name}!`);
      } catch {
        // Admin.login()
        const data = await AuthAPI.adminLogin(email, pass);
        saveSession(data.token, { name: data.admin.name, email }, true);
        toast('Admin access granted!');
      }
    }

    refreshNavUI();
    await refreshCartBadge();
    goTo('home');

  } catch (err) { errEl.textContent = err.message; }
}

// حفظ User object في الـ localStorage
function saveSession(token, user, admin) {
  localStorage.setItem('tr_token',    token);
  localStorage.setItem('tr_user',     JSON.stringify(user));
  localStorage.setItem('tr_is_admin', JSON.stringify(admin));
  currentUser = user;
  isAdmin     = admin;
}

// User.logout()
function doLogout() {
  localStorage.removeItem('tr_token');
  localStorage.removeItem('tr_user');
  localStorage.removeItem('tr_is_admin');
  currentUser = null;
  isAdmin     = false;
  cartData    = null;
  refreshNavUI();
  refreshCartBadge();
  toast('Logged out successfully');
  goTo('home');
}


// ════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — Admin object
// ════════════════════════════════════════════════════════
async function loadAdminDashboard() {
  try {
    // جلب إحصائيات من Admin API
    const dash = await AdminAPI.dashboard();

    document.getElementById('admin-stats').innerHTML = `
      <div class="stat-box"><div class="stat-lbl">Users</div><div class="stat-val">${dash.totalUsers}</div></div>
      <div class="stat-box"><div class="stat-lbl">Products</div><div class="stat-val">${dash.totalProducts}</div></div>
      <div class="stat-box"><div class="stat-lbl">Orders</div><div class="stat-val">${dash.totalOrders}</div></div>
      <div class="stat-box"><div class="stat-lbl">Revenue</div><div class="stat-val">$${dash.totalRevenue}</div></div>
    `;

    // جلب Array of Order objects للأدمن
    const allOrders = await AdminAPI.getOrders();

    document.getElementById('admin-orders-tbl').innerHTML = `
      <table class="adm-table">
        <thead>
          <tr>
            <th>Ref</th><th>User</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th>
          </tr>
        </thead>
        <tbody>
          ${allOrders.map(o => `
            <tr>
              <td style="color:var(--gold);font-family:var(--serif)">${o.orderRef}</td>
              <td>${o.userName}</td>
              <td>${o.itemCount}</td>
              <td>$${o.totalAmount}</td>
              <td><span class="oc-status">${o.status}</span></td>
              <td>
                <select onchange="updateStatus(${o.orderId}, this.value)"
                  style="border:1px solid var(--border);background:var(--bg);padding:.3rem;font-size:.75rem;color:var(--ink)">
                  ${['Confirmed','Processing','Shipped','Delivered','Cancelled']
                    .map(s => `<option ${s===o.status?'selected':''}>${s}</option>`).join('')}
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    document.getElementById('admin-stats').innerHTML = `<p style="color:var(--red)">${err.message}</p>`;
  }
}

async function updateStatus(orderId, status) {
  try {
    // Order.setStatues(String status)
    await AdminAPI.updateOrder(orderId, status);
    toast('Status updated: ' + status);
  } catch (err) { toast(err.message); }
}


// ════════════════════════════════════════════════════════
//  INIT — تشغيل عند فتح الصفحة
// ════════════════════════════════════════════════════════
(function init() {
  refreshNavUI();      // تحديث الـ navbar بناءً على User object
  loadProducts();      // تحميل Product objects
  refreshCartBadge();  // تحديث عدد CartItem objects
})();
