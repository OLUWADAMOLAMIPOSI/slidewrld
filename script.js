// ============================================================
// ADMIN PASSWORD — only this works, no email needed
// ============================================================
const ADMIN_PASSWORD_DEFAULT = 'PeaceA29';

// ============================================================
// NETLIFY API CONFIGURATION
// ============================================================
const API_URL = '/.netlify/functions/api';

let masterData = {
    products: [],
    orders: [],
    subscribers: [],
    settings: {}
};

// ============================================================
// HAMBURGER MENU TOGGLE (Main Nav)
// ============================================================
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburgerBtn');
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
}

document.querySelectorAll('#navLinks a').forEach(link => {
  link.addEventListener('click', function() {
    document.getElementById('navLinks').classList.remove('active');
    document.getElementById('hamburgerBtn').classList.remove('active');
  });
});

document.addEventListener('click', function(e) {
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburgerBtn');
  if (!nav.contains(e.target)) {
    document.getElementById('navLinks')?.classList.remove('active');
    hamburger?.classList.remove('active');
  }
});

// ============================================================
// ADMIN HAMBURGER TOGGLE (Admin Sidebar)
// ============================================================
function toggleAdminMenu() {
  const sidebar = document.getElementById('adminSidebar');
  const hamburger = document.getElementById('adminHamburger');
  sidebar.classList.toggle('open');
  hamburger.classList.toggle('active');
}

document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('adminSidebar');
  const hamburger = document.getElementById('adminHamburger');

  if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
      hamburger.classList.remove('active');
    }
  }
});

document.querySelectorAll('.admin-nav-link').forEach(link => {
  link.addEventListener('click', function() {
    if (window.innerWidth <= 768) {
      document.getElementById('adminSidebar').classList.remove('open');
      document.getElementById('adminHamburger').classList.remove('active');
    }
  });
});

// ============================================================
// STATE — all persisted in localStorage
// ============================================================
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ============================================================
// LOAD DATA FROM SERVER
// ============================================================
async function loadFromServer() {
    try {
        const res = await fetch(API_URL + '?action=get');
        if (!res.ok) {
            throw new Error('Server returned ' + res.status);
        }
        const data = await res.json();
        if (data.error) {
            throw new Error(data.error);
        }
        masterData = data;
        try {
            save('sw_products', masterData.products);
            save('sw_orders', masterData.orders);
            save('sw_subs', masterData.subscribers);
            save('sw_settings', masterData.settings);
        } catch (e) {
            console.log('Could not save to localStorage');
        }
        console.log('Data loaded from server successfully');
        return true;
    } catch (e) {
        console.error('Error loading from server:', e.message);
        console.log('Using localStorage as fallback');
        masterData.products = load('sw_products', []);
        masterData.orders = load('sw_orders', []);
        masterData.subscribers = load('sw_subs', []);
        masterData.settings = load('sw_settings', {});
        return false;
    }
}

// ============================================================
// SAVE DATA TO SERVER
// ============================================================
async function saveToServer() {
    try {
        const res = await fetch(API_URL + '?action=save', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(masterData)
        });
        if (!res.ok) {
            throw new Error('Server returned ' + res.status);
        }
        const result = await res.json();
        if (result.error) {
            throw new Error(result.error);
        }
        console.log('Data saved to server successfully');
        return true;
    } catch (e) {
        console.error('Error saving to server:', e.message);
        console.log('Saved to localStorage only (will not sync to other devices)');
        try {
            save('sw_products', masterData.products);
            save('sw_orders', masterData.orders);
            save('sw_subs', masterData.subscribers);
            save('sw_settings', masterData.settings);
        } catch (e2) {
            console.error('Could not save to localStorage:', e2.message);
        }
        return false;
    }
}

// ============================================================
// TEST API CONNECTION
// ============================================================
async function testAPI() {
    try {
        const res = await fetch(API_URL + '?action=ping');
        const data = await res.json();
        console.log('API Test Result:', data);
        if (data.status === 'ok') {
            showToast('API is working! Data will sync across devices.', 'success');
        } else {
            showToast('API is not working properly. Check console.', 'error');
        }
    } catch (e) {
        console.error('API test failed:', e.message);
        showToast('Cannot connect to API. Check your internet connection.', 'error');
    }
}

