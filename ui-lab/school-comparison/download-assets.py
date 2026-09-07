import urllib.request, pathlib, json, concurrent.futures, re, html
root=pathlib.Path('school-comparison/assets')
items=[('campus','https://unsplash.com/photos/school-building-overlooks-an-empty-basketball-court-AVWYoKRaE8w','Danny Greenberg','https://images.unsplash.com/photo-1751510455182-2b88a09e2829'),('classroom','https://unsplash.com/photos/students-gather-inside-a-school-building-ls5wepv5pW4','Yanhao Fang','https://images.unsplash.com/photo-1743032937652-d5e03c3236e1'),('library','https://unsplash.com/photos/shallow-focus-photography-of-bookshelfs-ggeZ9oyI-PE','Priscilla Du Preez','https://images.unsplash.com/photo-1507842217343-583bb7270b66'),('basketball','https://unsplash.com/photos/school-building-overlooks-an-empty-basketball-court-AVWYoKRaE8w','Danny Greenberg','https://images.unsplash.com/photo-1751510455182-2b88a09e2829')]
def get(x):
 name,page,author,url=x
 data=urllib.request.urlopen(url+'?auto=format&fit=crop&w=1800&q=85',timeout=45).read()
 (root/(name+'.jpg')).write_bytes(data)
 return dict(name=name,file=name+'.jpg',source=page,author=author,bytes=len(data))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(get,items))
(root/'assets.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
pathlib.Path('school-comparison/ASSETS.md').write_text('# 写真の出典\n\n写真は学校生活を表すイメージ素材です。青葉高等学校の実在を示すものではありません。生成サービスが404を返したため、両案とも同じストック写真に変更しました。\n\nライセンス確認: https://unsplash.com/license （2026-09-07）。\n\n'+'\n'.join('- '+x['file']+': ['+x['author']+']('+x['source']+')' for x in results),encoding='utf-8')
print(results)
