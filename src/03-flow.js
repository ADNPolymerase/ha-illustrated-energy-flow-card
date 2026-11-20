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
