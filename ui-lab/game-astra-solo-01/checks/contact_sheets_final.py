from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parents[1]/'evidence/final'
names=['home','characters','article','thread','team']
for width in [1440,390,820]:
    cell=390 if width==390 else 576
    suffix='' if width!=820 else '-full'
    images=[]
    for name in names:
        im=Image.open(root/f'{name}-{width}{suffix}.png').convert('RGB')
        im=ImageOps.contain(im,(cell,1800))
        images.append((name,im))
    sheet=Image.new('RGB',(cell*len(names),max(i.height for _,i in images)+35),'#dbe2e8')
    draw=ImageDraw.Draw(sheet)
    for k,(name,im) in enumerate(images):
        draw.text((k*cell+10,10),f'{name} / {width}px',fill='black')
        sheet.paste(im,(k*cell,35))
    sheet.save(root/f'contact-{width}.png')
for width in [1440,390]:
    cell=390 if width==390 else 500
    images=[]
    for name in names:
        im=Image.open(root/f'{name}-{width}-full.png').convert('RGB')
        im=ImageOps.contain(im,(cell,2400));images.append((name,im))
    sheet=Image.new('RGB',(cell*5,max(i.height for _,i in images)+35),'#dbe2e8')
    draw=ImageDraw.Draw(sheet)
    for k,(name,im) in enumerate(images):
        draw.text((k*cell+10,10),f'{name} full / {width}px',fill='black');sheet.paste(im,(k*cell,35))
    sheet.save(root/f'contact-full-{width}.png')
