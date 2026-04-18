/* ── Supabase API ───────────────────────────────────────────────────────── */

/**
 * Fetches all menu items from Supabase, ordered by sort_order ascending.
 * @async
 * @returns {Promise<Array<Object>>} Resolves with the array of menu item objects.
 * @throws {Error} If the Supabase response is not OK.
 */
async function fetchMenuFromSupabase() {
  var res = await fetch(
    SUPABASE_URL + '/rest/v1/menu_items?select=*&order=sort_order.asc',
    { headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON } }
  );
  if (!res.ok) throw new Error('Supabase error ' + res.status);
  return res.json();
}

/* ── Menu rendering ─────────────────────────────────────────────────────── */

/**
 * Renders a list of menu items into a section DOM element,
 * replacing any previously rendered item rows while preserving
 * structural children (section-header, specials-note, promo-note).
 * @param {HTMLElement} section - The section element to render into.
 * @param {Array<Object>} items - Menu item objects to render.
 */
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
    var sectionTag = item.menu_group === 'lounge' ? 'lounge' : 'eatery';
    var div = document.createElement('div');
    div.className = 'menu-item' + (item.available ? '' : ' item-unavailable');
    div.dataset.imageUrl = item.image_url || '';
    div.dataset.displayName = item.name;
    div.dataset.subLabel = item.sub_label || '';
    /* Store display price as formatted string for overlay */
    var dispPrice = item.is_free ? 'Complimentary'
      : item.has_variants ? 'Select a size'
      : !item.available ? 'Unavailable'
      : '\u20a6' + item.price.toLocaleString();
    div.dataset.displayPrice = dispPrice;
    div.addEventListener('click', function(e) {
      if (e.target.closest('button') || e.target.closest('.item-qty-wrap')) return;
      openItemOverlay(div.dataset.displayName, div.dataset.displayPrice, div.dataset.subLabel, div.dataset.imageUrl);
    });
    var nameHtml = item.sub_label
      ? escHtml(item.name) + '<span class="item-sub">' + escHtml(item.sub_label) + '</span>'
      : escHtml(item.name);
    if (item.category_type === 'promo' && item.combo) {
      nameHtml += '<span class="combo-tag">Combo</span>';
    }

    /* Determine if this item requires a take-out packaging charge:
       Drinks, pastries, asun (grill), promo/combo/offers items are exempt. */
    var needsPack = sectionTag === 'lounge'
      ? item.section === 'lounge-foods'
      : !(
        item.tab === 'drinks' ||
        item.tab === 'pastries' ||
        (item.section === 'grill' && item.name === 'Asun') ||
        item.category_type === 'promo' ||
        item.combo === true ||
        item.section === 'promos'
      );
    var npAttr = ' data-needs-pack="' + needsPack + '"';
    var secAttr = ' data-section="' + sectionTag + '"';

    if (item.has_variants && item.variants) {
      var varBtns = item.variants.map(function(v) {
        var label = v.name.replace(/^[^(]*\(/, '').replace(/\).*$/, '').trim() || v.name;
        var dis = item.available ? '' : ' disabled';
        return '<div class="item-qty-wrap" data-item-name="' + escHtml(v.name) +
          '" data-price="' + v.price + '" data-needs-pack="' + needsPack + '" data-section="' + sectionTag + '">' +
          '<button class="variant-btn"' + dis + ' data-name="' + escHtml(v.name) +
          '" data-price="' + v.price + '"' + npAttr + secAttr + ' onclick="addItem(this)">' +
          escHtml(label) + ' \u00a0\u20a6' + v.price.toLocaleString() + '</button></div>';
      }).join('');
      div.innerHTML = '<div class="item-info"><div class="item-name">' + escHtml(item.name) + '</div></div>' +
        (item.available ? '<div class="variant-group">' + varBtns + '</div>' : '<span class="oos-badge">Out of Stock</span>');
    } else if (item.is_free) {
      div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
        '<span class="free-label">Complimentary</span>' +
        '<div class="item-qty-wrap" data-item-name="' + escHtml(item.name) + '" data-price="0" data-needs-pack="' + needsPack + '" data-section="' + sectionTag + '" data-free="true">' +
        '<button class="add-btn" data-name="' + escHtml(item.name) + '" data-price="0" data-free="true"' + npAttr + secAttr + ' onclick="addItem(this)">+</button></div>';
    } else if (!item.available) {
      div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
        '<span class="oos-badge">Out of Stock</span>' +
        '<button class="add-btn" disabled>+</button>';
    } else {
      div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
        '<div class="item-price"><span class="cur">\u20a6</span>' + item.price.toLocaleString() + '</div>' +
        '<div class="item-qty-wrap" data-item-name="' + escHtml(item.name) + '" data-price="' + item.price + '" data-needs-pack="' + needsPack + '" data-section="' + sectionTag + '">' +
        '<button class="add-btn" data-name="' + escHtml(item.name) + '" data-price="' + item.price + '"' + npAttr + secAttr + ' onclick="addItem(this)">+</button></div>';
    }
    section.appendChild(div);
  });
}

/**
 * Groups menu items by section, filters out expired promos,
 * shows/hides the Offers section, and renders every section.
 * Re-attaches IntersectionObservers after content is populated.
 * @param {Array<Object>} items - Full list of menu item objects from Supabase or STATIC_MENU.
 */
function renderMenuItems(items) {
  var today = new Date(); today.setUTCHours(0, 0, 0, 0);

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
  ['specials','mains','proteins','grill','swallow','soups','sides','drinks','pastries',
   'lounge-beers','lounge-beverages','lounge-shots','lounge-spirits','lounge-champagne-whiskey',
   'lounge-wine','lounge-cocktails','lounge-mocktails','lounge-bitters','lounge-foods'].forEach(function(sid) {
    var sec = document.getElementById(sid);
    if (sec) renderSectionItems(sec, bySection[sid] || []);
  });

  /* Re-attach IntersectionObservers now that content is populated */
  document.querySelectorAll('.menu-section').forEach(function(s) { fadeObserver.observe(s); });
  document.querySelectorAll('#groupEatery .menu-section, #groupLounge .menu-section').forEach(function(s) { activeObserver.observe(s); });
}

/**
 * Loads menu items from Supabase when configured, falling back to
 * STATIC_MENU if Supabase is unavailable or not yet set up.
 * Shows a toast notification on Supabase fetch failure.
 * @async
 * @returns {Promise<void>}
 */
async function loadMenu() {
  var items;
  if (SUPABASE_CONFIGURED) {
    try { items = await fetchMenuFromSupabase(); }
    catch (e) {
      console.warn('Supabase unavailable, using fallback:', e.message);
      showToast('Could not load live menu — showing saved menu', true);
      items = STATIC_MENU;
    }
  } else {
    items = STATIC_MENU;
  }
  if (Array.isArray(items)) {
    var hasLounge = items.some(function(i) { return i.menu_group === 'lounge' || String(i.section || '').indexOf('lounge-') === 0; });
    if (!hasLounge) {
      var loungeFallback = STATIC_MENU.filter(function(i) { return i.menu_group === 'lounge'; });
      items = items.concat(loungeFallback);
    }
  }
  renderMenuItems(items);
}