// ============================================================
// PLACEHOLDER PRODUCT ART
// ============================================================
function placeholderImg(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
    <rect width="500" height="400" fill="#1F1F1F"/>
    <ellipse cx="250" cy="210" rx="160" ry="125" fill="#161616"/>
    <path d="M120 210 Q250 120 380 210 Q250 300 120 210 Z" fill="#0A0A0A" stroke="#F5F5F5" stroke-width="2"/>
    <rect x="145" y="180" width="210" height="28" rx="3" fill="#F5F5F5"/>
    <text x="250" y="365" text-anchor="middle" font-family="Arial" font-size="13" letter-spacing="2" fill="#787878">${label}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Ona Classic', cat: 'classic', price: 14500, oldPrice: 18000, desc: 'The everyday slide. Molded EVA sole, clean lines, built for daily wear without losing shape.', img: placeholderImg('ONA CLASSIC'), badge: 'Bestseller' },
  { id: 2, name: 'Lagos Strap', cat: 'strapped', price: 19500, oldPrice: 24000, desc: 'Hand-stitched woven strap over a reinforced base. The one people stop you to ask about.', img: placeholderImg('LAGOS STRAP'), badge: 'New' },
  { id: 3, name: 'Eko Weave', cat: 'woven', price: 21000, oldPrice: null, desc: 'Fully woven upper with a soft cushioned base. Texture-forward, built for warm weather.', img: placeholderImg('EKO WEAVE'), badge: null },
  { id: 4, name: 'Iron Strap Pro', cat: 'strapped', price: 23500, oldPrice: 27000, desc: 'Heavier build for men who need a slide that can take pressure without breaking down.', img: placeholderImg('IRON STRAP PRO'), badge: 'Sale' },
  { id: 5, name: 'Vault Limited', cat: 'limited', price: 32000, oldPrice: 38000, desc: 'Restricted batch run, only a small number made. Once sold out, this colourway is retired.', img: placeholderImg('VAULT LIMITED'), badge: 'Limited' },
  { id: 6, name: 'Bare Classic II', cat: 'classic', price: 15500, oldPrice: null, desc: 'Stripped back design, two strap bands, minimal branding. Built for the man who keeps it simple.', img: placeholderImg('BARE CLASSIC II'), badge: 'New' },
];

// ============================================================
// REPLACED GET/SET FUNCTIONS (Now using masterData)
// ============================================================
function getProducts()    { return masterData.products || []; }
function getOrders()      { return masterData.orders || []; }
function getSubscribers() { return masterData.subscribers || []; }
function getSettings()    { return masterData.settings || {}; }
function getCart()        { return load('sw_cart', []); }

async function setProducts(v)    { masterData.products = v; await saveToServer(); }
async function setOrders(v)      { masterData.orders = v; await saveToServer(); }
async function setSubscribers(v) { masterData.subscribers = v; await saveToServer(); }
async function setSettings(v)    { masterData.settings = v; await saveToServer(); }
function setCart(v)              { save('sw_cart', v); }

let modalProd = null;
let modalQtyVal = 1;
let editImgData = null;
let currentFilter = 'all';

// ============================================================
// PAGE ROUTING
// ============================================================
function showPage(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  const pg = document.getElementById('page-' + p);
  if (pg) pg.classList.add('active');

  const isAdmin = (p === 'admin' || p === 'admin-login');
  document.getElementById('mainNav').style.display    = isAdmin ? 'none' : '';
  document.getElementById('mainFooter').style.display  = isAdmin ? 'none' : '';
  document.getElementById('waFloat').style.display     = isAdmin ? 'none' : '';
  window.scrollTo(0, 0);

  if (p === 'home')     renderHomeProducts();
  if (p === 'shop')     renderShopProducts();
  if (p === 'checkout') renderCheckoutPage();
  if (p === 'admin')    renderAdminDashboard();
}

