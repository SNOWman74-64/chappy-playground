import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

export async function syncReadCache(sourceFile, cacheFile) {
  const incoming = JSON.parse(await readFile(sourceFile, 'utf8'));
  if (incoming.schemaVersion !== 1 || incoming.isSnapshot !== true || incoming.nextCursor !== null
    || !Array.isArray(incoming.palicos) || incoming.total !== incoming.palicos.length
    || !Number.isFinite(Date.parse(incoming.generatedAt))) throw new Error('Invalid snapshot; cache not updated');
  let previous;
  try { previous = JSON.parse(await readFile(cacheFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  // Keep the timestamp of the last content change rather than committing every 30 minutes.
  const content = value => { const { generatedAt, ...rest } = value; return rest; };
  if (previous && isDeepStrictEqual(content(previous), content(incoming))) return false;
  await mkdir(dirname(cacheFile), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(incoming, null, 2) + '\n', 'utf8');
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv[2] || !process.argv[3]) throw new Error('Usage: sync-read-cache.mjs <snapshot.json> <cache.json>');
  const changed = await syncReadCache(process.argv[2], process.argv[3]);
  console.log(changed ? 'Read cache content updated.' : 'No data changes; retained existing cache and timestamp.');
}
