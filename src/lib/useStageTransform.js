/**
 * Zoom/pan/rotación del stage del lightbox.
 * Rueda + pinch, pan con arrastre, swipe entre slides a escala 1, pull-to-close.
 * Doble clic / doble toque → zoom 300% centrado en el punto del evento.
 */
import { getReact } from "./platform.js";

const { useState, useRef, useCallback, useEffect } = getReact();

export const STAGE_ZOOM_MIN = 0.25;
export const STAGE_ZOOM_MAX = 8;
export const STAGE_SPOT_ZOOM = 3;

const SWIPE_PX = 60;
const DBL_TAP_MS = 320;
const DBL_TAP_PX = 28;
const TAP_MOVE_PX = 12;
const CLOSE_VH = 0.3;

const clampScale = (v) => Math.max(STAGE_ZOOM_MIN, Math.min(STAGE_ZOOM_MAX, v));
const closeThreshold = () => (typeof window !== "undefined" ? window.innerHeight : 800) * CLOSE_VH;

export function useStageTransform({ onSwipe, onSwipeDown } = {}) {
  const [t, setT] = useState({ s: 1, x: 0, y: 0, r: 0 });
  const [pull, setPull] = useState({ active: false, progress: 0, dy: 0 });
  const stageRef = useRef(null);
  const ptrs = useRef(new Map());
  const single = useRef(null);
  const gest = useRef(null);
  const mode = useRef("pan");
  const swipe = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const onSwipeRef = useRef(onSwipe);
  const onSwipeDownRef = useRef(onSwipeDown);

  useEffect(() => {
    scaleRef.current = t.s;
  }, [t.s]);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
    onSwipeDownRef.current = onSwipeDown;
  }, [onSwipe, onSwipeDown]);

  const rel = useCallback((e) => {
    const el = stageRef.current || e.currentTarget;
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  }, []);

  const zoomToPoint = useCallback((targetScale, px, py, stageW, stageH) => {
    setT((p) => {
      const w = stageW ?? stageRef.current?.clientWidth ?? 0;
      const h = stageH ?? stageRef.current?.clientHeight ?? 0;
      const cx = w / 2;
      const cy = h / 2;
      const mx = px - cx;
      const my = py - cy;
      const s1 = p.s;
      const s2 = clampScale(targetScale);
      const ratio = s2 / s1;
      return { s: s2, x: p.x + mx * (1 - ratio), y: p.y + my * (1 - ratio), r: p.r };
    });
  }, []);

  const reset = useCallback(() => setT({ s: 1, x: 0, y: 0, r: 0 }), []);
  const zoomIn = useCallback(() => setT((p) => ({ ...p, s: clampScale(p.s * 1.2) })), []);
  const zoomOut = useCallback(() => setT((p) => ({ ...p, s: clampScale(p.s / 1.2) })), []);

  const spotZoomAt = useCallback(
    (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      const { x, y, w, h } = rel(e);
      zoomToPoint(STAGE_SPOT_ZOOM, x, y, w, h);
    },
    [rel, zoomToPoint],
  );

  const tryDoubleTap = useCallback(
    (x, y, w, h) => {
      const now = Date.now();
      const last = lastTap.current;
      if (now - last.t < DBL_TAP_MS && Math.hypot(x - last.x, y - last.y) < DBL_TAP_PX) {
        lastTap.current = { t: 0, x: 0, y: 0 };
        zoomToPoint(STAGE_SPOT_ZOOM, x, y, w, h);
        return true;
      }
      lastTap.current = { t: now, x, y };
      return false;
    },
    [zoomToPoint],
  );

  const onWheel = useCallback((e) => {
    if (e.cancelable) e.preventDefault();
    const k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setT((p) => ({ ...p, s: clampScale(p.s * k) }));
  }, []);

  const onPointerDown = useCallback((e) => {
    const { x, y } = rel(e);
    ptrs.current.set(e.pointerId, { x, y });
    if (ptrs.current.size === 1) {
      single.current = { x, y };
      gest.current = null;
      mode.current = e.pointerType === "touch" && scaleRef.current === 1 ? "swipe" : "pan";
      swipe.current = { x: 0, y: 0 };
    } else {
      single.current = null;
      gest.current = null;
      mode.current = "pan";
      setPull((p) => (p.active ? { active: false, progress: 0, dy: 0 } : p));
    }
  }, [rel]);

  const onPointerMove = useCallback(
    (e) => {
      if (!ptrs.current.has(e.pointerId)) return;
      const { x, y } = rel(e);
      ptrs.current.set(e.pointerId, { x, y });
      const pts = [...ptrs.current.values()];
      if (pts.length === 1 && single.current) {
        const dx = x - single.current.x;
        const dy = y - single.current.y;
        single.current = { x, y };
        if (mode.current === "swipe") {
          const sx = swipe.current.x + dx;
          const sy = swipe.current.y + dy;
          swipe.current = { x: sx, y: sy };
          if (sy > 0 && sy > Math.abs(sx)) {
            setPull({ active: true, dy: sy, progress: Math.min(1, sy / closeThreshold()) });
          } else {
            setPull((p) => (p.active ? { active: false, progress: 0, dy: 0 } : p));
          }
        } else {
          setT((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
        }
      } else if (pts.length >= 2) {
        const [a, b] = pts;
        const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        if (gest.current) {
          const k = dist / (gest.current.dist || dist);
          const dr = ((ang - gest.current.ang) * 180) / Math.PI;
          const dmx = mx - gest.current.mx;
          const dmy = my - gest.current.my;
          setT((p) => ({ ...p, s: clampScale(p.s * k), r: p.r + dr, x: p.x + dmx, y: p.y + dmy }));
        }
        gest.current = { dist, ang, mx, my };
      }
    },
    [rel],
  );

  const endPtr = useCallback(
    (e) => {
      const pt = rel(e);
      const wasSwipe = mode.current === "swipe";
      const { x: sx, y: sy } = swipe.current;

      ptrs.current.delete(e.pointerId);

      if (wasSwipe && ptrs.current.size === 0 && Math.abs(sx) < TAP_MOVE_PX && Math.abs(sy) < TAP_MOVE_PX) {
        if (tryDoubleTap(pt.x, pt.y, pt.w, pt.h)) {
          setPull({ active: false, progress: 0, dy: 0 });
          single.current = null;
          gest.current = null;
          mode.current = "pan";
          return;
        }
      }

      if (ptrs.current.size === 0) {
        if (wasSwipe) {
          if (Math.abs(sx) > Math.abs(sy)) {
            if (Math.abs(sx) >= SWIPE_PX) onSwipeRef.current?.(sx < 0 ? "next" : "prev");
          } else if (sy >= closeThreshold()) {
            onSwipeDownRef.current?.();
          }
        }
        setPull((p) => (p.active ? { active: false, progress: 0, dy: 0 } : p));
        single.current = null;
        gest.current = null;
        mode.current = "pan";
      } else if (ptrs.current.size === 1) {
        const v = [...ptrs.current.values()][0];
        single.current = v ? { ...v } : null;
        gest.current = null;
        mode.current = "pan";
      }
    },
    [rel, tryDoubleTap],
  );

  const transform = `translate(${t.x}px, ${t.y}px) scale(${t.s}) rotate(${t.r}deg)`;
  const bind = {
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp: endPtr,
    onPointerCancel: endPtr,
    onDoubleClick: spotZoomAt,
  };
  const transformed = t.s !== 1 || t.x !== 0 || t.y !== 0 || t.r !== 0;

  return {
    stageRef,
    transform,
    bind,
    reset,
    zoomIn,
    zoomOut,
    zoomToPoint,
    spotZoomAt,
    scalePct: Math.round(t.s * 100),
    transformed,
    pull,
  };
}

/** Alias export para compatibilidad con API anterior del paquete. */
export function useLightboxZoom(opts) {
  return useStageTransform(opts);
}
