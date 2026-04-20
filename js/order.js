/* ── WhatsApp order dispatch ────────────────────────────────────────────── */

/**
 * Generates a deterministic 6-digit numeric order reference code based on
 * the order total and item count. Not cryptographically secure — used only
 * as a lightweight local fallback when the Supabase ref_code is unavailable.
 * @param {number} total - Grand total of the order in Naira.
 * @param {number} itemCount - Total number of paid item units.
 * @returns {string} Zero-padded 6-digit string (e.g. '042731').
 */
function orderCode(total, itemCount) {
  const raw = ((total * 37 + itemCount * 7919) ^ 0xABCD) % 1000000;
  return String(raw).padStart(6, '0');
}

/**
 * Sends order data to the configured Google Sheets webhook (fire-and-forget).
 * Silently swallows any errors so a logging failure never blocks checkout.
 * Does nothing when SHEET_WEBHOOK is not configured.
 * @param {Object} payload - Order data to log (time, code, customer, type,
 *   source, table, items, total, note).
 */
function logOrderToSheet(payload) {
  if (!SHEET_WEBHOOK) return;
  try {
    fetch(SHEET_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) { /* silent — order still goes through WhatsApp */ }
}

/**
 * Resolves with `fallbackValue` if a promise does not settle within `ms`.
 * @template T
 * @param {Promise<T>} promise - Promise to observe.
 * @param {number} ms - Timeout in milliseconds.
 * @param {T} fallbackValue - Value returned on timeout.
 * @returns {Promise<T>} Original promise result or fallback value on timeout.
 */
function withTimeout(promise, ms, fallbackValue) {
  return new Promise(function(resolve) {
    var settled = false;
    var timer = setTimeout(function() {
      if (settled) return;
      settled = true;
      resolve(fallbackValue);
    }, ms);
    promise.then(function(value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    }).catch(function() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(fallbackValue);
    });
  });
}

/**
 * Normalizes configured WhatsApp number to digits only.
 * @returns {string} Digits-only number.
 */
function getWhatsAppNumber() {
  return String(WA || '').replace(/[^\d]/g, '');
}

/**
 * Creates the destination URL for WhatsApp checkout.
 * @param {string} message - Message body to send.
 * @returns {string} wa.me URL with encoded message text.
 */
function buildWhatsAppUrl(message) {
  var waNumber = getWhatsAppNumber();
  return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
}

/**
 * Persists the current order to the Supabase `orders` table and returns
 * a ref_code derived from a client-generated UUID. Returns null if Supabase
 * is not configured or if the request fails (checkout continues via WhatsApp).
 *
 * Uses `Prefer: return=minimal` so the insert succeeds even though the anon
 * role only has INSERT (not SELECT) permission on the orders table.  The
 * ref_code is the first 6 characters of the UUID, uppercased — identical to
 * the server-side generated column `upper(substr(id::text, 1, 6))`.
 * @async
 * @param {string} customerName - Customer's name (may be empty).
 * @param {string} note - Special requests or notes (may be empty).
 * @returns {Promise<string|null>} A 6-char uppercase ref code, or null on failure.
 */
async function saveOrderToSupabase(customerName, note) {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const orderId = crypto.randomUUID();
    const allItems = [];
    state.plates.forEach(function(plate) {
      plate.items.forEach(function(i) {
        allItems.push({ name: i.name, qty: i.qty, price: i.price, free: !!i.free, section: i.section || 'eatery' });
      });
    });
    const payload = {
      id: orderId,
      customer: customerName || 'Guest',
      order_type: state.plates.filter(p => p.items.length > 0).some(p => (p.orderType || 'eat-in') === 'take-out') ? 'take-out' : 'eat-in',
      items: allItems,
      total: grandTotal(),
      note: note || null,
    };
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/orders',
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(function() { return ''; });
      console.warn('Order save failed (' + res.status + '):', errText);
      return null;
    }
    /* Derive the same ref_code the DB generates: upper(substr(id::text, 1, 6)) */
    return orderId.substring(0, 6).toUpperCase();
  } catch (e) {
    console.warn('Order save failed, continuing to WhatsApp anyway', e);
    return null;
  }
}

/**
 * Composes a formatted WhatsApp order message and opens it in a new tab.
 * Saves the order to Supabase (non-blocking) to obtain a ref_code, falling
 * back to a locally generated code on failure. Also fires the Google Sheets
 * logging webhook. Does nothing if the cart is empty.
 * @async
 * @returns {Promise<void>}
 */
