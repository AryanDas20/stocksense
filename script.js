/* ============================================================
   StockSense — Inventory Management System (consolidated)
   Client-side, self-contained, localStorage-backed.
   ============================================================ */
'use strict';

const DB_KEY = 'stocksense_db_v1';
const SESSION_KEY = 'stocksense_session_v1';
const THEME_KEY = 'stocksense_theme_v1';
const ACCENT_KEY = 'stocksense_accent_v1';
const TOUR_SEEN_KEY = 'stocksense_tour_seen_v1';

let db = null;
let currentView = 'dashboard';
let docViewMode = { receipt: 'table', delivery: 'table', transfer: 'table' };

const $ = id => document.getElementById(id);

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
    name: 'Manas Kumar', role: 'BTech CSE · LPU',
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
  { keys:['1','-','8'], label:'Jump to sidebar page 1–8' },
  { keys:['T'], label:'Toggle light / dark theme' },
  { keys:['S'], label:'Take a screenshot' },
  { keys:['G'], label:'Start the guided tour' },
  { keys:['?'], label:'Open this shortcuts panel' },
  { keys:['Esc'], label:'Close any open overlay' },
];

/* order matches the sidebar, so keys 1–8 line up with what you see */
const PAGE_ORDER = ['dashboard','analytics','products','receipts','deliveries','transfers','adjustments','ledger'];
const VALID_VIEWS = [...PAGE_ORDER, 'settings', 'profile'];

const TOUR_STEPS = [
  { selector:'.sidebar-brand', title:'Welcome to StockSense', text:'This is your inventory command centre. This short tour covers every page and feature in the app — dashboard, analytics, stock operations, search, exports and shortcuts.' },
  { selector:'[data-view="dashboard"]', title:'Dashboard', text:'Your landing page after login. It shows live KPIs — total products, low/out of stock counts, pending receipts and deliveries — plus a filterable feed of every recent document, by type, status, warehouse or category.' },
  { selector:'[data-view="analytics"]', title:'Analytics', text:'Animated charts built straight from your ledger: stock by category, document status mix, a 7-day activity trend, and your unlocked achievement badges.' },
  { selector:'[data-view="products"]', title:'Products', text:'The full catalog: SKU, category, unit of measure, reorder point, and stock broken down per warehouse. Click "New product" to add one, or "Edit" on any row to update stock and reorder rules.' },
  { selector:'[data-view="receipts"]', title:'Receipts', text:'Log incoming stock from a supplier. A receipt starts as a Draft, moves through Waiting and Ready, and once you click Validate, stock increases automatically and the movement is written to the ledger. Try the "Board" toggle for a drag-and-drop view.' },
  { selector:'[data-view="deliveries"]', title:'Delivery orders', text:'The mirror of receipts — outgoing stock to a customer. Pick, pack and validate; the app blocks validation if you don\u2019t actually have enough stock to ship.' },
  { selector:'[data-view="transfers"]', title:'Internal transfers', text:'Move stock between warehouses or locations without changing your total count — e.g. Main Warehouse to Production Floor. Every transfer is logged in the ledger.' },
  { selector:'[data-view="adjustments"]', title:'Stock adjustments', text:'Reconcile what the system thinks you have against a physical count. Enter the counted quantity and the app calculates and logs the difference automatically.' },
  { selector:'[data-view="ledger"]', title:'Move history', text:'The single source of truth — every validated movement across every document type, filterable by type or by product, in chronological order.' },
  { selector:'[data-view="settings"]', title:'Settings', text:'Add and manage warehouses or locations. Every new warehouse automatically gets a stock column on every product.' },
  { selector:'#global-search', title:'Global search', text:'Search by product name or SKU at any time. Press "/" to jump straight into this box from anywhere.' },
  { selector:'#cmdk-btn', title:'Command palette', text:'The fastest way around the app. Press Ctrl+K (or Cmd+K) to search pages, products and quick actions like "New receipt" or "Toggle theme" — all keyboard-driven.' },
  { selector:'#accent-btn', title:'Accent color', text:'Pick a new accent color for the whole interface — it\u2019s remembered for next time you visit.' },
  { selector:'#notif-btn', title:'Notifications', text:'A live feed of anything that needs attention — out-of-stock and low-stock alerts, plus documents waiting on you.' },
  { selector:'#screenshot-btn', title:'Screenshot export', text:'Captures the current screen as a downloadable PNG, automatically stamped with your name and the export time.' },
  { selector:'#pdf-btn', title:'PDF guide export', text:'Generates a full multi-page PDF explaining the whole concept from the ground up, plus a live snapshot of your current inventory — personalised with your name.' },
  { selector:'#theme-toggle', title:'Light / dark mode', text:'Switch themes any time. Your preference is saved for next time you open the app.' },
  { selector:'#shortcuts-btn', title:'Keyboard shortcuts', text:'Opens the full list of shortcuts — or just press "?" from anywhere in the app.' },
  { selector:'#profile-btn', title:'Your profile & logout', text:'View your account details, your achievement badges, or sign out from here. That\u2019s the full tour — you\u2019re ready to go!' },
];

const ACCENTS = [
  { name:'Violet', hex:'#6C4DF6' },
  { name:'Aqua',   hex:'#12C6B8' },
  { name:'Coral',  hex:'#FF5D7A' },
  { name:'Amber',  hex:'#FFA53E' },
  { name:'Blue',   hex:'#3B82F6' },
  { name:'Pink',   hex:'#EC4899' },
];

const ACHIEVEMENTS = [
  { id:'first_receipt',    name:'Dock Master', ic:'📦', desc:'Validate your first receipt.' },
  { id:'first_delivery',   name:'Ship It',     ic:'🚚', desc:'Validate your first delivery order.' },
  { id:'first_transfer',   name:'Mover',       ic:'🔀', desc:'Validate your first internal transfer.' },
  { id:'first_adjustment', name:'Auditor',     ic:'🧮', desc:'Validate your first stock adjustment.' },
  { id:'cataloger',        name:'Cataloger',   ic:'🗂️', desc:'Add a brand-new product to the catalog.' },
  { id:'expander',         name:'Expander',    ic:'🏭', desc:'Add a new warehouse or location.' },
  { id:'ledger_pro',       name:'Ledger Pro',  ic:'🏆', desc:'Validate 10 documents in total.' },
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
  return String(str == null ? '' : str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function initialsOf(name){ return (name||'?').split(' ').map(w=>w[0]).filter(Boolean).slice(0,2).join('').toUpperCase(); }
function save(){ try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch(e){ console.warn('Could not save', e); } }
function isAppVisible(){ return !$('app-shell').classList.contains('hidden'); }

function toast(msg, kind){
  const root = $('toast-root');
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
   Seed data + persistence
   --------------------------------------------------------- */
function logMove(type, ref, productId, delta, from, to, ts){
  db.ledger.unshift({ id: uid('L'), type, ref, productId, delta, from, to, ts: ts || Date.now() });
}

function seedDb(keepUsers){
  const warehouses = [
    { id:'wh-main', name:'Main Warehouse', code:'MAIN' },
    { id:'wh-prod', name:'Production Floor', code:'PROD' },
    { id:'wh-2', name:'Warehouse 2', code:'WH2' },
  ];
  const categories = ['Raw Materials','Hardware','Furniture','Packaging'];
  const stockAcross = (main, prod, wh2) => ({ 'wh-main': main||0, 'wh-prod': prod||0, 'wh-2': wh2||0 });

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
    users: keepUsers || [{ id: uid('U'), name:'Demo Manager', email:'demo@stocksense.io', password:'demo123', role:'Inventory Manager' }],
    warehouses, categories, products,
    receipts:[], deliveries:[], transfers:[], adjustments:[], ledger:[],
    sequences:{}, otp:null, notifications:[], favorites:[], achievements:[]
  };

  const now = Date.now();
  const p1 = products[0], p3 = products[2];

  const r1 = { id: uid('R'), docNo: docNo('WH/IN','receipt'), supplier:'Ironclad Metals Co.', warehouse:'wh-main', lines:[{ productId:p1.id, qty:60 }], status:'Done', createdAt: now - 86400000*3, validatedAt: now - 86400000*3 };
  db.receipts.push(r1); logMove('Receipt', r1.docNo, p1.id, 60, null, 'wh-main', r1.createdAt);

  db.receipts.push({ id: uid('R'), docNo: docNo('WH/IN','receipt'), supplier:'Timber & Oak Supply', warehouse:'wh-main', lines:[{ productId:p3.id, qty:20 }], status:'Waiting', createdAt: now - 3600000*5 });

  const d1 = { id: uid('D'), docNo: docNo('WH/OUT','delivery'), customer:'BuildRight Contractors', warehouse:'wh-main', lines:[{ productId:p3.id, qty:10 }], status:'Done', createdAt: now - 86400000*2, validatedAt: now - 86400000*2 };
  db.deliveries.push(d1); logMove('Delivery', d1.docNo, p3.id, -10, 'wh-main', null, d1.createdAt);

  db.deliveries.push({ id: uid('D'), docNo: docNo('WH/OUT','delivery'), customer:'Northgate Retail', warehouse:'wh-main', lines:[{ productId: products[4].id, qty:150 }], status:'Ready', createdAt: now - 3600000*2 });

  const t1 = { id: uid('T'), docNo: docNo('WH/INT','transfer'), fromWarehouse:'wh-main', toWarehouse:'wh-prod', lines:[{ productId:p1.id, qty:20 }], status:'Done', createdAt: now - 86400000, validatedAt: now - 86400000 };
  db.transfers.push(t1); logMove('Transfer', t1.docNo, p1.id, 20, 'wh-main', 'wh-prod', t1.createdAt);

  save();
}
function ensureDbDefaults(){
  ['users','warehouses','categories','products','receipts','deliveries','transfers','adjustments','ledger','notifications','favorites','achievements']
    .forEach(k => { if (!Array.isArray(db[k])) db[k] = []; });
  db.sequences = db.sequences || {};
}
function loadDb(){
  let raw = null;
  try { raw = localStorage.getItem(DB_KEY); } catch(e){}
  if (raw){
    try { db = JSON.parse(raw); ensureDbDefaults(); if (db.users.length && db.products.length) return; }
    catch(e){ /* fall through to seed */ }
  }
  seedDb();
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
  const cls = { Draft:'badge-draft', Waiting:'badge-waiting', Ready:'badge-ready', Done:'badge-done', Cancelled:'badge-cancelled' }[status] || 'badge-draft';
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
  const dot = $('notif-dot');
  if (dot) dot.classList.toggle('hidden', urgent === 0);
  const panel = $('notif-panel');
  if (!panel) return;
  panel.innerHTML = `<div class="notif-head"><span>Notifications</span><span class="muted" style="font-weight:500;">${notifs.length}</span></div>` +
    (notifs.length
      ? notifs.map(n => `<div class="notif-item"><span class="notif-ic ${n.type}">${n.ic}</span><div><div class="notif-text">${escapeHtml(n.text)}</div><div class="notif-time">Live</div></div></div>`).join('')
      : `<div class="notif-empty">You're all caught up 🎉</div>`);
}

/* ============================================================
   ACCENT PICKER
   ============================================================ */
function applyAccent(hex){
  document.documentElement.style.setProperty('--accent-2', hex);
  document.documentElement.setAttribute('data-accent', '1');
  try { localStorage.setItem(ACCENT_KEY, JSON.stringify({ hex })); } catch(e){}
}
function savedAccentHex(){
  try { const s = localStorage.getItem(ACCENT_KEY); return s ? JSON.parse(s).hex : null; } catch(e){ return null; }
}
function initAccent(){ const hex = savedAccentHex(); if (hex) applyAccent(hex); }
function renderAccentPanel(){
  const panel = $('accent-panel');
  const activeHex = savedAccentHex();
  panel.innerHTML = `<div class="accent-panel-title">Accent color</div><div class="accent-swatches">${
    ACCENTS.map(a => `<button class="accent-swatch ${activeHex===a.hex?'active':''}" style="background:${a.hex}" data-hex="${a.hex}" title="${a.name}"></button>`).join('')
  }</div>`;
  panel.querySelectorAll('.accent-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      applyAccent(sw.dataset.hex);
      renderAccentPanel();
      toast('Accent color updated.', 'success');
    });
  });
}

