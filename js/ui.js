/* ── Toast notification ─────────────────────────────────────────────────── */
var toastTimer;
function showToast(msg, isError) {
  var el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.classList.toggle('error', !!isError);
  el.classList.add('show');
  toastTimer = setTimeout(function() { el.classList.remove('show'); }, 3500);
}

const catNav = document.getElementById('catNav');
const catNavInner = document.getElementById('catNavInner');
const searchWrap = document.getElementById('searchWrap');
const sectionBtns = document.querySelectorAll('.section-switch-btn');
const openingHoursText = document.getElementById('openingHoursText');

const EATERY_NAV = [
  { target: 'offers', label: '🎉 Offers', hiddenByDefault: true },
  { target: 'specials', label: '✦ Specials' },
  { target: 'mains', label: '🍚 Mains' },
  { target: 'proteins', label: '🥩 Proteins' },
  { target: 'grill', label: '🔥 Grill' },
  { target: 'swallow', label: '🍲 Swallow' },
  { target: 'soups', label: '🥣 Soups' },
  { target: 'sides', label: '🥗 Sides' }
];

const LOUNGE_NAV = [
  { target: 'lounge-beers', label: '🍺 Beers' },
  { target: 'lounge-beverages', label: '🥤 Beverages' },
  { target: 'lounge-shots', label: '🥃 Shots' },
  { target: 'lounge-spirits', label: '🍾 Spirits' },
  { target: 'lounge-champagne-whiskey', label: '🥂 Champagne & Whiskey' },
  { target: 'lounge-wine', label: '🍷 Wine' },
  { target: 'lounge-cocktails', label: '🍸 Cocktails' },
  { target: 'lounge-mocktails', label: '🧉 Mocktails' },
  { target: 'lounge-bitters', label: '🧪 Bitters' },
  { target: 'lounge-foods', label: '🍽️ Foods' }
];

function navConfigFor(section) {
  return section === 'lounge' ? LOUNGE_NAV : EATERY_NAV;
}

function activeGroupEl() {
  return document.getElementById(state.activeSection === 'lounge' ? 'groupLounge' : 'groupEatery');
}

function updateOpeningHours(section) {
  if (!openingHoursText) return;
  if (section === 'lounge') {
    openingHoursText.innerHTML = 'Mon – Thurs: 2pm – 2am<br>Fri – Sun: 12noon – till day break';
    return;
  }
  openingHoursText.innerHTML = 'Mon – Thurs: 9am – 11pm<br>Fri – Sun: 9am – 1am';
}

function buildCategoryNav() {
  const cfg = navConfigFor(state.activeSection);
  function safe(val) {
    if (typeof escHtml === 'function') return escHtml(val);
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  catNavInner.innerHTML = cfg.map(function(item, idx) {
    return '<button class="cat-btn' + (idx === 0 ? ' active' : '') + '" data-target="' + safe(item.target) + '"' +
      (item.hiddenByDefault ? ' style="display:none"' : '') + ' aria-label="' + safe(item.label) + '">' + safe(item.label) + '</button>';
  }).join('');
  if (state.activeSection === 'eatery') {
    var offersBtn = catNavInner.querySelector('.cat-btn[data-target=\"offers\"]');
    var offersSec = document.getElementById('offers');
    if (offersBtn && offersSec && offersSec.querySelector('.menu-item')) offersBtn.style.display = '';
  }
  catNav.classList.remove('hidden');
}

function switchSection(section) {
  if (section !== 'eatery' && section !== 'lounge') return;
  state.activeSection = section;
  sectionBtns.forEach(function(btn) { btn.classList.toggle('active', btn.dataset.section === section); });
  document.body.classList.toggle('lounge-mode', section === 'lounge');
  document.getElementById('groupEatery').classList.toggle('active', section === 'eatery');
  document.getElementById('groupLounge').classList.toggle('active', section === 'lounge');
  buildCategoryNav();
  updateOpeningHours(section);
  document.getElementById('searchInput').value = '';
  doSearch('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

sectionBtns.forEach(function(btn) {
  btn.addEventListener('click', function() { switchSection(btn.dataset.section); });
});

catNavInner.addEventListener('click', function(e) {
  const btn = e.target.closest('.cat-btn');
  if (!btn) return;
  document.querySelectorAll('.cat-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  const el = document.getElementById(btn.dataset.target);
  if (!el) return;
  const navH = catNav.offsetHeight + searchWrap.offsetHeight;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 14, behavior: 'smooth' });
});

/* ── Search — active section only ───────────────────────────────────────── */
function doSearch(q) {
  const qLower = q.toLowerCase().trim();
  const group = activeGroupEl();
  document.querySelectorAll('.menu-group').forEach(function(g) { g.classList.toggle('active', g === group); });

  if (!qLower) {
    group.querySelectorAll('.menu-item').forEach(function(item) { item.style.display = ''; });
    group.querySelectorAll('.menu-section').forEach(function(sec) {
      if (sec.id === 'offers' && !sec.querySelector('.menu-item')) {
        sec.style.display = 'none';
      } else {
        sec.style.display = '';
      }
    });
    catNav.classList.remove('hidden');
    return;
  }

  group.querySelectorAll('.menu-item').forEach(function(item) {
    const text = item.querySelector('.item-name').textContent.toLowerCase();
    item.style.display = text.includes(qLower) ? '' : 'none';
  });
  group.querySelectorAll('.menu-section').forEach(function(sec) {
    const hasVisible = Array.from(sec.querySelectorAll('.menu-item')).some(function(i) { return i.style.display !== 'none'; });
    sec.style.display = hasVisible ? '' : 'none';
  });
  catNav.classList.add('hidden');
}

document.getElementById('searchInput').addEventListener('input', function() { doSearch(this.value); });

/* ── IntersectionObserver for active highlight ───────────────────────────── */
const activeObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (!e.isIntersecting) return;
    const group = activeGroupEl();
    if (!group.contains(e.target)) return;
    document.querySelectorAll('.cat-btn').forEach(function(b) { b.classList.remove('active'); });
    const a = document.querySelector('.cat-btn[data-target="' + e.target.id + '"]');
    if (a) {
      a.classList.add('active');
      const btnRect = a.getBoundingClientRect();
      const navRect = catNav.getBoundingClientRect();
      catNav.scrollTo({ left: catNav.scrollLeft + btnRect.left - navRect.left - (navRect.width - btnRect.width) / 2, behavior: 'smooth' });
    }
  });
}, { rootMargin: '-15% 0px -75% 0px' });

/* ── Fade-in observer ───────────────────────────────────────────────────── */
const fadeObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.06 });

document.querySelectorAll('.menu-section').forEach(function(s) {
  activeObserver.observe(s);
  fadeObserver.observe(s);
});

/* ── Initial render ─────────────────────────────────────────────────────── */
buildCategoryNav();
updateOpeningHours(state.activeSection);
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
