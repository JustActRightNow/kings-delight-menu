/* ── App-wide constants ──────────────────────────────────────────────────── */
const WA = '2347060988973';
const PACK_PRICE = 400;

/* ── Supabase Config ────────────────────────────────────────────────────────
 * 1. Create a free project at https://supabase.com
 * 2. Run supabase-schema.sql in your project's SQL Editor
 * 3. Go to Settings → API and replace the values below
 * ─────────────────────────────────────────────────────────────────────────*/
const SUPABASE_URL  = 'https://ebdelqsswfgkaggdaued.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZGVscXNzd2Zna2FnZ2RhdWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzY2MzMsImV4cCI6MjA5MTMxMjYzM30.2MvN2Q6jkzbKRTRL2oZ3T4BgjPuxzh9tGEJ3Ko2NQBY';
const SUPABASE_CONFIGURED = SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1;

/* ---------------------------------------------------------------
 * GOOGLE SHEETS ORDER LOGGING
 * Set SHEET_WEBHOOK to your Google Apps Script Web App URL.
 * Apps Script code example (deploy as "Anyone" web app):
 *   function doPost(e) {
 *     var data = JSON.parse(e.postData.contents);
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     sheet.appendRow([data.time, data.code, data.customer, data.type,
 *                      data.source, data.items, data.total, data.note]);
 *     return ContentService.createTextOutput('OK');
 *   }
 * --------------------------------------------------------------- */
const SHEET_WEBHOOK = ''; /* <-- paste your Apps Script URL here */

