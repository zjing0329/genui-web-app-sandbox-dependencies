import { randomUUID } from 'node:crypto';
import { closeSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const placeholder = /(\bappId\s*:\s*)(['"])__APP_ID__\2/g;

function needsAppId(source) {
  const count = [...source.matchAll(placeholder)].length;
  if (count > 1) throw new Error('Multiple appId placeholders in data.ts; keep one shared database initialization.');
  return count === 1;
}

/** Generate once in project source, before bundling; preserve every existing appId. */
export function ensureAppId(dataPath) {
  let source;
  try {
    source = readFileSync(dataPath, 'utf8');
  } catch (error) {
    // Read-only apps may remove the optional data layer entirely.
    if (error.code === 'ENOENT') return;
    throw error;
  }
  if (!needsAppId(source)) return;

  const lockPath = `${dataPath}.app-id.lock`;
  let lock;
  try {
    lock = openSync(lockPath, 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('appId initialization is already locked; finish the other build before retrying.');
    throw error;
  }
  try {
    source = readFileSync(dataPath, 'utf8');
    if (!needsAppId(source)) return;
    const appId = `app-${randomUUID()}`;
    writeFileSync(dataPath, source.replace(placeholder, (_match, prefix, quote) => `${prefix}${quote}${appId}${quote}`));
    return appId;
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}
