import { bootHelperUrl, ensureLightboxZoom, demoAppUrl } from "./cdn.mjs";

async function boot() {
  if (new URLSearchParams(location.search).has("isa_boot_hold")) return;

  const { importShared, assertStack } = await import(bootHelperUrl);

  const stackMod = await importShared("stack.mjs");
  await stackMod.stackReady;
  assertStack();

  await importShared("isa/js/index.js");

  window.ISAFront.registerApp({
    ns: "ISA",
    app: "lightbox-zoom-demo",
    theme: true,
    session: false,
    auth: false,
    toast: false,
  });

  if (window.ISAFront?.registerCodeMirror && window.React && window.MaterialUI) {
    window.ISAFront.registerCodeMirror(window.React, window.MaterialUI);
  }

  await ensureLightboxZoom();

  await import(demoAppUrl());
}

boot().catch((err) => {
  const root = document.getElementById("root");
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  if (root) {
    root.innerHTML = `<pre style="color:#ff8a80;padding:24px;font-family:monospace">Error de arranque:\n${msg}</pre>`;
  }
  console.error(err);
});
