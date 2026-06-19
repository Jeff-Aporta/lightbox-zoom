import { IntroPage } from "./pages/Intro.jsx";
import { ApiPage } from "./pages/Api.jsx";
import { EjemplosPage } from "./pages/Ejemplos.jsx";
import { CasosUsoPage } from "./pages/CasosUso.jsx";

const { useState, useMemo } = React;
const {
  AppBar, Box, Button, Container, CssBaseline, Stack, Toolbar, Typography,
  ThemeProvider, createTheme,
} = MaterialUI;

const PAGES = [
  { id: "intro", label: "Introducción", Page: IntroPage },
  { id: "api", label: "API", Page: ApiPage },
  { id: "ejemplos", label: "Ejemplos", Page: EjemplosPage },
  { id: "casos", label: "Casos de uso", Page: CasosUsoPage },
];

function readScheme() {
  return document.documentElement.getAttribute("data-mui-color-scheme") === "light" ? "light" : "dark";
}

export function App() {
  const [page, setPage] = useState("intro");
  const [scheme, setScheme] = useState(readScheme);
  const theme = useMemo(() => createTheme({ palette: { mode: scheme } }), [scheme]);
  const { Icon } = window.ISA.UI;

  const toggleTheme = () => {
    const next = scheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-mui-color-scheme", next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("isa-components:lightbox-zoom:theme", next);
    } catch { /* ignore */ }
    setScheme(next);
  };

  const active = PAGES.find((p) => p.id === page) || PAGES[0];
  const Page = active.Page;

  return React.createElement(
    ThemeProvider,
    { theme },
    React.createElement(CssBaseline),
    React.createElement(
      Box,
      { className: "isa-lb-demo" },
      React.createElement(
        AppBar,
        { position: "sticky", color: "transparent", elevation: 0, className: "isa-lb-demo__header" },
        React.createElement(
          Toolbar,
          { sx: { flexWrap: "wrap", gap: 1, py: 1 } },
          React.createElement(
            Stack,
            { direction: "row", alignItems: "center", spacing: 1, sx: { flex: 1, minWidth: 200 } },
            React.createElement(Icon, { icon: "mdi:image-filter-center-focus", size: 26 }),
            React.createElement(
              Box,
              null,
              React.createElement(
                Typography,
                { variant: "h6", className: "isa-lb-demo__brand", component: "div", sx: { lineHeight: 1.2 } },
                "Lightbox Zoom",
                React.createElement(Box, { component: "span", className: "isa-lb-demo__badge", sx: { ml: 1 } }, "isa-components"),
              ),
              React.createElement(Typography, { variant: "caption", color: "text.secondary" }, "Visor con zoom, pan y galería para fronts ISA"),
            ),
          ),
          React.createElement(
            Stack,
            { direction: "row", className: "isa-lb-demo__nav", spacing: 0.5 },
            ...PAGES.map((p) =>
              React.createElement(
                Button,
                {
                  key: p.id,
                  size: "small",
                  variant: page === p.id ? "contained" : "text",
                  onClick: () => setPage(p.id),
                },
                p.label,
              ),
            ),
            React.createElement(
              Button,
              {
                size: "small",
                variant: "outlined",
                onClick: toggleTheme,
                startIcon: React.createElement(Icon, { icon: "mdi:theme-light-dark", size: 18 }),
              },
              "Tema",
            ),
          ),
        ),
      ),
      React.createElement(
        Container,
        { className: "isa-lb-demo__main", maxWidth: "md" },
        React.createElement(Page),
      ),
    ),
  );
}
