/* ============================================================
   StockSense — Inventory Management System (v4, cinematic landing)
   Client-side, self-contained, localStorage-backed.
   ============================================================ */

const DB_KEY = 'stocksense_db_v1';
const SESSION_KEY = 'stocksense_session_v1';
const THEME_KEY = 'stocksense_theme_v1';
const ACCENT_KEY = 'stocksense_accent_v1';
const TOUR_SEEN_KEY = 'stocksense_tour_seen_v1';

let db = null;
let currentView = 'dashboard';
let docViewMode = { receipt: 'table', delivery: 'table', transfer: 'table' };

/* ---------------------------------------------------------
   Team & content data
   --------------------------------------------------------- */
const TEAM = [
  {
    name: 'Aryan Das', role: 'BTech CSE · LPU',
    photo: 'WhatsApp Image 2026-09-26 at 3.43.02 AM.jpeg',
    bio: 'Builds the end-to-end product logic — from the receipts/deliveries workflow to the stock ledger engine powering this app.',
    skills: ['HTML','CSS','JavaScript','Python','PHP','SQL'],
    linkedin: 'https://in.linkedin.com/in/aryandas-iit',
    github: 'https://github.com/AryanDas20',
    linkedinDisabled: false
  },
  {
    name: 'Pranay Kathpaul', role: 'BTech CSE · LPU',
    photo: 'WhatsApp Image 2026-09-26 at 3.41.05 AM.jpeg',
    bio: 'Focused on the interface and interaction design — the dashboard, filters and the details that make the app feel effortless to use.',
    skills: ['HTML','CSS','JavaScript','UI/UX'],
    linkedin: 'https://www.linkedin.com/in/pranay-kathpaul-633600407/',
    github: 'https://github.com/pranaykathpaul2008-ctrl',
    linkedinDisabled: false
  },
  {
    name: 'Manas kumar', role: 'BTech CSE · LPU',
    photo: 'WhatsApp Image 2026-09-26 at 10.33.05 PM.jpeg',
    bio: 'Works on data structure and reliability — keeping every receipt, transfer and adjustment consistent across the ledger.',
    skills: ['HTML','CSS','JavaScript','SQL'],
    linkedin: '#',
    github: 'https://github.com/Chandan77480',
    linkedinDisabled: true
  }
];

const TIPS = [
  { ic:'⌘', title:'Command palette', text:'Press Ctrl+K (Cmd+K on Mac) anywhere in the app to jump straight to any page, product or action.' },
  { ic:'/', title:'Instant search', text:'Press "/" to focus the search bar and filter products or documents without touching your mouse.' },
  { ic:'📊', title:'Live analytics', text:'The Analytics page turns your ledger into animated charts — category totals, status mix and 7-day activity.' },
  { ic:'🗂️', title:'Board view', text:'Switch any document list to a drag-and-drop board and move receipts, deliveries or transfers through their stages visually.' },
  { ic:'🎨', title:'Pick your accent', text:'Click the palette icon in the top bar to recolor the whole app to your favorite accent, saved for next time.' },
  { ic:'🏆', title:'Achievements', text:'Unlock badges as you validate documents and grow your catalog — check your progress from your profile page.' },
];

const KEYBOARD_SHORTCUTS = [
  { keys:['Ctrl','K'], label:'Open command palette' },
  { keys:['/'], label:'Focus search bar' },
  { keys:['1','-','7'], label:'Jump to sidebar page 1–7' },
  { keys:['T'], label:'Toggle light / dark theme' },
  { keys:['S'], label:'Take a screenshot' },
  { keys:['G'], label:'Start the guided tour' },
  { keys:['?'], label:'Open this shortcuts panel' },
  { keys:['Esc'], label:'Close any open overlay' },
];

const TOUR_STEPS = [
  { selector: '.sidebar-brand', title:'Welcome to StockSense', text:'This is your inventory command centre. This short tour covers every page and feature in the app — dashboard, analytics, stock operations, search, exports and shortcuts.' },
  { selector: '[data-view="dashboard"]', title:'Dashboard', text:'Your landing page after login. It shows live KPIs — total products, low/out of stock counts, pending receipts and deliveries — plus a filterable feed of every recent document, by type, status, warehouse or category.' },
  { selector: '[data-view="analytics"]', title:'Analytics', text:'Animated charts built straight from your ledger: stock by category, document status mix, a 7-day activity trend, and your unlocked achievement badges.' },
  { selector: '[data-view="products"]', title:'Products', text:'The full catalog: SKU, category, unit of measure, reorder point, and stock broken down per warehouse. Click "New product" to add one, or "Edit" on any row to update stock and reorder rules.' },
  { selector: '[data-view="receipts"]', title:'Receipts', text:'Log incoming stock from a supplier. A receipt starts as a Draft, moves through Waiting and Ready, and once you click Validate, stock increases automatically and the movement is written to the ledger. Try the "Board" toggle for a drag-and-drop view.' },
  { selector: '[data-view="deliveries"]', title:'Delivery orders', text:'The mirror of receipts — outgoing stock to a customer. Pick, pack and validate; the app blocks validation if you don\u2019t actually have enough stock to ship.' },
  { selector: '[data-view="transfers"]', title:'Internal transfers', text:'Move stock between warehouses or locations without changing your total count — e.g. Main Warehouse to Production Floor. Every transfer is logged both ways in the ledger.' },
  { selector: '[data-view="adjustments"]', title:'Stock adjustments', text:'Reconcile what the system thinks you have against a physical count. Enter the counted quantity and the app calculates and logs the difference automatically.' },
  { selector: '[data-view="ledger"]', title:'Move history', text:'The single source of truth — every validated movement across every document type, filterable by type or by product, in chronological order.' },
  { selector: '[data-view="settings"]', title:'Settings', text:'Add and manage warehouses or locations. Every new warehouse automatically gets a stock column on every product.' },
  { selector: '#global-search', title:'Global search', text:'Search by product name or SKU at any time. Press "/" to jump straight into this box from anywhere.' },
  { selector: '#cmdk-btn', title:'Command palette', text:'The fastest way around the app. Press Ctrl+K (or Cmd+K) to search pages, products and quick actions like "New receipt" or "Toggle theme" — all keyboard-driven.' },
  { selector: '#accent-btn', title:'Accent color', text:'Pick a new accent color for the whole interface — it\u2019s remembered for next time you visit.' },
  { selector: '#notif-btn', title:'Notifications', text:'A live feed of anything that needs attention — out-of-stock and low-stock alerts, plus documents waiting on you.' },
  { selector: '#screenshot-btn', title:'Screenshot export', text:'Captures the current screen as a downloadable PNG, automatically stamped with your name and the export time.' },
  { selector: '#pdf-btn', title:'PDF guide export', text:'Generates a full multi-page PDF explaining the whole concept from the ground up, plus a live snapshot of your current inventory — personalised with your name.' },
  { selector: '#theme-toggle', title:'Light / dark mode', text:'Switch themes any time. Your preference is saved for next time you open the app.' },
  { selector: '#shortcuts-btn', title:'Keyboard shortcuts', text:'Opens the full list of shortcuts — or just press "?" from anywhere in the app.' },
  { selector: '#profile-btn', title:'Your profile & logout', text:'View your account details, your achievement badges, or sign out from here. That\u2019s the full tour — you\u2019re ready to go!' },
];

const ACCENTS = [
  { name:'Violet', hex:'#6C4DF6', tint:'#EEE9FE' },
  { name:'Aqua',   hex:'#12C6B8', tint:'#DFF8F4' },
  { name:'Coral',  hex:'#FF5D7A', tint:'#FFE3E8' },
  { name:'Amber',  hex:'#FFA53E', tint:'#FFEFDA' },
  { name:'Blue',   hex:'#3B82F6', tint:'#E1EEFF' },
  { name:'Pink',   hex:'#EC4899', tint:'#FCE4F1' },
];

const ACHIEVEMENTS = [
  { id:'first_receipt',    name:'Dock Master',  ic:'📦', desc:'Validate your first receipt.' },
  { id:'first_delivery',   name:'Ship It',      ic:'🚚', desc:'Validate your first delivery order.' },
  { id:'first_transfer',   name:'Mover',        ic:'🔀', desc:'Validate your first internal transfer.' },
  { id:'first_adjustment', name:'Auditor',      ic:'🧮', desc:'Validate your first stock adjustment.' },
  { id:'cataloger',        name:'Cataloger',    ic:'🗂️', desc:'Add a brand-new product to the catalog.' },
  { id:'expander',         name:'Expander',     ic:'🏭', desc:'Add a new warehouse or location.' },
  { id:'ledger_pro',       name:'Ledger Pro',   ic:'🏆', desc:'Validate 10 documents in total.' },
];

/* ---------------------------------------------------------
   Utilities
   --------------------------------------------------------- */
function uid(prefix){ return prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
function docNo(prefix, seqKey){
  db.sequences[seqKey] = (db.sequences[seqKey] || 0) + 1;
  return prefix + '/' + String(db.sequences[seqKey]).padStart(4, '0');
}
function fmtDate(ts){
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month:'short', day:'2-digit', year:'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function initialsOf(name){ return (name||'?').split(' ').map(w=>w[0]).filter(Boolean).slice(0,2).join('').toUpperCase(); }
function save(){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

function toast(msg, kind){
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  let cls = '', icon = 'ℹ️';
  if (kind === true || kind === 'error'){ cls = ' toast-error'; icon = '⛔'; }
  else if (kind === 'success'){ cls = ' toast-success'; icon = '✅'; }
  el.className = 'toast' + cls;
  el.innerHTML = `<span class="toast-ic">${icon}</span><span>${escapeHtml(msg)}</span><span class="toast-bar"></span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-leaving');
    setTimeout(() => el.remove(), 260);
  }, 3200);
}
function isTypingTarget(el){
  return el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}
function emptyRow(colspan, icon, title, sub){
  return `<tr class="empty-row"><td colspan="${colspan}"><div class="empty-state">
    <div class="empty-state-ic">${icon}</div>
    <div class="empty-state-title">${escapeHtml(title)}</div>
    <div class="empty-state-sub">${escapeHtml(sub)}</div>
  </div></td></tr>`;
}

/* ---------------------------------------------------------
   Seed data
   --------------------------------------------------------- */
function seedDb(){
  const warehouses = [
    { id:'wh-main', name:'Main Warehouse', code:'MAIN' },
    { id:'wh-prod', name:'Production Floor', code:'PROD' },
    { id:'wh-2', name:'Warehouse 2', code:'WH2' },
  ];
  const categories = ['Raw Materials','Hardware','Furniture','Packaging'];
  function stockAcross(main, prod, wh2){ return { 'wh-main': main||0, 'wh-prod': prod||0, 'wh-2': wh2||0 }; }

  const products = [
    { id: uid('P'), sku:'STL-ROD-08', name:'Steel Rods (8mm)', category:'Raw Materials', uom:'kg', reorderPoint:80, stock: stockAcross(120, 20, 0) },
    { id: uid('P'), sku:'STL-SHT-02', name:'Steel Sheet 2mm', category:'Raw Materials', uom:'pcs', reorderPoint:15, stock: stockAcross(8, 0, 4) },
    { id: uid('P'), sku:'CHR-OAK-01', name:'Oak Chair', category:'Furniture', uom:'pcs', reorderPoint:10, stock: stockAcross(34, 0, 6) },
    { id: uid('P'), sku:'CHR-OAK-02', name:'Oak Chair — Armrest', category:'Furniture', uom:'pcs', reorderPoint:10, stock: stockAcross(4, 0, 0) },
    { id: uid('P'), sku:'BLT-M8-40', name:'Bolt M8x40', category:'Hardware', uom:'pcs', reorderPoint:200, stock: stockAcross(560, 0, 120) },
    { id: uid('P'), sku:'BOX-CB-L', name:'Corrugated Box (L)', category:'Packaging', uom:'pcs', reorderPoint:100, stock: stockAcross(40, 0, 10) },
    { id: uid('P'), sku:'HNG-BRS-3', name:'Brass Hinge 3in', category:'Hardware', uom:'pcs', reorderPoint:50, stock: stockAcross(0, 0, 0) },
  ];

  db = {
    users: [{ id: uid('U'), name:'Demo Manager', email:'demo@stocksense.io', password:'demo123', role:'Inventory Manager' }],
    warehouses, categories, products,
    receipts:[], deliveries:[], transfers:[], adjustments:[], ledger:[],
    sequences:{}, otp: null,
    notifications:[], favorites:[], achievements:[]
  };

  const now = Date.now();
  const p1 = products[0], p3 = products[2];

  const r1 = { id: uid('R'), docNo: docNo('WH/IN','receipt'), supplier:'Ironclad Metals Co.', warehouse:'wh-main', lines:[{ productId:p1.id, qty:60 }], status:'Done', createdAt: now - 86400000*3, validatedAt: now - 86400000*3 };
  db.receipts.push(r1); logMove('Receipt', r1.docNo, p1.id, 60, null, 'wh-main', r1.createdAt);

  const r2 = { id: uid('R'), docNo: docNo('WH/IN','receipt'), supplier:'Timber & Oak Supply', warehouse:'wh-main', lines:[{ productId:p3.id, qty:20 }], status:'Waiting', createdAt: now - 3600000*5 };
  db.receipts.push(r2);

  const d1 = { id: uid('R'), docNo: docNo('WH/OUT','delivery'), customer:'BuildRight Contractors', warehouse:'wh-main', lines:[{ productId:p3.id, qty:10 }], status:'Done', createdAt: now - 86400000*2, validatedAt: now - 86400000*2 };
  db.deliveries.push(d1); logMove('Delivery', d1.docNo, p3.id, -10, 'wh-main', null, d1.createdAt);

  const d2 = { id: uid('R'), docNo: docNo('WH/OUT','delivery'), customer:'Northgate Retail', warehouse:'wh-main', lines:[{ productId: products[4].id, qty:150 }], status:'Ready', createdAt: now - 3600000*2 };
  db.deliveries.push(d2);

  const t1 = { id: uid('R'), docNo: docNo('WH/INT','transfer'), fromWarehouse:'wh-main', toWarehouse:'wh-prod', lines:[{ productId:p1.id, qty:20 }], status:'Done', createdAt: now - 86400000, validatedAt: now - 86400000 };
  db.transfers.push(t1); logMove('Transfer', t1.docNo, p1.id, 20, 'wh-main', 'wh-prod', t1.createdAt);

  save();
}
function logMove(type, ref, productId, delta, from, to, ts){
  db.ledger.unshift({ id: uid('L'), type, ref, productId, delta, from, to, ts: ts || Date.now() });
}

/* ---------------------------------------------------------
   Persistence bootstrap
   --------------------------------------------------------- */
function loadDb(){
  const raw = localStorage.getItem(DB_KEY);
  if (raw){
    try { db = JSON.parse(raw); ensureDbDefaults(); return; }
    catch(e){ /* fall through */ }
  }
  seedDb();
}
function ensureDbDefaults(){
  db.notifications = db.notifications || [];
  db.favorites = db.favorites || [];
  db.achievements = db.achievements || [];
}
function getSession(){ try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch(e){ return null; } }
function setSession(userId){ sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId })); }
function clearSession(){ sessionStorage.removeItem(SESSION_KEY); }
function currentUser(){ const s = getSession(); if (!s) return null; return db.users.find(u => u.id === s.userId) || null; }

/* ---------------------------------------------------------
   Product / stock helpers
   --------------------------------------------------------- */
function totalStock(p){ return Object.values(p.stock).reduce((a,b)=>a+b, 0); }
function stockAt(p, whId){ return p.stock[whId] || 0; }
function isLow(p){ const t = totalStock(p); return t > 0 && t < p.reorderPoint; }
function isOut(p){ return totalStock(p) <= 0; }
function whName(id){ const w = db.warehouses.find(w=>w.id===id); return w ? w.name : '—'; }
function productName(id){ const p = db.products.find(p=>p.id===id); return p ? p.name : '—'; }
function productSku(id){ const p = db.products.find(p=>p.id===id); return p ? p.sku : '—'; }
function isFav(id){ return db.favorites.includes(id); }
function toggleFav(id){
  const i = db.favorites.indexOf(id);
  if (i >= 0) db.favorites.splice(i,1); else db.favorites.push(id);
  save();
}

function statusBadge(status){
  const cls = { 'Draft':'badge-draft','Waiting':'badge-waiting','Ready':'badge-ready','Done':'badge-done','Cancelled':'badge-cancelled' }[status] || 'badge-draft';
  return `<span class="badge ${cls}">${status}</span>`;
}
function docTypeTag(type){
  const dot = { Receipt:'dot-receipt', Delivery:'dot-delivery', Transfer:'dot-transfer', Adjustment:'dot-adjust' }[type];
  return `<span class="doc-type"><span class="doc-dot ${dot}"></span>${type}</span>`;
}

/* ============================================================
   ACHIEVEMENTS
   ============================================================ */
function unlockAchievement(id){
  if (db.achievements.includes(id)) return;
  db.achievements.push(id); save();
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a){ toast(`Achievement unlocked — ${a.name}`, 'success'); fireConfetti(); }
}
function countValidatedDocs(){
  return [...db.receipts, ...db.deliveries, ...db.transfers, ...db.adjustments].filter(d => d.status === 'Done').length;
}
function checkLedgerProAchievement(){ if (countValidatedDocs() >= 10) unlockAchievement('ledger_pro'); }
function achievementShelfHtml(){
  return ACHIEVEMENTS.map(a => `
    <div class="ach-badge ${db.achievements.includes(a.id) ? 'unlocked' : ''}" title="${escapeHtml(a.desc)}">
      <div class="ach-badge-ic">${a.ic}</div><div class="ach-badge-name">${escapeHtml(a.name)}</div>
    </div>`).join('');
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function buildNotifications(){
  const notifs = [];
  db.products.filter(isOut).forEach(p => notifs.push({ type:'bad', ic:'⛔', text:`${p.name} is out of stock.` }));
  db.products.filter(isLow).forEach(p => notifs.push({ type:'warn', ic:'⚠', text:`${p.name} is running low — ${totalStock(p)} ${p.uom} left.` }));
  const pendingR = db.receipts.filter(r => r.status === 'Waiting').length;
  if (pendingR) notifs.push({ type:'ok', ic:'↓', text:`${pendingR} receipt${pendingR>1?'s':''} waiting for action.` });
  const readyD = db.deliveries.filter(r => r.status === 'Ready').length;
  if (readyD) notifs.push({ type:'ok', ic:'↑', text:`${readyD} delivery order${readyD>1?'s':''} ready to validate.` });
  const draftA = db.adjustments.filter(r => r.status === 'Draft').length;
  if (draftA) notifs.push({ type:'ok', ic:'±', text:`${draftA} stock adjustment${draftA>1?'s':''} still in Draft.` });
  return notifs;
}
function renderNotifPanel(){
  const notifs = buildNotifications();
  const urgent = notifs.filter(n => n.type !== 'ok').length;
  const dot = document.getElementById('notif-dot');
  if (dot) dot.classList.toggle('hidden', urgent === 0);
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.innerHTML = `<div class="notif-head"><span>Notifications</span><span class="muted" style="font-weight:500;">${notifs.length}</span></div>` +
    (notifs.length
      ? notifs.map(n => `<div class="notif-item"><span class="notif-ic ${n.type}">${n.ic}</span><div><div class="notif-text">${escapeHtml(n.text)}</div><div class="notif-time">Live</div></div></div>`).join('')
      : `<div class="notif-empty">You're all caught up 🎉</div>`);
}

/* ============================================================
   ACCENT PICKER
   ============================================================ */
function applyAccent(hex, tint){
  document.documentElement.style.setProperty('--accent-2', hex);
  document.documentElement.style.setProperty('--accent-2-tint', tint);
  document.documentElement.setAttribute('data-accent', '1');
  localStorage.setItem(ACCENT_KEY, JSON.stringify({ hex, tint }));
}
function initAccent(){
  const saved = localStorage.getItem(ACCENT_KEY);
  if (!saved) return;
  try { const { hex, tint } = JSON.parse(saved); applyAccent(hex, tint); } catch(e){}
}
function renderAccentPanel(){
  const panel = document.getElementById('accent-panel');
  if (!panel) return;
  const saved = localStorage.getItem(ACCENT_KEY);
  let activeHex = null;
  if (saved){ try { activeHex = JSON.parse(saved).hex; } catch(e){} }
  panel.innerHTML = `<div class="accent-panel-title">Accent color</div><div class="accent-swatches">${
    ACCENTS.map(a => `<button class="accent-swatch ${activeHex===a.hex?'active':''}" style="background:${a.hex}" data-hex="${a.hex}" data-tint="${a.tint}" title="${a.name}"></button>`).join('')
  }</div>`;
  panel.querySelectorAll('.accent-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      applyAccent(sw.dataset.hex, sw.dataset.tint);
      renderAccentPanel();
      toast('Accent color updated.', 'success');
    });
  });
}

