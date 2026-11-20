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
