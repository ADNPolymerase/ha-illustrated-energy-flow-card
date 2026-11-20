// The visual editor: one ha-form over a flat copy of the config, folded into
// sections. The flat copy is turned back into the nested config on each
// change, keeping every key the form does not show.
//
// Pitfalls met in the sibling cards, handled here:
//  - CustomEvent.detail is read-only: a new event is built, never mutated;
//  - no ha-select / mwc-list-item: every choice goes through ha-form selectors;
//  - Home Assistant echoes the config it just received: an identical config
//    does not rebuild the form, and a panel given as { entity, name } keeps
//    its name when the form only knows its entity.

// The flat field names, and how they map to the nested config.
function ieToForm(cfg) {
  const c = cfg || {};
  const g = c.grid || {}, s = c.solar || {}, inv = c.inverter || {}, b = c.battery || {}, h = c.home || {};
  const d = {
    title: c.title || "", language: c.language || "auto", flow_style: c.flow_style || "arrows",
    animate: c.animate !== false, dim_inactive: c.dim_inactive !== false, clickable: c.clickable !== false,
    decimals: Number.isFinite(+c.decimals) ? +c.decimals : 0,
    rated_power: c.rated_power || IE_DEFAULTS.rated_power, panel_peak: c.panel_peak || IE_DEFAULTS.panel_peak,
    grid_power: g.power_entity || "", grid_invert: !!g.invert, grid_import: g.import_entity || "",
    grid_export: g.export_entity || "", grid_meter: g.meter || "box", grid_name: g.name || "",
    solar_power: s.power_entity || "", solar_view: s.view || "panel",
    inverter: inv.show !== false, inverter_power: inv.power_entity || "",
    battery_power: b.power_entity || "", battery_invert: !!b.invert, battery_soc: b.soc_entity || "",
    battery_reserve: b.reserve === undefined || b.reserve === null ? "" : b.reserve, battery_name: b.name || "",
    home_power: h.power_entity || "", home_name: h.name || "",
  };
  const strings = Array.isArray(s.strings) ? s.strings : [];
  for (let i = 0; i < IE_MAX_STRINGS; i++) {
    const st = strings[i] || {};
    d[`s${i + 1}_name`] = st.name || "";
    d[`s${i + 1}_power`] = st.power_entity || "";
    d[`s${i + 1}_panels`] = (Array.isArray(st.panels) ? st.panels : []).map(ieEntityOf).filter(Boolean);
  }
  const cons = Array.isArray(c.consumers) ? c.consumers : [];
  for (let i = 0; i < IE_MAX_CONSUMERS; i++) {
    const x = cons[i] || {};
    d[`c${i + 1}_entity`] = ieEntityOf(x);
    d[`c${i + 1}_type`] = (x && x.type) || "generic";
    d[`c${i + 1}_name`] = ieNameOf(x);
  }
  return d;
}

