from pathlib import Path
from PIL import Image,ImageDraw
import sys
for name in sys.argv[1:]:
 folder=Path('docs/captures')/name;mobile=name.endswith('-mobile');w,h=(195,422) if mobile else (360,225)
 canvas=Image.new('RGB',(w*7,(h+25)*2),'#172027');draw=ImageDraw.Draw(canvas)
 for row,d in enumerate(['forward','reverse']):
  for col,p in enumerate([0,20,40,50,60,80,100]):
   path=folder/f'{d}-{p:03}.png'
   if path.exists():canvas.paste(Image.open(path).convert('RGB').resize((w,h),Image.Resampling.LANCZOS),(col*w,row*(h+25)+25))
   draw.text((col*w+5,row*(h+25)+5),f'{d} {p}%',fill='#dcc9a8')
 canvas.save(folder/'contact-sheet.png')
