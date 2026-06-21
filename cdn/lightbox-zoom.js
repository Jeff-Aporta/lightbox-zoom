/**
 * @jeff-aporta/lightbox-zoom — CDN
 * Registra window.ISAComponents.LightboxZoom
 */
(() => {
  // src/lib/platform.js
  function getReact() {
    return window.ISAFront.getReact();
  }
  function getMaterialUI() {
    return window.ISAFront.getMaterialUI();
  }
  function resolveUi(ns) {
    const keys = ns ? [ns] : ["ISA", "ISAJ", "MO", "SCRUM", "FLS", "CFAI", "IAT"];
    for (let i = 0; i < keys.length; i++) {
      const bag = window[keys[i]];
      if (bag?.UI?.Icon) return bag.UI;
    }
    throw new Error("LightboxZoom: UI.Icon no disponible \u2014 ejecutar ISAFront.registerApp antes");
  }

  // src/lib/useStageTransform.js
  var { useState, useRef, useCallback, useEffect } = getReact();
  var STAGE_ZOOM_MIN = 0.25;
  var STAGE_ZOOM_MAX = 8;
  var STAGE_SPOT_ZOOM = 3;
  var SWIPE_PX = 60;
  var DBL_TAP_MS = 320;
  var DBL_TAP_PX = 28;
  var TAP_MOVE_PX = 12;
  var CLOSE_VH = 0.3;
  var clampScale = (v) => Math.max(STAGE_ZOOM_MIN, Math.min(STAGE_ZOOM_MAX, v));
  var closeThreshold = () => (typeof window !== "undefined" ? window.innerHeight : 800) * CLOSE_VH;
  function useStageTransform({ onSwipe, onSwipeDown } = {}) {
    const [t, setT] = useState({ s: 1, x: 0, y: 0, r: 0 });
    const [pull, setPull] = useState({ active: false, progress: 0, dy: 0 });
    const stageRef = useRef(null);
    const ptrs = useRef(/* @__PURE__ */ new Map());
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
      [rel, zoomToPoint]
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
      [zoomToPoint]
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
        setPull((p) => p.active ? { active: false, progress: 0, dy: 0 } : p);
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
              setPull((p) => p.active ? { active: false, progress: 0, dy: 0 } : p);
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
            const dr = (ang - gest.current.ang) * 180 / Math.PI;
            const dmx = mx - gest.current.mx;
            const dmy = my - gest.current.my;
            setT((p) => ({ ...p, s: clampScale(p.s * k), r: p.r + dr, x: p.x + dmx, y: p.y + dmy }));
          }
          gest.current = { dist, ang, mx, my };
        }
      },
      [rel]
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
          setPull((p) => p.active ? { active: false, progress: 0, dy: 0 } : p);
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
      [rel, tryDoubleTap]
    );
    const transform = `translate(${t.x}px, ${t.y}px) scale(${t.s}) rotate(${t.r}deg)`;
    const bind = {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp: endPtr,
      onPointerCancel: endPtr,
      onDoubleClick: spotZoomAt
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
      pull
    };
  }
  function useLightboxZoom(opts) {
    return useStageTransform(opts);
  }

  // src/LightboxZoomStage.jsx
  var ICON = {
    zoomIn: "mdi:magnify-plus-outline",
    zoomOut: "mdi:magnify-minus-outline",
    restore: "mdi:backup-restore",
    slidePrev: "mdi:chevron-left",
    slideNext: "mdi:chevron-right",
    open: "mdi:open-in-new",
    close: "mdi:close"
  };
  function LightboxZoomStage({
    ns,
    view,
    toolbarLeft = null,
    toolbarRight = null,
    gallery = null,
    slideIndex = 0,
    slideCount = 0,
    onSlidePrev,
    onSlideNext,
    onGoToSlide,
    caption = "",
    children = null,
    className = "isa-lb-zoom"
  }) {
    const { Box, IconButton, Tooltip, CircularProgress } = getMaterialUI();
    const UI = resolveUi(ns);
    const cur = gallery ? gallery[Math.min(slideIndex, slideCount - 1)] : null;
    const tbtn = (icon, title, onClick, size = 18) => /* @__PURE__ */ React.createElement(Tooltip, { title, key: title }, /* @__PURE__ */ React.createElement(IconButton, { onClick, size: "small", sx: { color: "inherit" }, "aria-label": title }, /* @__PURE__ */ React.createElement(UI.Icon, { icon, size })));
    const defaultLeft = gallery && slideCount > 1 ? /* @__PURE__ */ React.createElement(React.Fragment, null, tbtn(ICON.slidePrev, "Anterior", onSlidePrev), /* @__PURE__ */ React.createElement(Box, { component: "span", sx: { minWidth: 44, textAlign: "center", fontSize: 12, fontVariantNumeric: "tabular-nums", opacity: 0.85 } }, slideIndex + 1, " / ", slideCount), tbtn(ICON.slideNext, "Siguiente", onSlideNext)) : null;
    const defaultRight = gallery && cur?.src ? [[{ icon: ICON.open, title: "Abrir original", onClick: () => window.open(cur.src, "_blank", "noopener") }]] : [];
    const rightGroups = toolbarRight ?? defaultRight;
    return /* @__PURE__ */ React.createElement(Box, { className, sx: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: { xs: 1, sm: 2 } } }, /* @__PURE__ */ React.createElement(
      Box,
      {
        className: `${className}__toolbar`,
        sx: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, color: "rgba(255,255,255,0.92)", flexShrink: 0 }
      },
      /* @__PURE__ */ React.createElement(Box, { sx: { display: "inline-flex", alignItems: "center", gap: 0.25, flex: "1 1 0", minWidth: 0 } }, toolbarLeft ?? defaultLeft),
      /* @__PURE__ */ React.createElement(Box, { sx: { display: "inline-flex", alignItems: "center", gap: 0.25, flexShrink: 0 } }, tbtn(ICON.zoomOut, "Alejar", view.zoomOut), /* @__PURE__ */ React.createElement(Box, { component: "span", className: `${className}__zoom-label`, sx: { minWidth: 42, textAlign: "center", fontSize: 12, fontVariantNumeric: "tabular-nums", opacity: 0.85 } }, view.scalePct, "%"), tbtn(ICON.zoomIn, "Acercar", view.zoomIn), tbtn(ICON.restore, "Restaurar vista", view.reset)),
      /* @__PURE__ */ React.createElement(Box, { sx: { display: "inline-flex", alignItems: "center", gap: 1, flex: "1 1 0", minWidth: 0, justifyContent: "flex-end" } }, Array.isArray(rightGroups) && rightGroups.map((group, gi) => /* @__PURE__ */ React.createElement(Box, { key: gi, sx: { display: "inline-flex", alignItems: "center", gap: 0.25 } }, group.map((b) => tbtn(b.icon, b.title, b.onClick, b.size ?? 20)))))
    ), /* @__PURE__ */ React.createElement(
      Box,
      {
        className: `${className}__stage`,
        ref: view.stageRef,
        ...view.bind,
        sx: {
          position: "relative",
          flex: 1,
          minHeight: 0,
          display: "flex",
          overflow: "hidden",
          touchAction: "none",
          cursor: view.transformed ? "grab" : "default",
          p: { xs: 0.5, sm: 1.5 }
        }
      },
      view.pull.active && /* @__PURE__ */ React.createElement(
        Box,
        {
          sx: {
            position: "absolute",
            top: 14,
            left: "50%",
            zIndex: 10,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            transform: `translate(-50%, ${Math.min(view.pull.dy * 0.5, 160)}px)`
          }
        },
        /* @__PURE__ */ React.createElement(Box, { sx: { position: "relative", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
          CircularProgress,
          {
            variant: "determinate",
            value: Math.round(view.pull.progress * 100),
            size: 52,
            thickness: 4,
            sx: { color: view.pull.progress >= 1 ? "#ef4444" : "rgba(255,255,255,0.9)" }
          }
        ), /* @__PURE__ */ React.createElement(
          Box,
          {
            sx: {
              position: "absolute",
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: view.pull.progress >= 1 ? "#ef4444" : "rgba(255,255,255,0.14)",
              color: view.pull.progress >= 1 ? "#fff" : "rgba(255,255,255,0.92)",
              transition: "background-color 0.15s ease"
            }
          },
          /* @__PURE__ */ React.createElement(UI.Icon, { icon: "mdi:close", size: 22 })
        )),
        /* @__PURE__ */ React.createElement(Box, { sx: { fontSize: 11, fontWeight: 600, color: view.pull.progress >= 1 ? "#ef4444" : "rgba(255,255,255,0.78)" } }, view.pull.progress >= 1 ? "Soltar para cerrar" : "Desliza para cerrar")
      ),
      /* @__PURE__ */ React.createElement(
        Box,
        {
          sx: {
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: view.pull.active ? `translateY(${view.pull.dy}px) ${view.transform}` : view.transform,
            transformOrigin: "center center",
            opacity: view.pull.active ? 1 - 0.3 * view.pull.progress : 1
          }
        },
        gallery ? /* @__PURE__ */ React.createElement(
          "img",
          {
            src: cur?.src,
            alt: cur?.alt || "",
            draggable: false,
            style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", userSelect: "none", pointerEvents: "none" }
          }
        ) : children
      )
    ), gallery && (cur?.caption || cur?.alt) ? /* @__PURE__ */ React.createElement(Box, { sx: { textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 13, px: 2, pt: 0.5, flexShrink: 0 } }, cur.caption || cur.alt) : caption ? /* @__PURE__ */ React.createElement(Box, { sx: { textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 13, px: 2, pt: 0.5, flexShrink: 0 } }, caption) : null, gallery && slideCount > 1 && onGoToSlide ? /* @__PURE__ */ React.createElement(Box, { className: `${className}__dots`, sx: { display: "flex", justifyContent: "center", gap: 0.75, py: 1, flexShrink: 0 } }, gallery.map((_, i) => /* @__PURE__ */ React.createElement(
      Box,
      {
        key: i,
        onClick: () => onGoToSlide(i),
        sx: {
          width: 9,
          height: 9,
          borderRadius: "50%",
          cursor: "pointer",
          bgcolor: i === slideIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
          transition: "background-color 0.15s ease"
        }
      }
    ))) : null);
  }

  // src/LightboxZoomDialog.jsx
  var { useState: useState2, useCallback: useCallback2, useMemo, useEffect: useEffect2 } = getReact();
  function LightboxZoomDialog({
    ns,
    open,
    onClose,
    src,
    slides: slidesProp,
    startIndex = 0,
    alt = "Imagen adjunta",
    className = "isa-lb-zoom",
    closable = true,
    children = null,
    toolbarLeft = null,
    toolbarRight = null,
    caption = ""
  }) {
    const { Dialog } = getMaterialUI();
    const slides = useMemo(() => {
      if (Array.isArray(slidesProp) && slidesProp.length) return slidesProp;
      if (src) return [{ src, alt, caption }];
      return null;
    }, [slidesProp, src, alt, caption]);
    const gallery = slides?.length ? slides : null;
    const [idx, setIdx] = useState2(startIndex || 0);
    const slideCount = gallery ? gallery.length : 0;
    const goPrev = useCallback2(() => setIdx((i) => (i - 1 + slideCount) % slideCount), [slideCount]);
    const goNext = useCallback2(() => setIdx((i) => (i + 1) % slideCount), [slideCount]);
    const handleSwipe = useCallback2(
      (dir) => {
        if (slideCount > 1) (dir === "next" ? goNext : goPrev)();
      },
      [slideCount, goNext, goPrev]
    );
    const view = useStageTransform({
      onSwipe: handleSwipe,
      onSwipeDown: closable ? onClose : void 0
    });
    useEffect2(() => {
      if (open) setIdx(startIndex || 0);
    }, [open, startIndex]);
    useEffect2(() => {
      view.reset();
    }, [idx, open, view.reset]);
    useEffect2(() => {
      if (!open || !gallery || slideCount < 2) return void 0;
      const onKey = (e) => {
        if (e.key === "Escape" && closable) onClose?.();
        else if (e.key === "ArrowLeft") goPrev();
        else if (e.key === "ArrowRight") goNext();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, gallery, slideCount, goPrev, goNext, onClose, closable]);
    if (!open) return null;
    if (gallery && !gallery[0]?.src) return null;
    if (!gallery && !children) return null;
    const closeGroup = closable ? [[{ icon: "mdi:close", title: "Cerrar", onClick: onClose, size: 20 }]] : [];
    const mergedRight = toolbarRight ? [...Array.isArray(toolbarRight[0]) ? toolbarRight : [toolbarRight], ...closeGroup] : closeGroup;
    return /* @__PURE__ */ React.createElement(
      Dialog,
      {
        open,
        onClose: closable ? onClose : void 0,
        fullScreen: true,
        className: `${className}-dialog`,
        PaperProps: { sx: { bgcolor: "transparent", boxShadow: "none", borderRadius: 0, display: "flex", flexDirection: "column" } },
        slotProps: { backdrop: { sx: { bgcolor: "rgba(4,10,20,0.92)", backdropFilter: "blur(4px)" } } }
      },
      /* @__PURE__ */ React.createElement(
        LightboxZoomStage,
        {
          ns,
          view,
          className,
          gallery,
          slideIndex: idx,
          slideCount,
          onSlidePrev: goPrev,
          onSlideNext: goNext,
          onGoToSlide: setIdx,
          toolbarLeft,
          toolbarRight: mergedRight.length ? mergedRight : null,
          caption
        },
        children
      )
    );
  }

  // src/lib/thumb-sx.js
  var DEFAULT_THUMB_SIZE = 100;
  function buildThumbSx(thumbSize) {
    const size = thumbSize || DEFAULT_THUMB_SIZE;
    return {
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      maxWidth: size,
      maxHeight: size,
      objectFit: "cover",
      display: "block",
      borderRadius: 1.5,
      border: 1,
      borderColor: "divider",
      boxSizing: "border-box",
      flexShrink: 0,
      transition: "transform 0.22s ease, border-color 0.22s ease, filter 0.22s ease"
    };
  }
  function buildGridThumbSx() {
    return {
      width: "100%",
      height: "100%",
      minWidth: 0,
      minHeight: 0,
      maxWidth: "none",
      maxHeight: "none",
      objectFit: "cover",
      display: "block",
      borderRadius: 1,
      border: 0,
      boxSizing: "border-box",
      transition: "transform 0.22s ease, filter 0.22s ease"
    };
  }
  function buildThumbTriggerSx(thumbSize) {
    const size = thumbSize || DEFAULT_THUMB_SIZE;
    return {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      maxWidth: size,
      maxHeight: size,
      borderRadius: 1.5,
      overflow: "hidden",
      cursor: "zoom-in",
      outline: "none",
      verticalAlign: "top",
      boxSizing: "border-box",
      p: 0,
      m: 0,
      boxShadow: (t) => t.palette.mode === "dark" ? "0 2px 10px rgba(0,0,0,0.28)" : "0 4px 14px rgba(15,23,42,0.1)",
      transition: "box-shadow 0.22s ease, transform 0.22s ease",
      "&:hover": {
        boxShadow: (t) => t.palette.mode === "dark" ? "0 10px 28px rgba(0,0,0,0.45)" : "0 12px 32px rgba(15,23,42,0.18)",
        transform: "translateY(-2px)",
        "& img": { transform: "scale(1.08)", borderColor: "primary.main", filter: "brightness(1.04)" }
      },
      "&:active": { transform: "translateY(0)" },
      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 }
    };
  }
  function buildGridTriggerSx() {
    return {
      position: "relative",
      display: "block",
      width: "100%",
      height: "100%",
      minHeight: 0,
      borderRadius: 1,
      overflow: "hidden",
      cursor: "zoom-in",
      outline: "none",
      p: 0,
      m: 0,
      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 }
    };
  }

  // src/LightboxZoomImage.jsx
  var { useState: useState3, useMemo: useMemo2 } = getReact();
  function LightboxZoomImage({
    ns,
    src,
    alt = "",
    caption,
    sx,
    gallery,
    startIndex = 0,
    variant = "thumb",
    thumbSize = DEFAULT_THUMB_SIZE
  }) {
    const { Box } = getMaterialUI();
    const isGrid = variant === "grid";
    const thumbSx = useMemo2(() => isGrid ? buildGridThumbSx() : buildThumbSx(thumbSize), [isGrid, thumbSize]);
    const thumbTriggerSx = useMemo2(() => isGrid ? buildGridTriggerSx() : buildThumbTriggerSx(thumbSize), [isGrid, thumbSize]);
    const slides = useMemo2(() => {
      if (Array.isArray(gallery) && gallery.length) return gallery;
      return [{ src, alt, caption }];
    }, [gallery, src, alt, caption]);
    const initial = useMemo2(() => {
      if (!Array.isArray(gallery) || !gallery.length) return 0;
      const i = gallery.findIndex((g) => g.src === src);
      return i >= 0 ? i : startIndex;
    }, [gallery, src, startIndex]);
    const [open, setOpen] = useState3(false);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Box,
      {
        role: "button",
        tabIndex: 0,
        "aria-label": "Ampliar imagen: " + (alt || caption || "evidencia"),
        onClick: () => setOpen(true),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        },
        sx: thumbTriggerSx
      },
      /* @__PURE__ */ React.createElement(Box, { component: "img", src, alt, loading: "lazy", sx: { ...thumbSx, ...sx } })
    ), /* @__PURE__ */ React.createElement(LightboxZoomDialog, { ns, open, onClose: () => setOpen(false), slides, startIndex: initial, alt }));
  }

  // src/lib/svg-inline.js
  function svgElementToDataUrl(svgEl, opts) {
    if (!svgEl) return "";
    const clone = svgEl.cloneNode(true);
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (opts?.bg) {
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("width", "100%");
      bg.setAttribute("height", "100%");
      bg.setAttribute("fill", opts.bg);
      clone.insertBefore(bg, clone.firstChild);
    }
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  }
  function openLightboxInline(opts) {
    const d = opts || {};
    let src = d.src || "";
    if (!src && d.root) {
      const svg = d.root.querySelector?.("svg");
      src = svgElementToDataUrl(svg, d);
    }
    if (!src) return;
    document.dispatchEvent(new CustomEvent("isa-lb-zoom-inline-open", { detail: { ...d, src } }));
  }

  // src/LightboxZoomInline.jsx
  var { useState: useState4, useRef: useRef2, useCallback: useCallback3, useEffect: useEffect3 } = getReact();
  function LightboxZoomInline({ ns, children, caption, alt, className, sx, fullPage = false }) {
    const { Box } = getMaterialUI();
    const UI = resolveUi(ns);
    const containerRef = useRef2(null);
    const [open, setOpen] = useState4(false);
    const [slides, setSlides] = useState4([]);
    const onExpand = useCallback3(() => {
      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;
      setSlides([{ src: svgElementToDataUrl(svg), alt: alt || caption || "Diagrama", caption }]);
      setOpen(true);
    }, [alt, caption]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, { ref: containerRef, className: "isa-lb-zoom-inline " + (className || ""), sx: { position: "relative", ...sx } }, children, /* @__PURE__ */ React.createElement(
      Box,
      {
        className: "isa-lb-zoom-inline__expand",
        role: "button",
        tabIndex: 0,
        "aria-label": "Ampliar diagrama",
        title: "Ampliar (zoom/pan)",
        onClick: onExpand,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpand();
          }
        }
      },
      /* @__PURE__ */ React.createElement(UI.Icon, { icon: "mdi:arrow-expand", size: 18 })
    )), /* @__PURE__ */ React.createElement(LightboxZoomDialog, { ns, open, onClose: () => setOpen(false), slides, alt, className: fullPage ? "isa-lb-zoom isa-lb-zoom--fullpage" : "isa-lb-zoom" }));
  }
  function LightboxZoomInlineHost({ ns }) {
    const { useState: useState5, useEffect: useEffect4 } = getReact();
    const [state, setState] = useState5({ open: false, slides: [], ns: ns || "ISA" });
    useEffect4(() => {
      const onOpen = (e) => {
        const d = e.detail || {};
        if (!d.src) return;
        setState({
          open: true,
          slides: [{ src: d.src, alt: d.alt || d.caption || "Diagrama", caption: d.caption }],
          ns: d.ns || ns || "ISA"
        });
      };
      document.addEventListener("isa-lb-zoom-inline-open", onOpen);
      return () => document.removeEventListener("isa-lb-zoom-inline-open", onOpen);
    }, [ns]);
    return /* @__PURE__ */ React.createElement(
      LightboxZoomDialog,
      {
        ns: state.ns,
        open: state.open,
        onClose: () => setState((s) => ({ ...s, open: false })),
        slides: state.slides
      }
    );
  }

  // src/entry-iife.jsx
  var ZOOM_MIN = STAGE_ZOOM_MIN;
  var ZOOM_MAX = STAGE_ZOOM_MAX;
  var PAN_STEP = 40;
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
    useImageLightboxZoom: useLightboxZoom
  };
})();
