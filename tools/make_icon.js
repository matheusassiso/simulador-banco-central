// Gera o ícone do app (app/icon.png e app/icon.ico) sem dependências: quadrado verde, eixos, curva de inflação dourada e uma moeda.
// Uso: node tools/make_icon.js
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const S = 256, SS = 3, N = S * SS; // supersampling 3x para suavizar as bordas
const px = new Float32Array(N * N * 4);
const over = (x, y, r, g, b, a) => { const i = (y * N + x) * 4, k = a + px[i + 3] * (1 - a); if (k <= 0) return; px[i] = (r * a + px[i] * px[i + 3] * (1 - a)) / k; px[i + 1] = (g * a + px[i + 1] * px[i + 3] * (1 - a)) / k; px[i + 2] = (b * a + px[i + 2] * px[i + 3] * (1 - a)) / k; px[i + 3] = k; };
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rrect = (x0, y0, x1, y1, rad, col) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const cx = Math.min(Math.max(x, x0 + rad), x1 - rad - 1), cy = Math.min(Math.max(y, y0 + rad), y1 - rad - 1); if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) over(x, y, col[0], col[1], col[2], 1); } };
const disk = (cx, cy, r, col, a) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && x >= 0 && y >= 0 && x < N && y < N) over(x, y, col[0], col[1], col[2], a === undefined ? 1 : a); };
const line = (ax, ay, bx, by, w, col) => { const L = Math.hypot(bx - ax, by - ay), n = Math.ceil(L); for (let k = 0; k <= n; k++) disk(ax + (bx - ax) * k / n, ay + (by - ay) * k / n, w / 2, col); };
const u = v => v * SS;
rrect(u(8), u(8), u(248), u(248), u(52), hex('#1d6a4c'));
rrect(u(8), u(8), u(248), u(130), u(52), hex('#237a58')); // brilho no topo
line(u(48), u(52), u(48), u(204), u(7), hex('#cfe8da')); line(u(48), u(204), u(212), u(204), u(7), hex('#cfe8da')); // eixos
const pts = [[52, 176], [78, 160], [104, 128], [130, 92], [154, 78], [178, 96], [204, 128]]; // inflação sobe e cede
for (let k = 0; k < pts.length - 1; k++) line(u(pts[k][0]), u(pts[k][1]), u(pts[k + 1][0]), u(pts[k + 1][1]), u(13), hex('#d4ae55'));
disk(u(154), u(78), u(19), hex('#f4faf6')); disk(u(154), u(78), u(11), hex('#d4ae55')); // a moeda no pico
// reduz o supersampling e grava PNG
const out = Buffer.alloc(S * S * 4);
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let r = 0, g = 0, b = 0, a = 0; for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) { const k = ((y * SS + j) * N + x * SS + i) * 4, al = px[k + 3]; r += px[k] * al; g += px[k + 1] * al; b += px[k + 2] * al; a += al; } const o = (y * S + x) * 4; if (a > 0) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a; } out[o + 3] = Math.round(255 * a / (SS * SS)); }
const crc = buf => zlib.crc32(buf) >>> 0, chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4), c = Buffer.alloc(4); len.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc((S * 4 + 1) * S); for (let y = 0; y < S; y++) { raw[y * (S * 4 + 1)] = 0; out.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4); }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const dir = path.join(__dirname, '..', 'app'); fs.writeFileSync(path.join(dir, 'icon.png'), png);
const ico = Buffer.alloc(22); ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4); ico[6] = 0; ico[7] = 0; ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(dir, 'icon.ico'), Buffer.concat([ico, png]));
console.log('icon.png', png.length, 'bytes; icon.ico', png.length + 22, 'bytes');
