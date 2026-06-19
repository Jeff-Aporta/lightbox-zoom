const { Typography, Box, Stack, Chip } = MaterialUI;
const { LightboxZoomImage } = window.ISAComponents.LightboxZoom;

export function IntroPage() {
  return React.createElement(
    Box,
    null,
    React.createElement(Typography, { variant: "h4", className: "isa-lb-demo__section-title", gutterBottom: true }, "Introducción"),
    React.createElement(
      Typography,
      { variant: "body1", color: "text.secondary", paragraph: true },
      "Lightbox Zoom es la primera librería de ",
      React.createElement("strong", null, "@jeff-aporta"),
      ": un visor modal reutilizable para imágenes adjuntas, evidencias y galerías en los fronts ISA.",
    ),
    React.createElement(
      Box,
      { className: "tool-panel" },
      React.createElement(Typography, { variant: "subtitle1", gutterBottom: true }, "Identidad del paquete"),
      React.createElement(
        Stack,
        { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true },
        React.createElement(Chip, { label: "lightbox-zoom", size: "small" }),
        React.createElement(Chip, { label: "CSS: .isa-lb-zoom", size: "small", variant: "outlined" }),
        React.createElement(Chip, { label: "ISAComponents.LightboxZoom", size: "small", variant: "outlined" }),
      ),
    ),
    React.createElement(
      Box,
      { className: "tool-panel" },
      React.createElement(Typography, { variant: "subtitle1", gutterBottom: true }, "Vista previa"),
      React.createElement(
        Box,
        { className: "isa-lb-demo__gallery" },
        React.createElement(LightboxZoomImage, {
          ns: "ISA",
          src: "https://picsum.photos/seed/lbz1/480/320",
          alt: "Ejemplo 1",
          caption: "Miniatura con zoom al clic",
        }),
        React.createElement(LightboxZoomImage, {
          ns: "ISA",
          src: "https://picsum.photos/seed/lbz2/480/320",
          alt: "Ejemplo 2",
        }),
      ),
    ),
  );
}
