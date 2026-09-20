import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {solveArmor,PARTS} from '../solver/armor-solver.mjs';
import {activatedSkills,meets} from '../solver/score-results.mjs';
import {validateCharm,loadCharms,saveCharms,STORAGE_KEY} from '../charm-library/library.mjs';
const read=async name=>JSON.parse(await readFile(new URL(`./fixtures/${name}.json`,import.meta.url),'utf8'));
const [armor,skills,decorations,charms]=await Promise.all(['armor','skills','decorations','charms'].map(read));
const fixture=()=>structuredClone({armor,skills,decorations,charms,trees:[{name:'攻撃'},{name:'防御'},{name:'達人'}],ranks:['LR','HR','G1','G2','G3','G4'].map((rank,order)=>({rank,order})),weapons:[],charmRules:{}});
const query={hunterType:'blademaster',rank:'G2',requiredSkills:['攻撃小']};
test('positive and negative activation, only highest tier',()=>{
 assert.deepEqual(activatedSkills({'攻撃':16,'防御':-11},skills),['攻撃中','防御低下']);
 assert.deepEqual(activatedSkills({'攻撃':-10},skills),['攻撃低下']);
 assert.deepEqual(activatedSkills({'攻撃':9},skills),[]);
});
test('required skill, minimum defense and actual owned charm',()=>{
 const d=fixture(); d.decorations=[];
 assert.equal(solveArmor(query,d).results.length,0);
 const r=solveArmor({...query,charms,minDefense:500},d);
 assert.equal(r.results.length,1);assert.equal(r.results[0].charm,'owned');assert.equal(r.results[0].totalDefense,500);
 assert.equal(solveArmor({...query,charms,minDefense:501},d).results.length,0);
 assert.equal(solveArmor({...query,useCharmLibrary:true},d).results[0].charm,'owned');
});
test('1/2/3-slot jewels fit individual containers, not summed slots',()=>{
 const d=fixture(); d.armor[0].skillPoints={'攻撃':7};d.armor[1].skillPoints={};
 assert.equal(solveArmor(query,d).results.length,0); // two 1-slot bins cannot fit a 2-slot jewel
 const two=solveArmor({...query,weaponSlots:2},d).results;
 assert.ok(two.some(r=>r.decorations.some(j=>j.id==='two')));
 d.armor[0].skillPoints={'攻撃':5};
 const three=solveArmor({...query,weaponSlots:3},d).results;
 assert.ok(three.some(r=>r.decorations.some(j=>j.id==='three')));
 d.armor[0].skillPoints={'攻撃':8};
 assert.ok(solveArmor(query,d).results.some(r=>r.decorations.find(j=>j.id==='one')?.count===2));
});
test('rank, unknown unlock, hunter type, gender, event and weapon filtering',()=>{
 for(const patch of [{rankRequirement:'G3'},{rankRequirement:null},{hunterType:'gunner'},{gender:'female'},{eventOnly:true},{unverifiedUnlock:true}]){
  const d=fixture();Object.assign(d.armor[0],patch);assert.equal(solveArmor({...query,charms},d).results.length,0,JSON.stringify(patch));
 }
 const d=fixture();d.weapons=[{id:'weapon',weaponType:'SwordAndShield',slots:3,rankRequirement:'G3'}];
 assert.throws(()=>solveArmor({...query,weaponId:'weapon'},d));
 d.weapons[0].rankRequirement='G2';assert.ok(solveArmor({...query,weaponId:'weapon'},d).results.length);
 assert.throws(()=>solveArmor({...query,weaponId:'weapon',weaponSlots:2},d));
});
test('preferred does not remove results; higher required tier and aliases work',()=>{
 const d=fixture();
 assert.ok(solveArmor({...query,charms,preferredSkills:['見切り']},d).results.length);
 assert.ok(solveArmor({...query,charms,requiredSkills:['攻撃UP小']},d).results.length);
 assert.equal(solveArmor({...query,charms,requiredSkills:['攻撃中']},d).results.length,0);
});
test('negative jewel points can invalidate excluded skill',()=>{
 const d=fixture();d.armor[0].skillPoints={'攻撃':7,'防御':-9};d.armor[1].skillPoints={};
 assert.ok(solveArmor({...query,weaponSlots:2},d).results.length);
 assert.equal(solveArmor({...query,weaponSlots:2,excludedSkills:['防御低下']},d).results.length,0);
});
test('Torso Up multiplies chest jewels and chest skills, not other bins',()=>{
 const d=fixture();d.armor[0].skillPoints={'胴系統倍加':1};d.armor[0].slots=0;d.armor[1].skillPoints={'攻撃':4};
 const r=solveArmor(query,d).results;assert.equal(r.length,1);assert.equal(r[0].skillPoints['攻撃'],10);assert.equal(r[0].decorations[0].placements[0].location,'chest');
});
test('strict query validation, unsupported special skills and explicit budget',()=>{
 const d=fixture();
 for(const change of [{rank:'G9'},{weaponSlots:4},{requiredSkills:['unknown']},{hunterType:'gunner',weaponType:'SwordAndShield'},{gender:'all'},{requiredSkills:['攻撃小'],excludedSkills:['攻撃小']}]) assert.throws(()=>solveArmor({...query,...change},d));
 const r=solveArmor({...query,weaponSlots:3,maxNodes:1},d);assert.equal(r.complete,false);assert.equal(r.visitedNodes,1);assert.ok(r.warnings.some(w=>w.includes('探索上限')));
});
test('deterministic result order, scores and metadata excluding elapsed time',()=>{
 const d=fixture(),q={...query,weaponSlots:3,charms};
 const a=solveArmor(q,d),b=solveArmor(q,d);delete a.elapsedMs;delete b.elapsedMs;assert.deepEqual(a,b);
});
test('preferred attainment sorts ahead of defense and a stronger tier satisfies weaker required skill',()=>{
 const d=fixture();d.armor[0].skillPoints={'攻撃':13};
 d.armor.push({...d.armor[0],id:'preferred-head',skillPoints:{'攻撃':13,'達人':10},defense:{base:80,max:100}});
 const r=solveArmor({...query,preferredSkills:['見切り']},d).results;
 assert.equal(r[0].armor.head,'preferred-head');assert.ok(r[0].activatedSkills.includes('攻撃中'));
});
test('equivalent decoration vectors retain fewer jewels, then earlier unlock',()=>{
 const d=fixture();d.armor.forEach(a=>a.slots=0);d.armor[0].skillPoints={'攻撃':6};
 d.decorations=[{...decorations[0],id:'a',skillPoints:{'攻撃':1}},{...decorations[1],id:'b',skillPoints:{'攻撃':2},rankRequirement:'G2'},{...decorations[1],id:'c',skillPoints:{'攻撃':2},rankRequirement:'G1'}];
 const r=solveArmor({...query,weaponSlots:2},d);assert.equal(r.complete,true);assert.equal(r.results[0].decorations.length,1);assert.equal(r.results[0].decorations[0].id,'c');assert.equal(r.results[0].decorations[0].count,1);
});
test('negative required thresholds and upper exclusions survive torso bounds',()=>{
 const d=fixture();d.armor[0].skillPoints={'胴系統倍加':1};d.armor[1].skillPoints={'攻撃':-5};d.decorations=[];
 const result=solveArmor({...query,requiredSkills:['攻撃低下']},d).results;
 assert.equal(result.length,1);assert.equal(result[0].skillPoints['攻撃'],-10);
 d.armor[1].skillPoints={'攻撃':5};
 assert.equal(solveArmor({...query,excludedSkills:['攻撃中']},d).results.length,1);
});
test('charm slots fit a three-slot jewel and rank-gated decorations stay excluded',()=>{
 const d=fixture(),charm={...charms[0],skills:{},slots:3};
 assert.ok(solveArmor({...query,charms:[charm]},d).results.some(r=>r.decorations.some(j=>j.placements.some(p=>p.location==='charm'))));
 d.decorations.forEach(j=>j.rankRequirement='G3');
 assert.equal(solveArmor({...query,charms:[charm]},d).results.length,0);
});
test('charm library round-trip, duplicate and malformed imports are atomic',()=>{
 const d=fixture(),map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 saveCharms(storage,charms,d);assert.deepEqual(loadCharms(storage,d)[0].skills,charms[0].skills);
 assert.throws(()=>saveCharms(storage,[charms[0],charms[0]],d));assert.equal(loadCharms(storage,d).length,1);
 for(const patch of [{slots:4},{skills:{unknown:1}},{skills:{'攻撃':1.5}},{source:'ai'},{registeredAt:'bad'}])assert.throws(()=>validateCharm({...charms[0],...patch},d));
 map.set(STORAGE_KEY,'broken');assert.throws(()=>loadCharms(storage,d));
});

