/**
 * Carga CSS + JS del componente lightbox-zoom (dev local / jsDelivr en prod).
 */
const isDevHost =
  typeof globalThis.location !== "undefined" &&
  /localhost|127\.0\.0\.1|\[::1\]/.test(globalThis.location.hostname);

/** Pin opcional para jsDelivr (Personal@main). */
export const LIGHTBOX_ZOOM_REF = "main";

export function lightboxZoomBase() {
  if (isDevHost) {
    return new URL("./", import.meta.url).href;
  }
  return `https://cdn.jsdelivr.net/gh/Jeff-Aporta/Personal@${LIGHTBOX_ZOOM_REF}/components/lightbox/cdn/`;
}

function ensureStylesheet(href, marker) {
  if (document.querySelector(`link[${marker}]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(marker, "1");
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("No se pudo cargar " + href));
    document.head.appendChild(link);
  });
}

function ensureScript(src, marker) {
  if (document.querySelector(`script[${marker}]`)) {
    if (globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog) {
      return Promise.resolve();
    }
  }
  const existing = document.querySelector(`script[${marker}]`);
  if (existing && globalThis.ISAComponents?.LightboxZoom) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.defer = true;
    el.setAttribute(marker, "1");
    el.onload = () => {
      if (!globalThis.ISAComponents?.LightboxZoom?.LightboxZoomDialog) {
        reject(new Error("LightboxZoom no registró ISAComponents.LightboxZoom"));
        return;
      }
      resolve();
    };
    el.onerror = () => reject(new Error("No se pudo cargar " + src));
    document.head.appendChild(el);
  });
}

/** Carga CSS + bundle minificado. Requiere stack React/MUI y registerApp previo. */
export async function ensureLightboxZoom(base = lightboxZoomBase()) {
  const b = base.endsWith("/") ? base : base + "/";
  await ensureStylesheet(b + "lightbox-zoom.min.css", "data-isa-lb-zoom-css");
  await ensureScript(b + "lightbox-zoom.min.js", "data-isa-lb-zoom-js");
  return globalThis.ISAComponents.LightboxZoom;
}
