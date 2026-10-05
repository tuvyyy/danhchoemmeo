from PIL import Image,ImageDraw,ImageFont,ImageOps
from pathlib import Path
base=Path('docs/captures');font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
rows=[('Reference: Immersive Garden - relief follows the pointer','pointer-reference/hover-6.png','Local: flowers and cats emerge under the pointer','hero-gallery-final/relief-cats.png'),('Reference: supplied video at 00:09 - dark botanical scene','pointer-reference/video-004.jpg','Local: night garden with light and depth responding to movement','hero-gallery-final/night-left.png'),('Local: relief at another pointer position','hero-gallery-final/relief-flower.png','Local: the pointer trail fades back into the plaster','hero-gallery-final/settled.png')]
s=Image.new('RGB',(1440,3*486),'#172125');d=ImageDraw.Draw(s)
for row,items in enumerate(rows):
 for col in range(2):
  title,path=items[col*2:col*2+2];im=ImageOps.contain(Image.open(base/path).convert('RGB'),(720,450));x=col*720;y=row*486;d.text((x+10,y+10),title,font=font,fill='#dcccae');s.paste(im,(x+(720-im.width)//2,y+36+(450-im.height)//2))
s.save(base/'hero-gallery-final/reference-comparison.jpg',quality=92)
