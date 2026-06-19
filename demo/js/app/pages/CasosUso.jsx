const { Typography, Box, List, ListItem, ListItemIcon, ListItemText } = MaterialUI;
const { Icon } = window.ISA.UI;

const CASOS = [
  { icon: "mdi:message-image", title: "Chat PatyIA", body: "Previews en compositor y log de conversación." },
  { icon: "mdi:ticket-outline", title: "Evidencias Jagudeloe", body: "Grid de métricas con galería navegable." },
  { icon: "mdi:gesture-pinch", title: "Zoom sin conflictos", body: "Ctrl+rueda para zoom; rueda sola pan cuando zoom>100%." },
];

export function CasosUsoPage() {
  return React.createElement(
    Box,
    null,
    React.createElement(Typography, { variant: "h4", className: "isa-lb-demo__section-title", gutterBottom: true }, "Casos de uso"),
    React.createElement(
      List,
      { className: "tool-panel" },
      ...CASOS.map((c) =>
        React.createElement(
          ListItem,
          { key: c.title, alignItems: "flex-start" },
          React.createElement(ListItemIcon, { sx: { minWidth: 40 } }, React.createElement(Icon, { icon: c.icon, size: 22 })),
          React.createElement(ListItemText, { primary: c.title, secondary: c.body, primaryTypographyProps: { fontWeight: 600 } }),
        ),
      ),
    ),
  );
}
