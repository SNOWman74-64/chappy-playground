import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {updateSources} from './source-registry.mjs';
const url='https://mhxx.kiranico.com/buki/40b60';
const html=process.argv[2] ? await readFile(process.argv[2],'utf8') : await (async()=>{const r=await fetch(url);if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.text();})();
const plain=s=>s.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
const weapons=[];
for(const [,row] of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
 const cells=[...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(m=>plain(m[1]));
 if(cells.length!==6 || !/ LV\d+$/.test(cells[0]) || !/^\d+$/.test(cells[1]))continue;
 const level=Number(cells[0].match(/LV(\d+)$/)[1]);
 if(!/^[◯〇○―]+$/.test(cells[4]))throw new Error(`Unknown slot notation ${cells[4]}`);
 weapons.push({id:`sns-40b60-lv${level}`,name:cells[0],weaponType:'SwordAndShield',slots:[...cells[4]].filter(c=>'◯〇○'.includes(c)).length,rankRequirement:level===1?'HR1':null,confidence:level===1?'medium':'low',sourceIds:['kiranico-mhxx-hunter-knife',...(level===1?['kiranico-mhxx-iron-ore']:[])],notes:level===1?'生産素材は鉄鉱石3個。集★1報酬・下位採掘の出典を併記。素材所持は別条件。':'強化段階の解禁進行度は未確認。weaponId指定の進行度検索では除外。',attack:Number(cells[1]),level});
}
if(weapons.length!==11 || new Set(weapons.map(w=>w.id)).size!==11)throw new Error(`Source structure changed: ${weapons.length} weapons`);
const root=new URL('../canonical-data/',import.meta.url);await mkdir(root,{recursive:true});
await writeFile(new URL('weapons.json',root),JSON.stringify(weapons,null,2)+'\n');
const sources=[{id:'kiranico-mhxx-hunter-knife',name:'Kiranico MHXX ハンターナイフ強化系統',url,type:'database',verifiedAt:'2026-09-21',sha256:createHash('sha256').update(html).digest('hex'),confidence:'medium',notes:'MHXX日本語ページから名前・段階・スロット・攻撃力を抽出。進行度はLV1以外未確認。HTMLは動的なためhashは取得時の照合用。'}, {id:'kiranico-mhxx-iron-ore',name:'Kiranico MHXX 鉄鉱石 入手条件',url:'https://mhxx.kiranico.com/item/5d436',type:'database',verifiedAt:'2026-09-21',confidence:'medium'}];
await writeFile(new URL('weapon-sources.json',root),JSON.stringify(sources,null,2)+'\n');
await updateSources(sources,'kiranico-mhxx-');
console.log(JSON.stringify({weapons:weapons.length,verifiedRank:1,unknownRank:10}));
