import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { API_BASE } from '../config.js';

export const PAGES_BASE = 'https://snowman74-64.github.io/chappy-playground/mhxx-palico';
const fields = ['id','createdAt','updatedAt','imageKey','name','level','supportType','supportMoves','skills','supportPattern','skillPattern','verdict','memo'];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export async function fetchPalicos({ fetchImpl = fetch, apiBase = API_BASE, maxPages = 100 } = {}) {
  const palicos = [];
  const seenIds = new Set();
  const seenCursors = new Set();
  let cursor = null;
  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL(`${apiBase}/api/palicos`);
    url.searchParams.set('limit','100');
    if (cursor) url.searchParams.set('cursor',cursor);
    const response = await fetchImpl(url, { headers: { Accept:'application/json' }, signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Snapshot source returned HTTP ${response.status}`);
    const body = await response.json();
    if (!body || !Array.isArray(body.palicos) || !(body.nextCursor === null || (typeof body.nextCursor === 'string' && body.nextCursor))) {
      throw new Error('Invalid list response: snapshot was not published');
    }
    for (const source of body.palicos) {
      if (!source || !/^MHXX-\d{8}-\d+$/.test(source.id) || seenIds.has(source.id)
        || typeof source.createdAt !== 'string' || typeof source.updatedAt !== 'string'
        || !Number.isFinite(Date.parse(source.createdAt)) || !Number.isFinite(Date.parse(source.updatedAt))
        || typeof source.imageKey !== 'string' || !['unreviewed','keep','hold','reject'].includes(source.verdict)) {
        throw new Error('Invalid or duplicate Palico: snapshot was not published');
      }
      seenIds.add(source.id);
      palicos.push(Object.fromEntries(fields.filter(key => source[key] !== undefined).map(key => [key,source[key]])));
    }
    if (body.nextCursor === null) return palicos;
    if (seenCursors.has(body.nextCursor)) throw new Error('Pagination cursor repeated');
    seenCursors.add(body.nextCursor);
    cursor = body.nextCursor;
  }
  throw new Error('Snapshot exceeds pagination safety limit; refusing to publish a partial list');
}

export function makeSnapshot(palicos, { generatedAt = new Date().toISOString(), apiBase = API_BASE, pagesBase = PAGES_BASE } = {}) {
  return {
    schemaVersion: 1,
    generatedAt,
    isSnapshot: true,
    refreshIntervalMinutes: 30,
    refreshNote: '約30分間隔で更新。GitHub Actionsの遅延・停止時は古いコピーが残ります。generatedAtを確認してください。',
    sourceUrl: `${apiBase}/api/palicos`,
    total: palicos.length,
    nextCursor: null,
    palicos: palicos.map(cat => ({ ...cat,
      detailUrl: `${pagesBase}/read/palicos/${cat.id}.json`,
      liveDetailUrl: `${apiBase}/api/palicos/${cat.id}`,
      imageUrl: `${apiBase}/api/palicos/${cat.id}/image`,
    })),
  };
}

export function renderReadPage(snapshot) {
  const cards = snapshot.palicos.map(cat => `<article>
    <h2>${escapeHtml(cat.id)} · ${escapeHtml(cat.name || '名前未設定')}</h2>
    <p>${escapeHtml(cat.supportType || '傾向未設定')} · ${escapeHtml(cat.verdict)}</p>
    <p><a href="${escapeHtml(cat.detailUrl)}">個体JSON（Pages）</a> · <a href="${escapeHtml(cat.imageUrl)}">保存画像（Worker）</a> · <a href="${escapeHtml(cat.liveDetailUrl)}">最新の個体JSON（Worker）</a></p>
    <details><summary>メタデータを表示</summary><pre>${escapeHtml(JSON.stringify(cat,null,2))}</pre></details>
  </article>`).join('\n');
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>外部確認用・読み取りデータ | MHXX Hub</title>
<link rel="alternate" type="application/json" href="./palicos.json" title="猫一覧JSON">
<style>body{margin:0;background:#0e1721;color:#edf2f7;font:16px/1.7 system-ui,sans-serif}main{max-width:960px;margin:auto;padding:24px 16px}a{color:#ffc36e;overflow-wrap:anywhere}h1{font-size:clamp(24px,5vw,36px)}article,.notice{padding:18px;border:1px solid #344352;border-radius:12px;margin:18px 0}h2{font-size:19px;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#081019;padding:14px;border-radius:8px}summary{cursor:pointer;padding:8px 0}code{overflow-wrap:anywhere}dt{font-weight:700}dd{margin:0 0 12px}time{font-variant-numeric:tabular-nums}</style></head>
<body><main><a href="../">← MHXX Hub</a><h1>外部確認用・読み取りデータ</h1>
<div class="notice"><strong>GitHub Pagesの定期更新コピーです。</strong>
<p>コピー作成日時（UTC）: <time datetime="${escapeHtml(snapshot.generatedAt)}">${escapeHtml(snapshot.generatedAt)}</time><br>収録: ${snapshot.total}匹</p>
<p>約30分間隔で更新します。反映には遅延があり、更新に失敗した場合は前回分が残ります。最新の登録内容はWorker APIを確認してください。画像はWorker経由で取得します。</p></div>
<dl><dt>猫一覧JSON（Pages・全件）</dt><dd><a href="./palicos.json">palicos.json</a></dd>
<dt>エンドポイント一覧（Pages）</dt><dd><a href="./index.json">index.json</a></dd>
<dt>最新の猫一覧JSON（Worker）</dt><dd><a href="${escapeHtml(snapshot.sourceUrl)}">${escapeHtml(snapshot.sourceUrl)}</a></dd></dl>
<p>認証・JavaScriptは不要です。公開データにはメモも含まれます。外部ツールはまず <code>palicos.json</code> を読み、各猫の <code>detailUrl</code>・<code>imageUrl</code> を利用してください。Pages版は全件を収録し、ページ送りは不要です。</p>
${cards || '<p>このコピーにはまだ猫が登録されていません。</p>'}
</main></body></html>\n`;
}

export async function buildSnapshot(outputDir, options = {}) {
  // Fetch and validate every page before writing anything. A failed build never replaces the deployed site.
  const palicos = await fetchPalicos(options);
  const snapshot = makeSnapshot(palicos,options);
  const directory = resolve(outputDir);
  await mkdir(join(directory,'palicos'), { recursive:true });
  const writeJson = (path,value) => writeFile(path,JSON.stringify(value,null,2)+'\n','utf8');
  await writeJson(join(directory,'palicos.json'),snapshot);
  await writeJson(join(directory,'index.json'), {
    schemaVersion:1, generatedAt:snapshot.generatedAt, isSnapshot:true,
    refreshIntervalMinutes:30, total:snapshot.total, authentication:'none',
    endpoints: {
      list:`${options.pagesBase || PAGES_BASE}/read/palicos.json`,
      detailTemplate:`${options.pagesBase || PAGES_BASE}/read/palicos/{id}.json`,
      liveList:snapshot.sourceUrl,
      liveDetailTemplate:`${options.apiBase || API_BASE}/api/palicos/{id}`,
      imageTemplate:`${options.apiBase || API_BASE}/api/palicos/{id}/image`,
    },
  });
  for (const cat of snapshot.palicos) {
    await writeJson(join(directory,'palicos',`${cat.id}.json`), { ...cat, snapshotGeneratedAt:snapshot.generatedAt, isSnapshot:true });
  }
  await writeFile(join(directory,'index.html'),renderReadPage(snapshot),'utf8');
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv[2]) throw new Error('Usage: node build-read-snapshot.mjs <fresh artifact output directory>');
  const snapshot = await buildSnapshot(process.argv[2]);
  console.log(`Read snapshot generated: ${snapshot.total} palicos at ${snapshot.generatedAt}. No images downloaded.`);
}
