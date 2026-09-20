interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  UPLOAD_SECRET: string;
  ALLOWED_ORIGINS: string;
}
type Group = 'A' | 'B' | 'C' | 'fixed' | 'unknown';
type Move = { name: string; group?: Group };
type Verdict = 'unreviewed' | 'keep' | 'hold' | 'reject';
export interface Palico {
  id: string; createdAt: string; updatedAt: string; imageKey: string;
  name?: string; level?: number; supportType?: string;
  supportMoves?: Move[]; skills?: Move[]; supportPattern?: string; skillPattern?: string;
  verdict: Verdict; memo?: string;
}
type Row = {
  id: string; created_at: string; updated_at: string; image_key: string;
  name: string | null; level: number | null; support_type: string | null;
  support_moves: string | null; skills: string | null; support_pattern: string | null;
  skill_pattern: string | null; verdict: Verdict; memo: string | null;
  request_hash: string;
};
const SUPPORT_TYPES = ['カリスマ', 'ファイト', 'ガード', 'アシスト', '回復', 'ボマー', 'コレクト', 'ビースト'];
const VERDICTS = ['unreviewed', 'keep', 'hold', 'reject'];
const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_BODY = MAX_IMAGE + 64 * 1024;
const MAX_RESERVED_BYTES = 512 * 1024 * 1024;
const MAX_MONTHLY_UPLOADS = 500;
const MAX_MONTHLY_IMAGE_READS = 20_000;
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
const json = (data: unknown, status = 200) => Response.json(data, { status });
function toPalico(row: Row): Palico {
  return {
    id: row.id, createdAt: row.created_at, updatedAt: row.updated_at, imageKey: row.image_key,
    name: row.name ?? undefined, level: row.level ?? undefined, supportType: row.support_type ?? undefined,
    supportMoves: row.support_moves ? JSON.parse(row.support_moves) : undefined,
    skills: row.skills ? JSON.parse(row.skills) : undefined,
    supportPattern: row.support_pattern ?? undefined, skillPattern: row.skill_pattern ?? undefined,
    verdict: row.verdict, memo: row.memo ?? undefined,
  };
}
async function digest(bytes: BufferSource) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
async function authorize(request: Request, env: Env) {
  if (!env.UPLOAD_SECRET) fail(503, 'アップロード用シークレットが未設定です。');
  const supplied = request.headers.get('Authorization') ?? '';
  if (supplied.length > 512) fail(401, '共有シークレットを確認してください。');
  const encoder = new TextEncoder();
  const a = await digest(encoder.encode(supplied));
  const b = await digest(encoder.encode(`Bearer ${env.UPLOAD_SECRET}`));
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  if (diff) fail(401, '共有シークレットを確認してください。');
}
async function limitedBody(request: Request, limit: number) {
  if (Number(request.headers.get('Content-Length')) > limit) fail(413, '画像は15 MiB以下にしてください。');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); fail(413, 'リクエストが大きすぎます。'); }
    chunks.push(value);
  }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  return body;
}
function optionalText(value: unknown, key: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > max) fail(400, `${key}の形式または長さが不正です。`);
  return (value as string).trim() || null;
}
function validateMetadata(input: Record<string, unknown>) {
  const name = optionalText(input.name, 'name', 100);
  const supportType = optionalText(input.supportType, 'supportType', 20);
  if (supportType && !SUPPORT_TYPES.includes(supportType)) fail(400, 'サポート傾向が不正です。');
  const level = input.level ?? null;
  if (level !== null && (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 99)) fail(400, 'levelは1〜99の整数です。');
  const verdict = input.verdict === undefined ? 'unreviewed' : input.verdict;
  if (!VERDICTS.includes(verdict as string)) fail(400, 'verdictが不正です。');
  const moves = (value: unknown, key: string): string | null => {
    if (value === undefined || value === null) return null;
    if (!Array.isArray(value) || value.length > 50) fail(400, `${key}は50件以下の配列です。`);
    return JSON.stringify((value as unknown[]).map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) fail(400, `${key}の項目が不正です。`);
      const { name, group } = item as Record<string, unknown>;
      const validName = optionalText(name, `${key}.name`, 100);
      if (!validName) fail(400, `${key}.nameが必要です。`);
      if (group !== undefined && !['A', 'B', 'C', 'fixed', 'unknown'].includes(group as string)) fail(400, `${key}.groupが不正です。`);
      return { name: validName, ...(group === undefined ? {} : { group }) };
    }));
  };
  return { name, level: level as number | null, supportType, verdict: verdict as Verdict,
    supportMoves: moves(input.supportMoves, 'supportMoves'), skills: moves(input.skills, 'skills'),
    supportPattern: optionalText(input.supportPattern, 'supportPattern', 100),
    skillPattern: optionalText(input.skillPattern, 'skillPattern', 100), memo: optionalText(input.memo, 'memo', 2000) };
}
function imageType(bytes: Uint8Array) {
  if (bytes.length > 24 && [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return ['image/png', 'png'];
  if (bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['image/jpeg', 'jpg'];
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length > 12 && ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP') return ['image/webp', 'webp'];
  return fail(415, 'PNG・JPEG・WebP画像を選択してください。');
}
const getRow = (env: Env, id: string) => env.DB.prepare('SELECT * FROM palicos WHERE id = ?').bind(id).first<Row>();
async function reserveUsage(env: Env, key: string, amount: number, limit: number, message: string) {
  const result = await env.DB.prepare(`INSERT INTO usage_guards(key,used) VALUES(?,?)
    ON CONFLICT(key) DO UPDATE SET used=used+excluded.used WHERE used+excluded.used <= ? RETURNING used`)
    .bind(key,amount,limit).first<{used:number}>();
  if (!result) fail(429, message);
}
async function createPalico(request: Request, env: Env) {
  await authorize(request, env);
  const type = request.headers.get('Content-Type') ?? '';
  if (!type.startsWith('multipart/form-data;')) fail(415, 'multipart/form-dataで送信してください。');
  const requestKey = request.headers.get('Idempotency-Key') ?? crypto.randomUUID();
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(requestKey)) fail(400, 'Idempotency-Keyが不正です。');
  const body = await limitedBody(request, MAX_BODY);
  let form: FormData;
  try { form = await new Response(body, { headers: { 'Content-Type': type } }).formData(); }
  catch { return fail(400, 'フォームを読み取れませんでした。'); }
  const image = form.get('image');
  if (!image || typeof image === 'string' || image.size === 0) fail(400, '画像を選択してください。');
  const file = image as File;
  if (file.size > MAX_IMAGE) fail(413, '画像は15 MiB以下にしてください。');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const [contentType, extension] = imageType(bytes);
  const metadata = validateMetadata({ supportType: form.get('supportType'), memo: form.get('memo') });
  const hash = await digest(new TextEncoder().encode(`${await digest(bytes)}:${JSON.stringify(metadata)}`));
  const previous = await env.DB.prepare('SELECT * FROM palicos WHERE request_key = ?').bind(requestKey).first<Row>();
  if (previous) {
    if (previous.request_hash !== hash) fail(409, '同じ送信キーに異なるデータが指定されました。');
    return json(toPalico(previous));
  }
  const now = new Date();
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now).replaceAll('-', '');
  const sequence = await env.DB.prepare('INSERT INTO daily_sequences(day,value) VALUES(?,1) ON CONFLICT(day) DO UPDATE SET value=value+1 RETURNING value').bind(day).first<{value:number}>();
  if (!sequence) throw new Error('Sequence allocation failed');
  const id = `MHXX-${day}-${String(sequence.value).padStart(3, '0')}`;
  const imageKey = `palicos/${day}/${id}-${crypto.randomUUID()}.${extension}`;
  await reserveUsage(env, `uploads:${now.toISOString().slice(0,7)}`, 1, MAX_MONTHLY_UPLOADS, '無料枠保護のため、今月のアップロード上限（500回）に達しました。');
  await reserveUsage(env, 'storage:reserved-bytes', file.size, MAX_RESERVED_BYTES, '無料枠保護のため、画像の保存容量上限（512 MiB）に達しました。');
  await env.IMAGES.put(imageKey, bytes, { httpMetadata: { contentType } });
  try {
    await env.DB.prepare(`INSERT INTO palicos(id,created_at,updated_at,image_key,image_type,image_size,support_type,memo,request_key,request_hash)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(id, now.toISOString(), now.toISOString(), imageKey, contentType, file.size, metadata.supportType, metadata.memo, requestKey, hash).run();
  } catch (error) {
    // Delete only this attempt's object. A concurrent retry can have its own successful object.
    await env.IMAGES.delete(imageKey);
    const winner = await env.DB.prepare('SELECT * FROM palicos WHERE request_key = ?').bind(requestKey).first<Row>();
    if (winner && winner.request_hash === hash) return json(toPalico(winner));
    if (winner) fail(409, '同じ送信キーに異なるデータが指定されました。');
    throw error;
  }
  return json(toPalico((await getRow(env, id))!), 201);
}
async function listPalicos(url: URL, env: Env) {
  const limit = Number(url.searchParams.get('limit') ?? 50);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) fail(400, 'limitは1〜100です。');
  const clauses: string[] = []; const args: (string | number)[] = [];
  const verdict = url.searchParams.get('verdict');
  if (verdict) { if (!VERDICTS.includes(verdict)) fail(400, 'verdictが不正です。'); clauses.push('verdict = ?'); args.push(verdict); }
  const cursor = url.searchParams.get('cursor');
  if (cursor) {
    let values: unknown;
    try { values = JSON.parse(atob(cursor)); } catch { fail(400, 'cursorが不正です。'); }
    if (!Array.isArray(values) || values.length !== 2 || values.some(v => typeof v !== 'string') || !/^MHXX-\d{8}-\d+$/.test(values[1])) fail(400, 'cursorが不正です。');
    const [date, id] = values as string[];
    clauses.push('(created_at < ? OR (created_at = ? AND id < ?))'); args.push(date, date, id);
  }
  const { results } = await env.DB.prepare(`SELECT * FROM palicos ${clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''} ORDER BY created_at DESC,id DESC LIMIT ?`).bind(...args, limit + 1).all<Row>();
  const more = results.length > limit; const rows = results.slice(0, limit); const last = rows.at(-1);
  return json({ palicos: rows.map(toPalico), nextCursor: more && last ? btoa(JSON.stringify([last.created_at, last.id])) : null });
}
async function updatePalico(request: Request, env: Env, id: string) {
  await authorize(request, env);
  const old = await getRow(env, id);
  if (!old) fail(404, '猫が見つかりません。');
  let patch: Record<string, unknown>;
  try { patch = JSON.parse(new TextDecoder().decode(await limitedBody(request, 32 * 1024))); }
  catch (error) { if (error instanceof HttpError) throw error; return fail(400, 'JSONが不正です。'); }
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) fail(400, 'JSONオブジェクトを指定してください。');
  const allowed = ['name','level','supportType','supportMoves','skills','supportPattern','skillPattern','verdict','memo'];
  if (Object.keys(patch).some(key => !allowed.includes(key))) fail(400, '更新できないフィールドが含まれています。');
  const m = validateMetadata({ ...toPalico(old!), ...patch });
  const columns: Record<string,string> = { name:'name',level:'level',supportType:'support_type',supportMoves:'support_moves',skills:'skills',supportPattern:'support_pattern',skillPattern:'skill_pattern',verdict:'verdict',memo:'memo' };
  const keys = Object.keys(patch) as (keyof typeof m)[];
  // Write only fields present in this patch so unrelated concurrent reviews do not overwrite each other.
  await env.DB.prepare(`UPDATE palicos SET updated_at=?${keys.map(key => `,${columns[key]}=?`).join('')} WHERE id=?`)
    .bind(new Date().toISOString(),...keys.map(key => m[key]),id).run();
  return json(toPalico((await getRow(env,id))!));
}
async function route(request: Request, env: Env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/palicos') {
    if (request.method === 'GET') return listPalicos(url,env);
    if (request.method === 'POST') return createPalico(request,env);
    return fail(405, '対応していないメソッドです。');
  }
  const match = url.pathname.match(/^\/api\/palicos\/(MHXX-\d{8}-\d+)(\/image)?$/);
  if (!match) fail(404, 'APIが見つかりません。');
  const [, id, image] = match!;
  if (request.method === 'PATCH' && !image) return updatePalico(request,env,id);
  if (request.method !== 'GET') fail(405, '対応していないメソッドです。');
  const row = await getRow(env,id);
  if (!row) fail(404, '猫が見つかりません。');
  if (!image) return json(toPalico(row!));
  await reserveUsage(env, `image-reads:${new Date().toISOString().slice(0,7)}`, 1, MAX_MONTHLY_IMAGE_READS, '無料枠保護のため、今月の画像表示上限に達しました。');
  const object = await env.IMAGES.get(row!.image_key);
  if (!object) fail(404, '画像が見つかりません。');
  const headers = new Headers();
  object!.writeHttpMetadata(headers);
  headers.set('ETag', object!.httpEtag);
  headers.set('Content-Disposition', `inline; filename="${id}"`);
  return new Response(object!.body, { headers });
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim());
    let response: Response;
    try {
      if (origin && !allowed.includes(origin)) fail(403, 'このサイトからのアクセスは許可されていません。');
      response = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) response = json({ error: error.message },error.status);
      else { console.error('Palico API operation failed'); response = json({ error: '保存先への接続に失敗しました。少し待って再試行してください。' },500); }
    }
    response.headers.set('Cache-Control','no-store');
    response.headers.set('X-Content-Type-Options','nosniff');
    response.headers.set('Vary','Origin');
    if (origin && allowed.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin',origin);
      response.headers.set('Access-Control-Allow-Methods','GET, POST, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers','Authorization, Content-Type, Idempotency-Key');
      response.headers.set('Access-Control-Max-Age','86400');
    }
    return response;
  },
};
