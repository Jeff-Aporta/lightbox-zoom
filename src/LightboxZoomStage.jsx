/**
 * Stage fullscreen del lightbox — toolbar 3 zonas, gestos, pull-to-close.
 * Base del visor tk-diagram-viewer (DiagramLightbox jagudeloe).
 */
import { getMaterialUI, resolveUi } from "./lib/platform.js";

const ICON = {
  zoomIn: "mdi:magnify-plus-outline",
  zoomOut: "mdi:magnify-minus-outline",
  restore: "mdi:backup-restore",
  slidePrev: "mdi:chevron-left",
  slideNext: "mdi:chevron-right",
  open: "mdi:open-in-new",
  close: "mdi:close",
};

export function LightboxZoomStage({
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
  className = "isa-lb-zoom",
}) {
  const { Box, IconButton, Tooltip, CircularProgress } = getMaterialUI();
  const UI = resolveUi(ns);
  const cur = gallery ? gallery[Math.min(slideIndex, slideCount - 1)] : null;

  const tbtn = (icon, title, onClick, size = 18) => (
    <Tooltip title={title} key={title}>
      <IconButton onClick={onClick} size="small" sx={{ color: "inherit" }} aria-label={title}>
        <UI.Icon icon={icon} size={size} />
      </IconButton>
    </Tooltip>
  );

  const defaultLeft =
    gallery && slideCount > 1 ? (
      <>
        {tbtn(ICON.slidePrev, "Anterior", onSlidePrev)}
        <Box component="span" sx={{ minWidth: 44, textAlign: "center", fontSize: 12, fontVariantNumeric: "tabular-nums", opacity: 0.85 }}>
          {slideIndex + 1} / {slideCount}
        </Box>
        {tbtn(ICON.slideNext, "Siguiente", onSlideNext)}
      </>
    ) : null;

  const defaultRight =
    gallery && cur?.src
      ? [[{ icon: ICON.open, title: "Abrir original", onClick: () => window.open(cur.src, "_blank", "noopener") }]]
      : [];

  const rightGroups = toolbarRight ?? defaultRight;

  return (
    <Box className={className} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: { xs: 1, sm: 2 } }}>
      <Box
        className={`${className}__toolbar`}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, color: "rgba(255,255,255,0.92)", flexShrink: 0 }}
      >
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, flex: "1 1 0", minWidth: 0 }}>
          {toolbarLeft ?? defaultLeft}
        </Box>

        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
          {tbtn(ICON.zoomOut, "Alejar", view.zoomOut)}
          <Box component="span" className={`${className}__zoom-label`} sx={{ minWidth: 42, textAlign: "center", fontSize: 12, fontVariantNumeric: "tabular-nums", opacity: 0.85 }}>
            {view.scalePct}%
          </Box>
          {tbtn(ICON.zoomIn, "Acercar", view.zoomIn)}
          {tbtn(ICON.restore, "Restaurar vista", view.reset)}
        </Box>

        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, flex: "1 1 0", minWidth: 0, justifyContent: "flex-end" }}>
          {Array.isArray(rightGroups) &&
            rightGroups.map((group, gi) => (
              <Box key={gi} sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                {group.map((b) => tbtn(b.icon, b.title, b.onClick, b.size ?? 20))}
              </Box>
            ))}
        </Box>
      </Box>

      <Box
        className={`${className}__stage`}
        ref={view.stageRef}
        {...view.bind}
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          display: "flex",
          overflow: "hidden",
          touchAction: "none",
          cursor: view.transformed ? "grab" : "default",
          p: { xs: 0.5, sm: 1.5 },
        }}
      >
        {view.pull.active && (
          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: "50%",
              zIndex: 10,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              transform: `translate(-50%, ${Math.min(view.pull.dy * 0.5, 160)}px)`,
            }}
          >
            <Box sx={{ position: "relative", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress
                variant="determinate"
                value={Math.round(view.pull.progress * 100)}
                size={52}
                thickness={4}
                sx={{ color: view.pull.progress >= 1 ? "#ef4444" : "rgba(255,255,255,0.9)" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: view.pull.progress >= 1 ? "#ef4444" : "rgba(255,255,255,0.14)",
                  color: view.pull.progress >= 1 ? "#fff" : "rgba(255,255,255,0.92)",
                  transition: "background-color 0.15s ease",
                }}
              >
                <UI.Icon icon="mdi:close" size={22} />
              </Box>
            </Box>
            <Box sx={{ fontSize: 11, fontWeight: 600, color: view.pull.progress >= 1 ? "#ef4444" : "rgba(255,255,255,0.78)" }}>
              {view.pull.progress >= 1 ? "Soltar para cerrar" : "Desliza para cerrar"}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: view.pull.active ? `translateY(${view.pull.dy}px) ${view.transform}` : view.transform,
            transformOrigin: "center center",
            opacity: view.pull.active ? 1 - 0.3 * view.pull.progress : 1,
          }}
        >
          {gallery ? (
            <img
              src={cur?.src}
              alt={cur?.alt || ""}
              draggable={false}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", userSelect: "none", pointerEvents: "none" }}
            />
          ) : (
            children
          )}
        </Box>
      </Box>

      {gallery && (cur?.caption || cur?.alt) ? (
        <Box sx={{ textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 13, px: 2, pt: 0.5, flexShrink: 0 }}>
          {cur.caption || cur.alt}
        </Box>
      ) : caption ? (
        <Box sx={{ textAlign: "center", color: "rgba(255,255,255,0.82)", fontSize: 13, px: 2, pt: 0.5, flexShrink: 0 }}>{caption}</Box>
      ) : null}

      {gallery && slideCount > 1 && onGoToSlide ? (
        <Box className={`${className}__dots`} sx={{ display: "flex", justifyContent: "center", gap: 0.75, py: 1, flexShrink: 0 }}>
          {gallery.map((_, i) => (
            <Box
              key={i}
              onClick={() => onGoToSlide(i)}
              sx={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                cursor: "pointer",
                bgcolor: i === slideIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                transition: "background-color 0.15s ease",
              }}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
