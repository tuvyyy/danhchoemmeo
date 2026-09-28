import fs from 'node:fs';
import zlib from 'node:zlib';

function getPngBoundingBox(filePath) {
  const buf = fs.readFileSync(filePath);
  // parse PNG chunks to find IHDR and IDAT
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
      bitDepth = buf[pos + 16];
      colorType = buf[pos + 17];
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  // For RGBA 8-bit, each scanline has 1 filter byte + width * 4 bytes
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let stride = width * 4 + 1;
  for (let y = 0; y < height; y++) {
    const lineStart = y * stride + 1;
    for (let x = 0; x < width; x++) {
      const alpha = decompressed[lineStart + x * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    width, height,
    bbox: { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 },
    rel: {
      left: (minX / width * 100).toFixed(1) + '%',
      top: (minY / height * 100).toFixed(1) + '%',
      width: ((maxX - minX + 1) / width * 100).toFixed(1) + '%',
      height: ((maxY - minY + 1) / height * 100).toFixed(1) + '%'
    }
  };
}

const dir = 'c:/danhchoemmeo/public/assets/envelope-voucher/';
const files = [
  '02_envelope_top_flap.png',
  '03_envelope_bottom_pocket.png',
  '04_envelope_inner_liner.png',
  '05_wax_seal.png',
  '06_letter_note.png',
  '07_voucher_01_food.png',
  '08_voucher_02_coffee.png',
  '09_voucher_03_movie.png',
  '10_voucher_04_anywhere.png'
];

for (const f of files) {
  console.log(f, JSON.stringify(getPngBoundingBox(dir + f)));
}