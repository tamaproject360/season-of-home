/** Synchronize the engine with its real DOM parent, including mobile rotation. */
export function syncViewportSize(game, parent) {
  if (!game.scale) return false;
  const rect = parent.getBoundingClientRect();
  const width = Math.round(rect.width), height = Math.round(rect.height);
  if (!width || !height || width === game.scale.width && height === game.scale.height) return false;
  game.scale.setParentSize(width, height);
  return true;
}

/** Install responsive parent/visual-viewport listeners and clean them up with the game. */
export function observeViewport(game, parent) {
  let frame = null;
  const schedule = () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => { frame = null; syncViewportSize(game, parent); });
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(parent);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  game.events.once('destroy', () => {
    observer.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
  });
  schedule();
}
