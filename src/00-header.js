// Illustrated Energy Flow Card: an energy flow card for Home Assistant whose
// nodes are drawn and animated devices, with the solar side shown panel by
// panel, string by string or as a total.
// https://github.com/ADNPolymerase/ha-illustrated-energy-flow-card

const IE_VERSION = "0.2.3";
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
// The consumer drawings offered in the editor. Any HA Appliance Card type
// works when that card is installed (it draws them); without it, the first
// four are drawn here and every other one as a smart plug.
const IE_BUILTIN_TYPES = ["generic", "ev_charger", "heat_pump", "water_heater"];
const IE_CONSUMER_TYPES = [...IE_BUILTIN_TYPES, "washer", "dryer", "dishwasher", "fridge", "oven", "cooktop", "microwave", "kettle", "coffee", "printer_3d", "screen", "network", "ups", "air_conditioner", "space_heater", "dehumidifier", "pool_pump", "spa", "robot", "lamp"];
const IE_METERS = ["box", "linky", "dome"];
const IE_CONSUMER_LAYOUTS = ["auto", "column", "columns", "compact"];
const IE_SOLAR_VIEWS = ["panel", "string", "total"];
const IE_MAX_STRINGS = 6;
const IE_MAX_CONSUMERS = 30;
// HA Appliance Card types whose drawing follows an on/off state.
const IE_ONOFF_TYPES = ["drying_rack"];
// A consumer drawing more than this is on (W).
const IE_ON_W = 5;
const IE_HIDE_HOLD = 120000;
// The box a HA Appliance Card drawing sits in.
const IE_AC_W = 130;
const IE_AC_H = 108;
