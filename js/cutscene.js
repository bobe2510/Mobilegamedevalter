// ---------------------------------------------------------------------------
// 過場播放器 — 開場 CG、洛克人式中段對話、結局共用同一支。
//
// 資料格式（見 assets/story/cutscenes.md）：
//   [{ cg, who, name, text, black, center, hold }]
//     cg     圖片路徑；有值就換背景圖（沒填 = 沿用上一句的圖）
//     who    說話者的角色代號（knight / mage / elder / panda…），用來抓頭像
//     name   顯示在名牌上的名字；沒填就沿用 who 的預設名
//     text   台詞；不填 name 就是旁白（不畫名牌）
//     black  true = 黑底（用在「一行帶過」的場景）
//     center true = 文字置中放大（黑底卡片、標題卡）
//     hold   這句自動停留幾幀後推進（不填 = 等玩家點擊）
//
// 圖片一律**延遲載入**：播到該句才抓，並預抓下一句要用的圖，
// 所以首次載入不會因為劇情變多而變慢。
// ---------------------------------------------------------------------------

const cache = new Map();

// 回傳 { img, ok, failed }；第一次呼叫才真的發出請求
export function getImage(src) {
  if (!src) return null;
  let e = cache.get(src);
  if (!e) {
    e = { img: new Image(), ok: false, failed: false };
    e.img.addEventListener('load', () => { e.ok = true; });
    e.img.addEventListener('error', () => { e.failed = true; });
    e.img.src = src;
    cache.set(src, e);
  }
  return e;
}

export function preload(src) { getImage(src); }

const FADE = 14;          // 換圖的淡入淡出幀數
const TYPE_SPEED = 0.55;  // 每幀打出幾個字

export class Cutscene {
  constructor(opts = {}) {
    this.sfx = opts.sfx || null;
    this.portraitOf = opts.portraitOf || (() => null);
    this.drawMascot = opts.drawMascot || null;   // 熊貓沒有頭像圖，用遊戲內的 sprite 畫
    this.active = false;
    this.script = [];
    this.i = 0;
    this.chars = 0;
    this.fade = 0;
    this.holdT = 0;
    this.cg = null;
    this.onDone = null;
    this.tap = false;      // 由外部（點擊畫面）設起來
    this._wrapCache = { key: '', lines: [] };
  }

  play(script, onDone) {
    if (!script || !script.length) { if (onDone) onDone(); return; }
    this.script = script;
    this.i = 0;
    this.chars = 0;
    this.fade = FADE;
    this.holdT = 0;
    this.cg = script[0].cg || null;
    this.onDone = onDone || null;
    this.active = true;
    this._preloadAhead();
  }

  get line() { return this.script[this.i] || null; }

  _preloadAhead() {
    for (let k = this.i; k < Math.min(this.script.length, this.i + 3); k++) {
      if (this.script[k].cg) preload(this.script[k].cg);
    }
  }

  // 點一下：還在逐字就先補完，已經打完就換下一句
  advance() {
    const l = this.line;
    if (!l) return;
    const full = (l.text || '').length;
    if (this.chars < full) { this.chars = full; return; }
    this.next();
  }

  next() {
    this.i++;
    if (this.i >= this.script.length) { this.finish(); return; }
    this.chars = 0;
    this.holdT = 0;
    const l = this.line;
    if (l.cg && l.cg !== this.cg) { this.cg = l.cg; this.fade = FADE; }
    else if (l.black && this.cg) { this.cg = null; this.fade = FADE; }
    this._preloadAhead();
  }

  skip() { this.finish(); }

  finish() {
    if (!this.active) return;
    this.active = false;
    this.script = [];
    const cb = this.onDone;
    this.onDone = null;
    if (cb) cb();
  }