function ieFromForm(d, prev) {
  const p = prev || {};
  const out = { ...p };
  const set = (obj, key, value) => {
    if (value === "" || value === null || value === undefined || (Array.isArray(value) && !value.length)) delete obj[key];
    else obj[key] = value;
  };
  set(out, "title", d.title);
  // Defaults stay out of the YAML: only what differs is written.
  set(out, "language", d.language && d.language !== "auto" ? d.language : "");
  set(out, "flow_style", d.flow_style === "dashes" ? "dashes" : "");
  for (const k of ["animate", "dim_inactive", "clickable"]) set(out, k, d[k] === false ? false : "");
  set(out, "decimals", Number(d.decimals) > 0 ? Number(d.decimals) : "");
  set(out, "rated_power", Number(d.rated_power) > 0 && Number(d.rated_power) !== IE_DEFAULTS.rated_power ? Number(d.rated_power) : "");
  set(out, "panel_peak", Number(d.panel_peak) > 0 && Number(d.panel_peak) !== IE_DEFAULTS.panel_peak ? Number(d.panel_peak) : "");

  const section = (key, build) => {
    const o = build({ ...(p[key] || {}) });
    const meaningful = Object.keys(o).some((k) => !["invert", "show", "meter", "view"].includes(k) || (k === "show" && o.show === false));
    if (meaningful) out[key] = o;
    else delete out[key];
  };

  section("grid", (g) => {
    set(g, "power_entity", d.grid_power); set(g, "import_entity", d.grid_import); set(g, "export_entity", d.grid_export);
    if (d.grid_invert) g.invert = true; else delete g.invert;
    if (d.grid_meter && d.grid_meter !== "box") g.meter = d.grid_meter; else delete g.meter;
    set(g, "name", d.grid_name);
    return g;
  });

  section("solar", (s) => {
    set(s, "power_entity", d.solar_power);
    if (d.solar_view && d.solar_view !== "panel") s.view = d.solar_view; else delete s.view;
    const old = Array.isArray(s.strings) ? s.strings : [];
    const strings = [];
    for (let i = 0; i < IE_MAX_STRINGS; i++) {
      const prevStr = { ...(old[i] || {}) };
      const named = new Map((Array.isArray(prevStr.panels) ? prevStr.panels : []).map((x) => [ieEntityOf(x), x]));
      const panels = (d[`s${i + 1}_panels`] || []).filter(Boolean).map((e) => named.get(e) || e);
      set(prevStr, "name", d[`s${i + 1}_name`]);
      set(prevStr, "power_entity", d[`s${i + 1}_power`]);
      set(prevStr, "panels", panels);
      if (prevStr.name || prevStr.power_entity || prevStr.panels) strings.push(prevStr);
    }
    // Strings past the ones the form shows stay as they were.
    for (let i = IE_MAX_STRINGS; i < old.length; i++) strings.push(old[i]);
    set(s, "strings", strings);
    return s;
  });

  section("inverter", (v) => {
    if (d.inverter === false) v.show = false; else delete v.show;
    set(v, "power_entity", d.inverter_power);
    return v;
  });

  section("battery", (b) => {
    set(b, "power_entity", d.battery_power); set(b, "soc_entity", d.battery_soc);
    if (d.battery_invert) b.invert = true; else delete b.invert;
    set(b, "reserve", d.battery_reserve === "" || d.battery_reserve === null || d.battery_reserve === undefined ? "" : Number(d.battery_reserve));
    set(b, "name", d.battery_name);
    return b;
  });

  section("home", (h) => {
    set(h, "power_entity", d.home_power); set(h, "name", d.home_name);
    return h;
  });

  const oldCons = Array.isArray(p.consumers) ? p.consumers : [];
  const cons = [];
  for (let i = 0; i < IE_MAX_CONSUMERS; i++) {
    const entity = d[`c${i + 1}_entity`];
    if (!entity) continue;
    const prevC = oldCons[i] && typeof oldCons[i] === "object" ? { ...oldCons[i] } : {};
    prevC.entity = entity;
    if (d[`c${i + 1}_type`] && d[`c${i + 1}_type`] !== "generic") prevC.type = d[`c${i + 1}_type`]; else delete prevC.type;
    set(prevC, "name", d[`c${i + 1}_name`]);
    cons.push(prevC);
  }
  for (let i = IE_MAX_CONSUMERS; i < oldCons.length; i++) cons.push(oldCons[i]);
  set(out, "consumers", cons);
  return out;
}

// Sensors whose unit fits: power in W or kW, a level in %.
function ieUnitList(hass, units) {
  const st = (hass && hass.states) || {};
  return Object.keys(st).filter((id) => id.startsWith("sensor.") && units.includes(String((st[id].attributes || {}).unit_of_measurement || ""))).sort();
}

