// 把字元點陣圖編譯成 canvas，並提供翻轉 / 染色等小工具。
import { PAL } from './art.js';

export function makeSprite(rows, pal = PAL) {
  const w = rows[0].length, h = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      const i = (y * w + x) * 4;
      img.data[i] = parseInt(col.slice(1, 3), 16);
      img.data[i + 1] = parseInt(col.slice(3, 5), 16);
      img.data[i + 2] = parseInt(col.slice(5, 7), 16);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

// 把多個部位疊成一張圖（女騎士的每個動作影格）
export function compose(w, h, parts) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (const p of parts) {
    if (!p) continue;
    ctx.drawImage(p.img, p.x | 0, p.y | 0);
  }
  return cv;
}

export function flip(cv) {
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cv.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cv, 0, 0);
  return out;
}

// 產生純色剪影（受傷閃白 / 敵人受擊）
export function silhouette(cv, color) {
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, out.width, out.height);
  return out;
}
