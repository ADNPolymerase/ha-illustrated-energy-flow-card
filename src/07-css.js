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
