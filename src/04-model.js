// From the config and the states to the numbers the card draws. Kept free of
// any markup so the tests can check the arithmetic on its own.
//
// Sign conventions, after the inversion options are applied:
//   grid    + import from the grid, - export to it
//   battery + discharge to the home, - charge from it

function ieModel(hass, cfg, recent) {
  const c = cfg || {};
  const solarCfg = c.solar || {};
  const strings = (Array.isArray(solarCfg.strings) ? solarCfg.strings : []).map((s, i) => {
    const sc = s || {};
    const panels = (Array.isArray(sc.panels) ? sc.panels : []).filter((p) => ieEntityOf(p)).map((p) => {
      const entity = ieEntityOf(p);
      return { entity, name: ieNameOf(p), w: ieWatts(hass, entity) };
    });
    const own = sc.power_entity ? ieWatts(hass, sc.power_entity) : null;
    const w = sc.power_entity ? own : ieSum(panels.map((p) => p.w));
    return { name: sc.name ? String(sc.name) : "", index: i, entity: sc.power_entity || "", panels, w };
  });

  const hasSolar = !!(solarCfg.power_entity || strings.length);
  let pv = null;
  if (solarCfg.power_entity) pv = ieWatts(hass, solarCfg.power_entity);
  else pv = ieSum(strings.map((s) => s.w));
  if (pv !== null && pv < 0) pv = 0;

  const inv = c.inverter || {};
  const showInverter = hasSolar && inv.show !== false && !solarCfg.microinverters;
  // One microinverter per panel (true), or one per string ("string"): the
  // dual and quad ones (APsystems DS3, Hoymiles HM-800) take two or four.
  const micro = solarCfg.microinverters === "string" ? "string" : solarCfg.microinverters ? "panel" : "";
  let invOut = inv.power_entity ? ieWatts(hass, inv.power_entity) : pv;
  if (invOut !== null && invOut < 0) invOut = 0;

  const g = c.grid || {};
  const hasGrid = !!(g.power_entity || g.import_entity || g.export_entity);
  let grid = null;
  if (g.power_entity) {
    grid = ieWatts(hass, g.power_entity);
    if (grid !== null && g.invert) grid = -grid;
  } else if (g.import_entity || g.export_entity) {
    const imp = ieWatts(hass, g.import_entity);
    const exp = ieWatts(hass, g.export_entity);
    if (imp !== null || exp !== null) grid = Math.abs(imp || 0) - Math.abs(exp || 0);
  }

  const b = c.battery || {};
  const hasBattery = !!(b.power_entity || b.soc_entity);
  // A battery on the inverter's DC side (hybrid inverters, a PowerStream on
  // its station) charges and discharges through it, not through the home.
  const batteryOnInverter = hasBattery && b.coupling === "inverter" && showInverter;
  let bat = b.power_entity ? ieWatts(hass, b.power_entity) : null;
  if (bat !== null && b.invert) bat = -bat;
  const soc = b.soc_entity ? ieNum(hass, b.soc_entity) : null;
  // The reserve: a sensor or a number entity when given, else the fixed value.
  let reserve = b.reserve_entity ? ieNum(hass, b.reserve_entity) : null;
  if (reserve === null && b.reserve !== "" && b.reserve !== null && b.reserve !== undefined && Number.isFinite(+b.reserve)) reserve = +b.reserve;

  // A consumer may feed others (a UPS feeding the router and a mini PC): its
  // children hang from it, one level deep.
  const consumerOf = (x, key) => {
    const entity = ieEntityOf(x);
    const type = x && typeof x.type === "string" && /^[a-z0-9_]+$/.test(x.type) ? x.type : "generic";
    const kids = !key.includes("-") && x && Array.isArray(x.children) ? x.children.map((k, j) => [k, j]).filter(([k]) => ieEntityOf(k)).map(([k, j]) => consumerOf(k, `${key}-${j}`)) : [];
    return { entity, key, name: ieNameOf(x), type, icon: ieIconOf(hass, x, entity, type), w: ieWatts(hass, entity), appliance: x && typeof x.appliance === "object" ? x.appliance : null, children: kids };
  };
  let consumers = (Array.isArray(c.consumers) ? c.consumers : []).map((x, i) => [x, i]).filter(([x]) => ieEntityOf(x)).map(([x, i]) => consumerOf(x, `c${i}`));
  // Only the consumers at work, when asked: below the threshold (or
  // unavailable) they leave the card, unless they were at work a moment ago
  // (the card passes those in recent, so a consumer on the edge does not
  // come and go with every reading). A consumer stays while one it feeds works.
  const below = ieHideBelow(c);
  if (below !== null) {
    const working = (k) => (k.w !== null && k.w > below) || (recent && recent.has(k.key));
    consumers = consumers.map((k) => ({ ...k, children: k.children.filter(working) })).filter((k) => working(k) || k.children.length);
  }

  // The home: its own sensor when given, otherwise what comes in.
  const h = c.home || {};
  let home = null, homeComputed = false;
  if (h.power_entity) home = ieWatts(hass, h.power_entity);
  else {
    const viaHome = batteryOnInverter ? null : bat;
    const parts = [hasSolar ? invOut : null, grid, viaHome];
    if (parts.some((v) => v !== null)) {
      home = Math.max(0, (invOut || 0) + (grid || 0) + (viaHome || 0));
      homeComputed = true;
    }
  }

  return { strings, hasSolar, pv, showInverter, invOut, hasGrid, grid, hasBattery, batteryOnInverter, bat, soc, reserve, consumers, home, homeComputed, micro, optimizers: !micro && !!solarCfg.optimizers };
}