/* ============================================================
   RIPPLE
   ============================================================ */
function initRipples(){
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .icon-btn, .fab, .chip, .tool-btn, .send-btn');
    if (!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 620);
  });
}

/* ============================================================
   CINEMATIC DUSK-LAKE SCENE (splash, landing, auth)
   Returns a stop() function. Skips drawing while the canvas is hidden.
   ============================================================ */
function startScene(canvasId){
  const c = $(canvasId); if (!c) return () => {};
  const ctx = c.getContext('2d');
  let w = 0, h = 0, t = 0, clouds = [], stars = [], alive = true;
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
    if (!alive) return;
    if (!c.getClientRects().length){ requestAnimationFrame(frame); return; }
    if (c.width !== (c.offsetWidth || innerWidth) || c.height !== (c.offsetHeight || innerHeight)) resize();
    t += .016;
    const hz = h*.52, sx = w*.62;
    let g = ctx.createLinearGradient(0,0,0,hz);
    g.addColorStop(0,'#090d22'); g.addColorStop(.5,'#2a3463'); g.addColorStop(.82,'#b5634f'); g.addColorStop(1,'#ffb56e');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,hz);
    stars.forEach(s => { ctx.globalAlpha = .25 + .45*Math.abs(Math.sin(t*1.3 + s.p)); ctx.fillStyle = '#fff'; ctx.fillRect(s.x, s.y, 1.4, 1.4); });
    ctx.globalAlpha = 1;
    g = ctx.createRadialGradient(sx,hz,0,sx,hz,w*.42);
    g.addColorStop(0,'rgba(255,210,140,.95)'); g.addColorStop(.14,'rgba(255,150,90,.55)'); g.addColorStop(1,'rgba(255,120,80,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,hz);
    clouds.forEach(cl => {
      cl.x += cl.v; if (cl.x - cl.r > w) cl.x = -cl.r;
      const cg = ctx.createRadialGradient(cl.x,cl.y,0,cl.x,cl.y,cl.r);
      cg.addColorStop(0,'rgba(255,170,125,.20)'); cg.addColorStop(1,'rgba(255,170,125,0)');
      ctx.save(); ctx.translate(0,cl.y); ctx.scale(1,.28); ctx.translate(0,-cl.y); ctx.fillStyle = cg;
      ctx.fillRect(cl.x-cl.r, cl.y-cl.r, cl.r*2, cl.r*2); ctx.restore();
    });
    mountain(far,  '#2b2850', hz, false, 1);
    mountain(near, '#0d0f21', hz, false, 1);
    g = ctx.createLinearGradient(0,hz,0,h); g.addColorStop(0,'#3a3458'); g.addColorStop(.35,'#1a1c3a'); g.addColorStop(1,'#05060f');
    ctx.fillStyle = g; ctx.fillRect(0,hz,w,h-hz);
    mountain(far,  '#2b2850', hz, true, .4);
    mountain(near, '#0d0f21', hz, true, .6);
    for (let y=hz; y<h; y+=3){
      const k = (y-hz)/(h-hz), wd = (50 + (y-hz)*.28) * (.55 + .45*Math.sin(y*.16 - t*2.2));
      ctx.fillStyle = `rgba(255,170,100,${.55*(1-k)})`; ctx.fillRect(sx - wd/2, y, wd, 2);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
    for (let i=0; i<14; i++){
      const y = hz + 12 + i*i*3.2, off = Math.sin(t*.8 + i)*18;
      ctx.beginPath(); ctx.moveTo(off, y); ctx.lineTo(w + off, y); ctx.stroke();
    }
    for (let i=0; i<2; i++){
      const mx = ((t*14*(i+1)) % (w*1.6)) - w*.3, mg = ctx.createLinearGradient(mx,0,mx+w*.8,0);
      mg.addColorStop(0,'rgba(255,200,170,0)'); mg.addColorStop(.5,'rgba(255,200,170,.07)'); mg.addColorStop(1,'rgba(255,200,170,0)');
      ctx.fillStyle = mg; ctx.fillRect(mx, hz-30+i*26, w*.8, 70);
    }
    g = ctx.createRadialGradient(w/2,h/2,h*.35,w/2,h/2,h*.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.55)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    requestAnimationFrame(frame);
  }
  resize();
  requestAnimationFrame(frame);
  return () => { alive = false; };
}

/* ============================================================
   SPLASH
   ============================================================ */
