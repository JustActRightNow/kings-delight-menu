/* ── WhatsApp order dispatch ────────────────────────────────────────────── */
function orderCode(total, itemCount) {
  const raw = ((total * 37 + itemCount * 7919) ^ 0xABCD) % 1000000;
  return String(raw).padStart(6, '0');
}

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

function sendToWhatsApp() {
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
  msg += "\n_Ref: #KD-" + code + "_";

  /* ── Log to Google Sheets ── */
  logOrderToSheet({
    time: new Date().toISOString(),
    code: 'KD-' + code,
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