/* ── Static fallback — used when Supabase is not yet configured ─────────── */
const STATIC_MENU = [
  // Chef's Specials
  {id:'s1',name:"Ofada \u00d7 Ayamase & Egg",price:3500,section:'specials',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'s2',name:'Continental Rice \u00d7 Shredded Chicken',price:4000,section:'specials',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'s3',name:'Stir-Fried Basmati \u00d7 Shredded Chicken',price:4000,section:'specials',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'s4',name:'Singapore Noodles \u00d7 Shredded Chicken',price:4000,section:'specials',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'s5',name:'Spaghetti Jollof \u00d7 Shredded Chicken',price:3500,section:'specials',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:5,has_variants:false,variants:null},
  // Mains
  {id:'m1',name:'Asun Rice',price:3500,section:'mains',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'m2',name:'Smoky Jollof Rice',price:500,section:'mains',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'m3',name:'Fried Rice',price:500,section:'mains',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'m4',name:'Steamed White Rice',price:500,section:'mains',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'m5',name:'Porridge',price:2000,section:'mains',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:5,has_variants:false,variants:null},
  {id:'m6',name:'Village Rice',price:2500,section:'mains',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:6,has_variants:false,variants:null},
  // Proteins
  {id:'p1',name:'Assorted',price:1200,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'p2',name:'Beef',price:1200,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'p3',name:'Chicken',price:2000,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'p4',name:'Big Chicken',price:3000,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'p5',name:'BBQ Chicken',price:3500,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:5,has_variants:false,variants:null},
  {id:'p6',name:'Fish \u2014 Titus',price:2000,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:6,has_variants:false,variants:null},
  {id:'p7',name:'Panla',price:1500,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:7,has_variants:false,variants:null},
  {id:'p8',name:'Goat Meat',price:2500,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:8,has_variants:false,variants:null},
  {id:'p9',name:'Ponmo',price:1000,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:9,has_variants:false,variants:null},
  {id:'p10',name:'Turkey',price:4000,section:'proteins',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:10,has_variants:false,variants:null},
  // Grill Zone
  {id:'g1',name:'Asun',price:3000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'g2',name:'BBQ Catfish \u00d7 Fries',price:8000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'g3',name:'BBQ Chicken \u00d7 Chips',price:8000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'g4',name:'Chicken Burger',price:3500,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'g5',name:'Chicken Wings',price:2000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:5,has_variants:false,variants:null},
  {id:'g6',name:'Sharwarma',price:3000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:6,has_variants:false,variants:null},
  {id:'g7',name:'Sharwarma \u00d7 Combo',price:3500,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:7,has_variants:false,variants:null},
  {id:'g8',name:'GizDodo',price:3000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:8,has_variants:false,variants:null},
  {id:'g9',name:'WngsDodo',price:3000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:9,has_variants:false,variants:null},
  {id:'g10',name:'Isi Ewu',price:6000,section:'grill',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:10,has_variants:false,variants:null},
  // Swallow
  {id:'sw1',name:'Amala',price:1000,section:'swallow',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'sw2',name:'Poundo',price:1000,section:'swallow',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'sw3',name:'Semo',price:1000,section:'swallow',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'sw4',name:'Fufu',price:700,section:'swallow',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'sw5',name:'Eba',price:0,section:'swallow',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:5,has_variants:true,variants:[{name:'Eba (Small)',price:500},{name:'Eba (Big)',price:700}]},
  // Soups
  {id:'so1',name:'Efo Riro',price:1000,section:'soups',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'so2',name:'Egusi',price:1000,section:'soups',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'so3',name:'Okra',price:1000,section:'soups',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'so4',name:'Edikang Ikong',price:1500,section:'soups',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'so5',name:'Gbegiri',price:0,section:'soups',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:true,sort_order:5,has_variants:false,variants:null},
  {id:'so6',name:'Ewedu',price:0,section:'soups',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:true,sort_order:6,has_variants:false,variants:null},
  // Sides
  {id:'si1',name:'Salad',price:1000,section:'sides',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'si2',name:'Plantain',price:1000,section:'sides',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'si3',name:'Beans',price:500,section:'sides',tab:'food',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  // Drinks
  {id:'d1',name:'Water',price:400,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'d2',name:'Coke',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'d3',name:'Fanta',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'d4',name:'Sprite',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'d5',name:'Pepsi',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:5,has_variants:false,variants:null},
  {id:'d6',name:'Fearless',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:6,has_variants:false,variants:null},
  {id:'d7',name:'Predator',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:7,has_variants:false,variants:null},
  {id:'d8',name:'Zobo',price:700,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:8,has_variants:false,variants:null},
  {id:'d9',name:'Malt',price:800,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:9,has_variants:false,variants:null},
  {id:'d10',name:'Fayrouz',price:1000,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:10,has_variants:false,variants:null},
  {id:'d11',name:'5Alive Pulpy',price:2000,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:11,has_variants:false,variants:null},
  {id:'d12',name:'Schweppes',price:1000,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:12,has_variants:false,variants:null},
  {id:'d13',name:'Tiger Drink',price:1200,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:13,has_variants:false,variants:null},
  {id:'d14',name:'SmirnOff Ice',price:1200,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:14,has_variants:false,variants:null},
  {id:'d15',name:'Hollandia Yoghurt (Big)',price:3000,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:15,has_variants:false,variants:null},
  {id:'d16',name:'Hollandia Yoghurt (Med.)',price:1500,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:16,has_variants:false,variants:null},
  {id:'d17',name:'Monster Energy',price:1500,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:17,has_variants:false,variants:null},
  {id:'d18',name:'Chivita Active',price:2500,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:18,has_variants:false,variants:null},
  {id:'d19',name:'Chivita Exotic',price:2500,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:19,has_variants:false,variants:null},
  {id:'d20',name:'Chivita Red Grape',price:2800,section:'drinks',tab:'drinks',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:20,has_variants:false,variants:null},
  // Pastries
  {id:'pa1',name:"King's Roll",price:1000,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'pa2',name:'Doughnut',price:400,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  {id:'pa3',name:'Chicken Pie',price:1200,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:'House favourite',is_free:false,sort_order:3,has_variants:false,variants:null},
  {id:'pa4',name:'Meat Pie',price:1000,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:4,has_variants:false,variants:null},
  {id:'pa5',name:'Meat Pie \u2014 Small',price:400,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:5,has_variants:false,variants:null},
  {id:'pa6',name:'Beef Roll',price:400,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:6,has_variants:false,variants:null},

  // Lounge — Beers
  {id:'lb1',name:'Heineken',price:1800,section:'lounge-beers',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lb2',name:'Guinness Stout',price:2000,section:'lounge-beers',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Beverages
  {id:'lbev1',name:'Red Bull',price:2000,section:'lounge-beverages',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lbev2',name:'Schweppes Tonic',price:1200,section:'lounge-beverages',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Shots
  {id:'ls1',name:'Tequila Shot',price:3500,section:'lounge-shots',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'ls2',name:'Jagermeister Shot',price:3000,section:'lounge-shots',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Spirits
  {id:'lsp1',name:'Hennessy VS',price:80000,section:'lounge-spirits',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lsp2',name:'Jameson',price:30000,section:'lounge-spirits',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Champagne & Whiskey
  {id:'lcw1',name:'Moët & Chandon',price:120000,section:'lounge-champagne-whiskey',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lcw2',name:'Black Label',price:60000,section:'lounge-champagne-whiskey',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Wine
  {id:'lw1',name:'Four Cousins',price:18000,section:'lounge-wine',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lw2',name:'Andre Rose',price:22000,section:'lounge-wine',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Cocktails
  {id:'lc1',name:'Long Island',price:6000,section:'lounge-cocktails',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lc2',name:'Mojito',price:5500,section:'lounge-cocktails',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Mocktails
  {id:'lm1',name:'Virgin Mojito',price:4500,section:'lounge-mocktails',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lm2',name:'Sunrise Cooler',price:4000,section:'lounge-mocktails',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Bitters
  {id:'lbt1',name:'Origin Bitters',price:2500,section:'lounge-bitters',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lbt2',name:'Small Stout & Bitters Mix',price:3200,section:'lounge-bitters',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null},
  // Lounge — Foods
  {id:'lf1',name:'Peppered Goat Meat',price:7000,section:'lounge-foods',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:1,has_variants:false,variants:null},
  {id:'lf2',name:'Chicken Wings Basket',price:6500,section:'lounge-foods',tab:'lounge',menu_group:'lounge',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:2,has_variants:false,variants:null}
];
