# @isa-components/lightbox-zoom

Visor de imágenes con zoom, pan y galería para fronts ISA (MUI + React).

## Paquete

| Artefacto | Ruta |
|-----------|------|
| JS minificado | `cdn/lightbox-zoom.min.js` → `window.ISAComponents.LightboxZoom` |
| CSS | `cdn/lightbox-zoom.min.css` (prefijo `.isa-lb-zoom`) |
| Loader | `cdn/load-lightbox-zoom.mjs` |

## Build

```bash
npm run build
cd ../../apps/src/scripts && npm run gen:component-demo -- --component lightbox
npm run sync:component-refs -- --from-git   # tras push: actualiza Personal@commit en consumidores
```

## Demo

- Local: servir `demo/` tras el build
- Producción: https://jeff-aporta.github.io/lightbox-zoom/

## Consumo

```javascript
import { ensureLightboxZoom } from ".../components/lightbox/cdn/load-lightbox-zoom.mjs";
await ensureLightboxZoom();
const { LightboxZoomDialog } = window.ISAComponents.LightboxZoom;
```
