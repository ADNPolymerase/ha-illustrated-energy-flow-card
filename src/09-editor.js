// The visual editor: one ha-form over a flat copy of the config, in six
// sections. The number of strings and of consumers is chosen, and only those
// are shown, each folded on its own, so the form stays short.
//
// Pitfalls met in the sibling cards, handled here:
//  - CustomEvent.detail is read-only: a new event is built, never mutated;
//  - no ha-select / mwc-list-item: every choice goes through ha-form selectors;
//  - Home Assistant echoes the config it just received: an identical config
//    does not rebuild the form, and a panel given as { entity, name } keeps
//    its name when the form only knows its entity.

// The consumers as one flat list: each one that feeds others, then those.
// `fed` is the 1-based place of the consumer feeding it, 0 for the home.
function ieFlatConsumers(cfg) {
  const out = [];
  for (const x of (cfg && Array.isArray(cfg.consumers) ? cfg.consumers : [])) {
    const top = out.length + 1;
    out.push({ item: x, fed: 0 });
    for (const k of (x && Array.isArray(x.children) ? x.children : [])) out.push({ item: k, fed: top });
  }
  return out;
}

function ieCounts(cfg) {
  const s = (cfg && cfg.solar) || {};
  return {
    strings: Math.min(IE_MAX_STRINGS, Array.isArray(s.strings) ? s.strings.length : 0),
    consumers: Math.min(IE_MAX_CONSUMERS, ieFlatConsumers(cfg).length),
  };
}

function ieToForm(cfg, counts) {
  const c = cfg || {};
  const n = counts || ieCounts(c);
  const g = c.grid || {}, s = c.solar || {}, inv = c.inverter || {}, b = c.battery || {}, h = c.home || {};
  const d = {
    title: c.title || "", language: c.language || "auto", flow_style: c.flow_style || "arrows",
    animate: c.animate !== false, dim_inactive: c.dim_inactive !== false, clickable: c.clickable !== false,
    decimals: Number.isFinite(+c.decimals) ? +c.decimals : 0,
    rated_power: c.rated_power || IE_DEFAULTS.rated_power, panel_peak: c.panel_peak || IE_DEFAULTS.panel_peak,
    grid_power: g.power_entity || "", grid_invert: !!g.invert, grid_import: g.import_entity || "",
    grid_export: g.export_entity || "", grid_meter: g.meter || "box", grid_pylon: !!g.pylon, grid_name: g.name || "",
    solar_power: s.power_entity || "", solar_view: s.view || "panel", panel_device: s.microinverters === "string" ? "micro_string" : s.microinverters ? "micro" : s.optimizers ? "optim" : "none",
    inverter: inv.show !== false, inverter_power: inv.power_entity || "",
    battery_power: b.power_entity || "", battery_invert: !!b.invert, battery_soc: b.soc_entity || "",
    battery_coupling: b.coupling === "inverter" ? "inverter" : "home",
    battery_reserve: b.reserve === undefined || b.reserve === null ? "" : b.reserve, battery_reserve_entity: b.reserve_entity || "", battery_name: b.name || "",
    home_power: h.power_entity || "", home_name: h.name || "",
    strings_count: n.strings, consumers_count: n.consumers,
    consumers_layout: IE_CONSUMER_LAYOUTS.includes(c.consumers_layout) ? c.consumers_layout : "auto",
    consumers_hide_below: ieHideBelow(c) === null ? "" : ieHideBelow(c),
  };
  const strings = Array.isArray(s.strings) ? s.strings : [];
  for (let i = 0; i < IE_MAX_STRINGS; i++) {
    const st = strings[i] || {};
    d[`s${i + 1}_name`] = st.name || "";
    d[`s${i + 1}_power`] = st.power_entity || "";
    d[`s${i + 1}_panels`] = (Array.isArray(st.panels) ? st.panels : []).map(ieEntityOf).filter(Boolean);
  }
  const flat = ieFlatConsumers(c);
  for (let i = 0; i < IE_MAX_CONSUMERS; i++) {
    const f = flat[i] || { item: {}, fed: 0 };
    const x = f.item || {};
    d[`c${i + 1}_entity`] = ieEntityOf(x);
    d[`c${i + 1}_type`] = (x && x.type) || "generic";
    d[`c${i + 1}_name`] = ieNameOf(x);
    d[`c${i + 1}_fed`] = String(f.fed || 0);
    d[`c${i + 1}_appliance`] = x && typeof x.appliance === "object" && x.appliance ? x.appliance : {};
  }
  return d;
}

