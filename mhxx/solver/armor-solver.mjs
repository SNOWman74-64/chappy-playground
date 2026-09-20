import {normalizeQuery} from './normalize-query.mjs';
import {meets,activatedSkills,scoreResult,compareResults} from './score-results.mjs';
import {validateCharms} from '../charm-library/library.mjs';

export const PARTS = ['head','chest','arms','waist','legs'];
const add = (target, source, multiplier=1) => { for (const [k,v] of Object.entries(source)) target[k]=(target[k]??0)+v*multiplier; return target; };
const stable = object => JSON.stringify(Object.entries(object).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0));
const specialNames = new Set(['胴系統倍加','護石強化','秘術']);
const torso = a => a.special === 'torso-up' || a.effects?.includes('torso-up') || Object.hasOwn(a.skillPoints,'胴系統倍加');
const unsupported = a => a.unsupported || a.effects?.some(e => e !== 'torso-up') || Object.keys(a.skillPoints).some(k => specialNames.has(k) && k !== '胴系統倍加');

// Only equivalent complete skill vectors are dominated. In particular, negative
// points, torso multipliers, gender and rank are never silently discarded.
export function pruneArmor(items, rankOrder) {
  const groups = new Map();
  for (const a of items) {
    const key=stable(a.skillPoints)+'|'+torso(a);
    const group=groups.get(key)??[];
    const dominates=(x,y) => x.defense.base>=y.defense.base && x.slots>=y.slots && rankOrder(x.rankRequirement)<=rankOrder(y.rankRequirement);
    if (group.some(b => dominates(b,a))) continue;
    groups.set(key, [...group.filter(b => !dominates(a,b)),a]);
  }
  return [...groups.values()].flat();
}

