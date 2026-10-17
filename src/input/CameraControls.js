/** Camera-only zoom. World coordinates, movement and the DOM HUD stay unchanged. */
export class CameraControls {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.targetZoom = 1;
    this.baseZoom = 1;
    this.camera.setZoom(1);
    this.onResize = size => {
      if (!size?.width || !size?.height) return;
      this.baseZoom = Math.max(0.9, Math.min(1.6, Math.min(size.width / 960, size.height / 540)));
      this.camera.setSize?.(size.width, size.height);
      this.camera.setZoom(this.baseZoom * this.targetZoom);
    };
    this.onResize(scene.scale);
    scene.scale?.on('resize', this.onResize);

    this.onWheel = (pointer, objects, deltaX, deltaY) => {
      if (this.isBlocked(pointer?.event) || !Number.isFinite(deltaY) || deltaY === 0) return;
      pointer?.event?.preventDefault();
      this.setZoom(this.targetZoom - Math.max(-0.2, Math.min(0.2, deltaY * 0.001)));
    };
    this.onKeyDown = event => {
      if (this.isBlocked(event)) return;
      if (['Equal', 'NumpadAdd'].includes(event.code)) {
        event.preventDefault();
        this.setZoom(this.targetZoom + 0.1);
      } else if (['Minus', 'NumpadSubtract'].includes(event.code)) {
        event.preventDefault();
        this.setZoom(this.targetZoom - 0.1);
      } else if (['Digit0', 'Numpad0'].includes(event.code)) {
        event.preventDefault();
        this.setZoom(1);
      } else if (event.code === 'KeyC') {
        event.preventDefault();
        this.scene.toggleCameraAngle?.();
      }
    };
    this.destroy = () => {
      scene.input.off('wheel', this.onWheel);
      scene.input.keyboard.off('keydown', this.onKeyDown);
      scene.scale?.off('resize', this.onResize);
    };
    scene.input.on('wheel', this.onWheel);
    scene.input.keyboard.on('keydown', this.onKeyDown);
    scene.events.once('shutdown', this.destroy);
  }

  isBlocked(event) {
    return this.scene.inputRouter.isFrozen || event?.ctrlKey || event?.metaKey || event?.altKey ||
      event?.target?.closest?.('input, textarea, select, [contenteditable="true"]');
  }

  setZoom(value) {
    this.targetZoom = Math.round(Math.max(0.5, Math.min(1.75, value)) * 10000) / 10000;
  }

  update(deltaMs) {
    const target = this.targetZoom * this.baseZoom;
    if (this.scene.settings?.reducedMotion) { this.camera.setZoom(target); return; }
    const dt = Math.min(deltaMs / 1000, 0.1);
    const nextZoom = this.camera.zoom + (target - this.camera.zoom) * (1 - Math.exp(-14 * dt));
    this.camera.setZoom(Math.abs(nextZoom - target) < 0.001 ? target : nextZoom);
  }
}
