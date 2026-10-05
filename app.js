/* ON ROTATION / Verse + Hook. Proof of concept. State lives in memory only. */
(function () {
  const E = window.EDITION;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const d8 = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const short = (iso) => { const d = d8(iso); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; };
  const CITY_CODE = { det: "DET 313", tor: "TOR 416", atl: "ATL 404", nat: "NATIONAL" };
  const CITY_NAME = { det: "Detroit", tor: "Toronto", atl: "Atlanta", nat: "national" };
  const inW = () => state.city === "all" ? "" : state.city === "nat" ? " nationally" : " in " + CITY_NAME[state.city];
  const TEAM_NAME = { strategy: "Strategy + Insights", creative: "Creative", production: "Production" };

  const state = { city: "all", v: null, mode: "full", verdict: "all", kitV: "spirits", lens: "all" };
  const vname = (v) => (E.verticals[v] || (E.verticals_extra || {})[v] || "");
  const LENS = { strategy: "STRATEGY + INSIGHTS", data: "WATCH IN THE DATA", creative: "CREATIVE", production: "PRODUCTION" };

  /* ---------- the records ---------- */
  const COVERS = {
    spirits: { vol: "01", title: "SPIRITS\n+ BEER", style: "grooves" },
    foodbev: { vol: "02", title: "FOOD\n+ BEV", style: "img", image: "assets/og/refettorio.jpg" },
    qsr: { vol: "03", title: "QSR", style: "dots", tone: "white" },
    cpg: { vol: "04", title: "CPG", style: "img", image: "assets/og/cheezit.jpg" },
    drygoods: { vol: "05", title: "DRY\nGOODS", style: "crop", tone: "white" },
    beauty: { vol: "06", title: "BEAUTY", style: "quote", tone: "deep" },
    music: { vol: "08", title: "MUSIC", style: "img", image: "assets/og/outkast.jpg" },
    fashion: { vol: "07", title: "FASHION", style: "crop", tone: "black" },
    arts: { vol: "10", title: "MUSEUM\n+ ARTS", style: "img", image: "assets/og/high.jpg" },
    education: { vol: "09", title: "EDUCATION", style: "bars", tone: "white" },
    auto: { vol: "11", title: "AUTO", style: "rings", tone: "white" },
    retail: { vol: "12", title: "RETAIL +\nSERVICES", style: "grid", tone: "deep" }
  };
  const SIDES = [
    ["SIDE A / WHAT WE EAT, DRINK AND USE", ["spirits", "foodbev", "qsr", "cpg", "drygoods", "beauty"]],
    ["SIDE B / WHAT WE WATCH, WEAR AND BUY", ["fashion", "music", "education", "arts", "auto", "retail"]]
  ];

  const inCity = (it) => state.city === "all" || (it.city || []).includes(state.city);
  const inV = (it) => !state.v || it.v === state.v;
  const match = (it) => inCity(it) && inV(it);
  const allItems = () => [].concat(E.hooks, E.charts, E.bsides, E.dropping, E.headphones, E.calendar, E.reel, E.motion.map((m) => Object.assign({ city: ["nat"] }, m)));
  const countFor = (v) => allItems().filter((it) => it.v === v && inCity(it)).length;

  function cover(v) {
    const c = COVERS[v];
    const lines = c.title.split("\n");
    const longest = Math.max(...lines.map((l) => l.length));
    const size = Math.min(19, 84 / (longest * 0.92));
    const lead = E.hooks.find((h) => h.v === v && inCity(h)) || E.hooks.find((h) => h.v === v);
    const n = countFor(v);
    let art = "", cls = `cover tone-${c.tone || "black"}`;
    if (c.style === "img") art = `<img class="cv-img" src="${esc(c.image)}" alt="" loading="lazy">`;
    if (c.style === "grooves") cls = "cover cv-grooves";
    if (c.style === "crop") art = `<span class="cv-num">${c.vol}</span>`;
    if (c.style === "quote") art = `<span class="cv-q">\u201C</span>`;
    if (c.style === "rings") art = `<span class="cv-target"></span><span class="cv-bull"></span>`;
    if (c.style === "split") { cls = "cover cv-split"; art = `<span class="cv-half"></span>`; }
    if (c.style === "grid") cls = `cover cv-grid${c.tone === "deep" ? " grid-deep" : ""}`;
    if (c.style === "dots") art = `<span class="cv-pts">${[[12, 70], [22, 56], [32, 62], [43, 40], [52, 48], [62, 30], [72, 36], [82, 16], [90, 22]].map(([x, y], i) => `<i style="left:${x}%;top:${y}%"${i === 7 ? ' class="hi"' : ""}></i>`).join("")}</span>`;
    if (c.style === "bars") art = `<span class="cv-eq">${[38, 62, 84, 55, 92, 70, 44, 78, 60, 30].map((h) => `<i style="height:${h}%"></i>`).join("")}</span>`;
    return `<div class="${cls}">
      ${art}
      <span class="cv-top"><span>V+H</span><span>VOL. ${c.vol}</span></span>
      <span class="cv-title" style="font-size:${size.toFixed(2)}cqw">${lines.map(esc).join("<br>")}</span>
      <span class="cv-foot"><span>${n} TRACK${n === 1 ? "" : "S"}</span><span>${state.city === "all" ? "" : esc(CITY_CODE[state.city])}</span></span>
      ${lead ? `<span class="cv-sticker">${esc(lead.stage.toUpperCase())}</span>` : ""}
    </div>`;
  }

  function renderBoard() {
    const max = Math.max(1, ...Object.keys(COVERS).map(countFor));
    $("#sides").innerHTML = SIDES.map(([label, vs]) => `<div class="side"><p class="kicker">${esc(label)}</p><div class="albums">${vs.map((v) => {
      const n = countFor(v);
      const lead = E.hooks.find((h) => h.v === v && inCity(h));
      const heat = Math.max(n ? 1 : 0, Math.round((n / max) * 4));
      const on = state.v === v, dim = (state.v && !on) || n === 0;
      return `<button type="button" class="album${on ? " on" : ""}${dim ? " dim" : ""}" data-v="${v}" aria-pressed="${on}" aria-label="${esc(E.verticals[v])}, ${n} items. ${on ? "Tuned in. Click to clear." : "Click to tune the page to this vertical."}">
        <div class="sleeve"><span class="disc" aria-hidden="true"></span>${cover(v)}</div>
        <div class="vt"><span>${esc(E.verticals[v].toUpperCase())}</span><span class="heat" title="${n} items" aria-hidden="true">${[1, 2, 3, 4].map((i) => `<i class="${i <= heat ? "f" : ""}" style="height:${4 + i * 3}px"></i>`).join("")}</span></div>
        <p class="am">${lead ? esc(lead.title) : n ? "Signals and dates only here." : "Nothing here in this edition."}</p>
      </button>`;
    }).join("")}</div></div>`).join("");
    $$("#sides .album").forEach((b) => b.addEventListener("click", () => tune(state.v === b.dataset.v ? null : b.dataset.v)));
  }

  function tune(v) {
    state.v = v;
    if (v) state.kitV = v;
    renderAll();
    if (v) {
      const t = $("#hooks");
      setTimeout(() => t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }), 220);
    }
  }

  /* ---------- controls ---------- */
  function renderControls() {
    const opts = [["all", "ALL"], ["nat", "NATIONAL"], ["det", "DETROIT 313"], ["tor", "TORONTO 416"], ["atl", "ATLANTA 404"]];
    $("#citySeg").innerHTML = opts.map(([k, l]) => `<button type="button" data-city="${k}" aria-pressed="${state.city === k}">${l}</button>`).join("");
    $$("#citySeg button").forEach((b) => b.addEventListener("click", () => { state.city = b.dataset.city; renderAll(true); }));
    $("#lensSeg").innerHTML = [["all", "ALL TEAMS"], ["strategy", "STRATEGY + INSIGHTS"], ["creative", "CREATIVE"], ["production", "PRODUCTION"]].map(([k, l]) => `<button type="button" data-lens="${k}" aria-pressed="${state.lens === k}">${l}</button>`).join("");
    $$("#lensSeg button").forEach((b) => b.addEventListener("click", () => { state.lens = b.dataset.lens; renderAll(true); }));
    const t = $("#tuned");
    if (state.v) {
      t.hidden = false;
      t.innerHTML = `<span class="mini" aria-hidden="true"></span><span>NOW SPINNING: ${esc(E.verticals[state.v].toUpperCase())}</span><button type="button" aria-label="Clear vertical">CLEAR</button>`;
      $("button", t).addEventListener("click", () => tune(null));
    } else { t.hidden = true; t.innerHTML = ""; }
    $$("#modeSeg button").forEach((b) => b.setAttribute("aria-pressed", String(state.mode === b.dataset.mode)));
    document.body.classList.toggle("quick", state.mode === "quick");
  }
  $$("#modeSeg button").forEach((b) => b.addEventListener("click", () => { state.mode = b.dataset.mode; renderAll(); }));


  /* ---------- what the filters changed ---------- */
  function scopeCounts() {
    const lensOK = (r) => state.lens === "all" || state.lens === "strategy" || r.disc.includes(state.lens);
    return {
      hooks: [E.hooks.filter(match).length, E.hooks.length, "hooks"],
      reel: [E.reel.filter(match).filter(lensOK).length, E.reel.length, "pieces"],
      motion: [E.motion.filter((m) => !state.v || m.v === state.v).length, E.motion.length, "moves"],
      charts: [E.charts.filter(match).length, E.charts.length, "trends"],
      bsides: [E.bsides.filter(match).length + E.dropping.filter(match).length, E.bsides.length + E.dropping.length, "signals"],
      headphones: [E.headphones.filter(match).length, E.headphones.length, "picks"],
      dates: [E.calendar.filter(match).length, E.calendar.length, "dates"]
    };
  }
  const TEAM_SECS = { hooks: "moves", reel: "work", kit: "lines" };
  function renderScope(changed) {
    const c = scopeCounts();
    const where = state.city === "all" ? "" : CITY_CODE[state.city];
    const team = state.lens === "all" ? "" : TEAM_NAME[state.lens];
    $$("section.sec[data-sec]").forEach((sec) => {
      const id = sec.dataset.sec;
      const head = $(".sec-head .kicker", sec);
      if (!head) return;
      let chip = $(".scope", sec);
      if (!chip) { chip = document.createElement("span"); chip.className = "scope"; head.after(chip); }
      const parts = [];
      if (c[id]) {
        const [n, tot, noun] = c[id];
        if (id === "motion" && where && state.city !== "nat") parts.push(`NATIONAL / APPLIES TO ${where}`);
        else if (id === "reel" && where && state.city !== "nat" && !n) parts.push(`NO ${where} WORK / SHOWING NATIONAL`);
        else if (where || state.v) parts.push(`${where ? where + " / " : ""}${n} OF ${tot} ${noun.toUpperCase()}`);
        else parts.push(`ALL ${tot} ${noun.toUpperCase()}`);
      }
      if (id === "kit" && where) parts.push("SAME IN EVERY CITY");
      if (team && TEAM_SECS[id]) parts.push(`${team.toUpperCase()} ${TEAM_SECS[id].toUpperCase()} ONLY`);
      chip.textContent = parts.join("  +  ");
      chip.hidden = !parts.length;
      chip.classList.toggle("on", !!(where || team || state.v));
      if (changed && chip.classList.contains("on")) { chip.classList.remove("pulse"); void chip.offsetWidth; chip.classList.add("pulse"); }
    });
    const r = $("#receipt");
    if (!where && !team && !state.v) {
      r.innerHTML = "";
      r.classList.remove("on");
    } else {
      const label = [where && CITY_NAME[state.city] === "national" ? "National" : where && CITY_NAME[state.city], state.v && vname(state.v), team].filter(Boolean).join(" + ");
      const NOUN = { hooks: ["hook", "hooks"], charts: ["chart trend", "chart trends"], headphones: ["listen", "listens"], dates: ["date", "dates"] };
      const line = ["hooks", "charts", "headphones", "dates"].map((k) => `${c[k][0]} ${NOUN[k][c[k][0] === 1 ? 0 : 1]}`).join(", ");
      r.innerHTML = `<p><b>Showing ${esc(label)}.</b> ${line}.${team ? ` Hooks now show only ${esc(team)} moves.` : ""}</p>`;
      r.classList.add("on");
    }
  }


  /* ---------- header menus ---------- */
  function setOpen(btn, open) {
    const p = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open)); p.hidden = !open;
  }
  $$(".dd-btn").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = b.getAttribute("aria-expanded") !== "true";
    $$(".dd-btn").forEach((o) => setOpen(o, false));
    setOpen(b, open);
  }));
  $$(".dd-panel").forEach((p) => p.addEventListener("click", (e) => e.stopPropagation()));
  document.addEventListener("click", () => $$(".dd-btn").forEach((o) => setOpen(o, false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".dd-btn").forEach((o) => setOpen(o, false)); });
  $$("#secPanel a").forEach((a) => a.addEventListener("click", () => setOpen($("#secBtn"), false)));
  $("#fpDone").addEventListener("click", () => setOpen($("#filtBtn"), false));
  $("#clearBtn").addEventListener("click", () => { state.city = "all"; state.lens = "all"; state.v = null; state.mode = "full"; renderAll(true); });
  function renderSummary() {
    const bits = [];
    if (state.city !== "all") bits.push(state.city === "nat" ? "NATIONAL" : CITY_NAME[state.city].toUpperCase());
    if (state.v) bits.push(vname(state.v).toUpperCase());
    if (state.lens !== "all") bits.push(TEAM_NAME[state.lens].toUpperCase());
    if (state.mode === "quick") bits.push("QUICK HIT");
    $("#filtNow").textContent = bits.length ? bits.join(" / ") : "ALL CITIES / ALL TEAMS";
    $("#secBtn .k-long").textContent = `JUMP TO / ${state.mode === "quick" ? $$("#secPanel a:not([data-deep])").length : 11} SECTIONS`;
    $("#filtBtn").classList.toggle("active", bits.length > 0);
    $("#clearBtn").hidden = !bits.length;
  }

  /* ---------- hero ---------- */
  function renderHero() {
    const d = d8(E.date);
    $("#edMeta").textContent = `EDITION ${pad(E.edition)} / ${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()} / 12 VERTICALS / 3 CITIES + NATIONAL`;
    const words = E.topline.line.replace(/\.$/, "").toUpperCase().split(" ");
    const last = words.pop();
    $("#toplineLine").innerHTML = `${esc(words.join(" "))} <em>${esc(last)}.</em>`;
    $("#toplineDek").textContent = E.topline.dek;
    $("#three").innerHTML = E.three.map((id, i) => {
      const h = E.hooks.find((x) => x.id === id);
      return `<li tabindex="0" data-id="${id}"><span class="n">${i + 1}</span><p class="meta">${esc(vname(h.v).toUpperCase())} / ${h.city.map((c) => CITY_CODE[c]).join(" + ")}</p><h3>${esc(h.title)}</h3></li>`;
    }).join("");
    $$("#three li").forEach((li) => {
      const go = () => { if (state.v && state.v !== E.hooks.find((h) => h.id === li.dataset.id).v) state.v = null; if (!inCity(E.hooks.find((h) => h.id === li.dataset.id))) state.city = "all"; renderAll(); const el = document.getElementById("h-" + li.dataset.id); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } };
      li.addEventListener("click", go);
      li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    const items = E.ticker.map((t) => `<span>${esc(t)}</span>`).join("");
    $("#ticker").innerHTML = items + items;
  }

  /* ---------- hooks ---------- */
  const srcs = (list) => `<div class="srcs">${list.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>${s.date ? ` <time datetime="${s.date}">${short(s.date)}</time>` : ""}`).join("")}</div>`;

  function movesHTML(h) {
    const keys = state.lens === "all" ? ["strategy", "data", "creative", "production"] : state.lens === "strategy" ? ["strategy", "data"] : [state.lens];
    return keys.filter((k) => h.moves[k]).map((k) => `<div class="mv mv-${k}"><dt>${LENS[k]}</dt><dd>${esc(h.moves[k])}</dd></div>`).join("");
  }
  function hookCard(h, i, lead) {
    const img = h.image && !h.image.includes("/photo/") ? `<div class="hook-img grain"><img src="${esc(h.image)}" alt=""${h.fit ? ` style="object-fit:${h.fit}"` : ""}><span class="credit">IMAGE: ${esc(h.credit.toUpperCase())}</span></div>` : `<div class="hook-img gen" aria-hidden="true"><span>${esc(vname(h.v).toUpperCase())}</span></div>`;
    return `<article class="hook${lead ? " lead" : ""}" id="h-${h.id}">
      ${img}
      <p class="hook-k"><span>${pad(i + 1)} / ${esc(vname(h.v))} / ${h.city.map((c) => CITY_CODE[c]).join(" + ")}</span></p>
      <p class="hook-stage"><span class="stage">${esc(h.stage.toUpperCase())} / ${esc(h.conf.toUpperCase())} CONFIDENCE</span></p>
      <h3>${esc(h.title)}</h3>
      <dl class="hook-dl">
        <div><dt>WHAT HAPPENED</dt><dd>${esc(h.what)}</dd></div>
        <div><dt>WHY IT MATTERS</dt><dd>${esc(h.sowhat)}</dd></div>
        ${h.counter ? `<div><dt>COUNTERPOINT</dt><dd class="counter">${esc(h.counter)}</dd></div>` : ""}
      </dl>
      <dl class="hook-moves">${movesHTML(h)}</dl>
      ${srcs(h.sources)}
    </article>`;
  }
  function renderHooks() {
    let list = E.hooks.filter(match);
    const order = (h) => { const i = E.three.indexOf(h.id); return i < 0 ? 9 : i; };
    list.sort((a, b) => order(a) - order(b));
    if (state.mode === "quick" && !state.v) { const t = list.filter((h) => E.three.includes(h.id)); list = t.length ? t : list.slice(0, 3); }
    if (!list.length) { $("#hookLead").innerHTML = ""; $("#hookGrid").innerHTML = `<p class="empty">No hooks for ${esc(state.v ? vname(state.v) : "this filter")} in ${esc(state.city === "all" ? "any city" : CITY_CODE[state.city])} yet. Try All, or check The Reel and Tour Dates below.</p>`; return; }
    const useLead = list.length >= 4;
    $("#hookLead").innerHTML = useLead ? hookCard(list[0], 0, true) : "";
    const rest = useLead ? list.slice(1) : list, off = useLead ? 1 : 0;
    const wideLast = rest.length > 3 && rest.length % 3 === 1;
    $("#hookGrid").innerHTML = rest.map((h, i) => hookCard(h, i + off, wideLast && i === rest.length - 1)).join("");
  }

  /* ---------- reel ---------- */
  function renderReel() {
    const lensOK = (r) => state.lens === "all" || state.lens === "strategy" || r.disc.includes(state.lens);
    let list = E.reel.filter(match).filter(lensOK);
    let reelNote = "";
    if (!list.length && state.city !== "all" && state.city !== "nat") {
      list = E.reel.filter(inV).filter((r) => (r.city || []).includes("nat")).filter(lensOK);
      if (list.length) reelNote = `<p class="reel-note">No ${esc(CITY_NAME[state.city])} work on the reel this edition, so here's the national work. All of it travels.</p>`;
    }
    if (state.mode === "quick") list = list.slice(0, 3);
    let n = 0;
    const card = (r) => `<a class="reel-card" href="${esc(r.url)}" target="_blank" rel="noopener">
      <div class="reel-art${r.image ? "" : " gen"}">${r.image ? `<img src="${esc(r.image)}" alt=""><span class="credit">IMAGE: ${esc(r.credit.toUpperCase())}</span>` : `<span class="reel-n">${pad(++n)}</span>`}<span class="reel-tags">${r.disc.map((d) => `<b>${LENS[d]}</b>`).join("")}</span></div>
      <p class="reel-k">${esc(r.brand.toUpperCase())} / ${esc(r.agency)}</p>
      <h3>${esc(r.title)}</h3>
      <p class="reel-what">${esc(r.what)}</p>
      <p class="reel-steal"><b>STEAL THIS</b>${esc(r.steal)}</p>
      <p class="reel-src">${esc(r.source)} <time datetime="${r.date}">${short(r.date)}</time></p>
    </a>`;
    const work = list.filter((r) => r.kind === "work"), shifts = list.filter((r) => r.kind !== "work");
    const group = (label, note, items) => items.length ? `<p class="reel-group"><b>${label}</b>${note}</p>${items.map(card).join("")}` : "";
    $("#reelGrid").innerHTML = list.length ? reelNote + group("THE WORK", "Campaigns and the people who made them", work) + group("THE SHIFTS", "Changes in platforms, production models and design with no single piece to show", shifts) : `<p class="empty">Nothing on the reel for this filter.</p>`;
  }

  /* ---------- in motion ---------- */
  function renderMotion() {
    const list = E.motion.filter((m) => !state.v || m.v === state.v);
    const local = state.city !== "all" && state.city !== "nat";
    const note = local && list.length ? `<li class="mo-note"><p>Nothing in this list is specific to ${esc(CITY_NAME[state.city])}. These are national moves, so they still count when you're pitching there.</p></li>` : "";
    $("#motionList").innerHTML = list.length ? note + list.map((m, i) => `<li><span class="mo-n">${pad(i + 1)}</span>
      <div class="mo-b"><h3>${esc(m.brand)}</h3><p class="mo-v">${esc(vname(m.v).toUpperCase())}</p></div>
      <p class="mo-what">${esc(m.what)}</p>
      <p class="mo-door"><b>THE DOOR</b>${esc(m.door)}</p>
      <p class="mo-src"><a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.source)}</a> <time datetime="${m.date}">${short(m.date)}</time></p></li>`).join("") : `<li class="mo-note"><p class="empty">No national moves for ${esc(vname(state.v))} this edition.</p></li>`;
  }

  /* ---------- charts ---------- */
  const STAGES = [
    ["NEW ENTRY", "Just showing up. One or two sources."],
    ["CLIMBING", "Proof is stacking up and momentum is real."],
    ["PEAK", "Everywhere. Hard to stand out now."],
    ["RECURRENT", "A format that keeps coming back."],
    ["DROPPING", "Losing steam. Lead with something else."]
  ];
  const stageOf = (s) => (s < 1 ? 0 : s < 2 ? 1 : s < 2.75 ? 2 : s < 3.5 ? 3 : 4);
  const MO = { 2: "\u2191\u2191 RISING FAST", 1: "\u2191 RISING", 0: "\u2192 HOLDING", "-1": "\u2193 SLIPPING", "-2": "\u2193\u2193 FALLING" };
  const CONF = { 1: "LOW", 2: "MEDIUM", 3: "HIGH" };
  function renderCharts() {
    const list = E.charts.filter(match);
    $("#chartCols").innerHTML = STAGES.map(([name, def], si) => {
      const col = list.filter((c) => stageOf(c.stage) === si).sort((a, b) => b.m - a.m);
      return `<div class="ccol"><h3><span>${name}</span> <b>${pad(col.length)}</b></h3><p class="def">${def}</p>
        ${col.length ? col.map((c, i) => `<button type="button" class="track" aria-expanded="false" data-id="${c.id}">
          <span class="pos">${i + 1}</span><span class="tn">${esc(c.name)}</span>
          <span class="tm"><span class="mo">${MO[c.m]}</span> / ${esc(vname(c.v))} / ${CONF[c.conf]} CONF.</span>
        </button>`).join("") : `<p class="empty">Nothing here.</p>`}
      </div>`;
    }).join("");
    $$("#chartCols .track").forEach((b) => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      const ex = b.querySelector(".track-more");
      if (ex) { ex.remove(); return; }
      const c = E.charts.find((x) => x.id === b.dataset.id);
      const d = document.createElement("span");
      d.className = "track-more";
      d.innerHTML = `<span><b>EVIDENCE</b>${esc(c.evidence)}</span><span><b>COUNTERPOINT</b>${esc(c.counter)}</span><span><b>THE MOVE</b>${esc(c.move)}</span><span><b>SOURCES</b>${c.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(" / ")}</span>`;
      d.addEventListener("click", (e) => e.stopPropagation());
      b.appendChild(d);
    }));
  }

  /* ---------- b-sides / dropping ---------- */
  function renderSides() {
    const b = E.bsides.filter(match), d = E.dropping.filter(match);
    $("#bsideList").innerHTML = b.length ? b.map((x) => `<div class="note"><p class="nk">${esc(vname(x.v).toUpperCase())} / ${x.city.map((c) => CITY_CODE[c]).join(" + ")}</p><h3>${esc(x.title)}</h3><p>${esc(x.why)}</p><p><b>WATCH FOR</b>${esc(x.watch)}</p>${srcs(x.sources)}</div>`).join("") : `<p class="empty">No early signals${inW()} this edition.</p>`;
    $("#dropList").innerHTML = d.length ? d.map((x) => `<div class="note drop"><p class="nk">${esc(vname(x.v).toUpperCase())} / ${x.city.map((c) => CITY_CODE[c]).join(" + ")}</p><h3>${esc(x.title)}</h3><p>${esc(x.evidence)}</p><p><b>COUNTERPOINT</b>${esc(x.counter)}</p><p><b>INSTEAD</b>${esc(x.instead)}</p>${srcs(x.sources)}</div>`).join("") : `<p class="empty">Nothing fading${inW()} this edition.</p>`;
  }

  /* ---------- headphones ---------- */
  const VERD = { listen: "LISTEN NOW", skim: "SKIM", save: "SAVE FOR LATER", skip: "SKIP" };
  function renderHeadphones() {
    const opts = [["all", "ALL"], ["listen", "LISTEN NOW"], ["skim", "SKIM"], ["save", "SAVE"], ["skip", "SKIP"]];
    $("#verdictSeg").innerHTML = opts.map(([k, l]) => `<button type="button" data-verdict="${k}" aria-pressed="${state.verdict === k}">${l}</button>`).join("");
    $$("#verdictSeg button").forEach((b) => b.addEventListener("click", () => { state.verdict = b.dataset.verdict; renderHeadphones(); }));
    const list = E.headphones.filter(match).filter((h) => state.verdict === "all" || h.verdict === state.verdict);
    $("#singles").innerHTML = list.length ? list.map((h) => `<a class="single v-${h.verdict}" href="${esc(h.url)}" target="_blank" rel="noopener">
      <span class="s45" style="--lab:${h.type === "Video" ? "#0C0C0B" : "#680000"}" aria-hidden="true"><span>${h.type === "Video" ? "VIDEO" : "AUDIO"}</span></span>
      <div><p class="sk"><span>${esc(h.type.toUpperCase())}</span><span>${esc(h.show)}</span><span>${short(h.date)}</span><span>${h.mins} MIN</span><span>${h.city.map((c) => CITY_CODE[c]).join(" + ")}</span></p>
      <h3>${esc(h.title)}</h3><p>${esc(h.why)}</p></div>
      <span class="verdict ${h.verdict}">${VERD[h.verdict]}</span>
    </a>`).join("") : `<p class="empty">Nothing to play${inW()} this edition.</p>`;
  }

  /* ---------- kit ---------- */
  function renderKit() {
    const vs = Object.keys(E.verticals);
    $("#kitTabs").innerHTML = vs.map((v) => `<button type="button" role="tab" data-v="${v}" aria-selected="${state.kitV === v}">${esc(E.verticals[v].toUpperCase())}</button>`).join("");
    $$("#kitTabs button").forEach((b) => b.addEventListener("click", () => { state.kitV = b.dataset.v; renderKit(); }));
    const k = E.kit[state.kitV];
    const cell = (key, label, body, cls) => `<div class="kc${state.lens !== "all" && key && state.lens !== key ? " off" : ""}${cls ? " " + cls : ""}"><p class="label">${label}</p><p>${esc(body)}</p></div>`;
    $("#kitBody").innerHTML = cell("strategy", "STRATEGY + INSIGHTS / POINT OF VIEW", k.pov, "pov-cell") + cell("creative", "CREATIVE / TERRITORY", k.creative) + cell("production", "PRODUCTION / IDEA", k.production) + cell(null, "OPEN THE ROOM WITH", k.opener) + cell("strategy", "INSIGHTS + DATA WE COULD SELL", k.research);
  }

  /* ---------- dates ---------- */
  function renderDates() {
    const list = E.calendar.filter(match);
    $("#dateList").innerHTML = list.length ? list.map((c) => {
      const d = d8(c.date);
      return `<li><span class="d">${short(c.date)}${c.end ? ` TO ${d8(c.end).getDate()}` : ""}<small>${DAYS[d.getDay()]}</small></span>
      <span class="t"><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title)}</a><span>${esc(c.note)}</span></span>
      <span class="v">${esc(vname(c.v))}</span><span class="c">${c.city.map((x) => CITY_CODE[x]).join(" + ")}</span></li>`;
    }).join("") : `<li><p class="empty">No dates${inW()} yet.</p></li>`;
  }

  /* ---------- liner notes ---------- */
  const LINER = [
    { h: "Strategy and insights", p: "Use the Board in Monday WIP and The Charts to place a category before a brief gets written. Every Hook names a number worth tracking, so data and analytics can set up a watch list and tell us when something moves.", who: "Strategy, insights, data and analytics" },
    { h: "Creative development", p: "The Reel is the reference wall for crits and concepting. Every Hook carries a creative move, and the Studio Kit has a territory for each vertical.", who: "Creative directors, writers, designers" },
    { h: "Production", p: "Track tools, platform changes, roster moves and AI rules in one place. Every Hook has a production move, and the Kit has a production idea for each vertical.", who: "Producers, post, content studio" },
    { h: "Client leads", p: "Send each client one Hook a month with a line on what it means for them. Use Tour Dates to plan around their calendar.", who: "Account and client services" },
    { h: "New business", p: "In Motion lists national brands with new CMOs, agencies or briefs. Pair one with a Hook and a Kit opener before a first conversation.", who: "Leadership, growth" },
    { h: "Onboarding", p: "New hires spend their first week on the Board to learn our verticals, how we talk about culture and how each team uses it.", who: "Everyone new" }
  ];
  function renderLiner() {
    $("#liner-grid").innerHTML = `<div class="ln wide principle"><span class="n">THE POSITION</span><h3>Local roots, national reach</h3>
        <p>Detroit, Toronto and Atlanta are where we prove the work, not where it stops. Detroit is close to tapped out, and growth now comes from national brands. So the page leads with national and treats our cities as proof.</p>
        <ul><li>Open with the national brand's problem, then show the local proof</li><li>Every Hook has to work outside the city it came from</li><li>Use the cities as case studies, not as the whole pitch</li><li>Watch In Motion every week for national doors opening</li></ul></div>` +
      LINER.map((l, i) => `<div class="ln"><span class="n">TRACK ${pad(i + 1)}</span><h3>${esc(l.h)}</h3><p>${esc(l.p)}</p><p class="who">FOR: ${esc(l.who)}</p></div>`).join("") + `
      <div class="ln"><span class="n">WORKS NOW</span><h3>What's real</h3><ul><li>One dated edition with every item sourced and linked</li><li>City, vertical and team filters across the whole page</li><li>Quick Hit and Full Set views</li><li>Free sources only: news, trade press, podcasts, YouTube, local outlets</li></ul></div>
      <div class="ln"><span class="n">NOT BUILT YET</span><h3>What's next</h3><ul><li>A daily or weekly refresh</li><li>Delivery to a Slack channel</li><li>Client watchlists and saved items</li><li>An owner for each vertical and each team</li><li>Live TikTok and Instagram data, which needs a paid connector</li></ul></div>
      <div class="ln"><span class="n">HOUSE RULES</span><h3>How we source</h3><ul><li>Every item has a date and a link</li><li>Every trend carries a counterpoint</li><li>Rumors are labeled as rumors</li><li>No numbers we can't source</li><li>No paywalled sources</li></ul></div>
      <div class="ln wide"><span class="n">FOR THE TEAM</span><h3>Questions to answer together</h3><ul>
        <li>Who owns which vertical, and who speaks for creative and production?</li><li>Which 20 national brands are we going after this year?</li><li>Daily, or weekly ahead of Monday WIP?</li><li>Where should it land: Slack, email or just this page?</li><li>Which trades, podcasts and channels does each team trust?</li><li>Who curates the edition and signs off on it?</li><li>Which clients get a watchlist first?</li><li>What would make this something we sell, and not just use ourselves?</li></ul>
        <p style="margin-top:16px">Suggested next step: a four-week pilot with a weekly edition, one owner each from strategy, creative and production, and one Slack channel. Then decide.</p></div>`;
  }

  /* ---------- nav ---------- */
  function navSpy() {
    const links = $$("#secPanel a");
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => { const on = a.dataset.nav === e.target.dataset.sec; a.classList.toggle("on", on); if (on) $("#secNow").textContent = a.textContent.trim(); }); } });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("[data-sec]").forEach((s) => io.observe(s));
  }

  function renderAll(changed) {
    renderControls(); renderBoard(); renderHooks(); renderReel(); renderMotion(); renderCharts(); renderSides(); renderHeadphones(); renderKit(); renderDates(); renderScope(changed); renderSummary();
  }
  renderHero(); renderLiner(); renderAll(); navSpy();
})();
