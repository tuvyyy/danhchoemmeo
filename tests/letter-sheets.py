from pathlib import Path
from PIL import Image, ImageDraw
base=Path('docs/captures')
points=[0,20,40,50,60,80,100]
def sheet(rows,out,width,height):
    canvas=Image.new('RGB',(len(rows[0][1])*width,len(rows)*(height+28)),'#170d12');draw=ImageDraw.Draw(canvas)
    for row,(label,paths) in enumerate(rows):
        for col,path in enumerate(paths):
            x,y=col*width,row*(height+28)
            draw.text((x+8,y+7),label+' '+path.stem,fill='#dfc8a1')
            canvas.paste(Image.open(path).convert('RGB').resize((width,height),Image.Resampling.LANCZOS),(x,y+28))
    canvas.save(base/out)
for suffix in ['', '-mobile']:
    folder=base/('letter-final'+suffix)
    if not (folder/'reverse-100.png').exists():continue
    w,h=(195,422) if suffix else (360,225)
    sheet([(d,[folder/f'{d}-{p:03}.png' for p in points]) for d in ['forward','reverse']],f'letter-workflow{suffix}-sheet.png',w,h)
    sheet([('BEFORE',[base/('letter-before'+suffix)/'letter-closed.png']),('AFTER',[folder/'letter-closed.png']),('OPEN',[folder/'letter-open.png'])],f'letter-before-after{suffix}.png',390 if suffix else 960,844 if suffix else 600)
    for d in ['forward','reverse']:
        files=[folder/f'{d}-{p:03}.png' for p in range(0,101,5)]
        sheet([(d,files[i:i+7]) for i in range(0,21,7)],f'letter-{d}{suffix}-dense.png',w,h)
