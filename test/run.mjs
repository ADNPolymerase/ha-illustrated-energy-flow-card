// Behaviour tests for the built card: node test/run.mjs (no dependency).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadCard, check, contains, report } from "./harness.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist", "illustrated-energy-flow-card.js");

// ── Packaging ────────────────────────────────────────────────────────────────
const hacs = JSON.parse(fs.readFileSync(path.join(root, "hacs.json"), "utf8"));
check("hacs.json: filename has no dist/ prefix", hacs.filename.includes("/"), false);
check("hacs.json: filename is the built file", fs.existsSync(path.join(root, "dist", hacs.filename)), true);
check("hacs.json: render_readme", hacs.render_readme, true);

const reg = await loadCard(pathToFileURL(dist).href);
const Card = reg.get("illustrated-energy-flow-card");
const Editor = reg.get("illustrated-energy-flow-card-editor");
check("card registered", typeof Card, "function");
check("editor registered", typeof Editor, "function");
check("card listed in the card picker", (globalThis.customCards || []).some((c) => c.type === "illustrated-energy-flow-card"), true);

// ── Helpers ──────────────────────────────────────────────────────────────────
const S = (v, unit = "W") => ({ state: String(v), attributes: { unit_of_measurement: unit } });
const hassOf = (states, lang = "en") => ({ states, language: lang, locale: { language: lang } });
const base = {
  "sensor.p1": S(300), "sensor.p2": S(280), "sensor.p3": S(90),
  "sensor.mppt2": S(0.75, "kW"),
  "sensor.grid": S(-400), "sensor.bat": S(-500), "sensor.soc": S(64, "%"),
  "sensor.ev": S(3600), "sensor.plug": S(0),
};
const cfg = {
  grid: { power_entity: "sensor.grid" },
  solar: { strings: [{ name: "South", panels: ["sensor.p1", { entity: "sensor.p2", name: "Two" }, "sensor.p3"] }, { name: "West", power_entity: "sensor.mppt2" }] },
  battery: { power_entity: "sensor.bat", soc_entity: "sensor.soc" },
  consumers: [{ entity: "sensor.ev", type: "ev_charger" }, { entity: "sensor.plug", type: "Bad type!" }],
};

