from pathlib import Path
from PIL import Image, ImageDraw

base = Path('docs/captures')
points = [0, 20, 40, 50, 60, 80, 100]

def sheet(rows, name, w, h):
    canvas = Image.new('RGB', (max(len(paths) for _, paths in rows) * w, len(rows) * (h + 28)), '#111e24')
    draw = ImageDraw.Draw(canvas)
    for row, (label, paths) in enumerate(rows):
        for col, path in enumerate(paths):
            x, y = col * w, row * (h + 28)
            draw.text((x + 8, y + 7), f'{label} {path.stem}', fill='#dfc9a2')
            if path.exists():
                canvas.paste(Image.open(path).convert('RGB').resize((w, h), Image.Resampling.LANCZOS), (x, y + 28))
    canvas.save(base / name)

for suffix in ['', '-mobile']:
    folder = base / ('anniversary-iteration1' + suffix)
    if not (folder / 'forward-100.png').exists():
        continue
    w, h = (195, 422) if suffix else (360, 225)
    rows = []
    for d in ['forward', 'reverse']:
        existing_paths = [folder / f'{d}-{p:03}.png' for p in points if (folder / f'{d}-{p:03}.png').exists()]
        if existing_paths:
            rows.append((d, existing_paths))
    if rows:
        sheet(rows, f'anniversary-workflow{suffix}-sheet.png', w, h)