async function sendToWhatsApp() {
  if (!hasItems()) return;
  var waNumber = getWhatsAppNumber();
  if (!waNumber) {
    showToast('WhatsApp number is not configured.', true);
    return;
  }
  const total = grandTotal();
  const itemCount = state.plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + (i.free ? 0 : i.qty), 0), 0);
  const code = orderCode(total, itemCount);

  const coNameEl = document.getElementById('coName');
  const coNoteEl = document.getElementById('coNote');
  const customerName = sanitizeInput(coNameEl ? coNameEl.value.trim() : '');
  const note = sanitizeInput(coNoteEl ? coNoteEl.value.trim() : '');
  const tableNo = localStorage.getItem('kd_table');

  /* ── Open a blank window NOW, while still inside the synchronous part of
     the click handler, so the browser's popup blocker treats it as a direct
     user-initiated navigation. The final WhatsApp URL is set below once the
     async Supabase save has finished. ── */
  var waWindow = null;
  try {
    waWindow = window.open('', '_blank');
  } catch (e) {
    waWindow = null;
  }

  /* ── Save to Supabase (non-blocking; fallback to local code on failure) ── */
  const dbRef = await withTimeout(saveOrderToSupabase(customerName, note), 4000, null);
  const refCode = 'KD-' + (dbRef ?? code);
  const dbSaved = dbRef !== null;

  const allItemLines = [];
  const nonEmptyPlates = state.plates.filter(p => p.items.length > 0);
  const allTakeOut = nonEmptyPlates.every(p => (p.orderType || 'eat-in') === 'take-out');
  const anyTakeOut = nonEmptyPlates.some(p => (p.orderType || 'eat-in') === 'take-out');
  const modeLabel = allTakeOut ? 'Take Out' : (anyTakeOut ? 'Mixed (Eat In + Take Out)' : 'Eat In');

  const hasEatery = nonEmptyPlates.some(p => p.items.some(i => (i.section || 'eatery') === 'eatery'));
  const hasLounge = nonEmptyPlates.some(p => p.items.some(i => (i.section || 'eatery') === 'lounge'));

  let fromLabel = fmtSrc(src);
  if (tableNo) {
    fromLabel = (hasEatery && hasLounge) ? ('Table ' + tableNo)
      : (hasLounge ? ('Lounge Table ' + tableNo) : ('Table ' + tableNo));
  }

  let msg = '*New Order \u2014 King\'s Delight*\n';
  msg += '*From:* ' + fromLabel + '\n';
  if (customerName) msg += '*Name:* ' + customerName + '\n';
  msg += '*Ref:* ' + refCode + '\n';

  /* ── Per-plate breakdown ── */
  nonEmptyPlates.forEach(function(plate, idx) {
    const plateNum = state.plates.indexOf(plate) + 1;
    const plateType = (plate.orderType || 'eat-in') === 'take-out' ? 'Take Out' : 'Eat In';
    const sectionKey = plate.items[0] ? (plate.items[0].section || 'eatery') : 'eatery';
    const sectionLabel = sectionKey === 'lounge' ? '\uD83C\uDF79 Lounge' : '\uD83C\uDF7D\uFE0F Eatery';
    const plateHeader = nonEmptyPlates.length > 1
      ? '*Plate ' + plateNum + '* \u2014 ' + sectionLabel + ' \u00b7 ' + plateType
      : sectionLabel + ' \u00b7 ' + plateType;
    msg += '\n' + plateHeader + '\n';
    plate.items.forEach(function(i) {
      const line = i.free
        ? '- ' + (i.qty > 1 ? i.qty + '\u00d7 ' : '') + i.name + ' \u2014 Complimentary'
        : '- ' + (i.qty > 1 ? i.qty + '\u00d7 ' : '1\u00d7 ') + i.name + ' \u2014 \u20a6' + (i.price * i.qty).toLocaleString();
      allItemLines.push(line);
      msg += line + '\n';
    });
    if ((plate.orderType || 'eat-in') === 'take-out' && plate.items.some(function(i) { return i.needsPack; })) {
      msg += '- \uD83D\uDCE6 Takeaway pack \u2014 \u20a6' + PACK_PRICE.toLocaleString() + '\n';
    }
  });
  msg += '*Total: \u20a6' + total.toLocaleString() + '*';
  if (note) msg += '\nNote: ' + note;

  /* ── Log to Google Sheets ── */
  logOrderToSheet({
    time: new Date().toISOString(),
    code: refCode,
    customer: customerName || '(unnamed)',
    type: modeLabel,
    source: fmtSrc(src),
    table: tableNo || '',
    items: allItemLines.join('; '),
    total: total,
    note: note
  });

  const url = buildWhatsAppUrl(msg);
  if (waWindow) {
    try {
      waWindow.location.href = url;
      waWindow.focus();
    } catch (e) {
      window.location.href = url;
    }
  } else {
    /* Fallback for browsers that returned null from the pre-opened window
       (e.g. some iOS Safari configurations). */
    const popup = window.open(url, '_blank', 'noopener,noreferrer');
    if (!popup) window.location.href = url;
  }

  /* ── Clear cart and return to home after order is dispatched ── */
  state.plates = [{ id: 1, items: [], orderType: 'eat-in' }];
  state.activePlateIndex = 0;
  state.nextPlateId = 2;
  renderAll();
  closeCheckout();
  closeCart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (dbSaved) {
    showToast('Order sent! 🎉 Your cart has been cleared.');
  } else {
    showToast('Order sent via WhatsApp ✓  —  Order history unavailable (check Supabase setup)', true);
  }
}
