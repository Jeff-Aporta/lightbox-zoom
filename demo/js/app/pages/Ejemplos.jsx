const { Typography, Box } = MaterialUI;
const { LightboxZoomImage, LightboxZoomDialog } = window.ISAComponents.LightboxZoom;
const { useState } = React;

const GALLERY = [
  { src: "https://picsum.photos/seed/g1/900/600", alt: "Paisaje 1", caption: "Slide 1" },
  { src: "https://picsum.photos/seed/g2/900/600", alt: "Paisaje 2", caption: "Slide 2" },
  { src: "https://picsum.photos/seed/g3/900/600", alt: "Paisaje 3", caption: "Slide 3" },
];

export function EjemplosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return React.createElement(
    Box,
    null,
    React.createElement(Typography, { variant: "h4", className: "isa-lb-demo__section-title", gutterBottom: true }, "Ejemplos"),
    React.createElement(
      Box,
      { className: "isa-lb-demo__card" },
      React.createElement(Typography, { variant: "subtitle1", gutterBottom: true }, "Miniatura"),
      React.createElement(
        Box,
        { className: "isa-lb-demo__gallery" },
        React.createElement(LightboxZoomImage, { ns: "ISA", src: GALLERY[0].src, alt: GALLERY[0].alt, gallery: GALLERY, thumbSize: 120 }),
        React.createElement(LightboxZoomImage, { ns: "ISA", src: GALLERY[1].src, alt: GALLERY[1].alt, gallery: GALLERY, thumbSize: 120 }),
      ),
    ),
    React.createElement(
      Box,
      { className: "isa-lb-demo__card" },
      React.createElement(Typography, { variant: "subtitle1", gutterBottom: true }, "Grid"),
      React.createElement(
        Box,
        { className: "isa-lb-demo__grid" },
        GALLERY.map((g, i) =>
          React.createElement(
            Box,
            { key: g.src, sx: { aspectRatio: "4/3" } },
            React.createElement(LightboxZoomImage, { ns: "ISA", src: g.src, alt: g.alt, gallery: GALLERY, startIndex: i, variant: "grid" }),
          ),
        ),
      ),
    ),
    React.createElement(
      Box,
      { className: "isa-lb-demo__card" },
      React.createElement(Typography, { variant: "subtitle1", gutterBottom: true }, "Dialog programático"),
      React.createElement(
        "button",
        { type: "button", className: "MuiButton-root MuiButton-contained MuiButton-containedPrimary", onClick: () => setDialogOpen(true) },
        "Abrir LightboxZoomDialog",
      ),
      React.createElement(LightboxZoomDialog, { ns: "ISA", open: dialogOpen, onClose: () => setDialogOpen(false), slides: GALLERY }),
    ),
  );
}