/* ============================================================
   RIPPLE MICRO-INTERACTION
   ============================================================ */
function spawnRipple(btn, x, y){
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (x - rect.left - size/2) + 'px';
  ripple.style.top = (y - rect.top - size/2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 620);
}
function initRipples(){
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .icon-btn, .fab');
    if (btn) spawnRipple(btn, e.clientX, e.clientY);
  });
}

/* ============================================================
   CINEMATIC SCENE BACKGROUND (replaces the old particle engine)
   Animated dusk lake: drifting clouds, twinkling stars, glowing
   sun, mountains, rippling water reflection and rolling mist.
   Same name + signature, so splash / landing / auth keep working.
   ============================================================ */
function startParticles(canvasId){
  const c = document.getElementById(canvasId); if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, t = 0, clouds = [], stars = [];
  const ridge = (seed, amp) => x => amp * (Math.sin(x*.004+seed)*.5 + Math.sin(x*.011+seed*2.3)*.3 + Math.sin(x*.027+seed*4.1)*.2 + .7);
  let far, near;

  function resize(){
    w = c.width = c.offsetWidth || innerWidth; h = c.height = c.offsetHeight || innerHeight;
    clouds = Array.from({length:8}, () => ({ x:Math.random()*w, y:h*(.05+Math.random()*.3), r:100+Math.random()*170, v:.1+Math.random()*.2 }));
    stars  = Array.from({length:80}, () => ({ x:Math.random()*w, y:Math.random()*h*.32, p:Math.random()*6 }));
    far = ridge(1.7, h*.11); near = ridge(4.2, h*.17);
  }
  function mountain(fn, color, hz, flip, alpha){
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, hz);
    for (let x=0; x<=w; x+=6){ const y = hz - fn(x); ctx.lineTo(x, flip ? 2*hz - y : y); }
    ctx.lineTo(w, hz); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  function frame(){
    if (!w || !h){ resize(); return requestAnimationFrame(frame); }
    t += .016;
    const hz = h*.52, sx = w*.62;
    // sky
    let g = ctx.createLinearGradient(0,0,0,hz);
    g.addColorStop(0,'#090d22'); g.addColorStop(.5,'#2a3463'); g.addColorStop(.82,'#b5634f'); g.addColorStop(1,'#ffb56e');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,hz);
    stars.forEach(s => { ctx.globalAlpha = .25 + .45*Math.abs(Math.sin(t*1.3 + s.p)); ctx.fillStyle = '#fff'; ctx.fillRect(s.x, s.y, 1.4, 1.4); });
    ctx.globalAlpha = 1;
    // sun glow
    g = ctx.createRadialGradient(sx,hz,0,sx,hz,w*.42);
    g.addColorStop(0,'rgba(255,210,140,.95)'); g.addColorStop(.14,'rgba(255,150,90,.55)'); g.addColorStop(1,'rgba(255,120,80,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,hz);
    // clouds
    clouds.forEach(cl => {
      cl.x += cl.v; if (cl.x - cl.r > w) cl.x = -cl.r;
      const cg = ctx.createRadialGradient(cl.x,cl.y,0,cl.x,cl.y,cl.r);
      cg.addColorStop(0,'rgba(255,170,125,.20)'); cg.addColorStop(1,'rgba(255,170,125,0)');
      ctx.save(); ctx.translate(0,cl.y); ctx.scale(1,.28); ctx.translate(0,-cl.y); ctx.fillStyle = cg;
      ctx.fillRect(cl.x-cl.r, cl.y-cl.r, cl.r*2, cl.r*2); ctx.restore();
    });
    mountain(far,  '#2b2850', hz, false, 1);
    mountain(near, '#0d0f21', hz, false, 1);
    // water
    g = ctx.createLinearGradient(0,hz,0,h); g.addColorStop(0,'#3a3458'); g.addColorStop(.35,'#1a1c3a'); g.addColorStop(1,'#05060f');
    ctx.fillStyle = g; ctx.fillRect(0,hz,w,h-hz);
    mountain(far,  '#2b2850', hz, true, .4);
    mountain(near, '#0d0f21', hz, true, .6);
    // sun reflection column
    for (let y=hz; y<h; y+=3){
      const k = (y-hz)/(h-hz), wd = (50 + (y-hz)*.28) * (.55 + .45*Math.sin(y*.16 - t*2.2));
      ctx.fillStyle = `rgba(255,170,100,${.55*(1-k)})`; ctx.fillRect(sx - wd/2, y, wd, 2);
    }
    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
    for (let i=0; i<14; i++){
      const y = hz + 12 + i*i*3.2, off = Math.sin(t*.8 + i)*18;
      ctx.beginPath(); ctx.moveTo(off, y); ctx.lineTo(w + off, y); ctx.stroke();
    }
    // mist
    for (let i=0; i<2; i++){
      const mx = ((t*14*(i+1)) % (w*1.6)) - w*.3, mg = ctx.createLinearGradient(mx,0,mx+w*.8,0);
      mg.addColorStop(0,'rgba(255,200,170,0)'); mg.addColorStop(.5,'rgba(255,200,170,.07)'); mg.addColorStop(1,'rgba(255,200,170,0)');
      ctx.fillStyle = mg; ctx.fillRect(mx, hz-30+i*26, w*.8, 70);
    }
    // vignette
    g = ctx.createRadialGradient(w/2,h/2,h*.35,w/2,h/2,h*.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.55)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    requestAnimationFrame(frame);
  }
  resize(); window.addEventListener('resize', resize); requestAnimationFrame(frame);
}

/* ============================================================
   SPLASH SCREEN
   ============================================================ */
