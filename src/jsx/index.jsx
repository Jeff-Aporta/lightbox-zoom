/**
 * @jeff-aporta/lightbox-zoom — API pública (runtime vía CDN).
 *
 * Tras ensureLightboxZoom(): window.ISAComponents.LightboxZoom
 *
 * - LightboxZoomDialog  — modal fullscreen con toolbar, galería y zoom
 * - LightboxZoomImage   — miniatura/grid que abre el dialog
 * - useLightboxZoom     — hook de zoom/pan (uso avanzado)
 *
 * Alias legacy: ImageLightboxDialog, LightboxImage, useImageLightboxZoom
 *
 * Fuente canónica: src/_source-iife.jsx → scripts/build.mjs → cdn/lightbox-zoom.min.js
 */

export const PACKAGE_ID = "lightbox-zoom";
export const CSS_CLASS_ROOT = "isa-lb-zoom";

export const EXPORTS = [
  "LightboxZoomDialog",
  "LightboxZoomImage",
  "LightboxZoomInline",
  "LightboxZoomInlineHost",
  "useLightboxZoom",
  "svgElementToDataUrl",
  "openLightboxInline",
  "ZOOM_MIN",
  "ZOOM_MAX",
  "PAN_STEP",
];
