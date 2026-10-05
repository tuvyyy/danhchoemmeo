import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputDir: 'docs/captures',
    pattern: '', // substring or prefix to filter
    output: 'docs/captures/contact-sheet.png',
    title: 'Visual Transition Contact Sheet',
    columns: 4,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) options.inputDir = args[++i];
    else if (args[i] === '--pattern' && args[i + 1]) options.pattern = args[++i];
    else if (args[i] === '--output' && args[i + 1]) options.output = args[++i];
    else if (args[i] === '--title' && args[i + 1]) options.title = args[++i];
    else if (args[i] === '--columns' && args[i + 1]) options.columns = parseInt(args[++i], 10);
  }

  return options;
}

async function buildContactSheet() {
  const options = parseArgs();
  console.log(`[make-contact-sheet] Reading images from: ${options.inputDir} (filter: "${options.pattern}")...`);

  const files = await fs.readdir(options.inputDir);
  const imageFiles = files
    .filter((f) => f.endsWith('.png') || f.endsWith('.jpg'))
    .filter((f) => !f.includes('contact-sheet'))
    .filter((f) => (options.pattern ? f.includes(options.pattern) : true))
    .sort();

  if (imageFiles.length === 0) {
    console.error(`[make-contact-sheet] No matching images found in ${options.inputDir}`);
    process.exit(1);
  }

  console.log(`[make-contact-sheet] Found ${imageFiles.length} frames:`, imageFiles);

  // Convert each image to base64 for embedding in the HTML template
  const frames = [];
  for (const file of imageFiles) {
    const fullPath = path.join(options.inputDir, file);
    const buf = await fs.readFile(fullPath);
    const base64 = buf.toString('base64');
    const label = file
      .replace('.png', '')
      .replace('.jpg', '')
      .replace(/^fwd-|^rev-/, '')
      .replace(/-/g, ' ');

    frames.push({
      fileName: file,
      label,
      dataUri: `data:image/png;base64,${base64}`,
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d060a;
      color: #e8d8ce;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      padding: 32px;
      width: fit-content;
      min-width: 1400px;
    }
    header {
      margin-bottom: 28px;
      border-bottom: 1px solid #331522;
      padding-bottom: 16px;
    }
    h1 {
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #f7e7d0;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 14px;
      color: #a88d9b;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${options.columns}, minmax(360px, 1fr));
      gap: 24px;
    }
    .card {
      background: #190b14;
      border: 1px solid #3d1b2a;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }
    .card-header {
      padding: 10px 14px;
      background: #230f1c;
      font-size: 13px;
      font-weight: 600;
      color: #e5cdb8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #381827;
    }
    .card-header .badge {
      background: #4a1932;
      color: #ffd8bf;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card-img-wrap {
      width: 100%;
      background: #000;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .card-footer {
      padding: 8px 14px;
      font-size: 11px;
      color: #8c7380;
      background: #150911;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <header>
    <h1>${options.title}</h1>
    <div class="subtitle">Generated on ${new Date().toISOString()} • Total Frames: ${frames.length}</div>
  </header>
  <div class="grid">
    ${frames
      .map(
        (f, idx) => `
      <div class="card">
        <div class="card-header">
          <span>${f.label}</span>
          <span class="badge">Frame ${idx + 1}</span>
        </div>
        <div class="card-img-wrap">
          <img src="${f.dataUri}" alt="${f.label}" />
        </div>
        <div class="card-footer">${f.fileName}</div>
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Measure body bounds to take a full container snapshot
  const bodyHandle = await page.$('body');
  const outDir = path.dirname(options.output);
  await fs.mkdir(outDir, { recursive: true });

  await bodyHandle.screenshot({ path: options.output });
  await browser.close();

  console.log(`[make-contact-sheet] Successfully generated contact sheet at: ${options.output}`);
}

buildContactSheet().catch((err) => {
  console.error('[make-contact-sheet] ERROR:', err);
  process.exit(1);
});
