
  const WA = '2347060988973';
  const PACK_PRICE = 400;

  /* ── Supabase Config ────────────────────────────────────────────────────────
   * 1. Create a free project at https://supabase.com
   * 2. Run supabase-schema.sql in your project's SQL Editor
   * 3. Go to Settings → API and replace the values below
   * ─────────────────────────────────────────────────────────────────────────*/
  const SUPABASE_URL  = 'https://prutxziffstjugltzpfq.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydXR4emlmZnN0anVnbHR6cGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzA4OTQsImV4cCI6MjA5MTE0Njg5NH0.IffutYFwi1lQySpf3Wp9LqFpB4WtGKkHW-uz3m2q9EY';
  const SUPABASE_CONFIGURED = SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1;

  /* ── Static fallback — used when Supabase is not yet configured ─────────── */
  const FALLBACK_MENU = [
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
    {id:'pa6',name:'Beef Roll',price:400,section:'pastries',tab:'pastries',available:true,category_type:'regular',promo_expires_at:null,combo:false,sub_label:null,is_free:false,sort_order:6,has_variants:false,variants:null}
  ];

  /* ── Menu Rendering ─────────────────────────────────────────────────────── */
  async function fetchMenuFromSupabase() {
    var res = await fetch(
      SUPABASE_URL + '/rest/v1/menu_items?select=*&order=sort_order.asc',
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON } }
    );
    if (!res.ok) throw new Error('Supabase error ' + res.status);
    return res.json();
  }

  function renderSectionItems(section, items) {
    /* Remove previous item rows (keep structural child elements) */
    var toRemove = [];
    for (var c = 0; c < section.children.length; c++) {
      var child = section.children[c];
      if (!child.classList.contains('section-header') &&
          !child.classList.contains('specials-note') &&
          !child.classList.contains('promo-note')) {
        toRemove.push(child);
      }
    }
    toRemove.forEach(function(el) { section.removeChild(el); });

    items.forEach(function(item) {
      var div = document.createElement('div');
      div.className = 'menu-item' + (item.available ? '' : ' item-unavailable');
      var nameHtml = item.sub_label
        ? escHtml(item.name) + '<span class="item-sub">' + escHtml(item.sub_label) + '</span>'
        : escHtml(item.name);
      if (item.category_type === 'promo' && item.combo) {
        nameHtml += '<span class="combo-tag">Combo</span>';
      }

      if (item.has_variants && item.variants) {
        var varBtns = item.variants.map(function(v) {
          var label = v.name.replace(/^[^(]*\(/, '').replace(/\).*$/, '').trim() || v.name;
          var dis = item.available ? '' : ' disabled';
          return '<button class="variant-btn"' + dis + ' data-name="' + escHtml(v.name) +
            '" data-price="' + v.price + '" onclick="addItem(this)">' +
            escHtml(label) + ' \u00a0\u20a6' + v.price.toLocaleString() + '</button>';
        }).join('');
        div.innerHTML = '<div class="item-info"><div class="item-name">' + escHtml(item.name) + '</div></div>' +
          (item.available ? '<div class="variant-group">' + varBtns + '</div>' : '<span class="oos-badge">Out of Stock</span>');
      } else if (item.is_free) {
        div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
          '<span class="free-label">Complimentary</span>' +
          '<button class="add-btn" data-name="' + escHtml(item.name) + '" data-price="0" data-free="true" onclick="addItem(this)">+</button>';
      } else if (!item.available) {
        div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
          '<span class="oos-badge">Out of Stock</span>' +
          '<button class="add-btn" disabled>+</button>';
      } else {
        div.innerHTML = '<div class="item-info"><div class="item-name">' + nameHtml + '</div></div>' +
          '<div class="item-price"><span class="cur">\u20a6</span>' + item.price.toLocaleString() + '</div>' +
          '<button class="add-btn" data-name="' + escHtml(item.name) + '" data-price="' + item.price + '" onclick="addItem(this)">+</button>';
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

  /* Plates-based cart */
  let plates = [{ id: 1, items: [] }];
  let activePlateIndex = 0;
  let nextPlateId = 2;
  let orderType = 'eat-in';

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
    const map = { packaging: 'Takeaway Packaging', instagram: 'Instagram', flyer: 'Flyer / Ad', direct: 'Walk-in' };
    return map[s] || s.replace(/-/g, ' ').replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  /* Plate helpers */
  function getActivePlate() { return plates[activePlateIndex]; }
  function hasItems() { return plates.some(p => p.items.length > 0); }
  function subtotal() {
    return plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + (i.free ? 0 : i.price * i.qty), 0), 0);
  }
  function nonEmptyPlateCount() { return plates.filter(p => p.items.length > 0).length; }
  function packagingCost() { return orderType === 'take-out' ? PACK_PRICE * nonEmptyPlateCount() : 0; }
  function grandTotal() { return subtotal() + packagingCost(); }
  function totalItemCount() {
    return plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.qty, 0), 0);
  }

  /* Cart logic */
  function addItem(btn) {
    const name = btn.dataset.name, price = parseInt(btn.dataset.price);
    const isFree = btn.dataset.free === 'true';
    const plate = getActivePlate();
    const ex = plate.items.find(i => i.name === name);
    if (ex) { if (!isFree) ex.qty++; }
    else { plate.items.push({ name, price, qty: 1, free: isFree }); }
    renderAll();
  }

  function changePlateItemQty(pIdx, iIdx, d) {
    const items = plates[pIdx].items;
    items[iIdx].qty += d;
    if (items[iIdx].qty <= 0) items.splice(iIdx, 1);
    if (items.length === 0 && plates.length > 1) { deletePlate(pIdx); return; }
    renderAll();
  }

  function addNewPlate() {
    plates.push({ id: nextPlateId++, items: [] });
    activePlateIndex = plates.length - 1;
    renderAll();
    closeCart();
  }

  function duplicatePlate(idx) {
    const p = plates[idx];
    plates.splice(idx + 1, 0, { id: nextPlateId++, items: p.items.map(i => ({ ...i })) });
    renderAll();
  }

  function deletePlate(idx) {
    if (plates.length === 1) {
      plates[0].items = [];
      activePlateIndex = 0;
    } else {
      plates.splice(idx, 1);
      if (activePlateIndex >= plates.length) activePlateIndex = plates.length - 1;
    }
    renderAll();
  }

  function editPlate(idx) {
    activePlateIndex = idx;
    renderAll();
    closeCart();
  }

  /* Order type */
  function setOrderType(type) {
    orderType = type;
    document.getElementById('otEatIn').classList.toggle('active', type === 'eat-in');
    document.getElementById('otTakeOut').classList.toggle('active', type === 'take-out');
    renderCartPanel();
    const t = '\u20a6' + grandTotal().toLocaleString();
    document.getElementById('cpTotal').textContent = t;
    document.getElementById('cartTotalBar').textContent = t;
  }

  /* Render functions */
  function renderAll() {
    const count = totalItemCount();
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartTotalBar').textContent = '\u20a6' + grandTotal().toLocaleString();
    document.getElementById('cartBar').classList.toggle('visible', hasItems());

    const activePlate = getActivePlate();
    const plateNum = activePlateIndex + 1;
    const preview = activePlate.items.length
      ? activePlate.items.map(i => (i.qty > 1 ? i.qty + '\u00d7 ' : '') + i.name).join(', ')
      : 'Your order';
    document.getElementById('cartPreview').textContent = plates.length > 1 ? plates.length + ' plates' : preview;
    document.getElementById('plateIndicator').textContent = hasItems() ? 'Adding to Plate ' + plateNum : '';
    renderCartPanel();
  }

  function renderCartPanel() {
    const list = document.getElementById('cpItems');
    if (!hasItems()) {
      list.innerHTML = '<p class="empty-msg">No items yet \u2014 add something from the menu</p>';
      document.getElementById('cpTotal').textContent = '\u20a6' + grandTotal().toLocaleString();
      return;
    }
    let html = '';
    plates.forEach(function(plate, pIdx) {
      if (!plate.items.length) return;
      const isActive = pIdx === activePlateIndex;
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
    if (orderType === 'take-out') {
      const n = nonEmptyPlateCount();
      html += '<div class="pack-row"><span>Packaging \u00d7 ' + n + ' plate' + (n > 1 ? 's' : '') + '</span><span>\u20a6' + (PACK_PRICE * n).toLocaleString() + '</span></div>';
    }
    list.innerHTML = html;
    document.getElementById('cpTotal').textContent = '\u20a6' + grandTotal().toLocaleString();
  }

  function openCart() { document.getElementById('cartPanel').classList.add('open'); }
  function closeCart() { document.getElementById('cartPanel').classList.remove('open'); }

  function openCheckout() {
    if (!hasItems()) return;
    renderCheckout();
    document.getElementById('checkoutPanel').classList.add('open');
  }
  function closeCheckout() { document.getElementById('checkoutPanel').classList.remove('open'); }

  function renderCheckout() {
    let html = '<p class="checkout-section-title">Order Summary</p>';
    plates.forEach(function(plate, pIdx) {
      if (!plate.items.length) return;
      const hasMulti = plates.filter(p => p.items.length).length > 1;
      if (hasMulti) html += '<p class="checkout-plate-label">Plate ' + (pIdx + 1) + '</p>';
      plate.items.forEach(function(item) {
        const label = (item.qty > 1 ? item.qty + '\u00d7 ' : '') + item.name;
        const amt = item.free ? 'Free' : '\u20a6' + (item.price * item.qty).toLocaleString();
        html += '<div class="checkout-summary-item"><span>' + escHtml(label) + '</span><span class="item-amt">' + escHtml(amt) + '</span></div>';
      });
    });
    if (orderType === 'take-out') {
      const n = nonEmptyPlateCount();
      html += '<div class="checkout-summary-item" style="margin-top:6px"><span>📦 Packaging \u00d7 ' + n + ' plate' + (n > 1 ? 's' : '') + '</span><span class="item-amt">\u20a6' + (PACK_PRICE * n).toLocaleString() + '</span></div>';
    }
    html += '<div class="co-total-row"><span class="co-total-label">Total</span><span class="co-total-amt">\u20a6' + grandTotal().toLocaleString() + '</span></div>';
    document.getElementById('checkoutBody').innerHTML = html;
  }

  /* HTML escaping for safe attribute/content injection */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Sanitization */
  function sanitizeInput(s) {
    return s
      .replace(/<[^>]*>/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/[\n\r]{3,}/g, '\n\n')
      .replace(/https?:\/\/\S+/gi, '[link]')
      .slice(0, 300)
      .trim();
  }

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

  function orderCode(total, itemCount) {
    const raw = ((total * 37 + itemCount * 7919) ^ 0xABCD) % 1000000;
    return String(raw).padStart(6, '0');
  }

  function sendToWhatsApp() {
    if (!hasItems()) return;
    const total = grandTotal();
    const itemCount = plates.reduce((s, p) => s + p.items.reduce((ss, i) => ss + (i.free ? 0 : i.qty), 0), 0);
    const code = orderCode(total, itemCount);

    const coNameEl = document.getElementById('coName');
    const coNoteEl = document.getElementById('coNote');
    const customerName = sanitizeInput(coNameEl ? coNameEl.value.trim() : '');
    const note = sanitizeInput(coNoteEl ? coNoteEl.value.trim() : '');
    const tableNo = localStorage.getItem('kd_table');
    const typeLabel = orderType === 'take-out' ? '\uD83E\uDD61 Take Out' : '\uD83C\uDF7D\uFE0F Eat In';

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
    plates.forEach(function(plate, pIdx) {
      if (!plate.items.length) return;
      const hasMultiplePlates = plates.filter(p => p.items.length).length > 1;
      if (hasMultiplePlates) msg += "*Plate " + (pIdx + 1) + "*\n";
      plate.items.forEach(function(i) {
        const line = i.free
          ? '\u2022 ' + i.name + ' \u2014 Free'
          : '\u2022 ' + (i.qty > 1 ? i.qty + '\u00D7 ' : '') + i.name + ' \u2014 \u20A6' + (i.price * i.qty).toLocaleString();
        msg += line + "\n";
        allItemLines.push(line);
      });
    });

    if (orderType === 'take-out') {
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
      type: orderType,
      source: fmtSrc(src),
      table: tableNo || '',
      items: allItemLines.join('; '),
      total: total,
      note: note
    });

    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
  }

  /* Tab switching */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const catNav = document.getElementById('catNav');
  const searchWrap = document.getElementById('searchWrap');
  let activeTabPane = 'tabFood';

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTabPane = btn.dataset.pane;
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(btn.dataset.pane).classList.add('active');
      const isFood = btn.dataset.tab === 'food';
      catNav.classList.toggle('hidden', !isFood);
      searchWrap.classList.toggle('food-active', isFood);
      document.getElementById('searchInput').value = '';
      doSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* Search — searches across all tabs when a query is active */
  function doSearch(q) {
    const qLower = q.toLowerCase().trim();
    if (!qLower) {
      /* Restore: show only the active tab pane, hide others */
      document.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.toggle('active', pane.id === activeTabPane);
        pane.querySelectorAll('.menu-item').forEach(function(item) { item.style.display = ''; });
        pane.querySelectorAll('.menu-section').forEach(function(sec) { sec.style.display = ''; });
      });
      catNav.classList.toggle('hidden', activeTabPane !== 'tabFood');
      return;
    }
    /* Show all panes while searching */
    document.querySelectorAll('.tab-pane').forEach(function(pane) {
      pane.classList.add('active');
      pane.querySelectorAll('.menu-item').forEach(function(item) {
        const text = item.querySelector('.item-name').textContent.toLowerCase();
        item.style.display = text.includes(qLower) ? '' : 'none';
      });
      pane.querySelectorAll('.menu-section').forEach(function(sec) {
        const hasVisible = Array.from(sec.querySelectorAll('.menu-item')).some(i => i.style.display !== 'none');
        sec.style.display = hasVisible ? '' : 'none';
      });
    });
    catNav.classList.add('hidden');
  }

  document.getElementById('searchInput').addEventListener('input', function() {
    doSearch(this.value);
  });

  /* Food sub-nav scroll */
  const foodSections = document.querySelectorAll('#tabFood .menu-section');
  const subNavBtns = document.querySelectorAll('.cat-btn');

  subNavBtns.forEach(b => b.addEventListener('click', function() {
    const el = document.getElementById(b.dataset.target);
    if (el) {
      const catNavH = catNav.classList.contains('hidden') ? 0 : catNav.offsetHeight;
      const searchH = searchWrap ? searchWrap.offsetHeight : 0;
      const navH = document.getElementById('tabNav').offsetHeight + catNavH + searchH;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 14, behavior: 'smooth' });
    }
  }));

  /* IntersectionObserver for food section active highlight */
  const activeObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      subNavBtns.forEach(b => b.classList.remove('active'));
      const a = document.querySelector('.cat-btn[data-target="' + e.target.id + '"]');
      if (a) {
        a.classList.add('active');
        const btnRect = a.getBoundingClientRect();
        const navRect = catNav.getBoundingClientRect();
        catNav.scrollTo({ left: catNav.scrollLeft + btnRect.left - navRect.left - (navRect.width - btnRect.width) / 2, behavior: 'smooth' });
      }
    }
  }), { rootMargin: '-15% 0px -75% 0px' });
  foodSections.forEach(s => activeObserver.observe(s));

  /* Fade-in observer */
  const allSections = document.querySelectorAll('.menu-section');
  const fadeObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }), { threshold: 0.06 });
  allSections.forEach(s => fadeObserver.observe(s));

  /* Initial render */
  renderAll();

  /* Persist customer name */
  (function() {
    var nameEl = document.getElementById('coName');
    if (nameEl) {
      nameEl.value = localStorage.getItem('kd_customer_name') || '';
      var debounce;
      nameEl.addEventListener('input', function() {
        clearTimeout(debounce);
        debounce = setTimeout(function() {
          localStorage.setItem('kd_customer_name', nameEl.value.trim());
        }, 400);
      });
    }
  })();

  /* Load menu from Supabase (or static fallback) */
  loadMenu();

  /* Set favicon to logo */
  (function() {
    var logoImg = document.querySelector('.hero-logo img');
    var favicon = document.querySelector("link[rel='icon']");
    if (logoImg && favicon) {
      favicon.href = logoImg.src;
      favicon.type = 'image/png';
    }
  })();