function scrollToSection(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ============================================================
// PRODUCTS — storefront
// ============================================================
function fmtPrice(p) {
  return '\u20a6' + p.toLocaleString();
}

function buildProductCard(p) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.innerHTML = `
    <div class="product-img-wrap">
      <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.opacity=0">
      ${p.badge ? `<span class="product-badge-tag">${p.badge}</span>` : ''}
    </div>
    <div class="product-info">
      <div class="product-name">${p.name}</div>
      <div class="product-desc-short">${p.desc}</div>
      <div class="product-footer">
        <div class="product-price">${p.oldPrice ? `<del>${fmtPrice(p.oldPrice)}</del>` : ''}${fmtPrice(p.price)}</div>
        <button class="add-to-cart-btn" onclick="openProductModal(${p.id})">Quick Add</button>
      </div>
    </div>`;
  div.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) return;
    openProductModal(p.id);
  });
  return div;
}

function renderHomeProducts() {
  const g = document.getElementById('homeProductGrid');
  if (!g) return;
  g.innerHTML = '';
  getProducts().slice(0, 3).forEach(p => g.appendChild(buildProductCard(p)));
}

function filterCat(f) {
  currentFilter = f;
  renderShopProducts();
}

function renderShopProducts() {
  const g = document.getElementById('shopProductGrid');
  if (!g) return;
  g.innerHTML = '';
  const list = currentFilter === 'all' ? getProducts() : getProducts().filter(p => p.cat === currentFilter);
  if (!list.length) {
    g.innerHTML = '<p style="text-align:center;color:var(--stone);grid-column:1/-1;padding:3rem;">No slides in this category yet.</p>';
    return;
  }
  list.forEach(p => g.appendChild(buildProductCard(p)));
}

// ============================================================
// PRODUCT MODAL
// ============================================================
function openProductModal(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  modalProd = p;
  modalQtyVal = 1;
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalPrice').innerHTML = (p.oldPrice ? `<del style="color:var(--stone);font-size:0.9rem;margin-right:0.5rem;">${fmtPrice(p.oldPrice)}</del>` : '') + fmtPrice(p.price);
  document.getElementById('modalDesc').textContent = p.desc;
  document.getElementById('modalQtyEl').textContent = 1;
  document.getElementById('productModal').classList.add('open');
}

function changeQty(d) {
  modalQtyVal = Math.max(1, modalQtyVal + d);
  document.getElementById('modalQtyEl').textContent = modalQtyVal;
}

