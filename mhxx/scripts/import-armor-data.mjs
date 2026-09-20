import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { updateSources } from './source-registry.mjs';

const COMMIT = 'ae7f125d1d381278d15908d7ce5b092076423918';
const REPOSITORY = 'AthenaADP/MHGU-ASS';
const BASE_URL = `https://raw.githubusercontent.com/${REPOSITORY}/${COMMIT}/`;
const DEFAULT_VERIFIED_AT = '2026-09-21';
const VERIFIED_AT = process.argv.find((arg) => arg.startsWith('--verified-at='))?.slice('--verified-at='.length) ?? DEFAULT_VERIFIED_AT;

const root = new URL('../', import.meta.url);
const dataRoot = new URL('canonical-data/', root);

const ARMOR_FILES = [
  ['head', 'Run/Data/head.txt'],
  ['chest', 'Run/Data/body.txt'],
  ['arms', 'Run/Data/arms.txt'],
  ['waist', 'Run/Data/waist.txt'],
  ['legs', 'Run/Data/legs.txt']
];
const DATA_FILES = [
  ...ARMOR_FILES.map(([, path]) => path),
  'Run/Data/decorations.txt',
  'Run/Data/skills.txt',
  'Run/Data/compound_skills.txt',
  'Run/Data/tags.txt',
  'Run/Data/components.txt',
  'NumericUpDownHR.h',
  'Armor.cpp',
  'Decoration.cpp',
  'Skill.cpp',
  'CharmDatabase.cpp',
  'Run/Data/Charm Generation/mystery_skill1.csv',
  'Run/Data/Charm Generation/mystery_slots.csv',
  'Run/Data/Charm Generation/shining_skill1.csv',
  'Run/Data/Charm Generation/shining_skill2.csv',
  'Run/Data/Charm Generation/shining_slots.csv',
  'Run/Data/Charm Generation/ancient_skill1.csv',
  'Run/Data/Charm Generation/ancient_skill2.csv',
  'Run/Data/Charm Generation/ancient_slots.csv',
  'Run/Data/Charm Generation/enduring_skill1.csv',
  'Run/Data/Charm Generation/enduring_skill2.csv',
  'Run/Data/Charm Generation/enduring_slots.csv'
];

const sourceIdFor = (path) => `athena-${path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
const textLines = (text) => text.replace(/^\uFEFF/, '').split(/\r?\n/);
const cells = (line) => line.replace(/^\uFEFF/, '').split(',').map((cell) => cell.trim());
const intOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const requiredInt = (value, context) => {
  const number = intOrNull(value);
  if (number === null) throw new Error(`Expected integer for ${context}, got ${JSON.stringify(value)}`);
  return number;
};
const unique = (values) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ''))];
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const stableId = (kind, value) => `${kind}-${sha256(value).slice(0, 20)}`;

async function fetchSource(path) {
  const url = `${BASE_URL}${path.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url, { headers: { 'user-agent': 'MHXX-canonical-importer' } });
  if (!response.ok) throw new Error(`Failed to fetch ${path}: HTTP ${response.status}`);
  const text = await response.text();
  return { path, url, text, sha256: sha256(text) };
}

function parseRows(text, path) {
  return textLines(text)
    .map((line, index) => ({ line, index: index + 1 }))
    .filter(({ line }) => line.trim() && !line.trimStart().startsWith('#'))
    .map(({ line, index }) => ({ cells: cells(line), line, lineNumber: index, path }));
}

function parseTagMap(text) {
  const map = new Map();
  for (const row of parseRows(text, 'Run/Data/components.txt')) {
    const [name, ...tags] = row.cells;
    map.set(name, { event: tags.includes('Event') || tags.includes('jEvent'), japaneseEvent: tags.includes('jEvent'), arena: tags.includes('Arena') });
  }
  return map;
}

function parseCompoundSkills(text) {
  const compounds = new Map();
  for (const row of parseRows(text, 'Run/Data/compound_skills.txt')) {
    if (row.cells.length < 2) continue;
    compounds.set(row.cells[0], row.cells.slice(1).filter(Boolean));
  }
  return compounds;
}