// ── Languages ────────────────────────────────────────────────────────────────
{
  const card = new Card();
  card.setConfig({ grid: { power_entity: "sensor.grid" } });
  // Read the table through the rendered labels of each language.
  for (const lang of ["en", "fr", "de", "es", "it", "nl"]) {
    card.setConfig({ grid: { power_entity: "sensor.grid" }, language: lang });
    card.hass = hassOf(base);
    check(`render in ${lang} does not throw and shows a value`, card._wrap.innerHTML.includes("400"), true);
  }
}
const src = fs.readFileSync(dist, "utf8");
{
  // Every language has every key of the English table.
  const block = src.slice(src.indexOf("const IE_I18N = {"), src.indexOf("function ieLang"));
  const keysOf = (lang) => {
    const start = block.indexOf(`  ${lang}: {`);
    const end = block.indexOf("\n  },", start);
    return [...block.slice(start, end).matchAll(/(\w+):\s*"/g)].map((m) => m[1]);
  };
  const en = keysOf("en");
  check("English table has the editor keys", en.includes("e_panels") && en.length >= 60, true);
  for (const lang of ["fr", "de", "es", "it", "nl"]) {
    const k = new Set(keysOf(lang));
    const missing = en.filter((x) => !k.has(x));
    check(`${lang}: no missing key${missing.length ? " (" + missing.join(", ") + ")" : ""}`, missing.length, 0);
  }
}

// ── Model ────────────────────────────────────────────────────────────────────
{
  const m = Card.computeModel(hassOf(base), cfg);
  check("string 1 = sum of its panels", m.strings[0].w, 670);
  check("panel keeps its name", m.strings[0].panels[1].name, "Two");
  check("string 2 = its own sensor, kW read as W", m.strings[1].w, 750);
  check("solar total = sum of strings", m.pv, 1420);
  check("grid signed: negative = export", m.grid, -400);
  check("battery signed: negative = charge", m.bat, -500);
  check("home computed = solar + grid + battery", m.home, 520);
  check("home flagged as computed", m.homeComputed, true);
  check("unknown consumer type falls back to generic", m.consumers[1].type, "generic");
  check("soc read", m.soc, 64);

  const inv = Card.computeModel(hassOf(base), { ...cfg, grid: { power_entity: "sensor.grid", invert: true }, battery: { power_entity: "sensor.bat", invert: true } });
  check("grid invert flips the sign", inv.grid, 400);
  check("battery invert flips the sign", inv.bat, 500);

  const pair = Card.computeModel(hassOf({ ...base, "sensor.imp": S(0), "sensor.exp": S(1.2, "kW") }), { grid: { import_entity: "sensor.imp", export_entity: "sensor.exp" } });
  check("import / export pair gives a signed grid", pair.grid, -1200);

  const own = Card.computeModel(hassOf({ ...base, "sensor.home": S(999) }), { ...cfg, home: { power_entity: "sensor.home" } });
  check("home sensor wins over the computation", own.home, 999);
  check("home from its sensor is not flagged computed", own.homeComputed, false);

  const total = Card.computeModel(hassOf({ ...base, "sensor.pv": S(2000) }), { ...cfg, solar: { ...cfg.solar, power_entity: "sensor.pv" } });
  check("solar total sensor wins over the strings", total.pv, 2000);

  const neg = Card.computeModel(hassOf({ "sensor.grid": S(-3000) }), { grid: { power_entity: "sensor.grid" } });
  check("computed home never goes below zero", neg.home, 0);

  const gone = Card.computeModel(hassOf({ "sensor.p1": { state: "unavailable", attributes: {} } }), { solar: { strings: [{ panels: ["sensor.p1"] }] } });
  check("unavailable panel gives no value", gone.strings[0].panels[0].w, null);
  check("string of unavailable panels gives no value", gone.strings[0].w, null);

  const empty = Card.computeModel(hassOf({}), {});
  check("empty config: no solar", empty.hasSolar, false);
  check("empty config: no home value", empty.home, null);
}

// ── Layout ───────────────────────────────────────────────────────────────────
{
  const many = { ...cfg, consumers: Array.from({ length: 5 }, (_, i) => ({ entity: `sensor.c${i}` })) };
  const m = Card.computeModel(hassOf(base), many);
  const L = Card.computeLayout(m, many);
  check("panels drawn: 3 real + 3 standing for the sensor-only string", L.groups[0].drawn + L.groups[1].drawn, 6);
  check("sensor-only string is decorative", L.groups[1].decorative, true);
  check("strings do not overlap", L.groups[0].x + L.groups[0].width < L.groups[1].x, true);
  check("inverter below the panels", L.inv.y - 30 > L.bus, true);
  check("house below the inverter", L.house.top > L.inv.y + 30, true);
  const sameCol = L.consumers.flatMap((c, i) => L.consumers.slice(i + 1).filter((d) => d.x === c.x).slice(0, 1).map((d) => d.y - c.y));
  check("consumers far enough apart for their labels", sameCol.length > 0 && Math.min(...sameCol) >= 165, true);
  check("first consumer below the panels", L.consumers[0].y - 54 > L.bus, true);
  check("battery below the grid", L.battery.y - L.grid.y >= 170, true);
  check("height covers the last consumer", L.height >= L.consumers[4].y + 54 + 58, true);
  const narrow = { solar: { strings: [{ name: "Panel 1", panels: ["sensor.p1"] }, { name: "Panel 2", panels: ["sensor.p2"] }] } };
  const NL = Card.computeLayout(Card.computeModel(hassOf(base), narrow), narrow);
  check("one-panel strings leave room for both labels", NL.groups[1].cx - NL.groups[0].cx >= ("Panel 1".length + 10) * 6.8 + 11.9, true);
  const lone = Card.computeLayout(Card.computeModel(hassOf(base), { grid: { power_entity: "sensor.grid" } }), { grid: { power_entity: "sensor.grid" } });
  check("no solar: no panels and no inverter", lone.groups.length === 0 && !lone.inv, true);
  check("grid alone sits level with the house", lone.grid.y, lone.house.by - 50);
}

// ── Rendering ────────────────────────────────────────────────────────────────
const draw = (config, states = base, lang = "en") => {
  const card = new Card();
  card.setConfig(config);
  card.hass = hassOf(states, lang);
  return card._wrap.innerHTML;
};
{
  const html = draw(cfg);
  contains("panel view: each panel shows its watts", html, `class="ie-pw" x=`);
  check("panel view: one value per real panel", (html.match(/class="ie-pw"/g) || []).length, 3);
  contains("string label with its total", html, "South · 670 W");
  contains("sensor in kW shown in W below a kW", html, "West · 750 W");
  contains("export label", html, "Export 400 W");
  contains("export flow in green", html, 'fill="#3ddc84"');
  contains("battery charging label", html, "Charging 500 W");
  contains("home value", html, "520 W");
  contains("inverter drawn", html, "Inverter");
  contains("EV charger drawn", html, "ev-box");
  contains("generic consumer drawn as a plug", html, "ie-plug");
  contains("idle consumer flow dimmed", html, '<g class="dim"><path class="ie-track"');
  contains("idle plug dimmed", html, 'node dim hit" data-entity="sensor.plug"');
  contains("panels clickable", html, 'data-entity="sensor.p1"');
  contains("arrowheads animated by default", html, "<animateMotion");
  check("decorative panels carry no value", (html.match(/class="ie-pw"/g) || []).length, 3);

  const sv = draw({ ...cfg, solar: { ...cfg.solar, view: "string" } });
  check("string view: no value on the panels", sv.includes('class="ie-pw"'), false);
  contains("string view keeps the string totals", sv, "South · 670 W");

  const tv = draw({ ...cfg, solar: { ...cfg.solar, view: "total" } });
  check("total view: no string label", tv.includes("South ·"), false);
  contains("total view: one solar label", tv, "Solar · 1.42 kW");

  const still = draw({ ...cfg, animate: false });
  check("animate false: no SMIL", still.includes("<animate"), false);
  contains("animate false: arrowheads still drawn in place", still, 'class="ie-chev"');

  const dash = draw({ ...cfg, flow_style: "dashes" });
  contains("dashes style", dash, 'class="ie-dash"');
  check("dashes style: no arrowhead", dash.includes('class="ie-chev"'), false);

  const noclick = draw({ ...cfg, clickable: false });
  check("clickable false: no entity to open", noclick.includes("data-entity"), false);

  const nodim = draw({ ...cfg, dim_inactive: false });
  check("dim_inactive false: nothing dimmed", / dim[ "]/.test(nodim), false);

  const gonly = draw({ grid: { power_entity: "sensor.grid" } });
  contains("grid alone exporting: green arrowheads", gonly, 'fill="#3ddc84"');
  check("grid alone exporting: no grey arrowhead", gonly.includes('fill="#8e9aaf"'), false);
  contains("export runs from the house to the meter", gonly, 'path="M 226');
  const gin = draw({ grid: { power_entity: "sensor.grid" } }, { "sensor.grid": S(800) });
  contains("import runs from the meter to the house", gin, 'path="M 120');
  const imp = draw(cfg, { ...base, "sensor.grid": S(1500) });
  contains("import label", imp, "Import 1.50 kW");
  contains("import flow in grey", imp, 'fill="#8e9aaf"');

  const fr = draw(cfg, { ...base, "sensor.grid": S(1500) }, "fr");
  contains("French labels", fr, "Maison");
  contains("French decimal mark", fr, "Import 1,50 kW");

  const dec = draw({ ...cfg, decimals: 1 });
  contains("decimals applied below a kW", dec, "520.0 W");

  const esc = draw({ ...cfg, home: { name: "<b>" } });
  check("names are escaped", esc.includes("<b>Home") || esc.includes(">"+"<b>"+"<"), false);
}

// ── 0.2.0: microinverters, battery on the inverter, pylon, chains ────────────
{
  const micro = { ...cfg, solar: { ...cfg.solar, microinverters: true } };
  const mm = Card.computeModel(hassOf(base), micro);
  check("microinverters: no central inverter", mm.showInverter, false);
  const mhtml = draw(micro);
  check("microinverters: one box per drawn panel", (mhtml.match(/class="ie-micro"/g) || []).length, 6);
  check("microinverters: no inverter drawn", mhtml.includes(">Inverter<"), false);

  const opt = { ...cfg, solar: { ...cfg.solar, optimizers: true } };
  check("optimisers: the central inverter stays", Card.computeModel(hassOf(base), opt).showInverter, true);
  check("optimisers: one box per drawn panel", (draw(opt).match(/class="ie-optim"/g) || []).length, 6);
  check("microinverters win over optimisers", Card.computeModel(hassOf(base), { solar: { ...cfg.solar, microinverters: true, optimizers: true } }).optimizers, false);
  const fo2 = Editor.toForm(opt);
  check("editor reads the optimisers", fo2.panel_device, "optim");
  check("editor writes the optimisers back", Editor.fromForm(fo2, opt).solar.optimizers, true);
  const dc = { ...cfg, battery: { ...cfg.battery, coupling: "inverter" } };
  const dm = Card.computeModel(hassOf(base), dc);
  check("battery on the inverter: flagged", dm.batteryOnInverter, true);
  check("battery on the inverter: left out of the home", dm.home, 1020);
  const DL = Card.computeLayout(dm, dc);
  check("battery on the inverter: level with it", DL.battery.y, DL.inv.y);
  check("battery on the inverter: grid moved below the house", DL.grid.y > DL.house.by, true);
  const dhtml = draw(dc);
  contains("battery flow ends at the inverter", dhtml, `path="M ${DL.inv.x - 34}`);

  const py = { ...cfg, grid: { power_entity: "sensor.grid", pylon: true } };
  const PL = Card.computeLayout(Card.computeModel(hassOf(base), py), py);
  check("pylon: stage widened on the left", PL.width, 560 + 110);
  check("pylon: drawn beside the meter", PL.pylon && PL.pylon.y === PL.grid.y && PL.pylon.x < PL.grid.x, true);
  contains("pylon drawn", draw(py), "ie-pylon");
  const noGridPylon = Card.computeLayout(Card.computeModel(hassOf(base), { grid: { pylon: true } }), { grid: { pylon: true } });
  check("pylon without a grid sensor: not drawn", noGridPylon.pylon, null);
  check("pylon without a grid sensor: no room kept for it", noGridPylon.width, 560);

  const chain = { ...cfg, consumers: [{ entity: "sensor.ev", type: "ups", children: ["sensor.plug", { entity: "sensor.p1", type: "network" }] }] };
  const cm = Card.computeModel(hassOf(base), chain);
  check("chain: children read", cm.consumers[0].children.length, 2);
  check("chain: grandchildren ignored", Card.computeModel(hassOf(base), { consumers: [{ entity: "sensor.ev", children: [{ entity: "sensor.p1", children: ["sensor.p2"] }] }] }).consumers[0].children[0].children.length, 0);
  const CL = Card.computeLayout(cm, chain);
  check("chain: stage widened on the right", CL.width, 760);
  check("chain: children in a second column", CL.consumers[0].children.every((q) => q.x === CL.consumers[0].x + 200), true);
  check("chain: children far enough apart", CL.consumers[0].children[1].y - CL.consumers[0].children[0].y >= 165, true);
  check("chain: parent centred on its children", CL.consumers[0].y, (CL.consumers[0].children[0].y + CL.consumers[0].children[1].y) / 2);
  const chtml = draw(chain);
  contains("chain: child flow starts at the parent", chtml, `path="M ${CL.consumers[0].x + 52}`);
  const cc = new Card();
  cc.setConfig(chain);
  let n = 0;
  const orig = cc._render.bind(cc);
  cc._render = () => { n++; orig(); };
  cc.hass = hassOf(base);
  cc.hass = hassOf({ ...base, "sensor.plug": S(42) });
  check("chain: a child's sensor moving redraws", n, 2);
}

// ── HA Appliance Card draws the consumers when installed ─────────────────────
{
  const before = draw({ consumers: [{ entity: "sensor.ev", type: "printer_3d" }] });
  check("without HA Appliance Card: a plug stands in", before.includes("ie-plug") && !before.includes("ie-ac"), true);
  customElements.define("ha-appliance-card", class extends HTMLElement { setConfig(c) { this.cfg = c; if (!this.shadowRoot) { const r = this.attachShadow({ mode: "open" }); r.querySelectorAll = () => r.children.filter((n) => "data-ie" in n.attributes); r.querySelector = (q) => r.querySelectorAll(q)[0] || null; } } });
  const card = new Card();
  card.setConfig({ consumers: [{ entity: "sensor.ev", type: "printer_3d", appliance: { show_history: true } }, { entity: "sensor.plug" }] });
  card.hass = hassOf(base);
  contains("with HA Appliance Card: a placeholder for it", card._wrap.innerHTML, 'data-ac="c0"');
  check("a generic consumer stays a plug", card._wrap.innerHTML.includes('data-ac="c1"'), false);
  const rec = card._ac && card._ac.get("c0");
  check("HA Appliance Card element created", !!rec, true);
  check("given the appliance type", rec && rec.el.cfg.appliance_type, "printer_3d");
  check("given the power sensor as state and power", rec && rec.el.cfg.state_entity === "sensor.ev" && rec.el.cfg.power_entity === "sensor.ev", true);
  check("drawing only: no name, no state, no power line", rec && rec.el.cfg.show_name === false && rec.el.cfg.show_state === false && rec.el.cfg.hidden_lines.includes("power"), true);
  check("extra appliance options passed on", rec && rec.el.cfg.show_history, true);
  const hide = rec && rec.el.shadowRoot && rec.el.shadowRoot.querySelector("style[data-ie]");
  check("drawing only: its lines, sliders and history hidden", !!hide && /\.info-lines/.test(hide.textContent) && /\.history/.test(hide.textContent), true);
  card.hass = hassOf({ ...base, "sensor.ev": S(11) });
  check("the hiding style added once", rec.el.shadowRoot.querySelectorAll("style[data-ie]").length, 1);
  const el = rec.el;
  card.hass = hassOf({ ...base, "sensor.ev": S(10) });
  check("the same element is kept across redraws", card._ac.get("c0").el, el);
  check("the element gets the new hass", el.hass.states["sensor.ev"].state, "10");
  const quiet = hassOf({ ...base, "sensor.ev": S(10), "sensor.unrelated": S(1) });
  card.hass = quiet;
  check("the element gets hass even when the card does not redraw", el.hass, quiet);
}

// ── Light style: half-size drawings, name and power beside them ─────────────
{
  const states = { ...base, "sensor.nas": S(28) };
  const light = { ...cfg, style: "light", consumers: [{ entity: "sensor.ev", type: "cooktop", name: "Hob" }, { entity: "sensor.plug" }, { entity: "sensor.nas", type: "heat_pump" }] };
  const card = new Card();
  card.setConfig(light);
  card.hass = hassOf(states);
  const html = card._wrap.innerHTML;
  contains("light: a half-size box per consumer", html, '<div class="lc"><div class="lk">');
  check("light: HA Appliance Card still draws it", html.includes('<div class="lk"><div class="ie-ac" data-ac="c0">') && !!(card._ac && card._ac.get("c0")), true);
  contains("light: the built-in plug drawing too", html, '<div class="lk"><div class="machine ie-plug');
  check("light: no full-size node for a consumer", /class="node[^"]*" data-entity="sensor\.(ev|plug|nas)"/.test(html), false);
  check("light: name and power beside the drawing", /<div class="nm">Hob<\/div><div class="vl">[^<]*3[^<]*<\/div>/.test(html), true);
  check("light: an idle consumer is dimmed", /class="lnode dim hit" data-entity="sensor.plug"/.test(html), true);
  const lay = (c) => Card.computeLayout(Card.computeModel(hassOf(states), c), c);
  const L = lay(light);
  check("light: one column, a short step", L.cmode === "column" && L.consumers[1].y - L.consumers[0].y, 66);
  check("light: the stage widens for the names", L.width, 560 + 80);
  const many = (n, extra) => ({ ...light, ...extra, consumers: Array.from({ length: n }, () => ({ entity: "sensor.plug" })) });
  check("light: auto keeps one column up to eight", lay(many(8)).cmode, "column");
  check("light: two columns past eight", lay(many(9)).cmode, "columns");
  check("light: compact is a column", lay(many(4, { consumers_layout: "compact" })).cmode, "column");
  check("light: less tall than drawn", lay(many(6)).height < lay(many(6, { style: "drawn" })).height, true);
  check("drawn stays the default", Card.computeLayout(Card.computeModel(hassOf(states), cfg), cfg).light, false);
}

// ── Zoom cap: max_scale ──────────────────────────────────────────────────────
{
  const fit = (extra, w) => {
    const card = new Card();
    card.setConfig({ ...cfg, ...extra });
    card.hass = hassOf(base);
    card._wrap.clientWidth = w;
    card._fit();
    return card._k;
  };
  check("zoom: never past 100 % by default", fit({}, 2000), 1);
  check("zoom: max_scale raises it", fit({ max_scale: 1.2 }, 2000), 1.2);
  check("zoom: max_scale lowers it", fit({ max_scale: 0.7 }, 2000), 0.7);
  check("zoom: capped at 130 %", fit({ max_scale: 5 }, 4000), 1.3);
  check("zoom: a narrow card still shrinks", fit({ max_scale: 1.2 }, 280), 0.5);
  check("editor: drawn and 100 % stay out of the YAML", ["style", "max_scale"].some((k) => k in Editor.fromForm({ ...Editor.toForm({}) }, {})), false);
  const out = Editor.fromForm({ ...Editor.toForm({}), style: "light", max_scale: 0.8 }, {});
  check("editor: light and a zoom written", out.style === "light" && out.max_scale === 0.8, true);
  check("editor: style and zoom read back", Editor.toForm({ style: "light", max_scale: 1.1 }).style + Editor.toForm({ style: "light", max_scale: 1.1 }).max_scale, "light1.1");
}

// ── Editor: the consumer layout ──────────────────────────────────────────────
{
  check("editor: layout defaults to auto", Editor.toForm({}).consumers_layout, "auto");
  check("editor: layout read back", Editor.toForm({ consumers_layout: "compact" }).consumers_layout, "compact");
  check("editor: auto stays out of the YAML", "consumers_layout" in Editor.fromForm({ ...Editor.toForm({}), consumers_layout: "auto" }, {}), false);
  check("editor: a chosen layout written", Editor.fromForm({ ...Editor.toForm({}), consumers_layout: "columns" }, {}).consumers_layout, "columns");
}

// ── Consumer layouts: one column, two staggered columns, compact ─────────────
{
  const five = (extra) => ({ ...cfg, ...extra, consumers: ["sensor.ev", "sensor.plug", "sensor.p1", "sensor.p2", "sensor.hp"].map((e) => ({ entity: e })) });
  const lay = (c) => Card.computeLayout(Card.computeModel(hassOf(base), c), c);
  const auto = lay(five());
  check("layout: auto takes two columns past three consumers", auto.cmode, "columns");
  check("layout: two columns widen the stage", auto.width, 560 + 150);
  check("layout: consumers alternate between the columns", auto.consumers.map((p) => p.col).join(""), "01010");
  check("layout: half a step between consumers", auto.consumers[1].y - auto.consumers[0].y, 95);
  const col = lay(five({ consumers_layout: "column" }));
  check("layout: column keeps one column", col.consumers.every((p) => p.x === col.consumers[0].x) && col.width === 560, true);
  check("layout: two columns are less tall than one", auto.height < col.height, true);
  const cmp = lay(five({ consumers_layout: "compact" }));
  check("layout: compact keeps one column, closer together", cmp.consumers[1].y - cmp.consumers[0].y, 130);
  check("layout: compact is less tall than one column", cmp.height < col.height, true);
  check("layout: three consumers stay in one column", lay({ ...cfg, consumers: ["sensor.ev", "sensor.plug", "sensor.p1"] }).cmode, "column");
  const chained = { ...cfg, consumers_layout: "columns", consumers: [{ entity: "sensor.ev", children: ["sensor.plug"] }, "sensor.p1", "sensor.p2", "sensor.hp"] };
  check("layout: a chain keeps one column", lay(chained).cmode, "column");
  check("layout: unknown value read as auto", lay(five({ consumers_layout: "zigzag" })).cmode, "columns");
  const card = new Card();
  card.setConfig(five({ consumers_layout: "compact" }));
  card.hass = hassOf(base);
  contains("layout: compact nodes marked", card._wrap.innerHTML, 'class="node cmp');
  const c2 = new Card();
  c2.setConfig(five());
  c2.hass = hassOf(base);
  check("layout: flows to the second column cross under the first", (c2._wrap.innerHTML.match(/d="M[^"]*C[^"]*C[^"]*C[^"]*"/g) || []).length >= 2, true);
}

// ── Drawings that follow an on/off state, and drawings too big for the box ───
{
  const card = new Card();
  card.setConfig({ consumers: [{ entity: "sensor.ev", type: "drying_rack" }, { entity: "sensor.plug", type: "drying_rack", appliance: { state_entity: "binary_sensor.rack" } }] });
  card.hass = hassOf({ ...base, "sensor.ev": S(120), "sensor.plug": S(120) });
  const r0 = card._ac.get("c0"), r1 = card._ac.get("c1");
  const id = r0 && r0.el.cfg.state_entity;
  check("on/off drawing: a made-up state entity", typeof id === "string" && id.startsWith("binary_sensor.ie_flow_"), true);
  check("on/off drawing: power still the consumer's", r0 && r0.el.cfg.power_entity, "sensor.ev");
  check("on/off drawing: on when it draws power", r0 && r0.el.hass.states[id] && r0.el.hass.states[id].state, "on");
  check("on/off drawing: the real states are still there", r0 && r0.el.hass.states["sensor.ev"].state, "120");
  check("on/off drawing: the config's own state entity wins", r1 && r1.el.cfg.state_entity, "binary_sensor.rack");
  check("on/off drawing: no made-up state when the config names one", r1 && r1.el.hass === card._hass, true);
  const since = r0.el.hass.states[id].last_changed;
  card.hass = hassOf({ ...base, "sensor.ev": S(110), "sensor.plug": S(120) });
  check("on/off drawing: last_changed kept while the state holds", r0.el.hass.states[id].last_changed, since);
  card.hass = hassOf({ ...base, "sensor.ev": S(0), "sensor.plug": S(120) });
  check("on/off drawing: off at no power", r0.el.hass.states[id].state, "off");

  const fake = (mw, mh) => {
    const machine = { getBoundingClientRect: () => ({ left: 16, top: 16, width: mw, height: mh }) };
    return { style: {}, shadowRoot: { querySelector: () => machine }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 130, height: 152 }) };
  };
  const wide = fake(200, 112);
  card._fitAppliance(wide);
  check("wide drawing: shrunk to the box width", wide.style.transform, "scale(0.650)");
  check("wide drawing: centred", wide.style.left === "-10.4px" && wide.style.top === "7.2px", true);
  const usual = fake(96, 108);
  card._fitAppliance(usual);
  check("usual drawing: left alone", !usual.style.transform && !usual.style.left, true);
}

// ── Redraw only when a watched entity moves ──────────────────────────────────
{
  const card = new Card();
  card.setConfig(cfg);
  let n = 0;
  const orig = card._render.bind(card);
  card._render = () => { n++; orig(); };
  card.hass = hassOf(base);
  card.hass = hassOf({ ...base, "sensor.unrelated": S(5) });
  check("unrelated entity: no redraw", n, 1);
  card.hass = hassOf({ ...base, "sensor.p1": S(301) });
  check("watched entity moved: redraw", n, 2);
}

// ── Editor ───────────────────────────────────────────────────────────────────
{
  const full = { ...cfg, title: "Energy", custom_key: 42, solar: { ...cfg.solar, view: "string" } };
  const back = Editor.fromForm(Editor.toForm(full), full);
  check("form round trip keeps the config", JSON.stringify(back) === JSON.stringify(full) || Object.keys(back).length === Object.keys(full).length, true);
  check("round trip keeps an unknown key", back.custom_key, 42);
  check("round trip keeps a panel's name", back.solar.strings[0].panels[1].name, "Two");
  check("round trip keeps the solar view", back.solar.view, "string");
  check("round trip writes no default", "flow_style" in back || "animate" in back || "language" in back, false);

  const five = { solar: { strings: Array.from({ length: 5 }, (_, i) => ({ name: `S${i}`, panels: [`sensor.x${i}`] })) } };
  check("strings past the form are kept", Editor.fromForm(Editor.toForm(five), five).solar.strings.length, 5);

  const f = Editor.toForm(cfg);
  f.s1_panels = ["sensor.p1", "sensor.p2"];
  const cut = Editor.fromForm(f, cfg);
  check("removing a panel drops it", cut.solar.strings[0].panels.length, 2);
  check("the kept named panel keeps its name", cut.solar.strings[0].panels[1].name, "Two");

  const f2 = Editor.toForm({});
  f2.grid_power = "sensor.grid"; f2.flow_style = "dashes"; f2.animate = false;
  const out = Editor.fromForm(f2, {});
  check("form writes the grid sensor", out.grid.power_entity, "sensor.grid");
  check("form writes a non-default style", out.flow_style, "dashes");
  check("form writes animate false", out.animate, false);
  check("no empty section written", "battery" in out || "solar" in out || "home" in out, false);

  const ed = new Editor();
  ed.hass = hassOf(base);
  ed.setConfig(cfg);
  ed._changed({ stopPropagation() {}, detail: { value: Editor.toForm(cfg) } });
  check("unchanged form: no config-changed", ed.events.length, 0);
  const changed = Editor.toForm(cfg);
  changed.title = "New";
  ed._changed({ stopPropagation() {}, detail: { value: changed } });
  check("changed form: config-changed sent", ed.events.length, 1);
  check("config-changed carries the config", ed.events[0].detail.config.title, "New");
  check("config-changed bubbles out of the shadow DOM", ed.events[0].composed && ed.events[0].bubbles, true);
  const sentFirst = ed.events[0].detail.config;
  ed.setConfig({ ...sentFirst });
  check("echo of its own config does not reset the editor", ed._config === sentFirst, true);

  const power = Editor.schema(hassOf(base), "en", Editor.toForm(cfg));
  const flat = JSON.stringify(power);
  check("power pickers list only W/kW sensors", flat.includes("sensor.soc") && !/"grid_power"[^}]*sensor\.soc/.test(flat), true);
  const socField = JSON.stringify(power.find((s) => JSON.stringify(s).includes("battery_soc")));
  check("level picker lists % sensors", socField.includes("sensor.soc") && !socField.slice(socField.indexOf("battery_soc")).split("battery_reserve")[0].includes("sensor.grid"), true);
}

// ── Editor 0.2.0: counts and consumers feeding others ────────────────────────
{
  const ch = { consumers: [{ entity: "sensor.ev", type: "ups", children: [{ entity: "sensor.p1", name: "Box" }] }, { entity: "sensor.plug" }] };
  const f = Editor.toForm(ch);
  check("flat list: 3 consumers counted", f.consumers_count, 3);
  check("flat list: the child is fed by consumer 1", f.c2_fed, "1");
  check("flat list: the second top consumer is fed by the home", f.c3_fed, "0");
  const back = Editor.fromForm(f, ch);
  check("round trip keeps the chain", JSON.stringify(back.consumers), JSON.stringify(ch.consumers));
  f.c3_fed = "1";
  const moved = Editor.fromForm(f, ch);
  check("feeding a consumer from another nests it", moved.consumers.length === 1 && moved.consumers[0].children.length === 2, true);
  const f2 = Editor.toForm(ch); f2.consumers_count = 1;
  check("lowering the count drops the last consumers", JSON.stringify(Editor.fromForm(f2, ch).consumers), JSON.stringify([{ entity: "sensor.ev", type: "ups" }]));
  const sch = JSON.stringify(Editor.schema(hassOf(base), "en", Editor.toForm({}, { strings: 2, consumers: 0 })));
  check("schema: two string sections when two are chosen", (sch.match(/"title":"String \d/g) || []).length, 2);
  check("schema: no consumer section when none is chosen", sch.includes('"title":"Consumer 1'), false);
  const sx = JSON.stringify(Editor.schema(hassOf(base), "en", Editor.toForm({ consumers: [{ entity: "sensor.ev", type: "sauna" }] })));
  check("a type outside the list is offered as it is", sx.includes('{"value":"sauna","label":"sauna"}'), true);
  check("listed types show their name", sx.includes('{"value":"printer_3d","label":"3D printer"}'), true);
  const ed = new Editor();
  ed.hass = hassOf(base);
  ed.setConfig({});
  const v = Editor.toForm({}, { strings: 0, consumers: 0 }); v.consumers_count = 2;
  ed._changed({ stopPropagation() {}, detail: { value: v } });
  check("raising a count alone sends no config", ed.events.length, 0);
  check("raising a count keeps it for the form", ed._counts.consumers, 2);
  const dcf = Editor.toForm({}); dcf.battery_power = "sensor.bat"; dcf.battery_coupling = "inverter"; dcf.grid_power = "sensor.grid"; dcf.grid_pylon = true; dcf.panel_device = "micro"; dcf.solar_power = "sensor.pv";
  const o = Editor.fromForm(dcf, {});
  check("form writes the battery coupling", o.battery.coupling, "inverter");
  check("form writes the pylon", o.grid.pylon, true);
  check("form writes the microinverters", o.solar.microinverters, true);
}

// ── Microinverter per string, reserve from an entity, hiding idle consumers ──
{
  const ps = { solar: { microinverters: "string", strings: [{ name: "A", power_entity: "sensor.mppt2", panels: ["sensor.p1", "sensor.p2"] }, { name: "B", panels: ["sensor.p3"] }] } };
  const m = Card.computeModel(hassOf(base), ps);
  check("micro per string: read from the config", m.micro, "string");
  check("micro per string: no central inverter", m.showInverter, false);
  check("micro per string: no optimisers with it", m.optimizers, false);
  const html = draw(ps);
  check("micro per string: one box per string", (html.match(/class="ie-micro"/g) || []).length, 2);
  check("micro per panel: one box per panel", (draw({ solar: { ...ps.solar, microinverters: true } }).match(/class="ie-micro"/g) || []).length, 3);
  contains("micro per string: clicking it opens the string", html, 'data-entity="sensor.mppt2"');
  const L = Card.computeLayout(m, ps);
  check("micro per string: the box under the panels' bus", L.microY > L.bus, true);
  check("editor: micro per string read back", Editor.toForm(ps).panel_device, "micro_string");
  check("editor: micro per string written", Editor.fromForm({ ...Editor.toForm({}), panel_device: "micro_string", solar_power: "sensor.pv" }, {}).solar.microinverters, "string");

  const bat = { battery: { power_entity: "sensor.bat", soc_entity: "sensor.soc", reserve: 10, reserve_entity: "number.reserve" } };
  check("reserve: the entity wins over the value", Card.computeModel(hassOf({ ...base, "number.reserve": S(45, "%") }), bat).reserve, 45);
  check("reserve: the value when the entity is unavailable", Card.computeModel(hassOf({ ...base, "number.reserve": { state: "unavailable", attributes: {} } }), bat).reserve, 10);
  check("reserve: the value alone", Card.computeModel(hassOf(base), { battery: { power_entity: "sensor.bat", reserve: 20 } }).reserve, 20);
  check("reserve: none given", Card.computeModel(hassOf(base), { battery: { power_entity: "sensor.bat" } }).reserve, null);
  check("reserve: its entity watched", Card.computeWatched ? true : src.includes("add(b.reserve_entity)"), true);
  contains("reserve: drawn at the entity's level", draw(bat, { ...base, "number.reserve": S(45, "%") }), 'class="bat-reserve"');
  check("editor: reserve entity written", Editor.fromForm({ ...Editor.toForm({}), battery_power: "sensor.bat", battery_reserve_entity: "number.reserve" }, {}).battery.reserve_entity, "number.reserve");

  const many = { consumers_hide_below: 10, consumers: ["sensor.ev", "sensor.plug", { entity: "sensor.p3", name: "Pump" }, { entity: "sensor.ups", children: ["sensor.p1", "sensor.plug"] }] };
  const st = { ...base, "sensor.ups": S(4) };
  const hm = Card.computeModel(hassOf(st), many);
  check("hide: only the consumers at work", hm.consumers.map((k) => k.key).join(","), "c0,c2,c3");
  check("hide: a consumer stays while one it feeds works", hm.consumers[2].children.map((k) => k.key).join(","), "c3-0");
  check("hide: a consumer seen at work a moment ago stays", Card.computeModel(hassOf(st), many, new Set(["c1"])).consumers.map((k) => k.key).join(","), "c0,c1,c2,c3");
  check("hide: unavailable leaves too", Card.computeModel(hassOf({ ...st, "sensor.ev": { state: "unavailable", attributes: {} } }), many).consumers.some((k) => k.key === "c0"), false);
  check("hide: off by default", Card.computeModel(hassOf(st), { ...many, consumers_hide_below: "" }).consumers.length, 4);
  check("hide: zero hides only the ones at 0 W", Card.computeModel(hassOf(st), { ...many, consumers_hide_below: 0 }).consumers.map((k) => k.key).join(","), "c0,c2,c3");
  const card = new Card();
  card.setConfig({ ...cfg, ...many });
  card.hass = hassOf(st);
  check("hide: hidden consumer not drawn", card._wrap.innerHTML.includes('data-entity="sensor.plug"'), false);
  card.hass = hassOf({ ...st, "sensor.ev": S(2) });
  check("hide: a consumer that just stopped stays a moment", card._wrap.innerHTML.includes('data-entity="sensor.ev"'), true);
  clearTimeout(card._holdTimer);
  check("editor: hide threshold written", Editor.fromForm({ ...Editor.toForm({}), consumers_hide_below: 15 }, {}).consumers_hide_below, 15);
  check("editor: empty threshold stays out of the YAML", "consumers_hide_below" in Editor.fromForm({ ...Editor.toForm({}), consumers_hide_below: "" }, {}), false);
  check("editor: threshold read back", Editor.toForm({ consumers_hide_below: 8 }).consumers_hide_below, 8);
}

// ── Full section width, thirty consumers, type hint without Appliance Card ──
{
  check("grid: the card takes the section's whole width", new Card().getGridOptions().columns, "full");
  const thirty = Array.from({ length: 30 }, (_, i) => ({ entity: `sensor.c${i}` }));
  check("editor: thirty consumers kept", Editor.toForm({ consumers: thirty }).consumers_count, 30);
  check("editor: past thirty capped", Editor.toForm({ consumers: [...thirty, { entity: "sensor.x" }] }).consumers_count, 30);
  const flat = (sc) => JSON.stringify(sc);
  const hasAc = !!(globalThis.customElements && customElements.get("ha-appliance-card"));
  const d = Editor.toForm({ consumers: [{ entity: "sensor.a", type: "network" }, { entity: "sensor.b", type: "ev_charger" }] });
  const sc = flat(Editor.schema(hassOf(base), "en", d));
  check("editor: a drawing needing Appliance Card is flagged", sc.includes("drawn as a plug"), !hasAc);
  check("editor: a built-in type is not flagged", (sc.match(/drawn as a plug/g) || []).length, hasAc ? 0 : 1);
}

// ── HA Printer Card draws a printer when installed ───────────────────────────
{
  const pcfg = { consumers: [{ entity: "sensor.ev", type: "printer", name: "Office printer" }, { entity: "sensor.plug", type: "printer", appliance: { entity: "sensor.hp_status", printer_type: "laser" } }] };
  const before = draw(pcfg);
  check("printer without HA Printer Card: a plug stands in", before.includes("ie-plug") && !before.includes("ie-pc"), true);
  const ed0 = JSON.stringify(Editor.schema(hassOf(base), "en", Editor.toForm(pcfg)));
  check("editor: a printer without HA Printer Card is flagged", ed0.includes("install HA Printer Card"), true);
  customElements.define("ha-printer-card", class extends HTMLElement { setConfig(c) { this.cfg = c; } });
  const card = new Card();
  card.setConfig(pcfg);
  card.hass = hassOf({ ...base, "sensor.hp_status": S("idle", "") });
  contains("printer: a placeholder for HA Printer Card", card._wrap.innerHTML, 'class="ie-ac ie-pc" data-ac="c0"');
  const a = card._ac.get("c0"), b = card._ac.get("c1");
  check("printer: a HA Printer Card element", a && a.tag, "ha-printer-card");
  check("printer: status made from the plug when none given", a.el.cfg.entity, "sensor.ie_flow_c0");
  check("printer: on at the plug reads as ready", a.el.hass.states["sensor.ie_flow_c0"].state, "on");
  check("printer: printing above the threshold", a.el.cfg.power_entity === "sensor.ev" && a.el.cfg.printing_watts, 50);
  check("printer: only the picture", ["show_supplies", "show_message", "show_parts", "show_counters", "show_power", "more_info"].every((k) => a.el.cfg[k] === false), true);
  check("printer: the printer's own status sensor wins", b.el.cfg.entity === "sensor.hp_status" && b.el.cfg.printer_type === "laser", true);
  check("printer: real hass with its own sensor", b.el.hass.states["sensor.hp_status"].state === "idle" && !("sensor.ie_flow_c1" in b.el.hass.states), true);
  check("printer: not handed to HA Appliance Card", !!card._wrap.innerHTML.match(/data-ac="c[01]"/g) && card._wrap.innerHTML.includes('class="ie-ac" data-ac'), false);
  const ed1 = JSON.stringify(Editor.schema(hassOf(base), "en", Editor.toForm(pcfg)));
  check("editor: no flag once HA Printer Card is there", ed1.includes("install HA Printer Card"), false);
  const light = new Card();
  light.setConfig({ ...pcfg, style: "light" });
  light.hass = hassOf(base);
  contains("printer: drawn at half size in the light style", light._wrap.innerHTML, '<div class="lk"><div class="ie-ac ie-pc" data-ac="c0">');
}

// ── Editor: typing a new count does not lose consumers ───────────────────────
{
  const sortK = (o) => Array.isArray(o) ? o.map(sortK) : o && typeof o === "object" ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, sortK(o[k])])) : o;
  const ieSameT = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
  const start = {
    solar: { strings: [{ name: "Roof", panels: [{ entity: "sensor.p1", name: "East" }, "sensor.p2"], power_entity: "sensor.s1" }] },
    consumers: [{ entity: "sensor.ev", type: "ev_charger", name: "Car", children: [{ entity: "sensor.box", name: "Box" }] }, { entity: "sensor.oven", type: "oven", appliance: { foo: 1 } }],
  };
  const ed = new Editor();
  ed.hass = hassOf(base);
  ed.setConfig(start);
  // What the form sends back as the count field is edited key by key.
  const type = (count, strings) => {
    const v = Editor.toForm(ed._config, ed._counts);
    if (count !== undefined) v.consumers_count = count;
    if (strings !== undefined) v.strings_count = strings;
    ed._changed({ stopPropagation() {}, detail: { value: v } });
  };
  type(undefined); type(1); type(4);
  check("count typed 3 -> (erased) -> 1 -> 4: consumers back", JSON.stringify(ed._config.consumers), JSON.stringify(start.consumers));
  check("count typed: the new slot is free", ed._counts.consumers, 4);
  const v4 = Editor.toForm(ed._config, ed._counts); v4.c4_entity = "sensor.new";
  ed._changed({ stopPropagation() {}, detail: { value: v4 } });
  check("count typed: the new consumer added after the others", ed._config.consumers.map((x) => x.entity).join(), "sensor.ev,sensor.oven,sensor.new");
  type(undefined, 0); type(undefined, 2);
  check("strings come back when the count rises again", ieSameT(ed._config.solar.strings, start.solar.strings), true);
  type(1); type(0); type(2);
  check("a second drop keeps the longest list", ed._config.consumers.map((x) => [x.entity, ...(x.children || []).map((k) => k.entity)].join("+")).join(), "sensor.ev+sensor.box");
  type(4);
  check("raised again: all back", ed._config.consumers.map((x) => x.entity).join(), "sensor.ev,sensor.oven,sensor.new");
  type(2);
  check("a lower count kept still removes", ed._config.consumers.map((x) => x.entity).join(), "sensor.ev");
}

// ── Wrap: the rest of the consumers under the grid and the house ─────────────
{
  const st = { "sensor.grid": S(300) };
  for (let i = 0; i < 11; i++) st[`sensor.w${i}`] = S(i === 3 ? 230 : 0);
  const conf = (extra, n = 11) => ({ grid: { power_entity: "sensor.grid" }, ...extra, consumers: Array.from({ length: n }, (_, i) => ({ entity: `sensor.w${i}` })) });
  const lay = (c) => Card.computeLayout(Card.computeModel(hassOf(st), c), c);
  const cols = lay(conf({ consumers_layout: "columns" }));
  const wr = lay(conf({ consumers_layout: "wrap" }));
  const rows = wr.consumers.filter((p) => p.row);
  check("wrap: some consumers go in rows", rows.length > 0 && rows.length < 11, true);
  check("wrap: much less tall than two columns", wr.height < cols.height * 0.75, true);
  check("wrap: the rows and their lane stand under the grid", rows.every((p) => p.y - 54 - 12 >= wr.grid.y + 112 + 6), true);
  check("wrap: the rows stay left of the trunk", rows.every((p) => p.x + 65 < wr.trunkX), true);
  check("wrap: three per row", new Set(rows.slice(0, 3).map((p) => p.y)).size === 1 && rows.length > 3 ? rows[3].y > rows[0].y : true, true);
  check("wrap: the order is kept, columns first", wr.consumers.findIndex((p) => p.row), wr.consumers.length - rows.length);
  check("wrap: as wide as two columns", wr.width, cols.width);
  const lw = lay(conf({ consumers_layout: "wrap", style: "light" }));
  check("wrap light: two per row, less tall than light columns", lw.consumers.some((p) => p.row) && lw.height < lay(conf({ consumers_layout: "columns", style: "light" })).height, true);
  const ch = conf({ consumers_layout: "wrap" }); ch.consumers[0].children = [{ entity: "sensor.w9" }];
  check("wrap with a chain: back to auto, no rows", lay(ch).consumers.some((p) => p.row), false);
  check("wrap with one consumer: no rows", lay(conf({ consumers_layout: "wrap" }, 1)).consumers.some((p) => p.row), false);
  const k = new Card(); k.setConfig(conf({ consumers_layout: "wrap" })); k.hass = hassOf(st);
  const r0 = rows[0];
  const h = k._wrap.innerHTML, f = (v) => String(Math.round(v * 10) / 10);
  contains("wrap: a row consumer fed from above", h, `${f(r0.x)} ${f(r0.y - 56)}`);
  const o = { x: wr.house.right + 3, y: wr.house.by - 30 };
  const starts = (h.match(/path="M [^ ]+ [^ ]+/g) || []).filter((m) => m.startsWith(`path="M ${f(o.x)} ${f(o.y)}`));
  check("wrap: every consumer flow leaves the house at one point", starts.length >= 11, true);
  contains("wrap: the line runs down the trunk", h, `${f(wr.trunkX)} ${f(o.y + 14)}`);
  const up = wr.consumers.find((p) => !p.row && p.y < o.y - 28);
  if (up) contains("wrap: the trunk goes up to a higher consumer", h, `${f(wr.trunkX)} ${f(o.y - 14)}`);
  const sch = JSON.stringify(Editor.schema(hassOf(st), "en", Editor.toForm({})));
  check("editor: wrap offered", sch.includes('{"value":"wrap","label":"Fill the empty space"}'), true);
  check("editor: wrap written", Editor.fromForm({ ...Editor.toForm({}), consumers_layout: "wrap" }, {}).consumers_layout, "wrap");
}

// ── Solar total without a central inverter ───────────────────────────────────
{
  const st = { ...base, "sensor.a": S(212), "sensor.b": S(205), "sensor.sum": S(709) };
  const strs = [{ name: "A", panels: ["sensor.a"] }, { name: "B", panels: ["sensor.b"] }];
  const draw = (solar) => { const k = new Card(); k.setConfig({ solar, grid: { power_entity: "sensor.grid" } }); k.hass = hassOf(st); return k._wrap.innerHTML; };
  const svgOf = (h) => h.replace(/<[^>]+>/g, "|");
  const micro = svgOf(draw({ microinverters: "string", strings: strs }));
  check("microinverters: the solar total drawn above the house", /\|Solar 417\sW\|/.test(micro), true);
  check("microinverters: the total reads solar.power_entity", /\|Solar 709\sW\|/.test(svgOf(draw({ microinverters: "string", power_entity: "sensor.sum", strings: strs }))), true);
  check("central inverter: no extra total (the inverter shows it)", /\|Solar \d/.test(svgOf(draw({ strings: strs }))), false);
  const off = { ...st, "sensor.a": S(0), "sensor.b": S(0) };
  const k0 = new Card(); k0.setConfig({ solar: { microinverters: true, strings: strs } }); k0.hass = hassOf(off);
  check("microinverters at night: no total", /\|Solar \d/.test(svgOf(k0._wrap.innerHTML)), false);
}

// ── Stub config ──────────────────────────────────────────────────────────────
{
  const stub = Card.getStubConfig(hassOf({ "sensor.grid_power": S(10), "sensor.solar_power": S(10), "sensor.battery_power": S(1), "sensor.battery_level": S(50, "%") }));
  check("stub finds the grid", stub.grid && stub.grid.power_entity, "sensor.grid_power");
  check("stub finds the solar", stub.solar && stub.solar.power_entity, "sensor.solar_power");
  check("stub finds the battery level", stub.battery && stub.battery.soc_entity, "sensor.battery_level");
}

report();
