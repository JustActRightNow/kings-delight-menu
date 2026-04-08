// Run with: node cart.test.js
let passed = 0, failed = 0;

function assert(label, got, expected) {
  if (got === expected) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    console.error(`     expected: ${expected}`);
    console.error(`     got:      ${got}`);
    failed++;
  }
}

function calcTotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function isPromoLive(promo) {
  if (!promo.expires) return true;
  return new Date(promo.expires) > new Date();
}

console.log('\nCart total');
assert('empty cart is 0',          calcTotal([]),                                          0);
assert('single item x1',           calcTotal([{ price: 1500, qty: 1 }]),                  1500);
assert('single item x3',           calcTotal([{ price: 500,  qty: 3 }]),                  1500);
assert('two different items',      calcTotal([{ price: 1500, qty: 1 }, { price: 500, qty: 2 }]), 2500);
assert('zero price item',          calcTotal([{ price: 0, qty: 5 }]),                     0);
assert('large order',              calcTotal([{ price: 3500, qty: 4 }]),                  14000);

console.log('\nPromo expiry');
assert('no expiry field = live',   isPromoLive({}),                                       true);
assert('future date = live',       isPromoLive({ expires: '2099-12-31' }),                true);
assert('past date = expired',      isPromoLive({ expires: '2020-01-01' }),                false);
assert('today edge case - past',   isPromoLive({ expires: '2024-01-01' }),                false);

console.log(`\n${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
