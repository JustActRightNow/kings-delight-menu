/* Table / source resolution */
const params = new URLSearchParams(window.location.search);
const tableParam = params.get('table');
if (tableParam && /^[1-8]$/.test(tableParam)) {
  localStorage.setItem('kd_table', tableParam);
}
const tableNum = localStorage.getItem('kd_table');
const src = tableNum ? ('table-' + tableNum) : (params.get('src') || 'direct');

function fmtSrc(s) {
  if (s.startsWith('table-')) return 'Table ' + s.replace('table-', '');
  const map = { counter: 'Counter', packaging: 'Takeaway Packaging', instagram: 'Instagram', flyer: 'Flyer / Ad', direct: 'Walk-in' };
  return map[s] || s.replace(/-/g, ' ').replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/* ── Plate helpers ──────────────────────────────────────────────────────── */
function getActivePlate() { return state.plates[state.activePlateIndex]; }
function hasItems() { return state.plates.some(p => p.items.length > 0); }
function subtotal() {
  return state.plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + (i.free ? 0 : i.price * i.qty), 0), 0);
}
function nonEmptyPlateCount() { return state.plates.filter(p => p.items.length > 0).length; }
function packagingCost() { return state.orderType === 'take-out' ? PACK_PRICE * packablePlateCount() : 0; }
function packablePlateCount() {
  return state.plates.filter(function(p) {
    return p.items.length > 0 && p.items.some(function(i) { return i.needsPack; });
  }).length;
}
function grandTotal() { return subtotal() + packagingCost(); }
function totalItemCount() {
  return state.plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.qty, 0), 0);
}

/* ── Cart logic ─────────────────────────────────────────────────────────── */
function addItem(btn) {
  const name = btn.dataset.name, price = parseInt(btn.dataset.price);
  const isFree = btn.dataset.free === 'true';
  const needsPack = btn.dataset.needsPack === 'true';
  const plate = getActivePlate();
  const ex = plate.items.find(i => i.name === name);
  if (ex) { if (!isFree) ex.qty++; }
  else { plate.items.push({ name, price, qty: 1, free: isFree, needsPack }); }
  renderAll();
}

function removeMenuItem(name) {
  const plate = getActivePlate();
  const iIdx = plate.items.findIndex(i => i.name === name);
  if (iIdx === -1) return;
  changePlateItemQty(state.activePlateIndex, iIdx, -1);
}

function changePlateItemQty(pIdx, iIdx, d) {
  const items = state.plates[pIdx].items;
  items[iIdx].qty += d;
  if (items[iIdx].qty <= 0) items.splice(iIdx, 1);
  if (items.length === 0 && state.plates.length > 1) { deletePlate(pIdx); return; }
  renderAll();
}

function addNewPlate() {
  state.plates.push({ id: state.nextPlateId++, items: [] });
  state.activePlateIndex = state.plates.length - 1;
  renderAll();
  closeCart();
}

function duplicatePlate(idx) {
  const p = state.plates[idx];
  state.plates.splice(idx + 1, 0, { id: state.nextPlateId++, items: p.items.map(i => ({ ...i })) });
  renderAll();
}

function deletePlate(idx) {
  if (state.plates.length === 1) {
    state.plates[0].items = [];
    state.activePlateIndex = 0;
  } else {
    state.plates.splice(idx, 1);
    if (state.activePlateIndex >= state.plates.length) state.activePlateIndex = state.plates.length - 1;
  }
  renderAll();
}

function editPlate(idx) {
  state.activePlateIndex = idx;
  renderAll();
  closeCart();
}

/* ── Order type ─────────────────────────────────────────────────────────── */
function setOrderType(type) {
  state.orderType = type;
  document.getElementById('otEatIn').classList.toggle('active', type === 'eat-in');
  document.getElementById('otTakeOut').classList.toggle('active', type === 'take-out');
  renderCartPanel();
  const t = '\u20a6' + grandTotal().toLocaleString();
  document.getElementById('cpTotal').textContent = t;
  document.getElementById('cartTotalBar').textContent = t;
}