function rankLabel(guild) {
  if (guild >= 1 && guild <= 8) return `HR${guild}`;
  if (guild >= 9 && guild <= 12) return `G${guild - 8}`;
  if (guild === 13) return 'HR解放';
  return null;
}

function unlockFor(guild, village, mode) {
  const rawUnlock = { guild, village, mode };
  const guildRank = rankLabel(guild);
  // Armor.cpp treats mode 0 as OR. A finite guild condition is sufficient in
  // that case; village-only and AND rows are deliberately left unverifiable.
  const strictGuildRoute = guild !== 99 && guildRank !== null && mode === 0;
  return {
    rawUnlock,
    rankRequirement: strictGuildRoute ? guildRank : null,
    unverifiedUnlock: !strictGuildRoute,
    confidence: strictGuildRoute ? 'medium' : 'low'
  };
}

function normalizeGender(value) {
  return ({ 0: 'both', 1: 'male', 2: 'female' })[value] ?? 'unknown';
}

function normalizeHunterType(value) {
  return ({ 0: 'both', 1: 'blademaster', 2: 'gunner' })[value] ?? 'unknown';
}

function pushSkillPoints(target, name, points) {
  if (!name) return;
  if (name === '胴系統倍加') {
    target[name] = 1;
    return;
  }
  const number = intOrNull(points);
  if (number === null) return;
  target[name] = (target[name] ?? 0) + number;
}

function parseMaterials(rowCells, start, end, materialTags) {
  const materials = [];
  let eventOnly = false;
  let arenaOnly = false;
  for (let index = start; index <= end; index += 2) {
    const name = rowCells[index] ?? '';
    if (!name) continue;
    const amount = intOrNull(rowCells[index + 1]);
    const tag = materialTags.get(name) ?? {};
    if (tag.event || name === '※イベントクエスト') eventOnly = true;
    if (tag.arena || name.startsWith('※闘技大会') || name.startsWith('※Ｇ級闘技大会')) arenaOnly = true;
    materials.push({ name, amount });
  }
  return { materials, eventOnly, arenaOnly };
}

function parseArmorRows(source, slot, materialTags, compoundTrees) {
  return parseRows(source.text, source.path).map((row) => {
    const c = row.cells;
    if (c.length < 33) throw new Error(`Short armor row ${source.path}:${row.lineNumber}`);
    const guild = requiredInt(c[5], `${source.path}:${row.lineNumber} guild`);
    const village = requiredInt(c[6], `${source.path}:${row.lineNumber} village`);
    const mode = requiredInt(c[7], `${source.path}:${row.lineNumber} mode`);
    const skillPoints = {};
    for (let i = 0; i < 5; i += 1) pushSkillPoints(skillPoints, c[15 + i * 2], c[16 + i * 2]);
    const materialInfo = parseMaterials(c, 25, 32, materialTags);
    const explicitJapaneseEvent = c[34] === 'jEvent';
    const eventOnly = materialInfo.eventOnly || explicitJapaneseEvent;
    const arenaOnly = materialInfo.arenaOnly || c.some((value) => value.startsWith('※闘技大会') || value.startsWith('※Ｇ級闘技大会'));
    const compound = unique(Object.keys(skillPoints).filter((name) => compoundTrees.has(name)));
    const specialTorso = Object.hasOwn(skillPoints, '胴系統倍加');
    const specialUnsupported = Object.keys(skillPoints).some((name) => ['秘術', '護石強化'].includes(name));
    const unlock = unlockFor(requiredInt(c[5], 'guild'), requiredInt(c[6], 'village'), requiredInt(c[7], 'mode'));
    return {
      id: stableId('armor', `${slot}|${row.line}`),
      name: c[0],
      slot,
      gender: normalizeGender(c[1]),
      hunterType: normalizeHunterType(c[2]),
      // Armor.cpp converts the deviant `X` code to its internal rarity 11;
      // preserve both that loader value and the raw source code.
      rarity: c[3] === 'X' ? 11 : requiredInt(c[3], `${source.path}:${row.lineNumber} rarity`),
      ...(c[3] === 'X' ? { rawRarity: 'X', deviant: true } : {}),
      defense: { base: requiredInt(c[8], `${source.path}:${row.lineNumber} defense`), max: requiredInt(c[9], `${source.path}:${row.lineNumber} max defense`) },
      resistances: {
        fire: requiredInt(c[10], `${source.path}:${row.lineNumber} fire`),
        water: requiredInt(c[11], `${source.path}:${row.lineNumber} water`),
        thunder: requiredInt(c[12], `${source.path}:${row.lineNumber} thunder`),
        ice: requiredInt(c[13], `${source.path}:${row.lineNumber} ice`),
        dragon: requiredInt(c[14], `${source.path}:${row.lineNumber} dragon`)
      },
      slots: requiredInt(c[4], `${source.path}:${row.lineNumber} slots`),
      skillPoints,
      ...(specialTorso ? { special: 'torso-up', effects: ['torso-up'] } : {}),
      ...(compound.length ? { compoundSkills: compound } : {}),
      ...(specialUnsupported || compound.length ? { unsupported: true } : {}),
      ...unlock,
      eventOnly,
      ...(arenaOnly ? { arenaOnly: true } : {}),
      materials: materialInfo.materials,
      sourceIds: unique([sourceIdFor(source.path), sourceIdFor('Armor.cpp'), sourceIdFor('Run/Data/components.txt')]),
      ...(unlock.unverifiedUnlock ? { notes: 'ギルド条件だけでは解禁を保証できない村条件または未対応条件。solverでは除外。' } : {})
    };
  });
}

