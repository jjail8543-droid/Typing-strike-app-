import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter type 0 for each line
  const rowSize = width * 3;
  const rawData = Buffer.alloc(height * (1 + rowSize));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowSize);
    rawData[rowOffset] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Draw centered circular blue/cyan shield pattern on dark background
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const maxR = width * 0.42;

      if (dist < maxR && dist > maxR - (width * 0.05)) {
        // Cyan shield ring
        rawData[pixelOffset] = 56;
        rawData[pixelOffset + 1] = 189;
        rawData[pixelOffset + 2] = 248;
      } else if (dist <= maxR - (width * 0.05) && dist > maxR * 0.35) {
        // Dark blue interior
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
      } else if (dist <= maxR * 0.35) {
        // Amber/gold core
        rawData[pixelOffset] = 245;
        rawData[pixelOffset + 1] = 158;
        rawData[pixelOffset + 2] = 11;
      } else {
        // Background
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);

  // IEND chunk
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

// Simple CRC32 implementation
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

// Generate standard icons into public/
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 2, 6, 23));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 2, 6, 23));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 2, 6, 23));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 2, 6, 23));

console.log('PWA icons created successfully.');