// Independent tiny exhaustive oracle: enumerate all armor and jewel placements,
// then compare existence and recompute every returned candidate from scratch.
test('seeded exhaustive oracle checks signed skills and placement correctness',()=>{
 let seed=19251;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let run=0;run<35;run++) {
  const d=fixture();d.armor=PARTS.flatMap((slot,i)=>[0,1].map(j=>({...armor[i],id:`${i}-${j}`,slots:rnd(3),skillPoints:{'攻撃':rnd(9)-3,'防御':rnd(6)-4},defense:{base:70+rnd(40),max:200}})));
  d.decorations=decorations.slice(0,2);
  const q={...query,excludedSkills:['防御低下'],minDefense:390,weaponSlots:rnd(2),maxNodes:1000000,maxResults:100};
  let exists=false;
  function jewels(bins,i,points) {
   if(i===bins.length)return points['攻撃']>=10 && points['防御']>-10;
   const options=[[],...(bins[i]>=1?[[d.decorations[0]]]:[]),...(bins[i]>=2?[[d.decorations[0],d.decorations[0]],[d.decorations[1]]]:[])];
   return options.some(ds=>{const p={...points};for(const dec of ds)for(const [k,v]of Object.entries(dec.skillPoints))p[k]=(p[k]??0)+v;return jewels(bins,i+1,p);});
  }
  function enumerate(index,pieces) {
   if(index===5) {if(pieces.reduce((n,a)=>n+a.defense.base,0)<q.minDefense)return;const p={'攻撃':0,'防御':0};for(const a of pieces)for(const[k,v]of Object.entries(a.skillPoints))p[k]+=v;exists ||= jewels([...pieces.map(a=>a.slots),q.weaponSlots],0,p);return;}
   for(const a of d.armor.filter(a=>a.slot===PARTS[index]))enumerate(index+1,[...pieces,a]);
  }
  enumerate(0,[]);
  const response=solveArmor(q,d);assert.equal(response.complete,true);assert.equal(response.results.length>0,exists,`seed run ${run}`);
  for(const result of response.results) {
   const pieces=Object.values(result.armor).map(id=>d.armor.find(a=>a.id===id));const totals={'攻撃':0,'防御':0};
   const space=Object.fromEntries(pieces.map(a=>[a.slot,a.slots]));space.weapon=q.weaponSlots;space.charm=0;
   for(const a of pieces)for(const[k,v]of Object.entries(a.skillPoints))totals[k]+=v;
   for(const entry of result.decorations){const dec=d.decorations.find(j=>j.id===entry.id);assert.equal(entry.count,entry.placements.reduce((n,p)=>n+p.count,0));for(const p of entry.placements)space[p.location]-=dec.slotCost*p.count;for(const[k,v]of Object.entries(dec.skillPoints))totals[k]=(totals[k]??0)+v*entry.count;}
   assert.ok(Object.values(space).every(n=>n>=0));assert.deepEqual(result.skillPoints,totals);assert.ok(meets(totals,skills[0]));assert.ok(totals['防御']>-10);
  }
 }
});
