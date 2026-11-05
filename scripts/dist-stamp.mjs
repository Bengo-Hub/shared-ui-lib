// dist is committed and is what apps import, so a tag whose dist was not rebuilt ships nothing, and
// nothing else notices: v0.1.128 passed its type-check and deployed everywhere with the old code.
//
// `node scripts/dist-stamp.mjs write` records a fingerprint of the sources in dist after a build.
// `node scripts/dist-stamp.mjs check` fails when the committed dist was not built from these sources.
// CI runs the check before it builds, so it sees the dist that was committed.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const stampPath = join(root, 'dist', 'SOURCE_STAMP');

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.test\.tsx?$/.test(entry.name) ? [] : [path];
  });
}

/** Line endings are normalized and paths use forward slashes, so Windows and CI agree. */
function fingerprint() {
  const hash = createHash('sha256');
  const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  hash.update(version);
  const files = [...sourceFiles(join(root, 'src')), join(root, 'tsup.config.ts')]
    .map((path) => [relative(root, path).replaceAll('\\', '/'), path])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [name, path] of files) {
    hash.update(`\n${name}\n`);
    hash.update(readFileSync(path, 'utf8').replaceAll('\r\n', '\n'));
  }
  return hash.digest('hex');
}

const mode = process.argv[2];
if (mode === 'write') {
  writeFileSync(stampPath, `${fingerprint()}\n`);
} else if (mode === 'check') {
  const committed = existsSync(stampPath) ? readFileSync(stampPath, 'utf8').trim() : '';
  if (committed !== fingerprint()) {
    console.error('dist was not built from these sources. Run `pnpm build` and commit dist before tagging.');
    process.exit(1);
  }
  console.log('dist matches the sources.');
} else {
  console.error('usage: node scripts/dist-stamp.mjs write|check');
  process.exit(2);
}
