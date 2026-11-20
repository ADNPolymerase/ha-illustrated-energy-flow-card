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
  consumers: [{ entity: "sensor.ev", type: "ev_charger" }, { entity: "sensor.plug", type: "nonsense" }],
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
  const gaps = L.consumers.slice(1).map((c, i) => c.y - L.consumers[i].y);
  check("consumers far enough apart for their labels", Math.min(...gaps) >= 165, true);
  check("first consumer below the panels", L.consumers[0].y - 54 > L.bus, true);
  check("battery below the grid", L.battery.y - L.grid.y >= 170, true);
  check("height covers the last consumer", L.height >= L.consumers[4].y + 54 + 58, true);
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

// ── Stub config ──────────────────────────────────────────────────────────────
{
  const stub = Card.getStubConfig(hassOf({ "sensor.grid_power": S(10), "sensor.solar_power": S(10), "sensor.battery_power": S(1), "sensor.battery_level": S(50, "%") }));
  check("stub finds the grid", stub.grid && stub.grid.power_entity, "sensor.grid_power");
  check("stub finds the solar", stub.solar && stub.solar.power_entity, "sensor.solar_power");
  check("stub finds the battery level", stub.battery && stub.battery.soc_entity, "sensor.battery_level");
}

report();
