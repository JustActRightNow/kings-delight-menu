/* Table / source resolution */
const params = new URLSearchParams(window.location.search);
const tableParam = params.get('table');
if (tableParam && /^[1-8]$/.test(tableParam)) {
  localStorage.setItem('kd_table', tableParam);
}
const tableNum = localStorage.getItem('kd_table');
const src = tableNum ? ('table-' + tableNum) : (params.get('src') || 'direct');

/**
 * Formats a traffic source identifier into a human-readable label.
 * Handles table numbers (e.g. 'table-3' → 'Table 3') and
 * named sources (counter, packaging, instagram, flyer, direct).
 * @param {string} s - Raw source string from the URL or localStorage.
 * @returns {string} Human-readable source label.
 */
function fmtSrc(s) {
  if (s.startsWith('table-')) return 'Table ' + s.replace('table-', '');
  const map = { counter: 'Counter', packaging: 'Takeaway Packaging', instagram: 'Instagram', flyer: 'Flyer / Ad', direct: 'Walk-in' };
  return map[s] || s.replace(/-/g, ' ').replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/* ── Plate helpers ──────────────────────────────────────────────────────── */

/**
 * Returns the currently active plate object.
 * @returns {{ id: number, items: Array<Object> }} The active plate.
 */
function getActivePlate() { return state.plates[state.activePlateIndex]; }

/**
 * Checks whether any plate contains at least one item.
 * @returns {boolean} True if at least one item exists across all plates.
 */
function hasItems() { return state.plates.some(p => p.items.length > 0); }

/**
 * Calculates the subtotal across all plates, excluding complimentary items.
 * @returns {number} Subtotal in Naira (kobo-free integer).
 */
function subtotal() {
  return state.plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + (i.free ? 0 : i.price * i.qty), 0), 0);
}
/**
 * Returns the number of plates that contain at least one item.
 * @returns {number} Count of non-empty plates.
 */
function nonEmptyPlateCount() { return state.plates.filter(p => p.items.length > 0).length; }

/**
 * Calculates the total packaging cost for a take-out order.
 * Returns 0 for eat-in orders.
 * @returns {number} Packaging cost in Naira.
 */
function packagingCost() { return state.orderType === 'take-out' ? PACK_PRICE * packablePlateCount() : 0; }

/**
 * Returns the number of non-empty plates that contain at least one
 * item requiring packaging (i.e. not drinks, pastries, promo, combo, or offers items).
 * @returns {number} Count of plates that incur a packaging charge.
 */
function packablePlateCount() {
  return state.plates.filter(function(p) {
    return p.items.length > 0 && p.items.some(function(i) { return i.needsPack; });
  }).length;
}
/**
 * Calculates the grand total (subtotal + packaging cost).
 * @returns {number} Grand total in Naira.
 */
function grandTotal() { return subtotal() + packagingCost(); }

/**
 * Counts the total number of individual item units across all plates.
 * @returns {number} Sum of all item quantities.
 */
function totalItemCount() {
  return state.plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.qty, 0), 0);
}

/* ── Cart logic ─────────────────────────────────────────────────────────── */

/**
 * Adds one unit of the item associated with the clicked button to the
 * active plate. If the item already exists in the plate its quantity
 * is incremented (except for complimentary items which are non-stackable).
 * @param {HTMLElement} btn - The add/variant button element with data-name,
 *   data-price, data-free, and data-needs-pack attributes.
 */
function addItem(btn) {
  const name = btn.dataset.name, price = parseInt(btn.dataset.price);
  const isFree = btn.dataset.free === 'true';
  const needsPack = btn.dataset.needsPack === 'true';
  const section = btn.dataset.section || state.activeSection || 'eatery';
  let orderSection = null;
  state.plates.forEach(function(p) {
    p.items.forEach(function(i) {
      var itemSection = i.section || 'eatery';
      if (!orderSection) orderSection = itemSection;
    });
  });
  if (orderSection && orderSection !== section) {
    if (typeof showToast === 'function') {
      showToast('This order already has ' + (orderSection === 'lounge' ? 'Lounge' : 'Eatery') + ' items. Please place a separate order.', true);
    }
    return;
  }
  const plate = getActivePlate();
  const ex = plate.items.find(i => i.name === name && (i.section || 'eatery') === section);
  if (ex) { if (!isFree) ex.qty++; }
  else { plate.items.push({ name, price, qty: 1, free: isFree, needsPack, section }); }
  renderAll();
}

/**
 * Removes one unit of the named item from the active plate.
 * Delegates to changePlateItemQty with a delta of -1.
 * @param {string} name - The exact item name to decrement.
 */
function removeMenuItem(name, section) {
  const plate = getActivePlate();
  const iIdx = plate.items.findIndex(i => i.name === name && (i.section || 'eatery') === (section || 'eatery'));
  if (iIdx === -1) return;
  changePlateItemQty(state.activePlateIndex, iIdx, -1);
}

/**
 * Adjusts the quantity of a specific item in a specific plate by a delta.
 * Removes the item when quantity reaches 0. If the plate becomes empty
 * and is not the only plate, the plate is deleted.
 * @param {number} pIdx - Index of the plate in state.plates.
 * @param {number} iIdx - Index of the item within the plate's items array.
 * @param {number} d - Quantity delta (typically +1 or -1).
 */
function changePlateItemQty(pIdx, iIdx, d) {
  const items = state.plates[pIdx].items;
  items[iIdx].qty += d;
  if (items[iIdx].qty <= 0) items.splice(iIdx, 1);
  if (items.length === 0 && state.plates.length > 1) { deletePlate(pIdx); return; }
  renderAll();
}

/**
 * Adds a new empty plate to the order, makes it the active plate,
 * re-renders the UI, and closes the cart panel so the customer can
 * start adding items to the new plate.
 */
function addNewPlate() {
  state.plates.push({ id: state.nextPlateId++, items: [] });
  state.activePlateIndex = state.plates.length - 1;
  renderAll();
  closeCart();
}

/**
 * Duplicates a plate (deep-copying its items) and inserts the copy
 * immediately after the source plate.
 * @param {number} idx - Index of the plate to duplicate.
 */
function duplicatePlate(idx) {
  const p = state.plates[idx];
  state.plates.splice(idx + 1, 0, { id: state.nextPlateId++, items: p.items.map(i => ({ ...i })) });
  renderAll();
}

/**
 * Deletes a plate at the given index. If it is the only plate,
 * its items are cleared instead of removing the plate itself,
 * ensuring at least one plate always exists.
 * @param {number} idx - Index of the plate to delete.
 */
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

/**
 * Sets the active plate to the given index, re-renders the UI,
 * and closes the cart panel so the customer can add items to that plate.
 * @param {number} idx - Index of the plate to make active.
 */
function editPlate(idx) {
  state.activePlateIndex = idx;
  renderAll();
  closeCart();
}

/* ── Order type ─────────────────────────────────────────────────────────── */

/**
 * Switches the order type between 'eat-in' and 'take-out', updates
 * the toggle button states, re-renders the cart panel, and refreshes
 * the displayed total to reflect any packaging charge.
 * @param {'eat-in'|'take-out'} type - The selected order type.
 */
function setOrderType(type) {
  state.orderType = type;
  document.getElementById('otEatIn').classList.toggle('active', type === 'eat-in');
  document.getElementById('otTakeOut').classList.toggle('active', type === 'take-out');
  renderCartPanel();
  const t = '\u20a6' + grandTotal().toLocaleString();
  document.getElementById('cpTotal').textContent = t;
  document.getElementById('cartTotalBar').textContent = t;
}
