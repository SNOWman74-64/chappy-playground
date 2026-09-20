import {readFile} from 'node:fs/promises';
import {solveArmor} from '../solver/api.mjs';
try {
  const raw=process.argv[2] ? await readFile(process.argv[2],'utf8') : await new Promise((resolve,reject)=>{let s='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>resolve(s));process.stdin.on('error',reject);});
  process.stdout.write(JSON.stringify(await solveArmor(JSON.parse(raw)),null,2)+'\n');
} catch(error) {process.stderr.write(error.message+'\n');process.exitCode=1;}
