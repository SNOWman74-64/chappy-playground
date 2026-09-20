import {readFile,writeFile} from 'node:fs/promises';
export async function updateSources(records, prefix) {
 const url=new URL('../canonical-data/sources.json',import.meta.url);
 let previous=[];
 try {previous=JSON.parse(await readFile(url,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const next=[...previous.filter(s=>!s.id.startsWith(prefix)),...records].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 await writeFile(url,JSON.stringify(next,null,2)+'\n');
}
