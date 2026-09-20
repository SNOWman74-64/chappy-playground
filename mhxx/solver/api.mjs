import {solveArmor as search} from './armor-solver.mjs';
import {loadCharms} from '../charm-library/library.mjs';
let cached;
export async function loadData() {
  if (!cached) cached=(async()=>{
    const read=async name=>{
      const url=new URL(`../canonical-data/${name}.json`,import.meta.url);
      if(url.protocol==='file:') return JSON.parse(await (await import('node:fs/promises')).readFile(url,'utf8'));
      const response=await fetch(url);if(!response.ok)throw new Error(`データ読込失敗: ${name}`);return response.json();
    };
    const [armor,decorations,skills,trees,ranks,weapons,charmRules]=await Promise.all(['armor','decorations','hunter-skills','skill-trees','rank-unlocks','weapons','charm-rules'].map(read));
    return {armor,decorations,skills,trees,ranks,weapons,charmRules};
  })().catch(error=>{cached=undefined;throw error;});
  return cached;
}
export async function solveArmor(query) {
  const data=await loadData();
  let charms=query.charms;
  if(query.useCharmLibrary && charms===undefined) {
    if(typeof localStorage!=='undefined')charms=loadCharms(localStorage,{skillTrees:data.trees,charmRules:data.charmRules});
    else if(new URL(import.meta.url).protocol==='file:')charms=JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../charm-library/charms.json',import.meta.url),'utf8'));
    else throw new Error('Workerには登録済みcharmsを明示的に渡してください');
  }
  return search({...query,...(charms!==undefined?{charms}:{})},data);
}
