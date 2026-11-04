/**
 * Runs `update` once now and then at most once per animation frame while the
 * window scrolls or resizes. Returns a function that removes the listeners.
 */
export function onScrollFrame(update: () => void): () => void {
  let frame = 0;
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  }
  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}
