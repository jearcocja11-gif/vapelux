// ========== SECURITY: INPUT SANITIZER ==========
function sanitize(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ========== SECURITY: RATE LIMITER ==========
const rateLimiter = (() => {
  const attempts = {};
  return function(key, maxAttempts, windowMs) {
    const now = Date.now();
    if (!attempts[key]) attempts[key] = [];
    attempts[key] = attempts[key].filter(t => now - t < windowMs);
    if (attempts[key].length >= maxAttempts) return false;
    attempts[key].push(now);
    return true;
  };
})();

// ========== SECURITY: CSRF TOKEN ==========
function generateCSRFToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}
const csrfToken = generateCSRFToken();

// ========== AGE GATE ==========
(function() {
  const gate = document.getElementById('age-gate');
  if (!gate) return;
  const verified = sessionStorage.getItem('vapelux_age_verified');
  if (verified === 'true') {
    gate.classList.add('hidden');
    return;
  }
  document.body.style.overflow = 'hidden';
  document.getElementById('age-yes').addEventListener('click', () => {
    gate.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('vapelux_age_verified', 'true');
  });
  document.getElementById('age-no').addEventListener('click', () => {
    window.location.href = 'https://www.google.com';
  });
})();

// ========== NAVBAR SCROLL ==========
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ========== MOBILE NAV ==========
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    });
  });
}

// ========== SCROLL REVEAL ==========
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
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

// ========== COUNTER ANIMATION ==========
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 25);
  });
}
const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); statsObserver.disconnect(); }
  }, { threshold: 0.5 });
  statsObserver.observe(statsSection);
}

// ========== PARTICLES ==========
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.1;
      const colors = ['139,92,246', '6,182,212', '236,72,153'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }
  for (let i = 0; i < 60; i++) particles.push(new Particle());
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ========== CART SYSTEM ==========
const Cart = (() => {
  const STORAGE_KEY = 'vapelux_cart';
  let items = [];

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      items = data ? JSON.parse(data) : [];
      // Validate structure
      items = items.filter(i => i.id && i.name && typeof i.price === 'number' && typeof i.qty === 'number' && i.qty > 0);
    } catch { items = []; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }

  function getItems() { return [...items]; }

  function getCount() { return items.reduce((sum, i) => sum + i.qty, 0); }

  function getTotal() { return items.reduce((sum, i) => sum + i.price * i.qty, 0); }

  function addItem(product) {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      if (existing.qty >= 10) return; // Max 10 per item
      existing.qty++;
    } else {
      items.push({ id: product.id, name: sanitize(product.name), brand: sanitize(product.brand), price: parseFloat(product.price), img: product.img, qty: 1 });
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
    if (item.qty > 10) item.qty = 10;
    save();
    updateUI();
  }

  function updateUI() {
    // Count badge
    const countEl = document.getElementById('cart-count');
    const count = getCount();
    if (countEl) {
      countEl.textContent = count;
      countEl.style.display = count > 0 ? 'flex' : 'none';
    }

    // Cart items list
    const cartItemsEl = document.getElementById('cart-items');
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartFooterEl = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal-value');
    if (!cartItemsEl) return;

    if (items.length === 0) {
      cartItemsEl.innerHTML = '';
      if (cartEmptyEl) cartEmptyEl.style.display = 'flex';
      if (cartFooterEl) cartFooterEl.style.display = 'none';
      return;
    }

    if (cartEmptyEl) cartEmptyEl.style.display = 'none';
    if (cartFooterEl) cartFooterEl.style.display = 'block';

    cartItemsEl.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${sanitize(item.id)}">
        <div class="cart-item-img"><img src="${sanitize(item.img)}" alt="${sanitize(item.name)}"></div>
        <div class="cart-item-details">
          <div class="cart-item-brand">${sanitize(item.brand)}</div>
          <div class="cart-item-name">${sanitize(item.name)}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" data-id="${sanitize(item.id)}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn" data-id="${sanitize(item.id)}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-remove-btn" data-id="${sanitize(item.id)}" aria-label="Remove item">🗑️</button>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = '$' + getTotal().toFixed(2);

    // Rebind events
    cartItemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        updateQty(btn.dataset.id, parseInt(btn.dataset.delta));
      });
    });
    cartItemsEl.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => { removeItem(btn.dataset.id); });
    });
  }

  load();
  return { getItems, getCount, getTotal, addItem, removeItem, updateQty, updateUI };
})();

// Init cart UI on load
Cart.updateUI();

// Cart drawer toggle
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartShopBtn = document.getElementById('cart-shop-btn');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

function openCart() {
  if (cartDrawer) cartDrawer.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (cartToggle) cartToggle.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
if (cartShopBtn) cartShopBtn.addEventListener('click', closeCart);
if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener('click', () => {
    showToast('Checkout coming soon! 🚀');
  });
}

// Add to cart buttons
document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!rateLimiter('add-to-cart', 10, 5000)) {
      showToast('Slow down! Too many requests.');
      return;
    }
    const card = btn.closest('.product-card');
    if (!card) return;
    Cart.addItem({
      id: card.dataset.id,
      name: card.dataset.name,
      price: card.dataset.price,
      brand: card.dataset.brand,
      img: card.dataset.img,
    });
    showToast(`${sanitize(card.dataset.name)} added to cart!`);
    btn.textContent = '✓ Added';
    btn.style.background = 'var(--accent-1)';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.style.background = '';
      btn.style.color = '';
    }, 1500);
  });
});

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Newsletter form
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!rateLimiter('newsletter', 3, 60000)) {
      showToast('Please wait before trying again.');
      return;
    }
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput ? emailInput.value.trim() : '';
    // Validate email with regex
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }
    showToast('Thank you for subscribing! 🎉');
    if (emailInput) emailInput.value = '';
  });
}

// ========== FAQ ACCORDION (for FAQ page) ==========
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
