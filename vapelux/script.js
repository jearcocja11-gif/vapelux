// ========== SECURITY: INPUT SANITIZER ==========
function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ========== SECURITY: RATE LIMITER ==========
const rateLimiter = (() => {
  const attempts = {};
  return function (key, maxAttempts, windowMs) {
    const now = Date.now();
    if (!attempts[key]) attempts[key] = [];
    attempts[key] = attempts[key].filter(t => now - t < windowMs);
    if (attempts[key].length >= maxAttempts) return false;
    attempts[key].push(now);
    return true;
  };
})();

// ========== AGE GATE ==========
function initAgeGate() {
  const gate = document.getElementById('age-gate');
  const btnYes = document.getElementById('age-yes');
  const btnNo = document.getElementById('age-no');
  
  if (!gate) return;
  
  const verified = sessionStorage.getItem('vapelux_age_verified');
  if (verified === 'true') {
    gate.style.display = 'none';
    return;
  }
  
  document.body.style.overflow = 'hidden';
  
  if (btnYes) {
    btnYes.addEventListener('click', () => {
      gate.style.opacity = '0';
      setTimeout(() => {
        gate.style.display = 'none';
        document.body.style.overflow = '';
      }, 500);
      sessionStorage.setItem('vapelux_age_verified', 'true');
    });
  }
  
  if (btnNo) {
    btnNo.addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });
  }
}

// ========== NAVBAR & SCROLL ==========
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => revealObserver.observe(el));
}

// ========== CART SYSTEM ==========
const Cart = (() => {
  const STORAGE_KEY = 'vapelux_cart';
  let items = [];

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      items = data ? JSON.parse(data) : [];
      items = items.filter(i => i.id && i.name && typeof i.price === 'number' && i.qty > 0);
    } catch { items = []; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { }
  }

  function getItems() { return [...items]; }
  function getCount() { return items.reduce((sum, i) => sum + i.qty, 0); }
  function getTotal() { return items.reduce((sum, i) => sum + i.price * i.qty, 0); }

  function addItem(product) {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      items.push({ 
        id: product.id, 
        name: product.name, 
        brand: product.brand, 
        price: parseFloat(product.price), 
        img: product.img, 
        qty: 1 
      });
    }
    save();
    updateUI();
  }

  function removeItem(id) {
    items = items.filter(i => i.id !== id);
    save();
    updateUI();
  }

  function updateQty(id, delta) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeItem(id); return; }
    save();
    updateUI();
  }

  function updateUI() {
    const countEl = document.getElementById('cart-count');
    const itemsEl = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal-value');
    const cartFooter = document.getElementById('cart-footer');
    const cartEmpty = document.getElementById('cart-empty');

    const count = getCount();
    if (countEl) {
      countEl.textContent = count;
      countEl.style.display = count > 0 ? 'flex' : 'none';
    }

    if (!itemsEl) return;

    if (items.length === 0) {
      itemsEl.innerHTML = '';
      if (cartFooter) cartFooter.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'flex';
      return;
    }

    if (cartFooter) cartFooter.style.display = 'block';
    if (cartEmpty) cartEmpty.style.display = 'none';

    itemsEl.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
        <div class="cart-item-details">
          <div class="cart-item-brand">${sanitize(item.brand)}</div>
          <div class="cart-item-name">${sanitize(item.name)}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" onclick="Cart.updateQty('${item.id}', -1)">-</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
          </div>
          <button class="cart-remove-btn" onclick="Cart.removeItem('${item.id}')">🗑️</button>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = '$' + getTotal().toFixed(2);
  }

  load();
  return { getItems, getCount, getTotal, addItem, removeItem, updateQty, updateUI };
})();

// ========== UI INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initAgeGate();
  initScrollEffects();
  initParticles();
  Cart.updateUI();

  // Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navClose = document.getElementById('nav-close');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.add('open');
    });
    
    if (navClose) {
      navClose.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    }

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // Cart drawer toggles
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const toggle = document.getElementById('cart-toggle');
  const close = document.getElementById('cart-close');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  function openCart() { 
    drawer?.classList.add('open'); 
    overlay?.classList.add('open'); 
    document.body.style.overflow = 'hidden';
  }
  function closeCart() { 
    drawer?.classList.remove('open'); 
    overlay?.classList.remove('open'); 
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', openCart);
  close?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  checkoutBtn?.addEventListener('click', () => window.location.href = 'checkout.html');

  // Add to cart buttons
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!rateLimiter('cart', 10, 5000)) return;
      const card = btn.closest('.product-card');
      if (!card) return;
      Cart.addItem({
        id: card.dataset.id,
        name: card.dataset.name,
        brand: card.dataset.brand,
        price: card.dataset.price,
        img: card.dataset.img
      });
      showToast(`${card.dataset.name} added!`);
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
});

// ========== TOAST ==========
function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== PARTICLES ==========
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();
  class Particle {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.3 + 0.1;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
    }
    draw() {
      ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (let i = 0; i < 60; i++) particles.push(new Particle());
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}
