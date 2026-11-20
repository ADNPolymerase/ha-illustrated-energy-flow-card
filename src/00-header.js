// Illustrated Energy Flow Card: an energy flow card for Home Assistant whose
// nodes are drawn and animated devices, with the solar side shown panel by
// panel, string by string or as a total.
// https://github.com/ADNPolymerase/ha-illustrated-energy-flow-card

const IE_VERSION = "0.1.0";
const IE_TAG = "illustrated-energy-flow-card";
const IE_EDITOR_TAG = "illustrated-energy-flow-card-editor";

// Colours of the flows. The grid link is grey when it imports and green when
// it exports; the battery link is green when it charges and amber when it
// gives back.
const IE_COLORS = {
  solar: "#f5a524",
  import: "#8e9aaf",
  export: "#3ddc84",
  charge: "#3ddc84",
  discharge: "#ffb020",
  load: "#b07cff",
};

const IE_DEFAULTS = {
  flow_style: "arrows",
  animate: true,
  dim_inactive: true,
  clickable: true,
  decimals: 0,
  language: "auto",
  rated_power: 6000,
  panel_peak: 450,
};

const IE_LANGS = ["en", "fr", "de", "es", "it", "nl"];
const IE_CONSUMER_TYPES = ["generic", "ev_charger", "heat_pump", "water_heater"];
const IE_METERS = ["box", "linky", "dome"];
const IE_SOLAR_VIEWS = ["panel", "string", "total"];
const IE_MAX_STRINGS = 4;
const IE_MAX_CONSUMERS = 6;
