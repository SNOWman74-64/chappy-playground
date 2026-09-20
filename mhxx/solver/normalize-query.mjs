const integer = (value, name, min, max) => {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name}: ${min}〜${max}の整数が必要です`);
  return value;
};
export function normalizeQuery(input, data) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('queryはオブジェクトで指定してください');
  const melee = ['GreatSword','LongSword','SwordAndShield','DualBlades','Hammer','HuntingHorn','Lance','Gunlance','SwitchAxe','ChargeBlade','InsectGlaive'];
  const ranged = ['LightBowgun','HeavyBowgun','Bow'];
  if (input.weaponType && ![...melee,...ranged].includes(input.weaponType)) throw new Error('未知のweaponType');
  const weaponType = input.weaponType;
  const inferred = weaponType ? (ranged.includes(weaponType) ? 'gunner' : 'blademaster') : undefined;
  const hunterType = input.hunterType ?? inferred ?? 'blademaster';
  if (!['blademaster','gunner'].includes(hunterType) || (inferred && inferred !== hunterType)) throw new Error('hunterTypeとweaponTypeが一致しません');
  const gender = input.gender ?? 'male';
  if (!['male','female'].includes(gender)) throw new Error('genderはmaleまたはfemale');
  const rank = input.rank ?? 'G2';
  if (!data.ranks.some(r => r.rank === rank)) throw new Error(`未知の進行度: ${rank}`);
  const skillMap = new Map();
  for (const s of data.skills) for (const key of [s.id,s.name,...s.aliases]) skillMap.set(key.normalize('NFKC'),s);
  function resolve(values, field) {
    if (!Array.isArray(values) || values.some(v => typeof v !== 'string')) throw new Error(`${field}はスキル名の配列`);
    return [...new Map(values.map(v => {
      const s = skillMap.get(v.trim().normalize('NFKC'));
      if (!s) throw new Error(`未知の発動スキル: ${v}`);
      if (!Number.isInteger(s.threshold) || s.threshold===0 || s.unsupported || s.special) throw new Error(`検索要求として未対応の特殊・複合スキル: ${v}`);
      return [s.id,s];
    })).values()];
  }
  const required = resolve(input.requiredSkills ?? [],'requiredSkills');
  const preferred = resolve(input.preferredSkills ?? [],'preferredSkills');
  const excluded = resolve(input.excludedSkills ?? [],'excludedSkills');
  for (const a of required) for (const b of required) if (a.tree === b.tree && a.threshold*b.threshold < 0) throw new Error('同じ系統の正負スキルは同時に必須にできません');
  for (const a of required) for (const b of excluded) if (a.tree === b.tree && a.threshold*b.threshold > 0 && Math.abs(a.threshold) >= Math.abs(b.threshold)) throw new Error('必須スキルと除外スキルが矛盾しています');
  for (const key of ['useCharmLibrary','allowEventEquipment','allowArenaEquipment']) if (input[key] !== undefined && typeof input[key] !== 'boolean') throw new Error(`${key}はboolean`);
  if (input.charms !== undefined && !Array.isArray(input.charms)) throw new Error('charmsは配列');
  return {
    hunterType, gender, rank, weaponType, weaponId: input.weaponId,
    weaponSlots: integer(input.weaponSlots ?? 0,'weaponSlots',0,3),
    required, preferred, excluded,
    minDefense: integer(input.minDefense ?? 0,'minDefense',0,10000),
    maxResults: integer(input.maxResults ?? 20,'maxResults',1,100),
    maxNodes: integer(input.maxNodes ?? 250000,'maxNodes',1,10000000),
    useCharmLibrary: input.useCharmLibrary ?? false,
    allowEventEquipment: input.allowEventEquipment ?? false,
    allowArenaEquipment: input.allowArenaEquipment ?? false,
    charms: input.charms,
  };
}