function parseDecorationRows(source, materialTags, compoundTrees) {
  return parseRows(source.text, source.path).map((row) => {
    const c = row.cells;
    if (c.length < 10) throw new Error(`Short decoration row ${source.path}:${row.lineNumber}`);
    const guild = requiredInt(c[3], `${source.path}:${row.lineNumber} guild`);
    const village = requiredInt(c[4], `${source.path}:${row.lineNumber} village`);
    const mode = requiredInt(c[5], `${source.path}:${row.lineNumber} mode`);
    const skillPoints = {};
    pushSkillPoints(skillPoints, c[6], c[7]);
    pushSkillPoints(skillPoints, c[8], c[9]);
    const primary = parseMaterials(c, 10, 17, materialTags);
    const secondary = parseMaterials(c, 18, 25, materialTags);
    const compound = unique(Object.keys(skillPoints).filter((name) => compoundTrees.has(name)));
    const specialTorso = Object.hasOwn(skillPoints, '胴系統倍加');
    const specialUnsupported = Object.keys(skillPoints).some((name) => ['秘術', '護石強化'].includes(name));
    const unlock = unlockFor(guild, village, mode);
    return {
      id: stableId('decoration', row.line),
      name: c[0],
      rarity: requiredInt(c[1], `${source.path}:${row.lineNumber} rarity`),
      slotCost: requiredInt(c[2], `${source.path}:${row.lineNumber} slot cost`),
      skillPoints,
      ...(specialTorso ? { special: 'torso-up', effects: ['torso-up'] } : {}),
      ...(compound.length ? { compoundSkills: compound } : {}),
      ...(specialUnsupported || compound.length ? { unsupported: true } : {}),
      ...unlock,
      eventOnly: primary.eventOnly || secondary.eventOnly,
      ...(primary.arenaOnly || secondary.arenaOnly ? { arenaOnly: true } : {}),
      materials: primary.materials,
      secondaryMaterials: secondary.materials,
      sourceIds: unique([sourceIdFor(source.path), sourceIdFor('Decoration.cpp'), sourceIdFor('Run/Data/components.txt')]),
      ...(unlock.unverifiedUnlock ? { notes: 'ギルド条件だけでは解禁を保証できない村条件または未対応条件。solverでは除外。' } : {})
    };
  });
}

