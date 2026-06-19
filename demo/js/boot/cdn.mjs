/** Pin jsDelivr front-shared + rutas del paquete lightbox. */
export const PIN = "a5a6597";

const isDevHost =
  typeof location !== "undefined" && /localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname);

function devCdnBase() {
  const base = document.querySelector("base")?.href || location.href;
  return new URL("../../../apps/front-shared/cdn/", base).href.replace(/\/?$/, "/");
}

export const CDN = isDevHost
  ? devCdnBase()
  : `https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@${PIN}/cdn`;

export const bootHelperUrl = isDevHost
  ? `${CDN}boot-helper.mjs`
  : `${CDN}/boot-helper.mjs?v=${PIN}`;

/** Librería lightbox-zoom (dev: repo local; prod: jsDelivr Personal). */
export function lightboxZoomLoaderUrl() {
  const base = document.querySelector("base")?.href || location.href;
  if (isDevHost) {
    return new URL("cdn/load-lightbox-zoom.mjs", base).href;
  }
  return "https://cdn.jsdelivr.net/gh/Jeff-Aporta/Personal@main/components/lightbox/cdn/load-lightbox-zoom.mjs";
}

/** Bundle demo minificado. */
export function demoAppUrl() {
  const base = document.querySelector("base")?.href || location.href;
  if (globalThis.__ISA_DIST__) {
    return new URL("_dist/app.min.js", base).href;
  }
  return new URL("js/app/main.jsx", base).href;
}
