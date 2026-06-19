# lightbox-zoom (@jeff-aporta)

Visor de imágenes con zoom, pan y galería para fronts ISA (MUI + React). Distribución **solo CDN** (jsDelivr + GH Pages).

## Paquete

| Artefacto | Ruta |
|-----------|------|
| JS minificado | `cdn/lightbox-zoom.min.js` → `window.ISAComponents.LightboxZoom` |
| CSS | `cdn/lightbox-zoom.min.css` (prefijo `.isa-lb-zoom`) |

## Build

```bash
npm run build
cd ../../apps/src/scripts && npm run gen:component-demo -- --component lightbox
npm run sync:component-refs -- --from-git   # actualiza LIGHTBOX_ZOOM_REF y URLs en consumidores
```

## Demo

- Local: servir `demo/` tras el build
- Producción: https://jeff-aporta.github.io/lightbox-zoom/

## Consumo

En cada front, `js/boot/cdn.mjs` incluye el bloque `@isa-lightbox-boot` (generado/actualizado por `sync-component-refs.mjs`):

```javascript
import { ensureLightboxZoom } from "./cdn.mjs";
await ensureLightboxZoom();
const { LightboxZoomDialog } = window.ISAComponents.LightboxZoom;
```

El pin jsDelivr (`LIGHTBOX_ZOOM_REF`) vive en `cdn/versions.json` y se propaga con `npm run sync:component-refs`.
