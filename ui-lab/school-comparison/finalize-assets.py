import pathlib,urllib.request,json,concurrent.futures
r=pathlib.Path('school-comparison/assets')
items=[('campus','1777500394253-b620e09dfe2b','Trac Vu','modern-building-beside-a-tranquil-lake-with-people-walking-VofeQOzGaRs'),('basketball','1530232288631-63b79b9126b0','Griest Projects','indoor-photography-of-basketball-court-EKXCGy4Zsbg'),('library','1498243691581-b145c3f54a5a','Priscilla Du Preez','shallow-focus-photography-of-bookshelfs-ggeZ9oyI-PE'),('students','1560968065-9b834f0bc678','Alessandro Pacilio','people-standing-near-trees-and-building-during-daytime-CXQCTwKRM7o')]
def get(x):
 n,p,a,s=x;data=urllib.request.urlopen('https://images.unsplash.com/photo-'+p+'?auto=format&fit=crop&w=1800&q=85',timeout=40).read();(r/(n+'.jpg')).write_bytes(data);return dict(name=n,file=n+'.jpg',source='https://unsplash.com/photos/'+s,author=a,bytes=len(data))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: result=list(pool.map(get,items))
old=json.loads((r/'assets.json').read_text(encoding='utf-8'));result += [i for i in old if i['name']=='classroom']
(r/'assets.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
pathlib.Path('school-comparison/ASSETS.md').write_text('# 写真の出典\n\n写真は学校生活を表すイメージ素材であり、実在の青葉高等学校を示しません。画像生成サービスが404を返したため、共通写真をストック素材に変更しました。\n\n[Unsplash License](https://unsplash.com/license)を2026年9月7日に確認。\n\n'+'\n'.join('- '+i['file']+': ['+i['author']+']('+i['source']+')' for i in result),encoding='utf-8')
p=pathlib.Path('school-comparison/DESIGN-PLAN.md');s=p.read_text(encoding='utf-8').replace('共通のAI生成写真','共通のストック写真（画像生成サービスの404エラーにより変更）').replace('assets/campus.png と assets/life.png','assets/campus.jpg、classroom.jpg、library.jpg、basketball.jpg、students.jpg').replace('写真生成は共通準備時間に含む','写真準備は共通準備時間に含む');p.write_text(s,encoding='utf-8')
print('Shared assets ready')
