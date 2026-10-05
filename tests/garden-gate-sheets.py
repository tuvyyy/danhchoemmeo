from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

root = Path('docs/captures')
for name in ['garden-gate-final', 'garden-gate-final-mobile']:
    folder = root / name
    mobile = name.endswith('-mobile')
    w, h = (195, 422) if mobile else (360, 225)
    frames = list(range(0, 101, 5))
    sheet = Image.new('RGB', (w * 7, (h + 26) * 6), '#14221c')
    draw = ImageDraw.Draw(sheet)
    for direction_id, direction in enumerate(['forward', 'reverse']):
        for i, percent in enumerate(frames):
            x, y = i % 7 * w, (direction_id * 3 + i // 7) * (h + 26)
            image = Image.open(folder / f'{direction}-{percent:03}.png').convert('RGB')
            sheet.paste(image.resize((w, h), Image.Resampling.LANCZOS), (x, y + 26))
            draw.text((x + 8, y + 6), f'{direction} {percent:02}%', fill='#dfcfac')
    sheet.save(folder / 'dense-contact-sheet.jpg', quality=92)

# Pair seven visual milestones of the supplied recording with the implementation.
w, h = 640, 400
comparison = Image.new('RGB', (w * 2, (h + 32) * 7), '#14221c')
draw = ImageDraw.Draw(comparison)
for i, percent in enumerate([20, 30, 40, 50, 60, 70, 80]):
    paths = [root / 'door-reference-oct01' / f'gate-{i+1:02}.png',
             root / 'garden-gate-final' / f'forward-{percent:03}.png']
    for col, path in enumerate(paths):
        frame = ImageOps.contain(Image.open(path).convert('RGB'), (w, h), Image.Resampling.LANCZOS)
        x, y = col * w, i * (h + 32)
        comparison.paste(frame, (x + (w - frame.width) // 2, y + 32 + (h - frame.height) // 2))
        label = f'REFERENCE - {6.4+i*.4:.1f}s' if col == 0 else f'IMPLEMENTATION - {percent}%'
        draw.text((x + 12, y + 9), label, fill='#dfcfac')
comparison.save(root / 'garden-gate-final' / 'reference-comparison.jpg', quality=94)
