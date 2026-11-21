// Built by tools/build.mjs from the files of src/: edit those, not this file.
(() => {
// ---- src/00-header.js
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
// What an embedded HA Appliance Card must not show under its drawing.
const IE_AC_HIDE_CSS = ".info-lines, .line-menu, .sliders, .history, .history-toggle { display: none !important; }";

// ---- src/01-i18n.js
// Every text the card and its editor show, in the six languages. Missing keys
// fall back to English; the tests check that no language lacks one.
const IE_I18N = {
  en: {
    grid: "Grid", import: "Import", export: "Export", home: "Home", solar: "Solar",
    inverter: "Inverter", battery: "Battery", charging: "Charging", discharging: "Discharging",
    idle: "Idle", unavailable: "Unavailable", string: "String", panel: "Panel",
    ev_charger: "EV charger", heat_pump: "Heat pump", water_heater: "Water heater", generic: "Load",
    // Editor
    e_general: "General", e_title: "Title", e_language: "Language", e_flow_style: "Flow style",
    e_arrows: "Arrows", e_dashes: "Dashes", e_animate: "Animate the flows",
    e_dim_inactive: "Dim the branches without power", e_clickable: "Open more-info on click",
    e_decimals: "Decimals", e_rated_power: "Power for the fastest flow (W)",
    e_solar_view: "Solar view", e_view_panel: "Panel by panel", e_view_string: "String by string",
    e_view_total: "Total", e_panel_peak: "Peak power of one panel (W)",
    e_grid: "Grid", e_grid_power: "Grid power, signed (+ import, - export)",
    e_invert: "Invert the sign", e_grid_import: "Or: import power", e_grid_export: "and export power",
    e_meter: "Meter drawing", e_meter_box: "Digital meter", e_meter_linky: "Linky", e_meter_dome: "Dome meter",
    e_name: "Name", e_solar: "Solar", e_solar_power: "Total solar power (optional)",
    e_inverter: "Draw the inverter", e_inverter_power: "Inverter output power (optional)",
    e_string: "String {n}", e_string_power: "String power (optional if panels are given)",
    e_panels: "Panels (one power sensor per panel)",
    e_battery: "Battery", e_battery_power: "Battery power, signed (+ discharge, - charge)",
    e_battery_soc: "State of charge (%)", e_battery_reserve: "Reserve (%)",
    e_home: "Home", e_home_power: "Home power (optional, computed otherwise)",
    e_consumer: "Consumer {n}", e_entity: "Power sensor", e_type: "Drawing",
    washer: "Washing machine", dryer: "Dryer", dishwasher: "Dishwasher", fridge: "Fridge", oven: "Oven", cooktop: "Cooktop", microwave: "Microwave", kettle: "Kettle", coffee: "Coffee machine", printer_3d: "3D printer", screen: "Screen", network: "Network", ups: "UPS", air_conditioner: "Air conditioner", space_heater: "Heater", dehumidifier: "Dehumidifier", pool_pump: "Pool pump", spa: "Spa", robot: "Robot", lamp: "Lamp", e_strings_count: "Number of strings", e_consumers: "Consumers", e_consumers_count: "Number of consumers", e_fed_by: "Fed by", e_none: "The home", e_pylon: "Draw the grid pylon", e_coupling: "Battery connected to", e_coupling_home: "The home (AC)", e_coupling_inverter: "The inverter (DC, hybrid)", e_appliance: "HA Appliance Card options (YAML)", e_layout: "Layout", e_layout_auto: "Automatic", e_layout_column: "One column", e_layout_columns: "Two columns", e_layout_compact: "Compact",
    e_panel_device: "Electronics under each panel", e_pd_none: "None", e_pd_micro: "Microinverters (no central inverter)", e_pd_optim: "Optimisers (with the inverter)", e_pd_micro_string: "One microinverter per string (2 or 4 panels)", e_battery_reserve_entity: "Reserve from an entity (replaces the value)", e_hide_below: "Hide consumers below (W, empty = show all)", e_type_noac: "Type (drawn as a plug: install HA Appliance Card)",
    auto: "Automatic",
  },
  fr: {
    grid: "Réseau", import: "Import", export: "Export", home: "Maison", solar: "Solaire",
    inverter: "Onduleur", battery: "Batterie", charging: "En charge", discharging: "Décharge",
    idle: "Repos", unavailable: "Indisponible", string: "String", panel: "Panneau",
    ev_charger: "Borne de recharge", heat_pump: "Pompe à chaleur", water_heater: "Ballon d'eau chaude", generic: "Appareil",
    e_general: "Général", e_title: "Titre", e_language: "Langue", e_flow_style: "Style des flux",
    e_arrows: "Flèches", e_dashes: "Tirets", e_animate: "Animer les flux",
    e_dim_inactive: "Estomper les branches sans puissance", e_clickable: "Ouvrir la fiche au clic",
    e_decimals: "Décimales", e_rated_power: "Puissance du flux le plus rapide (W)",
    e_solar_view: "Vue du solaire", e_view_panel: "Panneau par panneau", e_view_string: "String par string",
    e_view_total: "Total", e_panel_peak: "Puissance crête d'un panneau (W)",
    e_grid: "Réseau", e_grid_power: "Puissance réseau signée (+ import, - export)",
    e_invert: "Inverser le signe", e_grid_import: "Ou : puissance importée", e_grid_export: "et puissance exportée",
    e_meter: "Dessin du compteur", e_meter_box: "Compteur numérique", e_meter_linky: "Linky", e_meter_dome: "Compteur à dôme",
    e_name: "Nom", e_solar: "Solaire", e_solar_power: "Puissance solaire totale (facultatif)",
    e_inverter: "Dessiner l'onduleur", e_inverter_power: "Puissance de sortie de l'onduleur (facultatif)",
    e_string: "String {n}", e_string_power: "Puissance de la string (facultatif si les panneaux sont donnés)",
    e_panels: "Panneaux (un capteur de puissance par panneau)",
    e_battery: "Batterie", e_battery_power: "Puissance batterie signée (+ décharge, - charge)",
    e_battery_soc: "Niveau de charge (%)", e_battery_reserve: "Réserve (%)",
    e_home: "Maison", e_home_power: "Puissance de la maison (facultatif, calculée sinon)",
    e_consumer: "Consommateur {n}", e_entity: "Capteur de puissance", e_type: "Dessin",
    washer: "Lave-linge", dryer: "Sèche-linge", dishwasher: "Lave-vaisselle", fridge: "Réfrigérateur", oven: "Four", cooktop: "Plaque de cuisson", microwave: "Micro-ondes", kettle: "Bouilloire", coffee: "Machine à café", printer_3d: "Imprimante 3D", screen: "Écran", network: "Réseau informatique", ups: "Onduleur de secours", air_conditioner: "Climatiseur", space_heater: "Radiateur", dehumidifier: "Déshumidificateur", pool_pump: "Pompe de piscine", spa: "Spa", robot: "Robot", lamp: "Lampe", e_strings_count: "Nombre de strings", e_consumers: "Consommateurs", e_consumers_count: "Nombre de consommateurs", e_fed_by: "Alimenté par", e_none: "La maison", e_pylon: "Dessiner le pylône du réseau", e_coupling: "Batterie reliée à", e_coupling_home: "La maison (AC)", e_coupling_inverter: "L'onduleur (DC, hybride)", e_appliance: "Options HA Appliance Card (YAML)", e_layout: "Disposition", e_layout_auto: "Automatique", e_layout_column: "Une colonne", e_layout_columns: "Deux colonnes", e_layout_compact: "Compacte",
    e_panel_device: "Électronique sous chaque panneau", e_pd_none: "Aucune", e_pd_micro: "Micro-onduleurs (pas d'onduleur central)", e_pd_optim: "Optimiseurs (avec l'onduleur)", e_pd_micro_string: "Un micro-onduleur par string (2 ou 4 panneaux)", e_battery_reserve_entity: "Réserve lue sur une entité (remplace la valeur)", e_hide_below: "Masquer les consommateurs sous (W, vide = tous)", e_type_noac: "Type (dessiné en prise : installez HA Appliance Card)",
    auto: "Automatique",
  },
  de: {
    grid: "Netz", import: "Bezug", export: "Einspeisung", home: "Haus", solar: "Solar",
    inverter: "Wechselrichter", battery: "Batterie", charging: "Lädt", discharging: "Entlädt",
    idle: "Ruhe", unavailable: "Nicht verfügbar", string: "String", panel: "Modul",
    ev_charger: "Wallbox", heat_pump: "Wärmepumpe", water_heater: "Warmwasserspeicher", generic: "Verbraucher",
    e_general: "Allgemein", e_title: "Titel", e_language: "Sprache", e_flow_style: "Flussdarstellung",
    e_arrows: "Pfeile", e_dashes: "Striche", e_animate: "Flüsse animieren",
    e_dim_inactive: "Zweige ohne Leistung abblenden", e_clickable: "Details beim Klick öffnen",
    e_decimals: "Nachkommastellen", e_rated_power: "Leistung für den schnellsten Fluss (W)",
    e_solar_view: "Solaransicht", e_view_panel: "Modul für Modul", e_view_string: "String für String",
    e_view_total: "Gesamt", e_panel_peak: "Spitzenleistung eines Moduls (W)",
    e_grid: "Netz", e_grid_power: "Netzleistung mit Vorzeichen (+ Bezug, - Einspeisung)",
    e_invert: "Vorzeichen umkehren", e_grid_import: "Oder: Bezugsleistung", e_grid_export: "und Einspeiseleistung",
    e_meter: "Zählerzeichnung", e_meter_box: "Digitaler Zähler", e_meter_linky: "Linky", e_meter_dome: "Kuppelzähler",
    e_name: "Name", e_solar: "Solar", e_solar_power: "Gesamte Solarleistung (optional)",
    e_inverter: "Wechselrichter zeichnen", e_inverter_power: "Ausgangsleistung des Wechselrichters (optional)",
    e_string: "String {n}", e_string_power: "Stringleistung (optional, wenn Module angegeben sind)",
    e_panels: "Module (ein Leistungssensor pro Modul)",
    e_battery: "Batterie", e_battery_power: "Batterieleistung mit Vorzeichen (+ Entladen, - Laden)",
    e_battery_soc: "Ladezustand (%)", e_battery_reserve: "Reserve (%)",
    e_home: "Haus", e_home_power: "Hausverbrauch (optional, sonst berechnet)",
    e_consumer: "Verbraucher {n}", e_entity: "Leistungssensor", e_type: "Zeichnung",
    washer: "Waschmaschine", dryer: "Trockner", dishwasher: "Geschirrspüler", fridge: "Kühlschrank", oven: "Backofen", cooktop: "Kochfeld", microwave: "Mikrowelle", kettle: "Wasserkocher", coffee: "Kaffeemaschine", printer_3d: "3D-Drucker", screen: "Bildschirm", network: "Netzwerk", ups: "USV", air_conditioner: "Klimaanlage", space_heater: "Heizlüfter", dehumidifier: "Luftentfeuchter", pool_pump: "Poolpumpe", spa: "Whirlpool", robot: "Roboter", lamp: "Lampe", e_strings_count: "Anzahl der Strings", e_consumers: "Verbraucher", e_consumers_count: "Anzahl der Verbraucher", e_fed_by: "Versorgt von", e_none: "Dem Haus", e_pylon: "Strommast zeichnen", e_coupling: "Batterie verbunden mit", e_coupling_home: "Dem Haus (AC)", e_coupling_inverter: "Dem Wechselrichter (DC, Hybrid)", e_appliance: "Optionen der HA Appliance Card (YAML)", e_layout: "Anordnung", e_layout_auto: "Automatisch", e_layout_column: "Eine Spalte", e_layout_columns: "Zwei Spalten", e_layout_compact: "Kompakt",
    e_panel_device: "Elektronik unter jedem Modul", e_pd_none: "Keine", e_pd_micro: "Mikrowechselrichter (ohne zentralen Wechselrichter)", e_pd_optim: "Optimierer (mit Wechselrichter)", e_pd_micro_string: "Ein Mikrowechselrichter pro String (2 oder 4 Module)", e_battery_reserve_entity: "Reserve aus einer Entität (ersetzt den Wert)", e_hide_below: "Verbraucher ausblenden unter (W, leer = alle)", e_type_noac: "Typ (als Steckdose gezeichnet: HA Appliance Card installieren)",
    auto: "Automatisch",
  },
  es: {
    grid: "Red", import: "Importación", export: "Exportación", home: "Casa", solar: "Solar",
    inverter: "Inversor", battery: "Batería", charging: "Cargando", discharging: "Descargando",
    idle: "Reposo", unavailable: "No disponible", string: "String", panel: "Panel",
    ev_charger: "Cargador VE", heat_pump: "Bomba de calor", water_heater: "Termo", generic: "Aparato",
    e_general: "General", e_title: "Título", e_language: "Idioma", e_flow_style: "Estilo de los flujos",
    e_arrows: "Flechas", e_dashes: "Guiones", e_animate: "Animar los flujos",
    e_dim_inactive: "Atenuar las ramas sin potencia", e_clickable: "Abrir la ficha al hacer clic",
    e_decimals: "Decimales", e_rated_power: "Potencia del flujo más rápido (W)",
    e_solar_view: "Vista solar", e_view_panel: "Panel por panel", e_view_string: "String por string",
    e_view_total: "Total", e_panel_peak: "Potencia pico de un panel (W)",
    e_grid: "Red", e_grid_power: "Potencia de red con signo (+ importación, - exportación)",
    e_invert: "Invertir el signo", e_grid_import: "O: potencia importada", e_grid_export: "y potencia exportada",
    e_meter: "Dibujo del contador", e_meter_box: "Contador digital", e_meter_linky: "Linky", e_meter_dome: "Contador de cúpula",
    e_name: "Nombre", e_solar: "Solar", e_solar_power: "Potencia solar total (opcional)",
    e_inverter: "Dibujar el inversor", e_inverter_power: "Potencia de salida del inversor (opcional)",
    e_string: "String {n}", e_string_power: "Potencia del string (opcional si se indican los paneles)",
    e_panels: "Paneles (un sensor de potencia por panel)",
    e_battery: "Batería", e_battery_power: "Potencia de batería con signo (+ descarga, - carga)",
    e_battery_soc: "Nivel de carga (%)", e_battery_reserve: "Reserva (%)",
    e_home: "Casa", e_home_power: "Potencia de la casa (opcional, calculada si no)",
    e_consumer: "Consumidor {n}", e_entity: "Sensor de potencia", e_type: "Dibujo",
    washer: "Lavadora", dryer: "Secadora", dishwasher: "Lavavajillas", fridge: "Frigorífico", oven: "Horno", cooktop: "Placa de cocina", microwave: "Microondas", kettle: "Hervidor", coffee: "Cafetera", printer_3d: "Impresora 3D", screen: "Pantalla", network: "Red informática", ups: "SAI", air_conditioner: "Aire acondicionado", space_heater: "Calefactor", dehumidifier: "Deshumidificador", pool_pump: "Bomba de piscina", spa: "Spa", robot: "Robot", lamp: "Lámpara", e_strings_count: "Número de strings", e_consumers: "Consumidores", e_consumers_count: "Número de consumidores", e_fed_by: "Alimentado por", e_none: "La casa", e_pylon: "Dibujar la torre eléctrica", e_coupling: "Batería conectada a", e_coupling_home: "La casa (CA)", e_coupling_inverter: "El inversor (CC, híbrido)", e_appliance: "Opciones de HA Appliance Card (YAML)", e_layout: "Disposición", e_layout_auto: "Automática", e_layout_column: "Una columna", e_layout_columns: "Dos columnas", e_layout_compact: "Compacta",
    e_panel_device: "Electrónica bajo cada panel", e_pd_none: "Ninguna", e_pd_micro: "Microinversores (sin inversor central)", e_pd_optim: "Optimizadores (con el inversor)", e_pd_micro_string: "Un microinversor por string (2 o 4 paneles)", e_battery_reserve_entity: "Reserva desde una entidad (sustituye el valor)", e_hide_below: "Ocultar consumidores por debajo de (W, vacío = todos)", e_type_noac: "Tipo (dibujado como enchufe: instale HA Appliance Card)",
    auto: "Automático",
  },
  it: {
    grid: "Rete", import: "Prelievo", export: "Immissione", home: "Casa", solar: "Solare",
    inverter: "Inverter", battery: "Batteria", charging: "In carica", discharging: "In scarica",
    idle: "Riposo", unavailable: "Non disponibile", string: "Stringa", panel: "Pannello",
    ev_charger: "Wallbox", heat_pump: "Pompa di calore", water_heater: "Scaldabagno", generic: "Apparecchio",
    e_general: "Generale", e_title: "Titolo", e_language: "Lingua", e_flow_style: "Stile dei flussi",
    e_arrows: "Frecce", e_dashes: "Trattini", e_animate: "Animare i flussi",
    e_dim_inactive: "Attenuare i rami senza potenza", e_clickable: "Aprire la scheda al clic",
    e_decimals: "Decimali", e_rated_power: "Potenza del flusso più veloce (W)",
    e_solar_view: "Vista solare", e_view_panel: "Pannello per pannello", e_view_string: "Stringa per stringa",
    e_view_total: "Totale", e_panel_peak: "Potenza di picco di un pannello (W)",
    e_grid: "Rete", e_grid_power: "Potenza di rete con segno (+ prelievo, - immissione)",
    e_invert: "Invertire il segno", e_grid_import: "Oppure: potenza prelevata", e_grid_export: "e potenza immessa",
    e_meter: "Disegno del contatore", e_meter_box: "Contatore digitale", e_meter_linky: "Linky", e_meter_dome: "Contatore a cupola",
    e_name: "Nome", e_solar: "Solare", e_solar_power: "Potenza solare totale (facoltativa)",
    e_inverter: "Disegnare l'inverter", e_inverter_power: "Potenza di uscita dell'inverter (facoltativa)",
    e_string: "Stringa {n}", e_string_power: "Potenza della stringa (facoltativa se i pannelli sono indicati)",
    e_panels: "Pannelli (un sensore di potenza per pannello)",
    e_battery: "Batteria", e_battery_power: "Potenza della batteria con segno (+ scarica, - carica)",
    e_battery_soc: "Stato di carica (%)", e_battery_reserve: "Riserva (%)",
    e_home: "Casa", e_home_power: "Potenza della casa (facoltativa, altrimenti calcolata)",
    e_consumer: "Utenza {n}", e_entity: "Sensore di potenza", e_type: "Disegno",
    washer: "Lavatrice", dryer: "Asciugatrice", dishwasher: "Lavastoviglie", fridge: "Frigorifero", oven: "Forno", cooktop: "Piano cottura", microwave: "Microonde", kettle: "Bollitore", coffee: "Macchina da caffè", printer_3d: "Stampante 3D", screen: "Schermo", network: "Rete informatica", ups: "UPS", air_conditioner: "Condizionatore", space_heater: "Stufetta", dehumidifier: "Deumidificatore", pool_pump: "Pompa della piscina", spa: "Spa", robot: "Robot", lamp: "Lampada", e_strings_count: "Numero di stringhe", e_consumers: "Utenze", e_consumers_count: "Numero di utenze", e_fed_by: "Alimentato da", e_none: "La casa", e_pylon: "Disegnare il traliccio", e_coupling: "Batteria collegata a", e_coupling_home: "La casa (CA)", e_coupling_inverter: "L'inverter (CC, ibrido)", e_appliance: "Opzioni di HA Appliance Card (YAML)", e_layout: "Disposizione", e_layout_auto: "Automatica", e_layout_column: "Una colonna", e_layout_columns: "Due colonne", e_layout_compact: "Compatta",
    e_panel_device: "Elettronica sotto ogni pannello", e_pd_none: "Nessuna", e_pd_micro: "Microinverter (senza inverter centrale)", e_pd_optim: "Ottimizzatori (con l'inverter)", e_pd_micro_string: "Un microinverter per stringa (2 o 4 pannelli)", e_battery_reserve_entity: "Riserva da un'entità (sostituisce il valore)", e_hide_below: "Nascondi le utenze sotto (W, vuoto = tutte)", e_type_noac: "Tipo (disegnato come presa: installa HA Appliance Card)",
    auto: "Automatico",
  },
  nl: {
    grid: "Net", import: "Afname", export: "Teruglevering", home: "Huis", solar: "Zon",
    inverter: "Omvormer", battery: "Batterij", charging: "Laden", discharging: "Ontladen",
    idle: "Rust", unavailable: "Niet beschikbaar", string: "String", panel: "Paneel",
    ev_charger: "Laadpaal", heat_pump: "Warmtepomp", water_heater: "Boiler", generic: "Verbruiker",
    e_general: "Algemeen", e_title: "Titel", e_language: "Taal", e_flow_style: "Stijl van de stromen",
    e_arrows: "Pijlen", e_dashes: "Streepjes", e_animate: "Stromen animeren",
    e_dim_inactive: "Takken zonder vermogen dimmen", e_clickable: "Details openen bij klikken",
    e_decimals: "Decimalen", e_rated_power: "Vermogen voor de snelste stroom (W)",
    e_solar_view: "Zonneweergave", e_view_panel: "Paneel per paneel", e_view_string: "String per string",
    e_view_total: "Totaal", e_panel_peak: "Piekvermogen van één paneel (W)",
    e_grid: "Net", e_grid_power: "Netvermogen met teken (+ afname, - teruglevering)",
    e_invert: "Teken omkeren", e_grid_import: "Of: afgenomen vermogen", e_grid_export: "en teruggeleverd vermogen",
    e_meter: "Tekening van de meter", e_meter_box: "Digitale meter", e_meter_linky: "Linky", e_meter_dome: "Koepelmeter",
    e_name: "Naam", e_solar: "Zon", e_solar_power: "Totaal zonnevermogen (optioneel)",
    e_inverter: "Omvormer tekenen", e_inverter_power: "Uitgangsvermogen van de omvormer (optioneel)",
    e_string: "String {n}", e_string_power: "Stringvermogen (optioneel als de panelen zijn opgegeven)",
    e_panels: "Panelen (één vermogenssensor per paneel)",
    e_battery: "Batterij", e_battery_power: "Batterijvermogen met teken (+ ontladen, - laden)",
    e_battery_soc: "Laadtoestand (%)", e_battery_reserve: "Reserve (%)",
    e_home: "Huis", e_home_power: "Huisverbruik (optioneel, anders berekend)",
    e_consumer: "Verbruiker {n}", e_entity: "Vermogenssensor", e_type: "Tekening",
    washer: "Wasmachine", dryer: "Droger", dishwasher: "Vaatwasser", fridge: "Koelkast", oven: "Oven", cooktop: "Kookplaat", microwave: "Magnetron", kettle: "Waterkoker", coffee: "Koffiezetapparaat", printer_3d: "3D-printer", screen: "Scherm", network: "Netwerk", ups: "UPS", air_conditioner: "Airco", space_heater: "Kachel", dehumidifier: "Ontvochtiger", pool_pump: "Zwembadpomp", spa: "Spa", robot: "Robot", lamp: "Lamp", e_strings_count: "Aantal strings", e_consumers: "Verbruikers", e_consumers_count: "Aantal verbruikers", e_fed_by: "Gevoed door", e_none: "Het huis", e_pylon: "Hoogspanningsmast tekenen", e_coupling: "Batterij verbonden met", e_coupling_home: "Het huis (AC)", e_coupling_inverter: "De omvormer (DC, hybride)", e_appliance: "Opties van HA Appliance Card (YAML)", e_layout: "Indeling", e_layout_auto: "Automatisch", e_layout_column: "Eén kolom", e_layout_columns: "Twee kolommen", e_layout_compact: "Compact",
    e_panel_device: "Elektronica onder elk paneel", e_pd_none: "Geen", e_pd_micro: "Micro-omvormers (geen centrale omvormer)", e_pd_optim: "Optimizers (met de omvormer)", e_pd_micro_string: "Eén micro-omvormer per string (2 of 4 panelen)", e_battery_reserve_entity: "Reserve uit een entiteit (vervangt de waarde)", e_hide_below: "Verbruikers verbergen onder (W, leeg = alle)", e_type_noac: "Type (als stekker getekend: installeer HA Appliance Card)",
    auto: "Automatisch",
  },
};

function ieLang(hass, cfg) {
  const want = cfg && cfg.language && cfg.language !== "auto" ? cfg.language : null;
  const fromHass = hass && ((hass.locale && hass.locale.language) || hass.language);
  const code = String(want || fromHass || "en").toLowerCase().slice(0, 2);
  return IE_I18N[code] ? code : "en";
}

function ieT(lang, key, vars) {
  let s = (IE_I18N[lang] && IE_I18N[lang][key]) || IE_I18N.en[key] || key;
  if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, vars[k]);
  return s;
}

// ---- src/02-helpers.js
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

// ---- src/03-flow.js
// The flows: arrowheads marching along a path, faster as the power grows.
//
// A path is described so it can be both drawn and sampled: sampling places
// the arrowheads when the motion is off, the `d` string drives them when on.

const IE_DEG = 180 / Math.PI;

function ieCubic(x0, y0, x1, y1, x2, y2, x3, y3) {
  const at = (t) => {
    const u = 1 - t;
    const b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
    const d0 = 3 * u * u, d1 = 6 * u * t, d2 = 3 * t * t;
    const dx = d0 * (x1 - x0) + d1 * (x2 - x1) + d2 * (x3 - x2);
    const dy = d0 * (y1 - y0) + d1 * (y2 - y1) + d2 * (y3 - y2);
    return { x: b0 * x0 + b1 * x1 + b2 * x2 + b3 * x3, y: b0 * y0 + b1 * y1 + b2 * y2 + b3 * y3, a: Math.atan2(dy, dx) * IE_DEG };
  };
  let len = 0, prev = at(0);
  for (let i = 1; i <= 16; i++) {
    const p = at(i / 16);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  const f = (n) => Math.round(n * 10) / 10;
  return { d: `M ${f(x0)} ${f(y0)} C ${f(x1)} ${f(y1)}, ${f(x2)} ${f(y2)}, ${f(x3)} ${f(y3)}`, len, at };
}

function ieLine(x0, y0, x1, y1) {
  return ieCubic(x0, y0, x0 + (x1 - x0) / 3, y0 + (y1 - y0) / 3, x0 + (2 * (x1 - x0)) / 3, y0 + (2 * (y1 - y0)) / 3, x1, y1);
}

// Several segments end to end, drawn and sampled as one path.
function ieChain(...segs) {
  const total = segs.reduce((a, g) => a + g.len, 0) || 1;
  const d = segs.map((g, i) => (i ? g.d.replace(/^M [^C]+/, "") : g.d)).join(" ");
  const at = (t) => {
    let r = Math.max(0, Math.min(1, t)) * total;
    for (const g of segs) {
      if (r <= g.len || g === segs[segs.length - 1]) return g.at(g.len ? Math.min(1, r / g.len) : 1);
      r -= g.len;
    }
    return segs[0].at(0);
  };
  return { d, len: total, at };
}

// The same path, run the other way: a flow always goes source to destination.
function ieReverse(spec) {
  const m = spec.d.match(/-?[\d.]+/g).map(Number);
  return ieCubic(m[6], m[7], m[4], m[5], m[2], m[3], m[0], m[1]);
}

const IE_CHEVRON = "M -3 -4.2 L 4.6 0 L -3 4.2 Z";

// Travel speed in px/s, from a trickle to the ceiling given.
function ieSpeed(w, ceiling) {
  return 16 + 64 * Math.max(0, Math.min(1, Math.abs(w) / (ceiling || 1)));
}

/* SMIL rather than CSS offset-path: offset-path is not animated by every
   engine a dashboard ends up in, and where it is not the arrowheads freeze.
   The card rebuilds its SVG on each change, which restarts the animations;
   it fast-forwards the fragment to wall-clock time after insertion so the
   phase carries over (see the card's _render). */
function ieFlow(spec, watts, color, ceiling, opts) {
  const o = opts || {};
  let s = `<path class="ie-track" d="${spec.d}"/>`;
  const w = watts === null || watts === undefined ? 0 : Math.abs(watts);
  if (w < 1) return s;
  const speed = ieSpeed(w, ceiling);
  if (o.style === "dashes") {
    const dur = (16 / speed).toFixed(2);
    return s + `<path class="ie-dash" d="${spec.d}" stroke="${color}">${o.animate ? `<animate attributeName="stroke-dashoffset" from="0" to="-16" dur="${dur}s" repeatCount="indefinite"/>` : ""}</path>`;
  }
  const gap = o.gap || 26;
  const n = Math.max(2, Math.round(spec.len / gap));
  const dur = Math.max(0.5, spec.len / speed);
  for (let i = 0; i < n; i++) {
    if (o.animate) {
      s += `<path class="ie-chev" d="${IE_CHEVRON}" fill="${color}"><animateMotion dur="${dur.toFixed(2)}s" repeatCount="indefinite" rotate="auto" begin="${((i * dur) / n).toFixed(3)}s" path="${spec.d}"/></path>`;
    } else {
      const p = spec.at((i + 0.5) / n);
      s += `<path class="ie-chev" d="${IE_CHEVRON}" fill="${color}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(1)})"/>`;
    }
  }
  return s;
}

// ---- src/04-model.js
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
    return { entity, key, name: ieNameOf(x), type, w: ieWatts(hass, entity), appliance: x && typeof x.appliance === "object" ? x.appliance : null, children: kids };
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

// ---- src/05-draw-new.js
// The drawings made for this card: a solar panel, the house, a wall string
// inverter and a smart plug for a generic load. The others come from HA
// Appliance Card (06-vendor-appliance.js).

// Gradients shared by the drawings below, declared once in the flow layer.
const IE_DEFS = `<defs>
<linearGradient id="ie-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34598a"/><stop offset=".55" stop-color="#1d3a62"/><stop offset="1" stop-color="#152a47"/></linearGradient>
<linearGradient id="ie-shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="ie-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dfcb"/><stop offset="1" stop-color="#ddd1b8"/></linearGradient>
<linearGradient id="ie-tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b84d36"/><stop offset="1" stop-color="#cf6648"/></linearGradient>
<linearGradient id="ie-inv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#eef0f2"/><stop offset="1" stop-color="#cdd2d6"/></linearGradient>
</defs>`;

const f1 = (n) => Math.round(n * 10) / 10;

// One panel, portrait: an aluminium frame, the blue glass, six columns of
// cells split across the middle as half-cut panels are. It glows with its own
// output, a light sweep crosses it while it produces, and a shade darkens it
// when it gives much less than the best panel of its string.
function iePanel(x, y, w, h, ratio, shade, key, animate) {
  let cells = "";
  for (let c = 1; c < 6; c++) cells += `M${f1(x + 2 + ((w - 4) * c) / 6)} ${f1(y + 2)} V${f1(y + h - 2)} `;
  for (let r = 1; r < 12; r++) {
    if (r === 6) continue;
    cells += `M${f1(x + 2)} ${f1(y + 2 + ((h - 4) * r) / 12)} H${f1(x + w - 2)} `;
  }
  const glow = Math.max(0, Math.min(1, ratio || 0));
  const clip = `ie-pc-${key}`;
  const sweep = glow > 0.05
    ? `<path d="M${f1(x - 6)} ${f1(y + h)} L${f1(x + 6)} ${f1(y + h)} L${f1(x + w + 6)} ${f1(y)} L${f1(x + w - 6)} ${f1(y)} Z" fill="url(#ie-shine)" opacity="${(0.25 + 0.5 * glow).toFixed(2)}" transform="translate(${animate ? 0 : f1(w * 0.1)} 0)">${animate ? `<animateTransform attributeName="transform" type="translate" from="${f1(-w - 12)} 0" to="${f1(w + 12)} 0" dur="5s" repeatCount="indefinite"/>` : ""}</path>`
    : "";
  const dark = shade > 0.02
    ? `<path d="M${f1(x - 4)} ${f1(y + h * 0.15)} Q${f1(x + w * 0.6)} ${f1(y - 4)} ${f1(x + w + 4)} ${f1(y + h * 0.35)} V${f1(y + h + 2)} H${f1(x - 4)} Z" fill="#0b1520" opacity="${(0.55 * Math.min(1, shade)).toFixed(2)}"/>`
    : "";
  return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="1.6" fill="url(#ie-glass)" stroke="#cfd6dc" stroke-width="1.6"/>
<path d="${cells.trim()}" stroke="#6f8fb5" stroke-opacity=".5" stroke-width=".5"/>
<path d="M${f1(x + 1.5)} ${f1(y + h / 2)} H${f1(x + w - 1.5)}" stroke="#cfd6dc" stroke-width="1.1"/>
<rect x="${f1(x + 1)}" y="${f1(y + 1)}" width="${f1(w - 2)}" height="${f1(h - 2)}" fill="#ffd54f" opacity="${(0.32 * glow).toFixed(2)}"/>
<clipPath id="${clip}"><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/></clipPath>
<g clip-path="url(#${clip})">${sweep}${dark}</g>`;
}

// The house, three quarters on, the same as HA Appliance Card's solar house
// without the panels on its roof. The windows light up with the consumption.
// (cx, by) is the middle of its ground line.
const IE_HOUSE_SCALE = 1.46;
function ieHouse(cx, by, lit) {
  const x = cx - 70, y = by - 146;
  const l = Math.max(0, Math.min(1, lit || 0));
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${IE_HOUSE_SCALE})">
<ellipse cx="52" cy="99" rx="37" ry="3.6" fill="#000" opacity=".18"/>
<rect x="67" y="34" width="7" height="12" fill="#a4553f" stroke="#7d3a29" stroke-width=".6"/><rect x="66" y="32.5" width="9" height="2.5" rx=".5" fill="#7d3a29"/>
<rect x="38" y="64" width="53" height="34" fill="url(#ie-wall)" stroke="#bfb196" stroke-width=".7"/>
<path d="M12 98 V64 L24 47 L37 64 V98 Z" fill="#f6eedf" stroke="#cbbfa6" stroke-width=".7" stroke-linejoin="round"/>
<path d="M9.5 66.5 L24 45 L39 66.5" fill="none" stroke="#8f3d2b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 44 L80 44 L95 66 L39 66 Z" fill="url(#ie-tile)"/>
<path d="M27.2 49.5 H83.8 M30.3 54 H86.8 M33.4 58.5 H89.9 M36.5 63 H93" stroke="#a14430" stroke-width=".6"/>
<path d="M24 44 H80" stroke="#8f3d2b" stroke-width="2.2" stroke-linecap="round"/><path d="M39 66.5 H95" stroke="#8f3d2b" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="24.5" cy="56" r="3" fill="#a9cbe6" stroke="#7d8e9b" stroke-width=".7"/>
<rect x="17" y="72" width="15" height="12" rx="1" fill="#a9cbe6" stroke="#7d8e9b" stroke-width=".8"/><rect class="ie-win" x="17" y="72" width="15" height="12" rx="1" fill="#ffd36b" opacity="${(0.12 + 0.7 * l).toFixed(2)}"/><path d="M24.5 72 V84 M17 78 H32" stroke="#7d8e9b" stroke-width=".7"/>
<rect x="44" y="77" width="10" height="21" rx="1" fill="#8d6e63" stroke="#6d5249" stroke-width=".6"/><circle cx="52" cy="88" r=".8" fill="#e0c36a"/>
<rect x="60" y="72" width="14" height="12" rx="1" fill="#a9cbe6" stroke="#7d8e9b" stroke-width=".8"/><rect class="ie-win" x="60" y="72" width="14" height="12" rx="1" fill="#ffd36b" opacity="${(0.08 + 0.75 * l).toFixed(2)}"/><path d="M67 72 V84 M60 78 H74" stroke="#7d8e9b" stroke-width=".7"/>
<rect x="79" y="74" width="9" height="12" rx="1.2" fill="#f2f2ef" stroke="#8f979e" stroke-width=".7"/><rect x="80.4" y="75.6" width="6.2" height="2.6" rx=".5" fill="#27303a"/><path d="M83.9 79.4 L82.4 82 H83.6 L83.1 83.8 L84.8 81.4 H83.6 Z" fill="#f9a825"/>
</g>`;
}

// A wall string inverter: current ones (Fronius GEN24, Huawei SUN2000...) are
// a near square white box with status LEDs and no screen, cooling fins on the
// side and cable glands underneath. Drawn generic, no brand. (cx, cy) centre.
function ieInverter(cx, cy, on, animate) {
  const x = cx - 30, y = cy - 30;
  const led = on ? "#43e07a" : "#55606a";
  return `<g transform="translate(${f1(x)} ${f1(y)})">
<ellipse cx="31" cy="64" rx="24" ry="2.6" fill="#000" opacity=".16"/>
<rect x="4" y="2" width="56" height="58" rx="5" fill="#9aa3ab"/>
<rect x="0" y="0" width="54" height="58" rx="5" fill="url(#ie-inv)" stroke="rgba(0,0,0,.18)" stroke-width=".8"/>
<rect x="0" y="0" width="54" height="13" rx="5" fill="#3a4148"/><rect x="0" y="8" width="54" height="5" fill="#3a4148"/>
<path d="M56 8 V52 M58 9 V51" stroke="#7d868e" stroke-width=".9"/>
<rect x="9" y="22" width="36" height="5" rx="2.5" fill="#22272c"/>
<circle class="ie-led" cx="16" cy="24.5" r="1.4" fill="${led}">${on && animate ? `<animate attributeName="opacity" values="1;.35;1" dur="2.6s" repeatCount="indefinite"/>` : ""}</circle>
<circle cx="23" cy="24.5" r="1.4" fill="#55606a"/><circle cx="30" cy="24.5" r="1.4" fill="${on ? "#2fa6ff" : "#55606a"}"/>
<path d="M10 40 H44 M10 44 H44 M10 48 H44" stroke="rgba(0,0,0,.08)" stroke-width="1"/>
<rect x="12" y="58" width="5" height="5" fill="#2b3137"/><rect x="21" y="58" width="5" height="5" fill="#2b3137"/><rect x="34" y="58" width="5" height="5" fill="#2b3137"/>
</g>`;
}

// A smart plug in a wall socket, for a load without a drawing of its own: a
// round plug with its ring LED, lit while the load draws power.
function iePlugHtml(on) {
  return `<div class="machine ie-plug${on ? " on" : ""}"><svg class="ie-e" viewBox="0 0 96 108">
<ellipse cx="48" cy="100" rx="26" ry="3" fill="#000" opacity=".14"/>
<rect x="20" y="22" width="56" height="56" rx="12" fill="#f4f5f6" stroke="#c4cad0" stroke-width="1"/>
<circle cx="48" cy="50" r="20" fill="#e3e6e9" stroke="#b8bfc6" stroke-width=".8"/>
<rect x="31" y="34" width="34" height="40" rx="9" fill="#ffffff" stroke="#c9ced3" stroke-width="1"/>
<rect x="33" y="36" width="30" height="8" rx="4" fill="#fff" opacity=".7"/>
<circle class="ie-plug-ring" cx="48" cy="56" r="6.5" fill="none" stroke-width="2"/>
<path d="M48 51 V56" stroke="#9aa3ab" stroke-width="1.6" stroke-linecap="round"/>
<path d="M44.8 52.6 A4.6 4.6 0 1 0 51.2 52.6" fill="none" stroke="#9aa3ab" stroke-width="1.4" stroke-linecap="round"/>
<path d="M48 74 C48 86 60 88 60 98" fill="none" stroke="#3a4148" stroke-width="2.4" stroke-linecap="round"/>
</svg></div>`;
}

// A lattice transmission pylon: two legs tapering up, braced in X, two cross
// arms with their hanging insulators and the lines running off to the left,
// a few trees at its foot. Where the grid comes from.
function iePylonHtml(on) {
  // The legs run from (28, 98) and (68, 98) up to (46, 14) and (50, 14).
  const lx = (y) => 28 + (98 - y) * (18 / 84), rx = (y) => 68 - (98 - y) * (18 / 84);
  const ys = [98, 82, 66, 52, 40];
  let brace = "";
  for (let i = 0; i < ys.length - 1; i++) {
    const a = ys[i], b = ys[i + 1];
    brace += `M${f1(lx(a))} ${a} L${f1(rx(b))} ${b} M${f1(rx(a))} ${a} L${f1(lx(b))} ${b} M${f1(lx(b))} ${b} H${f1(rx(b))} `;
  }
  const ins = (x, y) => `<path d="M${x} ${y} V${y + 6}" stroke="#8a949c" stroke-width="1.2"/><path d="M${x - 1.6} ${y + 1.5} H${x + 1.6} M${x - 1.6} ${y + 3} H${x + 1.6} M${x - 1.6} ${y + 4.5} H${x + 1.6}" stroke="#c7cfd5" stroke-width=".9"/>`;
  const tree = (x, s) => `<path d="M${x} ${98} V${98 - 6 * s}" stroke="#6d4c41" stroke-width="${1.2 * s}"/><path d="M${x} ${98 - 22 * s} L${x - 7 * s} ${98 - 6 * s} H${x + 7 * s} Z" fill="#4f8a5b"/><path d="M${x} ${98 - 26 * s} L${x - 5 * s} ${98 - 13 * s} H${x + 5 * s} Z" fill="#5e9e69"/>`;
  return `<div class="machine ie-pylon${on ? " on" : ""}"><svg class="ie-e" viewBox="0 0 96 108">
<ellipse cx="48" cy="99" rx="34" ry="2.6" fill="#000" opacity=".14"/>
<path d="M28 98 L46 14 M68 98 L50 14 M46 14 H50" stroke="#7d868e" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
<path d="${brace.trim()}" stroke="#9aa3ab" stroke-width=".8" fill="none"/>
<path d="M30 40 H66 M36 26 H60" stroke="#7d868e" stroke-width="1.6"/>
${ins(32, 40)}${ins(64, 40)}${ins(38, 26)}${ins(58, 26)}
<path class="ie-wire-l" d="M-14 52 Q12 42 32 46 M-14 58 Q30 50 64 46 M-14 38 Q16 30 38 32" stroke="#56606a" stroke-width=".7" fill="none"/>
<path d="M48 8 V14" stroke="#7d868e" stroke-width="1.2"/><circle cx="48" cy="8" r="1.2" fill="#e53935"/>
${tree(14, 0.9)}${tree(22, 0.65)}${tree(82, 0.8)}
</svg></div>`;
}

// A microinverter, under its panel: a small dark box with cooling ribs, its
// status LED and the AC cable leaving it. One per panel, as Enphase, Hoymiles
// or APsystems fit them. An optimiser (Tigo, SolarEdge) is the same small box,
// narrower and without a LED, the central inverter doing the rest.
function ieMicro(cx, y, on, animate, optimizer, width) {
  if (optimizer) {
    const w = 14, h = 9, x = cx - w / 2;
    return `<g class="ie-optim"><rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="1.6" fill="#3a4148" stroke="#1b2025" stroke-width=".6"/><path d="M${f1(x + 3)} ${f1(y + 4.5)} H${f1(x + w - 3)}" stroke="#596370" stroke-width=".8"/></g>`;
  }
  const w = width || 18, h = 10, x = cx - w / 2;
  return `<g class="ie-micro"><rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="2" fill="#2e353c" stroke="#1b2025" stroke-width=".6"/>
<path d="M${f1(x + 3)} ${f1(y + 3)} H${f1(x + w - 6)} M${f1(x + 3)} ${f1(y + 5)} H${f1(x + w - 6)} M${f1(x + 3)} ${f1(y + 7)} H${f1(x + w - 6)}" stroke="#4a535c" stroke-width=".7"/>
<circle cx="${f1(x + w - 3)}" cy="${f1(y + h / 2)}" r="1.2" fill="${on ? "#43e07a" : "#55606a"}">${on && animate ? `<animate attributeName="opacity" values="1;.4;1" dur="2.2s" repeatCount="indefinite"/>` : ""}</circle></g>`;
}

// ---- src/06-vendor-appliance.js
// Drawings copied from HA Appliance Card (ADNPolymerase/ha-appliance-card, v4.38.0,
// MIT, same author): the wall battery, the EV charger, the heat pump, the water
// heater and the electricity meters. Copied as built, each in its own factory,
// so a later version can be pasted over without touching the rest of the card.
// Change them there first, then copy them here again.

const shdBlur = (id, b) => `<filter id="${id}" x="-40%" y="-200%" width="180%" height="500%"><feGaussianBlur stdDeviation="${b}"/></filter>`;
const IE_BATTERY_LAYOUTS = ["wall", "station"];

function ieDrawBattery() {
const BATTERY_LAYOUTS = IE_BATTERY_LAYOUTS;
const softShadow = (cx, cy, rx, ry, op = .26, b = 1.6) => { const id = `shd-${cx}-${cy}-${rx}`.replace(/\./g, "_"); return `${shdBlur(id, b)}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}" filter="url(#${id})"/>`; };
const ENERGY_CSS = `
        svg.en-e{position:absolute;left:0;top:0;width:96px;height:108px;overflow:visible}
        .en-sun,.en-moon,.en-stars,.en-clouds{display:none}
        .en-sky-day .en-sun,.en-sky-low .en-sun{display:block}
        .en-sky-low .en-clouds{display:block}
        .en-sky-night .en-moon,.en-sky-night .en-stars{display:block}
        .en-rays{transform-box:fill-box;transform-origin:center;animation:en-spin 12s linear infinite}
        .en-sky-low .en-rays{animation:none;opacity:.5}
        .en-cloud{animation:en-drift 6s ease-in-out infinite}
        .en-cloud.en-c2{--d0:-3s}
        .en-stars circle{fill:#f5d76e;animation:en-twinkle 2.4s ease-in-out infinite}
        .en-stars circle:nth-child(2){--d0:-.8s}
        .en-stars circle:nth-child(3){--d0:-1.6s}
        .en-shine{opacity:0;animation:en-shine 4s ease-in-out infinite}
        .sol-m-day .en-shine{opacity:.55}
        .sol-m-low .en-shine{opacity:.25;animation-duration:7s}
        .en-wire{fill:none;stroke:#2b3137;stroke-width:1.4}
        .sol-ef{fill:none;stroke:#ffca28;stroke-width:1.8;stroke-dasharray:2.4 3.6;stroke-linecap:round;opacity:0}
        .sol-m-day .sol-ef{opacity:1;animation:en-flow .6s linear infinite}
        .sol-m-low .sol-ef{opacity:1;animation:en-flow 1.6s linear infinite}
        .sol-led{fill:#5a636b}
        .sol-m-day .sol-led,.sol-m-low .sol-led{fill:#2ecc71}
        .sol-m-error .sol-led{fill:#f44336;animation:en-blink 1s steps(1) infinite}
        .machine.sol-m-unav,.machine.bat-m-unav{opacity:.45;filter:grayscale(1)}
        .bat-lvl{fill:#43a047}
        .bat-m-discharging .bat-lvl{fill:#fb8c00}
        .bat-low .bat-lvl{fill:#f44336}
        .bat-m-error .bat-lvl{fill:#9aa1a8}
        .bat-m-unav .bat-lvl{fill:none}
        .bat-sweep{opacity:0}
        .bat-m-charging .bat-sweep{opacity:1;animation:en-sweep 2.2s ease-in-out infinite}
        .bat-reserve{stroke:#ffb300}
        .bat-bf{fill:none;stroke-width:2;stroke-dasharray:3 4;stroke-linecap:round;opacity:0}
        .bat-m-charging .bat-bf.bat-in{opacity:1;stroke:#43a047;animation:en-flow .7s linear infinite}
        .bat-m-discharging .bat-bf.bat-out{opacity:1;stroke:#ff9800;animation:en-flow .7s linear infinite}
        .bat-led{fill:#5a636b}
        .bat-m-charging .bat-led{fill:#43a047;animation:en-breathe 1.6s ease-in-out infinite}
        .bat-m-discharging .bat-led{fill:#ff9800}
        .bat-m-idle .bat-led,.bat-m-full .bat-led{fill:#43a047}
        .bat-m-error .bat-led{fill:#f44336;animation:en-blink 1s steps(1) infinite}
        .bat-lcd{font:700 10px/1 Roboto,Arial,sans-serif;fill:#7fe3ff;text-anchor:middle}
        .bat-m-charging .bat-lcd,.bat-m-full .bat-lcd{fill:#9cf09a}
        .bat-m-discharging .bat-lcd{fill:#ffcc80}
        .bat-low .bat-lcd{fill:#ff8a80}
        .bat-bolt{display:none}
        .bat-m-charging .bat-bolt{display:block;animation:en-breathe 1.6s ease-in-out infinite}
        .en-smoke,.en-ang{display:none}
        .sol-m-error .en-smoke,.sol-m-error .en-ang,.bat-m-error .en-smoke,.bat-m-error .en-ang{display:block}
        .en-smoke .en-pf{transform-box:fill-box;transform-origin:50% 100%;animation:en-puff 2s ease-out infinite}
        .en-smoke .en-pf2{--d0:-1s}
        .en-smoke .en-o{fill:#111417}
        .en-smoke .en-f{fill:#6b737b}
        .en-ang path{fill:none;stroke:#e53935;stroke-width:1.9;stroke-linecap:round}
        .en-ang{transform-box:fill-box;transform-origin:center;animation:en-angp .7s ease-in-out infinite alternate}
        @keyframes en-spin{to{transform:rotate(360deg)}}
        @keyframes en-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}
        @keyframes en-twinkle{0%,100%{opacity:.25}50%{opacity:1}}
        @keyframes en-shine{0%{transform:translateX(-70px)}60%,100%{transform:translateX(90px)}}
        @keyframes en-flow{to{stroke-dashoffset:-14}}
        @keyframes en-blink{50%{opacity:.15}}
        @keyframes en-breathe{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes en-sweep{from{transform:translateY(0)}to{transform:translateY(-40px)}}
        @keyframes en-puff{0%{transform:translateY(5px) scale(.45);opacity:0}20%{opacity:1}75%{opacity:1}100%{transform:translateY(-7px) scale(1.08);opacity:0}}
        @keyframes en-angp{from{transform:scale(.8)}to{transform:scale(1.15)}}
        .machine.en * { animation-delay: calc(var(--d0, 0s) + var(--anim-offset, 0s)) !important; }
        @media (prefers-reduced-motion: reduce) { .machine.en * { animation-name: none !important; } }
`;

// The drawings of the panels and the battery, built once: only their classes
// change with what they do, and the battery's level and reserve.
const ENERGY_SMOKE = (x, y, k) => {
  const C = [[13, 23, 5.5], [20, 18, 6.5], [27, 22, 5], [17, 12, 4.5], [24, 11, 4]];
  const puff = (c, dx, dy, kk) => `<g class="en-pf ${c}">${C.map(([cx, cy, r]) => `<circle class="en-o" cx="${(cx * kk + dx).toFixed(1)}" cy="${(cy * kk + dy).toFixed(1)}" r="${(r * kk + 1.4).toFixed(1)}"/>`).join("")}${C.map(([cx, cy, r]) => `<circle class="en-f" cx="${(cx * kk + dx).toFixed(1)}" cy="${(cy * kk + dy).toFixed(1)}" r="${(r * kk).toFixed(1)}"/>`).join("")}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${k})"><g class="en-smoke">${puff("en-pf1", 0, 0, 1)}${puff("en-pf2", -2, 2, 0.85)}</g></g>`;
};
const ENERGY_ANGER = (x, y) => `<g transform="translate(${x} ${y})"><g class="en-ang"><path d="M3.5 1.5 Q3.5 4 1 4"/><path d="M6 1.5 Q6 4 8.5 4"/><path d="M3.5 9.5 Q3.5 7 1 7"/><path d="M6 9.5 Q6 7 8.5 7"/></g></g>`;
// The battery's drawing, with its level and its reserve drawn in.
function batterySvg(layout, level, reserve) {
  const pct = level === null || level === undefined ? null : Math.max(0, Math.min(100, level));
  const res = reserve === null || reserve === undefined ? null : Math.max(0, Math.min(100, reserve));
  const shown = pct === null ? "--" : `${Math.round(pct)}%`;
  if (layout === "station") {
    // A portable station: its metal top with its handles, its screen with the
    // percentage and a bar, its sockets and its wheels.
    const bw = 24;
    const fw = pct === null ? 0 : Math.round(pct / 100 * bw * 10) / 10;
    const rx = res === null ? null : Math.round((36 + res / 100 * bw) * 10) / 10;
    const sock = (x) => `<circle cx="${x}" cy="80" r="3.6" fill="#1a1e22" stroke="#59626a" stroke-width=".6"/><rect x="${x - 1.9}" y="79.3" width="1" height="2.2" rx=".4" fill="#7b848c"/><rect x="${x + 0.9}" y="79.3" width="1" height="2.2" rx=".4" fill="#7b848c"/>`;
    return `<svg class="en-e" viewBox="0 0 96 108">
<defs><linearGradient id="en-sb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--ac-body-hi,#e6e6e6)"/><stop offset=".45" style="stop-color:var(--ac-body,#d7d7d7)"/><stop offset="1" style="stop-color:var(--ac-body-lo,#aeb2b5)"/></linearGradient>
<linearGradient id="en-st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8c0c7"/><stop offset="1" stop-color="#8f989f"/></linearGradient></defs>
${softShadow(48, 98.4, 30.4, 3.4, 0.29)}
<rect x="12" y="37" width="72" height="10" rx="4" fill="url(#en-st)" stroke="#7c858c" stroke-width=".6"/>
<rect x="19" y="39.5" width="20" height="4" rx="2" fill="#2a2f34"/><rect x="57" y="39.5" width="20" height="4" rx="2" fill="#2a2f34"/>
<rect x="12" y="44" width="72" height="50" rx="5" fill="url(#en-sb)" stroke="rgba(0,0,0,.3)" stroke-width=".7"/>
<rect x="16" y="48" width="64" height="42" rx="3" fill="rgba(0,0,0,.06)" stroke="rgba(0,0,0,.2)" stroke-width=".7"/>
<rect x="32" y="51" width="32" height="18" rx="2.5" fill="#0c1014"/>
<text class="bat-lcd" x="51.5" y="61.5">${shown}</text>
<path class="bat-bolt" d="M36.6 53.6 L34.6 57.2 H36.2 L35.7 60 L37.8 56.4 H36.2 Z" fill="#43a047"/>
<rect x="36" y="64" width="${bw}" height="2.6" rx="1.3" fill="#2a3036"/><rect class="bat-lvl" x="36" y="64" width="${fw}" height="2.6" rx="1.3"/>
${rx === null ? "" : `<path class="bat-reserve" d="M${rx} 62.6 V68" stroke-width="1"/>`}
${sock(26)}${sock(36)}${sock(60)}${sock(70)}
<rect x="44" y="77.5" width="3" height="5" rx=".6" fill="#1a1e22"/><rect x="49" y="77.5" width="3" height="5" rx=".6" fill="#1a1e22"/>
<circle cx="22" cy="58" r="2.4" fill="#22272b" stroke="#5c656d" stroke-width=".6"/><circle class="bat-led" cx="22" cy="58" r="1"/>
<rect x="15" y="93" width="9" height="4" rx="1" fill="#1d2125"/><circle cx="74" cy="94.5" r="4" fill="#1d2125"/><circle cx="74" cy="94.5" r="1.5" fill="#5c656d"/>
<path class="en-wire" d="M-4 88 H12"/><path class="en-wire" d="M84 88 H100"/>
<path class="bat-bf bat-in" d="M-4 88 H12"/><path class="bat-bf bat-out" d="M84 88 H100"/>
${ENERGY_SMOKE(52, 12, 0.55)}${ENERGY_ANGER(80, 33)}</svg>`;
  }
  // A block on the wall, seen three quarters on, with its screen and a tall
  // gauge that fills from the bottom inside its window.
  const gx = 38, gy = 37, gw = 14, gh = 50, inner = gh - 2;
  const fh = pct === null ? 0 : Math.round(pct / 100 * inner * 10) / 10;
  const fy = Math.round((gy + 1 + inner - fh) * 10) / 10;
  const ry = res === null ? null : Math.round((gy + 1 + inner - res / 100 * inner) * 10) / 10;
  let ticks = "";
  for (let k = 1; k < 10; k++) ticks += `M${gx + 2} ${Math.round((gy + 1 + inner * k / 10) * 10) / 10} H${gx + gw - 2} `;
  return `<svg class="en-e" viewBox="0 0 96 108">
<defs><linearGradient id="en-wf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--ac-body-hi,#e6e6e6)"/><stop offset=".45" style="stop-color:var(--ac-body,#d7d7d7)"/><stop offset="1" style="stop-color:var(--ac-body-lo,#aeb2b5)"/></linearGradient>
<linearGradient id="en-lv" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<linearGradient id="en-sw" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="en-gclip"><rect x="${gx + 1}" y="${gy + 1}" width="${gw - 2}" height="${inner}" rx="4"/></clipPath></defs>
${softShadow(49, 99.9, 24.0, 3.2, 0.27)}
<rect x="32" y="15" width="37" height="83" rx="7" style="fill:var(--ac-body-lo,#aeb2b5)"/><rect x="32" y="15" width="37" height="83" rx="7" fill="rgba(0,0,0,.16)"/>
<rect x="28" y="12" width="35" height="84" rx="7" fill="url(#en-wf)" stroke="rgba(0,0,0,.18)" stroke-width=".8"/>
<rect x="32" y="17" width="27" height="15" rx="3.5" fill="#12171c"/>
<text class="bat-lcd" x="48.5" y="28">${shown}</text>
<path class="bat-bolt" d="M35.6 20 L33.6 24 H35.3 L34.8 28.6 L37.3 23.6 H35.6 Z" fill="#43a047"/>
<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="5" fill="#e1e6ea" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>
<g clip-path="url(#en-gclip)">
<rect class="bat-lvl" x="${gx + 1}" y="${fy}" width="${gw - 2}" height="${fh}"/>
<rect x="${gx + 1}" y="${gy + 1}" width="${gw - 2}" height="${inner}" fill="url(#en-lv)"/>
<rect class="bat-sweep" x="${gx + 1}" y="${gy + 1 + inner - 14}" width="${gw - 2}" height="14" fill="url(#en-sw)"/>
<path d="${ticks.trim()}" stroke="#fff" stroke-opacity=".55" stroke-width=".6"/>
</g>
${ry === null ? "" : `<path class="bat-reserve" d="M${gx - 2.5} ${ry} H${gx + gw + 2.5}" stroke-dasharray="1.6 1.2" stroke-width="1.1"/>`}
<circle class="bat-led" cx="45.5" cy="91.5" r="1.3"/>
<path class="en-wire" d="M-4 100 H34 V96"/><path class="en-wire" d="M57 96 V100 H100"/>
<path class="bat-bf bat-in" d="M-4 100 H34 V96"/><path class="bat-bf bat-out" d="M57 96 V100 H100"/>
${ENERGY_SMOKE(50, -2, 0.55)}${ENERGY_ANGER(61, 7)}</svg>`;
}

function batteryHtml(cls, b) {
  const layout = BATTERY_LAYOUTS.includes(b.layout) ? b.layout : "wall";
  const mode = b.mode || "idle";
  return `
        <div class="machine ${cls} en bat bat-l-${layout} bat-m-${mode}${b.low ? " bat-low" : ""}">${batterySvg(layout, b.level, b.reserve)}</div>`;
}


return {
draw: (cls, ctx) => batteryHtml(cls, ctx.battery || {}),
css: () => ENERGY_CSS,
};
}

function ieDrawEv() {
const EV_FLOW_DEFAULT = 0.6;
// The parts of the CCS plug, as the CSS above lays them out.
const EV_PLUG_PARTS = '<i class="pl-boot"></i><i class="pl-grip"></i><i class="pl-collar"></i><i class="pl-head"></i>'
  + '<i class="pl-ac"></i><i class="pl-dc"></i><i class="pl-latch"></i>';


return {
draw: (cls, ctx) => {
    const e = ctx.ev || {};
    const shot = e.shot ? ` ${e.shot} from-${e.from}` : "";
    const since = e.shot ? `; --ev-since: ${e.since}s` : "";
    return `
        <div class="machine ${cls} mode-${e.mode || "unknown"}${e.plugged ? " plugged" : ""}${shot}" style="--ev-flow: ${e.flow || EV_FLOW_DEFAULT}s${since}">
          <svg class="ev-halo" viewBox="0 0 96 108" aria-hidden="true"><path class="eh-loop" d="M42 69 C42 104 69 104 69 57"/><path class="eh-out" d="M42 69 C42 96 50 102 70 102"/></svg>
          <svg class="ev-cable" viewBox="0 0 96 108" aria-hidden="true"><path class="ev-loop" d="M42 69 C42 104 69 104 69 57"/><path class="ev-out" d="M42 69 C42 96 50 102 70 102"/><g class="ev-energy"><path class="ev-live" d="M42 69 C42 96 50 102 70 102"/><path class="ev-flow" d="M42 69 C42 96 50 102 70 102"/></g></svg>
          <div class="ev-box"><div class="ev-face"><div class="ev-led"></div>
            <svg class="ev-bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 15H6L13 1V9H18L11 23V15Z"/></svg>
          </div></div>
          <div class="ev-plug">${EV_PLUG_PARTS}</div>
          <div class="ev-ghost">${EV_PLUG_PARTS}</div>
          <div class="ev-holster"></div>
        </div>`;
  },
css: (color) => `
        .ev-box {
          position: absolute; left: 20px; width: 44px; top: 4px; height: 66px; border-radius: 10px;
          background: linear-gradient(160deg, var(--ac-body-hi, #ffffff), var(--ac-body, #eef0f1) 50%, var(--ac-body-lo, #c9ced2));
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14);
        }
        .ev-face {
          position: absolute; left: 6px; right: 6px; top: 7px; bottom: 10px; border-radius: 7px;
          background: linear-gradient(180deg, #30353b, #16191d); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.4);
        }
        .ev-led {
          position: absolute; left: 50%; top: 6px; width: 18px; height: 3px; margin-left: -9px; border-radius: 2px;
          background: ${color}; box-shadow: 0 0 4px ${color}, 0 0 9px ${color};
        }
        .machine.mode-offline .ev-led, .machine.mode-unknown .ev-led { background: #4a5057; box-shadow: none; }
        /* The bolt is the box's sign: large on the face and in the state's
           colour, like the light, so the state reads from across the room. */
        .ev-bolt {
          position: absolute; left: 50%; top: 15px; width: 24px; height: 30px; margin-left: -12px;
          fill: ${color}; filter: drop-shadow(0 0 2px ${color}) drop-shadow(0 0 5px ${color});
        }
        .machine.mode-offline .ev-bolt, .machine.mode-unknown .ev-bolt { fill: #4a5057; filter: none; }
        .ev-holster {
          position: absolute; left: 61px; top: 27px; width: 16px; height: 16px; border-radius: 3px 6px 6px 3px;
          background: linear-gradient(160deg, var(--ac-body-hi, #ffffff), var(--ac-body, #eef0f1) 50%, var(--ac-body-lo, #c9ced2));
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14);
        }
        /* A CCS plug, drawn lying down with the cable on the left: the strain
           relief, the grip, a collar in the colour of the box, and the taller
           head, its Type 2 part above the two DC pins and the release latch
           on top. It turns about the point where the cable enters it: head up
           into the holster, head first into the car. */
        .ev-plug { position: absolute; left: 69px; top: 51px; width: 26px; height: 12px; transform-origin: 0 6px; transform: rotate(-90deg); }
        .ev-plug > i { position: absolute; display: block; }
        .pl-boot {
          left: 0; top: 3px; width: 6px; height: 6px; clip-path: polygon(0 25%, 100% 0, 100% 100%, 0 75%);
          background: linear-gradient(180deg, #4a5056, #2b2f34);
        }
        .pl-grip {
          left: 5px; top: 2.5px; width: 10px; height: 7px; border-radius: 3px;
          background: linear-gradient(180deg, #5b6168, #3a3f45 45%, #24282c);
        }
        .pl-collar {
          left: 14.5px; top: 1px; width: 2px; height: 10px; border-radius: 1px; box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.3);
          background: linear-gradient(180deg, var(--ac-body-hi, #ffffff), var(--ac-body, #eef0f1) 50%, var(--ac-body-lo, #c9ced2));
        }
        .pl-head {
          left: 16px; top: 0.5px; width: 9px; height: 11px; border-radius: 2px 3px 3px 2px;
          background: linear-gradient(180deg, #50565c, #2f3439 50%, #1d2125);
        }
        .pl-ac, .pl-dc { left: 24.5px; width: 1.5px; background: #15181b; }
        .pl-ac { top: 1.2px; height: 5.6px; border-radius: 0 2px 2px 0; }
        .pl-dc { top: 7.6px; height: 3.2px; border-radius: 0 1.5px 1.5px 0; }
        .pl-latch { left: 18px; top: -0.5px; width: 4px; height: 1.5px; border-radius: 1px 1px 0 0; background: #5f656c; }
        .ev-cable { position: absolute; left: 0; top: 0; width: 96px; height: 108px; overflow: visible; }
        .ev-cable path { fill: none; stroke: #3b4048; stroke-width: 3.5; stroke-linecap: round; }
        .ev-cable .ev-out, .ev-cable .ev-live, .machine.plugged .ev-cable .ev-loop { display: none; }
        .machine.plugged .ev-cable .ev-out { display: inline; }
        .ev-cable .ev-live { stroke: ${color}; stroke-width: 2.4; }
        .machine.plugged.mode-charging .ev-cable .ev-live { display: inline; }
        /* While it charges, the energy runs down the cable from the box to the
           car: light dashes on the coloured core, the path drawn in that order,
           a lap of the dashes the faster the more power goes through. */
        .ev-cable .ev-flow { display: none; stroke: rgba(255, 255, 255, 0.9); stroke-width: 1.6; stroke-dasharray: 3 7; }
        .machine.plugged.mode-charging .ev-cable .ev-flow {
          display: inline; animation: ev-flow var(--ev-flow, 0.6s) linear infinite; animation-delay: var(--anim-offset, 0s);
        }
        @keyframes ev-flow { to { stroke-dashoffset: -10; } }
        /* Paused, the energy stands still on the cable, in the pause's colour
           and without the halo: nothing flows. */
        .machine.plugged.mode-paused .ev-cable .ev-live, .machine.plugged.mode-paused .ev-cable .ev-flow { display: inline; }
                .machine.mode-paused .ev-cable .ev-flow { opacity: 0.6; }
        /* A fault turns the whole cable red, in its holster or at the car. */
        .machine.mode-error .ev-cable .ev-loop, .machine.mode-error .ev-cable .ev-out {
          stroke: ${color};
        }
        /* The glow is a blurred copy of the cable in an svg of its own, under
           it: WebKit (Safari and the Home Assistant apps) blurs an svg but not
           a path inside one, so a filter on the cable's own paths shows
           nowhere there. It lights while charging, and on a fault. */
        .ev-halo { position: absolute; left: 0; top: 0; width: 96px; height: 108px; overflow: visible; filter: blur(1.5px); }
        .ev-halo path { display: none; fill: none; stroke: ${color}; stroke-width: 3.5; stroke-linecap: round; }
        .machine.plugged.mode-charging .ev-halo .eh-out, .machine.plugged.mode-error .ev-halo .eh-out,
        .machine.mode-error:not(.plugged) .ev-halo .eh-loop { display: inline; }
        /* Discharging, the energy runs the other way, from the car to the box,
           at the pace of the power given back, and the halo turns into a glow
           along the whole cable, wider and lighter than the state's colour,
           that shimmers. */
        .machine.plugged.mode-discharging .ev-cable .ev-live { display: inline; }
        .machine.plugged.mode-discharging .ev-cable .ev-flow {
          display: inline; animation: ev-flow var(--ev-flow, 0.6s) linear infinite reverse; animation-delay: var(--anim-offset, 0s);
        }
        .machine.plugged.mode-discharging .ev-halo { filter: blur(2px); }
        .machine.plugged.mode-discharging .ev-halo .eh-out {
          display: inline; stroke: #a886df; stroke: color-mix(in srgb, ${color} 70%, #ffffff); stroke-width: 9;
          animation: ev-shimmer 1.3s linear infinite; animation-delay: var(--anim-offset, 0s);
        }
        @keyframes ev-shimmer { 0%, 31%, 64%, 100% { opacity: 1; } 23% { opacity: 0.7; } 57% { opacity: 0.8; } 86% { opacity: 0.75; } }
        @media (prefers-reduced-motion: reduce) {
          .machine.plugged.mode-charging .ev-cable .ev-flow { animation-play-state: paused; }
          .ev-led, .ev-cable path, .ev-energy, .ev-halo, .ev-halo path, .ev-plug, .ev-ghost {
            animation-duration: 0.001ms !important; animation-iteration-count: 1 !important;
          }
        }
        .machine.plugged .ev-plug { left: 70px; top: 96px; transform: none; }
        /* The light speaks as a real box's does: it breathes while the car
           charges, and slowly while it waits for its start time; it blinks
           for a card at the reader, and faster on a fault. */
        .machine.mode-charging .ev-led { animation: ev-breathe 2.6s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-discharging .ev-led { animation: ev-breathe 2.6s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-scheduled .ev-led { animation: ev-breathe 4.8s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-awaiting_auth .ev-led { animation: ev-blink 1.4s linear infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-error .ev-led { animation: ev-blink 0.8s linear infinite; animation-delay: var(--anim-offset, 0s); }
        @keyframes ev-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ev-blink { 0%, 40% { opacity: 1; } 50%, 90% { opacity: 0.15; } 100% { opacity: 1; } }
        /* What happens while the card is open plays once, from the moment it
           happened: the plug pulled down out of its holster and riding the
           cable out to the car, then clicking in; back the other way, the
           cable winding in to the box and the plug pushed up into its holster;
           at the end of a charge, the light flashing and the energy fading. */
        .ev-ghost {
          display: none; position: absolute; left: 69px; top: 51px; width: 26px; height: 12px;
          transform-origin: 0 6px; transform: rotate(-90deg);
        }
        .ev-ghost > i { position: absolute; display: block; }
        .machine.plug-in .ev-ghost, .machine.plug-in .ev-plug, .machine.plug-in .ev-loop, .machine.plug-in .ev-out, .machine.plug-in .ev-energy, .machine.plug-in .ev-halo,
        .machine.plug-out .ev-ghost, .machine.plug-out .ev-plug, .machine.plug-out .ev-cable path,
        .machine.just-done .ev-led, .machine.just-done .ev-cable path, .machine.just-done .ev-halo { --anim-offset: var(--ev-since, 0s); }
        .machine.plug-in .ev-ghost { display: block; animation: ev-pull 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.plug-in .ev-cable .ev-loop { display: inline; animation: ev-fade 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.plug-in .ev-cable .ev-out { stroke-dasharray: 80; animation: ev-run-out 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.plug-in .ev-plug { animation: ev-ride-in 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        /* A car that charges as soon as it is plugged in gets its energy once
           the cable has reached it. */
        .machine.plug-in .ev-energy, .machine.plug-in .ev-halo { animation: ev-reach 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.plug-out .ev-ghost {
          display: block; left: 70px; top: 96px; transform: none;
          animation: ev-ride-back 0.9s linear both; animation-delay: var(--anim-offset, 0s);
        }
        .machine.plug-out .ev-cable .ev-out { display: inline; stroke-dasharray: 80; animation: ev-wind-in 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.plug-out .ev-cable .ev-loop { stroke-dasharray: 80; animation: ev-coil 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.plug-out .ev-plug { animation: ev-stow 0.9s linear both; animation-delay: var(--anim-offset, 0s); }
        .machine.just-done .ev-led { animation: ev-done 1.4s ease-out both; animation-delay: var(--anim-offset, 0s); }
        .machine.just-done.plugged .ev-cable .ev-live { display: inline; animation: ev-drain 1.4s ease-in both; animation-delay: var(--anim-offset, 0s); }
        .machine.just-done.plugged .ev-cable .ev-flow {
          display: inline; animation: ev-flow var(--ev-flow, 0.6s) linear infinite, ev-drain 1.4s ease-in both; animation-delay: var(--anim-offset, 0s);
        }
        /* The halo fades with them after a charge; out of a pause, where it was
           not lit, it stays out. */
        .machine.just-done.from-charging.plugged .ev-halo .eh-out { display: inline; animation: ev-drain 1.4s ease-in both; animation-delay: var(--anim-offset, 0s); }
        @keyframes ev-pull { 0% { opacity: 1; transform: rotate(-90deg); } 12%, 100% { opacity: 0; transform: translateY(6px) rotate(-90deg); } }
        @keyframes ev-fade { 0% { opacity: 1; } 12%, 100% { opacity: 0; } }
        @keyframes ev-drain { from { opacity: 1; } to { opacity: 0; } }
        @keyframes ev-reach { 0%, 80% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ev-run-out {
          0%, 12% { stroke-dashoffset: 80; } 19% { stroke-dashoffset: 69.43; } 26% { stroke-dashoffset: 60.18; } 33% { stroke-dashoffset: 52.22; } 40% { stroke-dashoffset: 45.51; } 47% { stroke-dashoffset: 40.03; } 54% { stroke-dashoffset: 35.71; } 61% { stroke-dashoffset: 32.52; } 68% { stroke-dashoffset: 30.39; } 75% { stroke-dashoffset: 29.23; } 82% { stroke-dashoffset: 28.91; } 100% { stroke-dashoffset: 0; }
        }
        /* The plug's pose along the cable, worked out from the curve the
           cable is drawn with, so that it stays on the tip of the line. */
        @keyframes ev-ride-in {
          0%, 12% { opacity: 0; transform: translate(-28px, -32.98px) rotate(89.99deg); }
          19% { opacity: 1; transform: translate(-27.47px, -22.44px) rotate(83.45deg); }
          26% { transform: translate(-25.55px, -13.42px) rotate(70.71deg); }
          33% { transform: translate(-21.65px, -6.54px) rotate(48.07deg); }
          40% { transform: translate(-16.27px, -2.61px) rotate(24.87deg); }
          47% { transform: translate(-11.05px, -0.93px) rotate(11.87deg); }
          54% { transform: translate(-6.79px, -0.3px) rotate(5.62deg); }
          61% { transform: translate(-3.61px, -0.07px) rotate(2.5deg); }
          68% { transform: translate(-1.48px, -0.01px) rotate(0.91deg); }
          75% { transform: translate(-0.31px, 0px) rotate(0.18deg); }
          82% { transform: translate(0px, 0px) rotate(0deg); }
          90% { transform: translate(1.5px, 0px) rotate(0deg); }
          100% { opacity: 1; transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes ev-ride-back {
          0% { opacity: 1; transform: translate(0px, 0px) rotate(0deg); }
          5.6% { transform: translate(-1.59px, -0.01px) rotate(0.99deg); }
          11.3% { transform: translate(-6.38px, -0.26px) rotate(5.16deg); }
          16.9% { transform: translate(-14.19px, -1.78px) rotate(18.77deg); }
          22.5% { transform: translate(-23.02px, -8.3px) rotate(55.69deg); }
          28.1% { transform: translate(-26.92px, -18.69px) rotate(79.44deg); }
          33.8% { opacity: 1; transform: translate(-27.83px, -26.61px) rotate(86.66deg); }
          39.4% { transform: translate(-27.99px, -31.39px) rotate(89.29deg); }
          45%, 100% { opacity: 0; transform: translate(-28px, -32.98px) rotate(89.99deg); }
        }
        @keyframes ev-wind-in {
          0% { stroke-dashoffset: 28.91; } 5.6% { stroke-dashoffset: 30.5; } 11.3% { stroke-dashoffset: 35.29; } 16.9% { stroke-dashoffset: 43.28; } 22.5% { stroke-dashoffset: 54.45; } 28.1% { stroke-dashoffset: 65.63; } 33.8% { stroke-dashoffset: 73.61; } 39.4% { stroke-dashoffset: 78.4; } 45%, 100% { stroke-dashoffset: 80; }
        }
        @keyframes ev-coil {
          0%, 40% { stroke-dashoffset: 80; animation-timing-function: ease-out; }
          85%, 100% { stroke-dashoffset: 0; }
        }
        @keyframes ev-stow {
          0%, 55% { opacity: 0; transform: translateY(9px) rotate(-90deg); animation-timing-function: ease-out; }
          85% { opacity: 1; transform: translateY(-1px) rotate(-90deg); }
          100% { opacity: 1; transform: rotate(-90deg); }
        }
        @keyframes ev-done {
          0%, 36%, 72%, 100% { box-shadow: 0 0 4px ${color}, 0 0 9px ${color}; filter: none; }
          18%, 54% { box-shadow: 0 0 6px ${color}, 0 0 20px ${color}; filter: brightness(1.7); }
        }
  `,
};
}

function ieDrawHeatPump() {


return {
draw: (cls, ctx) => {
    const mode = ctx.hpMode || "idle";
    // The fan turns whenever the pump works; it stops to defrost, as the real
    // one does while it melts the ice off its coil.
    const fan = ["space_heating", "hot_water", "cooling", "running"].includes(mode) && !ctx.compressorOff;
    // Water runs while the pump works a circuit: down the flow pipe and back
    // up the return, to the tank for hot water and to the emitter otherwise.
    const flowing = ["space_heating", "hot_water", "cooling"].includes(mode) && !ctx.compressorOff;
    const lcd = ctx.display ? `<div class="hp-lcd">${esc(ctx.display)}</div>` : "";
    const pipes = (circuit) => `<div class="hp-pipe ${circuit} flow"></div><div class="hp-pipe ${circuit} ret"></div>`;
    // A pump that heats no domestic hot water has no tank to draw, and what
    // takes its heat is a radiator or the floor.
    const tank = ctx.noTank ? "" : `
          ${pipes("tank")}
          <div class="hp-tank"><i></i></div>`;
    const emitter = ctx.underfloor
      ? `<div class="hp-floor"><i></i><i></i><i></i><div class="hp-slab"><div class="hp-coil"><b></b><b></b><b></b></div></div></div>`
      : `<div class="hp-rad"><i></i><i></i><i></i><i></i><i></i></div>`;
    return `
        <div class="machine ${cls} mode-${mode} ${fan ? "fan" : ""} ${flowing ? "flowing" : ""} ${ctx.noTank ? "no-tank" : ""} ${ctx.underfloor ? "underfloor" : ""}">
          <div class="hp-unit">
            <div class="hp-grille"><div class="hp-fan"></div><div class="hp-hub"></div><div class="hp-guard"></div><div class="hp-frost"></div></div>
            <div class="hp-side">${lcd}<div class="hp-fins"></div></div>
          </div>
          <div class="hp-foot f1"></div><div class="hp-foot f2"></div>${tank}
          ${pipes("rad")}
          ${emitter}
        </div>`;
  },
css: () => `
        .hp-unit {
          position: absolute; left: 2px; right: 2px; top: 4px; height: 60px; border-radius: 5px;
          background: linear-gradient(160deg, var(--ac-body-hi, #e6e6e6), var(--ac-body, var(--secondary-background-color, #d7d7d7)) 45%, var(--ac-body-lo, #aeb2b5));
          border: 1px solid var(--divider-color, #c7c7c7);
        }
        .hp-grille {
          position: absolute; left: 5px; top: 5px; width: 48px; height: 48px; border-radius: 50%;
          background: #14161a; overflow: hidden; box-shadow: 0 0 0 2px var(--ac-body-lo, #aeb2b5);
        }
        .hp-fan {
          position: absolute; inset: 5px; border-radius: 50%;
          background: conic-gradient(#6b737c 0 16%, transparent 16% 33.3%, #6b737c 33.3% 49.3%, transparent 49.3% 66.6%, #6b737c 66.6% 82.6%, transparent 82.6%);
        }
        .hp-hub { position: absolute; left: 50%; top: 50%; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; border-radius: 50%; background: #8a9096; }
        .hp-guard { position: absolute; inset: 0; border-radius: 50%; background: repeating-radial-gradient(circle, transparent 0 5px, rgba(255, 255, 255, 0.14) 5px 6px); }
        .hp-frost { position: absolute; inset: 0; border-radius: 50%; opacity: 0; background: radial-gradient(circle, rgba(225, 245, 254, 0.15) 35%, rgba(225, 245, 254, 0.9) 100%); }
        .hp-side { position: absolute; left: 58px; right: 4px; top: 5px; bottom: 5px; }
        .hp-lcd {
          position: absolute; left: 0; right: 0; top: 0; height: 10px; border-radius: 2px;
          background: #14161a; color: #4fc3f7; text-align: center; font: 600 7px/10px ui-monospace, "SF Mono", monospace;
        }
        .hp-fins { position: absolute; left: 0; right: 0; top: 14px; bottom: 0; background: repeating-linear-gradient(180deg, var(--ac-body-lo, #aeb2b5) 0 1px, transparent 1px 4px); }
        .hp-foot { position: absolute; top: 65px; width: 10px; height: 4px; border-radius: 0 0 2px 2px; background: #3b4048; }
        .hp-foot.f1 { left: 6px; }
        .hp-foot.f2 { right: 6px; }
        /* Two pipes a circuit, the flow and the return. */
        .hp-pipe { position: absolute; top: 66px; width: 3px; height: 14px; background: #8a9096; overflow: hidden; }
        .hp-pipe.tank.flow { left: 20px; }
        .hp-pipe.tank.ret { left: 25px; }
        .hp-pipe.rad.flow { left: 62px; }
        .hp-pipe.rad.ret { left: 67px; }
        .hp-tank {
          position: absolute; left: 12px; top: 78px; width: 24px; height: 28px; border-radius: 8px / 5px; overflow: hidden;
          background: linear-gradient(90deg, var(--ac-body-lo, #aeb2b5), var(--ac-body, var(--secondary-background-color, #d7d7d7)) 35%, var(--ac-body-hi, #e6e6e6) 55%, var(--ac-body-lo, #aeb2b5));
          border: 1px solid var(--divider-color, #c7c7c7);
        }
        .hp-tank i { position: absolute; left: 0; right: 0; bottom: 0; height: 0; background: linear-gradient(180deg, rgba(255, 87, 51, 0.75), rgba(255, 138, 60, 0.45)); }
        .hp-rad { position: absolute; left: 58px; right: 2px; top: 80px; height: 26px; }
        .hp-rad i {
          position: absolute; top: 0; bottom: 0; width: 5px; border-radius: 2px;
          background: var(--ac-body-lo, #aeb2b5); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
        }
        .hp-rad i:nth-child(1) { left: 0; }
        .hp-rad i:nth-child(2) { left: 7px; }
        .hp-rad i:nth-child(3) { left: 14px; }
        .hp-rad i:nth-child(4) { left: 21px; }
        .hp-rad i:nth-child(5) { left: 28px; }
        /* Underfloor heating as its symbol draws it (mdi:heating-coil): a pipe
           snaking across a slab seen from above at an angle, and the heat
           rising off it. The coil is drawn flat in a square and laid down at
           the slab's angle, so its runs lean exactly like the slab's edges. */
        .hp-floor { position: absolute; left: 56px; right: 2px; top: 78px; height: 28px; }
        .hp-slab { position: absolute; left: -2px; right: -2px; bottom: 2px; height: 15px; }
        .hp-coil {
          position: absolute; left: 50%; top: 50%; width: 30px; height: 30px; margin: -15px 0 0 -15px;
          background: var(--ac-body-lo, #9aa0a6); transform: scaleY(0.357) rotate(45deg);
        }
        /* Four runs and three bends, one bend a box: its two long borders are
           two runs, and its rounded side the bend between them. */
        .hp-coil b {
          position: absolute; left: 3px; right: 3px; height: 10px; box-sizing: border-box;
          border: 3px solid #6b737c; border-left: 0; border-radius: 0 5px 5px 0;
        }
        .hp-coil b:nth-child(1) { top: 2px; }
        .hp-coil b:nth-child(2) { top: 9px; border-left: 3px solid #6b737c; border-right: 0; border-radius: 5px 0 0 5px; }
        .hp-coil b:nth-child(3) { top: 16px; }
        .hp-floor i {
          position: absolute; bottom: 17px; width: 6px; height: 13px; opacity: 0;
          background: linear-gradient(180deg, rgba(255, 183, 77, 0), rgba(255, 138, 60, 0.95));
          clip-path: polygon(63% 0%, 79% 7%, 90% 14%, 93% 21%, 86% 29%, 73% 36%, 56% 43%, 42% 50%, 34% 57%, 35% 64%, 44% 71%, 60% 79%, 76% 86%, 88% 93%, 93% 100%, 67% 100%, 62% 93%, 50% 86%, 34% 79%, 18% 71%, 9% 64%, 8% 57%, 16% 50%, 30% 43%, 47% 36%, 60% 29%, 67% 21%, 64% 14%, 53% 7%, 37% 0%);
        }
        .hp-floor i:nth-child(1) { left: 9px; }
        .hp-floor i:nth-child(2) { left: 19px; height: 16px; }
        .hp-floor i:nth-child(3) { left: 29px; height: 11px; }
        .machine.mode-space_heating .hp-floor i { animation: hp-rise 2.6s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-space_heating .hp-floor i:nth-child(2) { animation-delay: calc(-0.87s + var(--anim-offset, 0s)); }
        .machine.mode-space_heating .hp-floor i:nth-child(3) { animation-delay: calc(-1.74s + var(--anim-offset, 0s)); }
        @keyframes hp-rise {
          0% { opacity: 0; transform: translateY(5px) scaleY(0.75); }
          35% { opacity: 0.85; }
          100% { opacity: 0; transform: translateY(-9px) scaleY(1.1); }
        }
        /* The pipes drop onto the near edge of the slab. */
        .machine.underfloor .hp-pipe.rad.flow { left: 54px; height: 30px; }
        .machine.underfloor .hp-pipe.rad.ret { left: 59px; height: 28px; }
        /* With no tank on the left, what is left stands in the middle. */
        .machine.no-tank .hp-pipe.rad.flow { left: 35px; }
        .machine.no-tank .hp-pipe.rad.ret { left: 40px; }
        .machine.no-tank .hp-rad { left: 31px; right: 29px; }
        .machine.no-tank .hp-floor { left: 31px; right: 27px; }
        .machine.no-tank.underfloor .hp-pipe.rad.flow { left: 29px; }
        .machine.no-tank.underfloor .hp-pipe.rad.ret { left: 34px; }
        .machine.fan .hp-fan { animation: hp-spin 1.1s linear infinite; animation-delay: var(--anim-offset, 0s); }
        @keyframes hp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .machine.mode-space_heating .hp-lcd,
        .machine.mode-hot_water .hp-lcd { color: #ff7043; }
        /* Out hot and back cooler while it heats, out cold and back warmer
           while it cools: the two colours say which way the heat goes. */
        .machine.mode-space_heating .hp-pipe.rad.flow { background: #ff7043; }
        .machine.mode-space_heating .hp-pipe.rad.ret,
        .machine.mode-hot_water .hp-pipe.tank.ret { background: #4fc3f7; }
        .machine.mode-space_heating .hp-rad i { background: linear-gradient(180deg, #ffab91, #ff7043); animation: hp-glow 1.6s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-hot_water .hp-pipe.tank.flow { background: #ef5350; }
        .machine.mode-hot_water .hp-tank i { height: 100%; animation: hp-glow 1.6s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-space_heating .hp-coil { background: #ffe0d6; }
        .machine.mode-space_heating .hp-coil b { border-color: #ff7043; }
        .machine.mode-cooling .hp-pipe.rad.flow { background: #29b6f6; }
        .machine.mode-cooling .hp-pipe.rad.ret { background: #ff8a65; }
        .machine.mode-cooling .hp-rad i { background: linear-gradient(180deg, #b3e5fc, #29b6f6); }
        .machine.mode-cooling .hp-coil { background: #d8f1fd; }
        .machine.mode-cooling .hp-coil b { border-color: #29b6f6; }
        /* The water itself: light dashes running down the flow pipe and back
           up the return, on the circuit the pump is working. */
        .machine.flowing.mode-hot_water .hp-pipe.tank::after,
        .machine.flowing.mode-space_heating .hp-pipe.rad::after,
        .machine.flowing.mode-cooling .hp-pipe.rad::after {
          content: ""; position: absolute; inset: 0;
          background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0 2px, transparent 2px 6px);
          animation: hp-flow 0.8s linear infinite; animation-delay: var(--anim-offset, 0s);
        }
        .machine.flowing .hp-pipe.ret::after { animation-direction: reverse; }
        @keyframes hp-flow { from { background-position: 0 0; } to { background-position: 0 6px; } }
        @keyframes hp-glow { 0%, 100% { filter: brightness(0.9); } 50% { filter: brightness(1.15); } }
        .machine.mode-defrost .hp-frost { animation: hp-frost 2.4s ease-in-out infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.mode-defrost .hp-fins { background: repeating-linear-gradient(180deg, #b3e5fc 0 1px, transparent 1px 4px); }
        @keyframes hp-frost { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }
  `,
};
}

function ieDrawWaterHeater() {


return {
draw: (cls, ctx) => {
    // Hot water sits on top of a real tank, so the warm layer grows down from
    // the dome as the water heats: 15 degrees is a cold tank, 65 a full one.
    const hot = ctx.tankTemp === null || ctx.tankTemp === undefined
      ? 0 : Math.max(0, Math.min(1, (ctx.tankTemp - 15) / 50));
    const lcd = ctx.display ? `<div class="wh-lcd">${esc(ctx.display)}</div>` : "";
    return `
        <div class="machine ${cls}" style="--wh-hot: ${hot.toFixed(2)}">
          <div class="wh-bracket"></div>
          <div class="wh-tank">
            <div class="wh-glass">
              <div class="wh-water"></div>
              <div class="wh-hot"></div>
              <div class="wh-heat"><i class="wh-h1"></i><i class="wh-h2"></i><i class="wh-h3"></i></div>
              <div class="wh-coil"></div>
            </div>
          </div>
          ${lcd}
          <div class="wh-pipe cold"></div>
          <div class="wh-pipe hot"></div>
        </div>`;
  },
css: () => `
        .wh-bracket { position: absolute; left: 40px; right: 40px; top: 1px; height: 5px; border-radius: 2px; background: #3b4048; }
        .wh-tank {
          position: absolute; left: 23px; right: 23px; top: 4px; bottom: 15px;
          border-radius: 25px / 14px; overflow: hidden;
          background: linear-gradient(90deg, var(--ac-body-lo, #aeb2b5), var(--ac-body, var(--secondary-background-color, #d7d7d7)) 30%,
            var(--ac-body-hi, #e6e6e6) 50%, var(--ac-body, var(--secondary-background-color, #d7d7d7)) 72%, var(--ac-body-lo, #aeb2b5));
          border: 1px solid var(--divider-color, #c7c7c7);
        }
        .wh-glass {
          position: absolute; left: 8px; right: 8px; top: 13px; bottom: 10px; border-radius: 7px; overflow: hidden;
          background: rgba(20, 24, 30, 0.10); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.14);
        }
        .wh-water { position: absolute; inset: 0; background: rgba(79, 195, 247, 0.38); }
        .wh-hot {
          position: absolute; left: 0; right: 0; top: 0; height: calc(var(--wh-hot, 0) * 100%);
          background: linear-gradient(180deg, rgba(255, 87, 51, 0.72), rgba(255, 138, 60, 0.42));
          transition: height 1s ease;
        }
        .wh-lcd {
          position: absolute; left: 50%; transform: translateX(-50%); top: 22px; z-index: 3;
          height: 11px; min-width: 22px; padding: 0 3px; border-radius: 2px;
          background: #14161a; color: #4fc3f7; text-align: center;
          font: 600 7px/11px ui-monospace, "SF Mono", monospace;
        }
        .machine.heating .wh-lcd { color: #ff7043; }
        /* The element: a hairpin at the foot of the tank, where a real one sits.
           border-box, or the borders push it off the tank's axis. */
        .wh-coil {
          position: absolute; left: 50%; bottom: -3px; z-index: 2;
          box-sizing: border-box; width: 18px; height: 19px; margin-left: -9px;
          border: 3px solid #5f6770; border-bottom: none; border-radius: 7px 7px 0 0;
        }
        .machine.heating .wh-coil {
          border-color: #ff3d00;
          animation: wh-glow 1.2s ease-in-out infinite; animation-delay: var(--anim-offset, 0s);
        }
        @keyframes wh-glow {
          0%, 100% { box-shadow: 0 0 5px 1px rgba(255, 61, 0, 0.55), inset 0 0 3px rgba(255, 61, 0, 0.5); }
          50% { box-shadow: 0 0 10px 3px rgba(255, 61, 0, 0.9), inset 0 0 5px rgba(255, 61, 0, 0.8); }
        }
        .wh-heat { position: absolute; inset: 0; z-index: 1; opacity: 0; pointer-events: none; }
        .machine.heating .wh-heat { opacity: 1; }
        .wh-heat i {
          position: absolute; bottom: 6px; width: 11px; height: 32px; margin-left: -5.5px; opacity: 0;
          background: linear-gradient(180deg, rgba(255, 112, 67, 0), rgba(255, 112, 67, 0.85) 45%, rgba(255, 61, 0, 0.95));
          clip-path: polygon(63% 0%, 79% 7%, 90% 14%, 93% 21%, 86% 29%, 73% 36%, 56% 43%, 42% 50%, 34% 57%, 35% 64%, 44% 71%, 60% 79%, 76% 86%, 88% 93%, 93% 100%, 67% 100%, 62% 93%, 50% 86%, 34% 79%, 18% 71%, 9% 64%, 8% 57%, 16% 50%, 30% 43%, 47% 36%, 60% 29%, 67% 21%, 64% 14%, 53% 7%, 37% 0%);
        }
        .wh-heat i.wh-h1 { left: 22%; }
        .wh-heat i.wh-h2 { left: 50%; }
        .wh-heat i.wh-h3 { left: 78%; }
        .machine.heating .wh-heat i { animation: wh-rise 2.4s ease-in infinite; animation-delay: var(--anim-offset, 0s); }
        .machine.heating .wh-heat i.wh-h2 { animation-delay: calc(-0.8s + var(--anim-offset, 0s)); }
        .machine.heating .wh-heat i.wh-h3 { animation-delay: calc(-1.6s + var(--anim-offset, 0s)); }
        @keyframes wh-rise {
          0% { transform: translateY(6px); opacity: 0; }
          25% { opacity: 0.9; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        .wh-pipe { position: absolute; bottom: 3px; width: 4px; height: 14px; border-radius: 0 0 2px 2px; }
        .wh-pipe.cold { left: 37px; background: #5aa9d6; }
        .wh-pipe.hot { right: 37px; background: #d9674a; }
  `,
};
}

function ieDrawMeter() {
const softShadow = (cx, cy, rx, ry, op = .26, b = 1.6) => { const id = `shd-${cx}-${cy}-${rx}`.replace(/\./g, "_"); return `${shdBlur(id, b)}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}" filter="url(#${id})"/>`; };
let ntN = 0;
const ntId = () => `nt${++ntN}`;
const NT_FONT = `font-family="Roboto, 'Segoe UI', Helvetica, Arial, sans-serif"`;
const ntV = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const ntBlur = (id, s) => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
const ntShadow = (cx, cy, rx) => softShadow(cx, cy - .6, +(rx * .8).toFixed(1), 4, .26);
const ntLcd = (x, y, w, h, text, lit, color = "#4fc3f7", fs = 8.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.8" fill="#141a21" stroke="#0a0d11" stroke-width=".5"/>` +
  `<rect x="${x + .8}" y="${y + .8}" width="${w - 1.6}" height="${(h * .38).toFixed(2)}" rx="1.2" fill="#fff" opacity=".05"/>` +
  (text ? `<text x="${x + w / 2}" y="${(y + h / 2 + fs * .36).toFixed(2)}" font-size="${fs}" font-weight="700" text-anchor="middle" fill="${lit ? color : "#5d6773"}" ${NT_FONT}>${esc(text)}</text>` : "");
const ntFit = (text, width, fs) => Math.min(fs, (width - 3) / Math.max(1, String(text || "").length * .6));
const ntCable = (x0, n) => Array.from({ length: n }, (_, i) => `<path d="M${x0 + i * 8} 108 V122" stroke="${i % 2 ? "#1565c0" : "#5d4037"}" stroke-width="3"/>`).join("");
function ntPulse(c) { return c.exp ? "#00e676" : "#ff1744"; }
function ntExportArrow(x, y) {
  return `<path d="M${x} ${y} l3.6 -2.6 v1.6 h4 v2 h-4 v1.6 Z" fill="#2e7d32"/>`;
}
function ntLinky(c) {
  const b = ntId(), cv = ntId(), sc = ntId(), sh = ntId();
  const val = c.lcd || "";
  return `<defs>${ntV(b, "#d9e36a", "#bccb3d")}${ntV(cv, "#c3d03f", "#a4b22c")}${ntV(sc, "#c7d1b8", "#a8b598")}<filter id="${sh}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8"/></filter></defs>
<rect x="33.6" y="8" width="56" height="106" rx="8" fill="#000" opacity=".22" filter="url(#${sh})"/>
<rect x="32" y="6" width="56" height="106" rx="8" fill="url(#${b})" stroke="#9aa82a" stroke-width=".6"/>
<path d="M36 10 H50" stroke="#fff" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>
<rect x="37" y="14" width="46" height="28" rx="2.4" fill="#5a6347"/>
<rect x="39" y="16" width="42" height="24" rx="1.4" fill="url(#${sc})"/>
<text x="41.5" y="23.4" font-size="6" font-weight="700" fill="#1f2a18" ${NT_FONT}>${esc(c.label || "")}</text>
${c.tariff ? `<text x="78.5" y="23.4" font-size="4.6" text-anchor="end" fill="#1f2a18" ${NT_FONT}>${esc(c.tariff)}</text>` : ""}
<text x="60" y="35.4" font-size="${ntFit(val, 42, 10).toFixed(1)}" font-weight="700" text-anchor="middle" fill="#1f2a18" ${NT_FONT}>${esc(val)}</text>
<circle cx="45" cy="50" r="3.6" fill="#eef3c7" stroke="#8c9a24" stroke-width=".6"/><path d="M43.2 50h3.6M45 48.2v3.6" stroke="#4b5320" stroke-width=".7"/>
<circle cx="56" cy="50" r="3.6" fill="#eef3c7" stroke="#8c9a24" stroke-width=".6"/><path d="M54.2 50h3.6" stroke="#4b5320" stroke-width=".7"/>
<circle cx="74" cy="50" r="2.4" fill="${c.exp ? "#0d3d1a" : "#5d1010"}"/>${c.unav || c.still ? "" : `<circle class="${c.heavy ? "nta-blinkfast" : "nta-blink"}" cx="74" cy="50" r="2.4" fill="${ntPulse(c)}"/>`}${c.exp ? ntExportArrow(62.4, 50) : ""}
<text x="74" y="57.4" font-size="3.6" text-anchor="middle" fill="#4b5320" ${NT_FONT}>1 Wh</text>
<path d="M32 62 H88" stroke="#8c9a24" stroke-width=".7"/>
<rect x="34" y="64" width="52" height="40" rx="4" fill="url(#${cv})"/>
<text x="60" y="84" font-size="11" font-weight="700" font-style="italic" text-anchor="middle" fill="#ffffff" ${NT_FONT}>linky</text>
<path d="M45 87.4 Q60 92 76 86" stroke="#ffffff" stroke-width="1.1" fill="none" stroke-linecap="round"/>
<circle cx="38.6" cy="68.4" r="1.4" fill="#8c9a24"/><circle cx="81.4" cy="68.4" r="1.4" fill="#8c9a24"/>
<path d="M81.4 69.8 q2 6 -1 10" stroke="#1565c0" stroke-width=".5" fill="none"/><rect x="78.8" y="79.4" width="3.6" height="2.4" rx=".5" fill="#1565c0"/>
<path d="M48 112 V122" stroke="#5d4037" stroke-width="3"/><path d="M56 112 V122" stroke="#1565c0" stroke-width="3"/><path d="M64 112 V122" stroke="#5d4037" stroke-width="3"/><path d="M72 112 V122" stroke="#1565c0" stroke-width="3"/>`;
}
function ntMeterBox(c) {
  const b = ntId(), sh = ntId();
  return `<defs>${ntV(b, "#f5f7f9", "#d3d9df")}${ntBlur(sh, 2.2)}</defs>
<rect x="31.6" y="9.4" width="60" height="98" rx="6" fill="#000" opacity=".2" filter="url(#${sh})"/>
<rect x="30" y="8" width="60" height="98" rx="6" fill="url(#${b})" stroke="#a7b0b9" stroke-width=".7"/>
<path d="M34 12 H52" stroke="#fff" stroke-width="1.4" opacity=".7" stroke-linecap="round"/>
<rect x="35" y="15" width="50" height="30" rx="2.6" fill="#3c4550"/>
${ntLcd(37, 17, 46, 17, c.lcd, !c.unav, "#9be7ff", ntFit(c.lcd, 46, 10))}
${c.today ? `<text x="60" y="41.4" font-size="${ntFit(c.today, 44, 5).toFixed(1)}" text-anchor="middle" fill="#c8d2dc" ${NT_FONT}>${esc(c.today)}</text>` : ""}
<circle cx="42" cy="54" r="2.4" fill="${c.exp ? "#0d3d1a" : "#4a1010"}"/>${c.unav || c.still ? "" : `<circle class="${c.heavy ? "nta-blinkfast" : "nta-blink"}" cx="42" cy="54" r="2.4" fill="${ntPulse(c)}"/>`}${c.exp ? ntExportArrow(47.4, 54) : ""}
<text x="42" y="61" font-size="3.4" text-anchor="middle" fill="#5d6773" ${NT_FONT}>imp/kWh</text>
<rect x="64" y="51" width="8" height="5" rx="2.5" fill="#9aa4ae"/><rect x="75" y="51" width="8" height="5" rx="2.5" fill="#9aa4ae"/>
<rect x="38" y="66" width="44" height="24" rx="2" fill="#e9edf0" stroke="#b9c1c9" stroke-width=".5"/>
<text x="42" y="74" font-size="4.6" font-weight="700" fill="#37414b" ${NT_FONT}>kWh</text>
<text x="42" y="80" font-size="3" fill="#6b7580" ${NT_FONT}>230 V  50 Hz  5(60) A</text>
${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${55 + i * 2.1}" y="83" width="${i % 3 ? .9 : 1.5}" height="5" fill="#37414b"/>`).join("")}
<rect x="34" y="94" width="52" height="12" rx="3" fill="#c7ced5" stroke="#a7b0b9" stroke-width=".5"/>
${ntCable(48, 4)}`;
}
function ntMeterDome(c) {
  const box = ntId(), gl = ntId(), sh = ntId(), rim = ntId();
  return `<defs>${ntV(box, "#c9d0d6", "#9aa4ad")}${ntV(rim, "#eef1f3", "#a9b2ba")}${ntBlur(sh, 2.2)}
<radialGradient id="${gl}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".75"/><stop offset=".5" stop-color="#dbeaf3" stop-opacity=".25"/><stop offset="1" stop-color="#9fb8c8" stop-opacity=".4"/></radialGradient></defs>
<rect x="27.6" y="13.4" width="68" height="94" rx="8" fill="#000" opacity=".2" filter="url(#${sh})"/>
<rect x="26" y="12" width="68" height="94" rx="8" fill="url(#${box})" stroke="#8a949d" stroke-width=".7"/>
<circle cx="60" cy="56" r="31" fill="url(#${rim})" stroke="#7d8790" stroke-width=".8"/>
<circle cx="60" cy="56" r="27" fill="#f6f8f9"/>
<text x="60" y="38" font-size="5" font-weight="700" text-anchor="middle" fill="#37414b" ${NT_FONT}>kWh</text>
<text x="60" y="43" font-size="3" text-anchor="middle" fill="#6b7580" ${NT_FONT}>CL200  240V  3W</text>
${ntLcd(44, 46, 32, 14, c.lcd, !c.unav, "#9be7ff", ntFit(c.lcd, 32, 8))}
${c.today ? `<text x="60" y="68" font-size="${ntFit(c.today, 40, 4.4).toFixed(1)}" text-anchor="middle" fill="#37414b" ${NT_FONT}>${esc(c.today)}</text>` : ""}
<rect x="57.4" y="72" width="5.2" height="2.6" rx=".6" fill="${c.exp ? "#0d3d1a" : "#3b1010"}"/>${c.unav || c.still ? "" : `<rect class="${c.heavy ? "nta-blinkfast" : "nta-blink"}" x="57.4" y="72" width="5.2" height="2.6" rx=".6" fill="${ntPulse(c)}"/>`}${c.exp ? ntExportArrow(64.4, 73.3) : ""}
<circle cx="60" cy="56" r="27" fill="url(#${gl})"/>
<path d="M41 40 A24 24 0 0 1 58 31" stroke="#fff" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>
<rect x="54" y="106" width="12" height="16" fill="#8a949d"/><rect x="52" y="104" width="16" height="4" rx="1" fill="#7a848d"/>`;
}
const DRAW = { linky: ntLinky, box: ntMeterBox, dome: ntMeterDome };
return {
  draw: (cls, c) => { ntN = 0; return `<div class="machine ${cls}${c.unav ? " nt-unav" : ""}"><svg class="nt-svg" viewBox="0 -10 120 135">${(DRAW[c.kind] || ntMeterBox)(c)}</svg></div>`; },
  css: () => `
        svg.nt-svg{position:absolute;left:0;top:0;width:96px;height:108px;overflow:visible}
        .machine.nt-unav{opacity:.45;filter:grayscale(1)}
        .nta-blink{animation:nt-blink 2.4s linear infinite}
        .nta-blinkfast{animation:nt-blinkfast .45s linear infinite}
        @keyframes nt-blink{0%,70%,100%{opacity:.15}78%,92%{opacity:1}}
        @keyframes nt-blinkfast{0%,100%{opacity:.15}45%,55%{opacity:1}}`,
};
}

// ---- src/07-css.js
// The card's own styles; the drawings copied from HA Appliance Card bring
// theirs, added after these.
const IE_CSS = `
  :host { display: block; }
  ha-card { overflow: hidden; }
  .wrap { position: relative; padding: 4px 0 8px; }
  .stage { position: relative; transform-origin: 0 0; margin: 0 auto; }
  .stage > svg.ie-flows { position: absolute; left: 0; top: 0; overflow: visible; }
  .ie-track { fill: none; stroke: var(--divider-color, #d7dde3); stroke-width: 2.2; stroke-linecap: round; opacity: .9; }
  .ie-dash { fill: none; stroke-width: 3.2; stroke-linecap: round; stroke-dasharray: 6 10; }
  .ie-bus { fill: none; stroke: var(--secondary-text-color, #2b3137); stroke-width: 1.4; opacity: .8; }
  .ie-lbl { font-size: 12px; font-weight: 600; fill: var(--primary-text-color, #1f262e);
    paint-order: stroke fill; stroke: var(--card-background-color, var(--ha-card-background, #fff)); stroke-width: 3.5px; stroke-linejoin: round; }
  .ie-lbl.light { font-weight: 500; }
  .ie-lbl.big { font-size: 15px; font-weight: 600; }
  .ie-lbl.nm { font-size: 13px; font-weight: 500; }
  .ie-pw { font-size: 10px; font-weight: 600; fill: #fff; paint-order: stroke fill; stroke: #16304f; stroke-width: 2.5px; stroke-linejoin: round; }
  .node { position: absolute; width: 130px; text-align: center; color: var(--primary-text-color, #1f262e); }
  .node .machine { position: relative; width: 96px; height: 108px; margin: 0 auto; }
  .node .nm { font-size: 13px; margin-top: 2px; line-height: 1.25; }
  .node .vl { font-size: 15px; font-weight: 600; line-height: 1.3; }
  .node .sb { font-size: 12px; color: var(--secondary-text-color, #6b7684); line-height: 1.25; }
  .hit { cursor: pointer; }
  .dim { opacity: .38; }
  g.dim { opacity: .38; }
  svg.ie-e { position: absolute; left: 0; top: 0; width: 96px; height: 108px; overflow: visible; }
  .ie-plug-ring { stroke: #b8bfc6; }
  .ie-plug.on .ie-plug-ring { stroke: #42a5f5; filter: drop-shadow(0 0 2px #42a5f5); }
  .node .ie-ac { position: relative; width: 130px; height: 108px; margin: 0 auto; }
  /* HA Appliance Card draws its picture 16 px down and 17 px in: lifted so it
     sits where the other drawings sit. */
  .node .ie-ac > ha-appliance-card { position: absolute; left: 0; top: -16px; width: 130px; }
  /* Compact consumers: the drawing at three quarters, its labels unchanged. */
  .node.cmp > .machine, .node.cmp > .ie-ac { transform: scale(.75); transform-origin: 50% 0; margin-bottom: -27px; }
  @media (prefers-reduced-motion: reduce) { .stage * { animation: none !important; } }
`;

// ---- src/08-card.js
// The card: lays the drawings out on a stage 560 px wide (wider with a
// pylon or consumers feeding others), draws the flows under them, and scales
// the whole stage to the width it is given.

const IE_W = 560;
const IE_PYLON_W = 110;
const IE_CHILD_W = 200;
const IE_STEP = 172;
// Two staggered columns: each consumer half a step below the one before.
const IE_COL2_W = 150;
const IE_STAGGER = 95;
// Smaller consumer drawings, closer together.
const IE_COMPACT_K = 0.75;
const IE_COMPACT_STEP = 130;

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
  const c = cfg || {};
  const solarCfg = c.solar || {};
  const view = IE_SOLAR_VIEWS.includes(solarCfg.view) ? solarCfg.view : "panel";
  const pylon = model.hasGrid && !!(c.grid && c.grid.pylon);
  const chains = model.consumers.some((k) => k.children.length);
  const ox = pylon ? IE_PYLON_W : 0;
  // Past three consumers the column gets tall: two staggered columns then,
  // unless a consumer feeds others (their column already takes that place).
  const askLayout = IE_CONSUMER_LAYOUTS.includes(c.consumers_layout) ? c.consumers_layout : "auto";
  let cmode = askLayout === "auto" ? (model.consumers.length > 3 && !chains ? "columns" : "column") : askLayout;
  if (cmode === "columns" && (chains || model.consumers.length < 2)) cmode = "column";
  const houseX = 280 + ox, leftX = 70 + ox, rightX = 490 + ox, childX = rightX + IE_CHILD_W;
  // A string given only by its power, or a solar total alone, still gets a
  // few panels drawn: they stand for it and carry no value of their own.
  let groups = model.strings.map((s) => ({ ...s, drawn: s.panels.length || 3, decorative: !s.panels.length }));
  if (!groups.length && model.hasSolar) groups = [{ name: "", index: 0, entity: "", panels: [], w: model.pv, drawn: 4, decorative: true }];

  const L = { view, groups: [], width: IE_W + ox + (chains ? IE_CHILD_W : 0) + (cmode === "columns" ? IE_COL2_W : 0), micro: !!model.micro, optimizers: !!model.optimizers, cmode };
  let solarBottom = 0;
  if (groups.length) {
    const G = groups.length;
    const N = groups.reduce((a, g) => a + g.drawn, 0);
    const gapP = 6;
    const pw = Math.max(12, Math.min(34, (500 - (G > 1 ? 40 : 0) * (G - 1) - gapP * (N - G)) / N));
    const ph = pw * 1.5;
    // Room for the label of each string ("South · 1.51 kW"), so two narrow
    // strings never write over each other.
    const labelW = (g) => ((g.name || "String 0").length + 10) * 6.8;
    const groupW = (g) => g.drawn * pw + gapP * (g.drawn - 1);
    const gaps = groups.slice(1).map((g, i) => Math.max(40, (labelW(groups[i]) + labelW(g)) / 2 + 12 - (groupW(groups[i]) + groupW(g)) / 2));
    const total = N * pw + gapP * (N - G) + gaps.reduce((a, b) => a + b, 0);
    let x = Math.max(ox + 10, houseX - total / 2);
    const py = 40;
    L.pw = pw; L.ph = ph; L.py = py;
    // Microinverters or optimisers hang under their panels, the bus under them.
    // One per string: the panels' bus first, the box under its middle.
    L.perString = model.micro === "string";
    L.microY = L.perString ? py + ph + 18 : py + ph + 5;
    L.bus = py + ph + (L.perString ? 12 : L.micro || L.optimizers ? 30 : 16);
    groups.forEach((g, i) => {
      const gw = groupW(g);
      L.groups.push({ ...g, x, width: gw, cx: x + gw / 2 });
      x += gw + (gaps[i] || 0);
    });
    solarBottom = L.perString ? L.microY + 12 : view === "panel" || L.micro || L.optimizers ? L.bus : py + ph;
  }

  const showInverter = model.showInverter && L.groups.length > 0;
  let by;
  if (showInverter) {
    L.inv = { x: houseX, y: solarBottom + 80 };
    by = L.inv.y + 36 + 46 + 99;
  } else if (L.groups.length) {
    by = solarBottom + 60 + 99;
  } else {
    by = 150;
  }
  L.house = { x: houseX, by, top: by - 99, left: houseX - 52, right: houseX + 63 };

  // Left: the grid above, the battery below; alone, level with the house. A
  // battery on the inverter sits beside it, and the grid then goes lower.
  L.grid = null; L.battery = null;
  const onInv = model.batteryOnInverter && L.inv;
  if (onInv) {
    L.battery = { x: leftX, y: L.inv.y };
    if (model.hasGrid) L.grid = { x: leftX, y: by + 40 };
  } else if (model.hasGrid && model.hasBattery) {
    L.grid = { x: leftX, y: by - 100 };
    L.battery = { x: leftX, y: by + 110 };
  } else if (model.hasGrid) L.grid = { x: leftX, y: by - 50 };
  else if (model.hasBattery) L.battery = { x: leftX, y: by - 50 };
  L.pylon = pylon && L.grid ? { x: 66, y: L.grid.y } : null;

  // Right: the consumers in a column centred on the house, kept below the
  // panels; the ones a consumer feeds stand in a second column beside it. In
  // two columns they alternate, half a step apart, so the flows to the second
  // column pass between the drawings of the first.
  const minY = (L.groups.length ? solarBottom : 0) + 74;
  if (cmode === "columns") {
    const span = (model.consumers.length - 1) * IE_STAGGER;
    const top = Math.max(minY, by - 50 - span / 2);
    L.consumers = model.consumers.map((k, i) => ({ x: rightX + (i % 2) * IE_COL2_W, y: top + i * IE_STAGGER, col: i % 2, children: [] }));
  } else {
    const step = cmode === "compact" ? IE_COMPACT_STEP : IE_STEP;
    const blocks = model.consumers.map((k) => Math.max(1, k.children.length) * step);
    const totalH = blocks.reduce((a, b) => a + b, 0);
    let cursor = Math.max(minY, by - 50 - (totalH - step) / 2);
    L.consumers = model.consumers.map((k, i) => {
      const pos = { x: rightX, y: cursor + (blocks[i] - step) / 2, col: 0, children: k.children.map((_, j) => ({ x: childX, y: cursor + j * step })) };
      cursor += blocks[i];
      return pos;
    });
  }

  // How far a consumer's drawing reaches: its left edge, its bottom.
  const cBottom = cmode === "compact" ? 82 : 112;
  L.consumerHalf = cmode === "compact" ? 40 : 54;
  const bottoms = [by + 52];
  if (L.grid) bottoms.push(L.grid.y + 54 + 58);
  if (L.battery) bottoms.push(L.battery.y + 54 + 58);
  for (const k of L.consumers) {
    bottoms.push(k.y + cBottom);
    for (const ch of k.children) bottoms.push(ch.y + cBottom);
  }
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

  static computeModel(hass, cfg, recent) { return ieModel(hass, cfg, recent); }
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
    if (this._ac) for (const rec of this._ac.values()) rec.el.hass = hass;
    const sig = this._signature();
    if (sig !== this._sig) this._render();
  }

  getCardSize() {
    return Math.max(4, Math.ceil(((this._layoutH || 600) * (this._k || 1)) / 50));
  }

  getGridOptions() {
    return { columns: "full", min_columns: 6 };
  }

  connectedCallback() {
    if (typeof ResizeObserver !== "undefined" && !this._ro) {
      this._ro = new ResizeObserver(() => this._fit());
    }
    if (this._ro && this._wrap) this._ro.observe(this._wrap);
  }

  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    clearTimeout(this._holdTimer);
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

  // The HA Appliance Card elements live across redraws: created once per
  // consumer, given their config again only when it changes, and moved into
  // the fresh placeholders.
  _mountAppliances(list) {
    this._ac = this._ac || new Map();
    const keep = new Set();
    for (const { key, cm } of list) {
      const holder = this._wrap.querySelector(`[data-ac="${key}"]`);
      if (!holder) continue;
      let rec = this._ac.get(key);
      if (!rec) {
        rec = { el: document.createElement("ha-appliance-card"), sig: "" };
        this._ac.set(key, rec);
      }
      const extra = cm.appliance || {};
      // Some drawings follow an on/off state, not a power (a wall drying rack
      // unfolds on "on"): they get one made from the consumer's power, unless
      // the config names its own state entity.
      const synth = IE_ONOFF_TYPES.includes(cm.type) && !extra.state_entity ? `binary_sensor.ie_flow_${key}` : "";
      const conf = { type: "custom:ha-appliance-card", appliance_type: cm.type, state_entity: synth || cm.entity, power_entity: cm.entity, show_name: false, show_state: false, transparent: true, hidden_lines: ["power"], ...extra };
      const sig = JSON.stringify(conf);
      if (rec.sig !== sig) {
        try { rec.el.setConfig(conf); rec.sig = sig; } catch (e) { rec.sig = ""; }
      }
      rec.el.hass = synth ? this._synthHass(rec, synth, cm.w) : this._hass;
      if (rec.el.parentNode !== holder) holder.appendChild(rec.el);
      // Only its picture: the lines, sliders and history it draws under it
      // (a hob's cooking zones) would spill over the name and the value.
      const root = rec.el.shadowRoot;
      if (root && !root.querySelector("style[data-ie]")) {
        const st = document.createElement("style");
        st.setAttribute("data-ie", "");
        st.textContent = IE_AC_HIDE_CSS;
        root.appendChild(st);
      }
      keep.add(key);
      this._fitAppliance(rec.el);
    }
    for (const k of [...this._ac.keys()]) if (!keep.has(k)) this._ac.delete(k);
  }

  _synthHass(rec, id, w) {
    const on = w !== null && w > IE_ON_W;
    if (rec.on !== on) { rec.on = on; rec.since = new Date().toISOString(); }
    const h = this._hass || {};
    return { ...h, states: { ...(h.states || {}), [id]: { entity_id: id, state: on ? "on" : "off", attributes: {}, last_changed: rec.since, last_updated: rec.since } } };
  }

  // A drawing wider or taller than the others (an HRV and its ducts) is
  // shrunk and centred in the same box.
  _fitAppliance(el) {
    const run = () => {
      const m = el.shadowRoot && el.shadowRoot.querySelector(".machine");
      if (!m || typeof el.getBoundingClientRect !== "function") return;
      const hr = el.getBoundingClientRect();
      if (!hr.width) return;
      const t = hr.width / IE_AC_W;
      const r = m.getBoundingClientRect();
      const mx = (r.left - hr.left) / t, my = (r.top - hr.top) / t, mw = r.width / t, mh = r.height / t;
      const cur = el._ieFit || 1;
      // Undo the scale already applied to read the drawing at its own size.
      const W = mw / cur, H = mh / cur, X = mx / cur, Y = my / cur;
      const s = Math.min(1, IE_AC_W / W, IE_AC_H / H);
      if (s >= 0.999) {
        if (el._ieFit) { el.style.transform = el.style.transformOrigin = el.style.left = el.style.top = ""; el._ieFit = 0; }
        return;
      }
      el._ieFit = s;
      el.style.transformOrigin = "0 0";
      el.style.transform = `scale(${s.toFixed(3)})`;
      el.style.left = `${((IE_AC_W - W * s) / 2 - X * s).toFixed(1)}px`;
      el.style.top = `${((IE_AC_H - H * s) / 2 - Y * s).toFixed(1)}px`;
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(run); else run();
  }

  // Scale the stage to the width of the card, never past 130 %.
  _fit() {
    if (!this._wrap || !this._stage) return;
    const sw = this._layoutW || IE_W;
    const w = this._wrap.clientWidth || sw;
    const k = Math.max(0.3, Math.min(1.3, w / sw));
    this._k = k;
    this._stage.style.transform = `scale(${k})`;
    this._stage.style.marginLeft = `${Math.max(0, (w - sw * k) / 2)}px`;
    this._wrap.style.height = `${Math.ceil(this._layoutH * k) + 12}px`;
  }

  // With consumers_hide_below, a consumer stays on the card IE_HIDE_HOLD
  // after its last reading at work, then leaves at the next redraw (a timer
  // forces one when nothing else moves).
  _recentConsumers(hass, c) {
    const below = ieHideBelow(c);
    if (below === null) return null;
    this._seen = this._seen || new Map();
    const now = Date.now();
    const look = (x, key) => {
      const w = ieWatts(hass, ieEntityOf(x));
      if (w !== null && w > below) this._seen.set(key, now);
    };
    (Array.isArray(c.consumers) ? c.consumers : []).forEach((x, i) => {
      look(x, `c${i}`);
      ((x && x.children) || []).forEach((k, j) => look(k, `c${i}-${j}`));
    });
    const recent = new Set();
    let next = Infinity;
    for (const [key, at] of this._seen) {
      const left = at + IE_HIDE_HOLD - now;
      if (left > 0) { recent.add(key); next = Math.min(next, left); }
    }
    clearTimeout(this._holdTimer);
    if (next !== Infinity) this._holdTimer = setTimeout(() => { this._sig = null; if (this._hass) this._render(); }, next + 200);
    return recent;
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

    const m = ieModel(hass, c, this._recentConsumers(hass, c));
    const L = ieLayout(m, c);
    this._layoutH = L.height;
    this._layoutW = L.width;
    const D = ieDrawings();
    const lbl = (x, y, text, cls = "", anchor = "middle") => `<text class="ie-lbl ${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}">${esc(text)}</text>`;
    let svg = `<svg class="ie-flows" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}">${IE_DEFS}`;

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
        const pcx = px + L.pw / 2;
        if (L.perString) {
          if (L.view === "panel" && p) svg += ieFlow(ieLine(pcx, L.py + L.ph + 2, pcx, L.bus), p.w, IE_COLORS.solar, peak, { ...fo, gap: 9 });
          else svg += `<path class="ie-track" d="M${f1(pcx)} ${f1(L.py + L.ph + 2)} V${f1(L.bus)}"/>`;
        } else if (L.micro || L.optimizers) {
          svg += `<g${p ? hit(p.entity) : ""}>${ieMicro(pcx, L.microY, pwatts !== null && pwatts > 1, animate, L.optimizers)}</g>`;
          if (L.view === "panel" && p) svg += ieFlow(ieLine(pcx, L.microY + 11, pcx, L.bus), p.w, IE_COLORS.solar, peak, { ...fo, gap: 9 });
          else svg += `<path class="ie-track" d="M${f1(pcx)} ${f1(L.microY + 11)} V${f1(L.bus)}"/>`;
        } else if (L.view === "panel" && p) svg += ieFlow(ieLine(pcx, L.py + L.ph + 2, pcx, L.bus), p.w, IE_COLORS.solar, peak, { ...fo, gap: 9 });
      }
      const onBus = L.micro || L.optimizers || (L.view === "panel" && !g.decorative);
      let fromY = onBus ? L.bus : L.py + L.ph + 3;
      if (onBus && g.drawn > 1) svg += `<path class="ie-bus" d="M${f1(g.x + L.pw / 2)} ${f1(L.bus)} H${f1(g.x + g.width - L.pw / 2)}"/>`;
      if (L.perString) {
        // The string's microinverter, fed by the bus, its output going on.
        svg += `<path class="ie-track" d="M${f1(g.cx)} ${f1(L.bus)} V${f1(L.microY)}"/>`;
        svg += `<g${hit(g.entity)}>${ieMicro(g.cx, L.microY, g.w !== null && g.w > 1, animate, false, Math.max(18, Math.min(30, g.width - 4)))}</g>`;
        fromY = L.microY + 11;
      }
      const mx = L.inv ? (G === 1 ? L.inv.x : L.inv.x - 18 + (36 * gi) / (G - 1)) : L.house.x;
      const spec = ieCubic(g.cx, fromY, g.cx, fromY + 40, mx, invTop - 40, mx, invTop - 4);
      svg += ieFlow(spec, g.w, IE_COLORS.solar, peak * Math.max(1, g.drawn), fo);
    });
    if (G && L.view === "total") svg += lbl(L.house.x, L.py - 10, `${t("solar")} · ${fmt(m.pv)}`);

    if (L.inv) {
      const invOn = m.invOut !== null && m.invOut > 1;
      svg += ieFlow(ieLine(L.inv.x, L.inv.y + 36, L.inv.x, L.house.top - 6), m.invOut, IE_COLORS.solar, rated, fo);
      svg += lbl(L.inv.x + 10, L.inv.y + 36 + 26, fmt(m.invOut), "", "start");
      const invEntity = (c.inverter && c.inverter.power_entity) || (c.solar && c.solar.power_entity) || "";
      svg += `<g${hit(invEntity)}${dimOn && !invOn ? ' class="dim"' : ""}>${ieInverter(L.inv.x, L.inv.y, invOn, animate)}</g>`;
      // With the battery beside it, the inverter's name goes to its right.
      if (L.battery && m.batteryOnInverter) svg += lbl(L.inv.x + 38, L.inv.y + 4, t("inverter"), "light", "start");
      else svg += lbl(L.inv.x - 42, L.inv.y + 4, t("inverter"), "light", "end");
    }

    /* ---- grid, battery, consumers ---- */
    if (L.grid) {
      const a = { x: L.grid.x + 50, y: L.grid.y }, b = { x: L.house.left - 2, y: L.house.by - 40 };
      let spec = ieCubic(a.x, a.y, a.x + 70, a.y, b.x - 50, b.y, b.x, b.y);
      if (m.grid !== null && m.grid < 0) spec = ieReverse(spec);
      const color = m.grid !== null && m.grid < 0 ? IE_COLORS.export : IE_COLORS.import;
      svg += ieFlow(spec, m.grid, color, rated, fo);
      if (m.grid !== null && Math.abs(m.grid) >= 1) svg += lbl((a.x + b.x) / 2, (a.y + b.y) / 2 - 8, `${t(m.grid < 0 ? "export" : "import")} ${fmt(m.grid)}`);
      if (L.pylon) {
        let ps = ieLine(L.pylon.x + 34, L.grid.y + 10, L.grid.x - 40, L.grid.y + 10);
        if (m.grid !== null && m.grid < 0) ps = ieReverse(ps);
        svg += ieFlow(ps, m.grid, color, rated, fo);
      }
    }
    if (L.battery) {
      const a = { x: L.battery.x + 50, y: L.battery.y };
      const b = m.batteryOnInverter && L.inv ? { x: L.inv.x - 34, y: L.inv.y + 6 } : { x: L.house.left - 2, y: L.house.by - 22 };
      let spec = ieCubic(b.x, b.y, b.x - 50, b.y, a.x + 70, a.y, a.x, a.y); // house (or inverter) -> battery: charging
      if (m.bat !== null && m.bat > 0) spec = ieReverse(spec);
      svg += ieFlow(spec, m.bat, m.bat !== null && m.bat > 0 ? IE_COLORS.discharge : IE_COLORS.charge, rated, fo);
      if (m.bat !== null && Math.abs(m.bat) >= 1) svg += lbl((a.x + b.x) / 2, (a.y + b.y) / 2 + 16, `${t(m.bat > 0 ? "discharging" : "charging")} ${fmt(m.bat)}`);
    }
    const half = L.consumerHalf || 54;
    L.consumers.forEach((p, i) => {
      const cm = m.consumers[i];
      const n = L.consumers.length;
      const a = { x: L.house.right + 3, y: L.house.by - 30 + (n > 1 ? (i - (n - 1) / 2) * Math.min(9, 30 / (n - 1)) : 0) }, b = { x: p.x - half, y: p.y };
      let spec;
      if (p.col) {
        // Into the second column: under the first column's drawing above,
        // across, then up to the consumer.
        const x0 = p.x - IE_COL2_W, gy = p.y + 19;
        spec = ieChain(ieCubic(a.x, a.y, a.x + 46, a.y, x0 - 116, gy, x0 - 70, gy), ieLine(x0 - 70, gy, x0 + 62, gy), ieCubic(x0 + 62, gy, x0 + 80, gy, b.x - 14, b.y, b.x, b.y));
      } else spec = ieCubic(a.x, a.y, a.x + 46, a.y, b.x - 46, b.y, b.x, b.y);
      const idle = !(cm.w !== null && cm.w > IE_ON_W);
      svg += `<g${dimOn && idle ? ' class="dim"' : ""}>${ieFlow(spec, cm.w, IE_COLORS.load, rated, fo)}</g>`;
      p.children.forEach((q, j) => {
        const ch = cm.children[j];
        const ca = { x: p.x + half - 2, y: p.y }, cb = { x: q.x - half, y: q.y };
        const cidle = !(ch.w !== null && ch.w > IE_ON_W);
        svg += `<g${dimOn && cidle ? ' class="dim"' : ""}>${ieFlow(ieCubic(ca.x, ca.y, ca.x + 50, ca.y, cb.x - 50, cb.y, cb.x, cb.y), ch.w, IE_COLORS.load, rated, fo)}</g>`;
      });
    });

    /* ---- the house ---- */
    const homeEntity = (c.home && c.home.power_entity) || "";
    svg += `<g${hit(homeEntity)}>${ieHouse(L.house.x, L.house.by, m.home === null ? 0 : m.home / rated)}</g>`;
    svg += lbl(L.house.x, L.house.by + 22, (c.home && c.home.name) || t("home"), "nm");
    svg += lbl(L.house.x, L.house.by + 40, fmt(m.home), "big");
    svg += `</svg>`;

    /* ---- the nodes drawn by HA Appliance Card ---- */
    const node = (pos, html, name, value, sub, entity, inactive, compact) =>
      `<div class="node${compact ? " cmp" : ""}${dimOn && inactive ? " dim" : ""}${entity && c.clickable !== false ? " hit" : ""}"${entity && c.clickable !== false ? ` data-entity="${esc(entity)}"` : ""} style="left:${f1(pos.x - 65)}px;top:${f1(pos.y - (compact ? 54 * IE_COMPACT_K : 54))}px">${html}<div class="nm">${esc(name)}</div><div class="vl">${esc(value)}</div>${sub ? `<div class="sb">${esc(sub)}</div>` : ""}</div>`;
    let nodes = "";
    if (L.pylon) nodes += node({ x: L.pylon.x, y: L.pylon.y }, iePylonHtml(m.grid !== null && Math.abs(m.grid) >= 1), "", "", "", "", false);
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
      const reserve = m.reserve;
      const html = D.bat.draw("", { battery: { layout: "wall", level: m.soc, reserve, mode, low: m.soc !== null && reserve !== null && m.soc <= reserve } });
      const state = mode === "charging" ? t("charging") : mode === "discharging" ? t("discharging") : mode === "unav" ? t("unavailable") : t("idle");
      const sub = m.soc !== null ? `${Math.round(m.soc)} % · ${state}` : state;
      nodes += node(L.battery, html, b.name || t("battery"), fmt(m.bat), sub, b.power_entity || b.soc_entity, mode === "idle" || mode === "full");
    }
    // A consumer is drawn by HA Appliance Card when it is installed, as that
    // card draws it on its own page; otherwise by the drawings copied here.
    const acReady = typeof customElements !== "undefined" && !!customElements.get("ha-appliance-card");
    const wantAc = [];
    const consumerNode = (pos, cm, key) => {
      const on = cm.w !== null && cm.w > IE_ON_W;
      let html;
      if (cm.type !== "generic" && acReady) {
        html = `<div class="ie-ac" data-ac="${esc(key)}"></div>`;
        wantAc.push({ key, cm });
      } else if (cm.type === "ev_charger") html = D.ev.draw("", { ev: { mode: on ? "charging" : "connected", plugged: true, flow: 0.5 } }).replace('class="machine', `style="--ie-ev:${on ? "#2196f3" : "#26a69a"}" class="machine`);
      else if (cm.type === "heat_pump") html = D.hp.draw("", { hpMode: on ? "space_heating" : "idle", noTank: true });
      else if (cm.type === "water_heater") html = D.wh.draw(on ? "heating" : "", { tankTemp: on ? 55 : 40 });
      else html = iePlugHtml(on);
      return node(pos, html, cm.name || t(cm.type), fmt(cm.w), cm.w === null ? t("unavailable") : "", cm.entity, !on, L.cmode === "compact");
    };
    L.consumers.forEach((p, i) => {
      const cm = m.consumers[i];
      nodes += consumerNode(p, cm, cm.key);
      p.children.forEach((q, j) => { nodes += consumerNode(q, cm.children[j], cm.children[j].key); });
    });
    if (!acReady && m.consumers.some((k) => k.type !== "generic" || k.children.some((x) => x.type !== "generic")) && !this._acWait && typeof customElements !== "undefined" && customElements.whenDefined) {
      this._acWait = true;
      customElements.whenDefined("ha-appliance-card").then(() => { this._sig = null; if (this._hass) this._render(); });
    }

    this._wrap.innerHTML = `<div class="stage" style="width:${L.width}px;height:${L.height}px">${svg}${nodes}</div>`;
    this._mountAppliances(wantAc);
    this._stage = this._wrap.querySelector(".stage");
    const flows = this._wrap.querySelector("svg.ie-flows");
    // Rebuilding the SVG restarts its animations: fast-forward to wall-clock
    // time so the arrowheads keep their place across updates.
    if (flows && typeof flows.setCurrentTime === "function") flows.setCurrentTime(3600 + (Date.now() % 3600000) / 1000);
    this._fit();
  }
}

// ---- src/09-editor.js
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
  // Without HA Appliance Card, only the built-in types have their drawing.
  const noAc = typeof customElements !== "undefined" && !customElements.get("ha-appliance-card");
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
      grid2([sel(`c${i}_type`, noAc && data[`c${i}_type`] && !IE_BUILTIN_TYPES.includes(data[`c${i}_type`]) ? t("e_type_noac") : t("e_type"), typeOptions(data[`c${i}_type`])), txt(`c${i}_name`, t("e_name"))]),
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

// ---- src/10-register.js
// Registration, guarded so a second copy of the file on the page does not
// throw.
if (!customElements.get(IE_TAG)) customElements.define(IE_TAG, IllustratedEnergyFlowCard);
if (!customElements.get(IE_EDITOR_TAG)) customElements.define(IE_EDITOR_TAG, IllustratedEnergyFlowCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === IE_TAG)) {
  window.customCards.push({
    type: IE_TAG,
    name: "Illustrated Energy Flow Card",
    description: "Energy flow with drawn devices, the solar side panel by panel.",
    preview: true,
    documentationURL: "https://github.com/ADNPolymerase/ha-illustrated-energy-flow-card",
  });
}

console.info(`%c ILLUSTRATED-ENERGY-FLOW-CARD %c v${IE_VERSION} `, "color:#fff;background:#f5a524;font-weight:700", "color:#f5a524;background:#fff");
})();
