import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = chunk("IHDR", ihdrData);

  // Image data (unfiltered RGB pixels)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const offset = y * (1 + width * 3);
    rawData[offset] = 0; // filter byte: none
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      const cx = x - width / 2;
      const cy = y - height / 2;
      const isCircle = Math.sqrt(cx * cx + cy * cy) < width * 0.42;
      const isBorder = Math.abs(cx) < width * 0.38 && Math.abs(cy) < height * 0.15 && cy > -height * 0.05;
      const inside = isCircle || isBorder;
      rawData[px] = inside ? r : 255;
      rawData[px + 1] = inside ? g : 255;
      rawData[px + 2] = inside ? b : 255;
    }
  }

  const compressed = deflateSync(rawData);
  const idat = chunk("IDAT", compressed);

  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeB, data]);
  const crc = crc32(crcData);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc);
  return Buffer.concat([len, typeB, data, crcB]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const navy = [26, 35, 126];
const icon192 = createPNG(192, 192, ...navy);
const icon512 = createPNG(512, 512, ...navy);

const outDir = join(__dirname, "..", "public");
writeFileSync(`${outDir}/icon-192.png`, icon192);
writeFileSync(`${outDir}/icon-512.png`, icon512);

console.log("PNG icons created successfully");
