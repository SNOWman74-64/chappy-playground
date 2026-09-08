async (page) => {
 const base='http://localhost:4173/ui-lab/game-astra-solo-01/',assert=(x,m)=>{if(!x)throw Error(m)};
 await page.setViewportSize({width:390,height:844});await page.goto(base+'?parent='+Date.now()+'#new');await page.locator('#new-thread').waitFor();
 await page.locator('#new-title').fill('W'.repeat(80));await page.locator('#new-author').fill('W'.repeat(24));await page.locator('#new-body').fill('W'.repeat(1000));
 await page.getByRole('button',{name:'確認へ進む',exact:true}).click();await page.locator('#publish-thread').click();await page.locator('#reply-form').waitFor();
 const postId=await page.locator('.post').first().getAttribute('data-post');
 await page.reload();await page.locator('[data-post="'+postId+'"]').waitFor();
 const overflow=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,outside:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth)}).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,40)}))}));
 await page.screenshot({path:'C:/Users/user/Projects/新しいフォルダー/ui-lab/game-astra-solo-01/evidence/final/long-post-390.png',fullPage:true,scale:'css'});
 await page.locator('[data-edit]').click();await page.locator('#edit-title').fill('親投稿の編集テスト');await page.locator('#edit-body').fill('親投稿も編集できます。');await page.locator('#modal-confirm').click();
 await page.getByRole('heading',{name:'親投稿の編集テスト',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'親投稿の編集テスト',exact:true}).waitFor();
 assert(await page.locator('.post-body').innerText()==='親投稿も編集できます。','parent edit persists');
 await page.locator('[data-delete]').click();await page.locator('#modal-cancel').click();assert(await page.locator('.post').count()===1,'parent cancel');
 await page.locator('[data-delete]').click();await page.locator('#modal-confirm').click();await page.getByRole('heading',{name:'旅人たちの掲示板',exact:true}).waitFor();
 assert(await page.locator('[data-thread]').count()===6,'delete returns six seeds');
 await page.goto(base+'?deleted='+Date.now()+'#thread/'+postId);await page.getByRole('heading',{name:'ページが見つかりません',exact:true}).waitFor();
 return {utc:new Date().toISOString(),status:overflow.scrollWidth>overflow.width?'FAIL':'PASS',evidence:'80 title/24 author/1000 body accepted and reloaded; own parent title/body edit persisted; cancel keeps parent; delete hides route and returns 6 threads',overflow};
}
