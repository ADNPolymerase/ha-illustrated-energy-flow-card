// Small helpers: reading states, formatting watts, escaping text.

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// An entry of a list may be an entity id or { entity, name }.
function ieEntityOf(item) {
  if (!item) return "";
  return typeof item === "string" ? item : String(item.entity || "");
}
function ieNameOf(item) {
  return item && typeof item === "object" && item.name ? String(item.name) : "";
}

function ieNum(hass, entityId) {
  if (!hass || !entityId) return null;
  const st = hass.states && hass.states[entityId];
  if (!st) return null;
  const v = parseFloat(st.state);
  return Number.isFinite(v) ? v : null;
}

// A power in watts, whatever unit the sensor reports it in.
function ieWatts(hass, entityId) {
  const v = ieNum(hass, entityId);
  if (v === null) return null;
  const unit = String((hass.states[entityId].attributes || {}).unit_of_measurement || "W").trim();
  if (unit === "kW") return v * 1000;
  if (unit === "MW") return v * 1e6;
  return v;
}

// The sum of the values that exist; null when none does.
function ieSum(values) {
  let total = null;
  for (const v of values) if (v !== null && v !== undefined) total = (total || 0) + v;
  return total;
}

// "640 W" up to a kilowatt, "2,31 kW" above, in the reader's decimal mark.
function ieFormat(w, decimals, lang) {
  if (w === null || w === undefined || !Number.isFinite(w)) return "--";
  const a = Math.abs(w);
  const loc = lang || "en";
  if (a >= 1000) {
    return `${new Intl.NumberFormat(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(a / 1000)} kW`;
  }
  const d = Math.max(0, Math.min(3, Number(decimals) || 0));
  return `${new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(a)} W`;
}

// Key order carries no meaning in a config, and Home Assistant does not
// promise to hand it back in the order it was given: compare sorted.
function ieStable(v) {
  if (Array.isArray(v)) return v.map(ieStable);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, ieStable(v[k])]));
  return v;
}
const ieSame = (a, b) => JSON.stringify(ieStable(a)) === JSON.stringify(ieStable(b));
