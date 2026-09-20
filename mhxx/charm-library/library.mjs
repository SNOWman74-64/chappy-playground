export const STORAGE_KEY = 'mhxx-hub-charms-v1';
export function validateCharm(value, data) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('護石の形式が不正です');
  if (typeof value.id !== 'string' || !value.id.trim() || value.id.length > 128) throw new Error('護石IDが必要です');
  if (!Number.isInteger(value.slots) || value.slots < 0 || value.slots > 3) throw new Error('スロットは0〜3');
  if (!value.skills || typeof value.skills !== 'object' || Array.isArray(value.skills)) throw new Error('護石skillsが必要です');
  const entries = Object.entries(value.skills);
  if (entries.length > 2) throw new Error('護石のスキルは最大2つです');
  const known = new Set((data.skillTrees ?? data.trees).filter(t => !t.special && t.name !== '胴系統倍加').map(t => t.name));
  const ranges = data.charmRules?.skillPointRanges ?? {};
  for (const [name,n] of entries) {
    if (!known.has(name)) throw new Error(`未知または護石非対応の系統: ${name}`);
    if (!Number.isInteger(n) || n === 0 || n < -20 || n > 20) throw new Error('ポイントは0以外の-20〜20の整数で入力してください');
    const range = ranges[name];
    if (Object.keys(ranges).length && !range) throw new Error(`護石の対応が確認できない系統: ${name}`);
    if (range && (n < range.min || n > range.max)) throw new Error(`${name}の既知の範囲外です`);
  }
  if (!['manual','image','import'].includes(value.source)) throw new Error('sourceはmanual/image/import');
  if (typeof value.registeredAt !== 'string' || !Number.isFinite(Date.parse(value.registeredAt))) throw new Error('registeredAtが不正です');
  if (value.name !== undefined && (typeof value.name !== 'string' || value.name.length > 100)) throw new Error('護石名は100文字以内');
  return {id:value.id, ...(value.name ? {name:value.name} : {}), skills:Object.fromEntries(entries), slots:value.slots, registeredAt:new Date(value.registeredAt).toISOString(), source:value.source};
}
export function validateCharms(values, data) {
  if (!Array.isArray(values) || values.length > 1000) throw new Error('護石ライブラリは最大1000件の配列');
  const result=values.map(v => validateCharm(v,data));
  if (new Set(result.map(c => c.id)).size !== result.length) throw new Error('護石IDが重複しています');
  return result;
}
export function loadCharms(storage, data) {
  const raw=storage.getItem(STORAGE_KEY);
  return raw === null ? [] : validateCharms(JSON.parse(raw),data);
}
export function saveCharms(storage, values, data) {
  const charms=validateCharms(values,data);
  storage.setItem(STORAGE_KEY,JSON.stringify(charms));
  return charms;
}