export function solveArmor(input, data) {
  if (!data) throw new Error('データが必要です。api.mjsのsolveArmor(query)を使用してください');
  const start=performance.now(), q=normalizeQuery(input,data), warnings=[];
  const orders=new Map(data.ranks.map(r => [r.rank,r.order]));
  const order=rank => orders.get(rank) ?? Infinity;
  const usable=a => typeof a.rankRequirement==='string' && order(a.rankRequirement)<=order(q.rank) && (q.allowEventEquipment || !a.eventOnly) && (q.allowArenaEquipment || !a.arenaOnly) && !a.unverifiedUnlock && !a.invalidData;
  let weaponSlots=q.weaponSlots, weaponRank=[...data.ranks].sort((a,b)=>a.order-b.order)[0].rank;
  if (q.weaponId) {
    const weapon=data.weapons?.find(w => w.id===q.weaponId);
    if (!weapon || !usable(weapon)) throw new Error('指定武器は進行度条件で利用できません');
    if (q.weaponType && weapon.weaponType!==q.weaponType) throw new Error('武器種が一致しません');
    const gun=['LightBowgun','HeavyBowgun','Bow'].includes(weapon.weaponType);
    if ((gun?'gunner':'blademaster')!==q.hunterType) throw new Error('武器と剣士/ガンナー条件が一致しません');
    if (input.weaponSlots !== undefined && input.weaponSlots!==weapon.slots) throw new Error('指定武器のスロット数が一致しません');
    weaponSlots=weapon.slots; weaponRank=weapon.rankRequirement;
  }
  const unknownCount=data.armor.filter(a => !a.rankRequirement || a.unverifiedUnlock).length;
  const invalidCount=data.armor.filter(a=>a.invalidData).length;
  if(invalidCount)warnings.push(`出典の数値に矛盾がある防具${invalidCount}件を除外しました`);
  if (unknownCount) warnings.push(`解禁条件未確認の防具${unknownCount}件を除外しました`);
  const unsupportedCount=data.armor.filter(unsupported).length;
  if (unsupportedCount) warnings.push(`未対応の特殊・複合効果を持つ防具${unsupportedCount}件を除外しました（護石強化・秘術など）`);
  if (!q.allowEventEquipment || !q.allowArenaEquipment) warnings.push('イベント・闘技大会の追加条件がある装備は、明示的に許可した区分以外を除外します');
  if ([...q.required,...q.preferred].some(s => specialNames.has(s.tree))) throw new Error('護石強化・秘術などの特殊効果は今回の検索対象外です');
  warnings.push('防御は未強化の初期値です。解禁ランクはデータ出典の条件で、素材所持・個別クエストクリアは保証しません');
  const rawCharms=q.charms ?? (q.useCharmLibrary ? data.charms : []);
  if (q.useCharmLibrary && !rawCharms) throw new Error('お守りライブラリを読み込んでから検索してください');
  const charms=validateCharms(rawCharms??[],{skillTrees:data.trees,charmRules:data.charmRules});
  if (charms.length) warnings.push('護石は入力値を使用します。スキル順・護石種別ごとの実在可能性は未検証です');
  if (q.useCharmLibrary && !charms.length) warnings.push('登録済みのお守りがありません。お守りなしで検索します');
  const constraints=[...q.required.map(s => ({tree:s.tree,sign:s.threshold>0?1:-1,min:Math.abs(s.threshold)})),...q.excluded.map(s => ({tree:s.tree,sign:s.threshold>0?-1:1,min:1-Math.abs(s.threshold)}))];
  const targets=[...constraints,...q.preferred.map(s => ({tree:s.tree,sign:s.threshold>0?1:-1,min:Math.abs(s.threshold)}))];
  const charmChoices=[...charms.sort((a,b) => targets.reduce((n,t)=>n+((b.skills[t.tree]??0)-(a.skills[t.tree]??0))*t.sign,0) || b.slots-a.slots || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),null];
  const decs=data.decorations.filter(d => usable(d) && !unsupported(d) && targets.some(t => (d.skillPoints[t.tree]??0)*t.sign>0)).sort((a,b) => a.id < b.id ? -1 : a.id>b.id?1:0);
  const potential=a => targets.reduce((n,t) => n+Math.max(0,(a.skillPoints[t.tree]??0)*t.sign),0)+a.slots*3;
  const candidates=PARTS.map(part => pruneArmor(data.armor.filter(a => a.slot===part && usable(a) && !unsupported(a) && [q.hunterType,'both'].includes(a.hunterType) && [q.gender,'both',undefined].includes(a.gender)).sort((a,b) => a.id < b.id ? -1 : a.id>b.id?1:0),order).sort((a,b) => potential(b)-potential(a) || b.defense.base-a.defense.base || (a.id<b.id?-1:a.id>b.id?1:0)));
  const counts=Object.fromEntries(PARTS.map((p,i) => [p,candidates[i].length]));
  if (candidates.some(c => !c.length)) return {results:[],searchedCombinations:0,elapsedMs:performance.now()-start,warnings:[...warnings,'指定条件で候補のない部位があります'],complete:true,candidateCounts:counts,visitedNodes:0};
  // Torso Up multiplies chest armor AND its decorations. The upper bound
  // allows up to five copies of positive chest contributions (never understates).
  const hasTorso=candidates.some(c => c.some(torso));
  const suffixDefense=Array(6).fill(0), suffixSlots=Array(6).fill(0);
  const suffixPoints=Array.from({length:6},()=>constraints.map(()=>0));
  for(let i=4;i>=0;i--) {
    suffixDefense[i]=suffixDefense[i+1]+Math.max(...candidates[i].map(a=>a.defense.base));
    suffixSlots[i]=suffixSlots[i+1]+Math.max(...candidates[i].map(a=>a.slots*(hasTorso&&i===1?5:1)));
    constraints.forEach((c,j)=>suffixPoints[i][j]=suffixPoints[i+1][j]+Math.max(...candidates[i].map(a=>{const v=(a.skillPoints[c.tree]??0)*c.sign;return hasTorso&&i===1&&v>0?v*5:v;})));
  }
  const efficiency=constraints.map(c=>Math.max(0,...decs.map(d=>(d.skillPoints[c.tree]??0)*c.sign/d.slotCost)));
  let visitedNodes=0,searchedCombinations=0,complete=true;
  const results=[], resultKeys=new Set();
  function tick() { if (visitedNodes>=q.maxNodes) {complete=false;return false;} visitedNodes++;return true; }
  function feasible(points,slots,suffix=constraints.map(()=>0)) {
    return constraints.every((c,j)=>(points[c.tree]??0)*c.sign+suffix[j]+slots*efficiency[j]>=c.min);
  }
  const configCache=new Map();
  function configurations(capacity,multiplier) {
    const key=`${capacity}:${multiplier}`;
    if (configCache.has(key)) return configCache.get(key);
    const configs=[];
    function visit(first,left,points,ids) {
      if (!tick()) return;
      configs.push({points,ids,left});
      for(let j=first;j<decs.length && complete;j++) if(decs[j].slotCost<=left) visit(j,left-decs[j].slotCost,add({...points},decs[j].skillPoints,multiplier),[...ids,j]);
    }
    visit(0,capacity,{},[]);
    // Identical full vectors and cost may differ in jewel count or unlock rank.
    // Keep the representative preferred by the public result ordering.
    const unique=new Map();
    const configRank=c=>c.ids.reduce((n,j)=>Math.max(n,order(decs[j].rankRequirement)),0);
    for(const c of configs) {
      const signature=stable(c.points)+'|'+c.left,old=unique.get(signature);
      if(!old || c.ids.length<old.ids.length || (c.ids.length===old.ids.length&&configRank(c)<configRank(old)))unique.set(signature,c);
    }
    const value=[...unique.values()].sort((a,b)=> targets.reduce((n,t)=>n+(b.points[t.tree]??0)*t.sign-(a.points[t.tree]??0)*t.sign,0) || b.left-a.left);
    configCache.set(key,value);return value;
  }
  function decorate(armor,charm,defense) {
    searchedCombinations++;
    const multiplier=1+armor.filter(a=>a.slot!=='chest'&&torso(a)).length;
    const base=add({},charm?.skills??{});
    armor.forEach(a=>add(base,Object.fromEntries(Object.entries(a.skillPoints).filter(([k])=>k!=='胴系統倍加')),a.slot==='chest'?multiplier:1));
    const bins=[...armor.map(a=>({location:a.slot,capacity:a.slots,multiplier:a.slot==='chest'?multiplier:1})),{location:'weapon',capacity:weaponSlots,multiplier:1},{location:'charm',capacity:charm?.slots??0,multiplier:1}];
    const options=bins.map(b=>configurations(b.capacity,b.multiplier));
    if (!complete) return;
    const suffix=Array.from({length:8},()=>constraints.map(()=>0));
    for(let i=6;i>=0;i--) constraints.forEach((c,j)=>suffix[i][j]=suffix[i+1][j]+Math.max(...options[i].map(o=>(o.points[c.tree]??0)*c.sign)));
    const selected=[];
    function visit(index,points,free) {
      if(!tick())return;
      if(!constraints.every((c,j)=>(points[c.tree]??0)*c.sign+suffix[index][j]>=c.min))return;
      if(index===7) {
        if(!q.required.every(s=>meets(points,s)) || q.excluded.some(s=>meets(points,s)))return;
        const placements=selected.flatMap((config,i)=>config.ids.map(j=>({dec:decs[j],location:bins[i].location})));
        const decorationMap=new Map();
        for(const {dec,location} of placements) {
          if(!decorationMap.has(dec.id))decorationMap.set(dec.id,{id:dec.id,name:dec.name,count:0,placements:[]});
          const d=decorationMap.get(dec.id);d.count++;
          const old=d.placements.find(p=>p.location===location);
          if(old)old.count++;else d.placements.push({location,count:1});
        }
        const decorations=[...decorationMap.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
        const rankRequirement=[weaponRank,...armor.map(a=>a.rankRequirement),...placements.map(p=>p.dec.rankRequirement)].sort((a,b)=>order(b)-order(a))[0];
        const key=armor.map(a=>a.id).join('|')+'|'+(charm?.id??'');
        const result=scoreResult({armor:Object.fromEntries(armor.map(a=>[a.slot,a.id])),armorDetails:armor,charm:charm?.id,charmDetails:charm??undefined,decorations,activatedSkills:activatedSkills(points,data.skills),skillPoints:points,totalDefense:defense,remainingSlots:free,remainingSlotsByLocation:Object.fromEntries(bins.map((b,i)=>[b.location,selected[i].left])),rankRequirement,key},q,order(rankRequirement));
        if(resultKeys.has(key)) {
          const existing=results.findIndex(r=>r.key===key);
          if(compareResults(results[existing],result)<=0)return;
          results.splice(existing,1);
        }
        results.push(result);resultKeys.add(key);results.sort(compareResults);
        if(results.length>q.maxResults)resultKeys.delete(results.pop().key);
        return;
      }
      for(const config of options[index]) {
        selected[index]=config;visit(index+1,add({...points},config.points),free+config.left);
        if(!complete)return;
      }
    }
    visit(0,base,0);
  }
  const chosen=[];
  function armors(index,points,slots,defense,charm) {
    if(!tick())return;
    if(defense+suffixDefense[index]<q.minDefense)return;
    const optimisticSuffix=suffixPoints[index].map((v,j)=>v+(hasTorso&&index>1?Math.max(0,(chosen[1].skillPoints[constraints[j].tree]??0)*constraints[j].sign)*4:0));
    if(!feasible(points,slots+suffixSlots[index]+(hasTorso&&index>1?chosen[1].slots*4:0),optimisticSuffix))return;
    if(index===5) {decorate([...chosen],charm,defense);return;}
    for(const a of candidates[index]) {
      chosen[index]=a;armors(index+1,add({...points},a.skillPoints),slots+a.slots,defense+a.defense.base,charm);
      if(!complete)return;
    }
  }
  for(const charm of charmChoices) {
    armors(0,charm?.skills??{},weaponSlots+(charm?.slots??0),0,charm);
    if(!complete)break;
  }
  if(!complete)warnings.push('探索上限に達しました。結果は検証済みの途中候補です。解の不存在や全候補の順位は確定していません');
  return {results,searchedCombinations,elapsedMs:Math.round((performance.now()-start)*100)/100,warnings,complete,visitedNodes,candidateCounts:counts};
}
