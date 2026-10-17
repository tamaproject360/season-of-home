import { copyData, validateSave } from './SaveSerializer.js';

/** Normalize legacy snapshots idempotently while protecting unsupported future versions. */
export function migrateSave(input) {
  if (input?.schemaVersion > 1) {
    const error = new Error('Save dibuat oleh versi game yang lebih baru. Data tidak diubah.');
    error.code = 'FUTURE_VERSION';
    throw error;
  }
  const save = copyData(input);
  // Legacy Phase 4 development snapshots had the same payload but no version.
  if (save && (save.schemaVersion === undefined || save.schemaVersion === 0)) save.schemaVersion = 1;
  validateSave(save);
  return save;
}