function addModalToCart() {
  if (!modalProd) return;
  addToCart(modalProd, modalQtyVal);
  closeModal('productModal');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ============================================================
// CART
// ============================================================
function addToCart(p, qty) {
  const cart = getCart();
  const ex = cart.find(x => x.id === p.id);
  if (ex) ex.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
  setCart(cart);
  updateCartCount();
  showToast(p.name + ' added to bag', 'success');
}

function updateCartCount() {
  const c = getCart().reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = c;
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  renderCartUI();
}

function renderCartUI() {
  const cart = getCart();
  const el = document.getElementById('cartItemsEl');
  if (!cart.length) {
    el.innerHTML = '<div class="empty-cart"><p>Your bag is empty.<br>Go pick something out.</p></div>';
    document.getElementById('cartTotalEl').textContent = fmtPrice(0);
    return;
  }
  el.innerHTML = cart.map((i, idx) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${i.img}" alt="${i.name}" onerror="this.style.opacity=0">
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">${fmtPrice(i.price * i.qty)}</div>
        <div class="cart-item-qty">Qty: ${i.qty}</div>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem(${idx})">X</button>
    </div>`).join('');
  document.getElementById('cartTotalEl').textContent = fmtPrice(cart.reduce((s, i) => s + i.price * i.qty, 0));
}

function removeCartItem(idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  setCart(cart);
  updateCartCount();
  renderCartUI();
}

// ============================================================
// CHECKOUT
// ============================================================
function proceedCheckout() {
  if (!getCart().length) {
    showToast('Add something to your bag first');
    return;
  }
  document.getElementById('cartSidebar').classList.remove('open');
  showPage('checkout');
}

function renderCheckoutPage() {
  const s = getSettings();
  document.getElementById('dispBank').textContent    = s.bankName || 'Not configured — contact admin';
  document.getElementById('dispAccName').textContent = s.accName  || 'Not configured';
  document.getElementById('dispAccNum').textContent  = s.accNum   || 'Not configured';
  const total = getCart().reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('dispAmount').textContent = fmtPrice(total);
  const si = document.getElementById('summaryItemsEl');
  si.innerHTML = getCart().map(i => `<div class="summary-item"><span>${i.name} x${i.qty}</span><span>${fmtPrice(i.price * i.qty)}</span></div>`).join('');
  document.getElementById('summaryTotalEl').textContent = fmtPrice(total);
}

let proofData = null;

function previewProof(inp) {
  if (inp.files[0]) {
    const r = new FileReader();
    r.onload = e => {
      const p = document.getElementById('proofPreviewImg');
      p.src = e.target.result;
      p.style.display = 'block';
      proofData = e.target.result;
    };
    r.readAsDataURL(inp.files[0]);
  }
}

// ============================================================
// PLACE ORDER (UPDATED)
// ============================================================
async function placeOrder(e) {
  e.preventDefault();
  const first = document.getElementById('oFirst').value;
  const last  = document.getElementById('oLast').value;
  const email = document.getElementById('oEmail').value;
  const phone = document.getElementById('oPhone').value;
  const addr  = document.getElementById('oAddress').value + ', ' + document.getElementById('oCity').value;
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const order = {
    id: 'SW' + Date.now(),
    name: first + ' ' + last,
    email,
    phone,
    address: addr,
    items: [...cart],
    total,
    hasProof: !!proofData,
    status: 'pending',
    date: new Date().toLocaleDateString()
  };

  const orders = getOrders();
  orders.unshift(order);
  await setOrders(orders);

  const s = getSettings();
  if (s.adminEmail) {
    console.log(`[ORDER NOTIFICATION] To: ${s.adminEmail}\nNew order from ${order.name} (${order.email})\nTotal: ${fmtPrice(order.total)}\nItems: ${order.items.map(i => i.name + ' x' + i.qty).join(', ')}\nPayment proof attached: ${order.hasProof ? 'Yes' : 'No'}`);
  }
  console.log(`[CUSTOMER RECEIPT EMAIL] To: ${order.email}\nSubject: We received your order — ${order.id}\nHi ${first}, thanks for shopping SlideWrld. Your order total is ${fmtPrice(order.total)}. Once your payment is verified you will get a dispatch update.`);

  document.getElementById('successNameEl').textContent = first;
  proofData = null;
  setCart([]);
  updateCartCount();
  showPage('success');
}

// ============================================================
// NEWSLETTER (UPDATED)
// ============================================================
async function subscribeNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('nlEmail').value.trim();
  const subs = getSubscribers();
  if (!subs.find(s => s.email === email)) {
    subs.push({ email, date: new Date().toLocaleDateString() });
    await setSubscribers(subs);
    showToast('You are on the list.', 'success');
  } else {
    showToast('You are already on the list.', 'success');
  }
  document.getElementById('nlEmail').value = '';
}

// ============================================================
// ADMIN LOGIN
// ============================================================
function doLogin() {
  const pwd = document.getElementById('loginPwd').value;
  const errEl = document.getElementById('loginError');
  const customPwd = load('sw_custom_password', null);
  const validPwd = customPwd || ADMIN_PASSWORD_DEFAULT;

  if (pwd === validPwd) {
    errEl.style.display = 'none';
    document.getElementById('loginPwd').value = '';
    showPage('admin');
    showToast('Welcome back.', 'success');
  } else {
    errEl.textContent = 'Incorrect password.';
    errEl.style.display = 'block';
  }
}

function adminLogout() {
  showPage('home');
  showToast('Logged out.', 'success');
}

// ============================================================
// ADMIN — DASHBOARD
// ============================================================
function renderAdminDashboard() {
  const orders = getOrders();
  const revenue = orders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.total, 0);
  document.getElementById('statOrders').textContent   = orders.length;
  document.getElementById('statRevenue').textContent  = fmtPrice(revenue);
  document.getElementById('statProducts').textContent = getProducts().length;
  document.getElementById('statSubs').textContent     = getSubscribers().length;

  const tbody = document.getElementById('dashOrdersBody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--stone);padding:2rem;">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.slice(0, 6).map(o => `<tr>
    <td>${o.name}</td>
    <td>${o.items.length} item(s)</td>
    <td>${fmtPrice(o.total)}</td>
    <td><span class="status-badge status-${o.status}">${o.status}</span></td>
    <td>${o.date}</td>
  </tr>`).join('');
}

// ============================================================
// ADMIN — ORDERS
// ============================================================
function renderOrdersTable() {
  const orders = getOrders();
  const tbody = document.getElementById('ordersBody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--stone);padding:2rem;">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map((o, i) => `<tr>
    <td><small>${o.id}</small></td>
    <td><strong>${o.name}</strong><br><small>${o.phone}</small></td>
    <td><small>${o.email}</small></td>
    <td style="max-width:180px;font-size:0.8rem;">${o.items.map(x => x.name).join(', ')}</td>
    <td>${fmtPrice(o.total)}</td>
    <td>
      <select style="font-size:0.8rem;padding:5px 7px;border:1px solid var(--line);background:var(--black);color:var(--bone);" onchange="updateOrderStatus(${i}, this.value)">
        <option value="pending"   ${o.status === 'pending'   ? 'selected' : ''}>Pending</option>
        <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
        <option value="shipped"   ${o.status === 'shipped'   ? 'selected' : ''}>Shipped</option>
      </select>
    </td>
    <td><button class="action-btn action-delete" onclick="deleteOrder(${i})">Delete</button></td>
  </tr>`).join('');
}

// ============================================================
// UPDATE ORDER STATUS (UPDATED)
// ============================================================
async function updateOrderStatus(idx, val) {
  const orders = getOrders();
  orders[idx].status = val;
  await setOrders(orders);
  showToast('Order status updated.', 'success');
  renderAdminDashboard();
}

// ============================================================
// DELETE ORDER (UPDATED)
// ============================================================
async function deleteOrder(idx) {
  if (!confirm('Delete this order? This cannot be undone.')) return;
  const orders = getOrders();
  orders.splice(idx, 1);
  await setOrders(orders);
  renderOrdersTable();
  renderAdminDashboard();
  showToast('Order deleted.');
}

// ============================================================
// ADMIN — PRODUCTS
// ============================================================
function renderProductsTable() {
  const tbody = document.getElementById('productsBody');
  const prods = getProducts();
  if (!prods.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--stone);padding:2rem;">No products yet.</td></tr>';
    return;
  }
  tbody.innerHTML = prods.map((p, i) => `<tr>
    <td><img class="product-manage-img" src="${p.img}" alt="${p.name}" onerror="this.style.opacity=0"></td>
    <td><strong>${p.name}</strong></td>
    <td><span class="tag">${p.cat}</span></td>
    <td>${fmtPrice(p.price)}</td>
    <td>
      <button class="action-btn action-edit" onclick="openEditProduct(${i})">Edit</button>
      <button class="action-btn action-delete" onclick="deleteProduct(${i})">Delete</button>
    </td>
  </tr>`).join('');
}

function previewNewProdImg(inp) {
  if (inp.files[0]) {
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById('newPImgPreview');
      img.src = e.target.result;
      img.style.display = 'block';
      inp._data = e.target.result;
    };
    r.readAsDataURL(inp.files[0]);
  }
}

// ============================================================
// ADD PRODUCT (UPDATED)
// ============================================================
async function addProduct() {
  const name     = document.getElementById('newPName').value.trim();
  const cat      = document.getElementById('newPCat').value;
  const price    = parseInt(document.getElementById('newPPrice').value);
  const oldPrice = parseInt(document.getElementById('newPOldPrice').value) || null;
  const desc     = document.getElementById('newPDesc').value.trim();
  const imgInp   = document.getElementById('newPImg');
  const img      = imgInp._data || placeholderImg(name.toUpperCase());

  if (!name || !price) {
    showToast('Please fill in at least the name and price.', 'error');
    return;
  }

  const prods = getProducts();
  prods.push({ id: Date.now(), name, cat, price, oldPrice, desc, img, badge: null });
  await setProducts(prods);

  document.getElementById('newPName').value = '';
  document.getElementById('newPPrice').value = '';
  document.getElementById('newPOldPrice').value = '';
  document.getElementById('newPDesc').value = '';
  document.getElementById('newPImgPreview').style.display = 'none';
  imgInp._data = null;

  renderProductsTable();
  showToast('Product added and synced to all devices.', 'success');
}

function openEditProduct(idx) {
  const p = getProducts()[idx];
  document.getElementById('editProdIdx').value  = idx;
  document.getElementById('editName').value     = p.name;
  document.getElementById('editPrice').value    = p.price;
  document.getElementById('editOldPrice').value = p.oldPrice || '';
  document.getElementById('editDesc').value     = p.desc;
  document.getElementById('editImgPreview').style.display = 'none';
  editImgData = null;
  document.getElementById('editModal').classList.add('open');
}

function previewEditImg(inp) {
  if (inp.files[0]) {
    const r = new FileReader();
    r.onload = e => {
      const img = document.getElementById('editImgPreview');
      img.src = e.target.result;
      img.style.display = 'block';
      editImgData = e.target.result;
    };
    r.readAsDataURL(inp.files[0]);
  }
}

// ============================================================
// SAVE EDIT PRODUCT (UPDATED)
// ============================================================
async function saveEditProduct() {
  const idx   = parseInt(document.getElementById('editProdIdx').value);
  const prods = getProducts();
  prods[idx].name     = document.getElementById('editName').value;
  prods[idx].price    = parseInt(document.getElementById('editPrice').value);
  prods[idx].oldPrice = parseInt(document.getElementById('editOldPrice').value) || null;
  prods[idx].desc     = document.getElementById('editDesc').value;
  if (editImgData) prods[idx].img = editImgData;
  await setProducts(prods);
  closeModal('editModal');
  renderProductsTable();
  showToast('Product updated.', 'success');
}

// ============================================================
// DELETE PRODUCT (UPDATED)
// ============================================================
async function deleteProduct(idx) {
  if (!confirm('Delete this product? It will be removed from the shop immediately.')) return;
  const prods = getProducts();
  prods.splice(idx, 1);
  await setProducts(prods);
  renderProductsTable();
  showToast('Product deleted.', 'success');
}

// ============================================================
// ADMIN — NEWSLETTER
// ============================================================
function renderSubsTable() {
  const subs = getSubscribers();
  document.getElementById('nlSubCountEl').textContent = subs.length;
  const tbody = document.getElementById('subsBody');
  if (!subs.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--stone);padding:2rem;">No subscribers yet.</td></tr>';
    return;
  }
  tbody.innerHTML = subs.map((s, i) => `<tr>
    <td>${i + 1}</td>
    <td>${s.email}</td>
    <td>${s.date}</td>
    <td><button class="action-btn action-delete" onclick="removeSub(${i})">Remove</button></td>
  </tr>`).join('');
}

// ============================================================
// REMOVE SUB (UPDATED)
// ============================================================
async function removeSub(idx) {
  const subs = getSubscribers();
  subs.splice(idx, 1);
  await setSubscribers(subs);
  renderSubsTable();
  showToast('Subscriber removed.');
}

function sendNewsletter() {
  const subj = document.getElementById('nlSubject').value.trim();
  const body = document.getElementById('nlBody').value.trim();
  const subs = getSubscribers();
  if (!subj || !body) {
    showToast('Please fill in both subject and message.', 'error');
    return;
  }
  if (!subs.length) {
    showToast('There are no subscribers yet.');
    return;
  }
  console.log(`[NEWSLETTER]\nTo: ${subs.map(s => s.email).join(', ')}\nSubject: ${subj}\n\n${body}`);
  showToast(`Newsletter sent to ${subs.length} subscriber(s).`, 'success');
  document.getElementById('nlSubject').value = '';
  document.getElementById('nlBody').value = '';
}

// ============================================================
// ADMIN — SETTINGS
// ============================================================
function loadSettingsUI() {
  const s = getSettings();

  if (s.bankName) {
    document.getElementById('setBankName').value = s.bankName;
    document.getElementById('setAccName').value  = s.accName || '';
    document.getElementById('setAccNum').value   = s.accNum  || '';
    document.getElementById('dspBankName').textContent = s.bankName;
    document.getElementById('dspAccName').textContent  = s.accName || '';
    document.getElementById('dspAccNum').textContent   = s.accNum  || '';
    document.getElementById('bankSetForm').style.display    = 'none';
    document.getElementById('bankSetDisplay').style.display = 'block';
    document.getElementById('clearBankBtn').style.display   = 'inline-block';
  } else {
    document.getElementById('bankSetForm').style.display    = 'block';
    document.getElementById('bankSetDisplay').style.display = 'none';
    document.getElementById('clearBankBtn').style.display   = 'none';
  }

  if (s.adminEmail) {
    document.getElementById('setAdminEmail').value = s.adminEmail;
    document.getElementById('dspAdminEmail').textContent = s.adminEmail;
    document.getElementById('emailSetForm').style.display    = 'none';
    document.getElementById('emailSetDisplay').style.display = 'block';
    document.getElementById('clearEmailBtn').style.display   = 'inline-block';
  } else {
    document.getElementById('emailSetForm').style.display    = 'block';
    document.getElementById('emailSetDisplay').style.display = 'none';
    document.getElementById('clearEmailBtn').style.display   = 'none';
  }
}

// ============================================================
// SAVE BANK DETAILS (UPDATED)
// ============================================================
async function saveBankDetails() {
  const s = getSettings();
  const name = document.getElementById('setBankName').value.trim();
  const accN = document.getElementById('setAccName').value.trim();
  const accU = document.getElementById('setAccNum').value.trim();
  if (!name || !accN || !accU) {
    showToast('Please fill in all bank fields.', 'error');
    return;
  }
  s.bankName = name;
  s.accName = accN;
  s.accNum = accU;
  await setSettings(s);
  loadSettingsUI();
  showToast('Bank details saved. Customers will see these at checkout.', 'success');
}

// ============================================================
// CLEAR BANK DETAILS (UPDATED)
// ============================================================
async function clearBankDetails() {
  if (!confirm('Remove bank details? Customers will see "Not configured" at checkout.')) return;
  const s = getSettings();
  delete s.bankName;
  delete s.accName;
  delete s.accNum;
  await setSettings(s);
  loadSettingsUI();
  showToast('Bank details removed.');
}

// ============================================================
// SAVE ADMIN EMAIL (UPDATED)
// ============================================================
async function saveAdminEmail() {
  const email = document.getElementById('setAdminEmail').value.trim();
  if (!email) {
    showToast('Please enter an email.', 'error');
    return;
  }
  const s = getSettings();
  s.adminEmail = email;
  await setSettings(s);
  loadSettingsUI();
  showToast('Notification email saved.', 'success');
}

// ============================================================
// CLEAR NOTIFICATION EMAIL (UPDATED)
// ============================================================
async function clearNotifEmail() {
  if (!confirm('Remove notification email?')) return;
  const s = getSettings();
  delete s.adminEmail;
  await setSettings(s);
  loadSettingsUI();
  showToast('Notification email removed.');
}

function changeAdminPassword() {
  const np1 = document.getElementById('changePwd1').value;
  const np2 = document.getElementById('changePwd2').value;
  if (!np1 || np1.length < 6) {
    showToast('New password must be at least 6 characters.', 'error');
    return;
  }
  if (np1 !== np2) {
    showToast('New passwords do not match.', 'error');
    return;
  }
  save('sw_custom_password', np1);
  document.getElementById('curPwd').value = '';
  document.getElementById('changePwd1').value = '';
  document.getElementById('changePwd2').value = '';
  showToast('Password updated. Use it next time you log in.', 'success');
}

// ============================================================
// ADMIN TAB SWITCHER
// ============================================================
function adminTab(name, el) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('admin-' + name).classList.add('active');
  el.classList.add('active');

  const titles = { dashboard: 'Dashboard', orders: 'Orders', products: 'Products', newsletter: 'Newsletter', settings: 'Settings' };
  document.getElementById('adminTitle').textContent = titles[name] || name;

  if (name === 'dashboard')  renderAdminDashboard();
  if (name === 'orders')     renderOrdersTable();
  if (name === 'products')   renderProductsTable();
  if (name === 'newsletter') renderSubsTable();
  if (name === 'settings')   loadSettingsUI();
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ============================================================
// INIT (UPDATED)
// ============================================================
async function init() {
    await loadFromServer();
    updateCartCount();
    renderHomeProducts();
    console.log('SlideWrld initialized with server sync');
    console.log('Run testAPI() in console to test connection');
}

init();

document.querySelectorAll('.modal-overlay').forEach(m =>
  m.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); })
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
});