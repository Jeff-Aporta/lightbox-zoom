import { getReact, getMaterialUI, resolveUi } from "./lib/platform.js";
import { svgElementToDataUrl } from "./lib/svg-inline.js";
import { LightboxZoomDialog } from "./LightboxZoomDialog.jsx";

const { useState, useRef, useCallback, useEffect } = getReact();

export function LightboxZoomInline({ ns, children, caption, alt, className, sx, fullPage = false }) {
  const { Box } = getMaterialUI();
  const UI = resolveUi(ns);
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState([]);

  const onExpand = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    setSlides([{ src: svgElementToDataUrl(svg), alt: alt || caption || "Diagrama", caption }]);
    setOpen(true);
  }, [alt, caption]);

  return (
    <>
      <Box ref={containerRef} className={"isa-lb-zoom-inline " + (className || "")} sx={{ position: "relative", ...sx }}>
        {children}
        <Box
          className="isa-lb-zoom-inline__expand"
          role="button"
          tabIndex={0}
          aria-label="Ampliar diagrama"
          title="Ampliar (zoom/pan)"
          onClick={onExpand}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onExpand();
            }
          }}
        >
          <UI.Icon icon="mdi:arrow-expand" size={18} />
        </Box>
      </Box>
      <LightboxZoomDialog ns={ns} open={open} onClose={() => setOpen(false)} slides={slides} alt={alt} className={fullPage ? "isa-lb-zoom isa-lb-zoom--fullpage" : "isa-lb-zoom"} />
    </>
  );
}

export function LightboxZoomInlineHost({ ns }) {
  const { useState, useEffect } = getReact();
  const [state, setState] = useState({ open: false, slides: [], ns: ns || "ISA" });

  useEffect(() => {
    const onOpen = (e) => {
      const d = e.detail || {};
      if (!d.src) return;
      setState({
        open: true,
        slides: [{ src: d.src, alt: d.alt || d.caption || "Diagrama", caption: d.caption }],
        ns: d.ns || ns || "ISA",
      });
    };
    document.addEventListener("isa-lb-zoom-inline-open", onOpen);
    return () => document.removeEventListener("isa-lb-zoom-inline-open", onOpen);
  }, [ns]);

  return (
    <LightboxZoomDialog
      ns={state.ns}
      open={state.open}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      slides={state.slides}
    />
  );
}
