async (page) => {
 const base='http://localhost:4173/ui-lab/game-astra-solo-01/',key='ui-lab:game-astra-solo-01:v1';
 const results=[],assert=(x,m)=>{if(!x)throw Error(m)};
 await page.goto(base+'?check='+Date.now()+'#guide/g01');await page.locator('[data-bookmark]').waitFor();
 if(await page.locator('[data-bookmark]').getAttribute('aria-pressed')==='false')await page.locator('[data-bookmark]').click();
 await page.goto(base+'?check='+Date.now()+'#privacy');await page.locator('#reset-data').waitFor();
 const sentinel='ui-lab:astra-acceptance-sentinel:'+Date.now();
 const before=await page.evaluate(({key,sentinel})=>{localStorage.setItem(sentinel,'keep-me');return localStorage.getItem(key)},{key,sentinel});
 assert(before!==null,'saved state exists');
 await page.locator('#reset-data').click();await page.locator('#modal-cancel').click();
 assert(await page.evaluate(k=>localStorage.getItem(k),key)===before,'cancel unchanged');
 await page.locator('#reset-data').click();await page.locator('#modal-confirm').click();
 assert(await page.evaluate(k=>localStorage.getItem(k),key)===null,'demo key removed');
 assert(await page.evaluate(k=>localStorage.getItem(k),sentinel)==='keep-me','other key preserved');
 await page.goto(base+'?check='+Date.now()+'#board');await page.locator('.page-title').waitFor();
 assert(await page.locator('[data-thread]').count()===6,'six seeds restored');
 await page.goto(base+'?check='+Date.now()+'#saved');await page.locator('.page-title').waitFor();
 assert(await page.locator('[data-guide]').count()===0,'saved list empty');
 await page.evaluate(k=>localStorage.removeItem(k),sentinel);
 results.push({id:'P01',status:'PASS',evidence:'Cancel byte-preserves existing state; confirm removes only demo key; sentinel retained; 6 seed threads and 0 bookmarks restored'});
 const scenarios=[];
 for(const mode of ['write-denied','read-denied','corrupt-json','corrupt-schema','corrupt-nested-replies']){
  const context=await page.context().browser().newContext();
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
  try{
   await p.addInitScript(({key,mode})=>{
    if(mode==='write-denied'){const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('Test denial','QuotaExceededError');return old.call(this,k,v)}}
    if(mode==='read-denied'){const old=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k===key)throw new DOMException('Test denial','SecurityError');return old.call(this,k)}}
    if(mode==='corrupt-json')localStorage.setItem(key,'{broken');
    if(mode==='corrupt-schema')localStorage.setItem(key,JSON.stringify({version:1,bookmarks:42}));
    if(mode==='corrupt-nested-replies')localStorage.setItem(key,JSON.stringify({version:1,owner:'test',bookmarks:[],threads:[{id:'test-thread',owner:'test',created:'2026-09-07T12:00:00Z',author:'旅人',title:'題名',category:'質問',body:'本文',replies:17}],replies:{},edits:{},deleted:[]}));
   },{key,mode});
   await p.goto(base+'#guide/g01');await p.locator('[data-bookmark]').waitFor();
   await p.locator('[data-bookmark]').click();
   assert(await p.locator('#storage-warning').isVisible(),mode+' warning');
   assert((await p.locator('#storage-warning').innerText()).includes('一時利用'),mode+' temporary');
   assert((await p.locator('#toast').innerText()).includes('未保存'),mode+' not false success');
   await p.getByRole('link',{name:'データ管理・復旧',exact:true}).click();await p.locator('#reset-data').waitFor();
   await p.locator('#reset-data').click();await p.locator('#modal-confirm').click();
   assert(await p.locator('#storage-warning').isHidden(),mode+' recovery available');
   assert(errors.length===0,mode+' no page errors');
   scenarios.push({mode,status:'PASS',pageerrors:errors});
  }finally{await context.close()}
 }
 results.push({id:'P02',status:'PASS',evidence:'Write/read denial and corrupt JSON/schema: visible warning, temporary bookmark, no false save claim, recovery action, no pageerror',scenarios});
 return {utc:new Date().toISOString(),results};
}
