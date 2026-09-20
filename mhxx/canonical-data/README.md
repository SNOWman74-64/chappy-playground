# MHXX canonical data importer

`scripts/import-armor-data.mjs` fetches the pinned AthenaADP/MHGU-ASS data at commit `ae7f125d1d381278d15908d7ce5b092076423918` and writes the canonical JSON files under `canonical-data/`. The default verification date is the fixed value `2026-09-21`; use `node scripts/import-armor-data.mjs --verified-at=YYYY-MM-DD` when intentionally recording another review date.

The importer currently produces 6,025 armor records across the five armor slots, 242 decorations, 327 hunter skills, 205 skill trees, 15 rank entries, four charm-generation specifications, and 26 source-file records. Weapons are intentionally outside this importer.

Armor and decoration records preserve the loader's raw `{guild,village,mode}` values as `rawUnlock`. A strict rank is assigned only when the guild route is sufficient (`mode: 0` and a supported guild code). Village-only and `mode: 1` AND rows have `rankRequirement: null` and `unverifiedUnlock: true`; this keeps the solver from asserting an unlock that the pinned source does not prove. Event and arena material tags are retained as `eventOnly` and `arenaOnly`.

The `X` rarity code used by deviant armor is retained as `rawRarity: "X"` with `deviant: true`; canonical `rarity: 11` matches Armor.cpp's internal conversion. Consumers that use a 1..10 display range should handle this explicit deviant tier rather than silently changing it.

`胴系統倍加` is represented as a special tree and skill with `effects: ["torso-up"]`; armor records carry `skillPoints["胴系統倍加"]: 1` plus the same effect. `護石強化` and `秘術` remain in the source skill vectors and are marked unsupported. Compound skills preserve their source subskill definitions and mark the associated skill tree and derived equipment as `unsupported`, because scalar tree points cannot reproduce their semantic expansion.

Charm rules preserve the four upstream CSV families (`mystery`, `shining`, `ancient`, `enduring`), per-family skill ranges, slot thresholds, and the source generator's second-skill chances. The top-level limits are `maxSkills: 2` and `maxSlots: 3`. Exact seed legality and duplicate suppression remain explicitly unsupported; the importer does not claim more than the CSV and loader evidence establishes.

Every `sourceIds` value in the generated records resolves to `sources.json`. Each Athena source record includes its raw-file SHA-256, pinned commit, immutable raw URL, MIT license, and verification date. The copied upstream license is in [ATHENA-LICENSE.txt](./ATHENA-LICENSE.txt). The central source registry additionally includes two MHXX Kiranico references for the minimal weapon catalog.

## Reproducibility

Run from the repository root with network access:

```text
node mhxx/scripts/import-armor-data.mjs
```

The script fetches source files afresh, validates required columns and source references, writes deterministic pretty-printed JSON, and prints record counts. No runtime timestamp is used unless supplied explicitly with `--verified-at`.

## Known source contradictions

Five LV14 Thunderlord gunner pieces (`金雷公キャップ`, `レジスト`, `ガード`, `コート`, `レギンス`) report base defense 176 but maximum 104. The importer preserves these numbers in `rawDefense`, sets both canonical defense values to null, and marks `invalidData: true`, `confidence: low`. The solver excludes these rows. No replacement values are guessed. Other rows remain source-derived medium confidence; they have not all been independently checked in the game.
