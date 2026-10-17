import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist');
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'src', 'lib']) {
  await cp(join(root, entry), join(output, entry), { recursive: true });
}
await cp(join(root, 'asset'), join(output, 'asset'), {
  recursive: true,
  filter: source => !source.includes(`${sep}raw`)
});
const files = [];
async function inventory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'build-manifest.json') continue;
    const relative = join(prefix, entry.name);
    if (entry.isDirectory()) await inventory(join(directory, entry.name), relative);
    else files.push({ path: relative.replaceAll(sep, '/'), bytes: (await stat(join(directory, entry.name))).size });
  }
}
await inventory(output);
const packageInfo = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
await writeFile(join(output, 'build-manifest.json'), JSON.stringify({
  version: packageInfo.version, builtAt: new Date().toISOString(), files
}, null, 2));
console.log(`Standalone build: ${files.length} files, ${(files.reduce((sum, f) => sum + f.bytes, 0) / 1048576).toFixed(1)} MiB -> dist/`);
console.log('Preview: npm run preview');
