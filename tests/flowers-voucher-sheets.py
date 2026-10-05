"""Contact sheets preserve viewport aspect ratios; inspect PNGs, not coverage scores."""
from pathlib import Path
from PIL import Image, ImageDraw

base = Path('docs/captures')
keyframes = [0, 20, 40, 50, 60, 80, 100]

def sheet(rows, output, width=360, height=225):
    columns = max(len(files) for _, files in rows)
    canvas = Image.new('RGB', (columns * width, len(rows) * (height + 32)), '#160c12')
    draw = ImageDraw.Draw(canvas)
    for row, (label, files) in enumerate(rows):
        for col, file in enumerate(files):
            x, y = col * width, row * (height + 32)
            draw.text((x + 9, y + 9), f'{label} {int(file.stem.split("-")[-1])}%', fill='#eadbc3')
            canvas.paste(Image.open(file).convert('RGB').resize((width, height), Image.Resampling.LANCZOS), (x, y + 32))
    canvas.save(base / output)

def frames(label, direction, percentages=keyframes):
    return [base / f'flowers-voucher-{label}' / f'{direction}-{p:03}.png' for p in percentages]

latest = 'refined-final' if (base / 'flowers-voucher-refined-final' / 'reverse-100.png').exists() else 'final'
sheet([('CURRENT', frames('current', 'forward')), ('NEW', frames(latest, 'forward'))], 'flowers-voucher-before-after.png')
sheet([('CURRENT REVERSE', frames('current', 'reverse')), ('NEW REVERSE', frames(latest, 'reverse'))], 'flowers-voucher-reverse-before-after.png')
for label in ['iteration1', 'iteration2', 'final', 'final-mobile']:
    mobile = 'mobile' in label
    sheet([(direction.upper(), frames(label, direction)) for direction in ['forward', 'reverse']], f'flowers-voucher-{label}-sheet.png', *( (195, 422) if mobile else (360, 225)))
for label in ['final', 'final-mobile']:
    for direction in ['forward', 'reverse']:
        # Three rows: 0-30%, 35-65%, 70-100%, with a 5% sampling interval.
        files = frames(label, direction, list(range(0, 101, 5)))
        sheet([(direction.upper(), files[i:i+7]) for i in range(0, 21, 7)], f'flowers-voucher-{label}-{direction}-dense.png', *((195, 422) if 'mobile' in label else (360, 225)))

if (base / 'flowers-voucher-refined-final-mobile' / 'reverse-100.png').exists():
    for label in ['refinement1', 'refinement2', 'refined-final', 'refinement1-mobile', 'refinement2-mobile', 'refined-final-mobile']:
        sheet([(d.upper(), frames(label, d)) for d in ['forward', 'reverse']], f'flowers-voucher-{label}-sheet.png', *((195, 422) if 'mobile' in label else (360, 225)))
    for suffix in ['', '-mobile']:
        size = (195, 422) if suffix else (360, 225)
        for direction in ['forward', 'reverse']:
            sheet([('BEFORE', frames('refinement-before'+suffix, direction)), ('REFINED', frames('refined-final'+suffix, direction))], f'flowers-voucher-refinement-{direction}{suffix}-comparison.png', *size)
            files = frames('refined-final'+suffix, direction, list(range(0,101,5)))
            sheet([(direction.upper(), files[i:i+7]) for i in range(0,21,7)], f'flowers-voucher-refined-final{suffix}-{direction}-dense.png', *size)

for suffix in ['', '-mobile']:
    size = (195, 422) if suffix else (360, 225)
    label = 'workflow2' + suffix
    if (base / f'flowers-voucher-{label}' / 'reverse-100.png').exists():
        sheet([(d.upper(), frames(label, d)) for d in ['forward', 'reverse']], f'flowers-voucher-{label}-sheet.png', *size)
        sheet([('BEFORE', frames('refined-final'+suffix, 'forward')), ('SCROLL FLOW', frames(label, 'forward'))], f'flowers-voucher-workflow-comparison{suffix}.png', *size)
        for direction in ['forward', 'reverse']:
            files=frames(label,direction,list(range(0,101,5)))
            sheet([(direction.upper(),files[i:i+7]) for i in range(0,21,7)],f'flowers-voucher-{label}-{direction}-dense.png',*size)
