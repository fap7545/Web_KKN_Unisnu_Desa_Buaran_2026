// =========================================
//   KKN UNISNU XXI - MAIN JS (Redesign)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initSlider();
  initScrollReveal();
  initBAPreview();
  updateStats();
});

// ---- Navbar active link on scroll ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    updateActiveNavLink();
  });
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-menu .nav-link');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// ---- Mobile Nav ----
function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const close = document.getElementById('mobile-nav-close');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  const closeFn = () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (close) close.addEventListener('click', closeFn);
  mobileNav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeFn));
}

// ---- Hero Slider ----
let currentSlide = 0;
let slideInterval;
const slides = [];

function initSlider() {
  const sliderEl = document.querySelector('.hero-slider');
  if (!sliderEl) return;

  const slideEls = sliderEl.querySelectorAll('.slide');
  slideEls.forEach((s, i) => slides.push(s));

  if (slides.length < 2) return;

  startAutoSlide();
}

function goSlide(idx) {
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
  });
  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  currentSlide = idx;
  resetAutoSlide();
}

function nextSlide() {
  goSlide((currentSlide + 1) % slides.length);
}

function prevSlide() {
  goSlide((currentSlide - 1 + slides.length) % slides.length);
}

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 5000);
}

function resetAutoSlide() {
  clearInterval(slideInterval);
  startAutoSlide();
}

// ---- Scroll Reveal ----
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));
}

// ---- BA Preview ----
function initBAPreview() {
  const grid = document.getElementById('ba-preview-grid');
  if (!grid || typeof Storage === 'undefined') return;

  const list = Storage.getBeritaAcara().slice(0, 3);
  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:1rem;opacity:0.3;">📋</div>
        <div>Belum ada berita acara. <a href="berita-acara.html" style="color:var(--green-dark);font-weight:700;">Tambah sekarang →</a></div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((ba, i) => `
    <div class="ba-prev-card reveal delay-${i+1}" onclick="window.location.href='berita-acara.html?id=${ba.id}'" style="cursor:pointer;">
      <div class="ba-prev-top">
        <div>
          <div class="ba-prev-no">${ba.nomor || ''}</div>
          <div class="ba-prev-title">${escHtml(ba.judul)}</div>
        </div>
        <div class="ba-prev-date-box">${formatDate(ba.tanggal)}</div>
      </div>
      <div class="ba-prev-body">
        <p>${ba.agenda ? escHtml(ba.agenda.substring(0,110)) + (ba.agenda.length > 110 ? '…' : '') : '-'}</p>
        <div class="ba-prev-footer">
          <div class="ba-prev-lokasi">📍 ${escHtml(ba.lokasi)}</div>
          <div class="ba-prev-link">Lihat Detail →</div>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(initScrollReveal, 50);
}

// ---- Update Stats ----
function updateStats() {
  if (typeof Storage === 'undefined') return;
  const count = Storage.getBeritaAcara().length;

  const heroBA = document.getElementById('hero-ba-count');
  if (heroBA) heroBA.textContent = count;

  const statBA = document.getElementById('stat-ba-count');
  if (statBA) statBA.textContent = count;
}

// ---- Utils ----
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toast-icon');
  const text  = document.getElementById('toast-text');
  if (!toast) return;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  toast.className = `toast toast-${type} show`;
  if (icon) icon.textContent = icons[type] || '✅';
  if (text) text.textContent = message;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---- PDF Modal Logic ----
function openPdfModal(pdfUrl) {
  const modal = document.getElementById('modal-pdf');
  const viewer = document.getElementById('pdf-viewer');
  if (modal && viewer) {
    viewer.src = pdfUrl;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closePdfModal() {
  const modal = document.getElementById('modal-pdf');
  const viewer = document.getElementById('pdf-viewer');
  if (modal && viewer) {
    modal.classList.remove('open');
    viewer.src = '';
    document.body.style.overflow = '';
  }
}

// Close PDF modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
    if (e.target.id === 'modal-pdf') {
      const viewer = document.getElementById('pdf-viewer');
      if (viewer) viewer.src = '';
    }
  }
});
