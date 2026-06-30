const { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Paper } = MaterialUI;

const PROPS = [
  ["LightboxZoomDialog", "open, onClose, src | slides, startIndex, alt, ns", "Modal con toolbar"],
  ["LightboxZoomImage", "src, alt, gallery, variant, thumbSize, ns", "Trigger + dialog"],
  ["LightboxZoomInline", "children, caption, alt, ns", "Contenedor inline → SVG/data URL + zoom"],
  ["openLightboxInline", "{ src | root, caption, alt, ns }", "Abrir modal desde SVG custom"],
  ["svgElementToDataUrl", "svgEl, { bg }", "Serializa SVG a data URL"],
  ["useLightboxZoom", "open, slideKey", "Hook zoom/pan custom"],
];

export function ApiPage() {
  return React.createElement(
    Box,
    null,
    React.createElement(Typography, { variant: "h4", className: "isa-lb-demo__section-title", gutterBottom: true }, "API"),
    React.createElement(
      Typography,
      { variant: "body1", color: "text.secondary", paragraph: true },
      "Runtime: ",
      React.createElement("code", null, "window.ISAComponents.LightboxZoom"),
      " — alias legacy: ImageLightboxDialog, LightboxImage.",
    ),
    React.createElement(
      Paper,
      { variant: "outlined", sx: { overflow: "hidden", mb: 2 } },
      React.createElement(
        Table,
        { size: "small" },
        React.createElement(
          TableHead,
          null,
          React.createElement(
            TableRow,
            null,
            React.createElement(TableCell, null, "Export"),
            React.createElement(TableCell, null, "Props"),
            React.createElement(TableCell, null, "Uso"),
          ),
        ),
        React.createElement(
          TableBody,
          null,
          ...PROPS.map(([name, props, uso]) =>
            React.createElement(
              TableRow,
              { key: name },
              React.createElement(TableCell, null, React.createElement("code", null, name)),
              React.createElement(TableCell, null, props),
              React.createElement(TableCell, null, uso),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Box,
      { className: "tool-panel", sx: { overflow: "hidden", mb: 2 } },
      React.createElement(Typography, { variant: "subtitle1", gutterBottom: true }, "CDN (sin bundlear front-shared)"),
      React.createElement(
        "pre",
        null,
        `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Jeff-Aporta/lightbox-zoom@549d6b6/cdn/lightbox-zoom.min.css" />
<script defer src="https://cdn.jsdelivr.net/gh/Jeff-Aporta/lightbox-zoom@549d6b6/cdn/lightbox-zoom.min.js"></script>`,
      ),
    ),
  );
}
