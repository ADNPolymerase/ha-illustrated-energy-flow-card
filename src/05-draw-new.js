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