  update(input) {
    if (!this.active) return;
    if (this.fade > 0) this.fade--;
    const l = this.line;
    if (!l) { this.finish(); return; }

    const full = (l.text || '').length;
    const wasTyping = this.chars < full;
    if (wasTyping) {
      this.chars = Math.min(full, this.chars + TYPE_SPEED);
      if (this.sfx && Math.floor(this.chars) !== Math.floor(this.chars - TYPE_SPEED) &&
        Math.floor(this.chars) % 3 === 0) this.sfx.blip?.();
    }

    const pressed = this.tap || input.pressed.attack || input.pressed.jump ||
      input.pressed.special || input.pressed.right;
    this.tap = false;
    if (pressed) { this.advance(); return; }

    // 自動停留的句子（黑底卡片那種）
    if (!wasTyping && l.hold) {
      this.holdT++;
      if (this.holdT >= l.hold) this.next();
    }
  }

  // ---------------------------------------------------------------- 繪圖
  // 沒有 CG 也不是黑底卡 = 洛克人式的中段對話，背景讓遊戲畫面透出來
  get needsWorld() {
    const l = this.line;
    return !!(this.active && l && !l.black && !this.cg);
  }

  draw(ctx, VW, VH) {
    const l = this.line;
    if (!l) return;

    if (this.needsWorld) {
      // 世界已經由外面畫好了，這裡只壓一層暗幕
      ctx.fillStyle = 'rgba(5, 4, 12, .55)';
      ctx.fillRect(0, 0, VW, VH);
    } else {
      ctx.fillStyle = '#05040c';
      ctx.fillRect(0, 0, VW, VH);
    }

    const boxH = l.center ? 0 : Math.round(VH * 0.30);
    const boxTop = VH - boxH - 8;

    if (this.cg) this._drawCG(ctx, VW, VH, boxTop);

    // 換圖的淡入
    if (this.fade > 0) {
      ctx.globalAlpha = this.fade / FADE;
      ctx.fillStyle = '#05040c';
      ctx.fillRect(0, 0, VW, VH);
      ctx.globalAlpha = 1;
    }

    if (l.center) this._drawCard(ctx, VW, VH, l);
    else this._drawBox(ctx, VW, VH, l, boxTop, boxH);
  }

  _drawCG(ctx, VW, VH, boxTop) {
    const e = getImage(this.cg);
    if (e && e.ok) {
      const iw = e.img.naturalWidth, ih = e.img.naturalHeight;
      // 等比縮放塞進畫面（直向手機會留黑邊，這是規格裡講好的做法）
      const s = Math.min(VW / iw, VH / ih);
      const w = iw * s, h = ih * s;
      // 有黑邊時把圖往文字框上方擺，畫面比較平衡
      const y = h < boxTop ? Math.round((boxTop - h) / 2) : Math.round((VH - h) / 2);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(e.img, Math.round((VW - w) / 2), y, Math.round(w), Math.round(h));
      ctx.imageSmoothingEnabled = false;
    } else if (e && e.failed) {
      this._drawPlaceholder(ctx, VW, VH, boxTop);
    }
  }

  // 圖還沒畫好時的佔位卡：直接把檔名寫上去，方便對照該補哪一張
  _drawPlaceholder(ctx, VW, VH, boxTop) {
    const h = Math.min(boxTop, Math.round(VW * 9 / 16));
    const y = Math.round((boxTop - h) / 2);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#2b2450'); g.addColorStop(1, '#150f2c');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, VW, h);
    ctx.strokeStyle = '#5b4a9e';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(4.5, y + 4.5, VW - 9, h - 9);
    ctx.setLineDash([]);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8d80c6';
    ctx.font = '9px monospace';
    ctx.fillText('CG 待補', VW / 2, y + h / 2 - 6);
    ctx.font = '7px monospace';
    ctx.fillText(this.cg.replace('assets/story/cg/', ''), VW / 2, y + h / 2 + 8);
    ctx.textAlign = 'left';
  }

  // 黑底白字的一行卡（場景之間帶過用）
  _drawCard(ctx, VW, VH, l) {
    const size = 13;
    ctx.font = `${size}px system-ui, "Noto Sans TC", sans-serif`;
    const lines = this._wrap(ctx, l.text || '', VW - 48);
    const shown = this._slice(lines, Math.floor(this.chars));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#efe9ff';
    const y0 = VH / 2 - (shown.length - 1) * 10;
    shown.forEach((t, k) => ctx.fillText(t, VW / 2, y0 + k * 20));
    ctx.textAlign = 'left';
    this._drawArrow(ctx, VW / 2, VH - 14, l);
  }

