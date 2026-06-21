/**
 * Build lightbox-zoom: bundle modular src → IIFE CDN + CSS.
 */
import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const ENTRY = join(root, "src", "entry-iife.jsx");
const LEGACY = join(root, "src", "_source-iife.legacy.jsx");
const OLD_SOURCE = join(root, "src", "_source-iife.jsx");
const CSS_IN = join(root, "css", "lightbox-zoom.css");
const CDN_JS = join(root, "cdn", "lightbox-zoom.js");
const CDN_MIN = join(root, "cdn", "lightbox-zoom.min.js");
const CDN_CSS = join(root, "cdn", "lightbox-zoom.min.css");

if (existsSync(OLD_SOURCE) && !existsSync(LEGACY)) {
  renameSync(OLD_SOURCE, LEGACY);
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .trim();
}

function build() {
  const banner =
    "/**\n * @jeff-aporta/lightbox-zoom — CDN\n * Registra window.ISAComponents.LightboxZoom\n */\n";

  esbuild.buildSync({
    entryPoints: [ENTRY],
    outfile: CDN_JS,
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    legalComments: "none",
    loader: { ".jsx": "jsx", ".js": "jsx" },
  });

  let js = readFileSync(CDN_JS, "utf8");
  if (!js.startsWith("/**")) js = banner + js;
  writeFileSync(CDN_JS, js, "utf8");

  esbuild.buildSync({
    entryPoints: [CDN_JS],
    outfile: CDN_MIN,
    minify: true,
    legalComments: "none",
    target: "es2020",
    format: "iife",
    loader: { ".js": "jsx" },
  });

  writeFileSync(CDN_CSS, minifyCss(readFileSync(CSS_IN, "utf8")), "utf8");

  console.log("lightbox-zoom build OK");
  console.log("  ", CDN_MIN);
  console.log("  ", CDN_CSS);
}

build();
