async (page) => {
 const base='http://localhost:4173/ui-lab/game-astra-solo-01/';
 const root='C:/Users/user/Projects/新しいフォルダー/ui-lab/game-astra-solo-01/evidence/final/';
 const results=[],errors=[],httpFailures=[];
 const onError=e=>errors.push(String(e));const onResponse=r=>{if(r.status()>=400)httpFailures.push({url:r.url(),status:r.status()})};
 page.on('pageerror',onError);page.on('response',onResponse);
 try{
  for(const width of [1440,390,820]){
   const height=width===390?844:1000;await page.setViewportSize({width,height});
   for(const [name,route]of [['home','home'],['characters','characters'],['article','guide/g01'],['thread','thread/t03'],['team','team?ids=c01,c02,c03,c04']]){
    await page.goto(base+'?visual='+width+'-'+name+'#'+route);await page.locator('.page-title').waitFor();
    for(const img of await page.locator('img').all())await img.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    await page.evaluate(()=>scrollTo(0,0));
    const metrics=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight},scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),outside:[...document.querySelectorAll('main a,main button,main input,main textarea,main select')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth)}).map(e=>e.outerHTML.slice(0,150))}));
    await page.screenshot({path:root+name+'-'+width+'-full.png',fullPage:true,scale:'css'});
    if(width!==820)await page.screenshot({path:root+name+'-'+width+'.png',scale:'css'});
    results.push({name,route,...metrics});
   }
  }
  return {utc:new Date().toISOString(),results:[{id:'V01',status:results.every(r=>!r.overflow&&!r.outside.length&&r.images.every(i=>i.loaded))&&!errors.length&&!httpFailures.length?'PASS':'FAIL',evidence:'Real browser: 5 requested routes × 1440/390/820 widths, full-page captures; visual inspection recorded separately',pages:results,errors,httpFailures}]};
 }finally{page.off('pageerror',onError);page.off('response',onResponse)}
}