  _drawBox(ctx, VW, VH, l, top, h) {
    const pad = 8;
    const x = 8, w = VW - 16;

    ctx.fillStyle = 'rgba(8, 6, 20, .86)';
    ctx.fillRect(x, top, w, h);
    ctx.strokeStyle = '#6b58bd';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, top + 0.5, w - 1, h - 1);

    // 頭像
    let tx = x + pad;
    const face = h - pad * 2;
    if (l.who) {
      const drew = this._drawFace(ctx, l.who, x + pad, top + pad, face);
      if (drew) tx = x + pad + face + pad;
    }

    const name = l.name || (l.who ? this._nameOf(l.who) : '');
    ctx.font = `${name ? 11 : 10}px system-ui, "Noto Sans TC", sans-serif`;
    const lines = this._wrap(ctx, l.text || '', x + w - pad - tx);

    // 有名牌的靠上排，旁白沒有名牌就在框裡置中
    let ty = name ? top + pad + 25 : top + Math.round((h - (lines.length - 1) * 15) / 2) + 4;
    if (name) {
      ctx.font = 'bold 10px system-ui, "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#ffd45e';
      ctx.fillText(name, tx, top + pad + 10);
      ctx.font = '11px system-ui, "Noto Sans TC", sans-serif';
    }

    ctx.fillStyle = name ? '#f2eeff' : '#cfc7ee';
    const shown = this._slice(lines, Math.floor(this.chars));
    shown.forEach((t, k) => ctx.fillText(t, tx, ty + k * 15));

    this._drawArrow(ctx, x + w - 12, top + h - 8, l);
  }

  _drawArrow(ctx, x, y, l) {
    if (this.chars < (l.text || '').length) return;
    if (l.hold) return;
    const bob = Math.abs(Math.sin(performance.now() / 260)) * 2;
    ctx.fillStyle = '#ffd45e';
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 3 + bob);
    ctx.lineTo(x + 4, y - 3 + bob);
    ctx.lineTo(x, y + 2 + bob);
    ctx.closePath();
    ctx.fill();
  }

  _drawFace(ctx, who, x, y, size) {
    if (who === 'panda' && this.drawMascot) { this.drawMascot(ctx, x, y, size); return true; }
    const src = this.portraitOf(who);
    const e = src ? getImage(src) : null;
    if (!e || !e.ok) return false;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#241b47';
    ctx.fill();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(e.img, x, y, size, size);
    ctx.imageSmoothingEnabled = false;
    ctx.restore();
    ctx.strokeStyle = '#6b58bd';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 0.5, 0, Math.PI * 2);
    ctx.stroke();
    return true;
  }

  _nameOf(who) {
    return ({ knight: '小公主', mage: '魔法大臣', elder: '長公主', panda: '熊貓娃娃' })[who] || '';
  }

  // 中文沒有空格，一個字一個字量寬度來斷行
  _wrap(ctx, text, maxW) {
    const key = text + '|' + Math.round(maxW) + '|' + ctx.font;
    if (this._wrapCache.key === key) return this._wrapCache.lines;
    const lines = [];
    let cur = '';
    for (const ch of text) {
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      if (ctx.measureText(cur + ch).width > maxW && cur) { lines.push(cur); cur = ch; }
      else cur += ch;
    }
    if (cur) lines.push(cur);
    this._wrapCache = { key, lines };
    return lines;
  }

  // 逐字顯示：把已斷好的行切到第 n 個字為止
  _slice(lines, n) {
    const out = [];
    let left = n;
    for (const l of lines) {
      if (left <= 0) break;
      out.push(left >= l.length ? l : l.slice(0, left));
      left -= l.length;
    }
    return out.length ? out : [''];
  }
}
