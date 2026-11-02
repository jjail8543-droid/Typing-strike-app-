import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, r, g, b, drawCenter = true) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowSize = width * 3;
  const rawData = Buffer.alloc(height * (1 + rowSize));

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowSize);
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      const dist = Math.hypot(x - cx, y - cy);

      if (drawCenter && dist < maxR && dist > maxR - 8) {
        // Cyan shield ring
        rawData[pixelOffset] = 56;
        rawData[pixelOffset + 1] = 189;
        rawData[pixelOffset + 2] = 248;
      } else if (drawCenter && dist <= maxR - 8 && dist > maxR * 0.3) {
        // Dark blue interior
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
      } else if (drawCenter && dist <= maxR * 0.3) {
        // Amber laser core
        rawData[pixelOffset] = 245;
        rawData[pixelOffset + 1] = 158;
        rawData[pixelOffset + 2] = 11;
      } else {
        // Subtle cyber space gradient
        const vertGrad = Math.floor((y / height) * 15);
        rawData[pixelOffset] = Math.min(255, r + vertGrad);
        rawData[pixelOffset + 1] = Math.min(255, g + vertGrad + 2);
        rawData[pixelOffset + 2] = Math.min(255, b + vertGrad * 2);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Generate PWA screenshots (wide: 1280x720, narrow: 720x1280)
fs.writeFileSync('public/screenshot-wide.png', createPng(1280, 720, 2, 6, 23, true));
fs.writeFileSync('public/screenshot-narrow.png', createPng(720, 1280, 2, 6, 23, true));

// Generate Shortcut icons
fs.writeFileSync('public/shortcut-survival.png', createPng(96, 96, 2, 6, 23, true));
fs.writeFileSync('public/shortcut-waves.png', createPng(96, 96, 2, 6, 23, true));
fs.writeFileSync('public/shortcut-sprint.png', createPng(96, 96, 2, 6, 23, true));

console.log('Screenshots and shortcut assets generated successfully.');