function ieFromForm(d, prev) {
  const p = prev || {};
  const out = { ...p };
  const set = (obj, key, value) => {
    if (value === "" || value === null || value === undefined || (Array.isArray(value) && !value.length) || (value && typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length)) delete obj[key];
    else obj[key] = value;
  };
  set(out, "title", d.title);
  // Defaults stay out of the YAML: only what differs is written.
  set(out, "language", d.language && d.language !== "auto" ? d.language : "");
  set(out, "flow_style", d.flow_style === "dashes" ? "dashes" : "");
  set(out, "consumers_hide_below", d.consumers_hide_below === "" || d.consumers_hide_below === null || d.consumers_hide_below === undefined || !Number.isFinite(+d.consumers_hide_below) ? "" : Math.max(0, +d.consumers_hide_below));
  set(out, "consumers_layout", IE_CONSUMER_LAYOUTS.includes(d.consumers_layout) && d.consumers_layout !== "auto" ? d.consumers_layout : "");
  for (const k of ["animate", "dim_inactive", "clickable"]) set(out, k, d[k] === false ? false : "");
  set(out, "decimals", Number(d.decimals) > 0 ? Number(d.decimals) : "");
  set(out, "rated_power", Number(d.rated_power) > 0 && Number(d.rated_power) !== IE_DEFAULTS.rated_power ? Number(d.rated_power) : "");
  set(out, "panel_peak", Number(d.panel_peak) > 0 && Number(d.panel_peak) !== IE_DEFAULTS.panel_peak ? Number(d.panel_peak) : "");

  const section = (key, build) => {
    const o = build({ ...(p[key] || {}) });
    const meaningful = Object.keys(o).some((k) => !["invert", "show", "meter", "view", "pylon", "coupling", "microinverters", "optimizers"].includes(k) || (k === "show" && o.show === false));
    if (meaningful) out[key] = o;
    else delete out[key];
  };

  section("grid", (g) => {
    set(g, "power_entity", d.grid_power); set(g, "import_entity", d.grid_import); set(g, "export_entity", d.grid_export);
    if (d.grid_invert) g.invert = true; else delete g.invert;
    if (d.grid_meter && d.grid_meter !== "box") g.meter = d.grid_meter; else delete g.meter;
    if (d.grid_pylon) g.pylon = true; else delete g.pylon;
    set(g, "name", d.grid_name);
    return g;
  });

  const nStrings = Math.max(0, Math.min(IE_MAX_STRINGS, Number(d.strings_count) || 0));
  section("solar", (s) => {
    set(s, "power_entity", d.solar_power);
    if (d.solar_view && d.solar_view !== "panel") s.view = d.solar_view; else delete s.view;
    if (d.panel_device === "micro") s.microinverters = true; else if (d.panel_device === "micro_string") s.microinverters = "string"; else delete s.microinverters;
    if (d.panel_device === "optim") s.optimizers = true; else delete s.optimizers;
    const old = Array.isArray(s.strings) ? s.strings : [];
    const strings = [];
    for (let i = 0; i < nStrings; i++) {
      const prevStr = { ...(old[i] || {}) };
      const named = new Map((Array.isArray(prevStr.panels) ? prevStr.panels : []).map((x) => [ieEntityOf(x), x]));
      const panels = (d[`s${i + 1}_panels`] || []).filter(Boolean).map((e) => named.get(e) || e);
      set(prevStr, "name", d[`s${i + 1}_name`]);
      set(prevStr, "power_entity", d[`s${i + 1}_power`]);
      set(prevStr, "panels", panels);
      if (prevStr.name || prevStr.power_entity || prevStr.panels) strings.push(prevStr);
    }
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
    if (d.battery_coupling === "inverter") b.coupling = "inverter"; else delete b.coupling;
    set(b, "reserve", d.battery_reserve === "" || d.battery_reserve === null || d.battery_reserve === undefined ? "" : Number(d.battery_reserve));
    set(b, "reserve_entity", d.battery_reserve_entity);
    set(b, "name", d.battery_name);
    return b;
  });

  section("home", (h) => {
    set(h, "power_entity", d.home_power); set(h, "name", d.home_name);
    return h;
  });

  // The flat list back to consumers and the ones they feed.
  const oldFlat = ieFlatConsumers(p);
  const nCons = Math.max(0, Math.min(IE_MAX_CONSUMERS, Number(d.consumers_count) || 0));
  const tops = [];
  const topAt = new Map();
  for (let i = 0; i < nCons; i++) {
    const entity = d[`c${i + 1}_entity`];
    if (!entity) continue;
    const old = oldFlat[i] && oldFlat[i].item && typeof oldFlat[i].item === "object" ? { ...oldFlat[i].item } : {};
    delete old.children;
    old.entity = entity;
    if (d[`c${i + 1}_type`] && d[`c${i + 1}_type`] !== "generic") old.type = d[`c${i + 1}_type`]; else delete old.type;
    set(old, "name", d[`c${i + 1}_name`]);
    set(old, "appliance", d[`c${i + 1}_appliance`]);
    const fed = Number(d[`c${i + 1}_fed`]) || 0;
    const parent = fed && fed - 1 < i ? topAt.get(fed) : null;
    if (parent) (parent.children = parent.children || []).push(old);
    else {
      tops.push(old);
      topAt.set(i + 1, old);
    }
  }
  set(out, "consumers", tops);
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
  const st = (hass && hass.states) || {};
  const pctSet = Object.keys(st).filter((id) => /^(sensor|number|input_number)\./.test(id) && String((st[id].attributes || {}).unit_of_measurement || "") === "%").sort();
  const ent = (name, list, label, multiple) => ({ name, label, selector: { entity: { include_entities: list, ...(multiple ? { multiple: true } : {}) } } });
  const txt = (name, label) => ({ name, label, selector: { text: {} } });
  const bool = (name, label) => ({ name, label, selector: { boolean: {} } });
  const num = (name, label, min, max, step) => ({ name, label, selector: { number: { min, max, step, mode: "box" } } });
  const sel = (name, label, options) => ({ name, label, selector: { select: { mode: "dropdown", options } } });
  const exp = (title, schema) => ({ type: "expandable", name: "", flatten: true, title, schema });
  const grid2 = (schema) => ({ type: "grid", name: "", flatten: true, schema });

  const nS = Math.max(0, Math.min(IE_MAX_STRINGS, Number(data.strings_count) || 0));
  const nC = Math.max(0, Math.min(IE_MAX_CONSUMERS, Number(data.consumers_count) || 0));

  const strings = [];
  for (let i = 1; i <= nS; i++) {
    const name = data[`s${i}_name`];
    strings.push(exp(name ? `${t("e_string", { n: i })} · ${name}` : t("e_string", { n: i }), [
      txt(`s${i}_name`, t("e_name")),
      ent(`s${i}_panels`, power, t("e_panels"), true),
      ent(`s${i}_power`, power, t("e_string_power")),
    ]));
  }
  // A type typed in YAML that the list lacks is added as it is, so the
  // choice shows its translated name (a free-text select would show the code).
  const typeOptions = (cur) => [...IE_CONSUMER_TYPES, ...(cur && !IE_CONSUMER_TYPES.includes(cur) ? [cur] : [])].map((v) => ({ value: v, label: IE_CONSUMER_TYPES.includes(v) ? t(v) : v }));
  const consumers = [];
  for (let i = 1; i <= nC; i++) {
    // A consumer is fed by the home, or by one of the consumers above it
    // that is itself fed by the home.
    const feeds = [{ value: "0", label: t("e_none") }];
    for (let j = 1; j < i; j++) {
      if (String(data[`c${j}_fed`] || "0") !== "0") continue;
      feeds.push({ value: String(j), label: data[`c${j}_name`] || `${t("e_consumer", { n: j })}` });
    }
    const name = data[`c${i}_name`] || (data[`c${i}_entity`] ? t(data[`c${i}_type`] || "generic") : "");
    consumers.push(exp(name ? `${t("e_consumer", { n: i })} · ${name}` : t("e_consumer", { n: i }), [
      ent(`c${i}_entity`, power, t("e_entity")),
      grid2([sel(`c${i}_type`, t("e_type"), typeOptions(data[`c${i}_type`])), txt(`c${i}_name`, t("e_name"))]),
      sel(`c${i}_fed`, t("e_fed_by"), feeds),
      { name: `c${i}_appliance`, label: t("e_appliance"), selector: { object: {} } },
    ]));
  }

  return [
    exp(t("e_general"), [
      txt("title", t("e_title")),
      grid2([
        sel("language", t("e_language"), [{ value: "auto", label: t("auto") }, ...IE_LANGS.map((l) => ({ value: l, label: l.toUpperCase() }))]),
        sel("flow_style", t("e_flow_style"), [{ value: "arrows", label: t("e_arrows") }, { value: "dashes", label: t("e_dashes") }]),
        num("decimals", t("e_decimals"), 0, 3, 1), num("rated_power", t("e_rated_power"), 100, 50000, 100),
      ]),
      grid2([bool("animate", t("e_animate")), bool("dim_inactive", t("e_dim_inactive")), bool("clickable", t("e_clickable"))]),
    ]),
    exp(t("e_grid"), [
      ent("grid_power", power, t("e_grid_power")),
      grid2([ent("grid_import", power, t("e_grid_import")), ent("grid_export", power, t("e_grid_export"))]),
      grid2([sel("grid_meter", t("e_meter"), IE_METERS.map((v) => ({ value: v, label: t(`e_meter_${v}`) }))), txt("grid_name", t("e_name"))]),
      grid2([bool("grid_invert", t("e_invert")), bool("grid_pylon", t("e_pylon"))]),
    ]),
    exp(t("e_solar"), [
      grid2([
        sel("solar_view", t("e_solar_view"), IE_SOLAR_VIEWS.map((v) => ({ value: v, label: t(`e_view_${v}`) }))),
        num("panel_peak", t("e_panel_peak"), 50, 1000, 5),
      ]),
      ent("solar_power", power, t("e_solar_power")),
      sel("panel_device", t("e_panel_device"), [{ value: "none", label: t("e_pd_none") }, { value: "micro", label: t("e_pd_micro") }, { value: "micro_string", label: t("e_pd_micro_string") }, { value: "optim", label: t("e_pd_optim") }]),
      grid2([bool("inverter", t("e_inverter")), ent("inverter_power", power, t("e_inverter_power"))]),
      num("strings_count", t("e_strings_count"), 0, IE_MAX_STRINGS, 1),
      ...strings,
    ]),
    exp(t("e_battery"), [
      grid2([ent("battery_power", power, t("e_battery_power")), ent("battery_soc", pct, t("e_battery_soc"))]),
      grid2([
        sel("battery_coupling", t("e_coupling"), [{ value: "home", label: t("e_coupling_home") }, { value: "inverter", label: t("e_coupling_inverter") }]),
        num("battery_reserve", t("e_battery_reserve"), 0, 100, 1),
      ]),
      ent("battery_reserve_entity", pctSet, t("e_battery_reserve_entity")),
      grid2([bool("battery_invert", t("e_invert")), txt("battery_name", t("e_name"))]),
    ]),
    exp(t("e_home"), [grid2([ent("home_power", power, t("e_home_power")), txt("home_name", t("e_name"))])]),
    exp(t("e_consumers"), [
      grid2([
        num("consumers_count", t("e_consumers_count"), 0, IE_MAX_CONSUMERS, 1),
        sel("consumers_layout", t("e_layout"), IE_CONSUMER_LAYOUTS.map((v) => ({ value: v, label: t(`e_layout_${v}`) }))),
      ]),
      num("consumers_hide_below", t("e_hide_below"), 0, 5000, 1),
      ...consumers,
    ]),
  ];
}

