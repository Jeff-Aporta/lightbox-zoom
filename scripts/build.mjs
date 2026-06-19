/**
 * Build lightbox-zoom: IIFE minificado para CDN + CSS con prefijo isa-lb-zoom.
 */
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);
const esbuild = require("../../../apps/src/scripts/node_modules/esbuild");

const SOURCE = join(root, "src", "_source-iife.jsx");
const CSS_IN = join(root, "css", "lightbox-zoom.css");
const CDN_JS = join(root, "cdn", "lightbox-zoom.js");
const CDN_MIN = join(root, "cdn", "lightbox-zoom.min.js");
const CDN_CSS = join(root, "cdn", "lightbox-zoom.min.css");

function transformSource(raw) {
  let s = raw;
  s = s.replace(
    /\/\*\*[\s\S]*?\*\/\s*\(function \(\)/,
    `/**\n * @package @isa-components/lightbox-zoom\n * Registra window.ISAComponents.LightboxZoom\n */\n(function ()`,
  );
  s = s.replace(/conv-image-lightbox/g, "isa-lb-zoom");
  s = s.replace(/function useImageLightboxZoom\(/g, "function useLightboxZoom(");
  s = s.replace(/useImageLightboxZoom\(/g, "useLightboxZoom(");
  s = s.replace(/function ImageLightboxDialog\(/g, "function LightboxZoomDialog(");
  s = s.replace(/function LightboxImage\(/g, "function LightboxZoomImage(");
  s = s.replace(/function PanPad\(/g, "function LightboxZoomPanPad(");
  s = s.replace(/React\.createElement\(PanPad,/g, "React.createElement(LightboxZoomPanPad,");
  s = s.replace(/React\.createElement\(ImageLightboxDialog,/g, "React.createElement(LightboxZoomDialog,");
  s = s.replace(/ImageLightbox: UI\.Icon/g, "LightboxZoom: UI.Icon");
  s = s.replace(
    /window\.ISAFront = window\.ISAFront \|\| \{\};\s*window\.ISAFront\.Lightbox = \{[\s\S]*?\};\s*\}\)\(\);/,
    `globalThis.ISAComponents = globalThis.ISAComponents || {};
  globalThis.ISAComponents.LightboxZoom = {
    LightboxZoomDialog,
    LightboxZoomImage,
    useLightboxZoom,
    ZOOM_MIN,
    ZOOM_MAX,
    PAN_STEP,
    ImageLightboxDialog: LightboxZoomDialog,
    LightboxImage: LightboxZoomImage,
    useImageLightboxZoom: useLightboxZoom,
  };
})();`,
  );
  return s;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .trim();
}

function build() {
  const raw = readFileSync(SOURCE, "utf8");
  const transformed = transformSource(raw);
  writeFileSync(CDN_JS, transformed, "utf8");

  esbuild.buildSync({
    entryPoints: [CDN_JS],
    outfile: CDN_MIN,
    minify: true,
    legalComments: "none",
    target: "es2020",
    format: "iife",
    loader: { ".js": "jsx" },
  });

  let css = readFileSync(CSS_IN, "utf8");
  css = css.replace(/conv-image-lightbox/g, "isa-lb-zoom");
  css = css.replace(/Visor de imágenes compartido \(ISAFront\.Lightbox\)/, "Lightbox zoom — @isa-components/lightbox-zoom");
  writeFileSync(CSS_IN, css, "utf8");
  writeFileSync(CDN_CSS, minifyCss(css), "utf8");

  console.log("lightbox-zoom build OK");
  console.log("  ", CDN_MIN);
  console.log("  ", CDN_CSS);
}

build();
