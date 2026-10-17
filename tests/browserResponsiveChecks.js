/** Browser-only viewport, modal, and touch-input acceptance checks. */
export async function runResponsiveChecks(slotId = 1) {
  const game = window.__SOH_GAME__;
  const wait = async predicate => {
    for (let i = 0; i < 150; i++) {
      if (predicate()) return;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Timed out waiting for responsive gameplay scene.');
  };
  if (!game.scene.isActive('GameScene')) {
    await wait(() => document.querySelector(`[data-load="${slotId}"]`));
    document.querySelector(`[data-load="${slotId}"]`).click();
  }
  await wait(() => game.scene.isActive('GameScene') && game.scene.getScene('UIScene').lifePanels);
  const scene = game.scene.getScene('GameScene'), ui = game.scene.getScene('UIScene');
  ui.phase4Panels.close();
  await new Promise(resolve => requestAnimationFrame(resolve));
  const canvas = game.canvas.getBoundingClientRect();
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  assert(Math.abs(canvas.width - innerWidth) < 1 && Math.abs(canvas.height - innerHeight) < 1 &&
    Math.abs(canvas.x) < 1 && Math.abs(canvas.y) < 1, 'Canvas must fill the complete viewport');
  const dpad = document.querySelector('#virtual-dpad').getBoundingClientRect();
  const hotbar = document.querySelector('#hotbar-container').getBoundingClientRect();
  const overlaps = dpad.left < hotbar.right && dpad.right > hotbar.left && dpad.top < hotbar.bottom && dpad.bottom > hotbar.top;
  assert(!overlaps, 'Hotbar must not cover the virtual D-pad');
  const button = document.querySelector('#dpad-up');
  button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 7 }));
  assert(scene.inputRouter.touch.getMovementVector().y === -1, 'Touch D-pad must produce movement');
  button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 7 }));
  assert(scene.inputRouter.touch.getMovementVector().y === 0, 'Touch D-pad releases cleanly');
  ui.phase4Panels.openSettings();
  const modal = ui.phase4Panels.root.querySelector('.modal-window').getBoundingClientRect();
  assert(modal.left >= 0 && modal.right <= innerWidth + 1 && modal.top >= 0 && modal.bottom <= innerHeight + 1,
    'Settings modal must fit within the viewport');
  assert(scene.worldClock.isFrozen && scene.inputRouter.isFrozen, 'Settings must pause gameplay');
  ui.phase4Panels.close();
  if (!scene.inventory.hasItem('tool_fishing_rod')) scene.economy.buy('tool_fishing_rod', 1);
  ui.lifePanels.openFishing();
  const reel = ui.phase4Panels.root.querySelector('[data-reel]');
  assert(reel, 'Touch fishing control must be available');
  reel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 8 }));
  assert(ui.lifePanels.held, 'Holding the touch reel activates fishing control');
  reel.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', pointerId: 8 }));
  assert(!ui.lifePanels.held, 'Releasing the touch reel clears fishing control');
  ui.phase4Panels.close();
  assert(!scene.worldClock.isFrozen && !scene.inputRouter.isFrozen, 'Closing a modal resumes gameplay');
  return { viewport: `${innerWidth}x${innerHeight}`, canvasFillsViewport: true, hotbarClearOfDpad: true,
    touchMovement: true, modalFits: true, touchFishing: true, pauseResume: true };
}
