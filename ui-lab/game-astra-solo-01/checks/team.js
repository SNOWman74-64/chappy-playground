async (page) => {
 const base='http://localhost:4173/ui-lab/game-astra-solo-01/';
 const results=[],assert=(x,m)=>{if(!x)throw Error(m)};
 await page.goto(base+'?check='+Date.now()+'#team?ids=');await page.locator('.page-title').waitFor();
 for(const id of ['c01','c02','c03','c04']){await page.locator('[data-add="'+id+'"]').click();await page.locator('[data-remove="'+id+'"]').waitFor()}
 await page.locator('[data-add="c01"]').click();
 assert((await page.locator('#toast').innerText()).includes('重複'),'duplicate explanation');
 await page.locator('[data-add="c05"]').click();
 assert((await page.locator('#toast').innerText()).includes('満員'),'full explanation');
 assert(await page.locator('[data-remove]').count()===4,'still four');
 await page.locator('[data-remove="c04"]').click();await page.waitForFunction(()=>document.querySelectorAll('[data-remove]').length===3);
 await page.locator('[data-add="c05"]').click();await page.locator('[data-remove="c05"]').waitFor();
 results.push({id:'T01',status:'PASS',evidence:'c01-c04 added; c01 duplicate and c05 full rejected; removed c04 and added c05'});
 const url=await page.locator('#share-url').inputValue();const other=await page.context().newPage();
 await other.goto(url);await other.locator('[data-remove="c05"]').waitFor();
 assert(JSON.stringify(await other.locator('[data-remove]').evaluateAll(xs=>xs.map(x=>x.dataset.remove)))===JSON.stringify(['c01','c02','c03','c05']),'new tab restore');
 await other.goto(base+'?check='+Date.now()+'#team?ids=c01,c01,nope,c02,c03,c04,c05');await other.locator('.page-title').waitFor();
 assert((await other.locator('main').innerText()).includes('不正なID・重複ID・5枠目以降を除外'),'invalid explanation');
 assert(JSON.stringify(await other.locator('[data-remove]').evaluateAll(xs=>xs.map(x=>x.dataset.remove)))===JSON.stringify(['c01','c02','c03','c04']),'safe ids');
 await other.close();
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('simulated clipboard denial')}}}));
 await page.locator('[data-copy]').click();
 assert((await page.locator('#toast').innerText()).includes('手動'),'clipboard fallback');
 assert(await page.locator('#share-url').evaluate(x=>x.selectionEnd-x.selectionStart)===url.length,'url selected');
 results.push({id:'T02',status:'PASS',evidence:'New tab restores 4 IDs; invalid/duplicate/overflow IDs filtered with explanation; denied clipboard selects readable URL',url});
 return {utc:new Date().toISOString(),results};
}