class IllustratedEnergyFlowCardEditor extends HTMLElement {
  static toForm(cfg, counts) { return ieToForm(cfg, counts); }
  static fromForm(d, prev) { return ieFromForm(d, prev); }
  static schema(hass, lang, data) { return ieSchema(hass, lang, data); }

  setConfig(config) {
    const next = { ...(config || {}) };
    // The echo of what this editor just sent: nothing to rebuild.
    if (this._config && ieSame(next, this._config)) return;
    this._config = next;
    // The counts follow the config, and never drop below what is chosen.
    const n = ieCounts(next);
    this._counts = { strings: Math.max(n.strings, (this._counts && this._counts.strings) || 0), consumers: Math.max(n.consumers, (this._counts && this._counts.consumers) || 0) };
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
    const data = ieToForm(this._config, this._counts || ieCounts(this._config));
    this._form.hass = this._hass;
    this._form.data = data;
    this._form.schema = ieSchema(this._hass, lang, data);
    this._form.computeLabel = (s) => s.label || s.name;
  }

  _changed(ev) {
    ev.stopPropagation();
    const value = (ev.detail && ev.detail.value) || {};
    const counts = {
      strings: Math.max(0, Math.min(IE_MAX_STRINGS, Number(value.strings_count) || 0)),
      consumers: Math.max(0, Math.min(IE_MAX_CONSUMERS, Number(value.consumers_count) || 0)),
    };
    const countsMoved = !this._counts || counts.strings !== this._counts.strings || counts.consumers !== this._counts.consumers;
    this._counts = counts;
    const next = ieFromForm(value, this._config);
    if (ieSame(next, this._config)) {
      // A new count adds empty sections to fill; the config waits for them.
      if (countsMoved) this._render();
      return;
    }
    this._config = next;
    this._render();
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}
