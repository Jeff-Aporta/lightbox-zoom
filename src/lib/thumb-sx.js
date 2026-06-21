/** Estilos de miniatura para LightboxZoomImage. */
export const DEFAULT_THUMB_SIZE = 100;

export function buildThumbSx(thumbSize) {
  const size = thumbSize || DEFAULT_THUMB_SIZE;
  return {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    maxWidth: size,
    maxHeight: size,
    objectFit: "cover",
    display: "block",
    borderRadius: 1.5,
    border: 1,
    borderColor: "divider",
    boxSizing: "border-box",
    flexShrink: 0,
    transition: "transform 0.22s ease, border-color 0.22s ease, filter 0.22s ease",
  };
}

export function buildGridThumbSx() {
  return {
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    maxWidth: "none",
    maxHeight: "none",
    objectFit: "cover",
    display: "block",
    borderRadius: 1,
    border: 0,
    boxSizing: "border-box",
    transition: "transform 0.22s ease, filter 0.22s ease",
  };
}

export function buildThumbTriggerSx(thumbSize) {
  const size = thumbSize || DEFAULT_THUMB_SIZE;
  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    maxWidth: size,
    maxHeight: size,
    borderRadius: 1.5,
    overflow: "hidden",
    cursor: "zoom-in",
    outline: "none",
    verticalAlign: "top",
    boxSizing: "border-box",
    p: 0,
    m: 0,
    boxShadow: (t) => (t.palette.mode === "dark" ? "0 2px 10px rgba(0,0,0,0.28)" : "0 4px 14px rgba(15,23,42,0.1)"),
    transition: "box-shadow 0.22s ease, transform 0.22s ease",
    "&:hover": {
      boxShadow: (t) => (t.palette.mode === "dark" ? "0 10px 28px rgba(0,0,0,0.45)" : "0 12px 32px rgba(15,23,42,0.18)"),
      transform: "translateY(-2px)",
      "& img": { transform: "scale(1.08)", borderColor: "primary.main", filter: "brightness(1.04)" },
    },
    "&:active": { transform: "translateY(0)" },
    "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
  };
}

export function buildGridTriggerSx() {
  return {
    position: "relative",
    display: "block",
    width: "100%",
    height: "100%",
    minHeight: 0,
    borderRadius: 1,
    overflow: "hidden",
    cursor: "zoom-in",
    outline: "none",
    p: 0,
    m: 0,
    "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
  };
}