function aliasesFor(name, tree) {
  const aliases = [];
  if (name === '弱点特効' || tree === '痛撃') aliases.push('弱特');
  const eye=name.normalize('NFKC').match(/^見切り\+(\d+)$/);
  if (eye) aliases.push(`見切り${eye[1]}`);
  return unique(aliases.filter((alias) => alias !== name));
}

function parseHunterSkills(source, compoundSkills) {
  const skills = [];
  for (const row of parseRows(source.text, source.path)) {
    const [name, tree, points, hunterType, ...tags] = row.cells;
    if (!name) continue;
    const special = name === '胴系統倍加' && !tree && !points;
    const threshold = special ? null : requiredInt(points, `${source.path}:${row.lineNumber} threshold`);
    const compound = compoundSkills.get(name);
    skills.push({
      id: special ? 'skill-torso-up' : stableId('skill', `${name}|${tree}|${points}`),
      name,
      tree: special ? '胴系統倍加' : tree,
      threshold,
      aliases: aliasesFor(name, tree),
      ...(special ? { special: true, effects: ['torso-up'] } : {}),
      ...(compound ? { compoundEffects: compound, unsupported: true } : {}),
      hunterType: ({ 0: 'both', 1: 'blademaster', 2: 'gunner' })[intOrNull(hunterType)] ?? 'both',
      tags: tags.filter(Boolean),
      sourceIds: unique([sourceIdFor(source.path), sourceIdFor('Skill.cpp'), ...(compound ? [sourceIdFor('Run/Data/compound_skills.txt')] : [])])
    });
  }
  return skills;
}

