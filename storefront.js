/* ============================================================
   ECWID — Storefront JS API Filters + Grid + Pagination
   - Tabs (titles) come from PRODUCT OPTION NAMES
   - Checkbox values come from PRODUCT OPTION CHOICES
   - No tokens; works via Ecwid.OnAPILoaded + Ecwid.API.get
   ============================================================ */

Ecwid.OnAPILoaded.add(() => {
  /* ------------------ CONFIG ------------------ */
  const preferredNames = ["Color", "Durability", "Category", "Designer"]; // use these first if they exist
  const whitelist = false;          // true => show only preferredNames
  const pageSize = 12;              // items per page
  const maxProductsToLoad = 800;    // safety cap (fetches in batches of 100)

  /* -------------- DOM INJECTION --------------- */
  const mount = ensureRootInserted();

  // inject styles
  const style = document.createElement("style");
  style.textContent = `
    :root{
      --ff-max:1280px; --ff-gap:36px; --ff-accent:#111; --ff-muted:#666;
      --ff-border:#d9d9d9; --ff-panel:#f6f6f2;
    }
    #ff-root{max-width:var(--ff-max);margin:0 auto;padding:24px}
    .ff-header{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
    .ff-kicker{color:#3a4b04;font-weight:800;font-size:20px}
    .ff-tabs{display:flex;gap:18px;flex-wrap:wrap}
    .ff-tab{position:relative;border:1px solid var(--ff-accent);background:#fff;padding:12px 22px;cursor:pointer;font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-radius:3px}
    .ff-tab.active{background:#111;color:#fff}
    .ff-tab.active::after{content:"";position:absolute;left:50%;transform:translateX(-50%);bottom:-10px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid #111}
    .ff-tab.ff-showall{margin-left:auto}
    .ff-panels{position:relative;margin-top:18px}
    .ff-panel{display:none;position:absolute;left:0;right:0;top:0;z-index:40;background:var(--ff-panel);border:1px solid var(--ff-border);border-radius:8px;box-shadow:0 10px 24px rgba(0,0,0,.08)}
    .ff-panel.open{display:block;animation:ffDrop .15s ease-out}
    @keyframes ffDrop{from{transform:translateY(-6px);opacity:.0}to{transform:translateY(0);opacity:1}}
    .ff-panel-body{display:grid;grid-template-columns:320px 1fr;gap:32px;padding:24px}
    .ff-panel-hero img{width:100%;height:220px;object-fit:cover;border-radius:6px}
    .ff-hero-text{margin-top:10px}
    .ff-hero-title{font-weight:800;font-size:26px;margin-bottom:6px;color:#3a4b04}
    .ff-hero-link{font-weight:700;border-bottom:2px solid var(--ff-accent);text-decoration:none;color:inherit}
    .ff-checklist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 30px;align-content:start;padding-right:16px}
    .ff-checklist label{display:flex;align-items:center;gap:10px;font-size:14px}
    .ff-checklist input{width:16px;height:16px}
    .ff-panel-actions{margin-top:16px;display:flex;gap:12px}
    .ff-apply{border:0;background:#bfbfbf;padding:12px 22px;border-radius:2px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;color:#fff}
    .ff-clear{border:1px solid var(--ff-border);background:#fff;padding:12px 18px;border-radius:2px;font-weight:700;cursor:pointer}
    .ff-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:30}
    .ff-overlay.show{display:block}
    .ff-toolbar{display:flex;justify-content:flex-end;margin:16px 0 18px}
    .ff-reset-all{border:1px solid var(--ff-border);background:#fff;padding:10px 14px;border-radius:4px;cursor:pointer}
    .ff-products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--ff-gap)}
    .ff-card{cursor:pointer}
    .ff-media{aspect-ratio:4/3;width:100%;object-fit:cover;border-radius:6px;transition:transform .25s}
    .ff-card:hover .ff-media{transform:scale(1.02)}
    .ff-info{margin-top:12px}
    .ff-name{font-weight:800;font-size:18px}
    .ff-sub{color:var(--ff-muted);font-size:14px;margin-top:6px}
    .ff-badge{position:absolute;top:12px;left:12px;background:#000;color:#fff;font-size:10px;letter-spacing:.12em;padding:6px 8px;border-radius:2px}
    .ff-pagination{display:flex;gap:8px;justify-content:center;align-items:center;margin:26px 0 6px;flex-wrap:wrap}
    .ff-page-btn{min-width:36px;height:36px;padding:0 10px;border:1px solid var(--ff-border);background:#fff;border-radius:6px;cursor:pointer;font-weight:700}
    .ff-page-btn[disabled]{opacity:.45;cursor:default}
    .ff-page-btn.active{background:#111;border-color:#111;color:#fff}
    .ff-ellipsis{padding:0 6px;color:#999;font-weight:700}
    @media (max-width:1100px){.ff-products{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media (max-width:900px){.ff-panel-body{grid-template-columns:1fr}}
    @media (max-width:820px){.ff-products{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media (max-width:520px){.ff-products{grid-template-columns:1fr}.ff-checklist{grid-template-columns:repeat(2,minmax(0,1fr))}.ff-tab{padding:10px 14px;font-size:12px}}
  `;
  document.head.appendChild(style);

  // inject HTML shell
  mount.innerHTML = `
    <div class="ff-header">
      <div class="ff-kicker">Filter fabric by:</div>
      <div class="ff-tabs" id="ff-tabs"></div>
    </div>
    <div class="ff-panels" id="ff-panels"></div>
    <div class="ff-overlay" id="ff-overlay"></div>
    <div class="ff-toolbar"><button class="ff-reset-all" id="ff-reset-all" type="button">Reset All Filters</button></div>
    <div id="ff-grid" class="ff-products"></div>
    <nav class="ff-pagination" id="ff-pagination" aria-label="Products pagination"></nav>
  `;

  /* --------------- STATE ---------------- */
  const S = {
    all: [],
    optionNames: [],
    optionValues: {}, // {name:Set(values)}
    selected: {},     // {name:Set(selectedValues)}
    page: 1,
    filtered: []
  };

  /* --------------- HELPERS -------------- */
  function ensureSetsFor(name){
    if (!S.optionValues[name]) S.optionValues[name] = new Set();
    if (!S.selected[name]) S.selected[name] = new Set();
  }
  const uniqueSorted = arr => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>a.localeCompare(b));
  const getOptionDef = (p, n) => (p.options || []).find(o => o && o.name === n);
  function sublineFromPreferred(p){
    const look = preferredNames.concat(S.optionNames.filter(n=>!preferredNames.includes(n)));
    for (const n of look){
      const def = getOptionDef(p, n);
      if (def && def.choices && def.choices.length){
        const t = def.choices[0]?.text || "";
        if (t) return t;
      }
    }
    return "";
  }

  /* ------- BUILD TABS/PANELS ---------- */
  const tabsWrap = mount.querySelector("#ff-tabs");
  const panelsWrap = mount.querySelector("#ff-panels");
  const overlay = mount.querySelector("#ff-overlay");
  const grid = mount.querySelector("#ff-grid");
  const pager = mount.querySelector("#ff-pagination");
  const resetAllBtn = mount.querySelector("#ff-reset-all");

  function buildTabsAndPanels(){
    tabsWrap.innerHTML = "";
    panelsWrap.innerHTML = "";

    S.optionNames.forEach(name=>{
      // tab
      const btn = document.createElement("button");
      btn.className = "ff-tab";
      btn.dataset.panel = name;
      btn.textContent = name;
      tabsWrap.appendChild(btn);

      // panel
      const panel = document.createElement("div");
      panel.className = "ff-panel";
      panel.id = `panel-${name}`;
      const values = uniqueSorted(Array.from(S.optionValues[name] || []));
      panel.innerHTML = `
        <div class="ff-panel-body">
          ${name === "Color" ? `
          <div class="ff-panel-hero">
            <img src="https://images.unsplash.com/photo-1604335399105-40b0a3d67f4a?q=80&w=900&auto=format&fit=crop" alt="">
            <div class="ff-hero-text">
              <div class="ff-hero-title">It All Starts With ${name}</div>
              <a class="ff-hero-link" href="#">Learn how it's made</a>
            </div>
          </div>` : ``}
          <form class="ff-checklist" data-filter="${name}">
            ${
              values.length
                ? values.map(v=>`<label><input type="checkbox" value="${v}"><span>${v}</span></label>`).join("")
                : `<div style="color:#666">No values found for ${name}.</div>`
            }
          </form>
          <div class="ff-panel-actions">
            <button type="button" class="ff-apply" data-apply="${name}">Apply Filters</button>
            <button type="button" class="ff-clear" data-clear="${name}">Clear</button>
          </div>
        </div>
      `;
      panelsWrap.appendChild(panel);
      S.selected[name] = S.selected[name] || new Set();
    });

    const showAll = document.createElement("button");
    showAll.className = "ff-tab ff-showall";
    showAll.dataset.panel = "__all";
    showAll.textContent = "Show All";
    tabsWrap.appendChild(showAll);

    wireTabs();
  }

  function wireTabs(){
    const allTabs = Array.from(tabsWrap.querySelectorAll(".ff-tab"));
    const getPanel = name => panelsWrap.querySelector(`#panel-${CSS.escape(name)}`);

    const closePanels = ()=>{
      Array.from(panelsWrap.children).forEach(p=>p.classList.remove("open"));
      overlay.classList.remove("show");
      allTabs.forEach(t=>!t.classList.contains("ff-showall") && t.classList.remove("active"));
    };

    allTabs.forEach(btn=>{
      btn.onclick = ()=>{
        const key = btn.dataset.panel;
        if (key === "__all"){
          closePanels();
          allTabs.forEach(t=>t.classList.remove("active"));
          btn.classList.add("active");
          Object.values(S.selected).forEach(s=>s.clear());
          panelsWrap.querySelectorAll('input[type="checkbox"]').forEach(i=>i.checked=false);
          S.page = 1;
          applyFilters();
          return;
        }
        const panel = getPanel(key);
        const open = panel.classList.contains("open");
        closePanels();
        if (!open){
          panel.classList.add("open");
          overlay.classList.add("show");
          btn.classList.add("active");
        }
      };
    });

    overlay.onclick = ()=>{
      overlay.classList.remove("show");
      Array.from(panelsWrap.children).forEach(p=>p.classList.remove("open"));
      allTabs.forEach(t=>t.classList.remove("active"));
    };

    panelsWrap.querySelectorAll(".ff-apply").forEach(b=>{
      b.onclick = ()=>{
        const name = b.dataset.apply;
        S.selected[name].clear();
        panelsWrap.querySelectorAll(`.ff-checklist[data-filter="${CSS.escape(name)}"] input:checked`)
          .forEach(i=>S.selected[name].add(i.value));
        S.page = 1;
        overlay.click();
        applyFilters();
      };
    });

    panelsWrap.querySelectorAll(".ff-clear").forEach(b=>{
      b.onclick = ()=>{
        const name = b.dataset.clear;
        S.selected[name].clear();
        panelsWrap.querySelectorAll(`.ff-checklist[data-filter="${CSS.escape(name)}"] input`)
          .forEach(i=>i.checked=false);
        S.page = 1;
        applyFilters();
      };
    });
  }

  /* ---------- RENDER GRID + PAGINATION ---------- */
  function renderGrid(slice){
    if (!slice.length){
      grid.innerHTML = `<div style="color:#666">No products match your filters.</div>`;
      pager.innerHTML = "";
      return;
    }
    grid.innerHTML = slice.map(p=>{
      const sub = sublineFromPreferred(p);
      const created = p.created || p.createTimestamp;
      const isNew = created ? (Date.now() - new Date(created).getTime() < 30*864e5) : false;
      const thumb = p.thumbnailUrl || p.imageUrl || "";
      return `
        <div class="ff-card" onclick="Ecwid.openPage('product', {'id': ${p.id}})">
          <div style="position:relative">
            <img class="ff-media" src="${thumb}" alt="${p.name}">
            ${isNew ? `<span class="ff-badge">NEW</span>` : ``}
          </div>
          <div class="ff-info">
            <div class="ff-name">${p.name}</div>
            ${sub ? `<div class="ff-sub">${sub}</div>` : ``}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderPagination(total){
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const cur = Math.min(S.page, pages);
    const btn = (label, page, disabled=false, active=false) =>
      `<button class="ff-page-btn ${active?'active':''}" ${disabled?'disabled':''} data-page="${page}">${label}</button>`;

    const parts = [];
    parts.push(btn("Prev", Math.max(1, cur-1), cur===1));

    const windowSize = 5;
    let start = Math.max(1, cur - Math.floor(windowSize/2));
    let end   = Math.min(pages, start + windowSize - 1);
    if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);

    if (start > 1){ parts.push(btn(1,1,false,cur===1)); if (start > 2) parts.push(`<span class="ff-ellipsis">…</span>`); }
    for (let i=start;i<=end;i++){ parts.push(btn(i,i,false,cur===i)); }
    if (end < pages){ if (end < pages - 1) parts.push(`<span class="ff-ellipsis">…</span>`); parts.push(btn(pages,pages,false,cur===pages)); }

    parts.push(btn("Next", Math.min(pages, cur+1), cur===pages));
    pager.innerHTML = parts.join("");

    pager.querySelectorAll(".ff-page-btn").forEach(b=>{
      b.onclick = ()=>{
        const p = parseInt(b.dataset.page,10);
        if (!isNaN(p)){ S.page = p; paginateAndRender(); window.scrollTo({top: mount.offsetTop-20, behavior:"smooth"}); }
      };
    });
  }

  function paginateAndRender(){
    const total = S.filtered.length;
    const start = (S.page - 1) * pageSize;
    const slice = S.filtered.slice(start, start + pageSize);
    renderGrid(slice);
    renderPagination(total);
  }

  /* --------------- FILTERING --------------- */
  function applyFilters(){
    const active = Object.entries(S.selected).filter(([,set])=>set.size);
    if (!active.length){
      S.filtered = S.all.slice();
    } else {
      S.filtered = S.all.filter(p=>{
        return active.every(([name,set])=>{
          const def = getOptionDef(p, name);
          if (!def || !Array.isArray(def.choices) || !def.choices.length) return false;
          const vals = def.choices.map(c=>c.text);
          return Array.from(set).some(s => vals.includes(s));
        });
      });
    }
    paginateAndRender();
  }

  resetAllBtn.onclick = ()=>{
    Object.values(S.selected).forEach(s=>s.clear());
    panelsWrap.querySelectorAll('input[type="checkbox"]').forEach(i=>i.checked=false);
    S.page = 1;
    applyFilters();
  };

  /* --------------- LOAD PRODUCTS --------------- */
  function collectFromProducts(items){
    const namesFound = new Set();
    items.forEach(p=>{
      (p.options || []).forEach(opt=>{
        if (!opt || !opt.name) return;
        namesFound.add(opt.name);
        ensureSetsFor(opt.name);
        (opt.choices || []).forEach(ch=>{
          const v = ch && (ch.text || ch.value || ch.title);
          if (v) S.optionValues[opt.name].add(v);
        });
      });
    });

    const allNames = Array.from(namesFound);
    const preferred = preferredNames.filter(n => allNames.includes(n));
    S.optionNames = whitelist ? preferred : (preferred.length ? preferred : allNames);
    S.optionNames.forEach(ensureSetsFor);
  }

  function fetchAllProducts(cb){
    const batch = 100;
    let offset = 0;
    const out = [];
    const loop = ()=>{
      Ecwid.API.get("products", { limit: batch, offset }, (res)=>{
        const items = (res && res.items) ? res.items : [];
        out.push(...items);
        if (items.length === batch && out.length < maxProductsToLoad){
          offset += batch; loop();
        } else { cb(out); }
      });
    };
    loop();
  }

  function init(){
    fetchAllProducts(items=>{
      S.all = items;
      collectFromProducts(items);
      buildTabsAndPanels();
      S.filtered = items.slice();
      paginateAndRender();
    });
  }

  init();

  /* ---------- Helpers: mount placement ---------- */
  function ensureRootInserted(){
    const rootId = "ff-root";
    let el = document.getElementById(rootId);
    if (el) return el;

    el = document.createElement("section");
    el.id = rootId;

    // Try to place above Ecwid widget if present
    const ecwidMount = document.querySelector("#my-store, #ecwid-store, .ec-store");
    if (ecwidMount && ecwidMount.parentNode){
      ecwidMount.parentNode.insertBefore(el, ecwidMount);
    } else {
      document.body.insertAdjacentElement("afterbegin", el);
    }
    return el;
  }
});
