/* ── Tab switching ──────────────────────────────────────────────────────── */
const tabBtns = document.querySelectorAll('.tab-btn');
const catNav = document.getElementById('catNav');
const searchWrap = document.getElementById('searchWrap');
let activeTabPane = 'tabFood';

tabBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTabPane = btn.dataset.pane;
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.pane).classList.add('active');
    const isFood = btn.dataset.tab === 'food';
    catNav.classList.toggle('hidden', !isFood);
    searchWrap.classList.toggle('food-active', isFood);
    document.getElementById('searchInput').value = '';
    doSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ── Search — searches across all tabs when a query is active ───────────── */
function doSearch(q) {
  const qLower = q.toLowerCase().trim();
  if (!qLower) {
    /* Restore: show only the active tab pane, hide others */
    document.querySelectorAll('.tab-pane').forEach(function(pane) {
      pane.classList.toggle('active', pane.id === activeTabPane);
      pane.querySelectorAll('.menu-item').forEach(function(item) { item.style.display = ''; });
      pane.querySelectorAll('.menu-section').forEach(function(sec) { sec.style.display = ''; });
    });
    catNav.classList.toggle('hidden', activeTabPane !== 'tabFood');
    return;
  }
  /* Show all panes while searching */
  document.querySelectorAll('.tab-pane').forEach(function(pane) {
    pane.classList.add('active');
    pane.querySelectorAll('.menu-item').forEach(function(item) {
      const text = item.querySelector('.item-name').textContent.toLowerCase();
      item.style.display = text.includes(qLower) ? '' : 'none';
    });
    pane.querySelectorAll('.menu-section').forEach(function(sec) {
      const hasVisible = Array.from(sec.querySelectorAll('.menu-item')).some(i => i.style.display !== 'none');
      sec.style.display = hasVisible ? '' : 'none';
    });
  });
  catNav.classList.add('hidden');
}

document.getElementById('searchInput').addEventListener('input', function() {
  doSearch(this.value);
});

/* ── Food sub-nav scroll ────────────────────────────────────────────────── */
const foodSections = document.querySelectorAll('#tabFood .menu-section');
const subNavBtns = document.querySelectorAll('.cat-btn');

subNavBtns.forEach(b => b.addEventListener('click', function() {
  const el = document.getElementById(b.dataset.target);
  if (el) {
    const catNavH = catNav.classList.contains('hidden') ? 0 : catNav.offsetHeight;
    const searchH = searchWrap ? searchWrap.offsetHeight : 0;
    const navH = document.getElementById('tabNav').offsetHeight + catNavH + searchH;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 14, behavior: 'smooth' });
  }
}));

/* ── IntersectionObserver for food section active highlight ─────────────── */
const activeObserver = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) {
    subNavBtns.forEach(b => b.classList.remove('active'));
    const a = document.querySelector('.cat-btn[data-target="' + e.target.id + '"]');
    if (a) {
      a.classList.add('active');
      const btnRect = a.getBoundingClientRect();
      const navRect = catNav.getBoundingClientRect();
      catNav.scrollTo({ left: catNav.scrollLeft + btnRect.left - navRect.left - (navRect.width - btnRect.width) / 2, behavior: 'smooth' });
    }
  }
}), { rootMargin: '-15% 0px -75% 0px' });
foodSections.forEach(s => activeObserver.observe(s));

/* ── Fade-in observer ───────────────────────────────────────────────────── */
const allSections = document.querySelectorAll('.menu-section');
const fadeObserver = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: 0.06 });
allSections.forEach(s => fadeObserver.observe(s));

/* ── Initial render ─────────────────────────────────────────────────────── */
renderAll();

/* ── Persist customer name ──────────────────────────────────────────────── */
(function() {
  var nameEl = document.getElementById('coName');
  if (nameEl) {
    nameEl.value = localStorage.getItem('kd_customer_name') || '';
    var debounce;
    nameEl.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        localStorage.setItem('kd_customer_name', nameEl.value.trim());
      }, 400);
    });
  }
})();

/* ── Load menu from Supabase (or static fallback) ───────────────────────── */
loadMenu();

/* ── Set favicon to logo ────────────────────────────────────────────────── */
(function() {
  var logoImg = document.querySelector('.hero-logo img');
  var favicon = document.querySelector("link[rel='icon']");
  if (logoImg && favicon) {
    favicon.href = logoImg.src;
    favicon.type = 'image/png';
  }
})();
