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
 * Persists the current order to the Supabase `orders` table and returns
 * the server-generated ref_code. Returns null if Supabase is not configured
 * or if the request fails (allowing checkout to continue via WhatsApp anyway).
 * @async
 * @param {string} customerName - Customer's name (may be empty).
 * @param {string} note - Special requests or notes (may be empty).
 * @returns {Promise<string|null>} The ref_code from Supabase, or null on failure.
 */
async function saveOrderToSupabase(customerName, note) {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const allItems = [];
    state.plates.forEach(function(plate) {
      plate.items.forEach(function(i) {
        allItems.push({ name: i.name, qty: i.qty, price: i.price, free: !!i.free });
      });
    });
    const payload = {
      customer: customerName || 'Guest',
      items: allItems,
      total: grandTotal(),
      note: note || '',
    };
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/orders?select=ref_code',
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return (rows && rows[0] && rows[0].ref_code) ? rows[0].ref_code : null;
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
  const total = grandTotal();
  const itemCount = state.plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + (i.free ? 0 : i.qty), 0), 0);
  const code = orderCode(total, itemCount);

  const coNameEl = document.getElementById('coName');
  const coNoteEl = document.getElementById('coNote');
  const customerName = sanitizeInput(coNameEl ? coNameEl.value.trim() : '');
  const note = sanitizeInput(coNoteEl ? coNoteEl.value.trim() : '');
  const tableNo = localStorage.getItem('kd_table');
  const typeLabel = state.orderType === 'take-out' ? '\uD83E\uDD61 Take Out' : '\uD83C\uDF7D\uFE0F Eat In';

  /* ── Save to Supabase (non-blocking; fallback to local code on failure) ── */
  const dbRef = await saveOrderToSupabase(customerName, note);
  const refCode = dbRef ?? ('KD-' + code);

  /* ── Header ── */
  let msg = "\uD83C\uDF1F *King\u2019s Delight Eatery \u2014 New Order*\n";
  msg += "\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n";

  /* ── Details row ── */
  const details = [];
  if (customerName) details.push('\uD83D\uDC64 ' + customerName);
  if (tableNo) details.push('\uD83E\uDE91 Table ' + tableNo);
  details.push(typeLabel);
  msg += details.join('   ') + "\n";
  msg += "\uD83D\uDCCD Source: " + fmtSrc(src) + "\n";
  msg += "\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n";

  /* ── Items by plate ── */
  const allItemLines = [];
  state.plates.forEach(function(plate, pIdx) {
    if (!plate.items.length) return;
    const hasMultiplePlates = state.plates.filter(p => p.items.length).length > 1;
    if (hasMultiplePlates) msg += "*Plate " + (pIdx + 1) + "*\n";
    plate.items.forEach(function(i) {
      const line = i.free
        ? '\u2022 ' + i.name + ' \u2014 Free'
        : '\u2022 ' + (i.qty > 1 ? i.qty + '\u00D7 ' : '') + i.name + ' \u2014 \u20A6' + (i.price * i.qty).toLocaleString();
      msg += line + "\n";
      allItemLines.push(line);
    });
  });

  if (state.orderType === 'take-out') {
    const n = nonEmptyPlateCount();
    msg += '\u2022 Packaging (' + n + ' plate' + (n > 1 ? 's' : '') + ') \u2014 \u20A6' + (PACK_PRICE * n).toLocaleString() + "\n";
  }

  /* ── Total ── */
  msg += "\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n";
  msg += "*Total: \u20A6" + total.toLocaleString() + "*\n";
  if (note) msg += "\n\uD83D\uDCDD " + note + "\n";
  msg += "\n_Ref: #" + refCode + "_";

  /* ── Log to Google Sheets ── */
  logOrderToSheet({
    time: new Date().toISOString(),
    code: refCode,
    customer: customerName || '(unnamed)',
    type: state.orderType,
    source: fmtSrc(src),
    table: tableNo || '',
    items: allItemLines.join('; '),
    total: total,
    note: note
  });

  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
}
