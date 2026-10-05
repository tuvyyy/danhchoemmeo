from pathlib import Path
from PIL import Image, ImageDraw
base=Path('docs/captures');points=[0,20,40,50,60,80,100]
def sheet(rows,name,w,h):
    canvas=Image.new('RGB',(max(len(paths) for _,paths in rows)*w,len(rows)*(h+28)),'#111e24');draw=ImageDraw.Draw(canvas)
    for row,(label,paths) in enumerate(rows):
        for col,path in enumerate(paths):
            x,y=col*w,row*(h+28);draw.text((x+8,y+7),f'{label} {path.stem}',fill='#dfc9a2');canvas.paste(Image.open(path).convert('RGB').resize((w,h),Image.Resampling.LANCZOS),(x,y+28))
    canvas.save(base/name)
for suffix in ['', '-mobile']:
    folder=base/('moments-final'+suffix)
    if not (folder/'reverse-100.png').exists():continue
    w,h=(195,422) if suffix else (360,225)
    sheet([(d,[folder/f'{d}-{p:03}.png' for p in points]) for d in ['forward','reverse']],f'moments-workflow{suffix}-sheet.png',w,h)
    for d in ['forward','reverse']:
        files=[folder/f'{d}-{p:03}.png' for p in range(0,101,5)]
        sheet([(d,files[i:i+7]) for i in range(0,21,7)],f'moments-{d}{suffix}-dense.png',w,h)
    sheet([('ITERATION 1',[base/('moments-iteration2'+suffix)/'forward-050.png']),('FINAL',[folder/'forward-050.png'])],f'moments-midpoint-comparison{suffix}.png',390 if suffix else 960,844 if suffix else 600)