function runSplash(){
  const stop = startScene('splash-canvas');
  const fill = $('splash-bar-fill');
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.random()*18 + 8;
    if (pct >= 100){ pct = 100; clearInterval(timer); fill.style.width = '100%'; finishSplash(stop); return; }
    fill.style.width = pct + '%';
  }, 160);
}
function finishSplash(stop){
  setTimeout(() => {
    const splash = $('splash-screen');
    splash.classList.add('fade-out');
    setTimeout(() => { splash.style.display = 'none'; stop(); showInitialScreen(); }, 520);
  }, 220);
}
function showInitialScreen(){
  if (currentUser()) enterApp(false);
  else showLanding();
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
  document.querySelectorAll('#theme-toggle, #land-theme-toggle').forEach(b => b.textContent = theme === 'dark' ? '☀️' : '🌙');
}
function toggleTheme(){
  applyTheme((document.documentElement.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark');
}
function initTheme(){
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
  applyTheme(saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
function showLanding(){
  $('landing').classList.remove('hidden');
  $('auth-screen').classList.add('hidden');
  $('app-shell').classList.add('hidden');
  window.scrollTo(0, 0);
}
function fallbackAvatarSvg(name){
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="48" fill="#6C4DF6"/><text x="50%" y="54%" font-family="Inter,sans-serif" font-size="30" fill="#fff" text-anchor="middle" dominant-baseline="middle">${initialsOf(name)}</text></svg>`;
}
function demoUser(){ return db.users.find(u => u.email === 'demo@stocksense.io') || db.users[0]; }
function loginAs(user, isNewSignup){
  setSession(user.id);
  enterApp(true, isNewSignup);
}

function initLanding(){
  $('footer-year').textContent = new Date().getFullYear();
  startScene('landing-canvas');

  $('team-grid').innerHTML = TEAM.map(t => `
    <div class="team-card">
      <div class="team-photo-wrap">
        <img class="team-photo" src="${encodeURI(t.photo)}" alt="${escapeHtml(t.name)}"
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

  $('tips-grid').innerHTML = TIPS.map(t => `
    <div class="tip-card"><div class="tip-ic">${t.ic}</div><div><h4>${escapeHtml(t.title)}</h4><p>${escapeHtml(t.text)}</p></div></div>
  `).join('');

  $('land-login-btn').addEventListener('click', () => openAuth('login'));
  $('land-signup-btn').addEventListener('click', () => openAuth('signup'));
  $('footer-login-link').addEventListener('click', e => { e.preventDefault(); openAuth('login'); });
  $('hero-signup-chip').addEventListener('click', () => openAuth('signup'));
  $('hero-demo-btn').addEventListener('click', () => loginAs(demoUser()));
  $('hero-tour-btn').addEventListener('click', () => {
    loginAs(demoUser());
    setTimeout(() => { if (isAppVisible()) startTour(); }, 3000);
  });
  $('land-theme-toggle').addEventListener('click', toggleTheme);
}

/* Typewriter prompt, scroll-reveal, nav-on-scroll, mouse tilt, cursor glow */
function initCinema(){
  const prompts = [
    'Receive 60 kg of steel rods from Ironclad Metals into Main Warehouse…',
    'Move 20 Oak Chairs from Main Warehouse to Production Floor…',
    'Ship 150 Bolt M8x40 to Northgate Retail — block it if stock is short…',
    'Reconcile Brass Hinge 3in after tonight\'s physical count…'
  ];
  const el = $('prompt-typed'); let pi = 0, ci = 0, del = false;
  (function type(){
    if (!el) return;
    const s = prompts[pi];
    el.textContent = s.slice(0, ci);
    if (!del && ci < s.length){ ci++; return setTimeout(type, 38); }
    if (!del){ del = true; return setTimeout(type, 1800); }
    if (ci > 0){ ci = Math.max(0, ci - 2); return setTimeout(type, 14); }
    del = false; pi = (pi+1) % prompts.length; setTimeout(type, 350);
  })();

  const targets = document.querySelectorAll('.land-section-head, .feature-card, .about-body, .about-stats, .team-card, .tip-card');
  targets.forEach((t, i) => { t.classList.add('reveal'); t.style.transitionDelay = (i % 3) * 90 + 'ms,' + (i % 3) * 90 + 'ms,' + (i % 3) * 90 + 'ms,0ms,0ms,0ms'; });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){
      e.target.classList.add('in'); io.unobserve(e.target);
      setTimeout(() => { e.target.style.transitionDelay = ''; }, 1200);
    }
  }), { threshold:.12 });
  targets.forEach(t => io.observe(t));

  const nav = $('land-nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive:true });

  const landing = $('landing'), box = document.querySelector('.prompt-box');
  const glow = document.createElement('div'); glow.className = 'cursor-glow'; landing.appendChild(glow);
  landing.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
    const x = (e.clientX / innerWidth - .5) * 6, y = (e.clientY / innerHeight - .5) * -6;
    box.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg)`;
  });
  landing.addEventListener('mouseleave', () => { box.style.transform = ''; });
}

/* ============================================================
   AUTH
   ============================================================ */
function showAuthForm(which){
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  $(which + '-form').classList.remove('hidden');
}
function openAuth(which){
  $('landing').classList.add('hidden');
  $('auth-screen').classList.remove('hidden');
  showAuthForm(which);
  window.scrollTo(0, 0);
}
function initAuthScreen(){
  startScene('auth-canvas');

  $('auth-back-btn').addEventListener('click', () => { $('auth-screen').classList.add('hidden'); showLanding(); });

  document.querySelectorAll('[data-go]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showAuthForm(a.dataset.go === 'reset' ? 'reset-request' : a.dataset.go);
    });
  });

  $('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('login-email').value.trim().toLowerCase();
    const pass = $('login-password').value;
    const user = db.users.find(u => u.email.toLowerCase() === email && u.password === pass);
    if (!user){
      const panel = document.querySelector('.auth-panel');
      panel.classList.remove('shake'); void panel.offsetWidth; panel.classList.add('shake');
      toast('Invalid email or password.', true); return;
    }
    loginAs(user);
  });

  $('demo-login-btn').addEventListener('click', () => loginAs(demoUser()));

  $('signup-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('signup-name').value.trim();
    const email = $('signup-email').value.trim().toLowerCase();
    const role = $('signup-role').value;
    const pass = $('signup-password').value;
    if (!name){ toast('Please enter your name.', true); return; }
    if (db.users.some(u => u.email.toLowerCase() === email)){ toast('An account with that email already exists.', true); return; }
    if (pass.length < 6){ toast('Password must be at least 6 characters.', true); return; }
    const user = { id: uid('U'), name, email, password: pass, role };
    db.users.push(user); save();
    toast(`Welcome, ${name.split(' ')[0]}! Your account is ready.`, 'success');
    loginAs(user, true);
  });

  $('reset-request-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('reset-email').value.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === email);
    if (!user){ toast('No account found with that email.', true); return; }
    const otp = String(Math.floor(100000 + Math.random()*900000));
    db.otp = { email, otp, expires: Date.now() + 5*60000 };
    save();
    $('otp-hint').textContent = `Your one-time code is ${otp} (simulated — no email is sent in this demo).`;
    showAuthForm('reset-verify');
  });

  $('reset-verify-form').addEventListener('submit', e => {
    e.preventDefault();
    const otp = $('reset-otp').value.trim();
    const pass = $('reset-new-password').value;
    if (!db.otp || db.otp.otp !== otp || Date.now() > db.otp.expires){ toast('That code is invalid or has expired.', true); return; }
    if (pass.length < 6){ toast('Password must be at least 6 characters.', true); return; }
    const user = db.users.find(u => u.email.toLowerCase() === db.otp.email);
    if (user) user.password = pass;
    db.otp = null; save();
    toast('Password reset. Sign in with your new password.', 'success');
    showAuthForm('login');
  });
}

/* ============================================================
   APP ENTRY / SHELL
   ============================================================ */
function enterApp(fresh, isNewSignup){
  const user = currentUser();
  if (!user){ showLanding(); return; }
  $('landing').classList.add('hidden');
  $('auth-screen').classList.add('hidden');
  const shell = $('app-shell');
  shell.classList.remove('hidden');

  $('sidebar-name').textContent = user.name;
  $('sidebar-role').textContent = user.role;
  $('sidebar-avatar').textContent = initialsOf(user.name);
  document.querySelectorAll('.nav-link').forEach((a, i) => a.style.setProperty('--i', i));
  shell.classList.remove('enter'); void shell.offsetWidth; shell.classList.add('enter');
  window.scrollTo(0, 0);

  navigate((location.hash || '#dashboard').replace('#',''));
  if (fresh) showWelcome(user);
  if (isNewSignup && !localStorage.getItem(TOUR_SEEN_KEY)){
    setTimeout(() => { if (isAppVisible() && confirm('Want a quick guided tour of StockSense?')) startTour(); }, 3300);
  }
}
function showWelcome(user){
  const w = document.createElement('div');
  w.className = 'welcome';
  w.innerHTML = `<div class="w-logo">SS</div><h2>Welcome, ${escapeHtml(user.name.split(' ')[0])}!</h2><p>Loading your warehouse control tower…</p>`;
  document.body.appendChild(w);
  setTimeout(() => { w.remove(); fireConfetti(); }, 2600);
}
function logout(){
  clearSession();
  closeAllOverlays();
  $('profile-menu').classList.add('hidden');
  $('sidebar').classList.remove('open');
  location.hash = '';
  showLanding();
  toast('Signed out.');
}
function closeAllOverlays(){
  closeCommandPalette(); closeShortcuts(); closeTour();
  $('modal-root').innerHTML = '';
  $('accent-panel').classList.add('hidden');
  $('notif-panel').classList.add('hidden');
}

function initShellEvents(){
  $('profile-btn').addEventListener('click', () => $('profile-menu').classList.toggle('hidden'));
  $('profile-menu').querySelector('a').addEventListener('click', () => $('profile-menu').classList.add('hidden'));
  $('logout-btn').addEventListener('click', logout);
  $('menu-toggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  $('global-search').addEventListener('input', e => {
    if (currentView !== 'products') navigate('products');
    renderProducts(e.target.value);
  });
  window.addEventListener('hashchange', () => { if (isAppVisible()) navigate((location.hash || '#dashboard').replace('#','')); });
  document.addEventListener('click', e => {
    if (!e.target.closest('#profile-btn') && !e.target.closest('#profile-menu')) $('profile-menu').classList.add('hidden');
    if (!e.target.closest('#accent-btn') && !e.target.closest('#accent-panel')) $('accent-panel').classList.add('hidden');
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')) $('notif-panel').classList.add('hidden');
    if (!e.target.closest('#sidebar') && !e.target.closest('#menu-toggle')) $('sidebar').classList.remove('open');
  });
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('screenshot-btn').addEventListener('click', takeScreenshot);
  $('pdf-btn').addEventListener('click', exportPdf);
  $('tour-btn').addEventListener('click', startTour);
  $('shortcuts-btn').addEventListener('click', openShortcuts);
  $('cmdk-btn').addEventListener('click', openCommandPalette);
  $('accent-btn').addEventListener('click', () => {
    const panel = $('accent-panel');
    const willShow = panel.classList.contains('hidden');
    $('notif-panel').classList.add('hidden');
    if (willShow) renderAccentPanel();
    panel.classList.toggle('hidden');
  });
  $('notif-btn').addEventListener('click', () => {
    const panel = $('notif-panel');
    const willShow = panel.classList.contains('hidden');
    $('accent-panel').classList.add('hidden');
    if (willShow) renderNotifPanel();
    panel.classList.toggle('hidden');
  });
  $('fab-btn').addEventListener('click', openCommandPalette);
}

function navigate(view){
  if (!VALID_VIEWS.includes(view)) view = 'dashboard';
  currentView = view;
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  $('sidebar').classList.remove('open');
  const renderers = {
    dashboard: renderDashboard, analytics: renderAnalytics, products: () => renderProducts(''), receipts: renderReceipts,
    deliveries: renderDeliveries, transfers: renderTransfers, adjustments: renderAdjustments,
    ledger: renderLedger, settings: renderSettings, profile: renderProfile,
  };
  renderers[view]();
  updateTopbarAlert();
  renderNotifPanel();
}
function updateTopbarAlert(){
  const lowCount = db.products.filter(isLow).length;
  const outCount = db.products.filter(isOut).length;
  $('topbar-alert').textContent = outCount > 0 ? `${outCount} product${outCount>1?'s':''} out of stock`
    : lowCount > 0 ? `${lowCount} product${lowCount>1?'s':''} running low` : '';
}
function mount(html){ $('app-content').innerHTML = html; }

function animateCount(el, target){
  if (!el) return;
  const t0 = performance.now(), dur = 650;
  function frame(t){
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1-p, 3)));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function renderDashboard(){
  const lowStock = db.products.filter(isLow).length;
  const outStock = db.products.filter(isOut).length;
  const open = r => r.status !== 'Done' && r.status !== 'Cancelled';
  const pendingReceipts = db.receipts.filter(open).length;
  const pendingDeliveries = db.deliveries.filter(open).length;
  const scheduledTransfers = db.transfers.filter(open).length;
  const user = currentUser();
  const tip = TIPS[Math.floor(Math.random()*TIPS.length)];

  mount(`
    <div class="page-head">
      <div><h1>Welcome back, <span class="grad-text">${escapeHtml(user.name.split(' ')[0])}</span></h1><div class="page-sub">Snapshot of inventory operations across all warehouses</div></div>
      <div class="page-actions"><a class="btn btn-outline" href="#analytics">📊 View analytics</a></div>
    </div>

    <div class="tip-banner" id="dash-tip-banner">
      <span>${tip.ic}</span><span><strong>${escapeHtml(tip.title)}:</strong> ${escapeHtml(tip.text)}</span>
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
      <select id="f-warehouse"><option value="">All warehouses</option>${db.warehouses.map(w=>`<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('')}</select>
      <select id="f-category"><option value="">All categories</option>${db.categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Recent Documents</h3><span class="muted" style="font-size:12px;">Internal Transfers Scheduled: ${scheduledTransfers}</span></div>
      <table>
        <thead><tr><th>Type</th><th>Document</th><th>Warehouse</th><th>Status</th><th>Date</th></tr></thead>
        <tbody id="dash-doc-rows"></tbody>
      </table>
    </div>
  `);

  animateCount($('kpi-total'), db.products.length);
  animateCount($('kpi-low'), lowStock);
  animateCount($('kpi-out'), outStock);
  animateCount($('kpi-rec'), pendingReceipts);
  animateCount($('kpi-del'), pendingDeliveries);
  $('dash-tip-close').addEventListener('click', () => $('dash-tip-banner').remove());

  function allDocs(){
    const docs = [];
    db.receipts.forEach(r => docs.push({ type:'Receipt', ref:r.docNo, wh:r.warehouse, status:r.status, ts:r.createdAt, lines:r.lines }));
    db.deliveries.forEach(r => docs.push({ type:'Delivery', ref:r.docNo, wh:r.warehouse, status:r.status, ts:r.createdAt, lines:r.lines }));
    db.transfers.forEach(r => docs.push({ type:'Transfer', ref:r.docNo, wh:r.toWarehouse, status:r.status, ts:r.createdAt, lines:r.lines }));
    db.adjustments.forEach(r => docs.push({ type:'Adjustment', ref:r.docNo, wh:r.warehouse, status:r.status, ts:r.createdAt, lines:[{ productId:r.productId }] }));
    return docs.sort((a,b) => b.ts - a.ts);
  }
  function categoryMatch(doc, cat){
    if (!cat) return true;
    return doc.lines.some(l => { const p = db.products.find(p=>p.id===l.productId); return p && p.category === cat; });
  }
  function applyFilters(){
    const t = $('f-type').value, s = $('f-status').value, w = $('f-warehouse').value, c = $('f-category').value;
    const rows = allDocs().filter(d => (!t || d.type===t) && (!s || d.status===s) && (!w || d.wh===w) && categoryMatch(d, c)).slice(0, 25);
    $('dash-doc-rows').innerHTML = rows.length ? rows.map(d => `
      <tr><td>${docTypeTag(d.type)}</td><td class="mono">${d.ref}</td><td>${escapeHtml(whName(d.wh))}</td><td>${statusBadge(d.status)}</td><td class="muted">${fmtDate(d.ts)}</td></tr>
    `).join('') : emptyRow(5, '🗒️', 'No documents match these filters', 'Try widening your filters above.');
  }
  ['f-type','f-status','f-warehouse','f-category'].forEach(id => $(id).addEventListener('change', applyFilters));
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
  drawBarChart(); drawDonutChart(); drawLineChart();
  $('ach-shelf').innerHTML = achievementShelfHtml();
}

function drawBarChart(){
  const cats = db.categories;
  if (!cats.length){ $('chart-bar').innerHTML = `<div class="empty-state"><div class="empty-state-ic">📊</div><div class="empty-state-title">No categories yet</div></div>`; return; }
  const totals = cats.map(c => db.products.filter(p=>p.category===c).reduce((a,p)=>a+totalStock(p),0));
  const max = Math.max(1, ...totals);
  const w = 460, plotW = w - 40, colW = plotW / cats.length;
  const barW = Math.max(18, Math.min(56, colW - 18));
  const colors = ['#6C4DF6','#12C6B8','#FFA53E','#FF5D7A','#29B37B','#3B82F6'];
  const bars = cats.map((c,i) => {
    const x = 30 + i*colW + (colW-barW)/2;
    const hgt = Math.max(2, Math.round((totals[i]/max)*140));
    return `<rect class="bar-rect" x="${x}" y="${170-hgt}" width="${barW}" height="${hgt}" rx="6" fill="${colors[i%colors.length]}" style="transition-delay:${i*90}ms"></rect>
      <text x="${x+barW/2}" y="188" text-anchor="middle" font-size="10" fill="var(--ink-soft)">${escapeHtml(c.length>9?c.slice(0,8)+'…':c)}</text>
      <text x="${x+barW/2}" y="${170-hgt-8}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">${totals[i]}</text>`;
  }).join('');
  $('chart-bar').innerHTML = `<svg viewBox="0 0 ${w} 200" width="100%" height="200">${bars}</svg>`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('#chart-bar .bar-rect').forEach(r => r.classList.add('go'));
  }));
}

