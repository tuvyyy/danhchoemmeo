from PIL import Image,ImageDraw,ImageFont,ImageOps
from pathlib import Path
root=Path('docs/captures')
rows=[('Reference: Lusion - image scale and clear visual anchor','reference-motion/lusion-2.png','Local: photo-first composition','moments-album1/moments-closed.png'),('Reference: Immersive Garden - editorial type and breathing room','reference-motion/immersive-2.png','Local: large-photo album','album-final/album-01.png'),('Reference: Rain Forest Food - layered foreground depth','reference-motion/rainforest.jpg','Local: photos approach from outside the viewport','moments-album1/forward-040.png'),('Before: memories hidden behind four equal covers','moments-approach/moments-closed.png','After: visible pictures, larger first print, album access','moments-album1/moments-closed.png')]
w,h=720,450
sheet=Image.new('RGB',(w*2,(h+36)*len(rows)), '#101c22');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
for r,row in enumerate(rows):
 for c in range(2):
  title,path=row[c*2:c*2+2]
  image=Image.open(root/path).convert('RGB'); image=ImageOps.contain(image,(w,h))
  x=c*w;y=r*(h+36)
  d.text((x+12,y+10),title,fill='#e0ca9e',font=font)
  sheet.paste(image,(x+(w-image.width)//2,y+36+(h-image.height)//2))
sheet.save(root/'reference-motion/comparison.png')
