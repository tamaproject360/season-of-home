import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const manifest = JSON.parse(await readFile(resolve(root, 'build-manifest.json'), 'utf8'));
for (const file of ['index.html', 'lib/phaser.min.js', 'src/main.js', 'src/input/CameraControls.js',
  'src/systems/AudioSystem.js', 'asset/characters/joni_spritesheet.png', 'asset/terrain/fishing_pier.png']) {
  assert.ok((await stat(resolve(root, file))).isFile(), `${file} is included in the distribution`);
}
assert.ok(!manifest.files.some(file => file.path.startsWith('node_modules/') || file.path.startsWith('asset/raw/')));
const main = await readFile(resolve(root, 'src/main.js'), 'utf8');
assert.ok(main.includes('Phaser.Scale.RESIZE'), 'build contains the full-viewport fix');
console.log(`Standalone build checks PASS (${manifest.files.length} files, local engine/assets, no raw sources or node_modules)`);