function drawDonutChart(){
  const all = [...db.receipts, ...db.deliveries, ...db.transfers, ...db.adjustments];
  const statuses = ['Draft','Waiting','Ready','Done','Cancelled'];
  const colors = { Draft:'#B9B4D6', Waiting:'#FFA53E', Ready:'#6C4DF6', Done:'#29B37B', Cancelled:'#FF5D7A' };
  const counts = statuses.map(s => all.filter(d => d.status === s).length);
  const total = counts.reduce((a,b)=>a+b,0);
  const r = 60, cx = 80, cy = 80, circ = 2*Math.PI*r;
  if (!total){
    $('chart-donut').innerHTML = `<div class="empty-state"><div class="empty-state-ic">🗂️</div><div class="empty-state-title">No documents yet</div><div class="empty-state-sub">Create a receipt, delivery or transfer to see this chart fill in.</div></div>`;
    return;
  }
  let offset = 0;
  const segs = statuses.map((s,i) => {
    const len = (counts[i]/total)*circ;
    const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[s]}" stroke-width="20" style="stroke-dasharray:0 ${circ};stroke-dashoffset:${-offset};transition:stroke-dasharray .9s cubic-bezier(.22,1,.36,1)" transform="rotate(-90 ${cx} ${cy})" class="donut-seg" data-len="${len.toFixed(2)}"></circle>`;
    offset += len;
    return seg;
  }).join('');
  $('chart-donut').innerHTML = `
    <svg viewBox="0 0 160 160" width="100%" height="180" style="max-width:180px;display:block;margin:0 auto;">${segs}
      <text x="80" y="84" text-anchor="middle" font-size="20" font-weight="700" fill="var(--ink)">${total}</text>
      <text x="80" y="98" text-anchor="middle" font-size="9" fill="var(--ink-soft)">documents</text>
    </svg>
    <div class="chart-legend">${statuses.map((s,i) => `<span><i style="background:${colors[s]}"></i>${s} (${counts[i]})</span>`).join('')}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('#chart-donut .donut-seg').forEach(el => {
      const len = Number(el.dataset.len);
      el.style.strokeDasharray = `${len} ${circ - len}`;
    });
  }));
}

function drawLineChart(){
  const days = [...Array(7)].map((_,i) => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(6-i)); return d.getTime(); });
  const values = days.map(dayStart => db.ledger.filter(l => l.ts >= dayStart && l.ts < dayStart + 86400000).reduce((a,l) => a + Math.abs(l.delta), 0));
  const max = Math.max(1, ...values);
  const w = 680, h = 170, pad = 24;
  const stepX = (w - pad*2) / (values.length - 1 || 1);
  const points = values.map((v,i) => [pad + i*stepX, h - pad - (v/max)*(h - pad*2 - 14)]);
  const path = points.map((p,i) => (i===0?'M':'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const areaPath = `${path} L${points[points.length-1][0]},${h-pad} L${points[0][0]},${h-pad} Z`;
  const dots = points.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--violet)" class="line-dot" style="opacity:0"></circle>`).join('');
  const valueLabels = points.map((p,i) => `<text x="${p[0]}" y="${p[1]-9}" text-anchor="middle" font-size="9" fill="var(--ink-soft)" class="line-dot" style="opacity:0">${values[i]}</text>`).join('');
  const dayLabels = days.map((d,i) => `<text x="${points[i][0]}" y="${h-6}" text-anchor="middle" font-size="9" fill="var(--ink-soft)">${new Date(d).toLocaleDateString(undefined,{weekday:'short'})}</text>`).join('');

  $('chart-line').innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="180">
    <defs><linearGradient id="lineFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6C4DF6" stop-opacity="0.35"/><stop offset="100%" stop-color="#6C4DF6" stop-opacity="0"/></linearGradient></defs>
    <path d="${areaPath}" fill="url(#lineFade)" stroke="none"></path>
    <path d="${path}" fill="none" stroke="var(--violet)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="line-path"></path>
    ${dots}${valueLabels}${dayLabels}
  </svg>`;

  const linePath = $('line-path');
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
      <select id="product-cat-filter"><option value="">All categories</option>${db.categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>UoM</th><th class="num">Total Stock</th><th>By Location</th><th></th></tr></thead>
        <tbody id="products-rows"></tbody>
      </table>
    </div>
  `);

  function draw(){
    const q = $('product-filter').value.trim().toLowerCase();
    const cat = $('product-cat-filter').value;
    const rows = db.products.filter(p => (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (!cat || p.category === cat));
    $('products-rows').innerHTML = rows.length ? rows.map(p => {
      const total = totalStock(p);
      const pct = Math.min(100, Math.round((total / Math.max(p.reorderPoint*2,1))*100));
      const barCls = isOut(p) ? 'out' : (isLow(p) ? 'low' : '');
      return `
      <tr>
        <td><button class="fav-star ${isFav(p.id)?'active':''}" data-fav="${p.id}" title="Toggle favorite">★</button><strong>${escapeHtml(p.name)}</strong></td>
        <td class="mono">${escapeHtml(p.sku)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td class="muted">${escapeHtml(p.uom)}</td>
        <td class="num">${total} <span class="stock-bar"><span class="stock-bar-fill ${barCls}" style="width:${pct}%"></span></span></td>
        <td class="muted" style="font-size:12.5px;">${db.warehouses.map(w=>`${escapeHtml(w.code)}: ${stockAt(p,w.id)}`).join(' · ')}</td>
        <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit="${p.id}">Edit</button></td>
      </tr>`;
    }).join('') : emptyRow(7, '🔍', 'No products match your search', 'Try a different name, SKU or category filter.');
    document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openProductModal(b.dataset.edit)));
    document.querySelectorAll('[data-fav]').forEach(b => b.addEventListener('click', () => { toggleFav(b.dataset.fav); draw(); }));
  }
  $('product-filter').addEventListener('input', draw);
  $('product-cat-filter').addEventListener('change', draw);
  $('add-product-btn').addEventListener('click', () => openProductModal(null));
  $('export-products-csv-btn').addEventListener('click', exportProductsCsv);
  draw();
}

