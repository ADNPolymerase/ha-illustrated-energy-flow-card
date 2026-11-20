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
