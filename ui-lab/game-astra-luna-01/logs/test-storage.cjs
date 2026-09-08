const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(require('path').join(__dirname,'../app.js'),'utf8').replace(/loadContent\(\);\s*$/, '');
const fixture = JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../experiments/social-game/fixtures/content.json'),'utf8'));
function setup(initial={},fail=false){
 const data=new Map(Object.entries(initial));
 const context=vm.createContext({console,URLSearchParams,Date,Math,crypto:require('crypto').webcrypto,document:{querySelector:()=>null,addEventListener:()=>{}},window:{addEventListener:()=>{},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('denied');data.set(k,v)},removeItem:k=>{if(fail)throw Error('denied');data.delete(k)}}}});
 vm.runInContext(source,context);context.fixture=fixture;vm.runInContext('content=fixture; store=loadStore();',context);return {context,data};
}
const results=[];
for(const [name,initial,fail] of [['malformed-json',{'seikan-chronicle-demo:v1':'{'},false],['write-denied',{},true],['nested-corruption',{'seikan-chronicle-demo:v1':JSON.stringify({version:1,ownerId:'traveler-12345678',bookmarks:[],party:[],userThreads:[null],userReplies:[],deleted:[],reports:[],edits:{}})},false]]){
 try {const {context}=setup(initial,fail);const observation=vm.runInContext('({mode:storageMode,notice:storageNotice,threads:allThreads().length,save:saveStore()})',context);results.push({name,pass:observation.mode==='temporary'&&observation.threads===6&&!observation.save,observation});}catch(error){results.push({name,pass:false,error:error.message})}
}
console.log(JSON.stringify({scope:'Node VM storage/derived-data test with mocked localStorage, not real-browser failure injection',results},null,2));
process.exitCode=results.every(r=>r.pass)?0:1;
