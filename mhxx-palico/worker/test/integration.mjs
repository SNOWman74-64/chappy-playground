import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

let mf;
const secret = crypto.randomUUID();
const origin = 'https://snowman74-64.github.io';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z1ZkAAAAASUVORK5CYII=', 'base64');
before(async () => {
  const built = await build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022' });
  mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: built.outputFiles[0].text, compatibilityDate: '2026-09-20',
    d1Databases: ['DB'], r2Buckets: ['IMAGES'], bindings: { UPLOAD_SECRET: secret, ALLOWED_ORIGINS: origin } }));
  const db = await mf.getD1Database('DB');
  for (const file of ['0001_palicos.sql', '0002_usage_guards.sql']) {
    const sql = await readFile(`migrations/${file}`, 'utf8');
    for (const statement of sql.split(';').filter(s => s.trim())) await db.prepare(statement).run();
  }
});
after(async () => { await mf?.dispose(); });
const request = (path, init = {}) => mf.dispatchFetch(`https://example.test${path}`, init);
async function upload({ key = crypto.randomUUID(), memo = '', supportType = '', body = png, auth = secret } = {}) {
  const form = new FormData();
  form.set('image', new Blob([body], { type: 'image/png' }), 'cat.png');
  form.set('supportType', supportType); form.set('memo', memo);
  const encoded = new Request('https://example.test', { method: 'POST', body: form });
  return request('/api/palicos', { method: 'POST', headers: { 'Content-Type': encoded.headers.get('Content-Type'), Authorization: `Bearer ${auth}`, 'Idempotency-Key': key, Origin: origin }, body: await encoded.arrayBuffer() });
}
test('image-only upload persists in D1 and R2 and is readable through detail/list/image', async () => {
  const response = await upload(); assert.equal(response.status, 201);
  const cat = await response.json();
  assert.match(cat.id, /^MHXX-\d{8}-\d{3,}$/); assert.equal(cat.verdict, 'unreviewed');
  assert.equal(cat.name, undefined); assert.equal(cat.supportMoves, undefined);
  const detail = await (await request(`/api/palicos/${cat.id}`)).json(); assert.deepEqual(detail, cat);
  const list = await (await request('/api/palicos')).json(); assert.ok(list.palicos.some(c => c.id === cat.id));
  const image = await request(`/api/palicos/${cat.id}/image`);
  assert.equal(image.headers.get('content-type'), 'image/png'); assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
  assert.ok(await (await mf.getR2Bucket('IMAGES')).head(cat.imageKey));
  assert.equal((await (await mf.getD1Database('DB')).prepare('SELECT verdict FROM palicos WHERE id=?').bind(cat.id).first()).verdict, 'unreviewed');
  assert.equal('request_hash' in cat, false);
});
test('retry and concurrent retries produce one record, changed payload conflicts', async () => {
  const key = crypto.randomUUID();
  const responses = await Promise.all([upload({ key, supportType: '回復' }), upload({ key, supportType: '回復' })]);
  const cats = await Promise.all(responses.map(r => { assert.ok([200,201].includes(r.status)); return r.json(); }));
  assert.equal(cats[0].id, cats[1].id);
  assert.equal((await upload({ key, supportType: '回復' })).status, 200);
  assert.equal((await upload({ key, memo: 'changed' })).status, 409);
  const db = await mf.getD1Database('DB');
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM palicos WHERE request_key=?').bind(key).first()).n, 1);
  const rows = (await db.prepare('SELECT image_key FROM palicos').all()).results;
  const objects = (await (await mf.getR2Bucket('IMAGES')).list()).objects;
  assert.equal(objects.length, rows.length, 'concurrent retry leaves no orphan image');
});
test('invalid secret, CORS, payloads, image type and length are rejected', async () => {
  assert.equal((await upload({ auth: 'wrong' })).status, 401);
  assert.equal((await request('/api/palicos', { headers: { Origin: 'https://evil.test' } })).status, 403);
  const preflight = await request('/api/palicos', { method: 'OPTIONS', headers: { Origin: origin } });
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal((await upload({ supportType: 'invalid' })).status, 400);
  assert.equal((await upload({ memo: 'x'.repeat(2001) })).status, 400);
  assert.equal((await upload({ body: Buffer.from('<svg></svg>') })).status, 415);
  assert.equal((await upload({ body: new Uint8Array(15 * 1024 * 1024 + 1) })).status, 413);
  assert.equal((await request('/api/palicos?cursor=broken')).status, 400);
  assert.equal((await request('/api/palicos?limit=1000')).status, 400);
  assert.equal((await request('/api/palicos/MHXX-20000101-999')).status, 404);
});
test('review metadata can be updated with authentication and filtered with pagination', async () => {
  const cat = await (await upload({ memo: 'review me' })).json();
  const patch = { name: 'テスト猫', level: 50, supportType: '回復', supportMoves: [{ name: '回復笛', group: 'fixed' }],
    skills: [{ name: '未判定スキル', group: 'unknown' }], supportPattern: 'ABBC', skillPattern: 'ABCCC', verdict: 'keep' };
  assert.equal((await request(`/api/palicos/${cat.id}`, { method: 'PATCH', body: JSON.stringify(patch) })).status, 401);
  const response = await request(`/api/palicos/${cat.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${secret}` }, body: JSON.stringify(patch) });
  assert.equal(response.status, 200); const reviewed = await response.json();
  for (const [key, value] of Object.entries(patch)) assert.deepEqual(reviewed[key],value);
  assert.equal(reviewed.memo, 'review me'); assert.equal(reviewed.imageKey, cat.imageKey);
  const changes = [{ name: '別名' }, { memo: '同時編集' }];
  await Promise.all(changes.map(p => request(`/api/palicos/${cat.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${secret}` }, body: JSON.stringify(p) })));
  const concurrent = await (await request(`/api/palicos/${cat.id}`)).json();
  assert.equal(concurrent.name, '別名'); assert.equal(concurrent.memo, '同時編集');
  assert.equal((await request(`/api/palicos/${cat.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${secret}` }, body: '{"verdict":null}' })).status,400);
  const keep = await (await request('/api/palicos?verdict=keep')).json(); assert.ok(keep.palicos.some(c => c.id === cat.id));
  let cursor, ids = [];
  do {
    const page = await (await request(`/api/palicos?limit=1${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)).json();
    ids.push(...page.palicos.map(c => c.id)); cursor = page.nextCursor;
  } while (cursor);
  assert.equal(ids.length, new Set(ids).size); assert.ok(ids.length >= 3);
});
test('free-tier guards stop R2 uploads and image reads at conservative limits', async () => {
  const cat = await (await upload()).json();
  const db = await mf.getD1Database('DB');
  const month = new Date().toISOString().slice(0,7);
  await db.prepare('INSERT INTO usage_guards(key,used) VALUES(?,20000) ON CONFLICT(key) DO UPDATE SET used=20000').bind(`image-reads:${month}`).run();
  assert.equal((await request(`/api/palicos/${cat.id}/image`)).status, 429);
  await db.prepare('UPDATE usage_guards SET used=500 WHERE key=?').bind(`uploads:${month}`).run();
  const countBefore = (await (await mf.getR2Bucket('IMAGES')).list()).objects.length;
  assert.equal((await upload()).status, 429);
  await db.prepare('UPDATE usage_guards SET used=0 WHERE key=?').bind(`uploads:${month}`).run();
  await db.prepare('UPDATE usage_guards SET used=? WHERE key=?').bind(512 * 1024 * 1024 - 1,'storage:reserved-bytes').run();
  const results = await Promise.all([upload(),upload()]);
  assert.ok(results.every(r => r.status === 429));
  assert.equal((await (await mf.getR2Bucket('IMAGES')).list()).objects.length, countBefore);
  assert.equal((await request(`/api/palicos/${cat.id}`)).status, 200);
});