// The power under which consumers are hidden, or null to show them all.
function ieHideBelow(c) {
  const v = c && c.consumers_hide_below;
  return v === "" || v === null || v === undefined || !Number.isFinite(+v) ? null : Math.max(0, +v);
}

// Every entity the card reads: the card only redraws when one of them moves.
function ieWatched(cfg) {
  const c = cfg || {};
  const out = [];
  const add = (e) => { if (e) out.push(e); };
  const s = c.solar || {};
  add(s.power_entity);
  for (const st of s.strings || []) {
    add(st && st.power_entity);
    for (const p of (st && st.panels) || []) add(ieEntityOf(p));
  }
  add((c.inverter || {}).power_entity);
  const g = c.grid || {};
  add(g.power_entity); add(g.import_entity); add(g.export_entity);
  const b = c.battery || {};
  add(b.power_entity); add(b.soc_entity); add(b.reserve_entity);
  add((c.home || {}).power_entity);
  for (const x of c.consumers || []) {
    add(ieEntityOf(x));
    for (const k of (x && x.children) || []) add(ieEntityOf(k));
  }
  return out;
}

// The icon of a consumer in the light style: the one the config gives, the
// one its type stands for, the entity's own, else a plug.
function ieIconOf(hass, x, entity, type) {
  if (x && typeof x.icon === "string" && x.icon) return x.icon;
  if (type !== "generic" && IE_TYPE_ICONS[type]) return IE_TYPE_ICONS[type];
  const st = hass && hass.states && hass.states[entity];
  const own = st && st.attributes && st.attributes.icon;
  return typeof own === "string" && own ? own : IE_TYPE_ICONS.generic;
}

// The light style and the zoom cap, read from the config.
function ieStyle(c) { return IE_STYLES.includes(c && c.style) ? c.style : "drawn"; }
function ieMaxScale(c) {
  const v = c && c.max_scale;
  if (v === "" || v === null || v === undefined || !Number.isFinite(+v)) return IE_SCALE_DEFAULT;
  return Math.max(IE_SCALE_MIN, Math.min(IE_SCALE_MAX, +v));
}
