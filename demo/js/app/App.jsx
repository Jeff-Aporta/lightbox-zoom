import { IntroPage } from "./pages/Intro.jsx";
import { ApiPage } from "./pages/Api.jsx";
import { EjemplosPage } from "./pages/Ejemplos.jsx";
import { CasosUsoPage } from "./pages/CasosUso.jsx";

const { useState, useEffect } = React;
const { Box } = MaterialUI;

const BRAND_HOME_EVENT = "isa:brand-home";

const PAGES = [
  { id: "intro", label: "Introducción", icon: "mdi:book-open-page-variant-outline", Page: IntroPage },
  { id: "api", label: "API", icon: "mdi:code-braces", Page: ApiPage },
  { id: "ejemplos", label: "Ejemplos", icon: "mdi:image-multiple-outline", Page: EjemplosPage },
  { id: "casos", label: "Casos de uso", icon: "mdi:lightbulb-on-outline", Page: CasosUsoPage },
];

export function App() {
  const [page, setPage] = useState("intro");

  useEffect(() => {
    function onBrandHome() { setPage("intro"); }
    window.addEventListener(BRAND_HOME_EVENT, onBrandHome);
    return () => window.removeEventListener(BRAND_HOME_EVENT, onBrandHome);
  }, []);

  const Shell = window.ISAFront?.Layout?.AppShell;
  if (!Shell) throw new Error("AppShell no cargado — revisar loader.mjs");

  const active = PAGES.find((p) => p.id === page) || PAGES[0];
  const Page = active.Page;

  return React.createElement(
    Shell,
    {
      ns: "ISA",
      showTarget: false,
      bodyScroll: true,
      navRows: [{
        id: "doc",
        value: page,
        onChange: setPage,
        tabs: PAGES.map(({ id, label, icon }) => ({ id, label, icon })),
      }],
    },
    React.createElement(
      Box,
      { className: "isa-lb-demo__main" },
      React.createElement(Page),
    ),
  );
}
