/**
 * Modal fullscreen — galería de imágenes o contenido custom (diagramas).
 */
import { getReact, getMaterialUI } from "./lib/platform.js";
import { useStageTransform } from "./lib/useStageTransform.js";
import { LightboxZoomStage } from "./LightboxZoomStage.jsx";

const { useState, useCallback, useMemo, useEffect } = getReact();

export function LightboxZoomDialog({
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
  caption = "",
}) {
  const { Dialog } = getMaterialUI();

  const slides = useMemo(() => {
    if (Array.isArray(slidesProp) && slidesProp.length) return slidesProp;
    if (src) return [{ src, alt, caption }];
    return null;
  }, [slidesProp, src, alt, caption]);

  const gallery = slides?.length ? slides : null;
  const [idx, setIdx] = useState(startIndex || 0);
  const slideCount = gallery ? gallery.length : 0;

  const goPrev = useCallback(() => setIdx((i) => (i - 1 + slideCount) % slideCount), [slideCount]);
  const goNext = useCallback(() => setIdx((i) => (i + 1) % slideCount), [slideCount]);

  const handleSwipe = useCallback(
    (dir) => {
      if (slideCount > 1) (dir === "next" ? goNext : goPrev)();
    },
    [slideCount, goNext, goPrev],
  );

  const view = useStageTransform({
    onSwipe: handleSwipe,
    onSwipeDown: closable ? onClose : undefined,
  });

  useEffect(() => {
    if (open) setIdx(startIndex || 0);
  }, [open, startIndex]);

  useEffect(() => {
    view.reset();
  }, [idx, open, view.reset]);

  useEffect(() => {
    if (!open || !gallery || slideCount < 2) return undefined;
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
  const mergedRight = toolbarRight ? [...(Array.isArray(toolbarRight[0]) ? toolbarRight : [toolbarRight]), ...closeGroup] : closeGroup;

  return (
    <Dialog
      open={open}
      onClose={closable ? onClose : undefined}
      fullScreen
      className={`${className}-dialog`}
      PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none", borderRadius: 0, display: "flex", flexDirection: "column" } }}
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(4,10,20,0.92)", backdropFilter: "blur(4px)" } } }}
    >
      <LightboxZoomStage
        ns={ns}
        view={view}
        className={className}
        gallery={gallery}
        slideIndex={idx}
        slideCount={slideCount}
        onSlidePrev={goPrev}
        onSlideNext={goNext}
        onGoToSlide={setIdx}
        toolbarLeft={toolbarLeft}
        toolbarRight={mergedRight.length ? mergedRight : null}
        caption={caption}
      >
        {children}
      </LightboxZoomStage>
    </Dialog>
  );
}