function buildSkillTrees(skills, compoundSkills) {
  const byTree = new Map();
  for (const skill of skills) {
    const tree = skill.tree;
    const entry = byTree.get(tree) ?? { id: stableId('tree', tree), name: tree, activations: [], aliases: [], sourceIds: [sourceIdFor('Run/Data/skills.txt')] };
    if (skill.special) {
      entry.special = true;
      entry.effects = ['torso-up'];
    } else {
      entry.activations.push({ points: skill.threshold, skill: skill.name, skillId: skill.id });
    }
    entry.aliases = unique([...entry.aliases, ...skill.aliases]);
    entry.sourceIds = unique([...entry.sourceIds, ...skill.sourceIds]);
    byTree.set(tree, entry);
  }
  for (const skill of skills) {
    const subskills = compoundSkills.get(skill.name);
    if (!subskills) continue;
    const entry = byTree.get(skill.tree);
    if (!entry) continue;
    entry.compound = { skill: skill.name, subskills, unsupported: true, sourceIds: [sourceIdFor('Run/Data/compound_skills.txt')] };
    entry.unsupported = true;
  }
  return [...byTree.values()]
    .map((entry) => ({ ...entry, activations: entry.activations.sort((a, b) => a.points - b.points || a.skill.localeCompare(b.skill, 'ja')) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

function parseCsvTable(source) {
  const rows = parseRows(source.text, source.path);
  const header = rows.shift()?.cells ?? [];
  return { header, rows };
}

function parseSkillRanges(source, allowNegative) {
  const ranges = {};
  for (const row of parseRows(source.text, source.path).filter((candidate) => intOrNull(candidate.cells[1]) !== null && intOrNull(candidate.cells[2]) !== null)) {
    if (row.cells.length < 3) continue;
    const name = row.cells[0];
    const min = requiredInt(row.cells[1], `${source.path}:${row.lineNumber} min`);
    const max = requiredInt(row.cells[2], `${source.path}:${row.lineNumber} max`);
    ranges[name] = { min, max, ...(allowNegative ? { canBeNegative: min < 0 } : {}) };
  }
  return ranges;
}

function parseSlotTable(source) {
  const table = parseCsvTable(source);
  return table.rows.map((row) => ({
    sufficient: requiredInt(row.cells[0], `${source.path}:${row.lineNumber} sufficient`),
    slot1: requiredInt(row.cells[1], `${source.path}:${row.lineNumber} slot1`),
    slot2: requiredInt(row.cells[2], `${source.path}:${row.lineNumber} slot2`),
    slot3: requiredInt(row.cells[3], `${source.path}:${row.lineNumber} slot3`)
  }));
}

function buildCharmRules(sourcesByPath) {
  const definitions = [
    ['mystery', '謎のお守り', 'mystery_skill1.csv', null, 'mystery_slots.csv', 100, 1],
    ['shining', '光るお守り', 'shining_skill1.csv', 'shining_skill2.csv', 'shining_slots.csv', 35, 2],
    ['ancient', '古びたお守り', 'ancient_skill1.csv', 'ancient_skill2.csv', 'ancient_slots.csv', 25, 3],
    ['enduring', '風化したお守り', 'enduring_skill1.csv', 'enduring_skill2.csv', 'enduring_slots.csv', 20, 3]
  ];
  const types = definitions.map(([id, name, firstFile, secondFile, slotFile, skill2ChancePercent, maxSlots]) => {
    const first = sourcesByPath.get(`Run/Data/Charm Generation/${firstFile}`);
    const second = secondFile ? sourcesByPath.get(`Run/Data/Charm Generation/${secondFile}`) : null;
    const slot = sourcesByPath.get(`Run/Data/Charm Generation/${slotFile}`);
    const firstRanges = parseSkillRanges(first, false);
    const secondRanges = second ? parseSkillRanges(second, true) : {};
    const merged = {};
    for (const [tree, range] of Object.entries({ ...firstRanges, ...secondRanges })) {
      const ranges = [firstRanges[tree], secondRanges[tree]].filter(Boolean);
      merged[tree] = { min: Math.min(...ranges.map((item) => item.min)), max: Math.max(...ranges.map((item) => item.max)), ...(ranges.some((item) => item.canBeNegative) ? { canBeNegative: true } : {}) };
    }
    return {
      id,
      name,
      maxSkills: second ? 2 : 1,
      maxSlots,
      skill2ChancePercent,
      skillPointRanges: merged,
      slotThresholds: parseSlotTable(slot),
      sourceIds: unique([sourceIdFor(first.path), ...(second ? [sourceIdFor(second.path)] : []), sourceIdFor(slot.path), sourceIdFor('CharmDatabase.cpp')]),
      notes: second ? '第2スキルはCSVの範囲と生成確率を保存。個別のseed・重複排除条件までは検証しない。' : '第2スキルCSVがないため1スキル種のみ。'
    };
  });
  const allRanges = {};
  for (const type of types) {
    for (const [tree, range] of Object.entries(type.skillPointRanges)) {
      const previous = allRanges[tree];
      allRanges[tree] = previous
        ? { min: Math.min(previous.min, range.min), max: Math.max(previous.max, range.max), ...(previous.canBeNegative || range.canBeNegative ? { canBeNegative: true } : {}) }
        : { ...range };
    }
  }
  return {
    maxSkills: 2,
    maxSlots: 3,
    sourceIds: unique(types.flatMap((type) => type.sourceIds)),
    skillPointRanges: allRanges,
    generationTypes: types,
    legality: 'ranges-and-slot-thresholds-preserved; exact seed legality and duplicate suppression are unsupported',
    unsupported: ['seed-level generation legality', 'duplicate suppression across generated charms']
  };
}

function rankUnlocks() {
  const ranks = [
    ['LR', 3, ['max3']],
    ...Array.from({ length: 8 }, (_, index) => [`HR${index + 1}`, index + 1, []]),
    ['HR', 8, ['max8']],
    ...Array.from({ length: 4 }, (_, index) => [`G${index + 1}`, index + 9, []]),
    ['HR解放', 13, []]
  ];
  return ranks.map(([rank, order, aliases]) => ({
    rank,
    order,
    aliases,
    sourceIds: unique([sourceIdFor('NumericUpDownHR.h'), sourceIdFor('Armor.cpp')]),
    confidence: 'medium',
    notes: rank === 'LR' ? 'UI最大値3に対応する下位別名。' : rank === 'HR' ? 'UI最大値8に対応する上位別名。' : 'Athena loaderのguild/HRマッピング。個別クエスト解禁は別条件。'
  }));
}

function makeSources(sources) {
  return sources.map(({ path, url, sha256: digest }) => ({
    id: sourceIdFor(path),
    name: `AthenaADP/MHGU-ASS ${path}`,
    url,
    type: path.startsWith('Run/Data/') ? 'dataset' : 'loader',
    commit: COMMIT,
    sha256: digest,
    verifiedAt: VERIFIED_AT,
    license: 'MIT',
    confidence: 'high',
    notes: 'Pinned upstream file fetched verbatim by scripts/import-armor-data.mjs.'
  }));
}

function countBy(items, key) {
  return Object.fromEntries([...new Set(items.map((item) => item[key]))].sort().map((value) => [value, items.filter((item) => item[key] === value).length]));
}

const fetched = await Promise.all(DATA_FILES.map(fetchSource));
const sourcesByPath = new Map(fetched.map((source) => [source.path, source]));
const materialTags = parseTagMap(sourcesByPath.get('Run/Data/components.txt').text);
const compoundSkills = parseCompoundSkills(sourcesByPath.get('Run/Data/compound_skills.txt').text);
const hunterSkills = parseHunterSkills(sourcesByPath.get('Run/Data/skills.txt'), compoundSkills);
const compoundTrees = new Set(hunterSkills.filter((skill) => skill.compoundEffects).map((skill) => skill.tree));
const armor = ARMOR_FILES.flatMap(([slot, path]) => parseArmorRows(sourcesByPath.get(path), slot, materialTags, compoundTrees));
for (const item of armor) if (item.defense.max < item.defense.base) {
  item.rawDefense = {...item.defense};
  item.defense = {base:null,max:null};
  item.invalidData = true;
  item.confidence = 'low';
  item.notes = `${item.notes ?? ''} 出典の初期防御が最終防御を上回る矛盾。推定で修正せず防御を未確認として検索から除外。`.trim();
}
const decorations = parseDecorationRows(sourcesByPath.get('Run/Data/decorations.txt'), materialTags, compoundTrees);
const skillTrees = buildSkillTrees(hunterSkills, compoundSkills);
const charmRules = buildCharmRules(sourcesByPath);
const rankEntries = rankUnlocks();
const sources = makeSources(fetched);
const sourceIds = new Set(sources.map((source) => source.id));

for (const collection of [armor, decorations, hunterSkills, skillTrees, rankEntries]) {
  for (const item of collection) {
    for (const sourceId of item.sourceIds ?? []) {
      if (!sourceIds.has(sourceId)) throw new Error(`Missing source ${sourceId} referenced by ${item.id ?? item.name}`);
    }
  }
}
for (const type of charmRules.generationTypes) {
  for (const sourceId of type.sourceIds) if (!sourceIds.has(sourceId)) throw new Error(`Missing charm source ${sourceId}`);
}

await mkdir(dataRoot, { recursive: true });
const output = new Map([
  ['armor.json', armor],
  ['decorations.json', decorations],
  ['hunter-skills.json', hunterSkills],
  ['skill-trees.json', skillTrees],
  ['rank-unlocks.json', rankEntries],
  ['charm-rules.json', charmRules]
]);
for (const [name, value] of output) await writeFile(new URL(name, dataRoot), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
await updateSources(sources,'athena-');

console.log(JSON.stringify({
  verifiedAt: VERIFIED_AT,
  commit: COMMIT,
  armor: armor.length,
  armorBySlot: countBy(armor, 'slot'),
  decorations: decorations.length,
  hunterSkills: hunterSkills.length,
  skillTrees: skillTrees.length,
  compoundTrees: compoundTrees.size,
  rankUnlocks: rankEntries.length,
  unknownArmorUnlocks: armor.filter((item) => item.unverifiedUnlock).length,
  unknownDecorationUnlocks: decorations.filter((item) => item.unverifiedUnlock).length,
  charmTypes: charmRules.generationTypes.length,
  sources: sources.length
}, null, 2));
