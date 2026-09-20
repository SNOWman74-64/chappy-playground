import test from 'node:test';
import assert from 'node:assert/strict';
import {validateData} from '../scripts/validate-data.mjs';
import {loadData,solveArmor} from '../solver/api.mjs';
test('canonical records, references, aliases, unlocks and skill activations validate',async()=>{
 const stats=await validateData();assert.ok(stats.armor>1000);assert.ok(stats.skills>100);assert.ok(stats.decorations>100);
});
test('production G2 response can be reconstructed and never uses later or unknown unlocks',async()=>{
 const d=await loadData();const rankOrder=new Map(d.ranks.map(r=>[r.rank,r.order]));
 const query={hunterType:'blademaster',rank:'G2',weaponSlots:0,requiredSkills:['弱点特効'],preferredSkills:['業物'],minDefense:500,useCharmLibrary:true,maxNodes:250000,maxResults:5};
 const response=await solveArmor(query);
 assert.ok(response.results.length>0,'expected a real G2 weakness exploit set');
 for(const r of response.results) {
  const parts=Object.values(r.armor).map(id=>d.armor.find(a=>a.id===id));
  assert.equal(parts.length,5);assert.ok(parts.every(a=>a&&!a.unverifiedUnlock&&a.rankRequirement&&rankOrder.get(a.rankRequirement)<=rankOrder.get('G2')&&['blademaster','both'].includes(a.hunterType)));
  assert.ok(r.totalDefense>=500);assert.equal(r.totalDefense,parts.reduce((n,a)=>n+a.defense.base,0));
  assert.ok(r.activatedSkills.includes('弱点特効'));
  const bins=Object.fromEntries(parts.map(a=>[a.slot,a.slots]));bins.weapon=0;bins.charm=0;
  const points={};const factor=1+parts.filter(a=>a.slot!=='chest'&&(a.effects?.includes('torso-up')||Object.hasOwn(a.skillPoints,'胴系統倍加'))).length;
  const add=(skills,multiplier)=>{for(const[k,v]of Object.entries(skills))if(k!=='胴系統倍加')points[k]=(points[k]??0)+v*multiplier;};
  parts.forEach(a=>add(a.skillPoints,a.slot==='chest'?factor:1));
  for(const item of r.decorations){const dec=d.decorations.find(v=>v.id===item.id);assert.ok(rankOrder.get(dec.rankRequirement)<=rankOrder.get('G2'));for(const p of item.placements){bins[p.location]-=p.count*dec.slotCost;add(dec.skillPoints,p.count*(p.location==='chest'?factor:1));}}
  assert.ok(Object.values(bins).every(v=>v>=0));assert.deepEqual(r.skillPoints,points);assert.equal(r.remainingSlots,Object.values(bins).reduce((a,b)=>a+b,0));
 }
});