function runSplash(){
  startParticles('splash-canvas');
  const fill = document.getElementById('splash-bar-fill');
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.random()*18 + 8;
    if (pct >= 100){ pct = 100; clearInterval(timer); finishSplash(); }
    fill.style.width = pct + '%';
  }, 160);
}
function finishSplash(){
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    splash.classList.add('fade-out');
    setTimeout(() => { splash.style.display = 'none'; showInitialScreen(); }, 520);
  }, 220);
}
function showInitialScreen(){
  const user = currentUser();
  if (user){ enterApp(); }
  else { showLanding(); }
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll('#theme-toggle, #land-theme-toggle').forEach(b => b.textContent = theme === 'dark' ? '☀️' : '🌙');
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
function showLanding(){
  document.getElementById('landing').classList.remove('hidden');
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.add('hidden');
}
function initLanding(){
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  startParticles('landing-canvas');

  document.getElementById('team-grid').innerHTML = TEAM.map(t => `
    <div class="team-card">
      <div class="team-photo-wrap">
        <img class="team-photo" src="${t.photo}" alt="${escapeHtml(t.name)}"
             onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${encodeURIComponent(fallbackAvatarSvg(t.name))}';">
      </div>
      <div class="team-name">${escapeHtml(t.name)}</div>
      <div class="team-role">${escapeHtml(t.role)}</div>
      <p class="team-bio">${escapeHtml(t.bio)}</p>
      <div class="team-skills">${t.skills.map(s=>`<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div>
      <div class="team-actions">
        ${t.linkedinDisabled
          ? `<button class="btn btn-outline btn-sm" disabled title="LinkedIn profile not available">LinkedIn</button>`
          : `<a class="btn btn-outline btn-sm" href="${t.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`}
        <a class="btn btn-outline btn-sm" href="${t.github}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  `).join('');

  document.getElementById('tips-grid').innerHTML = TIPS.map(t => `
    <div class="tip-card"><div class="tip-ic">${t.ic}</div><div><h4>${escapeHtml(t.title)}</h4><p>${t.text}</p></div></div>
  `).join('');

  document.getElementById('land-login-btn').addEventListener('click', () => openAuth('login'));
  document.getElementById('land-signup-btn').addEventListener('click', () => openAuth('signup'));
  document.getElementById('footer-login-link').addEventListener('click', e => { e.preventDefault(); openAuth('login'); });
  document.getElementById('hero-demo-btn').addEventListener('click', () => openAuth('login'));
  document.getElementById('hero-tour-btn').addEventListener('click', () => {
    toast('Sign in first, then click "Guided tour" in the sidebar for the full walkthrough.');
    openAuth('login');
  });
  document.getElementById('land-theme-toggle').addEventListener('click', toggleTheme);
}
function fallbackAvatarSvg(name){
  const initials = initialsOf(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="48" fill="#6C4DF6"/><text x="50%" y="54%" font-family="Inter,sans-serif" font-size="30" fill="#fff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
}

/* ============================================================
   CINEMATIC LANDING EXTRAS
   Typewriter prompt, scroll-reveal, nav-on-scroll, mouse tilt.
   ============================================================ */
function initCinema(){
  const prompts = [
    'Receive 60 kg of steel rods from Ironclad Metals into Main Warehouse…',
    'Move 20 Oak Chairs from Main Warehouse to Production Floor…',
    'Ship 150 Bolt M8x40 to Northgate Retail — block it if stock is short…',
    'Reconcile Brass Hinge 3in after tonight\'s physical count…'
  ];
  const el = document.getElementById('prompt-typed'); let pi = 0, ci = 0, del = false;
  (function type(){
    if (!el) return;
    const s = prompts[pi];
    el.textContent = s.slice(0, ci);
    if (!del && ci < s.length){ ci++; return setTimeout(type, 38); }
    if (!del){ del = true; return setTimeout(type, 1800); }
    if (ci > 0){ ci -= 2; if (ci < 0) ci = 0; return setTimeout(type, 14); }
    del = false; pi = (pi+1) % prompts.length; setTimeout(type, 350);
  })();

  document.getElementById('hero-signup-chip').addEventListener('click', () => openAuth('signup'));

  // scroll-reveal for every landing card / heading
  const targets = document.querySelectorAll('.land-section-head, .feature-card, .about-body, .about-stats, .team-card, .tip-card');
  targets.forEach(t => { t.classList.add('reveal'); t.style.animation = 'none'; });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold:.15 });
  targets.forEach(t => io.observe(t));

  // nav darkens on scroll + subtle mouse tilt on the prompt box
  const nav = document.getElementById('land-nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive:true });
  const box = document.querySelector('.prompt-box');
  document.getElementById('landing').addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth - .5) * 6, y = (e.clientY / innerHeight - .5) * -6;
    box.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg)`;
  });
}

/* ============================================================
   AUTH
   ============================================================ */
function showAuthForm(which){
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(which + '-form').classList.remove('hidden');
}
function openAuth(which){
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  showAuthForm(which);
}
function initAuthScreen(){
  startParticles('auth-canvas');

  document.getElementById('auth-back-btn').addEventListener('click', () => {
    document.getElementById('auth-screen').classList.add('hidden');
    showLanding();
  });

  document.querySelectorAll('[data-go]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showAuthForm(a.dataset.go === 'reset' ? 'reset-request' : a.dataset.go);
    });
  });

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;
    const user = db.users.find(u => u.email.toLowerCase() === email && u.password === pass);
    if (!user){ toast('Invalid email or password.', true); return; }
    setSession(user.id);
    enterApp();
  });

  document.getElementById('demo-login-btn').addEventListener('click', () => {
    setSession(db.users[0].id);
    enterApp();
  });

  document.getElementById('signup-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const role = document.getElementById('signup-role').value;
    const pass = document.getElementById('signup-password').value;
    if (db.users.some(u => u.email.toLowerCase() === email)){ toast('An account with that email already exists.', true); return; }
    if (pass.length < 6){ toast('Password must be at least 6 characters.', true); return; }
    const user = { id: uid('U'), name, email, password: pass, role };
    db.users.push(user); save(); setSession(user.id);
    toast(`Welcome, ${name.split(' ')[0]}! Your account is ready.`, 'success');
    enterApp(true);
  });

  document.getElementById('reset-request-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === email);
    if (!user){ toast('No account found with that email.', true); return; }
    const otp = String(Math.floor(100000 + Math.random()*900000));
    db.otp = { email, otp, expires: Date.now() + 5*60000 };
    save();
    document.getElementById('otp-hint').textContent = `Your one-time code is ${otp} (simulated — no email is sent in this demo).`;
    showAuthForm('reset-verify');
  });

  document.getElementById('reset-verify-form').addEventListener('submit', e => {
    e.preventDefault();
    const otp = document.getElementById('reset-otp').value.trim();
    const pass = document.getElementById('reset-new-password').value;
    if (!db.otp || db.otp.otp !== otp || Date.now() > db.otp.expires){ toast('That code is invalid or has expired.', true); return; }
    if (pass.length < 6){ toast('Password must be at least 6 characters.', true); return; }
    const user = db.users.find(u => u.email.toLowerCase() === db.otp.email);
    user.password = pass; db.otp = null; save();
    toast('Password reset. Sign in with your new password.', 'success');
    showAuthForm('login');
  });

  renderMiniLedger();
}
function renderMiniLedger(){
  const el = document.getElementById('auth-mini-ledger');
  const sample = [{ l:'Steel Rods (8mm)', r:'+60 kg' }, { l:'Oak Chair', r:'-10 pcs' }, { l:'Bolt M8x40', r:'150 pcs' }];
  el.innerHTML = sample.map((s,i) => `<div class="mini-ledger-row" style="animation-delay:${i*0.12}s"><span>${s.l}</span><span>${s.r}</span></div>`).join('');
}

/* ============================================================
   APP ENTRY / SHELL
   ============================================================ */
function enterApp(isNewSignup){
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  const user = currentUser();
  document.getElementById('sidebar-name').textContent = user.name;
  document.getElementById('sidebar-role').textContent = user.role;
  document.getElementById('sidebar-avatar').textContent = initialsOf(user.name);
  initShellEvents();
  initCommandPalette();
  initShortcutsModal();
  initGlobalKeyboardShortcuts();
  const route = (location.hash || '#dashboard').replace('#','');
  navigate(route);
  if (isNewSignup && !localStorage.getItem(TOUR_SEEN_KEY)){
    setTimeout(() => { if (confirm('Want a quick guided tour of StockSense?')) startTour(); }, 500);
  }
}

function initShellEvents(){
  document.getElementById('profile-btn').addEventListener('click', () => {
    document.getElementById('profile-menu').classList.toggle('hidden');
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    location.hash = '';
    document.getElementById('app-shell').classList.add('hidden');
    showLanding();
    toast('Signed out.');
  });
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('global-search').addEventListener('input', e => {
    if (currentView !== 'products') navigate('products');
    renderProducts(e.target.value);
  });
  window.addEventListener('hashchange', () => navigate((location.hash || '#dashboard').replace('#','')));
  document.addEventListener('click', e => {
    if (!e.target.closest('#profile-btn') && !e.target.closest('#profile-menu')){
      document.getElementById('profile-menu').classList.add('hidden');
    }
    if (!e.target.closest('#accent-btn') && !e.target.closest('#accent-panel')){
      document.getElementById('accent-panel').classList.add('hidden');
    }
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')){
      document.getElementById('notif-panel').classList.add('hidden');
    }
  });
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('screenshot-btn').addEventListener('click', takeScreenshot);
  document.getElementById('pdf-btn').addEventListener('click', exportPdf);
  document.getElementById('tour-btn').addEventListener('click', startTour);
  document.getElementById('shortcuts-btn').addEventListener('click', openShortcuts);
  document.getElementById('cmdk-btn').addEventListener('click', openCommandPalette);
  document.getElementById('accent-btn').addEventListener('click', () => {
    const panel = document.getElementById('accent-panel');
    const willShow = panel.classList.contains('hidden');
    document.getElementById('notif-panel').classList.add('hidden');
    if (willShow) renderAccentPanel();
    panel.classList.toggle('hidden');
  });
  document.getElementById('notif-btn').addEventListener('click', () => {
    const panel = document.getElementById('notif-panel');
    const willShow = panel.classList.contains('hidden');
    document.getElementById('accent-panel').classList.add('hidden');
    if (willShow) renderNotifPanel();
    panel.classList.toggle('hidden');
  });
  const fab = document.getElementById('fab-btn');
  if (fab) fab.addEventListener('click', openCommandPalette);
}

function navigate(view){
  currentView = view;
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  document.getElementById('sidebar').classList.remove('open');
  const renderers = {
    dashboard: renderDashboard, analytics: renderAnalytics, products: () => renderProducts(''), receipts: renderReceipts,
    deliveries: renderDeliveries, transfers: renderTransfers, adjustments: renderAdjustments,
    ledger: renderLedger, settings: renderSettings, profile: renderProfile,
  };
  (renderers[view] || renderDashboard)();
  updateTopbarAlert();
}
function updateTopbarAlert(){
  const lowCount = db.products.filter(isLow).length;
  const outCount = db.products.filter(isOut).length;
  const el = document.getElementById('topbar-alert');
  el.textContent = outCount > 0 ? `${outCount} product${outCount>1?'s':''} out of stock`
    : lowCount > 0 ? `${lowCount} product${lowCount>1?'s':''} running low` : '';
}
function mount(html){ document.getElementById('app-content').innerHTML = html; }

/* ============================================================
   Animated counters
   ============================================================ */
function animateCount(el, target){
  const start = 0;
  const dur = 650;
  const t0 = performance.now();
  function frame(t){
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1-p, 3);
    el.textContent = Math.round(start + (target-start)*eased);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   DASHBOARD
   ============================================================ */
const DASH_TIP = TIPS[Math.floor(Math.random()*TIPS.length)];

function renderDashboard(){
  const totalProducts = db.products.length;
  const lowStock = db.products.filter(isLow).length;
  const outStock = db.products.filter(isOut).length;
  const pendingReceipts = db.receipts.filter(r => r.status !== 'Done' && r.status !== 'Cancelled').length;
  const pendingDeliveries = db.deliveries.filter(r => r.status !== 'Done' && r.status !== 'Cancelled').length;
  const scheduledTransfers = db.transfers.filter(r => r.status !== 'Done' && r.status !== 'Cancelled').length;
  const user = currentUser();

  mount(`
    <div class="page-head">
      <div><h1>Welcome back, <span class="grad-text">${escapeHtml(user.name.split(' ')[0])}</span></h1><div class="page-sub">Snapshot of inventory operations across all warehouses</div></div>
      <div class="page-actions"><a class="btn btn-outline" href="#analytics">📊 View analytics</a></div>
    </div>

    <div class="tip-banner" id="dash-tip-banner">
      <span>${DASH_TIP.ic}</span><span><strong>${DASH_TIP.title}:</strong> ${DASH_TIP.text}</span>
      <button id="dash-tip-close" title="Dismiss">✕</button>
    </div>

    <div class="kpi-strip">
      <div class="kpi"><div class="kpi-label">Total Products</div><div class="kpi-value" id="kpi-total">0</div></div>
      <div class="kpi ${lowStock ? 'accent-warn' : ''}"><div class="kpi-label">Low Stock</div><div class="kpi-value" id="kpi-low">0</div></div>
      <div class="kpi ${outStock ? 'accent-bad' : ''}"><div class="kpi-label">Out of Stock</div><div class="kpi-value" id="kpi-out">0</div></div>
      <div class="kpi accent-ok"><div class="kpi-label">Pending Receipts</div><div class="kpi-value" id="kpi-rec">0</div></div>
      <div class="kpi accent-ok"><div class="kpi-label">Pending Deliveries</div><div class="kpi-value" id="kpi-del">0</div></div>
    </div>

    <div class="filter-row">
      <select id="f-type"><option value="">All document types</option><option>Receipt</option><option>Delivery</option><option>Transfer</option><option>Adjustment</option></select>
      <select id="f-status"><option value="">All statuses</option><option>Draft</option><option>Waiting</option><option>Ready</option><option>Done</option><option>Cancelled</option></select>
      <select id="f-warehouse"><option value="">All warehouses</option>${db.warehouses.map(w=>`<option value="${w.id}">${w.name}</option>`).join('')}</select>
      <select id="f-category"><option value="">All categories</option>${db.categories.map(c=>`<option>${c}</option>`).join('')}</select>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Recent Documents</h3><span class="muted" style="font-size:12px;">Internal Transfers Scheduled: ${scheduledTransfers}</span></div>
      <table>
        <thead><tr><th>Type</th><th>Document</th><th>Warehouse</th><th>Status</th><th>Date</th></tr></thead>
        <tbody id="dash-doc-rows"></tbody>
      </table>
    </div>
  `);

  animateCount(document.getElementById('kpi-total'), totalProducts);
  animateCount(document.getElementById('kpi-low'), lowStock);
  animateCount(document.getElementById('kpi-out'), outStock);
  animateCount(document.getElementById('kpi-rec'), pendingReceipts);
  animateCount(document.getElementById('kpi-del'), pendingDeliveries);

  document.getElementById('dash-tip-close').addEventListener('click', () => document.getElementById('dash-tip-banner').remove());

  function allDocs(){
    const docs = [];
    db.receipts.forEach(r => docs.push({ type:'Receipt', ref:r.docNo, wh: r.warehouse, status:r.status, ts:r.createdAt, lines:r.lines }));
    db.deliveries.forEach(r => docs.push({ type:'Delivery', ref:r.docNo, wh: r.warehouse, status:r.status, ts:r.createdAt, lines:r.lines }));
    db.transfers.forEach(r => docs.push({ type:'Transfer', ref:r.docNo, wh: r.toWarehouse, status:r.status, ts:r.createdAt, lines:r.lines }));
    db.adjustments.forEach(r => docs.push({ type:'Adjustment', ref:r.docNo, wh: r.warehouse, status:r.status, ts:r.createdAt, lines:[{productId:r.productId}] }));
    return docs.sort((a,b)=>b.ts-a.ts);
  }
  function categoryMatch(doc, cat){
    if (!cat) return true;
    return doc.lines.some(l => { const p = db.products.find(p=>p.id===l.productId); return p && p.category === cat; });
  }
  function applyFilters(){
    const t = document.getElementById('f-type').value, s = document.getElementById('f-status').value;
    const w = document.getElementById('f-warehouse').value, c = document.getElementById('f-category').value;
    const rows = allDocs().filter(d => (!t || d.type===t) && (!s || d.status===s) && (!w || d.wh===w) && categoryMatch(d, c)).slice(0, 25);
    document.getElementById('dash-doc-rows').innerHTML = rows.length ? rows.map(d => `
      <tr><td>${docTypeTag(d.type)}</td><td class="mono">${d.ref}</td><td>${whName(d.wh)}</td><td>${statusBadge(d.status)}</td><td class="muted">${fmtDate(d.ts)}</td></tr>
    `).join('') : emptyRow(5, '🗒️', 'No documents match these filters', 'Try widening your filters above.');
  }
  ['f-type','f-status','f-warehouse','f-category'].forEach(id => document.getElementById(id).addEventListener('change', applyFilters));
  applyFilters();
}

/* ============================================================
   ANALYTICS
   ============================================================ */
function renderAnalytics(){
  mount(`
    <div class="page-head"><div><h1>Analytics</h1><div class="page-sub">Live charts generated straight from your stock ledger</div></div></div>
    <div class="analytics-grid">
      <div class="chart-panel"><h3>Stock by category</h3><div id="chart-bar"></div></div>
      <div class="chart-panel"><h3>Document status mix</h3><div id="chart-donut"></div></div>
    </div>
    <div class="chart-panel" style="margin-bottom:18px;"><h3>Ledger activity — last 7 days</h3><div id="chart-line"></div></div>
    <div class="chart-panel"><h3>Achievements</h3><div class="badge-shelf" id="ach-shelf"></div></div>
  `);
  drawBarChart();
  drawDonutChart();
  drawLineChart();
  document.getElementById('ach-shelf').innerHTML = achievementShelfHtml();
}

function drawBarChart(){
  const cats = db.categories;
  if (!cats.length){ document.getElementById('chart-bar').innerHTML = `<div class="empty-state"><div class="empty-state-ic">📊</div><div class="empty-state-title">No categories yet</div></div>`; return; }
  const totals = cats.map(c => db.products.filter(p=>p.category===c).reduce((a,p)=>a+totalStock(p),0));
  const max = Math.max(1, ...totals);
  const w = 460, h = 200, plotW = w - 40, colW = plotW / cats.length;
  const barW = Math.max(18, Math.min(56, colW - 18));
  const colors = ['#6C4DF6','#12C6B8','#FFA53E','#FF5D7A','#29B37B','#3B82F6'];
  const bars = cats.map((c,i) => {
    const x = 30 + i*colW + (colW-barW)/2;
    const hgt = Math.round((totals[i]/max)*140);
    return `<rect class="bar-rect" x="${x}" y="170" width="${barW}" height="0" rx="6" fill="${colors[i%colors.length]}" data-final-h="${hgt}" data-final-y="${170-hgt}"></rect>
      <text x="${x+barW/2}" y="188" text-anchor="middle" font-size="10" fill="var(--ink-soft)">${escapeHtml(c.length>9?c.slice(0,8)+'…':c)}</text>
      <text class="bar-label" x="${x+barW/2}" y="${170-hgt-8}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)" opacity="0">${totals[i]}</text>`;
  }).join('');
  document.getElementById('chart-bar').innerHTML = `<svg viewBox="0 0 ${w} 200" width="100%" height="200">${bars}</svg>`;
  const rects = document.querySelectorAll('#chart-bar .bar-rect');
  const labels = document.querySelectorAll('#chart-bar .bar-label');
  rects.forEach(r => { r.style.transition = 'height .7s cubic-bezier(.22,1,.36,1), y .7s cubic-bezier(.22,1,.36,1)'; });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    rects.forEach(r => { r.setAttribute('height', r.dataset.finalH); r.setAttribute('y', r.dataset.finalY); });
    labels.forEach(l => { l.style.transition = 'opacity .4s ease .5s'; l.setAttribute('opacity','1'); });
  }));
}

function drawDonutChart(){
  const all = [...db.receipts, ...db.deliveries, ...db.transfers, ...db.adjustments];
  const statuses = ['Draft','Waiting','Ready','Done','Cancelled'];
  const colors = { Draft:'#B9B4D6', Waiting:'#FFA53E', Ready:'#6C4DF6', Done:'#29B37B', Cancelled:'#FF5D7A' };
  const counts = statuses.map(s => all.filter(d => d.status === s).length);
  const total = counts.reduce((a,b)=>a+b,0);
  const r = 60, cx = 80, cy = 80, circumference = 2*Math.PI*r;

  if (!total){
    document.getElementById('chart-donut').innerHTML = `<div class="empty-state"><div class="empty-state-ic">🗂️</div><div class="empty-state-title">No documents yet</div><div class="empty-state-sub">Create a receipt, delivery or transfer to see this chart fill in.</div></div>`;
    return;
  }
  let offset = 0;
  const segs = statuses.map((s,i) => {
    const len = (counts[i]/total)*circumference;
    const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[s]}" stroke-width="20" stroke-dasharray="0 ${circumference}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" class="donut-seg" data-len="${len.toFixed(2)}"></circle>`;
    offset += len;
    return seg;
  }).join('');
  document.getElementById('chart-donut').innerHTML = `
    <svg viewBox="0 0 160 160" width="100%" height="180" style="max-width:180px;display:block;margin:0 auto;">${segs}
      <text x="80" y="84" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink)">${total}</text>
      <text x="80" y="98" text-anchor="middle" font-size="9" fill="var(--ink-soft)">documents</text>
    </svg>
    <div class="chart-legend">${statuses.map((s,i) => `<span><i style="background:${colors[s]}"></i>${s} (${counts[i]})</span>`).join('')}</div>
  `;
  const segEls = document.querySelectorAll('#chart-donut .donut-seg');
  segEls.forEach(el => { el.style.transition = 'stroke-dasharray .9s cubic-bezier(.22,1,.36,1)'; });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    segEls.forEach(el => { const len = Number(el.dataset.len); el.setAttribute('stroke-dasharray', `${len} ${circumference-len}`); });
  }));
}

