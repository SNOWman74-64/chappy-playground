import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchPalicos, buildSnapshot, renderReadPage, makeSnapshot } from './build-read-snapshot.mjs';

const cat = n => ({id:`MHXX-20260921-${String(n).padStart(3,'0')}`,createdAt:'2026-09-21T00:00:00.000Z',updatedAt:'2026-09-21T00:00:00.000Z',imageKey:`palicos/image${n}.png`,verdict:'unreviewed'});
const response = body => Response.json(body);

test('fetches every page using GET only, preserves unreviewed fields and excludes internal fields',async () => {
  const urls = [];
  const palicos = await fetchPalicos({fetchImpl:async (url,options) => {
    urls.push(url);
    assert.equal(options.method,undefined);
    assert.equal(options.headers.Authorization,undefined);
    assert.equal(url.pathname,'/api/palicos');
    return urls.length === 1 ? response({palicos:[{...cat(1),request_hash:'private',memo:'test'}],nextCursor:'next'}) : response({palicos:[cat(2)],nextCursor:null});
  }});
  assert.equal(urls.length,2); assert.equal(urls[1].searchParams.get('cursor'),'next');
  assert.equal(palicos.length,2); assert.equal(palicos[0].request_hash,undefined);
  assert.equal(palicos[0].name,undefined); assert.equal(palicos[0].memo,'test');
});

test('fails on source errors, broken pagination, duplicate IDs and invalid paths',async () => {
  await assert.rejects(fetchPalicos({fetchImpl:async()=>new Response('unavailable',{status:503})}),/503/);
  await assert.rejects(fetchPalicos({fetchImpl:async()=>response({palicos:[]})}),/Invalid list/);
  await assert.rejects(fetchPalicos({fetchImpl:async()=>response({palicos:[],nextCursor:'repeat'})}),/cursor repeated/);
  await assert.rejects(fetchPalicos({fetchImpl:async()=>response({palicos:[cat(1),cat(1)],nextCursor:null})}),/duplicate/);
  await assert.rejects(fetchPalicos({fetchImpl:async()=>response({palicos:[{...cat(1),id:'../../bad'}],nextCursor:null})}),/Invalid/);
  await assert.rejects(fetchPalicos({maxPages:1,fetchImpl:async()=>response({palicos:[],nextCursor:'more'})}),/partial list/);
});

test('publishes real JSON and escaped HTML with Pages detail links and Worker image links',async () => {
  const directory = await mkdtemp(join(tmpdir(),'mhxx-read-test-'));
  const malicious = {...cat(1),name:'<script>alert(1)</script>',memo:'</pre><img src=x onerror=alert(1)>'};
  const snapshot = await buildSnapshot(directory,{generatedAt:'2026-09-21T01:00:00.000Z',fetchImpl:async()=>response({palicos:[malicious],nextCursor:null})});
  const list = JSON.parse(await readFile(join(directory,'palicos.json'),'utf8'));
  assert.equal(list.total,1); assert.equal(list.isSnapshot,true); assert.equal(list.nextCursor,null);
  assert.equal(list.palicos[0].memo,malicious.memo);
  assert.match(list.palicos[0].detailUrl,/github\.io\/chappy-playground\/mhxx-palico\/read\/palicos\/MHXX-20260921-001\.json$/);
  assert.match(list.palicos[0].imageUrl,/workers\.dev\/api\/palicos\/MHXX-20260921-001\/image$/);
  const detail = JSON.parse(await readFile(join(directory,'palicos',`${cat(1).id}.json`),'utf8'));
  assert.equal(detail.snapshotGeneratedAt,snapshot.generatedAt);
  const html = await readFile(join(directory,'index.html'),'utf8');
  assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img '));
  assert.ok(html.includes(snapshot.generatedAt));
});

test('source failure does not write a partial snapshot; empty snapshots are explicit',async () => {
  const directory = await mkdtemp(join(tmpdir(),'mhxx-read-fail-'));
  await assert.rejects(buildSnapshot(directory,{fetchImpl:async()=>{throw new Error('network');}}));
  assert.deepEqual(await readdir(directory),[]);
  assert.match(renderReadPage(makeSnapshot([])),/まだ猫が登録されていません/);
});
