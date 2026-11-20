// The card: lays the drawings out on a 560 px wide stage, draws the flows
// under them, and scales the whole stage to the width it is given.

const IE_W = 560;
const IE_LEFT_X = 70;
const IE_RIGHT_X = 490;
const IE_HOUSE_X = 280;

let IE_DRAW = null;
function ieDrawings() {
  if (!IE_DRAW) {
    IE_DRAW = { bat: ieDrawBattery(), ev: ieDrawEv(), hp: ieDrawHeatPump(), wh: ieDrawWaterHeater(), meter: ieDrawMeter() };
    IE_DRAW.css = IE_DRAW.bat.css() + IE_DRAW.ev.css("var(--ie-ev, #2196f3)") + IE_DRAW.hp.css() + IE_DRAW.wh.css() + IE_DRAW.meter.css();
  }
  return IE_DRAW;
}

// Where everything goes, from what the config holds. Pure, so the tests can
// check that a node never lands on another.
function ieLayout(model, cfg) {
  const solarCfg = (cfg && cfg.solar) || {};
  const view = IE_SOLAR_VIEWS.includes(solarCfg.view) ? solarCfg.view : "panel";
  // A string given only by its power, or a solar total alone, still gets a
  // few panels drawn: they stand for it and carry no value of their own.
  let groups = model.strings.map((s) => ({ ...s, drawn: s.panels.length || 3, decorative: !s.panels.length }));
  if (!groups.length && model.hasSolar) groups = [{ name: "", index: 0, entity: "", panels: [], w: model.pv, drawn: 4, decorative: true }];

  const L = { view, groups: [], panels: [], width: IE_W };
  let solarBottom = 0;
  if (groups.length) {
    const G = groups.length;
    const N = groups.reduce((a, g) => a + g.drawn, 0);
    const gapP = 6, gapS = G > 1 ? 40 : 0;
    const pw = Math.max(12, Math.min(34, (500 - gapS * (G - 1) - gapP * (N - G)) / N));
    const ph = pw * 1.5;
    const total = N * pw + gapP * (N - G) + gapS * (G - 1);
    let x = (IE_W - total) / 2;
    const py = 40;
    L.pw = pw; L.ph = ph; L.py = py; L.bus = py + ph + 16;
    groups.forEach((g) => {
      const gw = g.drawn * pw + gapP * (g.drawn - 1);
      L.groups.push({ ...g, x, width: gw, cx: x + gw / 2 });
      x += gw + gapS;
    });
    solarBottom = view === "panel" ? L.bus : py + ph;
  }

  const showInverter = model.showInverter && L.groups.length > 0;
  let by;
  if (showInverter) {
    L.inv = { x: IE_HOUSE_X, y: solarBottom + 80 };
    by = L.inv.y + 36 + 46 + 99;
  } else if (L.groups.length) {
    by = solarBottom + 60 + 99;
  } else {
    by = 150;
  }
  L.house = { x: IE_HOUSE_X, by, top: by - 99, left: IE_HOUSE_X - 52, right: IE_HOUSE_X + 63 };

  // Left: the grid above, the battery below; alone, level with the house.
  L.grid = null; L.battery = null;
  if (model.hasGrid && model.hasBattery) {
    L.grid = { x: IE_LEFT_X, y: by - 100 };
    L.battery = { x: IE_LEFT_X, y: by + 110 };
  } else if (model.hasGrid) L.grid = { x: IE_LEFT_X, y: by - 50 };
  else if (model.hasBattery) L.battery = { x: IE_LEFT_X, y: by - 50 };

  // Right: the consumers in a column centred on the house, kept below the
  // panels.
  const n = model.consumers.length;
  const step = 172;
  const minY = (L.groups.length ? solarBottom : 0) + 74;
  let first = by - 50 - ((n - 1) * step) / 2;
  if (first < minY) first = minY;
  L.consumers = model.consumers.map((c, i) => ({ x: IE_RIGHT_X, y: first + i * step }));

  const bottoms = [by + 52];
  if (L.grid) bottoms.push(L.grid.y + 54 + 58);
  if (L.battery) bottoms.push(L.battery.y + 54 + 58);
  for (const c of L.consumers) bottoms.push(c.y + 54 + 58);
  L.height = Math.ceil(Math.max(...bottoms) + 6);
  return L;
}

class IllustratedEnergyFlowCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement(IE_EDITOR_TAG);
  }

  // A first config from what the instance holds: a grid, a solar total, a
  // battery, found by their names among the power sensors.
  static getStubConfig(hass) {
    const states = (hass && hass.states) || {};
    const power = Object.keys(states).filter((id) => id.startsWith("sensor.") && /^(W|kW)$/.test(String((states[id].attributes || {}).unit_of_measurement || "")));
    const pick = (re, list = power) => list.find((id) => re.test(id)) || "";
    const cfg = {};
    const grid = pick(/grid|reseau|linky|papp|net_power/);
    if (grid) cfg.grid = { power_entity: grid };
    const pv = pick(/solar|photovolt|(^|_)pv(_|$)|production/);
    if (pv) cfg.solar = { power_entity: pv };
    const bat = pick(/batter(y|ie).*(power|puissance)/);
    const soc = pick(/batter(y|ie).*(level|soc|charge)/, Object.keys(states).filter((id) => id.startsWith("sensor.") && (states[id].attributes || {}).unit_of_measurement === "%"));
    if (bat || soc) cfg.battery = { ...(bat ? { power_entity: bat } : {}), ...(soc ? { soc_entity: soc } : {}) };
    return cfg;
  }

  static computeModel(hass, cfg) { return ieModel(hass, cfg); }
  static computeLayout(model, cfg) { return ieLayout(model, cfg); }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = { ...IE_DEFAULTS, ...config };
    this._sig = null;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const sig = this._signature();
    if (sig !== this._sig) this._render();
  }

  getCardSize() {
    return Math.max(4, Math.ceil(((this._layoutH || 600) * (this._k || 1)) / 50));
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  connectedCallback() {
    if (typeof ResizeObserver !== "undefined" && !this._ro) {
      this._ro = new ResizeObserver(() => this._fit());
    }
    if (this._ro && this._wrap) this._ro.observe(this._wrap);
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
  }

  _signature() {
    const h = this._hass;
    const ids = ieWatched(this._config);
    return ieLang(h, this._config) + "|" + ids.map((id) => {
      const s = h && h.states && h.states[id];
      return s ? `${s.state}${(s.attributes || {}).unit_of_measurement || ""}` : "-";
    }).join("|");
  }

  _build() {
    const root = this.attachShadow({ mode: "open" });
    const D = ieDrawings();
    root.innerHTML = `<style>${IE_CSS}${D.css}</style><ha-card><div class="wrap"></div></ha-card>`;
    this._card = root.querySelector("ha-card");
    this._wrap = root.querySelector(".wrap");
    this._wrap.addEventListener("click", (ev) => {
      const el = ev.target && ev.target.closest ? ev.target.closest("[data-entity]") : null;
      if (!el || !this._config.clickable) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.getAttribute("data-entity") }, bubbles: true, composed: true }));
    });
    if (this._ro) this._ro.observe(this._wrap);
    this._built = true;
  }

  // Scale the stage to the width of the card, never past 130 %.
  _fit() {
    if (!this._wrap || !this._stage) return;
    const w = this._wrap.clientWidth || IE_W;
    const k = Math.max(0.4, Math.min(1.3, w / IE_W));
    this._k = k;
    this._stage.style.transform = `scale(${k})`;
    this._stage.style.marginLeft = `${Math.max(0, (w - IE_W * k) / 2)}px`;
    this._wrap.style.height = `${Math.ceil(this._layoutH * k) + 12}px`;
  }

  _render() {
    if (!this._built) this._build();
    const c = this._config;
    const hass = this._hass;
    this._sig = this._signature();
    const lang = ieLang(hass, c);
    const t = (k, v) => ieT(lang, k, v);
    const dec = Number.isFinite(+c.decimals) ? +c.decimals : 0;
    const fmt = (w) => ieFormat(w, dec, lang);
    const rated = Number(c.rated_power) > 0 ? Number(c.rated_power) : IE_DEFAULTS.rated_power;
    const peak = Number(c.panel_peak) > 0 ? Number(c.panel_peak) : IE_DEFAULTS.panel_peak;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = c.animate !== false && !reduce;
    const fo = { style: c.flow_style === "dashes" ? "dashes" : "arrows", animate };
    const dimOn = c.dim_inactive !== false;
    const hit = (id) => (id && c.clickable !== false ? ` class="hit" data-entity="${esc(id)}"` : "");

    if (c.title) this._card.setAttribute("header", c.title);
    else this._card.removeAttribute("header");

    const m = ieModel(hass, c);
    const L = ieLayout(m, c);
    this._layoutH = L.height;
    const D = ieDrawings();
    const lbl = (x, y, text, cls = "", anchor = "middle") => `<text class="ie-lbl ${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}">${esc(text)}</text>`;
    let svg = `<svg class="ie-flows" width="${IE_W}" height="${L.height}" viewBox="0 0 ${IE_W} ${L.height}">${IE_DEFS}`;

    /* ---- solar: panels, their drops, the strings into the inverter ---- */
    const invTop = L.inv ? L.inv.y - 30 : L.house.top - 4;
    const G = L.groups.length;
    L.groups.forEach((g, gi) => {
      const best = Math.max(0, ...g.panels.map((p) => p.w || 0));
      if (L.view !== "total" && (g.name || G > 1 || !g.decorative)) {
        const name = g.name || `${t("string")} ${gi + 1}`;
        svg += lbl(g.cx, L.py - 10, `${name} · ${fmt(g.w)}`);
      }
      for (let i = 0; i < g.drawn; i++) {
        const p = g.decorative ? null : g.panels[i];
        const px = g.x + i * (L.pw + 6);
        const pwatts = p ? p.w : (g.w !== null && g.drawn ? g.w / g.drawn : null);
        const ratio = pwatts === null ? 0 : pwatts / peak;
        const shade = p && best > 0 && p.w !== null && p.w < best * 0.6 ? 1 - p.w / best : 0;
        svg += `<g${p ? hit(p.entity) : ""}>${iePanel(px, L.py, L.pw, L.ph, ratio, shade, `${gi}-${i}`, animate)}`;
        if (p && L.view === "panel" && L.pw >= 22 && p.w !== null) {
          svg += `<text class="ie-pw" x="${f1(px + L.pw / 2)}" y="${f1(L.py + L.ph / 2 + 3.5)}" text-anchor="middle">${esc(Math.round(p.w))}</text>`;
        }
        if (p && p.name) svg += `<title>${esc(p.name)} · ${esc(fmt(p.w))}</title>`;
        svg += `</g>`;
        if (L.view === "panel" && p) svg += ieFlow(ieLine(px + L.pw / 2, L.py + L.ph + 2, px + L.pw / 2, L.bus), p.w, IE_COLORS.solar, peak, { ...fo, gap: 9 });
      }
      const fromY = L.view === "panel" && !g.decorative ? L.bus : L.py + L.ph + 3;
      if (L.view === "panel" && !g.decorative && g.drawn > 1) svg += `<path class="ie-bus" d="M${f1(g.x + L.pw / 2)} ${f1(L.bus)} H${f1(g.x + g.width - L.pw / 2)}"/>`;
      const mx = L.inv ? (G === 1 ? L.inv.x : L.inv.x - 18 + (36 * gi) / (G - 1)) : L.house.x;
      const spec = ieCubic(g.cx, fromY, g.cx, fromY + 40, mx, invTop - 40, mx, invTop - 4);
      svg += ieFlow(spec, g.w, IE_COLORS.solar, peak * Math.max(1, g.drawn), fo);
    });
    if (G && L.view === "total") svg += lbl(IE_HOUSE_X, L.py - 10, `${t("solar")} · ${fmt(m.pv)}`);

    if (L.inv) {
      const invOn = m.invOut !== null && m.invOut > 1;
      svg += ieFlow(ieLine(L.inv.x, L.inv.y + 36, L.inv.x, L.house.top - 6), m.invOut, IE_COLORS.solar, rated, fo);
      svg += lbl(L.inv.x + 10, L.inv.y + 36 + 26, fmt(m.invOut), "", "start");
      const invEntity = (c.inverter && c.inverter.power_entity) || (c.solar && c.solar.power_entity) || "";
      svg += `<g${hit(invEntity)}${dimOn && !invOn ? ' class="dim"' : ""}>${ieInverter(L.inv.x, L.inv.y, invOn, animate)}</g>`;
      svg += lbl(L.inv.x - 42, L.inv.y + 4, t("inverter"), "light", "end");
    }

    /* ---- grid, battery, consumers ---- */
    if (L.grid) {
      const a = { x: L.grid.x + 50, y: L.grid.y }, b = { x: L.house.left - 2, y: L.house.by - 40 };
      let spec = ieCubic(a.x, a.y, a.x + 70, a.y, b.x - 50, b.y, b.x, b.y);
      if (m.grid !== null && m.grid < 0) spec = ieReverse(spec);
      const color = m.grid !== null && m.grid < 0 ? IE_COLORS.export : IE_COLORS.import;
      svg += ieFlow(spec, m.grid, color, rated, fo);
      if (m.grid !== null && Math.abs(m.grid) >= 1) svg += lbl((a.x + b.x) / 2, (a.y + b.y) / 2 - 8, `${t(m.grid < 0 ? "export" : "import")} ${fmt(m.grid)}`);
    }
    if (L.battery) {
      const a = { x: L.battery.x + 50, y: L.battery.y }, b = { x: L.house.left - 2, y: L.house.by - 22 };
      let spec = ieCubic(b.x, b.y, b.x - 50, b.y, a.x + 70, a.y, a.x, a.y); // house -> battery: charging
      if (m.bat !== null && m.bat > 0) spec = ieReverse(spec);
      svg += ieFlow(spec, m.bat, m.bat !== null && m.bat > 0 ? IE_COLORS.discharge : IE_COLORS.charge, rated, fo);
      if (m.bat !== null && Math.abs(m.bat) >= 1) svg += lbl((a.x + b.x) / 2, (a.y + b.y) / 2 + 16, `${t(m.bat > 0 ? "discharging" : "charging")} ${fmt(m.bat)}`);
    }
    L.consumers.forEach((p, i) => {
      const cm = m.consumers[i];
      const n = L.consumers.length;
      const a = { x: L.house.right + 3, y: L.house.by - 30 + (n > 1 ? (i - (n - 1) / 2) * Math.min(9, 30 / (n - 1)) : 0) }, b = { x: p.x - 54, y: p.y };
      svg += ieFlow(ieCubic(a.x, a.y, a.x + 46, a.y, b.x - 46, b.y, b.x, b.y), cm.w, IE_COLORS.load, rated, fo);
    });

    /* ---- the house ---- */
    const homeEntity = (c.home && c.home.power_entity) || "";
    svg += `<g${hit(homeEntity)}>${ieHouse(L.house.x, L.house.by, m.home === null ? 0 : m.home / rated)}</g>`;
    svg += lbl(L.house.x, L.house.by + 22, (c.home && c.home.name) || t("home"), "nm");
    svg += lbl(L.house.x, L.house.by + 40, fmt(m.home), "big");
    svg += `</svg>`;

    /* ---- the nodes drawn by HA Appliance Card ---- */
    const node = (pos, html, name, value, sub, entity, inactive) =>
      `<div class="node${dimOn && inactive ? " dim" : ""}${entity && c.clickable !== false ? " hit" : ""}"${entity && c.clickable !== false ? ` data-entity="${esc(entity)}"` : ""} style="left:${f1(pos.x - 65)}px;top:${f1(pos.y - 54)}px">${html}<div class="nm">${esc(name)}</div><div class="vl">${esc(value)}</div>${sub ? `<div class="sb">${esc(sub)}</div>` : ""}</div>`;
    let nodes = "";
    if (L.grid) {
      const g = c.grid || {};
      const exp = m.grid !== null && m.grid < -1;
      const still = m.grid === null || Math.abs(m.grid) < 1;
      const kind = IE_METERS.includes(g.meter) ? g.meter : "box";
      const reading = m.grid === null ? "" : `${Math.round(Math.abs(m.grid))} ${kind === "linky" && !exp ? "VA" : "W"}`;
      const html = D.meter.draw("", { kind, lcd: reading, label: exp ? "SINJ" : "PAPP", exp, still, heavy: m.grid !== null && Math.abs(m.grid) > rated / 2, unav: m.grid === null });
      const sub = m.grid === null ? t("unavailable") : still ? "" : t(exp ? "export" : "import");
      nodes += node(L.grid, html, g.name || t("grid"), fmt(m.grid), sub, g.power_entity || g.import_entity || g.export_entity, still);
    }
    if (L.battery) {
      const b = c.battery || {};
      const mode = m.bat === null && m.soc === null ? "unav" : m.bat !== null && m.bat < -1 ? "charging" : m.bat !== null && m.bat > 1 ? "discharging" : m.soc !== null && m.soc >= 99 ? "full" : "idle";
      const reserve = Number.isFinite(+b.reserve) && b.reserve !== "" && b.reserve !== null ? +b.reserve : null;
      const html = D.bat.draw("", { battery: { layout: "wall", level: m.soc, reserve, mode, low: m.soc !== null && reserve !== null && m.soc <= reserve } });
      const state = mode === "charging" ? t("charging") : mode === "discharging" ? t("discharging") : mode === "unav" ? t("unavailable") : t("idle");
      const sub = m.soc !== null ? `${Math.round(m.soc)} % · ${state}` : state;
      nodes += node(L.battery, html, b.name || t("battery"), fmt(m.bat), sub, b.power_entity || b.soc_entity, mode === "idle" || mode === "full");
    }
    L.consumers.forEach((p, i) => {
      const cm = m.consumers[i];
      const on = cm.w !== null && cm.w > 5;
      let html;
      if (cm.type === "ev_charger") html = D.ev.draw("", { ev: { mode: on ? "charging" : "connected", plugged: true, flow: 0.5 } }).replace('class="machine', `style="--ie-ev:${on ? "#2196f3" : "#26a69a"}" class="machine`);
      else if (cm.type === "heat_pump") html = D.hp.draw("", { hpMode: on ? "space_heating" : "idle", noTank: true });
      else if (cm.type === "water_heater") html = D.wh.draw(on ? "heating" : "", { tankTemp: on ? 55 : 40 });
      else html = iePlugHtml(on);
      nodes += node(p, html, cm.name || t(cm.type), fmt(cm.w), cm.w === null ? t("unavailable") : "", cm.entity, !on);
    });

    this._wrap.innerHTML = `<div class="stage" style="width:${IE_W}px;height:${L.height}px">${svg}${nodes}</div>`;
    this._stage = this._wrap.querySelector(".stage");
    const flows = this._wrap.querySelector("svg.ie-flows");
    // Rebuilding the SVG restarts its animations: fast-forward to wall-clock
    // time so the arrowheads keep their place across updates.
    if (flows && typeof flows.setCurrentTime === "function") flows.setCurrentTime(3600 + (Date.now() % 3600000) / 1000);
    this._fit();
  }
}