function drawLineChart(){
  const days = [...Array(7)].map((_,i) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(6-i)); return d.getTime(); });
  const values = days.map(dayStart => {
    const dayEnd = dayStart + 86400000;
    return db.ledger.filter(l => l.ts >= dayStart && l.ts < dayEnd).reduce((a,l) => a + Math.abs(l.delta), 0);
  });
  const max = Math.max(1, ...values);
  const w = 680, h = 170, padding = 24;
  const stepX = (w - padding*2) / (values.length - 1 || 1);
  const points = values.map((v,i) => [padding + i*stepX, h - padding - (v/max)*(h - padding*2 - 14)]);
  const path = points.map((p,i) => (i===0?'M':'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const areaPath = `${path} L${points[points.length-1][0]},${h-padding} L${points[0][0]},${h-padding} Z`;
  const dots = points.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#6C4DF6" class="line-dot" style="opacity:0"></circle>`).join('');
  const valueLabels = points.map((p,i) => `<text x="${p[0]}" y="${p[1]-9}" text-anchor="middle" font-size="9" fill="var(--ink-soft)" class="line-dot" style="opacity:0">${values[i]}</text>`).join('');
  const dayLabels = days.map((d,i) => `<text x="${points[i][0]}" y="${h-6}" text-anchor="middle" font-size="9" fill="var(--ink-soft)">${new Date(d).toLocaleDateString(undefined,{weekday:'short'})}</text>`).join('');

  document.getElementById('chart-line').innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="180">
    <defs><linearGradient id="lineFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6C4DF6" stop-opacity="0.35"/><stop offset="100%" stop-color="#6C4DF6" stop-opacity="0"/></linearGradient></defs>
    <path d="${areaPath}" fill="url(#lineFade)" stroke="none"></path>
    <path d="${path}" fill="none" stroke="#6C4DF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="line-path"></path>
    ${dots}${valueLabels}${dayLabels}
  </svg>`;

  const linePath = document.getElementById('line-path');
  const len = linePath.getTotalLength();
  linePath.style.strokeDasharray = len;
  linePath.style.strokeDashoffset = len;
  linePath.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)';
  requestAnimationFrame(() => requestAnimationFrame(() => { linePath.style.strokeDashoffset = 0; }));
  document.querySelectorAll('#chart-line .line-dot').forEach((d,i) => {
    d.style.transition = `opacity .3s ease ${0.5 + i*0.07}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = 1; }));
  });
}

/* ============================================================
   PRODUCTS
   ============================================================ */
function renderProducts(query){
  mount(`
    <div class="page-head">
      <div><h1>Products</h1><div class="page-sub">Catalog, stock by location and reordering rules</div></div>
      <div class="page-actions">
        <button class="btn btn-outline" id="export-products-csv-btn">⬇ Export CSV</button>
        <button class="btn btn-primary" id="add-product-btn">+ New product</button>
      </div>
    </div>
    <div class="filter-row">
      <input type="text" id="product-filter" placeholder="Filter by name or SKU…" value="${escapeHtml(query||'')}">
      <select id="product-cat-filter"><option value="">All categories</option>${db.categories.map(c=>`<option>${c}</option>`).join('')}</select>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>UoM</th><th class="num">Total Stock</th><th>By Location</th><th></th></tr></thead>
        <tbody id="products-rows"></tbody>
      </table>
    </div>
  `);

  function draw(){
    const q = document.getElementById('product-filter').value.trim().toLowerCase();
    const cat = document.getElementById('product-cat-filter').value;
    const rows = db.products.filter(p => (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (!cat || p.category === cat));
    document.getElementById('products-rows').innerHTML = rows.length ? rows.map(p => {
      const total = totalStock(p);
      const pct = Math.min(100, Math.round((total / Math.max(p.reorderPoint*2,1))*100));
      const barCls = isOut(p) ? 'out' : (isLow(p) ? 'low' : '');
      return `
      <tr>
        <td><button class="fav-star ${isFav(p.id)?'active':''}" data-fav="${p.id}" title="Toggle favorite">★</button><strong>${escapeHtml(p.name)}</strong></td>
        <td class="mono">${p.sku}</td>
        <td>${p.category}</td>
        <td class="muted">${p.uom}</td>
        <td class="num">${total} <span class="stock-bar"><span class="stock-bar-fill ${barCls}" style="width:${pct}%"></span></span></td>
        <td class="muted" style="font-size:12.5px;">${db.warehouses.map(w=>`${w.code}: ${stockAt(p,w.id)}`).join(' · ')}</td>
        <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit="${p.id}">Edit</button></td>
      </tr>`;
    }).join('') : emptyRow(7, '🔍', 'No products match your search', 'Try a different name, SKU or category filter.');
    document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openProductModal(b.dataset.edit)));
    document.querySelectorAll('[data-fav]').forEach(b => b.addEventListener('click', () => { toggleFav(b.dataset.fav); draw(); }));
  }
  document.getElementById('product-filter').addEventListener('input', draw);
  document.getElementById('product-cat-filter').addEventListener('change', draw);
  document.getElementById('add-product-btn').addEventListener('click', () => openProductModal(null));
  document.getElementById('export-products-csv-btn').addEventListener('click', exportProductsCsv);
  draw();
}

