import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadData} from '../solver/api.mjs';
export async function validateData() {
 const d=await loadData();
 const sources=JSON.parse(await readFile(new URL('../canonical-data/sources.json',import.meta.url),'utf8'));
 const sourceIds=new Set(sources.map(s=>s.id));assert.equal(sourceIds.size,sources.length,'duplicate source IDs');
 const trees=new Set(d.trees.map(t=>t.name)),ranks=new Set(d.ranks.map(r=>r.rank));
 assert.equal(trees.size,d.trees.length,'duplicate trees');assert.equal(ranks.size,d.ranks.length,'duplicate ranks');
 for(const [kind,records] of Object.entries({armor:d.armor,decorations:d.decorations,skills:d.skills,trees:d.trees,weapons:d.weapons})) {
  assert.ok(records.length>0,`empty ${kind}`);assert.equal(new Set(records.map(r=>r.id)).size,records.length,`duplicate ${kind} IDs`);
  for(const r of records) {
   assert.equal(typeof r.name,'string');assert.ok(r.name.length>0);
   assert.ok(Array.isArray(r.sourceIds)&&r.sourceIds.length,`${kind} ${r.name} missing source`);
   assert.ok(r.sourceIds.every(id=>sourceIds.has(id)),`${kind} ${r.name} unknown source`);
   if(kind==='armor'||kind==='decorations'||kind==='weapons') assert.ok(r.rankRequirement===null||ranks.has(r.rankRequirement),`${r.name} rank`);
   if(r.skillPoints)for(const[k,v]of Object.entries(r.skillPoints)){assert.ok(trees.has(k),`${r.name} unknown tree ${k}`);assert.ok(Number.isInteger(v),`${r.name} skill points`);}
   if(kind==='armor') {
    assert.ok(['head','chest','arms','waist','legs'].includes(r.slot));
    assert.ok(['both','blademaster','gunner'].includes(r.hunterType));
    assert.ok(['both','male','female'].includes(r.gender));
    assert.ok((r.invalidData&&r.defense.base===null&&r.confidence==='low')||(Number.isInteger(r.defense.base)&&r.defense.base>=0));
    assert.ok(r.defense.max===null||(Number.isInteger(r.defense.max)&&r.defense.max>=r.defense.base));
    assert.ok(r.rarity==='X'||(Number.isInteger(r.rarity)&&r.rarity>=1&&r.rarity<=11));
   }
   if(kind==='armor'||kind==='weapons')assert.ok(Number.isInteger(r.slots)&&r.slots>=0&&r.slots<=3);
   if(kind==='decorations')assert.ok(Number.isInteger(r.slotCost)&&r.slotCost>=1&&r.slotCost<=3);
   if(kind==='skills'){assert.ok(trees.has(r.tree));assert.ok((r.special&&r.threshold===null)||(Number.isInteger(r.threshold)&&r.threshold!==0));assert.ok(Array.isArray(r.aliases));}
  }
 }
 for(const tree of d.trees)for(const a of tree.activations??[])assert.ok(d.skills.some(s=>s.name===a.skill&&s.tree===tree.name&&s.threshold===a.points),`activation ${tree.name}`);
 const names=new Map();for(const s of d.skills)for(const n of [s.id,s.name,...s.aliases]){const key=n.normalize('NFKC');assert.ok(!names.has(key)||names.get(key)===s.id,`ambiguous skill alias ${n}`);names.set(key,s.id);}
 return {armor:d.armor.length,skills:d.skills.length,skillTrees:d.trees.length,decorations:d.decorations.length,weapons:d.weapons.length,sources:sources.length,unknownArmorRanks:d.armor.filter(a=>!a.rankRequirement||a.unverifiedUnlock).length};
}
if(process.argv[1] && import.meta.url===(await import('node:url')).pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await validateData(),null,2));
