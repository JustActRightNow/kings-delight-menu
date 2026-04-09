
  var authToken = null;
  var allItems  = [];
  var currentFilter = 'all';

  /* ── Auth ────────────────────────────────────────────────────────────── */
  async function doLogin() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var errEl = document.getElementById('loginError');
    var btn = document.getElementById('loginBtn');
    errEl.textContent = '';
    if (!email || !password) { errEl.textContent = 'Please enter email and password.'; return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    try {
      var res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });
      var data = await res.json();
      if (!res.ok) { throw new Error(data.error_description || data.msg || 'Login failed'); }
      authToken = data.access_token;
      sessionStorage.setItem('kd_admin_token', authToken);
      showAdmin();
    } catch (e) {
      errEl.textContent = e.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  }

  function doLogout() {
    authToken = null;
    sessionStorage.removeItem('kd_admin_token');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
  }

  function showAdmin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    switchAdminTab('menu');
  }

  function switchAdminTab(tab) {
    document.getElementById('menuPanel').style.display   = tab === 'menu'   ? '' : 'none';
    document.getElementById('ordersPanel').style.display = tab === 'orders' ? '' : 'none';
    document.getElementById('tabMenu').classList.toggle('active',   tab === 'menu');
    document.getElementById('tabOrders').classList.toggle('active', tab === 'orders');
    if (tab === 'menu' && allItems.length === 0) loadItems();
    if (tab === 'orders') loadOrders();
  }

  /* ── API Helpers ─────────────────────────────────────────────────────── */
  function apiHeaders(isWrite) {
    var h = { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + (isWrite ? authToken : SUPABASE_ANON) };
    if (isWrite) { h['Content-Type'] = 'application/json'; h['Prefer'] = 'return=representation'; }
    return h;
  }

  async function apiCall(method, path, body) {
    var res = await fetch(SUPABASE_URL + path, {
      method: method,
      headers: apiHeaders(method !== 'GET'),
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 204) return null;
    var data = await res.json();
    if (!res.ok) throw new Error((data && (data.message || data.msg)) || 'API error ' + res.status);
    return data;
  }

  /* ── Items CRUD ──────────────────────────────────────────────────────── */
  async function loadItems() {
    document.getElementById('itemList').innerHTML = '<div class="loading-msg">Loading menu…</div>';
    try {
      allItems = await apiCall('GET', '/rest/v1/menu_items?select=*&order=section.asc,sort_order.asc', null);
      updateStats();
      renderList();
    } catch (e) {
      document.getElementById('itemList').innerHTML = '<div class="empty-msg" style="color:#e05555">' + escHtml(e.message) + '</div>';
    }
  }

  async function toggleAvailability(id, newVal) {
    try {
      await apiCall('PATCH', '/rest/v1/menu_items?id=eq.' + encodeURIComponent(id), { available: newVal });
      var item = allItems.find(function(i) { return i.id === id; });
      if (item) item.available = newVal;
      updateStats();
      renderList();
      showToast(newVal ? 'Item marked available' : 'Marked out of stock');
    } catch (e) {
      showToast(e.message, true);
      /* Revert the toggle */
      loadItems();
    }
  }

  async function savePrice(id, newPrice) {
    try {
      await apiCall('PATCH', '/rest/v1/menu_items?id=eq.' + encodeURIComponent(id), { price: newPrice });
      var item = allItems.find(function(i) { return i.id === id; });
      if (item) item.price = newPrice;
      renderList();
      showToast('Price updated to \u20a6' + newPrice.toLocaleString());
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function deleteItem(id, name) {
    if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
    try {
      await apiCall('DELETE', '/rest/v1/menu_items?id=eq.' + encodeURIComponent(id), null);
      allItems = allItems.filter(function(i) { return i.id !== id; });
      updateStats();
      renderList();
      showToast('Item deleted');
    } catch (e) {
      showToast(e.message, true);
    }
  }

  async function addPromoItem() {
    var name     = document.getElementById('promoName').value.trim();
    var price    = parseInt(document.getElementById('promoPrice').value, 10);
    var section  = document.getElementById('promoSection').value;
    var expiry   = document.getElementById('promoExpiry').value || null;
    var sublabel = document.getElementById('promoSublabel').value.trim() || null;
    var isCombo  = document.getElementById('promoIsCombo').checked;
    var imageUrlInput = document.getElementById('promoImageUrl').value.trim() || null;
    var imageFile = document.getElementById('promoImageFile').files[0] || null;

    if (!name) { showToast('Item name is required', true); return; }
    if (isNaN(price) || price < 0) { showToast('Enter a valid price', true); return; }

    var isPromo = section === 'promos';
    var btn = document.getElementById('addPromoBtn');
    btn.disabled = true; btn.textContent = 'Adding…';
    try {
      var newItem = await apiCall('POST', '/rest/v1/menu_items', {
        name: name, price: price, section: section, tab: 'food',
        available: true, category_type: isPromo ? 'promo' : 'regular',
        promo_expires_at: isPromo ? expiry : null, combo: isCombo,
        sub_label: sublabel, is_free: false, sort_order: 0,
        has_variants: false, variants: null, image_url: imageUrlInput
      });
      var item = Array.isArray(newItem) ? newItem[0] : newItem;
      allItems.push(item);

      /* Upload image file if provided (uses the new item's UUID as filename) */
      if (imageFile && item && item.id) {
        btn.textContent = 'Uploading image…';
        try {
          var uploadedUrl = await uploadImageToStorage(imageFile, item.id);
          await apiCall('PATCH', '/rest/v1/menu_items?id=eq.' + encodeURIComponent(item.id), { image_url: uploadedUrl });
          item.image_url = uploadedUrl;
        } catch (imgErr) {
          showToast('Product added but image upload failed: ' + imgErr.message, true);
        }
      }

      updateStats();
      renderList();
      /* Clear form */
      ['promoName','promoPrice','promoExpiry','promoSublabel','promoImageUrl'].forEach(function(id) {
        document.getElementById(id).value = '';
      });
      document.getElementById('promoIsCombo').checked = false;
      document.getElementById('promoImageFile').value = '';
      showToast('Product added!');
    } catch (e) {
      showToast(e.message, true);
    } finally {
      btn.disabled = false; btn.textContent = 'Add Product';
    }
  }

  /* ── Rendering ───────────────────────────────────────────────────────── */
  var currentSearch = '';

  function doAdminSearch(q) {
    currentSearch = q.toLowerCase().trim();
    renderList();
  }

  function setFilter(f, btn) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderList();
  }

  function updateStats() {
    var today = todayMidnight();
    var total = allItems.length;
    var avail = allItems.filter(function(i) { return i.available; }).length;
    var oos   = total - avail;
    var promos = allItems.filter(function(i) {
      if (i.category_type !== 'promo') return false;
      if (i.promo_expires_at) { var exp = new Date(i.promo_expires_at); if (exp < today) return false; }
      return true;
    }).length;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statAvail').textContent = avail;
    document.getElementById('statOOS').textContent   = oos;
    document.getElementById('statPromo').textContent = promos;
  }

  function renderList() {
    var today = todayMidnight();
    var filtered = allItems.filter(function(item) {
      if (currentFilter === 'unavailable') { if (item.available) return false; }
      else if (currentFilter === 'promos') { if (item.category_type !== 'promo') return false; }
      if (currentSearch) {
        var haystack = (item.name + ' ' + (item.section || '') + ' ' + (item.sub_label || '')).toLowerCase();
        if (haystack.indexOf(currentSearch) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      document.getElementById('itemList').innerHTML = '<div class="empty-msg">No items match this filter.</div>';
      return;
    }

    /* Group by section */
    var sections = {};
    filtered.forEach(function(item) {
      var key = item.section;
      if (!sections[key]) sections[key] = [];
      sections[key].push(item);
    });

    var sectionLabels = {
      specials: "Chef's Specials", mains: 'Mains', proteins: 'Proteins',
      grill: 'Grill Zone', swallow: 'Swallow', soups: 'Soups', sides: 'Sides',
      drinks: 'Drinks', pastries: 'Pastries', promos: 'Promos'
    };

    var html = '';
    Object.keys(sections).forEach(function(sec) {
      html += '<div class="section-divider">' + (sectionLabels[sec] || sec) + '</div>';
      sections[sec].forEach(function(item) {
        var isPromo = item.category_type === 'promo';
        var isExpired = isPromo && item.promo_expires_at && new Date(item.promo_expires_at) < today;
        var expiryText = '';
        if (isPromo) {
          expiryText = item.promo_expires_at
            ? (isExpired ? '<span style="color:#e05555">Expired ' + escHtml(item.promo_expires_at) + '</span>'
                         : 'Expires ' + escHtml(item.promo_expires_at))
            : 'No expiry set';
        }
        /* Use data-id (UUID) for click handlers; user-controlled data stays in data-* attrs */
        var safeId   = escHtml(item.id);
        var safeName = escHtml(item.name);
        var priceDisplay = item.has_variants
          ? '<span style="font-size:11px;color:var(--cream-35)">Variants</span>'
          : '<div class="price-cell" id="priceCell_' + safeId + '">'
            + '<span class="price-display" title="Click to edit price" data-id="' + safeId + '" onclick="startPriceEdit(this.dataset.id)">'
            + '\u20a6' + item.price.toLocaleString()
            + '</span></div>';

        html += '<div class="item-row' + (item.available ? '' : ' unavailable') + '" id="row_' + safeId + '">';
        html += '<div class="img-cell" id="imgCell_' + safeId + '">';
        if (item.image_url) {
          html += '<img src="' + escHtml(item.image_url) + '" alt="" class="img-thumb" title="Click to change image" data-id="' + safeId + '" onclick="startImageEdit(this.dataset.id)">';
        } else {
          html += '<button class="img-add-btn" title="Add image" data-id="' + safeId + '" onclick="startImageEdit(this.dataset.id)">📷</button>';
        }
        html += '</div>';
        html += '<div class="item-row-info">';
        html += '<div class="item-row-name">' + safeName;
        if (isPromo) html += ' <span class="promo-badge">PROMO' + (item.combo ? ' · COMBO' : '') + '</span>';
        if (item.sub_label) html += ' <span style="font-size:11px;color:var(--cream-35);font-style:italic">' + escHtml(item.sub_label) + '</span>';
        html += '</div>';
        html += '<div class="item-row-meta"><span class="section-badge">' + escHtml(item.section) + '</span>';
        if (expiryText) html += expiryText;
        html += '</div>';
        html += '</div>';
        html += priceDisplay;
        html += '<div class="toggle-wrap">';
        html += '<label class="toggle"><input type="checkbox"' + (item.available ? ' checked' : '') + ' data-id="' + safeId + '" onchange="toggleAvailability(this.dataset.id, this.checked)"><span class="toggle-slider"></span></label>';
        html += '<span class="toggle-label">' + (item.available ? 'On' : 'Off') + '</span>';
        html += '</div>';
        html += '<button class="del-btn" title="Delete item" data-id="' + safeId + '" data-name="' + safeName + '" onclick="handleDelete(this)">&#x2715;</button>';
        html += '</div>';
      });
    });

    document.getElementById('itemList').innerHTML = html;
  }

  function handleDelete(btn) {
    deleteItem(btn.dataset.id, btn.dataset.name);
  }

  function startPriceEdit(id) {
    var cell = document.getElementById('priceCell_' + id);
    if (!cell) return;
    var item = allItems.find(function(i) { return i.id === id; });
    if (!item) return;
    var safeId = escHtml(id);
    cell.innerHTML =
      '<input class="price-input" id="priceInput_' + safeId + '" type="number" min="0" value="' + item.price + '" data-id="' + safeId + '" onkeydown="priceKeydown(event, this.dataset.id)">' +
      '<button class="price-save-btn" data-id="' + safeId + '" onclick="commitPrice(this.dataset.id)">Save</button>';
    var inp = document.getElementById('priceInput_' + id);
    if (inp) { inp.focus(); inp.select(); }
  }

  function priceKeydown(e, id) {
    if (e.key === 'Enter') commitPrice(id);
    if (e.key === 'Escape') renderList();
  }

  function commitPrice(id) {
    var inp = document.getElementById('priceInput_' + id);
    if (!inp) return;
    var val = parseInt(inp.value, 10);
    if (isNaN(val) || val < 0) { showToast('Enter a valid price', true); return; }
    savePrice(id, val);
  }

  /* ── Image upload / management ──────────────────────────────────────── */

  /**
   * Uploads an image file to Supabase Storage (bucket: menu-images).
   * Uses the item UUID as the filename base to allow overwriting.
   * @param {File} file - The image file to upload.
   * @param {string} itemId - The menu item UUID used as filename base.
   * @returns {Promise<string>} The public URL of the uploaded image.
   */
  async function uploadImageToStorage(file, itemId) {
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var filename = itemId + '.' + ext;
    var res = await fetch(SUPABASE_URL + '/storage/v1/object/menu-images/' + filename, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': 'Bearer ' + authToken,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'true'
      },
      body: file
    });
    if (!res.ok) {
      var errData = await res.json().catch(function() { return {}; });
      throw new Error(errData.message || errData.error || 'Upload failed (' + res.status + ')');
    }
    return SUPABASE_URL + '/storage/v1/object/public/menu-images/' + filename;
  }

  async function saveImageUrl(id, imageUrl) {
    try {
      await apiCall('PATCH', '/rest/v1/menu_items?id=eq.' + encodeURIComponent(id), { image_url: imageUrl || null });
      var item = allItems.find(function(i) { return i.id === id; });
      if (item) item.image_url = imageUrl || null;
      renderList();
      showToast(imageUrl ? 'Image saved' : 'Image removed');
    } catch (e) {
      showToast(e.message, true);
    }
  }

  function startImageEdit(id) {
    var cell = document.getElementById('imgCell_' + id);
    if (!cell) return;
    var item = allItems.find(function(i) { return i.id === id; });
    var safeId = escHtml(id);
    var currentUrl = escHtml((item && item.image_url) || '');
    cell.innerHTML =
      '<div class="img-edit-form">' +
        '<input type="file" id="imgFile_' + safeId + '" accept="image/jpeg,image/png,image/webp,image/gif" style="width:100%;font-size:11px;margin-bottom:4px">' +
        '<div style="font-size:10px;color:var(--cream-35);margin-bottom:3px">or paste image URL:</div>' +
        '<input type="text" id="imgUrl_' + safeId + '" placeholder="https://…" value="' + currentUrl + '" ' +
          'style="width:100%;padding:3px 6px;font-size:11px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:4px;color:var(--cream)">' +
        '<div class="img-edit-actions">' +
          '<button id="imgSaveBtn_' + safeId + '" class="price-save-btn" data-id="' + safeId + '" onclick="commitImage(this.dataset.id)">Save</button>' +
          (currentUrl ? '<button class="price-save-btn img-remove-btn" data-id="' + safeId + '" onclick="removeImage(this.dataset.id)">Remove</button>' : '') +
          '<button class="price-save-btn img-cancel-btn" onclick="renderList()">Cancel</button>' +
        '</div>' +
      '</div>';
  }

  async function commitImage(id) {
    var fileInput = document.getElementById('imgFile_' + id);
    var urlInput  = document.getElementById('imgUrl_' + id);
    var saveBtn   = document.getElementById('imgSaveBtn_' + id);

    if (fileInput && fileInput.files.length > 0) {
      saveBtn.disabled = true; saveBtn.textContent = 'Uploading…';
      try {
        var url = await uploadImageToStorage(fileInput.files[0], id);
        await saveImageUrl(id, url);
      } catch (e) {
        showToast(e.message, true);
        saveBtn.disabled = false; saveBtn.textContent = 'Save';
      }
    } else {
      var url = urlInput ? urlInput.value.trim() : '';
      await saveImageUrl(id, url || null);
    }
  }

  async function removeImage(id) {
    if (!confirm('Remove image from this item?')) return;
    await saveImageUrl(id, null);
  }

  /* ── Orders Inbox ────────────────────────────────────────────────────── */

  async function loadOrders() {
    document.getElementById('orderList').innerHTML = '<div class="loading-msg">Loading orders…</div>';
    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/orders?select=*&order=created_at.desc&limit=100', {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + authToken }
      });
      if (!res.ok) {
        var err = await res.json().catch(function() { return {}; });
        throw new Error(err.message || err.msg || 'Failed to load orders (' + res.status + ')');
      }
      var orders = await res.json();
      renderOrders(orders || []);
    } catch (e) {
      document.getElementById('orderList').innerHTML =
        '<div class="empty-msg" style="color:#e05555">' + escHtml(e.message) +
        '<br><span style="font-size:11px;opacity:0.7">If the orders table is missing, run ' +
        '<code>supabase-schema.sql</code> (new project) or ' +
        '<code>migrations/003_add_orders_table.sql</code> (existing project) ' +
        'in the Supabase SQL Editor.</span></div>';
    }
  }

  function renderOrders(orders) {
    if (orders.length === 0) {
      document.getElementById('orderList').innerHTML =
        '<div class="empty-msg">No orders yet.</div>' +
        '<div class="empty-msg" style="font-size:11px;margin-top:8px;color:var(--cream-35)">' +
        'Expecting orders? To set up the orders table, run <code>supabase-schema.sql</code> ' +
        'in your Supabase SQL Editor (new projects), or run ' +
        '<code>migrations/003_add_orders_table.sql</code> if you already have the menu table ' +
        'and only need to add orders.' +
        '</div>';
      return;
    }

    var typeLabel = { 'eat-in': 'Eat-in', 'take-out': 'Take-out', 'delivery': 'Delivery' };

    var html = '';
    orders.forEach(function(o) {
      var items = [];
      if (Array.isArray(o.items)) {
        o.items.forEach(function(i) {
          items.push((i.free ? '🔸 ' : '') + escHtml(i.name) + (i.qty > 1 ? ' ×' + i.qty : ''));
        });
      }
      var dt = o.created_at ? new Date(o.created_at) : null;
      var dtStr = dt ? dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
      var tLabel = typeLabel[o.order_type] || escHtml(o.order_type || '—');
      var typeClass = o.order_type === 'take-out' ? 'order-badge-takeout' : o.order_type === 'delivery' ? 'order-badge-delivery' : 'order-badge-eatin';

      html += '<div class="order-card">';
      html += '<div class="order-card-header">';
      html += '<span class="order-ref">' + escHtml(o.ref_code || '——') + '</span>';
      html += '<span class="order-badge ' + typeClass + '">' + tLabel + '</span>';
      html += '<span class="order-customer">' + escHtml(o.customer || 'Guest') + '</span>';
      html += '<span class="order-total">₦' + (o.total || 0).toLocaleString() + '</span>';
      html += '<span class="order-time">' + dtStr + '</span>';
      html += '</div>';
      if (items.length) {
        html += '<div class="order-items">' + items.join(' · ') + '</div>';
      }
      if (o.note) {
        html += '<div class="order-note">📝 ' + escHtml(o.note) + '</div>';
      }
      html += '</div>';
    });

    document.getElementById('orderList').innerHTML = html;
  }

  /* ── Utilities ───────────────────────────────────────────────────────── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function todayMidnight() {
    var d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }

  var toastTimer;
  function showToast(msg, isError) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show' + (isError ? ' error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { el.className = 'toast'; }, 2800);
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function() {
    /* Allow Enter key to submit login */
    document.getElementById('loginPassword').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doLogin();
    });
    document.getElementById('loginEmail').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('loginPassword').focus();
    });
    /* Restore session — validate token with a lightweight test request */
    var saved = sessionStorage.getItem('kd_admin_token');
    if (saved) {
      fetch(SUPABASE_URL + '/rest/v1/menu_items?select=id&limit=1', {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + saved }
      }).then(function(res) {
        if (res.ok) { authToken = saved; showAdmin(); }
        else { sessionStorage.removeItem('kd_admin_token'); }
      }).catch(function() { sessionStorage.removeItem('kd_admin_token'); });
    }
  });


  /* Set favicon to logo */
  (function() {
    var logoImg = document.querySelector('.login-crown img');
    var favicon = document.querySelector("link[rel='icon']");
    if (logoImg && favicon) {
      favicon.href = logoImg.src;
      favicon.type = 'image/png';
    }
  })();
