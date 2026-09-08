async (page) => {
 const base='http://localhost:4173/ui-lab/game-astra-solo-01/',errors=[],httpFailures=[],consoleErrors=[],results=[];
 const onError=e=>errors.push(String(e));const onResponse=r=>{if(r.status()>=400)httpFailures.push({url:r.url(),status:r.status()})};const onConsole=m=>{if(m.type()==='error')consoleErrors.push(m.text())};
 page.on('pageerror',onError);page.on('response',onResponse);page.on('console',onConsole);
 try{
  const fixture=await page.evaluate(async()=>await (await fetch('../experiments/social-game/fixtures/content.json')).json());
  const routes=[...fixture.characters.map(c=>['character/'+c.id,c.name]),...fixture.guides.map(g=>['guide/'+g.id,g.title]),...fixture.events.map(e=>['event/'+e.id,e.title]),...fixture.threads.map(t=>['thread/'+t.id,t.title]),...['character/nope','guide/nope','event/nope','thread/nope','nonexistent'].map(r=>[r,'ページが見つかりません'])];
  for(const [route,heading]of routes){await page.goto(base+'?check='+Date.now()+'#'+route);await page.getByRole('heading',{name:heading,exact:true}).waitFor();results.push({route,heading,status:'PASS'})}
  if(errors.length||httpFailures.length||consoleErrors.length)throw Error(JSON.stringify({errors,httpFailures,consoleErrors}));
  return {utc:new Date().toISOString(),results:[{id:'R01',status:'PASS',evidence:'All 29 seeded detail URLs + 5 unknown routes loaded directly; expected titles; zero pageerror/HTTP failures/console errors',routes:results,errors,httpFailures,consoleErrors}]};
 }finally{page.off('pageerror',onError);page.off('response',onResponse);page.off('console',onConsole)}
}
