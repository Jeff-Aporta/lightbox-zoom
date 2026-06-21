import { getReact, getMaterialUI } from "./lib/platform.js";
import { buildThumbSx, buildGridThumbSx, buildThumbTriggerSx, buildGridTriggerSx, DEFAULT_THUMB_SIZE } from "./lib/thumb-sx.js";
import { LightboxZoomDialog } from "./LightboxZoomDialog.jsx";

const { useState, useMemo } = getReact();

export function LightboxZoomImage({
  ns,
  src,
  alt = "",
  caption,
  sx,
  gallery,
  startIndex = 0,
  variant = "thumb",
  thumbSize = DEFAULT_THUMB_SIZE,
}) {
  const { Box } = getMaterialUI();
  const isGrid = variant === "grid";
  const thumbSx = useMemo(() => (isGrid ? buildGridThumbSx() : buildThumbSx(thumbSize)), [isGrid, thumbSize]);
  const thumbTriggerSx = useMemo(() => (isGrid ? buildGridTriggerSx() : buildThumbTriggerSx(thumbSize)), [isGrid, thumbSize]);

  const slides = useMemo(() => {
    if (Array.isArray(gallery) && gallery.length) return gallery;
    return [{ src, alt, caption }];
  }, [gallery, src, alt, caption]);

  const initial = useMemo(() => {
    if (!Array.isArray(gallery) || !gallery.length) return 0;
    const i = gallery.findIndex((g) => g.src === src);
    return i >= 0 ? i : startIndex;
  }, [gallery, src, startIndex]);

  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-label={"Ampliar imagen: " + (alt || caption || "evidencia")}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        sx={thumbTriggerSx}
      >
        <Box component="img" src={src} alt={alt} loading="lazy" sx={{ ...thumbSx, ...sx }} />
      </Box>
      <LightboxZoomDialog ns={ns} open={open} onClose={() => setOpen(false)} slides={slides} startIndex={initial} alt={alt} />
    </>
  );
}
