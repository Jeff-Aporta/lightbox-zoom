/**
 * @jeff-aporta/lightbox-zoom — entry IIFE → window.ISAComponents.LightboxZoom
 */
import { STAGE_ZOOM_MIN, STAGE_ZOOM_MAX, STAGE_SPOT_ZOOM, useStageTransform, useLightboxZoom } from "./lib/useStageTransform.js";
import { LightboxZoomDialog } from "./LightboxZoomDialog.jsx";
import { LightboxZoomImage } from "./LightboxZoomImage.jsx";
import { LightboxZoomInline, LightboxZoomInlineHost } from "./LightboxZoomInline.jsx";
import { LightboxZoomStage } from "./LightboxZoomStage.jsx";
import { svgElementToDataUrl, openLightboxInline } from "./lib/svg-inline.js";

const ZOOM_MIN = STAGE_ZOOM_MIN;
const ZOOM_MAX = STAGE_ZOOM_MAX;
const PAN_STEP = 40;

globalThis.ISAComponents = globalThis.ISAComponents || {};
globalThis.ISAComponents.LightboxZoom = {
  LightboxZoomDialog,
  LightboxZoomImage,
  LightboxZoomInline,
  LightboxZoomInlineHost,
  LightboxZoomStage,
  useLightboxZoom,
  useStageTransform,
  svgElementToDataUrl,
  openLightboxInline,
  ZOOM_MIN,
  ZOOM_MAX,
  PAN_STEP,
  STAGE_SPOT_ZOOM,
  ImageLightboxDialog: LightboxZoomDialog,
  LightboxImage: LightboxZoomImage,
  useImageLightboxZoom: useLightboxZoom,
};
