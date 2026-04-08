/* ── Supabase API ───────────────────────────────────────────────────────── */
async function fetchMenuFromSupabase() {
  var res = await fetch(
    SUPABASE_URL + '/rest/v1/menu_items?select=*&order=sort_order.asc',
    { headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON } }
  );
  if (!res.ok) throw new Error('Supabase error ' + res.status);
  return res.json();
}

/* ── Menu rendering ─────────────────────────────────────────────────────── */
function renderSectionItems(section, items) {
  /* Remove previous item rows (keep structural child elements) */
  var elementsToRemove = [];
  for (var c = 0; c < section.children.length; c++) {
    var child = section.children[c];
    if (!child.classList.contains('section-header') &&
        !child.classList.contains('specials-note') &&
        !child.classList.contains('promo-note')) {
      elementsToRemove.push(child);
    }
  }
  elementsToRemove.forEach(function(el) { section.removeChild(el); });

  items.forEach(function(item) {
    var div = document.createElement('div');
    div.className = 'menu-item' + (item.available ? '' : ' item-unavailable');
    var nameHtml = item.sub_label
      ? escHtml(item.name) + '<span class="item-sub">' + escHtml(item.sub_label) + '</span>'
      : escHtml(item.name);
    if (item.category_type === 'promo' && item.combo) {
      nameHtml += '<span class="combo-tag">Combo</span>';
    }

    /* Determine if this item requires a take-out packaging charge:
       Drinks, pastries, asun (grill), and promo combo offers are exempt. */
    var needsPack = !(
      item.tab === 'drinks' ||
      item.tab === 'pastries' ||
      (item.section === 'grill' && item.name === 'Asun') ||
      item.category_type === 'promo'
    );
    var npAttr = ' data-needs-pack="' + needsPack + '"';

    if (item.has_variants && item.variants) {
      var varBtns = item.variants.map(function(v) {
        var label = v.name.replace(/^[^(]*\(/, '').replace(/\).*$/, '').trim() || v.name;
        var dis = item.available ? '' : ' disabled';
        return '<div class="item-qty-wrap" data-item-name="' + escHtml(v.name) +
          '" data-price="' + v.price + '" data-needs-pack="' + needsPack + '">' +
          '<button class="variant-btn"' + dis + ' data-name="' + escHtml(v.name) +
          '" data-price="' + v.price + '"' + npAttr + ' onclick="addItem(this)">' +
          escHtml(label) + ' \u00a0\u20a6' + v.price.toLocaleString() + '</button></div>';
      }).join('');
      div.innerHTML = '<div class="item-info"><div class="item-name">' + escHtml(item.name) + '</div></div>' +
        (item.available ? '<div class="variant-group">' + varBtns + '</div>' : '<span class="oos-badge">Out of Stock</span>');
    } else if (item.is_free) {
      div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
        '<span class="free-label">Complimentary</span>' +
        '<div class="item-qty-wrap" data-item-name="' + escHtml(item.name) + '" data-price="0" data-needs-pack="' + needsPack + '" data-free="true">' +
        '<button class="add-btn" data-name="' + escHtml(item.name) + '" data-price="0" data-free="true"' + npAttr + ' onclick="addItem(this)">+</button></div>';
    } else if (!item.available) {
      div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
        '<span class="oos-badge">Out of Stock</span>' +
        '<button class="add-btn" disabled>+</button>';
    } else {
      div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
        '<div class="item-price"><span class="cur">\u20a6</span>' + item.price.toLocaleString() + '</div>' +
        '<div class="item-qty-wrap" data-item-name="' + escHtml(item.name) + '" data-price="' + item.price + '" data-needs-pack="' + needsPack + '">' +
        '<button class="add-btn" data-name="' + escHtml(item.name) + '" data-price="' + item.price + '"' + npAttr + ' onclick="addItem(this)">+</button></div>';
    }
    section.appendChild(div);
  });
}

function renderMenuItems(items) {
  var today = new Date(); today.setHours(0, 0, 0, 0);

  /* Group by section, filtering out expired promos */
  var bySection = {};
  items.forEach(function(item) {
    if (item.category_type === 'promo' && item.promo_expires_at) {
      var exp = new Date(item.promo_expires_at);
      if (exp < today) return;
    }
    if (!bySection[item.section]) bySection[item.section] = [];
    bySection[item.section].push(item);
  });

  /* Active promos (any category_type === 'promo' not yet expired) */
  var promos = items.filter(function(item) {
    if (item.category_type !== 'promo') return false;
    if (item.promo_expires_at) { var exp = new Date(item.promo_expires_at); if (exp < today) return false; }
    return true;
  });
  var offersSection = document.getElementById('offers');
  var offersNavBtn = document.querySelector('.cat-btn[data-target="offers"]');
  if (promos.length > 0) {
    offersSection.style.display = '';
    if (offersNavBtn) offersNavBtn.style.display = '';
    renderSectionItems(offersSection, promos);
  } else {
    offersSection.style.display = 'none';
    if (offersNavBtn) offersNavBtn.style.display = 'none';
  }

  /* Regular sections */
  ['specials','mains','proteins','grill','swallow','soups','sides','drinks','pastries'].forEach(function(sid) {
    var sec = document.getElementById(sid);
    if (sec) renderSectionItems(sec, bySection[sid] || []);
  });

  /* Re-attach IntersectionObservers now that content is populated */
  document.querySelectorAll('.menu-section').forEach(function(s) { fadeObserver.observe(s); });
  document.querySelectorAll('#tabFood .menu-section').forEach(function(s) { activeObserver.observe(s); });
}

async function loadMenu() {
  var items;
  if (SUPABASE_CONFIGURED) {
    try { items = await fetchMenuFromSupabase(); }
    catch (e) { console.warn('Supabase unavailable, using fallback:', e.message); items = FALLBACK_MENU; }
  } else {
    items = FALLBACK_MENU;
  }
  renderMenuItems(items);
}
