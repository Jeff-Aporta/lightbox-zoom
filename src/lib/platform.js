/** Runtime helpers — React/MUI vía ISAFront (CDN IIFE). */

export function getReact() {
  return window.ISAFront.getReact();
}

export function getMaterialUI() {
  return window.ISAFront.getMaterialUI();
}

export function resolveUi(ns) {
  const keys = ns ? [ns] : ["ISA", "ISAJ", "MO", "SCRUM", "FLS", "CFAI", "IAT"];
  for (let i = 0; i < keys.length; i++) {
    const bag = window[keys[i]];
    if (bag?.UI?.Icon) return bag.UI;
  }
  throw new Error("LightboxZoom: UI.Icon no disponible — ejecutar ISAFront.registerApp antes");
}