function ieSchema(hass, lang, data) {
  const t = (k, v) => ieT(lang, k, v);
  const power = ieUnitList(hass, ["W", "kW", "MW"]);
  const pct = ieUnitList(hass, ["%"]);
  const ent = (name, list, label, multiple) => ({ name, label, selector: { entity: { include_entities: list, ...(multiple ? { multiple: true } : {}) } } });
  const txt = (name, label) => ({ name, label, selector: { text: {} } });
  const bool = (name, label) => ({ name, label, selector: { boolean: {} } });
  const num = (name, label, min, max, step) => ({ name, label, selector: { number: { min, max, step, mode: "box" } } });
  const sel = (name, label, options) => ({ name, label, selector: { select: { mode: "dropdown", options } } });
  const exp = (title, schema, expanded) => ({ type: "expandable", name: "", flatten: true, title, expanded: !!expanded, schema });

  const strings = [];
  for (let i = 1; i <= IE_MAX_STRINGS; i++) {
    // A string section shows up once the one before it is used.
    const used = (n) => data[`s${n}_name`] || data[`s${n}_power`] || (data[`s${n}_panels`] || []).length;
    if (i > 1 && !used(i - 1) && !used(i)) break;
    strings.push(exp(t("e_string", { n: i }), [
      txt(`s${i}_name`, t("e_name")),
      ent(`s${i}_panels`, power, t("e_panels"), true),
      ent(`s${i}_power`, power, t("e_string_power")),
    ], i === 1 && !used(1)));
  }
  const consumers = [];
  for (let i = 1; i <= IE_MAX_CONSUMERS; i++) {
    if (i > 1 && !data[`c${i - 1}_entity`] && !data[`c${i}_entity`]) break;
    consumers.push(exp(t("e_consumer", { n: i }), [
      ent(`c${i}_entity`, power, t("e_entity")),
      sel(`c${i}_type`, t("e_type"), IE_CONSUMER_TYPES.map((v) => ({ value: v, label: t(v) }))),
      txt(`c${i}_name`, t("e_name")),
    ]));
  }

  return [
    exp(t("e_general"), [
      txt("title", t("e_title")),
      sel("language", t("e_language"), [{ value: "auto", label: t("auto") }, ...IE_LANGS.map((l) => ({ value: l, label: l.toUpperCase() }))]),
      sel("flow_style", t("e_flow_style"), [{ value: "arrows", label: t("e_arrows") }, { value: "dashes", label: t("e_dashes") }]),
      bool("animate", t("e_animate")), bool("dim_inactive", t("e_dim_inactive")), bool("clickable", t("e_clickable")),
      num("decimals", t("e_decimals"), 0, 3, 1), num("rated_power", t("e_rated_power"), 100, 50000, 100),
    ]),
    exp(t("e_grid"), [
      ent("grid_power", power, t("e_grid_power")), bool("grid_invert", t("e_invert")),
      ent("grid_import", power, t("e_grid_import")), ent("grid_export", power, t("e_grid_export")),
      sel("grid_meter", t("e_meter"), IE_METERS.map((v) => ({ value: v, label: t(`e_meter_${v}`) }))),
      txt("grid_name", t("e_name")),
    ]),
    exp(t("e_solar"), [
      sel("solar_view", t("e_solar_view"), IE_SOLAR_VIEWS.map((v) => ({ value: v, label: t(`e_view_${v}`) }))),
      num("panel_peak", t("e_panel_peak"), 50, 1000, 5),
      ent("solar_power", power, t("e_solar_power")),
      bool("inverter", t("e_inverter")), ent("inverter_power", power, t("e_inverter_power")),
    ]),
    ...strings,
    exp(t("e_battery"), [
      ent("battery_power", power, t("e_battery_power")), bool("battery_invert", t("e_invert")),
      ent("battery_soc", pct, t("e_battery_soc")), num("battery_reserve", t("e_battery_reserve"), 0, 100, 1),
      txt("battery_name", t("e_name")),
    ]),
    exp(t("e_home"), [ent("home_power", power, t("e_home_power")), txt("home_name", t("e_name"))]),
    ...consumers,
  ];
}

class IllustratedEnergyFlowCardEditor extends HTMLElement {
  static toForm(cfg) { return ieToForm(cfg); }
  static fromForm(d, prev) { return ieFromForm(d, prev); }
  static schema(hass, lang, data) { return ieSchema(hass, lang, data); }

  setConfig(config) {
    const next = { ...(config || {}) };
    // The echo of what this editor just sent: nothing to rebuild.
    if (this._config && ieSame(next, this._config)) return;
    this._config = next;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    else this._render();
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => this._changed(ev));
      this.appendChild(this._form);
    }
    const lang = ieLang(this._hass, this._config);
    const data = ieToForm(this._config);
    this._form.hass = this._hass;
    this._form.data = data;
    this._form.schema = ieSchema(this._hass, lang, data);
    this._form.computeLabel = (s) => s.label || s.name;
  }

  _changed(ev) {
    ev.stopPropagation();
    const value = (ev.detail && ev.detail.value) || {};
    const next = ieFromForm(value, this._config);
    if (ieSame(next, this._config)) return;
    this._config = next;
    this._render();
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}
