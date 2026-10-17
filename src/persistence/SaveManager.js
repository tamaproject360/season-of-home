export class SaveManager {
  constructor({ repository, capture, onStatus = () => {}, onSaved = () => {}, delayMs = 800 }) {
    this.repository = repository;
    this.capture = capture;
    this.onStatus = onStatus;
    this.onSaved = onSaved;
    this.delayMs = delayMs;
    this.queue = Promise.resolve();
    this.timer = null;
    this.disposed = false;
  }

  request() {
    if (this.disposed) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.save().catch(() => {}), this.delayMs);
  }

  save() {
    clearTimeout(this.timer);
    const job = this.queue.then(async () => {
      this.onStatus({ state: 'saving', message: 'Menyimpan…' });
      try {
        const saved = await this.repository.saveSlot(this.capture());
        this.onSaved(saved);
        this.onStatus({ state: this.repository.usingFallback ? 'session' : 'saved',
          message: this.repository.usingFallback ? 'Progres hanya sesi ini' : 'Tersimpan' });
        return saved;
      } catch (error) {
        this.onStatus({ state: 'error', message: 'Belum tersimpan. Buka Menu untuk mencoba lagi.', error });
        throw error;
      }
    });
    this.queue = job.catch(() => {});
    return job;
  }

  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
  }
}