function openProductModal(productId){
  const p = productId ? db.products.find(x=>x.id===productId) : null;
  openModal(p ? 'Edit product' : 'New product', `
    <div class="form-grid">
      <div class="form-field full"><label>Product name</label><input id="pf-name" value="${p ? escapeHtml(p.name) : ''}"></div>
      <div class="form-field"><label>SKU / Code</label><input id="pf-sku" value="${p ? escapeHtml(p.sku) : ''}"></div>
      <div class="form-field"><label>Unit of measure</label><input id="pf-uom" value="${p ? escapeHtml(p.uom) : 'pcs'}"></div>
      <div class="form-field"><label>Category</label><select id="pf-cat">${db.categories.map(c=>`<option ${p && p.category===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></div>
      <div class="form-field"><label>Reorder point (total)</label><input id="pf-reorder" type="number" min="0" value="${p ? p.reorderPoint : 10}"></div>
      ${db.warehouses.map(w => `<div class="form-field"><label>${p ? 'Stock' : 'Initial stock'} — ${escapeHtml(w.name)}</label><input id="pf-stock-${w.id}" type="number" min="0" value="${p ? stockAt(p,w.id) : 0}"></div>`).join('')}
    </div>
  `, () => {
    const name = $('pf-name').value.trim(), sku = $('pf-sku').value.trim();
    if (!name || !sku){ toast('Name and SKU are required.', true); return false; }
    if (db.products.some(x => x.sku.toLowerCase() === sku.toLowerCase() && (!p || x.id !== p.id))){ toast('That SKU is already in use.', true); return false; }
    const stock = {};
    db.warehouses.forEach(w => stock[w.id] = Math.max(0, Number($('pf-stock-'+w.id).value) || 0));
    const uom = $('pf-uom').value.trim() || 'pcs', category = $('pf-cat').value, reorderPoint = Math.max(0, Number($('pf-reorder').value) || 0);
    if (p){
      Object.assign(p, { name, sku, uom, category, reorderPoint, stock });
      toast('Product updated.', 'success');
    } else {
      db.products.push({ id: uid('P'), name, sku, uom, category, reorderPoint, stock });
      toast('Product created.', 'success');
      unlockAchievement('cataloger');
    }
    save(); renderProducts(''); updateTopbarAlert(); return true;
  }, p ? 'Save changes' : 'Create product');
}

function downloadCsv(header, rows, filename){
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}
function exportProductsCsv(){
  downloadCsv(
    ['SKU','Name','Category','UoM','Reorder Point','Total Stock', ...db.warehouses.map(w=>w.name)],
    db.products.map(p => [p.sku, p.name, p.category, p.uom, p.reorderPoint, totalStock(p), ...db.warehouses.map(w=>stockAt(p,w.id))]),
    `stocksense-products-${Date.now()}.csv`
  );
  toast('Products exported as CSV.', 'success');
}

/* ============================================================
   Line-item helpers
   ============================================================ */
function lineItemRowHtml(idx, line){
  const options = db.products.map(p => `<option value="${p.id}" ${line && line.productId===p.id?'selected':''}>${escapeHtml(p.sku)} — ${escapeHtml(p.name)}</option>`).join('');
  return `<div class="line-item-row" data-line="${idx}"><select class="li-product">${options}</select><input class="li-qty" type="number" min="1" value="${line ? line.qty : 1}"><button type="button" class="remove-line" title="Remove">✕</button></div>`;
}
function wireLineItems(container){
  container.querySelectorAll('.remove-line').forEach(btn => {
    btn.onclick = () => { if (container.querySelectorAll('.line-item-row').length > 1) btn.closest('.line-item-row').remove(); };
  });
}
function readLineItems(container){
  return Array.from(container.querySelectorAll('.line-item-row')).map(row => ({
    productId: row.querySelector('.li-product').value, qty: Math.floor(Number(row.querySelector('.li-qty').value)) || 0
  })).filter(l => l.qty > 0);
}
function wireAddLine(btnId, containerId){
  const lc = $(containerId); wireLineItems(lc);
  $(btnId).addEventListener('click', () => { lc.insertAdjacentHTML('beforeend', lineItemRowHtml(lc.children.length)); wireLineItems(lc); });
}

/* ============================================================
   RECEIPTS / DELIVERIES / TRANSFERS
   ============================================================ */
function renderReceipts(){
  mount(docListShell('Receipts', 'Incoming stock from suppliers — validating adds to inventory', 'add-receipt-btn', '+ New receipt', 'receipt'));
  wireViewToggle('receipt', renderReceipts);
  const root = $('doc-view-root');
  if (docViewMode.receipt === 'kanban'){ root.innerHTML = renderKanbanBoard('receipt'); wireKanban('receipt'); }
  else {
    root.innerHTML = `<div class="panel"><table><thead><tr>${docHeadCols(['Document','Supplier','Warehouse','Lines','Status','Date',''])}</tr></thead><tbody id="doc-rows"></tbody></table></div>`;
    const rows = [...db.receipts].sort((a,b)=>b.createdAt-a.createdAt);
    $('doc-rows').innerHTML = rows.length ? rows.map(r => `
      <tr><td class="mono">${r.docNo}</td><td>${escapeHtml(r.supplier)}</td><td>${escapeHtml(whName(r.warehouse))}</td><td class="muted">${r.lines.length} line${r.lines.length>1?'s':''}</td><td>${statusBadge(r.status)}</td><td class="muted">${fmtDate(r.createdAt)}</td><td class="row-actions">${docRowActions(r, 'receipt')}</td></tr>
    `).join('') : emptyRow(7, '📥', 'No receipts yet', 'Log an incoming delivery from a supplier to get started.');
    wireDocRowActions('receipt');
  }
  $('add-receipt-btn').addEventListener('click', openReceiptModal);
}
function openReceiptModal(){
  openModal('New receipt', `
    <div class="form-grid">
      <div class="form-field full"><label>Supplier</label><input id="rf-supplier" placeholder="e.g. Ironclad Metals Co."></div>
      <div class="form-field full"><label>Destination warehouse</label><select id="rf-warehouse">${db.warehouses.map(w=>`<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Products received</label><div class="line-items" id="rf-lines">${lineItemRowHtml(0)}</div><button type="button" class="btn btn-ghost btn-sm add-line-btn" id="rf-add-line">+ Add product</button></div>
    </div>
  `, () => {
    const supplier = $('rf-supplier').value.trim();
    if (!supplier){ toast('Supplier is required.', true); return false; }
    const lines = readLineItems($('rf-lines'));
    if (!lines.length){ toast('Add at least one product with a quantity.', true); return false; }
    db.receipts.push({ id: uid('R'), docNo: docNo('WH/IN','receipt'), supplier, warehouse: $('rf-warehouse').value, lines, status:'Draft', createdAt: Date.now() });
    save(); toast('Receipt created as Draft.', 'success'); renderReceipts(); return true;
  }, 'Create receipt');
  wireAddLine('rf-add-line', 'rf-lines');
}

function renderDeliveries(){
  mount(docListShell('Delivery Orders', 'Outgoing stock for customer shipment — validating removes inventory', 'add-delivery-btn', '+ New delivery', 'delivery'));
  wireViewToggle('delivery', renderDeliveries);
  const root = $('doc-view-root');
  if (docViewMode.delivery === 'kanban'){ root.innerHTML = renderKanbanBoard('delivery'); wireKanban('delivery'); }
  else {
    root.innerHTML = `<div class="panel"><table><thead><tr>${docHeadCols(['Document','Customer','Warehouse','Lines','Status','Date',''])}</tr></thead><tbody id="doc-rows"></tbody></table></div>`;
    const rows = [...db.deliveries].sort((a,b)=>b.createdAt-a.createdAt);
    $('doc-rows').innerHTML = rows.length ? rows.map(r => `
      <tr><td class="mono">${r.docNo}</td><td>${escapeHtml(r.customer)}</td><td>${escapeHtml(whName(r.warehouse))}</td><td class="muted">${r.lines.length} line${r.lines.length>1?'s':''}</td><td>${statusBadge(r.status)}</td><td class="muted">${fmtDate(r.createdAt)}</td><td class="row-actions">${docRowActions(r, 'delivery')}</td></tr>
    `).join('') : emptyRow(7, '📤', 'No delivery orders yet', 'Create one to ship stock out to a customer.');
    wireDocRowActions('delivery');
  }
  $('add-delivery-btn').addEventListener('click', openDeliveryModal);
}
function openDeliveryModal(){
  openModal('New delivery order', `
    <div class="form-grid">
      <div class="form-field full"><label>Customer</label><input id="df-customer" placeholder="e.g. BuildRight Contractors"></div>
      <div class="form-field full"><label>Source warehouse</label><select id="df-warehouse">${db.warehouses.map(w=>`<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Products to ship</label><div class="line-items" id="df-lines">${lineItemRowHtml(0)}</div><button type="button" class="btn btn-ghost btn-sm add-line-btn" id="df-add-line">+ Add product</button></div>
    </div>
  `, () => {
    const customer = $('df-customer').value.trim();
    if (!customer){ toast('Customer is required.', true); return false; }
    const lines = readLineItems($('df-lines'));
    if (!lines.length){ toast('Add at least one product with a quantity.', true); return false; }
    db.deliveries.push({ id: uid('D'), docNo: docNo('WH/OUT','delivery'), customer, warehouse: $('df-warehouse').value, lines, status:'Draft', createdAt: Date.now() });
    save(); toast('Delivery order created as Draft.', 'success'); renderDeliveries(); return true;
  }, 'Create delivery');
  wireAddLine('df-add-line', 'df-lines');
}

function renderTransfers(){
  mount(docListShell('Internal Transfers', 'Move stock between warehouses or locations', 'add-transfer-btn', '+ New transfer', 'transfer'));
  wireViewToggle('transfer', renderTransfers);
  const root = $('doc-view-root');
  if (docViewMode.transfer === 'kanban'){ root.innerHTML = renderKanbanBoard('transfer'); wireKanban('transfer'); }
  else {
    root.innerHTML = `<div class="panel"><table><thead><tr>${docHeadCols(['Document','Route','Lines','Status','Date',''])}</tr></thead><tbody id="doc-rows"></tbody></table></div>`;
    const rows = [...db.transfers].sort((a,b)=>b.createdAt-a.createdAt);
    $('doc-rows').innerHTML = rows.length ? rows.map(r => `
      <tr><td class="mono">${r.docNo}</td><td>${escapeHtml(whName(r.fromWarehouse))} → ${escapeHtml(whName(r.toWarehouse))}</td><td class="muted">${r.lines.length} line${r.lines.length>1?'s':''}</td><td>${statusBadge(r.status)}</td><td class="muted">${fmtDate(r.createdAt)}</td><td class="row-actions">${docRowActions(r, 'transfer')}</td></tr>
    `).join('') : emptyRow(6, '⇄', 'No transfers yet', 'Move stock between two warehouses to see it here.');
    wireDocRowActions('transfer');
  }
  $('add-transfer-btn').addEventListener('click', openTransferModal);
}
function openTransferModal(){
  openModal('New internal transfer', `
    <div class="form-grid">
      <div class="form-field"><label>From</label><select id="tf-from">${db.warehouses.map(w=>`<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('')}</select></div>
      <div class="form-field"><label>To</label><select id="tf-to">${db.warehouses.map((w,i)=>`<option value="${w.id}" ${i===1?'selected':''}>${escapeHtml(w.name)}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Products to move</label><div class="line-items" id="tf-lines">${lineItemRowHtml(0)}</div><button type="button" class="btn btn-ghost btn-sm add-line-btn" id="tf-add-line">+ Add product</button></div>
    </div>
  `, () => {
    const from = $('tf-from').value, to = $('tf-to').value;
    if (from === to){ toast('Choose two different locations.', true); return false; }
    const lines = readLineItems($('tf-lines'));
    if (!lines.length){ toast('Add at least one product with a quantity.', true); return false; }
    db.transfers.push({ id: uid('T'), docNo: docNo('WH/INT','transfer'), fromWarehouse: from, toWarehouse: to, lines, status:'Draft', createdAt: Date.now() });
    save(); toast('Transfer created as Draft.', 'success'); renderTransfers(); return true;
  }, 'Create transfer');
  wireAddLine('tf-add-line', 'tf-lines');
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
  $('doc-rows').innerHTML = rows.length ? rows.map(r => `
    <tr><td class="mono">${r.docNo}</td><td>${escapeHtml(productName(r.productId))}</td><td>${escapeHtml(whName(r.warehouse))}</td><td class="num">${r.systemQty}</td><td class="num">${r.countedQty}</td>
    <td class="num" style="color:${r.diff<0?'var(--coral)':(r.diff>0?'var(--green)':'inherit')}">${r.diff>0?'+':''}${r.diff}</td><td>${statusBadge(r.status)}</td>
    <td class="row-actions">${r.status==='Draft' ? `<button class="btn btn-primary btn-sm" data-validate="${r.id}">Validate</button>` : ''}</td></tr>
  `).join('') : emptyRow(8, '🧮', 'No adjustments recorded yet', 'Record a physical count to reconcile stock.');
  document.querySelectorAll('[data-validate]').forEach(b => b.addEventListener('click', () => validateAdjustment(b.dataset.validate)));
  $('add-adj-btn').addEventListener('click', openAdjustmentModal);
}
function openAdjustmentModal(){
  openModal('New stock adjustment', `
    <div class="form-grid">
      <div class="form-field full"><label>Product</label><select id="af-product">${db.products.map(p=>`<option value="${p.id}">${escapeHtml(p.sku)} — ${escapeHtml(p.name)}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Warehouse / location</label><select id="af-warehouse">${db.warehouses.map(w=>`<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('')}</select></div>
      <div class="form-field full"><label>Counted quantity</label><input id="af-counted" type="number" min="0" value="0"></div>
    </div>
  `, () => {
    const productId = $('af-product').value, warehouse = $('af-warehouse').value;
    const counted = Number($('af-counted').value);
    if (!Number.isFinite(counted) || counted < 0){ toast('Enter a valid counted quantity.', true); return false; }
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
  renderAdjustments(); updateTopbarAlert();
}

/* ============================================================
   Shared document list shell + row actions + kanban
   ============================================================ */
function docListShell(title, sub, btnId, btnLabel, kind){
  const toggle = `<div class="view-toggle" id="view-toggle-${kind}">
      <button data-mode="table" class="${docViewMode[kind]!=='kanban'?'active':''}">☰ Table</button>
      <button data-mode="kanban" class="${docViewMode[kind]==='kanban'?'active':''}">▤ Board</button>
    </div>`;
  return `
    <div class="page-head"><div><h1>${title}</h1><div class="page-sub">${sub}</div></div><div class="page-actions">${toggle}<button class="btn btn-primary" id="${btnId}">${btnLabel}</button></div></div>
    <div id="doc-view-root"></div>`;
}
function docHeadCols(cols){ return cols.map(c => `<th>${c}</th>`).join(''); }
function wireViewToggle(kind, rerenderFn){
  const el = $(`view-toggle-${kind}`);
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
function computeNextStatus(status){ const flow = ['Draft','Waiting','Ready','Done']; return flow[flow.indexOf(status)+1]; }

function advanceDoc(kind, id){
  const doc = collectionFor(kind).find(d => d.id === id);
  if (!doc) return;
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
    doc.status = next; save();
    fireConfetti();
    unlockAchievement('first_' + kind);
    checkLedgerProAchievement();
  } else {
    doc.status = next; save();
  }
  toast(`${doc.docNo} marked as ${next}.`, next === 'Done' ? 'success' : undefined);
  navigate(currentView);
}
function cancelDoc(kind, id){
  const doc = collectionFor(kind).find(d => d.id === id);
  if (!doc) return;
  doc.status = 'Cancelled'; save(); toast(`${doc.docNo} cancelled.`); navigate(currentView);
}

function renderKanbanBoard(kind){
  const collection = collectionFor(kind);
  return `<div class="kanban-board">${['Draft','Waiting','Ready','Done'].map(col => {
    const docs = collection.filter(d => d.status === col).sort((a,b)=>b.createdAt-a.createdAt);
    return `<div class="kanban-col">
      <div class="kanban-col-head"><span>${col}</span><span class="kanban-col-count">${docs.length}</span></div>
      <div class="kanban-col-body" data-col="${col}" data-kind="${kind}">${docs.map(d => kanbanCardHtml(d, kind)).join('')}</div>
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
      if (targetCol !== computeNextStatus(doc.status)){ toast('Documents move one stage at a time — use the next column.', true); return; }
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
    const t = $('lg-type').value, q = $('lg-product').value.trim().toLowerCase();
    return db.ledger.filter(l => {
      if (t && l.type !== t) return false;
      if (q && !productName(l.productId).toLowerCase().includes(q) && !productSku(l.productId).toLowerCase().includes(q)) return false;
      return true;
    });
  }
  function draw(){
    const rows = currentRows();
    $('ledger-rows').innerHTML = rows.length ? rows.map(l => `
      <tr><td>${docTypeTag(l.type)}</td><td class="mono">${l.ref}</td><td>${escapeHtml(productName(l.productId))} <span class="muted mono" style="font-size:11.5px;">${escapeHtml(productSku(l.productId))}</span></td>
      <td class="muted">${l.from ? escapeHtml(whName(l.from)) : '—'}</td><td class="muted">${l.to ? escapeHtml(whName(l.to)) : '—'}</td>
      <td class="num" style="color:${l.delta<0?'var(--coral)':'var(--green)'}">${l.delta>0?'+':''}${l.delta}</td><td class="muted">${fmtDate(l.ts)}</td></tr>
    `).join('') : emptyRow(7, '≡', 'No movements recorded yet', 'Validate a document to see it appear in the ledger.');
  }
  $('lg-type').addEventListener('change', draw);
  $('lg-product').addEventListener('input', draw);
  $('export-ledger-csv-btn').addEventListener('click', () => {
    downloadCsv(
      ['Type','Reference','Product','SKU','From','To','Qty','Date'],
      currentRows().map(l => [l.type, l.ref, productName(l.productId), productSku(l.productId), l.from?whName(l.from):'', l.to?whName(l.to):'', l.delta, fmtDate(l.ts)]),
      `stocksense-ledger-${Date.now()}.csv`
    );
    toast('Ledger exported as CSV.', 'success');
  });
  draw();
}

/* ============================================================
   SETTINGS + PROFILE
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
    $('wh-list').innerHTML = db.warehouses.length ? db.warehouses.map(w => `
      <div class="wh-row"><div><div class="wh-name">${escapeHtml(w.name)}</div><div class="wh-code">${escapeHtml(w.code)}</div></div><span class="muted" style="font-size:12.5px;">${db.products.reduce((a,p)=>a+stockAt(p,w.id),0)} units on hand</span></div>
    `).join('') : `<div class="empty-state"><div class="empty-state-ic">🏭</div><div class="empty-state-title">No warehouses yet</div><div class="empty-state-sub">Add one to start tracking stock by location.</div></div>`;
  }
  $('add-wh-btn').addEventListener('click', () => {
    openModal('New warehouse', `
      <div class="form-grid"><div class="form-field full"><label>Name</label><input id="wf-name" placeholder="e.g. Warehouse 3"></div><div class="form-field full"><label>Short code</label><input id="wf-code" placeholder="e.g. WH3"></div></div>
    `, () => {
      const name = $('wf-name').value.trim(), code = $('wf-code').value.trim().toUpperCase();
      if (!name || !code){ toast('Name and code are required.', true); return false; }
      const id = uid('wh'); db.warehouses.push({ id, name, code }); db.products.forEach(p => p.stock[id] = 0);
      save(); toast('Warehouse added.', 'success'); unlockAchievement('expander'); draw(); return true;
    }, 'Add warehouse');
  });
  $('reset-demo-btn').addEventListener('click', () => {
    if (confirm('This clears all stock data and reloads the original demo dataset. Your accounts are kept. Continue?')){
      seedDb(db.users); toast('Demo data reset.'); navigate('dashboard');
    }
  });
  $('settings-theme-btn').addEventListener('click', toggleTheme);
  $('settings-accent-btn').addEventListener('click', () => $('accent-btn').click());
  draw();
}

function renderProfile(){
  const user = currentUser();
  mount(`
    <div class="page-head"><div><h1>My Profile</h1><div class="page-sub">Account details and progress for this session</div></div></div>
    <div class="panel profile-card">
      <div class="profile-head"><span class="avatar">${escapeHtml(initialsOf(user.name))}</span><div><div style="font-weight:700; font-size:16px;">${escapeHtml(user.name)}</div><div class="muted" style="font-size:13px;">${escapeHtml(user.role)}</div></div></div>
      <div class="form-grid"><div class="form-field full"><label>Email</label><input value="${escapeHtml(user.email)}" disabled></div><div class="form-field full"><label>Role</label><input value="${escapeHtml(user.role)}" disabled></div></div>
    </div>
    <div class="chart-panel" style="margin-top:18px; max-width:520px;">
      <h3>Achievements — ${db.achievements.length}/${ACHIEVEMENTS.length}</h3>
      <div class="badge-shelf">${achievementShelfHtml()}</div>
    </div>
  `);
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(title, bodyHtml, onSave, saveLabel){
  const root = $('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-head"><h3>${title}</h3><button class="modal-close" id="modal-close">✕</button></div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-foot"><button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">${saveLabel || 'Save'}</button></div>
      </div>
    </div>`;
  const close = () => { root.innerHTML = ''; };
  $('modal-close').addEventListener('click', close);
  $('modal-cancel').addEventListener('click', close);
  $('modal-overlay').addEventListener('click', e => { if (e.target.id === 'modal-overlay') close(); });
  $('modal-save').addEventListener('click', () => { if (onSave() !== false) close(); });
  const first = root.querySelector('input, select'); if (first) first.focus();
}

/* ============================================================
   CONFETTI
   ============================================================ */
function fireConfetti(){
  const canvas = $('confetti-canvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#6C4DF6','#12C6B8','#FFA53E','#FF5D7A','#29B37B'];
  const pieces = Array.from({length: 110}, () => ({
    x: Math.random()*canvas.width, y: -20 - Math.random()*canvas.height*0.3,
    vx: (Math.random()-0.5)*3.4, vy: Math.random()*2.5+2.2, rot: Math.random()*360, vr:(Math.random()-0.5)*12,
    size: Math.random()*6+4, color: colors[Math.floor(Math.random()*colors.length)]
  }));
  let frames = 0;
  (function loop(){
    frames++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6); ctx.restore();
    });
    if (frames < 120) requestAnimationFrame(loop); else ctx.clearRect(0,0,canvas.width,canvas.height);
  })();
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
function openShortcuts(){ $('shortcuts-overlay').classList.remove('hidden'); }
function closeShortcuts(){ $('shortcuts-overlay').classList.add('hidden'); }
function initShortcutsModal(){
  $('shortcuts-grid').innerHTML = KEYBOARD_SHORTCUTS.map(s => `
    <div class="shortcut-row"><span>${s.label}</span><span class="keys">${s.keys.map(k=>`<kbd>${k}</kbd>`).join('')}</span></div>
  `).join('');
  $('shortcuts-close').addEventListener('click', closeShortcuts);
  $('shortcuts-overlay').addEventListener('click', e => { if (e.target.id === 'shortcuts-overlay') closeShortcuts(); });
}
function initGlobalKeyboardShortcuts(){
  document.addEventListener('keydown', e => {
    if (!isAppVisible()) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openCommandPalette(); return; }
    if (e.key === 'Escape'){ closeAllOverlays(); return; }
    if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '/'){ e.preventDefault(); $('global-search').focus(); return; }
    if (e.key === '?'){ e.preventDefault(); openShortcuts(); return; }
    const k = e.key.toLowerCase();
    if (k === 't'){ toggleTheme(); return; }
    if (k === 's'){ takeScreenshot(); return; }
    if (k === 'g'){ startTour(); return; }
    const n = Number(e.key);
    if (n >= 1 && n <= PAGE_ORDER.length){ location.hash = PAGE_ORDER[n-1]; }
  });
}

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
let cmdkIndex = 0, cmdkItems = [];
function buildCommandItems(){
  const go = (hash, ic, label) => ({ ic, label, run: () => { location.hash = hash; } });
  const pages = [
    go('dashboard','▦','Go to Dashboard'), go('analytics','📊','Go to Analytics'), go('products','▤','Go to Products'),
    go('receipts','↓','Go to Receipts'), go('deliveries','↑','Go to Delivery Orders'), go('transfers','⇄','Go to Internal Transfers'),
    go('adjustments','±','Go to Stock Adjustments'), go('ledger','≡','Go to Move History'), go('settings','⚙','Go to Settings'),
  ];
  const newDoc = (hash, label, fn) => ({ ic:'+', label, meta:'action', run: () => { if (location.hash !== '#' + hash) location.hash = hash; setTimeout(fn, 80); } });
  const actions = [
    newDoc('receipts','New receipt',openReceiptModal), newDoc('deliveries','New delivery order',openDeliveryModal),
    newDoc('transfers','New internal transfer',openTransferModal), newDoc('adjustments','New stock adjustment',openAdjustmentModal),
    newDoc('products','New product',() => openProductModal(null)),
    { ic:'🎨', label:'Change accent color', meta:'action', run: () => $('accent-btn').click() },
    { ic:'🔔', label:'Open notifications', meta:'action', run: () => $('notif-btn').click() },
    { ic:'🌙', label:'Toggle light / dark theme', meta:'T', run: toggleTheme },
    { ic:'◧', label:'Take a screenshot', meta:'S', run: takeScreenshot },
    { ic:'▤', label:'Export PDF guide', meta:'action', run: exportPdf },
    { ic:'◎', label:'Start guided tour', meta:'G', run: startTour },
    { ic:'⌨', label:'Show keyboard shortcuts', meta:'?', run: openShortcuts },
    { ic:'⏻', label:'Logout', meta:'action', run: logout },
  ];
  const products = db.products.map(p => ({ ic:'▤', label:p.name, meta:p.sku, run: () => {
    location.hash = 'products';
    setTimeout(() => { $('global-search').value = p.sku; navigate('products'); renderProducts(p.sku); }, 80);
  }}));
  return [...pages, ...actions, ...products];
}
function openCommandPalette(){
  cmdkItems = buildCommandItems(); cmdkIndex = 0;
  $('cmdk-overlay').classList.remove('hidden');
  const input = $('cmdk-input');
  input.value = ''; input.focus();
  renderCmdkResults(cmdkItems);
}
function closeCommandPalette(){ $('cmdk-overlay').classList.add('hidden'); }
function renderCmdkResults(items){
  const root = $('cmdk-results');
  root.innerHTML = items.length ? items.map((it,i) => `
    <div class="cmdk-item ${i===cmdkIndex?'active':''}" data-idx="${i}"><span class="cmdk-ic">${it.ic}</span><span>${escapeHtml(it.label)}</span>${it.meta?`<span class="cmdk-meta">${escapeHtml(it.meta)}</span>`:''}</div>
  `).join('') : `<div class="cmdk-empty">No matches.</div>`;
  root.querySelectorAll('.cmdk-item').forEach(el => {
    el.addEventListener('click', () => { const it = items[Number(el.dataset.idx)]; closeCommandPalette(); it.run(); });
  });
  const active = root.querySelector('.cmdk-item.active'); if (active) active.scrollIntoView({ block:'nearest' });
}
function initCommandPalette(){
  $('cmdk-overlay').addEventListener('click', e => { if (e.target.id === 'cmdk-overlay') closeCommandPalette(); });
  const input = $('cmdk-input');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    cmdkItems = buildCommandItems().filter(it => it.label.toLowerCase().includes(q) || (it.meta||'').toLowerCase().includes(q));
    cmdkIndex = 0; renderCmdkResults(cmdkItems);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); cmdkIndex = Math.min(cmdkIndex+1, cmdkItems.length-1); renderCmdkResults(cmdkItems); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); cmdkIndex = Math.max(cmdkIndex-1, 0); renderCmdkResults(cmdkItems); }
    else if (e.key === 'Enter'){ e.preventDefault(); const it = cmdkItems[cmdkIndex]; if (it){ closeCommandPalette(); it.run(); } }
  });
}

/* ============================================================
   GUIDED TOUR
   ============================================================ */
let tourIdx = 0;
function startTour(){
  if (!isAppVisible()) return;
  try { localStorage.setItem(TOUR_SEEN_KEY, '1'); } catch(e){}
  tourIdx = 0;
  $('tour-overlay').classList.remove('hidden');
  showTourStep();
}
function closeTour(){ $('tour-overlay').classList.add('hidden'); }
function showTourStep(){
  const step = TOUR_STEPS[tourIdx];
  const target = document.querySelector(step.selector);
  const spot = $('tour-spotlight'), card = $('tour-card');
  const r = target ? target.getBoundingClientRect() : null;
  if (r && r.width > 0){
    spot.style.left = (r.left-6)+'px'; spot.style.top = (r.top-6)+'px';
    spot.style.width = (r.width+12)+'px'; spot.style.height = (r.height+12)+'px';
    spot.classList.remove('hidden');
    let top = r.bottom + 14, left = r.left;
    if (top + 220 > window.innerHeight) top = Math.max(14, r.top - 230);
    if (left + 320 > window.innerWidth) left = window.innerWidth - 336;
    card.style.transform = '';
    card.style.top = top + 'px'; card.style.left = Math.max(14,left) + 'px';
  } else {
    spot.classList.add('hidden');
    card.style.top = '40%'; card.style.left = '50%'; card.style.transform = 'translate(-50%,-50%)';
  }
  $('tour-step-count').textContent = `Step ${tourIdx+1} of ${TOUR_STEPS.length}`;
  $('tour-title').textContent = step.title;
  $('tour-text').textContent = step.text;
  $('tour-prev').disabled = tourIdx === 0;
  $('tour-next').textContent = tourIdx === TOUR_STEPS.length-1 ? 'Finish' : 'Next';
}
function initTourControls(){
  $('tour-next').addEventListener('click', () => {
    if (tourIdx === TOUR_STEPS.length-1){ closeTour(); toast('Tour complete — you know your way around now.', 'success'); return; }
    tourIdx++; showTourStep();
  });
  $('tour-prev').addEventListener('click', () => { if (tourIdx>0){ tourIdx--; showTourStep(); } });
  $('tour-skip').addEventListener('click', closeTour);
  window.addEventListener('resize', () => { if (!$('tour-overlay').classList.contains('hidden')) showTourStep(); });
}

/* ============================================================
   SCREENSHOT EXPORT
   ============================================================ */
function takeScreenshot(){
  if (typeof html2canvas === 'undefined'){ toast('Screenshot library failed to load — check your connection.', true); return; }
  const user = currentUser();
  const bg = getComputedStyle(document.body).backgroundColor;
  toast('Capturing screenshot…');
  html2canvas($('app-content'), { backgroundColor: bg, scale: 2, useCORS: true }).then(canvas => {
    const stamped = document.createElement('canvas');
    stamped.width = canvas.width; stamped.height = canvas.height + 60;
    const ctx = stamped.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, stamped.width, stamped.height);
    ctx.drawImage(canvas, 0, 0);
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = dark ? '#ECE9FB' : '#171332';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`StockSense — exported by ${user ? user.name : 'guest'}`, 20, canvas.height + 38);
    ctx.font = '16px sans-serif'; ctx.fillStyle = dark ? '#A79FD1' : '#635E85';
    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleString(), stamped.width - 20, canvas.height + 38);
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

  const addPageIfNeeded = lh => { if (y + lh > 780){ doc.addPage(); y = 60; } };
  function heading(text, size){
    addPageIfNeeded(size+16);
    doc.setFont('helvetica','bold'); doc.setFontSize(size); doc.setTextColor('#171332');
    doc.text(text, margin, y); y += size + 12;
  }
  function paragraph(text){
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor('#333333');
    doc.splitTextToSize(text, maxW).forEach(line => { addPageIfNeeded(16); doc.text(line, margin, y); y += 16; });
    y += 8;
  }
  function bullet(text){
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor('#333333');
    doc.splitTextToSize('•  ' + text, maxW - 10).forEach((line,i) => { addPageIfNeeded(16); doc.text(line, margin + (i===0?0:12), y); y += 16; });
  }

  doc.setFillColor('#171332'); doc.rect(0,0,pageW,140,'F');
  doc.setTextColor('#ffffff'); doc.setFont('helvetica','bold'); doc.setFontSize(26);
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
  paragraph('Stock in StockSense is tracked per warehouse, not as one global number. A product\'s "total stock" is the sum across every warehouse, but transfers and delivery checks all operate at the individual warehouse level — which is what makes internal transfers meaningful.');

  heading('5. Low-stock alerts and reorder points', 15);
  paragraph('Each product carries a reorder point — the total quantity below which it is considered "low stock". The dashboard, notification bell and Analytics page all surface low-stock and out-of-stock counts so a manager can act before a shortage actually happens.');

  heading('6. The stock ledger — the advanced part', 15);
  paragraph('Every validated movement, regardless of which document created it, is written as one entry in the Move History ledger: type, reference document, product, quantity delta, source location, destination location, and timestamp. The Analytics page turns this same ledger into a category breakdown, a status-mix chart and a 7-day activity trend.');

  heading('7. This build\'s feature set', 15);
  bullet('Accounts for Inventory Managers and Warehouse Staff, with OTP-based password reset (simulated).');
  bullet('A live, filterable dashboard (by document type, status, warehouse and category) plus an Analytics page with animated charts.');
  bullet('Table and drag-and-drop board views for receipts, deliveries and transfers.');
  bullet('A command palette (Ctrl+K) for keyboard-first navigation across pages, products and actions.');
  bullet('An accent color picker, full light/dark theming, a notification center, achievement badges, a guided product tour, and this exportable PDF explainer.');
  bullet('Screenshot and CSV export, and 100% client-side data persistence — it runs with no backend.');
  y += 10;

  heading('8. Live snapshot at export time', 15);
  const low = db.products.filter(isLow).length, out = db.products.filter(isOut).length;
  paragraph(`At the moment this PDF was generated, the system holds ${db.products.length} products across ${db.warehouses.length} warehouse(s), with ${low} product(s) running low and ${out} out of stock. ${db.achievements.length} of ${ACHIEVEMENTS.length} achievements have been unlocked so far.`);

  addPageIfNeeded(200);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor('#171332');
  doc.text('Product', margin, y); doc.text('SKU', margin+220, y); doc.text('Category', margin+310, y); doc.text('Total stock', margin+430, y);
  y += 6; doc.setDrawColor('#E4DFF7'); doc.line(margin, y, pageW-margin, y); y += 14;
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor('#333333');
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
  doc.text(`Generated by StockSense — a hackathon project by ${TEAM.map(t => t.name).join(', ')}.`, margin, y);

  doc.save(`StockSense-Guide-${user ? user.name.replace(/\s+/g,'-') : 'guest'}.pdf`);
  toast('PDF guide downloaded.', 'success');
}

/* ============================================================
   BOOT — every initialiser runs exactly once
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAccent();
  initRipples();
  loadDb();
  initLanding();
  initCinema();
  initAuthScreen();
  initShellEvents();
  initCommandPalette();
  initShortcutsModal();
  initGlobalKeyboardShortcuts();
  initTourControls();
  runSplash();
});