function openProductModal(productId){
  const p = productId ? db.products.find(x=>x.id===productId) : null;
  openModal(p ? 'Edit product' : 'New product', `
    <div class="form-grid">
      <div class="form-field full"><label>Product name</label><input id="pf-name" value="${p ? escapeHtml(p.name) : ''}"></div>
      <div class="form-field"><label>SKU / Code</label><input id="pf-sku" value="${p ? p.sku : ''}"></div>
      <div class="form-field"><label>Unit of measure</label><input id="pf-uom" value="${p ? p.uom : 'pcs'}"></div>
      <div class="form-field"><label>Category</label><select id="pf-cat">${db.categories.map(c=>`<option ${p && p.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="form-field"><label>Reorder point (total)</label><input id="pf-reorder" type="number" min="0" value="${p ? p.reorderPoint : 10}"></div>
      ${db.warehouses.map(w => `<div class="form-field"><label>Initial stock — ${w.name}</label><input id="pf-stock-${w.id}" type="number" min="0" value="${p ? stockAt(p,w.id) : 0}"></div>`).join('')}
    </div>
  `, () => {
    const name = document.getElementById('pf-name').value.trim();
    const sku = document.getElementById('pf-sku').value.trim();
    if (!name || !sku){ toast('Name and SKU are required.', true); return false; }
    const stock = {};
    db.warehouses.forEach(w => stock[w.id] = Number(document.getElementById(`pf-stock-${w.id}`).value) || 0);
    if (p){
      p.name = name; p.sku = sku; p.uom = document.getElementById('pf-uom').value.trim() || 'pcs';
      p.category = document.getElementById('pf-cat').value; p.reorderPoint = Number(document.getElementById('pf-reorder').value) || 0;
      p.stock = stock; toast('Product updated.', 'success');
    } else {
      db.products.push({ id: uid('P'), name, sku, uom: document.getElementById('pf-uom').value.trim() || 'pcs',
        category: document.getElementById('pf-cat').value, reorderPoint: Number(document.getElementById('pf-reorder').value) || 0, stock });
      toast('Product created.', 'success');
      unlockAchievement('cataloger');
    }
    save(); renderProducts(''); return true;
  }, p ? 'Save changes' : 'Create product');
}

function exportProductsCsv(){
  const header = ['SKU','Name','Category','UoM','Reorder Point','Total Stock', ...db.warehouses.map(w=>w.name)];
  const rows = db.products.map(p => [p.sku, p.name, p.category, p.uom, p.reorderPoint, totalStock(p), ...db.warehouses.map(w=>stockAt(p,w.id))]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `stocksense-products-${Date.now()}.csv`;
  link.click();
  toast('Products exported as CSV.', 'success');
}

/* ============================================================
   Line-item helpers
   ============================================================ */
function lineItemRowHtml(idx, line){
  const options = db.products.map(p => `<option value="${p.id}" ${line && line.productId===p.id?'selected':''}>${p.sku} — ${p.name}</option>`).join('');
  return `<div class="line-item-row" data-line="${idx}"><select class="li-product">${options}</select><input class="li-qty" type="number" min="1" value="${line ? line.qty : 1}"><button type="button" class="remove-line" title="Remove">✕</button></div>`;
}
function wireLineItems(container){
  container.querySelectorAll('.remove-line').forEach(btn => btn.addEventListener('click', () => {
    if (container.querySelectorAll('.line-item-row').length > 1) btn.closest('.line-item-row').remove();
  }));
}
function readLineItems(container){
  return Array.from(container.querySelectorAll('.line-item-row')).map(row => ({
    productId: row.querySelector('.li-product').value, qty: Number(row.querySelector('.li-qty').value) || 0
  })).filter(l => l.qty > 0);
}

/* ============================================================
   RECEIPTS
   ============================================================ */
function renderReceipts(){
  mount(docListShell('Receipts', 'Incoming stock from suppliers — validating adds to inventory', 'add-receipt-btn', '+ New receipt', 'receipt'));
  wireViewToggle('receipt', renderReceipts);
  const root = document.getElementById('doc-view-root');
  if (docViewMode.receipt === 'kanban'){
    root.innerHTML = renderKanbanBoard('receipt');
    wireKanban('receipt');
  } else {
    root.innerHTML = `<div class="panel"><table><thead><tr>${docHeadCols(['Document','Supplier','Warehouse','Lines','Status','Date',''])}</tr></thead><tbody id="doc-rows"></tbody></table></div>`;
    const rows = [...db.receipts].sort((a,b)=>b.createdAt-a.createdAt);
    document.getElementById('doc-rows').innerHTML = rows.length ? rows.map(r => `
      <tr><td class="mono">${r.docNo}</td><td>${r.supplier}</td><td>${whName(r.warehouse)}</td><td class="muted">${r.lines.length} line${r.lines.length>1?'s':''}</td><td>${statusBadge(r.status)}</td><td class="muted">${fmtDate(r.createdAt)}</td><td class="row-actions">${docRowActions(r, 'receipt')}</td></tr>
    `).join('') : emptyRow(7, '📥', 'No receipts yet', 'Log an incoming delivery from a supplier to get started.');
    wireDocRowActions('receipt');
  }
  document.getElementById('add-receipt-btn').addEventListener('click', openReceiptModal);
}
function openReceiptModal(){
  openModal('New receipt', `
    <div class="form-grid">
      <div class="form-field full"><label>Supplier</label><input id="rf-supplier" placeholder="e.g. Ironclad Metals Co."></div>
      <div class="form-field full"><label>Destination warehouse</label><select id="rf-warehouse">${db.warehouses.map(w=>`<option value="${w.id}">${w.name}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Products received</label><div class="line-items" id="rf-lines">${lineItemRowHtml(0)}</div><button type="button" class="btn btn-ghost btn-sm add-line-btn" id="rf-add-line">+ Add product</button></div>
    </div>
  `, () => {
    const supplier = document.getElementById('rf-supplier').value.trim();
    if (!supplier){ toast('Supplier is required.', true); return false; }
    const lines = readLineItems(document.getElementById('rf-lines'));
    if (!lines.length){ toast('Add at least one product with a quantity.', true); return false; }
    db.receipts.push({ id: uid('R'), docNo: docNo('WH/IN','receipt'), supplier, warehouse: document.getElementById('rf-warehouse').value, lines, status:'Draft', createdAt: Date.now() });
    save(); toast('Receipt created as Draft.', 'success'); renderReceipts(); return true;
  }, 'Create receipt');
  const lc = document.getElementById('rf-lines'); wireLineItems(lc);
  document.getElementById('rf-add-line').addEventListener('click', () => { lc.insertAdjacentHTML('beforeend', lineItemRowHtml(lc.children.length)); wireLineItems(lc); });
}

/* ============================================================
   DELIVERIES
   ============================================================ */
function renderDeliveries(){
  mount(docListShell('Delivery Orders', 'Outgoing stock for customer shipment — validating removes inventory', 'add-delivery-btn', '+ New delivery', 'delivery'));
  wireViewToggle('delivery', renderDeliveries);
  const root = document.getElementById('doc-view-root');
  if (docViewMode.delivery === 'kanban'){
    root.innerHTML = renderKanbanBoard('delivery');
    wireKanban('delivery');
  } else {
    root.innerHTML = `<div class="panel"><table><thead><tr>${docHeadCols(['Document','Customer','Warehouse','Lines','Status','Date',''])}</tr></thead><tbody id="doc-rows"></tbody></table></div>`;
    const rows = [...db.deliveries].sort((a,b)=>b.createdAt-a.createdAt);
    document.getElementById('doc-rows').innerHTML = rows.length ? rows.map(r => `
      <tr><td class="mono">${r.docNo}</td><td>${r.customer}</td><td>${whName(r.warehouse)}</td><td class="muted">${r.lines.length} line${r.lines.length>1?'s':''}</td><td>${statusBadge(r.status)}</td><td class="muted">${fmtDate(r.createdAt)}</td><td class="row-actions">${docRowActions(r, 'delivery')}</td></tr>
    `).join('') : emptyRow(7, '📤', 'No delivery orders yet', 'Create one to ship stock out to a customer.');
    wireDocRowActions('delivery');
  }
  document.getElementById('add-delivery-btn').addEventListener('click', openDeliveryModal);
}
function openDeliveryModal(){
  openModal('New delivery order', `
    <div class="form-grid">
      <div class="form-field full"><label>Customer</label><input id="df-customer" placeholder="e.g. BuildRight Contractors"></div>
      <div class="form-field full"><label>Source warehouse</label><select id="df-warehouse">${db.warehouses.map(w=>`<option value="${w.id}">${w.name}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Products to ship</label><div class="line-items" id="df-lines">${lineItemRowHtml(0)}</div><button type="button" class="btn btn-ghost btn-sm add-line-btn" id="df-add-line">+ Add product</button></div>
    </div>
  `, () => {
    const customer = document.getElementById('df-customer').value.trim();
    if (!customer){ toast('Customer is required.', true); return false; }
    const lines = readLineItems(document.getElementById('df-lines'));
    if (!lines.length){ toast('Add at least one product with a quantity.', true); return false; }
    db.deliveries.push({ id: uid('D'), docNo: docNo('WH/OUT','delivery'), customer, warehouse: document.getElementById('df-warehouse').value, lines, status:'Draft', createdAt: Date.now() });
    save(); toast('Delivery order created as Draft.', 'success'); renderDeliveries(); return true;
  }, 'Create delivery');
  const lc = document.getElementById('df-lines'); wireLineItems(lc);
  document.getElementById('df-add-line').addEventListener('click', () => { lc.insertAdjacentHTML('beforeend', lineItemRowHtml(lc.children.length)); wireLineItems(lc); });
}

/* ============================================================
   TRANSFERS
   ============================================================ */
function renderTransfers(){
  mount(docListShell('Internal Transfers', 'Move stock between warehouses or locations', 'add-transfer-btn', '+ New transfer', 'transfer'));
  wireViewToggle('transfer', renderTransfers);
  const root = document.getElementById('doc-view-root');
  if (docViewMode.transfer === 'kanban'){
    root.innerHTML = renderKanbanBoard('transfer');
    wireKanban('transfer');
  } else {
    root.innerHTML = `<div class="panel"><table><thead><tr>${docHeadCols(['Document','Route','Lines','Status','Date',''])}</tr></thead><tbody id="doc-rows"></tbody></table></div>`;
    const rows = [...db.transfers].sort((a,b)=>b.createdAt-a.createdAt);
    document.getElementById('doc-rows').innerHTML = rows.length ? rows.map(r => `
      <tr><td class="mono">${r.docNo}</td><td>${whName(r.fromWarehouse)} → ${whName(r.toWarehouse)}</td><td class="muted">${r.lines.length} line${r.lines.length>1?'s':''}</td><td>${statusBadge(r.status)}</td><td class="muted">${fmtDate(r.createdAt)}</td><td class="row-actions">${docRowActions(r, 'transfer')}</td></tr>
    `).join('') : emptyRow(6, '⇄', 'No transfers yet', 'Move stock between two warehouses to see it here.');
    wireDocRowActions('transfer');
  }
  document.getElementById('add-transfer-btn').addEventListener('click', openTransferModal);
}
function openTransferModal(){
  openModal('New internal transfer', `
    <div class="form-grid">
      <div class="form-field"><label>From</label><select id="tf-from">${db.warehouses.map(w=>`<option value="${w.id}">${w.name}</option>`).join('')}</select></div>
      <div class="form-field"><label>To</label><select id="tf-to">${db.warehouses.map((w,i)=>`<option value="${w.id}" ${i===1?'selected':''}>${w.name}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Products to move</label><div class="line-items" id="tf-lines">${lineItemRowHtml(0)}</div><button type="button" class="btn btn-ghost btn-sm add-line-btn" id="tf-add-line">+ Add product</button></div>
    </div>
  `, () => {
    const from = document.getElementById('tf-from').value, to = document.getElementById('tf-to').value;
    if (from === to){ toast('Choose two different locations.', true); return false; }
    const lines = readLineItems(document.getElementById('tf-lines'));
    if (!lines.length){ toast('Add at least one product with a quantity.', true); return false; }
    db.transfers.push({ id: uid('T'), docNo: docNo('WH/INT','transfer'), fromWarehouse: from, toWarehouse: to, lines, status:'Draft', createdAt: Date.now() });
    save(); toast('Transfer created as Draft.', 'success'); renderTransfers(); return true;
  }, 'Create transfer');
  const lc = document.getElementById('tf-lines'); wireLineItems(lc);
  document.getElementById('tf-add-line').addEventListener('click', () => { lc.insertAdjacentHTML('beforeend', lineItemRowHtml(lc.children.length)); wireLineItems(lc); });
}

/* ============================================================
   ADJUSTMENTS
   ============================================================ */
function renderAdjustments(){
  mount(`
    <div class="page-head">
      <div><h1>Stock Adjustments</h1><div class="page-sub">Reconcile recorded stock against a physical count</div></div>
      <div class="page-actions"><button class="btn btn-primary" id="add-adj-btn">+ New adjustment</button></div>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Document</th><th>Product</th><th>Warehouse</th><th class="num">System Qty</th><th class="num">Counted Qty</th><th class="num">Diff</th><th>Status</th><th></th></tr></thead>
        <tbody id="doc-rows"></tbody>
      </table>
    </div>
  `);
  const rows = [...db.adjustments].sort((a,b)=>b.createdAt-a.createdAt);
  document.getElementById('doc-rows').innerHTML = rows.length ? rows.map(r => `
    <tr><td class="mono">${r.docNo}</td><td>${productName(r.productId)}</td><td>${whName(r.warehouse)}</td><td class="num">${r.systemQty}</td><td class="num">${r.countedQty}</td>
    <td class="num" style="color:${r.diff<0?'var(--coral)':(r.diff>0?'var(--green)':'inherit')}">${r.diff>0?'+':''}${r.diff}</td><td>${statusBadge(r.status)}</td>
    <td class="row-actions">${r.status==='Draft' ? `<button class="btn btn-primary btn-sm" data-validate="${r.id}">Validate</button>` : ''}</td></tr>
  `).join('') : emptyRow(8, '🧮', 'No adjustments recorded yet', 'Record a physical count to reconcile stock.');
  document.querySelectorAll('[data-validate]').forEach(b => b.addEventListener('click', () => validateAdjustment(b.dataset.validate)));
  document.getElementById('add-adj-btn').addEventListener('click', openAdjustmentModal);
}
function openAdjustmentModal(){
  openModal('New stock adjustment', `
    <div class="form-grid">
      <div class="form-field full"><label>Product</label><select id="af-product">${db.products.map(p=>`<option value="${p.id}">${p.sku} — ${p.name}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Warehouse / location</label><select id="af-warehouse">${db.warehouses.map(w=>`<option value="${w.id}">${w.name}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Counted quantity</label><input id="af-counted" type="number" min="0" value="0"></div>
    </div>
  `, () => {
    const productId = document.getElementById('af-product').value, warehouse = document.getElementById('af-warehouse').value;
    const counted = Number(document.getElementById('af-counted').value);
    const p = db.products.find(x=>x.id===productId), systemQty = stockAt(p, warehouse);
    db.adjustments.push({ id: uid('A'), docNo: docNo('WH/ADJ','adjustment'), productId, warehouse, systemQty, countedQty: counted, diff: counted - systemQty, status:'Draft', createdAt: Date.now() });
    save(); toast('Adjustment recorded as Draft.', 'success'); renderAdjustments(); return true;
  }, 'Record adjustment');
}
function validateAdjustment(id){
  const a = db.adjustments.find(x=>x.id===id), p = db.products.find(x=>x.id===a.productId);
  p.stock[a.warehouse] = a.countedQty; a.status = 'Done'; a.validatedAt = Date.now();
  logMove('Adjustment', a.docNo, a.productId, a.diff, null, null, Date.now());
  save(); toast(`${a.docNo} validated — stock updated.`, 'success'); fireConfetti();
  unlockAchievement('first_adjustment'); checkLedgerProAchievement();
  renderAdjustments();
}

/* ============================================================
   Shared document list shell + row actions + kanban
   ============================================================ */
function docListShell(title, sub, btnId, btnLabel, kind){
  const toggle = kind ? `<div class="view-toggle" id="view-toggle-${kind}">
      <button data-mode="table" class="${docViewMode[kind]!=='kanban'?'active':''}">☰ Table</button>
      <button data-mode="kanban" class="${docViewMode[kind]==='kanban'?'active':''}">▤ Board</button>
    </div>` : '';
  return `
    <div class="page-head"><div><h1>${title}</h1><div class="page-sub">${sub}</div></div><div class="page-actions">${toggle}<button class="btn btn-primary" id="${btnId}">${btnLabel}</button></div></div>
    <div id="doc-view-root"></div>
  `;
}
function docHeadCols(cols){ return cols.map(c => `<th>${c}</th>`).join(''); }
function wireViewToggle(kind, rerenderFn){
  const el = document.getElementById(`view-toggle-${kind}`);
  if (!el) return;
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    if (docViewMode[kind] === b.dataset.mode) return;
    docViewMode[kind] = b.dataset.mode;
    rerenderFn();
  }));
}
function docRowActions(doc, kind){
  const next = { Draft:'Waiting', Waiting:'Ready', Ready:'Done' }[doc.status];
  let btns = '';
  if (next){
    const label = next === 'Done' ? 'Validate' : `Mark ${next}`;
    btns += `<button class="btn ${next==='Done'?'btn-primary':'btn-outline'} btn-sm" data-advance="${doc.id}" data-kind="${kind}">${label}</button>`;
  }
  if (doc.status !== 'Done' && doc.status !== 'Cancelled'){
    btns += `<button class="btn btn-danger btn-sm" data-cancel="${doc.id}" data-kind="${kind}">Cancel</button>`;
  }
  return btns;
}
function wireDocRowActions(kind){
  document.querySelectorAll(`[data-advance][data-kind="${kind}"]`).forEach(b => b.addEventListener('click', () => advanceDoc(kind, b.dataset.advance)));
  document.querySelectorAll(`[data-cancel][data-kind="${kind}"]`).forEach(b => b.addEventListener('click', () => cancelDoc(kind, b.dataset.cancel)));
}
function collectionFor(kind){ return { receipt: db.receipts, delivery: db.deliveries, transfer: db.transfers }[kind]; }
function computeNextStatus(status){ const flow=['Draft','Waiting','Ready','Done']; return flow[flow.indexOf(status)+1]; }

function advanceDoc(kind, id){
  const doc = collectionFor(kind).find(d => d.id === id);
  const next = computeNextStatus(doc.status);
  if (!next) return;

  if (next === 'Done'){
    if (kind === 'receipt'){
      doc.lines.forEach(l => { const p = db.products.find(x=>x.id===l.productId); p.stock[doc.warehouse] = (p.stock[doc.warehouse]||0) + l.qty; logMove('Receipt', doc.docNo, l.productId, l.qty, null, doc.warehouse, Date.now()); });
    } else if (kind === 'delivery'){
      for (const l of doc.lines){ const p = db.products.find(x=>x.id===l.productId); if ((p.stock[doc.warehouse]||0) < l.qty){ toast(`Not enough stock of ${p.name} at ${whName(doc.warehouse)} to validate.`, true); return; } }
      doc.lines.forEach(l => { const p = db.products.find(x=>x.id===l.productId); p.stock[doc.warehouse] -= l.qty; logMove('Delivery', doc.docNo, l.productId, -l.qty, doc.warehouse, null, Date.now()); });
    } else if (kind === 'transfer'){
      for (const l of doc.lines){ const p = db.products.find(x=>x.id===l.productId); if ((p.stock[doc.fromWarehouse]||0) < l.qty){ toast(`Not enough stock of ${p.name} at ${whName(doc.fromWarehouse)} to validate.`, true); return; } }
      doc.lines.forEach(l => { const p = db.products.find(x=>x.id===l.productId); p.stock[doc.fromWarehouse] -= l.qty; p.stock[doc.toWarehouse] = (p.stock[doc.toWarehouse]||0) + l.qty; logMove('Transfer', doc.docNo, l.productId, l.qty, doc.fromWarehouse, doc.toWarehouse, Date.now()); });
    }
    doc.validatedAt = Date.now();
    fireConfetti();
    unlockAchievement('first_' + kind);
    checkLedgerProAchievement();
  }
  doc.status = next; save(); toast(`${doc.docNo} marked as ${next}.`, next==='Done' ? 'success' : undefined); navigate(currentView);
}
function cancelDoc(kind, id){
  const doc = collectionFor(kind).find(d => d.id === id);
  doc.status = 'Cancelled'; save(); toast(`${doc.docNo} cancelled.`); navigate(currentView);
}

function renderKanbanBoard(kind){
  const collection = collectionFor(kind);
  const cols = ['Draft','Waiting','Ready','Done'];
  return `<div class="kanban-board">${cols.map(col => {
    const docs = collection.filter(d => d.status === col).sort((a,b)=>b.createdAt-a.createdAt);
    return `<div class="kanban-col">
      <div class="kanban-col-head"><span>${col}</span><span class="kanban-col-count">${docs.length}</span></div>
      <div class="kanban-col-body" data-col="${col}" data-kind="${kind}">
        ${docs.map(d => kanbanCardHtml(d, kind)).join('')}
      </div>
    </div>`;
  }).join('')}</div>`;
}
function kanbanCardHtml(doc, kind){
  let sub = '';
  if (kind === 'receipt') sub = doc.supplier;
  else if (kind === 'delivery') sub = doc.customer;
  else if (kind === 'transfer') sub = `${whName(doc.fromWarehouse)} → ${whName(doc.toWarehouse)}`;
  return `<div class="kanban-card" draggable="true" data-id="${doc.id}" data-kind="${kind}">
    <div class="kanban-card-ref">${doc.docNo}</div>
    <div class="kanban-card-sub">${escapeHtml(sub || '')}</div>
  </div>`;
}
function wireKanban(kind){
  document.querySelectorAll(`.kanban-card[data-kind="${kind}"]`).forEach(card => {
    card.addEventListener('dragstart', e => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', card.dataset.id); });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  document.querySelectorAll(`.kanban-col-body[data-kind="${kind}"]`).forEach(body => {
    body.addEventListener('dragover', e => { e.preventDefault(); body.classList.add('drag-over'); });
    body.addEventListener('dragleave', () => body.classList.remove('drag-over'));
    body.addEventListener('drop', e => {
      e.preventDefault(); body.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const targetCol = body.dataset.col;
      const doc = collectionFor(kind).find(d => d.id === id);
      if (!doc || doc.status === targetCol) return;
      const next = computeNextStatus(doc.status);
      if (targetCol !== next){ toast('Documents move one stage at a time — use the next column.', true); return; }
      advanceDoc(kind, id);
    });
  });
}

/* ============================================================
   MOVE HISTORY / LEDGER
   ============================================================ */
function renderLedger(){
  mount(`
    <div class="page-head"><div><h1>Move History</h1><div class="page-sub">Full stock ledger — every validated movement, in order</div></div>
      <div class="page-actions"><button class="btn btn-outline" id="export-ledger-csv-btn">⬇ Export CSV</button></div>
    </div>
    <div class="filter-row">
      <select id="lg-type"><option value="">All types</option><option>Receipt</option><option>Delivery</option><option>Transfer</option><option>Adjustment</option></select>
      <input id="lg-product" placeholder="Filter by product or SKU…">
    </div>
    <div class="panel"><table><thead><tr><th>Type</th><th>Reference</th><th>Product</th><th>From</th><th>To</th><th class="num">Qty</th><th>Date</th></tr></thead><tbody id="ledger-rows"></tbody></table></div>
  `);
  function currentRows(){
    const t = document.getElementById('lg-type').value, q = document.getElementById('lg-product').value.trim().toLowerCase();
    return db.ledger.filter(l => {
      if (t && l.type !== t) return false;
      if (q){ const name = productName(l.productId).toLowerCase(), sku = productSku(l.productId).toLowerCase(); if (!name.includes(q) && !sku.includes(q)) return false; }
      return true;
    });
  }
  function draw(){
    const rows = currentRows();
    document.getElementById('ledger-rows').innerHTML = rows.length ? rows.map(l => `
      <tr><td>${docTypeTag(l.type)}</td><td class="mono">${l.ref}</td><td>${productName(l.productId)} <span class="muted mono" style="font-size:11.5px;">${productSku(l.productId)}</span></td>
      <td class="muted">${l.from ? whName(l.from) : '—'}</td><td class="muted">${l.to ? whName(l.to) : '—'}</td>
      <td class="num" style="color:${l.delta<0?'var(--coral)':'var(--green)'}">${l.delta>0?'+':''}${l.delta}</td><td class="muted">${fmtDate(l.ts)}</td></tr>
    `).join('') : emptyRow(7, '≡', 'No movements recorded yet', 'Validate a document to see it appear in the ledger.');
  }
  document.getElementById('lg-type').addEventListener('change', draw);
  document.getElementById('lg-product').addEventListener('input', draw);
  document.getElementById('export-ledger-csv-btn').addEventListener('click', () => {
    const rows = currentRows();
    const header = ['Type','Reference','Product','SKU','From','To','Qty','Date'];
    const body = rows.map(l => [l.type, l.ref, productName(l.productId), productSku(l.productId), l.from?whName(l.from):'', l.to?whName(l.to):'', l.delta, fmtDate(l.ts)]);
    const csv = [header, ...body].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `stocksense-ledger-${Date.now()}.csv`; link.click();
    toast('Ledger exported as CSV.', 'success');
  });
  draw();
}

/* ============================================================
   SETTINGS
   ============================================================ */
function renderSettings(){
  mount(`
    <div class="page-head"><div><h1>Settings</h1><div class="page-sub">Manage warehouses and locations</div></div><div class="page-actions"><button class="btn btn-primary" id="add-wh-btn">+ New warehouse</button></div></div>
    <div class="panel"><div class="wh-list" id="wh-list"></div></div>
    <div style="margin-top:22px; display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn-ghost" id="reset-demo-btn">Reset demo data</button>
      <button class="btn btn-ghost" id="settings-theme-btn">Toggle theme</button>
      <button class="btn btn-ghost" id="settings-accent-btn">🎨 Change accent color</button>
    </div>
  `);
  function draw(){
    document.getElementById('wh-list').innerHTML = db.warehouses.length ? db.warehouses.map(w => `
      <div class="wh-row"><div><div class="wh-name">${escapeHtml(w.name)}</div><div class="wh-code">${w.code}</div></div><span class="muted" style="font-size:12.5px;">${db.products.reduce((a,p)=>a+stockAt(p,w.id),0)} units on hand</span></div>
    `).join('') : `<div class="empty-state"><div class="empty-state-ic">🏭</div><div class="empty-state-title">No warehouses yet</div><div class="empty-state-sub">Add one to start tracking stock by location.</div></div>`;
  }
  document.getElementById('add-wh-btn').addEventListener('click', () => {
    openModal('New warehouse', `
      <div class="form-grid"><div class="form-field full"><label>Name</label><input id="wf-name" placeholder="e.g. Warehouse 3"></div><div class="form-field full"><label>Short code</label><input id="wf-code" placeholder="e.g. WH3"></div></div>
    `, () => {
      const name = document.getElementById('wf-name').value.trim(), code = document.getElementById('wf-code').value.trim().toUpperCase();
      if (!name || !code){ toast('Name and code are required.', true); return false; }
      const id = uid('wh'); db.warehouses.push({ id, name, code }); db.products.forEach(p => p.stock[id] = 0);
      save(); toast('Warehouse added.', 'success'); unlockAchievement('expander'); draw(); return true;
    }, 'Add warehouse');
  });
  document.getElementById('reset-demo-btn').addEventListener('click', () => {
    if (confirm('This clears all data and reloads the original demo dataset. Continue?')){
      localStorage.removeItem(DB_KEY); seedDb(); toast('Demo data reset.'); navigate('dashboard');
    }
  });
  document.getElementById('settings-theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('settings-accent-btn').addEventListener('click', () => document.getElementById('accent-btn').click());
  draw();
}

/* ============================================================
   PROFILE
   ============================================================ */
function renderProfile(){
  const user = currentUser();
  mount(`
    <div class="page-head"><div><h1>My Profile</h1><div class="page-sub">Account details and progress for this session</div></div></div>
    <div class="panel profile-card">
      <div class="profile-head"><span class="avatar">${initialsOf(user.name)}</span><div><div style="font-weight:700; font-size:16px;">${escapeHtml(user.name)}</div><div class="muted" style="font-size:13px;">${user.role}</div></div></div>
      <div class="form-grid"><div class="form-field full"><label>Email</label><input value="${user.email}" disabled></div><div class="form-field full"><label>Role</label><input value="${user.role}" disabled></div></div>
    </div>
    <div class="chart-panel" style="margin-top:18px; max-width:520px;">
      <h3>Achievements — ${db.achievements.length}/${ACHIEVEMENTS.length}</h3>
      <div class="badge-shelf">${achievementShelfHtml()}</div>
    </div>
  `);
}

/* ============================================================
   Modal system
   ============================================================ */
function openModal(title, bodyHtml, onSave, saveLabel){
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-head"><h3>${title}</h3><button class="modal-close" id="modal-close">✕</button></div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-foot"><button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">${saveLabel || 'Save'}</button></div>
      </div>
    </div>
  `;
  function close(){ root.innerHTML = ''; }
  document.getElementById('modal-close').addEventListener('click', close);
  document.getElementById('modal-cancel').addEventListener('click', close);
  document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') close(); });
  document.getElementById('modal-save').addEventListener('click', () => { if (onSave() !== false) close(); });
}

/* ============================================================
   CONFETTI
   ============================================================ */
function fireConfetti(){
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#6C4DF6','#12C6B8','#FFA53E','#FF5D7A','#29B37B'];
  let pieces = Array.from({length: 110}, () => ({
    x: Math.random()*canvas.width, y: -20 - Math.random()*canvas.height*0.3,
    vx: (Math.random()-0.5)*3.4, vy: Math.random()*2.5+2.2, rot: Math.random()*360, vr:(Math.random()-0.5)*12,
    size: Math.random()*6+4, color: colors[Math.floor(Math.random()*colors.length)]
  }));
  let frames = 0;
  function loop(){
    frames++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6); ctx.restore();
    });
    if (frames < 120) requestAnimationFrame(loop); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  loop();
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
function openShortcuts(){ document.getElementById('shortcuts-overlay').classList.remove('hidden'); }
function closeShortcuts(){ document.getElementById('shortcuts-overlay').classList.add('hidden'); }
function initShortcutsModal(){
  document.getElementById('shortcuts-grid').innerHTML = KEYBOARD_SHORTCUTS.map(s => `
    <div class="shortcut-row"><span>${s.label}</span><span class="keys">${s.keys.map(k=>`<kbd>${k}</kbd>`).join('')}</span></div>
  `).join('');
  document.getElementById('shortcuts-close').addEventListener('click', closeShortcuts);
  document.getElementById('shortcuts-overlay').addEventListener('click', e => { if (e.target.id === 'shortcuts-overlay') closeShortcuts(); });
}
function initGlobalKeyboardShortcuts(){
  document.addEventListener('keydown', e => {
    const typing = isTypingTarget(e.target);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openCommandPalette(); return; }
    if (e.key === 'Escape'){
      closeCommandPalette(); closeShortcuts(); closeTour();
      document.getElementById('accent-panel').classList.add('hidden');
      document.getElementById('notif-panel').classList.add('hidden');
      return;
    }
    if (typing) return;
    if (e.key === '/'){ e.preventDefault(); document.getElementById('global-search').focus(); return; }
    if (e.key === '?'){ e.preventDefault(); openShortcuts(); return; }
    if (e.key.toLowerCase() === 't'){ toggleTheme(); return; }
    if (e.key.toLowerCase() === 's'){ takeScreenshot(); return; }
    if (e.key.toLowerCase() === 'g'){ startTour(); return; }
    const pages = ['dashboard','products','receipts','deliveries','transfers','adjustments','ledger'];
    const n = Number(e.key);
    if (n >= 1 && n <= pages.length){ location.hash = pages[n-1]; }
  });
}

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
let cmdkIndex = 0, cmdkItems = [];
function buildCommandItems(){
  const pages = [
    { ic:'▦', label:'Go to Dashboard', run: () => location.hash = 'dashboard' },
    { ic:'📊', label:'Go to Analytics', run: () => location.hash = 'analytics' },
    { ic:'▤', label:'Go to Products', run: () => location.hash = 'products' },
    { ic:'↓', label:'Go to Receipts', run: () => location.hash = 'receipts' },
    { ic:'↑', label:'Go to Delivery Orders', run: () => location.hash = 'deliveries' },
    { ic:'⇄', label:'Go to Internal Transfers', run: () => location.hash = 'transfers' },
    { ic:'±', label:'Go to Stock Adjustments', run: () => location.hash = 'adjustments' },
    { ic:'≡', label:'Go to Move History', run: () => location.hash = 'ledger' },
    { ic:'⚙', label:'Go to Settings', run: () => location.hash = 'settings' },
  ];
  const actions = [
    { ic:'+', label:'New receipt', meta:'action', run: () => { location.hash = 'receipts'; setTimeout(openReceiptModal, 60); } },
    { ic:'+', label:'New delivery order', meta:'action', run: () => { location.hash = 'deliveries'; setTimeout(openDeliveryModal, 60); } },
    { ic:'+', label:'New internal transfer', meta:'action', run: () => { location.hash = 'transfers'; setTimeout(openTransferModal, 60); } },
    { ic:'+', label:'New stock adjustment', meta:'action', run: () => { location.hash = 'adjustments'; setTimeout(openAdjustmentModal, 60); } },
    { ic:'+', label:'New product', meta:'action', run: () => { location.hash = 'products'; setTimeout(() => openProductModal(null), 60); } },
    { ic:'🎨', label:'Change accent color', meta:'action', run: () => document.getElementById('accent-btn').click() },
    { ic:'🔔', label:'Open notifications', meta:'action', run: () => document.getElementById('notif-btn').click() },
    { ic:'🌙', label:'Toggle light / dark theme', meta:'T', run: toggleTheme },
    { ic:'◧', label:'Take a screenshot', meta:'S', run: takeScreenshot },
    { ic:'▤', label:'Export PDF guide', meta:'action', run: exportPdf },
    { ic:'◎', label:'Start guided tour', meta:'G', run: startTour },
    { ic:'⌨', label:'Show keyboard shortcuts', meta:'?', run: openShortcuts },
  ];
  const products = db.products.map(p => ({ ic:'▤', label:`${p.name}`, meta: p.sku, run: () => { location.hash = 'products'; setTimeout(() => renderProducts(p.sku), 60); } }));
  return [...pages, ...actions, ...products];
}
function openCommandPalette(){
  cmdkItems = buildCommandItems(); cmdkIndex = 0;
  document.getElementById('cmdk-overlay').classList.remove('hidden');
  const input = document.getElementById('cmdk-input');
  input.value = ''; input.focus();
  renderCmdkResults(cmdkItems);
}
function closeCommandPalette(){ document.getElementById('cmdk-overlay').classList.add('hidden'); }
function renderCmdkResults(items){
  const root = document.getElementById('cmdk-results');
  root.innerHTML = items.length ? items.map((it,i) => `
    <div class="cmdk-item ${i===cmdkIndex?'active':''}" data-idx="${i}"><span class="cmdk-ic">${it.ic}</span><span>${escapeHtml(it.label)}</span>${it.meta?`<span class="cmdk-meta">${escapeHtml(it.meta)}</span>`:''}</div>
  `).join('') : `<div class="cmdk-empty">No matches.</div>`;
  root.querySelectorAll('.cmdk-item').forEach(el => {
    el.addEventListener('click', () => { items[Number(el.dataset.idx)].run(); closeCommandPalette(); });
  });
}
function initCommandPalette(){
  document.getElementById('cmdk-overlay').addEventListener('click', e => { if (e.target.id === 'cmdk-overlay') closeCommandPalette(); });
  const input = document.getElementById('cmdk-input');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const filtered = buildCommandItems().filter(it => it.label.toLowerCase().includes(q) || (it.meta||'').toLowerCase().includes(q));
    cmdkItems = filtered; cmdkIndex = 0; renderCmdkResults(filtered);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); cmdkIndex = Math.min(cmdkIndex+1, cmdkItems.length-1); renderCmdkResults(cmdkItems); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); cmdkIndex = Math.max(cmdkIndex-1, 0); renderCmdkResults(cmdkItems); }
    else if (e.key === 'Enter'){ e.preventDefault(); if (cmdkItems[cmdkIndex]){ cmdkItems[cmdkIndex].run(); closeCommandPalette(); } }
  });
}

/* ============================================================
   GUIDED TOUR
   ============================================================ */
let tourIdx = 0;
function startTour(){
  localStorage.setItem(TOUR_SEEN_KEY, '1');
  tourIdx = 0;
  document.getElementById('tour-overlay').classList.remove('hidden');
  showTourStep();
}
function closeTour(){ document.getElementById('tour-overlay').classList.add('hidden'); }
function showTourStep(){
  const step = TOUR_STEPS[tourIdx];
  const target = document.querySelector(step.selector);
  const spot = document.getElementById('tour-spotlight');
  const card = document.getElementById('tour-card');

  if (target){
    const r = target.getBoundingClientRect();
    spot.style.left = (r.left-6)+'px'; spot.style.top = (r.top-6)+'px';
    spot.style.width = (r.width+12)+'px'; spot.style.height = (r.height+12)+'px';
    spot.classList.remove('hidden');
    let top = r.bottom + 14, left = r.left;
    if (top + 200 > window.innerHeight) top = Math.max(14, r.top - 210);
    if (left + 320 > window.innerWidth) left = window.innerWidth - 336;
    card.style.top = top + 'px'; card.style.left = Math.max(14,left) + 'px';
  } else {
    spot.classList.add('hidden');
    card.style.top = '40%'; card.style.left = '50%'; card.style.transform = 'translate(-50%,-50%)';
  }
  document.getElementById('tour-step-count').textContent = `Step ${tourIdx+1} of ${TOUR_STEPS.length}`;
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-text').textContent = step.text;
  document.getElementById('tour-prev').disabled = tourIdx === 0;
  document.getElementById('tour-next').textContent = tourIdx === TOUR_STEPS.length-1 ? 'Finish' : 'Next';
}
function initTourControls(){
  document.getElementById('tour-next').addEventListener('click', () => {
    if (tourIdx === TOUR_STEPS.length-1){ closeTour(); toast('Tour complete — you know your way around now.', 'success'); return; }
    tourIdx++; showTourStep();
  });
  document.getElementById('tour-prev').addEventListener('click', () => { if (tourIdx>0){ tourIdx--; showTourStep(); } });
  document.getElementById('tour-skip').addEventListener('click', closeTour);
  window.addEventListener('resize', () => { if (!document.getElementById('tour-overlay').classList.contains('hidden')) showTourStep(); });
}

/* ============================================================
   SCREENSHOT EXPORT
   ============================================================ */
function takeScreenshot(){
  if (typeof html2canvas === 'undefined'){ toast('Screenshot library failed to load — check your connection.', true); return; }
  const user = currentUser();
  const target = document.getElementById('app-content');
  toast('Capturing screenshot…');
  html2canvas(target, { backgroundColor: getComputedStyle(document.body).backgroundColor, scale: 2 }).then(canvas => {
    const stamped = document.createElement('canvas');
    stamped.width = canvas.width; stamped.height = canvas.height + 60;
    const ctx = stamped.getContext('2d');
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
    ctx.fillRect(0,0,stamped.width, stamped.height);
    ctx.drawImage(canvas, 0, 0);
    ctx.fillStyle = '#171332';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`StockSense — exported by ${user ? user.name : 'guest'}`, 20, canvas.height + 38);
    ctx.font = '16px sans-serif'; ctx.fillStyle = '#635E85';
    ctx.fillText(new Date().toLocaleString(), stamped.width - 260, canvas.height + 38);
    const link = document.createElement('a');
    link.download = `stocksense-${currentView}-${Date.now()}.png`;
    link.href = stamped.toDataURL('image/png');
    link.click();
    toast('Screenshot downloaded.', 'success');
  }).catch(() => toast('Could not capture screenshot.', true));
}

/* ============================================================
   PDF GUIDE EXPORT
   ============================================================ */
function exportPdf(){
  if (typeof window.jspdf === 'undefined'){ toast('PDF library failed to load — check your connection.', true); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  const user = currentUser();
  const margin = 54, pageW = 595, maxW = pageW - margin*2;
  let y = 70;

  function addPageIfNeeded(lineHeight){
    if (y + lineHeight > 780){ doc.addPage(); y = 60; }
  }
  function heading(text, size){
    addPageIfNeeded(size+16);
    doc.setFont('helvetica','bold'); doc.setFontSize(size); doc.setTextColor('#171332');
    doc.text(text, margin, y); y += size + 12;
  }
  function paragraph(text){
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor('#333');
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach(line => { addPageIfNeeded(16); doc.text(line, margin, y); y += 16; });
    y += 8;
  }
  function bullet(text){
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor('#333');
    const lines = doc.splitTextToSize('•  ' + text, maxW - 10);
    lines.forEach((line,i) => { addPageIfNeeded(16); doc.text(line, margin + (i===0?0:12), y); y += 16; });
  }

  doc.setFillColor('#171332'); doc.rect(0,0,pageW,140,'F');
  doc.setTextColor('#fff'); doc.setFont('helvetica','bold'); doc.setFontSize(26);
  doc.text('StockSense', margin, 70);
  doc.setFontSize(12); doc.setFont('helvetica','normal'); doc.setTextColor('#C1B8E8');
  doc.text('Inventory Management System — concept guide, from scratch to advanced', margin, 92);
  doc.setFontSize(10.5); doc.setTextColor('#8FE0D6');
  doc.text(`Prepared for: ${user ? user.name : 'Guest user'}   ·   Generated: ${new Date().toLocaleString()}`, margin, 116);
  y = 175;

  heading('1. What is an inventory management system?', 15);
  paragraph('An inventory management system (IMS) is the software layer that replaces manual registers and spreadsheets for tracking physical stock. Instead of separate, disconnected records for what came in, what went out, and what was recounted, every movement is written to a single ledger. That ledger is the one source of truth a business can trust when deciding what to reorder, what to ship, and where a specific unit physically sits right now.');

  heading('2. The core stock cycle', 15);
  paragraph('StockSense is built around four document types that cover the entire lifecycle of a unit of stock:');
  bullet('Receipts — incoming goods from a supplier. Validating a receipt increases stock at the destination warehouse.');
  bullet('Delivery orders — outgoing goods to a customer. Validating a delivery decreases stock, and the system blocks the action if there isn\'t enough stock to fulfil it.');
  bullet('Internal transfers — stock moved between warehouses or locations (e.g. Main Warehouse → Production Floor). The total company-wide stock is unchanged, but the location record updates.');
  bullet('Stock adjustments — reconciling a physical count against what the system believes is on the shelf. The difference (counted minus system) is calculated and logged automatically.');
  y += 4;

  heading('3. Document workflow states', 15);
  paragraph('Every receipt, delivery and transfer moves through the same lifecycle so nothing is applied to stock prematurely: Draft (created, not yet actioned) → Waiting (queued) → Ready (prepared, e.g. picked and packed) → Done (validated — stock has moved) or Cancelled at any point before Done. Only a "Done" document has actually changed a stock number; everything before that is a plan. Every document list can also be viewed as a drag-and-drop board, moving cards through these same stages.');

  heading('4. Multi-warehouse support', 15);
  paragraph('Stock in StockSense is tracked per warehouse, not as one global number. A product\'s "total stock" is the sum across every warehouse, but reordering, transfers and delivery checks all operate at the individual warehouse level — which is what makes internal transfers meaningful.');

  heading('5. Low-stock alerts and reorder points', 15);
  paragraph('Each product carries a reorder point — the total quantity below which it is considered "low stock". The dashboard, notification bell and Analytics page all surface low-stock and out-of-stock counts so a manager can act before a shortage actually happens.');

  heading('6. The stock ledger — the advanced part', 15);
  paragraph('Every validated movement, regardless of which document created it, is written as one immutable entry in the Move History ledger: type, reference document, product, quantity delta, source location, destination location, and timestamp. The Analytics page turns this same ledger into a category breakdown, a status-mix chart and a 7-day activity trend.');

  heading('7. This build\'s feature set', 15);
  bullet('Role-based accounts for Inventory Managers and Warehouse Staff, with OTP-based password reset.');
  bullet('A live, filterable dashboard (by document type, status, warehouse and category) plus an Analytics page with animated charts.');
  bullet('Table and drag-and-drop board views for receipts, deliveries and transfers.');
  bullet('A command palette (Ctrl+K) for keyboard-first navigation across pages, products and actions.');
  bullet('An accent color picker, full light/dark theming, a notification center, achievement badges, a guided product tour, and this exportable PDF explainer.');
  bullet('Screenshot and CSV export, and 100% client-side data persistence — it runs with no backend.');
  y += 10;

  heading('8. Live snapshot at export time', 15);
  const total = db.products.length, low = db.products.filter(isLow).length, out = db.products.filter(isOut).length;
  paragraph(`At the moment this PDF was generated, the system holds ${total} products across ${db.warehouses.length} warehouse(s), with ${low} product(s) running low and ${out} out of stock. ${db.achievements.length} of ${ACHIEVEMENTS.length} achievements have been unlocked so far.`);

  addPageIfNeeded(200);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor('#171332');
  doc.text('Product', margin, y); doc.text('SKU', margin+220, y); doc.text('Category', margin+310, y); doc.text('Total stock', margin+430, y);
  y += 6; doc.setDrawColor('#E4DFF7'); doc.line(margin, y, pageW-margin, y); y += 14;
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor('#333');
  db.products.forEach(p => {
    addPageIfNeeded(16);
    doc.text(p.name.slice(0,32), margin, y);
    doc.text(p.sku, margin+220, y);
    doc.text(p.category, margin+310, y);
    doc.text(String(totalStock(p)), margin+430, y);
    y += 16;
  });

  y += 16; addPageIfNeeded(30);
  doc.setFont('helvetica','italic'); doc.setFontSize(10); doc.setTextColor('#8A8A8A');
  doc.text('Generated by StockSense — a hackathon project by Aryan Das, Pranay Kathpaul & Chandan Singh.', margin, y);

  doc.save(`StockSense-Guide-${user ? user.name.replace(/\s+/g,'-') : 'guest'}.pdf`);
  toast('PDF guide downloaded.', 'success');
}

/* ============================================================
   Boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAccent();
  initRipples();
  loadDb();
  initLanding();
  initCinema();
  initAuthScreen();
  initTourControls();
  runSplash();
});
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
let users=LS('ss_users')||[{name:'Demo Manager',email:'demo@stocksense.app',pw:'demo123',role:'Inventory Manager'}];
const P=(id,name,cat,qty,min)=>({id,sku:'SKU-'+id,name,cat,qty,min});
let db=LS('ss_db')||{products:[P(1,'Steel Bolts M8','Hardware',240,50),P(2,'Copper Wire 2mm','Electrical',35,40),P(3,'LED Panel 60W','Electrical',120,30),P(4,'Safety Gloves','Safety',12,25),P(5,'Pallet Wrap','Packaging',300,80),P(6,'Cordless Drill','Tools',0,10)],
 docs:[{id:1,t:'receipts',ref:'REC-001',pid:2,qty:100,st:'ready'},{id:2,t:'deliveries',ref:'DEL-001',pid:1,qty:40,st:'waiting'},{id:3,t:'transfers',ref:'TRF-001',pid:3,qty:20,st:'draft'}],
 ledger:[{t:'receipts',ref:'REC-000',pid:5,qty:200,at:Date.now()-864e5}]};
const save=()=>{LS('ss_users',users);LS('ss_db',db)};
let me=LS('ss_sess'),search='';
const TYPES={receipts:['Receipts','receipt'],deliveries:['Delivery Orders','delivery'],transfers:['Internal Transfers','transfer'],adjustments:['Stock Adjustments','adjust']};
const pn=id=>(db.products.find(p=>p.id==id)||{}).name||'?';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- toast / confetti / ripple ---------- */
function toast(msg,type='success'){const t=document.createElement('div');t.className='toast toast-'+type;t.innerHTML=`<span class="toast-ic">${type=='error'?'⚠':'✓'}</span><span>${esc(msg)}</span><i class="toast-bar"></i>`;$('#toast-root').append(t);setTimeout(()=>{t.classList.add('toast-leaving');setTimeout(()=>t.remove(),260)},3200)}
function confetti(n=140){const c=$('#confetti-canvas'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const cols=['#6C4DF6','#12C6B8','#FFA53E','#FF5D7A','#ff9a63'];
 const ps=Array.from({length:n},()=>({x:innerWidth/2,y:innerHeight*.6,vx:(Math.random()-.5)*16,vy:-Math.random()*16-4,s:Math.random()*8+4,r:Math.random()*6,c:cols[Math.random()*5|0]}));let f=0;
 (function t(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=.2;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++f<130)requestAnimationFrame(t);else x.clearRect(0,0,c.width,c.height)})()}
document.addEventListener('click',e=>{const b=e.target.closest('.btn,.icon-btn,.chip,.tool-btn,.send-btn,.fab');if(!b)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height),s=document.createElement('span');s.className='ripple';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.append(s);setTimeout(()=>s.remove(),600)});

/* ---------- animated canvas scene ---------- */
function scene(id){const c=$(id),x=c.getContext('2d');let m={x:.5,y:.5};const ps=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),z:Math.random()*.8+.2,p:Math.random()*6}));
 addEventListener('mousemove',e=>m={x:e.clientX/innerWidth,y:e.clientY/innerHeight});
 (function t(){requestAnimationFrame(t);if(!c.offsetParent&&getComputedStyle(c).position!=='fixed')return;if(c.parentElement.classList.contains('hidden'))return;
  const W=c.width=innerWidth,H=c.height=innerHeight,T=Date.now()/1000;const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0e24');g.addColorStop(.6,'#3a1f5c');g.addColorStop(1,'#ff7d4a');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,190,130,.9)';x.beginPath();x.arc(W*.5+(m.x-.5)*30,H*.72,60,0,7);x.fill();
  for(let k=0;k<3;k++){x.fillStyle=`rgba(10,12,36,${.35+k*.2})`;x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=20)x.lineTo(i,H*(.8+k*.07)+Math.sin(i/90+T*(.6+k*.3)+k)*10);x.lineTo(W,H);x.fill()}
  ps.forEach(p=>{const px=((p.x+T*.01*p.z)%1)*W+(m.x-.5)*60*p.z,py=p.y*H*.7+Math.sin(T+p.p)*8;x.fillStyle=`rgba(255,255,255,${.3+.5*Math.abs(Math.sin(T*p.z+p.p))})`;x.beginPath();x.arc(px,py,p.z*1.8,0,7);x.fill()})})()}

/* ---------- screens ---------- */
const screens=['#splash-screen','#landing','#auth-screen','#app-shell'];
function show(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id&&!(s==='#splash-screen'&&id==='#landing'&&false)));$('#splash-screen').classList.add('fade-out');scrollTo(0,0)}
function authGo(f){$$('.auth-form').forEach(x=>x.classList.add('hidden'));const el=$('#'+{login:'login-form',signup:'signup-form',reset:'reset-request-form',verify:'reset-verify-form'}[f]);el.classList.remove('hidden');el.classList.add('swap');setTimeout(()=>el.classList.remove('swap'),500)}
function openAuth(f='login'){show('#auth-screen');authGo(f)}
function enterApp(){show('#app-shell');const sh=$('#app-shell');sh.classList.remove('enter');void sh.offsetWidth;sh.classList.add('enter');$$('.nav-link').forEach((a,i)=>a.style.setProperty('--i',i));
 $('#sidebar-avatar').textContent=me.name[0].toUpperCase();$('#sidebar-name').textContent=me.name;$('#sidebar-role').textContent=me.role;
 const w=document.createElement('div');w.className='welcome';w.innerHTML=`<div class="w-logo">SS</div><h2>Welcome, ${esc(me.name.split(' ')[0])}!</h2><p>Loading your warehouse control tower…</p>`;document.body.append(w);setTimeout(()=>{w.remove();confetti(110)},2500);
 if(!location.hash)location.hash='#dashboard';route()}
function login(u){me=u;LS('ss_sess',u);enterApp()}

/* ---------- views ---------- */
const low=()=>db.products.filter(p=>p.qty<=p.min);
const stBadge=s=>`<span class="badge badge-${s}">${s}</span>`;
const empty=(t,s)=>`<div class="empty-state"><div class="empty-state-ic">∅</div><div class="empty-state-title">${t}</div><div class="empty-state-sub">${s}</div></div>`;
const V={
dashboard(){const tot=db.products.reduce((a,p)=>a+p.qty,0),pend=db.docs.filter(d=>d.st!='done').length;
 const k=[['Total units',tot,'ok'],['Products',db.products.length,'ok'],['Low stock',low().filter(p=>p.qty>0).length,'warn'],['Out of stock',db.products.filter(p=>!p.qty).length,'bad'],['Pending docs',pend,'warn']];
 return `<div class="greet"><h1>Hello, ${esc(me.name.split(' ')[0])} <span class="wave">👋</span></h1><p>Here's what's happening across your warehouses today.</p></div>
 <div class="kpi-strip">${k.map((a,i)=>`<div class="kpi accent-${a[2]}" style="--i:${i}"><div class="kpi-label">${a[0]}</div><div class="kpi-value" data-count="${a[1]}">0</div></div>`).join('')}</div>
 <div class="panel"><div class="panel-head"><h3>Recent movements</h3></div><div class="timeline">${db.ledger.slice(-6).reverse().map((l,i)=>`<div class="tl-item pop-row" style="--i:${i}"><span class="tl-dot"></span><div><b>${l.ref}</b> · ${esc(pn(l.pid))} <span class="mono">${l.qty>0?'+':''}${l.qty}</span><div class="muted">${new Date(l.at).toLocaleString()}</div></div></div>`).join('')||empty('No movements yet','Validate a document to see it here.')}</div></div>`},
analytics(){const cats={};db.products.forEach(p=>cats[p.cat]=(cats[p.cat]||0)+p.qty);const mx=Math.max(...Object.values(cats),1);
 return `<div class="page-head"><div><h1>Analytics</h1><div class="page-sub">Stock by category</div></div></div><div class="chart-panel"><div class="bar-chart">${Object.entries(cats).map(([c,v],i)=>`<div class="bar-col"><b class="mono">${v}</b><div class="bar" style="--h:${v/mx*85}%;--i:${i}"></div><span>${c}</span></div>`).join('')}</div></div>`},
products(){const l=db.products.filter(p=>(p.name+p.sku).toLowerCase().includes(search));
 return `<div class="page-head"><div><h1>Products</h1><div class="page-sub">${l.length} items</div></div><div class="page-actions"><button class="btn btn-primary" data-act="new-product">+ New product</button></div></div>
 <div class="panel"><table><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th class="num">Stock</th></tr></thead><tbody>${l.map((p,i)=>`<tr class="pop-row" style="--i:${i}"><td><b>${esc(p.name)}</b></td><td class="mono">${p.sku}</td><td>${p.cat}</td><td class="num">${p.qty}<span class="stock-bar"><span class="stock-bar-fill ${p.qty==0?'out':p.qty<=p.min?'low':''}" style="display:block;width:${Math.min(100,p.qty/(p.min*4||1)*100)}%"></span></span></td></tr>`).join('')||`<tr><td colspan=4>${empty('No products','Try another search.')}</td></tr>`}</tbody></table></div>`},
doc(t){const[nm]=TYPES[t],l=db.docs.filter(d=>d.t==t);
 return `<div class="page-head"><div><h1>${nm}</h1><div class="page-sub">${l.length} documents</div></div><div class="page-actions"><button class="btn btn-primary" data-act="new-doc" data-t="${t}">+ New</button></div></div>
 <div class="panel"><table><thead><tr><th>Reference</th><th>Product</th><th class="num">Qty</th><th>Status</th><th></th></tr></thead><tbody>${l.map((d,i)=>`<tr class="pop-row" style="--i:${i}"><td class="mono">${d.ref}</td><td>${esc(pn(d.pid))}</td><td class="num">${d.qty}</td><td>${stBadge(d.st)}</td><td><div class="row-actions">${d.st!='done'?`<button class="btn btn-outline btn-sm" data-act="validate" data-id="${d.id}">Validate</button>`:''}</div></td></tr>`).join('')||`<tr><td colspan=5>${empty('Nothing here','Create your first document.')}</td></tr>`}</tbody></table></div>`},
ledger(){return `<div class="page-head"><div><h1>Move History</h1></div></div><div class="panel"><table><thead><tr><th>When</th><th>Ref</th><th>Product</th><th class="num">Change</th></tr></thead><tbody>${[...db.ledger].reverse().map((l,i)=>`<tr class="pop-row" style="--i:${i}"><td class="muted">${new Date(l.at).toLocaleString()}</td><td class="mono">${l.ref}</td><td>${esc(pn(l.pid))}</td><td class="num">${l.qty>0?'+':''}${l.qty}</td></tr>`).join('')||`<tr><td colspan=4>${empty('No history','')}</td></tr>`}</tbody></table></div>`},
settings(){return `<div class="page-head"><h1>Settings</h1></div><div class="panel"><div class="wh-list">${['Main Warehouse|WH-01','Rack Annex|WH-02'].map(w=>{const[a,b]=w.split('|');return `<div class="wh-row"><span class="wh-name">${a}</span><span class="wh-code">${b}</span></div>`}).join('')}</div></div>`},
profile(){return `<div class="page-head"><h1>My Profile</h1></div><div class="panel profile-card"><div class="profile-head"><span class="avatar">${me.name[0]}</span><div><h3>${esc(me.name)}</h3><div class="muted">${esc(me.email)} · ${me.role}</div></div></div><button class="btn btn-danger" id="p-logout">Logout</button></div>`}};
function route(){if(!me)return;const v=(location.hash||'#dashboard').slice(1);$$('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.view==v));
 const m=$('#app-content');m.innerHTML=TYPES[v]?V.doc(v):(V[v]||V.dashboard)();m.style.animation='none';void m.offsetWidth;m.style.animation='';$('#sidebar').classList.remove('open');
 $$('[data-count]').forEach(el=>{const to=+el.dataset.count;let s=null;(function f(t){s=s||t;const p=Math.min((t-s)/1000,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(performance.now())});
 $('#topbar-alert').textContent=low().length?`${low().length} low-stock`:'';$('#notif-dot').classList.toggle('hidden',!low().length)}

/* ---------- modal & actions ---------- */
function modal(title,body,ok){const r=$('#modal-root');r.innerHTML=`<div class="modal-overlay"><div class="modal"><div class="modal-head"><h3>${title}</h3><button class="modal-close">✕</button></div><div class="modal-body">${body}</div><div class="modal-foot"><button class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-primary" data-ok>Save</button></div></div></div>`;
 const c=()=>r.innerHTML='';r.querySelector('.modal-close').onclick=r.querySelector('[data-x]').onclick=c;r.querySelector('.modal-overlay').onclick=e=>{if(e.target.classList.contains('modal-overlay'))c()};r.querySelector('[data-ok]').onclick=()=>{if(ok(r)!==false)c()}}
const popts=()=>db.products.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
 if(act=='new-product')modal('New product',`<div class="form-grid"><div class="form-field full"><label>Name</label><input id="f-n"></div><div class="form-field"><label>Category</label><input id="f-c"></div><div class="form-field"><label>Initial stock</label><input id="f-q" type="number" value="0"></div></div>`,r=>{const n=$('#f-n').value.trim();if(!n){toast('Name required','error');return false}const id=Date.now();db.products.push(P(id,n,$('#f-c').value||'General',+$('#f-q').value||0,10));save();route();toast('Product added')});
 if(act=='new-doc'){const t=a.dataset.t;modal('New '+TYPES[t][0],`<div class="form-grid"><div class="form-field full"><label>Product</label><select id="f-p">${popts()}</select></div><div class="form-field"><label>${t=='adjustments'?'Change (+/−)':'Quantity'}</label><input id="f-q" type="number" value="1"></div></div>`,r=>{const q=+$('#f-q').value;if(!q){toast('Enter a quantity','error');return false}db.docs.push({id:Date.now(),t,ref:TYPES[t][1].slice(0,3).toUpperCase()+'-'+String(db.docs.length+1).padStart(3,'0'),pid:+$('#f-p').value,qty:q,st:'ready'});save();route();toast('Document created')})}
 if(act=='validate'){const d=db.docs.find(x=>x.id==a.dataset.id),p=db.products.find(x=>x.id==d.pid);let ch=0;if(d.t=='receipts')ch=d.qty;if(d.t=='deliveries'){if(p.qty<d.qty){const r=a.closest('tr');r.classList.add('shake');toast('Not enough stock to ship','error');return}ch=-d.qty}if(d.t=='adjustments')ch=d.qty;
  p.qty+=ch;d.st='done';db.ledger.push({t:d.t,ref:d.ref,pid:d.pid,qty:ch,at:Date.now()});save();route();toast(d.ref+' validated');confetti(60)}});
document.addEventListener('click',e=>{if(e.target.id=='p-logout')logout()});
function logout(){me=null;LS('ss_sess',null);openAuth('login');toast('Signed out')}

/* ---------- command palette, shortcuts, tour, popovers ---------- */
let ci=0,cl=[];
function cmdk(open){const o=$('#cmdk-overlay');o.classList.toggle('hidden',!open);if(open){$('#cmdk-input').value='';cmRender();$('#cmdk-input').focus()}}
function cmRender(){const q=$('#cmdk-input').value.toLowerCase();const all=[...['dashboard','analytics','products',...Object.keys(TYPES),'ledger','settings'].map(v=>({n:'Go to '+v,ic:'→',f:()=>location.hash='#'+v})),...db.products.map(p=>({n:p.name,ic:'▤',m:p.qty+' in stock',f:()=>{search=p.name.toLowerCase();location.hash='#products';route()}})),{n:'Toggle theme',ic:'◐',f:theme},{n:'Logout',ic:'⏻',f:logout}];
 cl=all.filter(i=>i.n.toLowerCase().includes(q)).slice(0,8);ci=0;$('#cmdk-results').innerHTML=cl.map((i,k)=>`<div class="cmdk-item ${k?'':'active'}" data-k="${k}"><span class="cmdk-ic">${i.ic}</span>${esc(i.n)}<span class="cmdk-meta">${i.m||''}</span></div>`).join('')||'<div class="cmdk-empty">No results</div>'}
$('#cmdk-input').oninput=cmRender;$('#cmdk-results').onclick=e=>{const i=e.target.closest('.cmdk-item');if(i){cmdk(false);cl[i.dataset.k].f()}};
function theme(){const h=document.documentElement,d=h.dataset.theme=='dark'?'light':'dark';h.dataset.theme=d;LS('ss_theme',d);$$('#theme-toggle,#land-theme-toggle').forEach(b=>b.textContent=d=='dark'?'☀️':'🌙')}
const tourSteps=[['.sidebar-nav','Navigation','Every stock operation lives in this sidebar.'],['#global-search','Search','Press / to search products and documents instantly.'],['#cmdk-btn','Command palette','Ctrl+K jumps anywhere in a keystroke.'],['#notif-btn','Alerts','Low-stock warnings appear here.']];let ti=0;
function tour(n){if(n<0||n>=tourSteps.length){$('#tour-overlay').classList.add('hidden');return}ti=n;const[s,t,x]=tourSteps[n],r=$(s).getBoundingClientRect(),sp=$('#tour-spotlight'),c=$('#tour-card');$('#tour-overlay').classList.remove('hidden');
 Object.assign(sp.style,{left:r.left-6+'px',top:r.top-6+'px',width:r.width+12+'px',height:r.height+12+'px'});c.style.left=Math.min(innerWidth-340,Math.max(10,r.right+20))+'px';c.style.top=Math.min(innerHeight-220,Math.max(10,r.top))+'px';
 $('#tour-step-count').textContent=`STEP ${n+1} / ${tourSteps.length}`;$('#tour-title').textContent=t;$('#tour-text').textContent=x;$('#tour-next').textContent=n==tourSteps.length-1?'Finish':'Next'}
const SC=[['Command palette','Ctrl','K'],['Focus search','/'],['Close dialogs','Esc']];
$('#shortcuts-grid').innerHTML=SC.map(s=>`<div class="shortcut-row"><span>${s[0]}</span><span class="keys">${s.slice(1).map(k=>`<kbd>${k}</kbd>`).join('')}</span></div>`).join('');
const cols=['#6C4DF6','#12C6B8','#FFA53E','#FF5D7A','#29B37B'];
$('#accent-panel').innerHTML=`<div class="accent-panel-title">Accent colour</div><div class="accent-swatches">${cols.map(c=>`<span class="accent-swatch" style="background:${c}" data-c="${c}"></span>`).join('')}</div>`;
$('#accent-panel').onclick=e=>{const c=e.target.dataset.c;if(!c)return;const h=document.documentElement;h.dataset.accent=1;h.style.setProperty('--accent-2',c);h.style.setProperty('--accent-2-tint',c+'22');$$('.accent-swatch').forEach(s=>s.classList.toggle('active',s.dataset.c==c))};
function pop(btn,panel,fill){$(btn).onclick=e=>{e.stopPropagation();const p=$(panel);if(fill)fill(p);$$('.accent-panel,.notif-panel').forEach(x=>x!==p&&x.classList.add('hidden'));p.classList.toggle('hidden')}}
pop('#accent-btn','#accent-panel');pop('#notif-btn','#notif-panel',p=>p.innerHTML=`<div class="notif-head">Notifications</div>`+(low().map(x=>`<div class="notif-item"><span class="notif-ic ${x.qty?'warn':'bad'}">!</span><div class="notif-text">${esc(x.name)} ${x.qty?'is low ('+x.qty+' left)':'is out of stock'}</div></div>`).join('')||'<div class="notif-empty">All good 🎉</div>'));
document.addEventListener('click',e=>{if(!e.target.closest('.topbar-popover-wrap'))$$('.accent-panel,.notif-panel').forEach(x=>x.classList.add('hidden'));if(!e.target.closest('.sidebar-footer'))$('#profile-menu').classList.add('hidden')});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key=='k'){e.preventDefault();if(me)cmdk(true)}
 else if(e.key=='Escape'){cmdk(false);$('#shortcuts-overlay').classList.add('hidden');tour(-1)}
 else if(e.key=='/'&&me&&!/INPUT|SELECT/.test(e.target.tagName)){e.preventDefault();$('#global-search').focus()}
 else if(!$('#cmdk-overlay').classList.contains('hidden')){if(e.key=='ArrowDown'||e.key=='ArrowUp'){e.preventDefault();ci=(ci+(e.key=='ArrowDown'?1:cl.length-1))%cl.length;$$('.cmdk-item').forEach((x,k)=>x.classList.toggle('active',k==ci))}if(e.key=='Enter'&&cl[ci]){cmdk(false);cl[ci].f()}}});

/* ---------- wiring ---------- */
$('#cmdk-btn').onclick=()=>cmdk(true);$('#cmdk-overlay').onclick=e=>{if(e.target.id=='cmdk-overlay')cmdk(false)};
$('#shortcuts-btn').onclick=()=>$('#shortcuts-overlay').classList.remove('hidden');$('#shortcuts-close').onclick=()=>$('#shortcuts-overlay').classList.add('hidden');
$('#tour-btn').onclick=()=>tour(0);$('#tour-next').onclick=()=>tour(ti+1);$('#tour-prev').onclick=()=>tour(ti-1);$('#tour-skip').onclick=()=>tour(-1);
$('#theme-toggle').onclick=$('#land-theme-toggle').onclick=theme;
$('#menu-toggle').onclick=()=>$('#sidebar').classList.toggle('open');$('#fab-btn').onclick=()=>{location.hash='#products';setTimeout(()=>document.querySelector('[data-act=new-product]').click(),50)};
$('#profile-btn').onclick=e=>{e.stopPropagation();$('#profile-menu').classList.toggle('hidden')};$('#logout-btn').onclick=logout;
$('#global-search').oninput=e=>{search=e.target.value.toLowerCase();if(location.hash!='#products')location.hash='#products';else route()};
$('#screenshot-btn').onclick=()=>html2canvas($('#app-content')).then(c=>{const a=document.createElement('a');a.download='stocksense.png';a.href=c.toDataURL();a.click();toast('Screenshot saved')});
$('#pdf-btn').onclick=()=>{const d=new jspdf.jsPDF();d.text('StockSense — '+me.name,14,16);db.products.forEach((p,i)=>d.text(`${p.name} — ${p.qty}`,14,30+i*8));d.save('stocksense.pdf');toast('PDF exported')};
addEventListener('hashchange',route);
$('#land-login-btn').onclick=$('#footer-login-link').onclick=e=>{e.preventDefault();openAuth('login')};$('#land-signup-btn').onclick=$('#hero-signup-chip').onclick=()=>openAuth('signup');
$('#auth-back-btn').onclick=()=>show('#landing');
$$('[data-go]').forEach(a=>a.onclick=e=>{e.preventDefault();authGo(a.dataset.go)});
$('#demo-login-btn').onclick=$('#hero-demo-btn').onclick=()=>login(users[0]);
$('#hero-tour-btn').onclick=()=>{login(users[0]);setTimeout(()=>tour(0),3200)};
$('#login-form').onsubmit=e=>{e.preventDefault();const u=users.find(x=>x.email==$('#login-email').value.trim().toLowerCase()&&x.pw==$('#login-password').value);if(u)login(u);else{$('.auth-panel').classList.remove('shake');void $('.auth-panel').offsetWidth;$('.auth-panel').classList.add('shake');toast('Wrong email or password','error')}};
$('#signup-form').onsubmit=e=>{e.preventDefault();const em=$('#signup-email').value.trim().toLowerCase();if($('#signup-password').value.length<6)return toast('Password needs 6+ characters','error');if(users.some(u=>u.email==em))return toast('Email already registered','error');
 const u={name:$('#signup-name').value.trim(),email:em,pw:$('#signup-password').value,role:$('#signup-role').value};users.push(u);save();login(u)};
let otp,rEmail;
$('#reset-request-form').onsubmit=e=>{e.preventDefault();rEmail=$('#reset-email').value.trim().toLowerCase();if(!users.some(u=>u.email==rEmail))return toast('No account with that email','error');otp=String(Math.random()*9e5+1e5|0);$('#otp-hint').textContent='Demo code (no email server): '+otp;authGo('verify')};
$('#reset-verify-form').onsubmit=e=>{e.preventDefault();if($('#reset-otp').value!=otp)return toast('Incorrect code','error');const pw=$('#reset-new-password').value;if(pw.length<6)return toast('Password needs 6+ characters','error');users.find(u=>u.email==rEmail).pw=pw;save();toast('Password updated');authGo('login')};

/* ---------- landing content & motion ---------- */
$('#footer-year').textContent=new Date().getFullYear();
$('#team-grid').innerHTML=[['Aarav Sen','Full-stack Lead','Built the ledger engine and UI.',['JS','CSS','Canvas']],['Meera Das','Product & Design','Shaped flows and visual system.',['UX','Figma','Motion']],['Rohan Paul','Ops & QA','Tested every stock edge case.',['QA','Logistics','Docs']]].map(t=>`<div class="team-card reveal tilt"><div class="team-photo-wrap"><div class="team-photo" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff9a63,#6C4DF6);font:700 28px var(--font-head)">${t[0][0]}</div></div><div class="team-name">${t[0]}</div><div class="team-role">${t[1]}</div><p class="team-bio">${t[2]}</p><div class="team-skills">${t[3].map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div><div class="team-actions"><button class="btn btn-outline btn-sm" onclick="this.closest('.team-card');document.dispatchEvent(new CustomEvent('ss-toast',{detail:'Profile coming soon'}))">Profile</button><button class="btn btn-primary btn-sm" onclick="document.dispatchEvent(new CustomEvent('ss-toast',{detail:'Message sent!'}))">Contact</button></div></div>`).join('');
document.addEventListener('ss-toast',e=>toast(e.detail));
$('#tips-grid').innerHTML=[['⌘','Ctrl+K','Jump anywhere instantly.'],['★','Validate to update','Stock changes only when a document is validated.'],['🎨','Pick an accent','Make the app yours from the top bar.'],['📸','Screenshot','Capture any view in one click.'],['🌙','Dark mode','Easy on the eyes at night shifts.'],['◎','Guided tour','Learn the layout in under a minute.']].map(t=>`<div class="tip-card reveal"><span class="tip-ic">${t[0]}</span><div><h4>${t[1]}</h4><p>${t[2]}</p></div></div>`).join('');
$$('.feature-card,.about-stat,.land-section-head').forEach(e=>e.classList.add('reveal'));
$$('.feature-card').forEach(e=>{e.style.animation='none';e.classList.add('tilt')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.transitionDelay=(e.target.dataset.d||0)+'ms';e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.reveal').forEach((e,i)=>{e.dataset.d=(i%3)*120;io.observe(e)});
document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('.tilt');if(t){const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(700px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-6px)`}
 $$('.tilt').forEach(o=>{if(o!==t)o.style.transform=''});const g=$('.cursor-glow');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'});
const glow=document.createElement('div');glow.className='cursor-glow';document.body.append(glow);
document.addEventListener('mousemove',e=>{const b=e.target.closest&&e.target.closest('.landing .btn-primary,.send-btn');$$('.landing .btn-primary,.send-btn').forEach(x=>{if(x===b){const r=x.getBoundingClientRect();x.style.translate=`${(e.clientX-r.left-r.width/2)*.2}px ${(e.clientY-r.top-r.height/2)*.3}px`}else x.style.translate=''})});
const ph=['Track 2,400 units across 3 warehouses and flag anything low…','Receive 100 copper wire spools from Apex Supply…','Move 40 LED panels from Main Warehouse to Rack Annex…'];let pi=0,pc=0,del=false;
(function type(){const el=$('#prompt-typed');el.textContent=ph[pi].slice(0,pc);if(!del&&pc==ph[pi].length){del=true;return setTimeout(type,1600)}if(del&&pc==0){del=false;pi=(pi+1)%ph.length}pc+=del?-1:1;setTimeout(type,del?18:42)})();
addEventListener('scroll',()=>$('#land-nav').classList.toggle('scrolled',scrollY>30));
$$('canvas[id$=-canvas]:not(#confetti-canvas)').forEach(c=>scene('#'+c.id));

/* ---------- boot ---------- */
if(LS('ss_theme')){document.documentElement.dataset.theme=LS('ss_theme')}else document.documentElement.dataset.theme='dark';
$$('#theme-toggle,#land-theme-toggle').forEach(b=>b.textContent=document.documentElement.dataset.theme=='dark'?'☀️':'🌙');
let pr=0;const iv=setInterval(()=>{pr+=Math.random()*14+6;$('#splash-bar-fill').style.width=Math.min(pr,100)+'%';if(pr>=100){clearInterval(iv);setTimeout(()=>{if(me)enterApp();else show('#landing')},300)}},140);
})();