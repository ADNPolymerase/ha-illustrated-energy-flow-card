// From the config and the states to the numbers the card draws. Kept free of
// any markup so the tests can check the arithmetic on its own.
//
// Sign conventions, after the inversion options are applied:
//   grid    + import from the grid, - export to it
//   battery + discharge to the home, - charge from it

function ieModel(hass, cfg) {
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
  const showInverter = hasSolar && inv.show !== false;
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
  let bat = b.power_entity ? ieWatts(hass, b.power_entity) : null;
  if (bat !== null && b.invert) bat = -bat;
  const soc = b.soc_entity ? ieNum(hass, b.soc_entity) : null;

  const consumers = (Array.isArray(c.consumers) ? c.consumers : []).filter((x) => ieEntityOf(x)).map((x) => {
    const entity = ieEntityOf(x);
    const type = x && IE_CONSUMER_TYPES.includes(x.type) ? x.type : "generic";
    return { entity, name: ieNameOf(x), type, w: ieWatts(hass, entity) };
  });

  // The home: its own sensor when given, otherwise what comes in.
  const h = c.home || {};
  let home = null, homeComputed = false;
  if (h.power_entity) home = ieWatts(hass, h.power_entity);
  else {
    const parts = [hasSolar ? invOut : null, grid, bat];
    if (parts.some((v) => v !== null)) {
      home = Math.max(0, (invOut || 0) + (grid || 0) + (bat || 0));
      homeComputed = true;
    }
  }

  return { strings, hasSolar, pv, showInverter, invOut, hasGrid, grid, hasBattery, bat, soc, consumers, home, homeComputed };
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
  add(b.power_entity); add(b.soc_entity);
  add((c.home || {}).power_entity);
  for (const x of c.consumers || []) add(ieEntityOf(x));
  return out;
}
