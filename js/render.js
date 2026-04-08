/* ── HTML helpers ───────────────────────────────────────────────────────── */

/**
 * Escapes a string for safe insertion into HTML, converting special
 * characters to their HTML entity equivalents.
 * @param {string|*} s - Value to escape (coerced to string if not already).
 * @returns {string} HTML-safe string.
 */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes free-text user input by stripping HTML tags (iteratively to
 * catch nested tags), removing Markdown-style formatting characters,
 * collapsing excessive newlines, replacing URLs with '[link]',
 * and truncating to 300 characters.
 * @param {string} s - Raw user input string.
 * @returns {string} Sanitized string safe for inclusion in a WhatsApp message.
 */
function sanitizeInput(s) {
  var previousValue;
  do { previousValue = s; s = s.replace(/<[^>]*>/g, ''); } while (s !== previousValue);
  return s
    .replace(/[*_~`]/g, '')
    .replace(/[\n\r]{3,}/g, '\n\n')
    .replace(/https?:\/\/\S+/gi, '[link]')
    .slice(0, 300)
    .trim();
}

/* ── Cart bar + plate indicator ─────────────────────────────────────────── */

/**
 * Master re-render: updates the cart bar badge, total, visibility,
 * cart preview text, plate indicator label, cart panel contents,
 * and inline quantity controls on the menu page.
 */
function renderAll() {
  const count = totalItemCount();
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotalBar').textContent = '\u20a6' + grandTotal().toLocaleString();
  document.getElementById('cartBar').classList.toggle('visible', hasItems());

  const activePlate = getActivePlate();
  const plateNum = state.activePlateIndex + 1;
  const preview = activePlate.items.length
    ? activePlate.items.map(i => (i.qty > 1 ? i.qty + '\u00d7 ' : '') + i.name).join(', ')
    : 'Your order';
  document.getElementById('cartPreview').textContent = state.plates.length > 1 ? state.plates.length + ' plates' : preview;
  document.getElementById('plateIndicator').textContent = hasItems() ? 'Adding to Plate ' + plateNum : '';
  renderCartPanel();
  updateMenuItemQtys();
}

/* ── Menu-page inline quantity controls ─────────────────────────────────── */

/**
 * Syncs every `.item-qty-wrap` element on the menu page with the
 * current active plate. Shows a quantity stepper when the item is in
 * the cart, or falls back to a plain '+' add button when qty is 0.
 * Complimentary (free) items are skipped as they use a remove-only control.
 */
function updateMenuItemQtys() {
  var plate = getActivePlate();
  document.querySelectorAll('.item-qty-wrap').forEach(function(wrap) {
    var name = wrap.dataset.itemName;
    var price = wrap.dataset.price;
    var needsPack = wrap.dataset.needsPack;
    var isFree = wrap.dataset.free === 'true';
    var item = plate.items.find(function(i) { return i.name === name; });
    var qty = item ? item.qty : 0;

    if (isFree) return; /* free items keep their X-remove button from renderCartPanel */

    if (qty > 0) {
      wrap.innerHTML =
        '<div class="qty-ctrl">' +
        '<button class="qty-btn" data-remove-name="' + escHtml(name) + '" onclick="removeMenuItem(this.dataset.removeName)">\u2212</button>' +
        '<span class="qty-num">' + qty + '</span>' +
        '<button class="qty-btn" data-name="' + escHtml(name) + '" data-price="' + escHtml(price) +
        '" data-needs-pack="' + escHtml(needsPack) + '" onclick="addItem(this)">+</button>' +
        '</div>';
    } else {
      wrap.innerHTML =
        '<button class="add-btn" data-name="' + escHtml(name) + '" data-price="' + escHtml(price) +
        '" data-needs-pack="' + escHtml(needsPack) + '" onclick="addItem(this)">+</button>';
    }
  });
}

/* ── Cart panel ─────────────────────────────────────────────────────────── */

/**
 * Renders the full contents of the cart panel, including all plates,
 * their items with quantity steppers, per-plate subtotals, a packaging
 * row for take-out orders, and the grand total. Shows an empty-state
 * message when no items have been added.
 */
function renderCartPanel() {
  const list = document.getElementById('cpItems');
  if (!hasItems()) {
    list.innerHTML = '<p class="empty-msg">No items yet \u2014 add something from the menu</p>';
    document.getElementById('cpTotal').textContent = '\u20a6' + grandTotal().toLocaleString();
    return;
  }
  let html = '';
  state.plates.forEach(function(plate, pIdx) {
    if (!plate.items.length) return;
    const isActive = pIdx === state.activePlateIndex;
    const plateTotal = plate.items.reduce((s, i) => s + (i.free ? 0 : i.price * i.qty), 0);
    html += '<div class="plate-card' + (isActive ? ' active-plate' : '') + '">';
    html += '<div class="plate-header">';
    html += '<span class="plate-label">Plate ' + (pIdx + 1) + (isActive ? ' \u2714' : '') + '</span>';
    html += '<button class="plate-action-btn" title="Edit plate" onclick="editPlate(' + pIdx + ')"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M11.013 1.427a1.75 1.75 0 012.474 2.474L4.93 12.458l-3.215.358a.75.75 0 01-.831-.831l.358-3.215L11.013 1.427z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 3.5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>';
    html += '<button class="plate-action-btn" title="Duplicate plate" onclick="duplicatePlate(' + pIdx + ')">\u29c9</button>';
    html += '<button class="plate-action-btn del" title="Delete plate" onclick="deletePlate(' + pIdx + ')">\u2715</button>';
    html += '</div><div class="plate-items">';
    plate.items.forEach(function(item, iIdx) {
      if (item.free) {
        html += '<div class="cp-item"><div class="cp-item-name">' + item.name + '</div>';
        html += '<div class="cp-item-price" style="color:rgba(120,210,120,0.75);font-style:italic">Free</div>';
        html += '<button class="qty-btn" style="margin-left:8px" onclick="changePlateItemQty(' + pIdx + ',' + iIdx + ',-1)">\u2715</button></div>';
      } else {
        html += '<div class="cp-item"><div class="cp-item-name">' + item.name + '</div>';
        html += '<div class="qty-ctrl">';
        html += '<button class="qty-btn" onclick="changePlateItemQty(' + pIdx + ',' + iIdx + ',-1)">\u2212</button>';
        html += '<span class="qty-num">' + item.qty + '</span>';
        html += '<button class="qty-btn" onclick="changePlateItemQty(' + pIdx + ',' + iIdx + ',1)">+</button></div>';
        html += '<div class="cp-item-price">\u20a6' + (item.price * item.qty).toLocaleString() + '</div></div>';
      }
    });
    html += '<div class="plate-sub-total"><span>Plate total</span><span>\u20a6' + plateTotal.toLocaleString() + '</span></div>';
    html += '</div></div>';
  });
  html += '<button class="add-plate-btn" onclick="addNewPlate()">+ Add another plate</button>';
  if (state.orderType === 'take-out') {
    const n = packablePlateCount();
    if (n > 0) {
      html += '<div class="pack-row"><span>Packaging \u00d7 ' + n + ' plate' + (n > 1 ? 's' : '') + '</span><span>\u20a6' + (PACK_PRICE * n).toLocaleString() + '</span></div>';
    }
  }
  list.innerHTML = html;
  document.getElementById('cpTotal').textContent = '\u20a6' + grandTotal().toLocaleString();
}

/* ── Panel open / close ─────────────────────────────────────────────────── */

/** Opens the cart panel. */
function openCart() { document.getElementById('cartPanel').classList.add('open'); }

/** Closes the cart panel. */
function closeCart() { document.getElementById('cartPanel').classList.remove('open'); }

/* ── Item preview overlay ───────────────────────────────────────────────── */

/**
 * Opens the item preview overlay, populating it with the item's name,
 * price, sub-label, and image. Falls back to a placeholder emoji when
 * no image URL is provided or when the image fails to load.
 * @param {string} name - Display name of the menu item.
 * @param {string} price - Formatted price string (e.g. '₦3,500' or 'Complimentary').
 * @param {string} subLabel - Optional sub-label text (e.g. 'House favourite').
 * @param {string} imageUrl - URL of the item image, or empty string if none.
 */
function openItemOverlay(name, price, subLabel, imageUrl) {
  var overlay = document.getElementById('itemOverlay');
  var img = document.getElementById('itemOverlayImg');
  var noImg = document.getElementById('itemOverlayNoImg');
  document.getElementById('itemOverlayName').textContent = name;
  document.getElementById('itemOverlayPrice').textContent = price;
  document.getElementById('itemOverlaySub').textContent = subLabel;
  img.classList.remove('loaded');
  img.onload = null;
  img.onerror = null;
  if (imageUrl) {
    img.alt = name;
    img.onload = function() { img.classList.add('loaded'); noImg.style.display = 'none'; };
    img.onerror = function() { img.classList.remove('loaded'); noImg.style.display = ''; };
    img.src = imageUrl;
    noImg.style.display = 'none';
  } else {
    img.src = '';
    noImg.style.display = '';
  }
  overlay.classList.add('open');
  document.addEventListener('keydown', overlayKeyHandler);
}

/** Closes the item preview overlay and removes the Escape key listener. */
function closeItemOverlay() {
  document.getElementById('itemOverlay').classList.remove('open');
  document.removeEventListener('keydown', overlayKeyHandler);
}

/**
 * Closes the item overlay when the user clicks directly on the backdrop
 * (i.e. outside the overlay box).
 * @param {MouseEvent} e - The click event on the overlay element.
 */
function handleOverlayBackdrop(e) {
  if (e.target === document.getElementById('itemOverlay')) closeItemOverlay();
}

/**
 * Keyboard handler attached while the item overlay is open.
 * Closes the overlay when the Escape key is pressed.
 * @param {KeyboardEvent} e - The keydown event.
 */
function overlayKeyHandler(e) {
  if (e.key === 'Escape') closeItemOverlay();
}

/**
 * Opens the checkout panel. Does nothing if the cart is empty.
 * Renders the checkout summary before making the panel visible.
 */
function openCheckout() {
  if (!hasItems()) return;
  renderCheckout();
  document.getElementById('checkoutPanel').classList.add('open');
}

/** Closes the checkout panel. */
function closeCheckout() { document.getElementById('checkoutPanel').classList.remove('open'); }

/* ── Checkout summary ───────────────────────────────────────────────────── */

/**
 * Renders the order summary inside the checkout panel, listing all plates,
 * their items with quantities and amounts, a packaging line for take-out
 * orders, and the grand total.
 */
function renderCheckout() {
  let html = '<p class="checkout-section-title">Order Summary</p>';
  state.plates.forEach(function(plate, pIdx) {
    if (!plate.items.length) return;
    const hasMulti = state.plates.filter(p => p.items.length).length > 1;
    if (hasMulti) html += '<p class="checkout-plate-label">Plate ' + (pIdx + 1) + '</p>';
    plate.items.forEach(function(item) {
      const label = (item.qty > 1 ? item.qty + '\u00d7 ' : '') + item.name;
      const amt = item.free ? 'Free' : '\u20a6' + (item.price * item.qty).toLocaleString();
      html += '<div class="checkout-summary-item"><span>' + escHtml(label) + '</span><span class="item-amt">' + escHtml(amt) + '</span></div>';
    });
  });
  if (state.orderType === 'take-out') {
    const n = packablePlateCount();
    if (n > 0) {
      html += '<div class="checkout-summary-item" style="margin-top:6px"><span>📦 Packaging \u00d7 ' + n + ' plate' + (n > 1 ? 's' : '') + '</span><span class="item-amt">\u20a6' + (PACK_PRICE * n).toLocaleString() + '</span></div>';
    }
  }
  html += '<div class="co-total-row"><span class="co-total-label">Total</span><span class="co-total-amt">\u20a6' + grandTotal().toLocaleString() + '</span></div>';
  document.getElementById('checkoutBody').innerHTML = html;
}
