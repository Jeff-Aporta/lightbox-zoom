export function svgElementToDataUrl(svgEl, opts) {
  if (!svgEl) return "";
  const clone = svgEl.cloneNode(true);
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (opts?.bg) {
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", opts.bg);
    clone.insertBefore(bg, clone.firstChild);
  }
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
}

export function openLightboxInline(opts) {
  const d = opts || {};
  let src = d.src || "";
  if (!src && d.root) {
    const svg = d.root.querySelector?.("svg");
    src = svgElementToDataUrl(svg, d);
  }
  if (!src) return;
  document.dispatchEvent(new CustomEvent("isa-lb-zoom-inline-open", { detail: { ...d, src } }));
}
