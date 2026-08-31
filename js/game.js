// ---------------------------------------------------------------------------
// 《劍姬騎行》Knight Girl — 8-bit 橫向捲軸動作遊戲
// 純 Canvas，無外部素材，手機／桌機通用。
// ---------------------------------------------------------------------------
import { buildSprites, PLAYER_FOOT, PLAYER_W } from './sprites.js';
import { Input } from './input.js';
import { Sfx } from './audio.js';
import { Cutscene } from './cutscene.js';
import { scriptFor, midFor } from './story.js';

// ------------------------------ 基本設定 ------------------------------
let VW = 480;                  // 虛擬解析度寬（依螢幕比例調整：直向較窄、橫向較寬）
const VH = 270;                // 虛擬解析度高（固定）
const VW_MIN = 300, VW_MAX = 560;
const GROUND = 228;            // 地面高度
const GRAV = 0.62;
const MAXFALL = 9;

let RES = 2;                    // 內部解析度倍率，resize() 會依裝置像素密度調整
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VW * RES; canvas.height = VH * RES;
ctx.imageSmoothingEnabled = false;

const S = buildSprites();
const input = new Input();
const sfx = new Sfx();

const ui = {
  start: document.getElementById('startScreen'),
  over: document.getElementById('overScreen'),
  pause: document.getElementById('pauseScreen'),
  pad: document.getElementById('pad'),
  best: document.getElementById('bestScore'),
  finalScore: document.getElementById('finalScore'),
  finalStage: document.getElementById('finalStage'),
  muteBtn: document.getElementById('muteBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  cutSkip: document.getElementById('cutSkip'),
};

input.bindTouch(document.body);

// ------------------------------ 小工具 ------------------------------
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));

const TIER_MIN = 0.70, TIER_MAX = 1.45;
function clampTier(v) { return Math.min(TIER_MAX, Math.max(TIER_MIN, v || 1)); }

function setTier(v) {
  G.tier = clampTier(v);
  localStorage.setItem('kg_tier', G.tier.toFixed(3));
}

// 把試煉強度換成 5 顆星（給結算畫面顯示）
function tierStars() {
  const n = Math.round((G.tier - TIER_MIN) / (TIER_MAX - TIER_MIN) * 4) + 1;
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawSprite(spr, dir, x, y) {
  const img = spr[dir > 0 ? 1 : '-1'];
  ctx.drawImage(img, Math.round(x), Math.round(y));
}

// ------------------------------ 可玩角色 ------------------------------
// 三個角色共用同一組 frame key，所以換人只要換素材路徑。
const ROSTER = [
  {
    key: 'knight', name: '小公主', diff: '一般', dir: 'assets/character/knight',
    unlockBoss: 0, maxHp: 5, atkSpeed: 1.0, tier: 1.0,
    blurb: '近戰三段連擊，標準手感。',
  },
  {
    key: 'mage', name: '魔法大臣', diff: '中等', dir: 'assets/character/mage',
    unlockBoss: 1, maxHp: 5, atkSpeed: 1.0, tier: 1.25, ranged: true,
    blurb: '小公主的閨蜜。揮杖射出魔法飛彈，能在安全距離解決敵人——代價是敵人更硬。',
  },
  {
    key: 'elder', name: '長公主', diff: '困難', dir: 'assets/character/elder',
    unlockBoss: 2, maxHp: 6, atkSpeed: 1.5, tier: 1.4, noSlashFx: true,
    blurb: '騎士團長。攻速 1.5 倍、血量最多，敵人也最硬。',
    todo: '分身換位大招尚未實作',
  },
];

function charOf(key) { return ROSTER.find((c) => c.key === key) || ROSTER[0]; }
let CHAR = charOf(localStorage.getItem('kg_char') || 'knight');

// ------------------------ 高解析度角色（可選素材） ------------------------
// assets/character/anim/ 有 sheet.png + frames.json 就自動改用插畫版角色，
// 找不到就沿用程式繪製的點陣角色。
const HERO_H = 70;              // 站姿在遊戲座標裡的高度（點陣版是 40）
const HERO = {
  ready: false, img: null, meta: null, scale: 1,
  fw: 0, fh: 0, ax: 0, ay: 0, index: {},
};

function loadHero(dir) {
  HERO.ready = false; HERO.index = {};
  const img = new Image();
  let meta = null;
  const done = () => {
    if (!meta || !img.naturalWidth) return;
    HERO.img = img; HERO.meta = meta;
    HERO.scale = HERO_H / (meta.stand_h || 251);   // 各角色的站姿身高不同
    HERO.fw = meta.frame_w; HERO.fh = meta.frame_h;
    HERO.ax = meta.anchor.x; HERO.ay = meta.anchor.y;
    meta.frames.forEach((n, i) => { HERO.index[n] = i; });
    HERO.ready = true;
  };
  img.onload = done;
  img.onerror = () => { HERO.ready = false; };
  img.src = dir + '/anim/sheet.png';
  fetch(dir + '/anim/frames.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => { if (m && m.frames) { meta = m; done(); } })
    .catch(() => {});
}
loadHero(CHAR.dir);

// 挑第一個這份 sheet 真的有的影格名。
// 新素材（run1~4 / apex / land / atk1_wind…）有就用，沒有就退回舊的十格，
// 所以換素材不用改程式，只補一部分也不會壞。
function has(n) { return HERO.index[n] != null; }
function pick(...names) {
  for (const n of names) if (has(n)) return n;
  return names[names.length - 1];
}

// 依狀態挑影格
function heroFrame() {
  if (player.dead) return 'sit_cry';
  if (G.victoryT > 0) return 'victory';

  if (player.spin > 0) {
    const total = CHAR.ranged ? 36 : 44;
    return player.spin > total * 0.6 ? pick('special1', 'atk_up') : pick('special2', 'atk_thrust');
  }

  if (player.atk > 0) {
    const t = (player.atkTotal - player.atk) / player.atkTotal;
    // 每一段都是「蓄力 → 命中」，第三段用專屬的重斬
    if (player.combo === 2) return t < 0.30 ? pick('atk3_wind', 'atk1_wind', 'atk_up') : pick('atk3_hit', 'atk_thrust');
    if (player.combo === 1) return t < 0.30 ? pick('atk1_wind', 'atk_up') : pick('atk2_hit', 'atk_thrust');
    return t < 0.33 ? pick('atk1_wind', 'atk_up') : pick('atk1_hit', 'atk_thrust');
  }

  if (player.inv > 58 && player.knock > 0) return 'hurt';

  if (!player.onGround) {
    if (player.vy < -1.6) return 'jump';
    if (player.vy > 1.6) return 'fall';
    return pick('apex', 'jump');            // 最高點附近的滯空格
  }

  if (player.landT > 0) return pick('land', 'idle');   // 落地緩衝

  if (Math.abs(player.vx) > 0.35) {
    // 四格跑步循環：著地 → 通過 → 著地 → 通過
    if (has('run1')) return RUN_CYCLE[Math.floor(player.anim / 6) % RUN_CYCLE.length];
    return (Math.floor(player.anim / 9) % 2) ? 'walk1' : 'walk2';
  }
  return 'idle';
}

const RUN_CYCLE = ['run1', 'run2', 'run3', 'run4'];

// 站著不動時讓身體輕輕起伏，省掉一格呼吸用的素材
function heroBob() {
  if (!player.onGround || player.dead || player.atk > 0 || player.spin > 0) return 0;
  if (Math.abs(player.vx) > 0.35) return 0;
  return Math.sin(G.frame / 32) < 0 ? 0 : -1;
}

function drawHero(key, dir, px, py) {
  const i = HERO.index[key] != null ? HERO.index[key] : 0;
  const s = HERO.scale;
  ctx.save();
  ctx.imageSmoothingEnabled = true;        // 插畫要平滑縮放，點陣不要
  ctx.translate(Math.round(px - cam.x), Math.round(py));
  if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(HERO.img, i * HERO.fw, 0, HERO.fw, HERO.fh,
    -HERO.ax * s, -HERO.ay * s, HERO.fw * s, HERO.fh * s);
  ctx.imageSmoothingEnabled = false;
  ctx.restore();
}

// ------------------------------ 遊戲狀態 ------------------------------
const G = {
  mode: 'title',      // title | play | cut | dead | pause
  stage: 1,
  score: 0,
  best: +(localStorage.getItem('kg_best') || 0),
  bosses: +(localStorage.getItem('kg_bosses') || 0),   // 累計討伐魔王數，用來解鎖角色
  // 魔法熊貓依公主的表現調整試煉強度（0.70 ~ 1.45）
  tier: clampTier(+(localStorage.getItem('kg_tier') || 1)),
  frame: 0,
  shake: 0,
  freeze: 0,
  banner: null,
  bannerT: 0,
  faint: null,
  victoryT: 0,
};

const cam = { x: 0, lockMin: 0, lockMax: Infinity };
let skyCache = null;   // 天空漸層快取

const player = {
  x: 60, y: GROUND, vx: 0, vy: 0, w: 26, h: 60, dir: 1,
  onGround: false, coyote: 0, jumpBuf: 0, jumps: 0,
  hp: 5, maxHp: 5, inv: 0, rage: 0, maxRage: 100,
  atk: 0, atkTotal: 18, combo: 0, chain: 0, spin: 0, spinTick: 0, shotFired: false,
  anim: 0, hitIds: new Set(), knock: 0, dead: false, landT: 0,
};

// 魔法大臣派來的熊貓娃娃，平常跟在公主身後
const pet = { x: 0, y: GROUND, vy: 0, dir: 1, onGround: true, anim: 0, hidden: false };

let stage = null;
let enemies = [];
let items = [];
let shots = [];
let waves = [];
let parts = [];
let texts = [];
let uid = 1;

// ------------------------------ 關卡生成 ------------------------------
const THEMES = [
  { // 森林白天
    sky: ['#7fd4ff', '#cdf3ff'], sun: '#fff6c0', sunY: 46,
    far: '#7fa9c9', mid: '#3f7a4e', midDark: '#2c5a39',
    grass: '#4fb355', grass2: '#3b8c42', dirt: '#6b4a2f', dirt2: '#513520',
    cloud: 'rgba(255,255,255,0.85)', night: false,
  },
  { // 黃昏丘陵
    sky: ['#ff9d5c', '#ffd9a0'], sun: '#fff0a8', sunY: 70,
    far: '#a8608c', mid: '#5b3d70', midDark: '#3d2750',
    grass: '#a35f6b', grass2: '#7c4450', dirt: '#5c3550', dirt2: '#3d2038',
    cloud: 'rgba(255,214,170,0.75)', night: false,
  },
  { // 魔王城夜晚
    sky: ['#141033', '#3b2260'], sun: '#e8e6ff', sunY: 44,
    far: '#2c2350', mid: '#1d1738', midDark: '#141028',
    grass: '#4b3f6b', grass2: '#332a4d', dirt: '#2a2340', dirt2: '#1a1530',
    cloud: 'rgba(120,110,180,0.35)', night: true,
  },
];

function makeStage(n) {
  const rng = mulberry32(9137 + n * 7919);
  const isBoss = n % 3 === 0;
  const len = 2200 + n * 220 + (isBoss ? 400 : 0);
  const theme = THEMES[(n - 1) % THEMES.length];

  const plats = [];
  for (let x = 380; x < len - 620; x += 150 + rng() * 210) {
    if (rng() < 0.62) {
      const w = 70 + rng() * 70;
      plats.push({ x: Math.round(x), y: Math.round(GROUND - (72 + rng() * 68)), w: Math.round(w), h: 10 });
    }
  }

  const list = [];
  const pool = n < 2 ? ['slime', 'slime', 'bat']
    : n < 4 ? ['slime', 'bat', 'orc']
      : ['slime', 'bat', 'orc', 'orc'];
  const count = Math.max(4, Math.round((7 + Math.min(14, Math.floor(n * 1.6))) * G.tier * CHAR.tier));
  for (let i = 0; i < count; i++) {
    const x = 320 + (len - 900) * (i / count) + rng() * 90;
    const t = pool[Math.floor(rng() * pool.length)];
    let y = GROUND;
    if (t === 'bat') y = GROUND - 92 - rng() * 55;
    else if (rng() < 0.25) {
      const p = plats.find((pp) => Math.abs(pp.x + pp.w / 2 - x) < 70);
      if (p) y = p.y;
    }
    list.push({ x: Math.round(x), y: Math.round(y), type: t, alive: true });
  }

  const drops = [];
  for (let i = 0; i < 4 + Math.floor(rng() * 4); i++) {
    drops.push({ x: Math.round(300 + rng() * (len - 700)), y: GROUND - 10 - Math.round(rng() * 70), kind: rng() < 0.22 ? 'potion' : 'coin' });
  }

  // 背景層（視差用）
  const far = [], mid = [], clouds = [], tufts = [];
  for (let x = -100; x < len + VW; x += 66 + rng() * 44) far.push({ x, w: 100 + rng() * 100, h: 62 + rng() * 82 });
  for (let x = -100; x < len + VW; x += 52 + rng() * 50) mid.push({ x, w: 20 + rng() * 14, h: 54 + rng() * 52, kind: rng() < 0.3 ? 1 : 0 });
  for (let x = -100; x < len + VW; x += 90 + rng() * 130) clouds.push({ x, y: 18 + rng() * 78, w: 26 + rng() * 34 });
  for (let x = 0; x < len + VW; x += 16 + rng() * 28) tufts.push({ x, h: 4 + rng() * 6, w: 2 + Math.floor(rng() * 3) });

  return {
    n, len, theme, plats, spawns: list, drops, far, mid, clouds, tufts, isBoss,
    bossGate: len - 620, bossSpawned: false, bossDead: !isBoss,
    portalX: len - 90, cleared: false,
  };
}

function startStage(n) {
  stage = makeStage(n);
  enemies = []; items = []; shots = []; waves = []; parts = []; texts = [];
  for (const d of stage.drops) items.push({ ...d, id: uid++, vy: 0, t: 0, ground: false });
  player.x = 40; player.y = GROUND; player.vx = 0; player.vy = 0;
  player.dir = 1; player.atk = 0; player.spin = 0; player.inv = 60; player.dead = false; player.landT = 0;
  cam.x = 0; cam.lockMin = 0; cam.lockMax = Infinity;
  pet.x = player.x - 30; pet.y = GROUND; pet.vy = 0; pet.dir = 1; pet.hidden = false;
  G.stage = n;
  banner(n % 3 === 0 ? `第 ${n} 關 · 魔王關` : `第 ${n} 關`, 110);
}

function banner(text, t = 90) { G.banner = text; G.bannerT = t; }

// ------------------------------ 敵人 ------------------------------
const ETYPE = {
  slime: { w: 22, h: 18, hp: 2, score: 60, touch: 1 },
  bat: { w: 25, h: 14, hp: 2, score: 80, touch: 1 },
  orc: { w: 24, h: 29, hp: 5, score: 160, touch: 0 },
  boss: { w: 61, h: 89, hp: 55, score: 2000, touch: 1 },
};

function makeEnemy(type, x, y, stageN) {
  const d = ETYPE[type];
  const bonus = type === 'boss' ? Math.floor((stageN / 3 - 1) * 30) : Math.floor(stageN / 3);
  const hp = Math.max(1, Math.round((d.hp + bonus) * (type === 'boss' ? (0.6 + G.tier * 0.4) : G.tier) * CHAR.tier));
  return {
    id: uid++, type, x, y, vx: 0, vy: 0, w: d.w, h: d.h,
    hp, maxHp: hp, dir: -1, onGround: false, hurt: 0, anim: rnd(0, 60),
    st: 'idle', t: irnd(20, 90), dead: false, baseY: y, touch: d.touch,
    score: d.score, atkBox: null, phase: 1,
  };
}

function spawnCheck() {
  for (const sp of stage.spawns) {
    if (sp.alive && sp.x < cam.x + VW + 40 && sp.x > cam.x - 120) {
      sp.alive = false;
      enemies.push(makeEnemy(sp.type, sp.x, sp.y, G.stage));
    }
  }
  if (stage.isBoss && !stage.bossSpawned && player.x > stage.bossGate) {
    stage.bossSpawned = true;
    const b = makeEnemy('boss', stage.bossGate + 240, GROUND, G.stage);
    enemies.push(b);
    const lock = clamp(stage.bossGate - 40, 0, Math.max(0, stage.len - VW));
    cam.lockMin = lock;
    cam.lockMax = lock;
    banner('魔王出現！', 100);
    sfx.boss();
    G.shake = 14;
  }
}

function platformCollide(e) {
  // 只做「由上往下落到平台」的單向碰撞
  if (e.vy < 0) return;
  for (const p of stage.plats) {
    if (e.x + e.w / 2 > p.x && e.x - e.w / 2 < p.x + p.w) {
      const prev = e.y - e.vy;
      if (prev <= p.y + 2 && e.y >= p.y) {
        e.y = p.y; e.vy = 0; e.onGround = true; return;
      }
    }
  }
}

function groundCollide(e) {
  e.onGround = false;
  e.vy = Math.min(e.vy + GRAV, MAXFALL);
  e.y += e.vy;
  platformCollide(e);
  if (e.y >= GROUND) { e.y = GROUND; e.vy = 0; e.onGround = true; }
}

function updateEnemy(e) {
  e.anim++;
  if (e.hurt > 0) e.hurt--;
  const dx = player.x - e.x;
  const adist = Math.abs(dx);

  switch (e.type) {
    case 'slime': {
      if (e.onGround) {
        e.vx *= 0.8;
        e.t--;
        if (e.t <= 0 && adist < 220) {
          e.dir = dx > 0 ? 1 : -1;
          e.vy = -5.6; e.vx = e.dir * 1.5;
          e.t = irnd(48, 84);
        }
      }
      e.x += e.vx;
      groundCollide(e);
      break;
    }
    case 'bat': {
      e.t--;
      if (e.st === 'idle') {
        e.y = e.baseY + Math.sin(e.anim / 18) * 8;
        if (adist < 170) { e.dir = dx > 0 ? 1 : -1; e.vx += e.dir * 0.09; }
        e.vx = clamp(e.vx * 0.97, -1.5, 1.5);
        e.x += e.vx;
        if (e.t <= 0 && adist < 140 && player.y - e.y > 16) { e.st = 'dive'; e.t = 46; e.vy = 2.4; }
      } else {
        e.x += e.vx * 1.2;
        e.y += e.vy;
        e.vy += 0.06;
        if (e.y > GROUND - e.h) { e.vy = -2.6; }
        if (e.t-- <= 0) { e.st = 'idle'; e.baseY = clamp(e.y, 86, GROUND - 66); e.t = irnd(60, 140); e.vy = 0; }
      }
      break;
    }
    case 'orc': {
      e.atkBox = null;
      if (e.st === 'idle') {
        if (adist < 190) {
          e.dir = dx > 0 ? 1 : -1;
          e.vx = e.dir * 0.72;
          if (adist < 34 && Math.abs(player.y - e.y) < 32) { e.st = 'wind'; e.t = 22; e.vx = 0; }
        } else e.vx *= 0.85;
      } else if (e.st === 'wind') {
        e.vx = 0;
        if (e.t-- <= 0) { e.st = 'swing'; e.t = 12; }
      } else if (e.st === 'swing') {
        if (e.t > 6) {
          e.atkBox = { x: e.dir > 0 ? e.x + 8 : e.x - 48, y: e.y - 33, w: 40, h: 33 };
        }
        if (e.t-- <= 0) { e.st = 'cool'; e.t = 34; }
      } else if (e.st === 'cool') {
        e.vx *= 0.8;
        if (e.t-- <= 0) e.st = 'idle';
      }
      e.x += e.vx;
      groundCollide(e);
      break;
    }
    case 'boss': {
      e.atkBox = null;
      if (e.hp < e.maxHp * 0.45) e.phase = 2;
      const spd = e.phase === 2 ? 1.15 : 0.8;
      if (e.st === 'idle') {
        e.dir = dx > 0 ? 1 : -1;
        if (adist > 46) e.vx = e.dir * spd; else e.vx *= 0.8;
        if (e.t-- <= 0) {
          const r = Math.random();
          if (adist < 70 || r < 0.4) { e.st = 'slam'; e.t = 26; e.vx = 0; }
          else { e.st = 'cast'; e.t = 34; e.vx = 0; }
        }
      } else if (e.st === 'slam') {
        e.vx = 0;
        if (e.t-- === 12) { e.vy = -8.4; }
        if (e.t <= 0 && e.onGround && e.vy === 0) {
          // 落地衝擊波
          waves.push({ x: e.x, y: GROUND, dir: -1, t: 70, dmg: 1 });
          waves.push({ x: e.x, y: GROUND, dir: 1, t: 70, dmg: 1 });
          G.shake = 12; sfx.hit();
          e.st = 'cool'; e.t = e.phase === 2 ? 26 : 48;
        }
        if (!e.onGround) e.atkBox = { x: e.x - 44, y: e.y - 89, w: 88, h: 89 };
      } else if (e.st === 'cast') {
        e.vx = 0;
        e.dir = dx > 0 ? 1 : -1;
        if (e.t-- <= 0) {
          const shots_n = e.phase === 2 ? 3 : 2;
          for (let i = 0; i < shots_n; i++) {
            shots.push({ id: uid++, team: 'enemy', x: e.x + e.dir * 32, y: e.y - 52 - i * 17, vx: e.dir * (2.8 + i * 0.35), vy: 0, t: 200 });
          }
          sfx.tone(180, 0.24, 'sawtooth', 0.3, -80);
          e.st = 'cool'; e.t = e.phase === 2 ? 30 : 54;
        }
      } else if (e.st === 'cool') {
        e.vx *= 0.85;
        if (e.t-- <= 0) { e.st = 'idle'; e.t = irnd(40, 80); }
      }
      e.x += e.vx;
      groundCollide(e);
      e.x = clamp(e.x, cam.x + 20, cam.x + VW - 20);
      break;
    }
  }

  if (e.type !== 'bat') e.x = clamp(e.x, 10, stage.len - 10);

  // 敵人的攻擊判定
  if (e.atkBox && player.inv <= 0 && player.spin <= 0) {
    const pb = { x: player.x - player.w / 2, y: player.y - player.h, w: player.w, h: player.h };
    if (aabb(e.atkBox, pb)) hurtPlayer(1, e.x);
  }
  // 碰撞傷害
  if (e.touch && player.inv <= 0 && player.spin <= 0) {
    const pb = { x: player.x - player.w / 2, y: player.y - player.h, w: player.w, h: player.h };
    const eb = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
    if (aabb(eb, pb)) hurtPlayer(1, e.x);
  }
}

function damageEnemy(e, dmg, fromX, knock = 3.2) {
  if (e.dead) return;
  e.hp -= dmg;
  e.hurt = 10;
  const dir = e.x >= fromX ? 1 : -1;
  if (e.type !== 'boss') { e.vx = dir * knock; if (e.onGround) e.vy = -2.2; }
  else e.x += dir * 0.6;
  G.freeze = 3; G.shake = Math.max(G.shake, 4);
  sfx.hit();
  for (let i = 0; i < 7; i++) {
    parts.push({ x: e.x, y: e.y - e.h / 2, vx: rnd(-2.4, 2.4), vy: rnd(-3, 0.6), life: irnd(14, 26), c: '#fff2b0', s: irnd(1, 2), g: 0.16 });
  }
  texts.push({ x: e.x, y: e.y - e.h - 6, vy: -0.8, life: 34, text: String(dmg), c: '#ffe066' });

  if (e.hp <= 0) {
    e.dead = true;
    G.score += e.score;
    G.shake = Math.max(G.shake, e.type === 'boss' ? 18 : 6);
    player.rage = Math.min(player.maxRage, player.rage + (e.type === 'boss' ? 40 : 14));
    for (let i = 0; i < (e.type === 'boss' ? 46 : 14); i++) {
      parts.push({ x: e.x, y: e.y - e.h / 2, vx: rnd(-3.6, 3.6), vy: rnd(-4.5, 1), life: irnd(20, 48), c: i % 2 ? '#ff9a3c' : '#ffe066', s: irnd(1, 3), g: 0.14 });
    }
    if (e.type === 'boss') {
      stage.bossDead = true;
      G.bosses++;
      localStorage.setItem('kg_bosses', String(G.bosses));
      cam.lockMin = 0; cam.lockMax = Infinity;
      banner('魔王討伐成功！', 110);
      sfx.clear();
      for (let i = 0; i < 5; i++) items.push({ id: uid++, x: e.x + rnd(-40, 40), y: e.y - 40, kind: i < 2 ? 'potion' : 'coin', vy: -3, t: 0, ground: false });
    } else if (Math.random() < 0.32) {
      items.push({ id: uid++, x: e.x, y: e.y - 12, kind: Math.random() < 0.34 ? 'heart' : 'coin', vy: -3, t: 0, ground: false });
    }
  } else {
    player.rage = Math.min(player.maxRage, player.rage + 5);
  }
}


// ------------------------ 倒地演出（哭哭 → 熊貓車） ------------------------
// phase 0: 坐在地上哭 / 1: 熊貓車從後方開來 / 2: 抱上車 / 3: 被載走
function startFaint() {
  setTier(G.tier - 0.12);   // 熊貓：下次溫柔一點
  pet.hidden = true;        // 跟班熊貓退場，等一下由牠拉車登場
  G.faint = {
    t: 0, phase: 0, pt: 0,
    cartX: 0, fromX: 0, fromY: 0,
    sword: { x: player.x + 16, y: player.y - 34, vx: 2.8, vy: -4.4, rot: 0, landed: false },
  };
  sfx.faint();
  sfx.stopMusic();
}

function updateFaint() {
  const f = G.faint;
  if (!f) return;
  f.t++;

  // 脫手飛出去的劍
  const sw = f.sword;
  if (!sw.landed) {
    sw.vy = Math.min(sw.vy + GRAV * 0.9, MAXFALL);
    sw.x += sw.vx; sw.y += sw.vy; sw.rot += 0.34;
    if (sw.y >= GROUND) { sw.y = GROUND; sw.landed = true; sfx.tone(300, 0.12, 'square', 0.16, -160); }
  }

  // 眼淚（噴淚）
  if (f.phase < 3 && f.t % 5 === 0) {
    for (const side of [-1, 1]) {
      parts.push({
        x: player.x + side * 7, y: player.y - 40,
        vx: side * rnd(0.9, 2.1) + (f.phase === 3 ? 1.4 : 0), vy: rnd(-2.4, -1.2),
        life: irnd(24, 40), c: '#8fd8ff', s: 2, g: 0.16,
      });
    }
    if (f.t % 30 === 0) sfx.sob();
  }

  if (f.phase === 0) {
    if (f.t > 62) {
      f.phase = 1;
      f.cartX = Math.max(cam.x - 70, player.x - 230);
      banner('熊貓車出動！', 90);
      sfx.honk();
    }
  } else if (f.phase === 1) {
    f.cartX += 3.4;
    if (f.cartX >= player.x - 6) {
      f.phase = 2; f.pt = 0;
      f.fromX = player.x; f.fromY = player.y;
      sfx.honk();
    }
  } else if (f.phase === 2) {
    // 拋物線被抱上車斗
    f.pt++;
    const k = clamp(f.pt / 26, 0, 1);
    const tx = f.cartX - 10, ty = GROUND - CART.bedH;
    player.x = f.fromX + (tx - f.fromX) * k;
    player.y = f.fromY + (ty - f.fromY) * k - Math.sin(k * Math.PI) * 20;
    if (f.pt >= 26) { f.phase = 3; sfx.honk(); }
  } else {
    f.cartX += 4.2;
    player.x = f.cartX - 10;
    player.y = GROUND - CART.bedH;
    if (f.cartX > cam.x + VW + 90) { G.faint = null; gameOver(); }
  }
}

// 熊貓車尺寸
const CART = { bedH: 26, bedW: 82, wheelR: 11 };

function drawCart() {
  const f = G.faint;
  if (!f || f.phase === 0) return;
  const x = Math.round(f.cartX - cam.x);
  const top = GROUND - CART.bedH;

  // 車輪（會轉）
  const spin = f.cartX * 0.22;
  for (const wx of [x - 26, x + 20]) {
    ctx.fillStyle = '#241a33';
    ctx.beginPath(); ctx.arc(wx, GROUND - CART.wheelR + 1, CART.wheelR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b57a44';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(wx, GROUND - CART.wheelR + 1, CART.wheelR - 2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = spin + i * Math.PI / 2;
      ctx.moveTo(wx, GROUND - CART.wheelR + 1);
      ctx.lineTo(wx + Math.cos(a) * (CART.wheelR - 2), GROUND - CART.wheelR + 1 + Math.sin(a) * (CART.wheelR - 2));
    }
    ctx.stroke();
  }

  // 木頭車斗
  ctx.fillStyle = '#6b4326';
  ctx.fillRect(x - 42, top + 5, CART.bedW, 9);
  ctx.fillStyle = '#b57a44';
  ctx.fillRect(x - 42, top, CART.bedW, 6);
  for (let i = 0; i < 7; i++) ctx.fillRect(x - 38 + i * 12, top + 6, 3, 9);
  ctx.fillStyle = '#6b4326';
  ctx.fillRect(x - 42, top, 4, 16);
  ctx.fillRect(x + 36, top, 4, 16);

  // 玩偶熊貓司機（坐在車頭，會上下晃）
  const bob = Math.sin(f.cartX * 0.18) * 1;
  drawSprite(S.panda, 1, x + 12, Math.round(top - 29 + bob));
  // 小旗子
  ctx.fillStyle = '#e2465c';
  ctx.fillRect(x - 40, top - 16, 2, 16);
  ctx.fillRect(x - 38, top - 16, 10, 6);
}

// ------------------------------ 玩家 ------------------------------
function hurtPlayer(dmg, fromX) {
  if (player.inv > 0 || player.dead) return;
  player.hp -= dmg;
  player.inv = 72;
  player.knock = 10;
  player.vx = (player.x < fromX ? -1 : 1) * 3.4;
  player.vy = -3.6;
  player.atk = 0; player.spin = 0;
  G.shake = 10; G.freeze = 5;
  sfx.hurt();
  texts.push({ x: player.x, y: player.y - 74, vy: -0.9, life: 40, text: '-' + dmg, c: '#ff8a8a' });
  if (player.hp <= 0) {
    player.hp = 0;
    player.dead = true;
    player.dir = 1;
    player.vx = (player.x < fromX ? -2.2 : 2.2);
    player.vy = -4;
    sfx.die();
    startFaint();
  }
}

// 魔法飛彈（大臣專用）
function fireMissile(dmg, speed, vy, big) {
  shots.push({
    id: uid++, team: 'player', dmg, big: !!big,
    x: player.x + player.dir * 22, y: player.y - 30,
    vx: player.dir * speed, vy: vy || 0, t: 140, life: 0,
  });
  sfx.tone(big ? 520 : 700, 0.12, 'triangle', 0.22, big ? 420 : 300);
  for (let i = 0; i < 4; i++) {
    parts.push({ x: player.x + player.dir * 22, y: player.y - 30, vx: rnd(-1, 1), vy: rnd(-1, 1),
      life: 12, c: '#9fe4ff', s: 2, g: 0 });
  }
}

function startAttack() {
  player.combo = player.chain > 0 ? (player.combo + 1) % 3 : 0;
  player.atkTotal = Math.max(8, Math.round((player.combo === 2 ? 22 : 18) / CHAR.atkSpeed));
  player.atk = player.atkTotal;
  player.chain = 0;
  player.hitIds.clear();
  player.shotFired = false;
  if (!CHAR.ranged) sfx.swing();
  if (!player.onGround) player.vy = Math.min(player.vy, 1.2);
}

function attackHitbox() {
  const c = player.combo;
  const reach = c === 2 ? 80 : 62;
  const h = c === 1 ? 42 : 56;
  const top = player.y - (c === 1 ? 52 : 64);
  return { x: player.dir > 0 ? player.x + 3 : player.x - 3 - reach, y: top, w: reach, h };
}

function updatePlayer() {
  const s = input.state;
  const pr = input.pressed;

  if (player.dead) {
    if (G.faint && G.faint.phase >= 2) return;   // 上車後位置由演出控制
    player.vy = Math.min(player.vy + GRAV, MAXFALL);
    player.y += player.vy;
    player.x += player.vx;
    player.vx *= 0.88;
    if (player.y > GROUND) { player.y = GROUND; player.vy = 0; }
    return;
  }

  if (player.inv > 0) player.inv--;
  if (player.knock > 0) player.knock--;
  if (player.chain > 0) player.chain--;

  // 必殺
  if (player.spin > 0 && CHAR.ranged) {
    // 魔法齊射：站定連續射出扇形飛彈
    player.spin--;
    player.spinTick--;
    player.vx *= 0.86;
    if (player.spinTick <= 0) {
      player.spinTick = 5;
      const n = 7 - Math.ceil(player.spin / 8);
      fireMissile(4, 5.6, (n - 3) * 0.55, false);
      G.shake = Math.max(G.shake, 3);
    }
  } else if (player.spin > 0) {
    player.spin--;
    player.spinTick--;
    const move = (s.right ? 1 : 0) - (s.left ? 1 : 0);
    player.vx = clamp(player.vx + move * 0.4, -1.8, 1.8) * 0.92;
    if (player.spinTick <= 0) {
      player.spinTick = 7;
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - player.x, (e.y - e.h / 2) - (player.y - 30));
        if (d < 105) damageEnemy(e, 3, player.x, 4);
      }
      for (const sh of shots) if (Math.hypot(sh.x - player.x, sh.y - player.y + 30) < 105) sh.t = 0;
      for (let i = 0; i < 6; i++) {
        const a = rnd(0, Math.PI * 2);
        parts.push({ x: player.x + Math.cos(a) * 70, y: player.y - 30 + Math.sin(a) * 52, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 1.6, life: 16, c: '#bfe9ff', s: 3, g: 0 });
      }
    }
  } else {
    const attacking = player.atk > 0;
    const move = (s.right ? 1 : 0) - (s.left ? 1 : 0);
    const maxSpd = attacking ? (player.onGround ? 0.9 : 2.0) : 2.9;

    if (player.knock <= 0) {
      if (move) { if (!attacking) player.dir = move; player.vx += move * (player.onGround ? 1.0 : 0.65); }
      player.vx *= player.onGround ? 0.78 : 0.9;
      player.vx = clamp(player.vx, -maxSpd, maxSpd);
    } else {
      player.vx *= 0.92;
    }

    // 跳躍：土狼時間 + 輸入緩衝 + 二段跳
    if (pr.jump) player.jumpBuf = 8;
    if (player.jumpBuf > 0) player.jumpBuf--;
    if (player.coyote > 0) player.coyote--;
    if (player.jumpBuf > 0 && (player.coyote > 0 || player.jumps < 2)) {
      const dbl = player.coyote <= 0;
      player.vy = dbl ? -8.6 : -10.1;
      player.jumps = dbl ? 2 : 1;
      player.jumpBuf = 0; player.coyote = 0;
      player.onGround = false;
      sfx.jump();
      if (dbl) for (let i = 0; i < 8; i++) parts.push({ x: player.x + rnd(-6, 6), y: player.y, vx: rnd(-1.4, 1.4), vy: rnd(-0.4, 1.2), life: 16, c: '#dff3ff', s: 1, g: 0.05 });
    }
    if (!s.jump && player.vy < -3.4) player.vy = -3.4;   // 可變跳躍高度

    // 攻擊 / 必殺
    if (pr.attack && (player.atk <= 0 || player.chain > 0)) startAttack();
    if (pr.special && player.rage >= player.maxRage && player.spin <= 0) {
      player.rage = 0;
      player.spin = CHAR.ranged ? 36 : 44;
      player.spinTick = 1;
      player.inv = Math.max(player.inv, CHAR.ranged ? 42 : 48);
      sfx.special();
      G.shake = 8;
    }
  }

  if (player.atk > 0) {
    player.atk--;
    if (player.atk === 4) player.chain = 12;  // 連段輸入視窗
    const t = player.atkTotal - player.atk;
    if (CHAR.ranged) {
      // 揮杖到一半才射出飛彈，對上動畫的出手時機
      if (!player.shotFired && t >= Math.round(player.atkTotal * 0.45)) {
        player.shotFired = true;
        const third = player.combo === 2;
        fireMissile(third ? 5 : 3, third ? 6.4 : 5.2, 0, third);
      }
    } else if (t >= 5 && t <= 11) {
      const hb = attackHitbox();
      for (const e of enemies) {
        if (e.dead || player.hitIds.has(e.id)) continue;
        const eb = { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
        if (aabb(hb, eb)) {
          player.hitIds.add(e.id);
          damageEnemy(e, player.combo === 2 ? 5 : 3, player.x, player.combo === 2 ? 5 : 3.2);
        }
      }
      for (const sh of shots) {
        if (sh.t > 0 && aabb(hb, { x: sh.x - 4, y: sh.y - 4, w: 8, h: 8 })) { sh.t = 0; sfx.hit(); }
      }
    }
  }

  player.x += player.vx;
  player.x = clamp(player.x, cam.x + 7, Math.min(stage.len - 7, cam.x + VW - 7));

  const wasAir = !player.onGround;
  const fallSpd = player.vy;
  groundCollide(player);
  if (player.landT > 0) player.landT--;
  if (player.onGround) {
    player.coyote = 7; player.jumps = 0;
    if (wasAir && player.vy === 0) {
      if (fallSpd > 4) player.landT = 9;      // 摔得夠重才播落地緩衝
      for (let i = 0; i < 5; i++) parts.push({ x: player.x + rnd(-6, 6), y: player.y, vx: rnd(-1.2, 1.2), vy: rnd(-1, -0.2), life: 12, c: '#cbb894', s: 1, g: 0.08 });
    }
  }

  player.anim++;
}

// ------------------------------ 道具 / 投射物 ------------------------------
function updatePet() {
  if (pet.hidden) return;
  pet.anim++;
  const target = player.x - player.dir * 46;
  const dx = target - pet.x;
  if (Math.abs(dx) > 90) {           // 落後太多就直接追上來
    pet.x = target;
    pet.y = GROUND;
  } else if (Math.abs(dx) > 10) {
    pet.dir = dx > 0 ? 1 : -1;
    pet.x += clamp(dx * 0.09, -2.6, 2.6);
    if (pet.onGround && Math.abs(dx) > 26) pet.vy = -3.4;   // 小跳步
  }
  pet.vy = Math.min(pet.vy + GRAV * 0.8, MAXFALL);
  pet.y += pet.vy;
  pet.onGround = false;
  if (pet.y >= GROUND) { pet.y = GROUND; pet.vy = 0; pet.onGround = true; }
}

function drawPet() {
  if (pet.hidden) return;
  const x = Math.round(pet.x - cam.x - 9);
  if (x < -20 || x > VW + 20) return;
  const bob = pet.onGround ? Math.round(Math.sin(pet.anim / 14) * 1) : 0;
  // 影子
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 2, GROUND - 1, 15, 2);
  drawSprite(S.panda, pet.dir, x, Math.round(pet.y - 29 + bob));
}

function updateItems() {
  for (const it of items) {
    if (it.taken) continue;
    it.t++;
    if (!it.ground) {
      it.vy = Math.min((it.vy || 0) + 0.34, 7);
      it.y += it.vy;
      let hit = it.y >= GROUND - 4;
      for (const p of stage.plats) {
        if (it.x > p.x && it.x < p.x + p.w && it.y >= p.y - 4 && it.y - it.vy <= p.y) { it.y = p.y - 4; hit = false; it.ground = true; }
      }
      if (hit) { it.y = GROUND - 4; it.ground = true; }
    }
    const d = Math.hypot(it.x - player.x, it.y - (player.y - 30));
    if (d < 54 && !player.dead) {   // 吸附
      it.x += (player.x - it.x) * 0.16;
      it.y += ((player.y - 30) - it.y) * 0.16;
    }
    if (d < 22 && !player.dead) {
      it.taken = true;
      if (it.kind === 'coin') { G.score += 60; sfx.coin(); texts.push({ x: it.x, y: it.y - 6, vy: -0.9, life: 34, text: '+60', c: '#ffd45e' }); }
      else if (it.kind === 'heart') { player.hp = Math.min(player.maxHp, player.hp + 1); sfx.heal(); texts.push({ x: it.x, y: it.y - 6, vy: -0.9, life: 34, text: '+HP', c: '#ff8a8a' }); }
      else { player.hp = Math.min(player.maxHp, player.hp + 1); player.rage = Math.min(player.maxRage, player.rage + 40); sfx.heal(); texts.push({ x: it.x, y: it.y - 6, vy: -0.9, life: 34, text: '+氣', c: '#6ff0c8' }); }
    }
  }
  items = items.filter((i) => !i.taken);

  for (const sh of shots) {
    sh.t--; sh.life++;
    sh.x += sh.vx; sh.y += sh.vy;
    // 玩家飛彈的判定框加高，才打得到地面上矮矮的敵人
    const box = sh.team === 'player'
      ? { x: sh.x - 8, y: sh.y - 20, w: 16, h: 40 }
      : { x: sh.x - 6, y: sh.y - 6, w: 12, h: 12 };
    if (sh.team === 'player') {
      // 魔法飛彈：打到第一個敵人就消失
      for (const e of enemies) {
        if (e.dead) continue;
        if (aabb(box, { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h })) {
          damageEnemy(e, sh.dmg, sh.x, sh.big ? 4.5 : 3);
          sh.t = 0;
          for (let i = 0; i < 8; i++) {
            parts.push({ x: sh.x, y: sh.y, vx: rnd(-2.5, 2.5), vy: rnd(-2.5, 2.5),
              life: irnd(10, 20), c: i % 2 ? '#9fe4ff' : '#ffffff', s: 2, g: 0.05 });
          }
          break;
        }
      }
      // 也能把敵人的火球打掉
      if (sh.t > 0) {
        for (const other of shots) {
          if (other.team === 'enemy' && other.t > 0 &&
            aabb(box, { x: other.x - 6, y: other.y - 6, w: 12, h: 12 })) {
            other.t = 0; sh.t = 0; sfx.hit();
            break;
          }
        }
      }
      if (sh.x < cam.x - 40 || sh.x > cam.x + VW + 40) sh.t = 0;
    } else if (!player.dead && player.inv <= 0 && player.spin <= 0 &&
      aabb({ x: sh.x - 4, y: sh.y - 4, w: 8, h: 8 },
        { x: player.x - player.w / 2, y: player.y - player.h, w: player.w, h: player.h })) {
      sh.t = 0; hurtPlayer(1, sh.x);
    }
  }
  shots = shots.filter((s) => s.t > 0);

  for (const w of waves) {
    w.t--;
    w.x += w.dir * 3.4;
    if (!player.dead && player.inv <= 0 && player.spin <= 0 && player.onGround &&
      Math.abs(w.x - player.x) < 12) { hurtPlayer(w.dmg, w.x); w.t = 0; }
  }
  waves = waves.filter((w) => w.t > 0);
}

function updateFx() {
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--; }
  parts = parts.filter((p) => p.life > 0);
  for (const t of texts) { t.y += t.vy; t.vy *= 0.94; t.life--; }
  texts = texts.filter((t) => t.life > 0);
}

// ------------------------------ 主更新 ------------------------------
function update() {
  G.frame++;
  if (G.freeze > 0) { G.freeze--; return; }
  if (G.bannerT > 0) G.bannerT--;
  if (G.victoryT > 0) G.victoryT--;

  updatePlayer();
  if (G.faint) updateFaint();
  spawnCheck();
  for (const e of enemies) if (!e.dead) updateEnemy(e);
  enemies = enemies.filter((e) => !e.dead);
  updateItems();
  updatePet();
  updateFx();

  // 攝影機（倒地演出時定住，讓熊貓車開出畫面）
  if (G.faint) { if (G.shake > 0) G.shake *= 0.86; return; }
  let target = player.x - VW * 0.38;
  target = clamp(target, cam.lockMin, Math.min(cam.lockMax, stage.len - VW));
  target = clamp(target, 0, Math.max(0, stage.len - VW));
  cam.x += (target - cam.x) * 0.12;
  if (G.shake > 0) G.shake *= 0.86;

  // 過關判定
  if (!stage.cleared && stage.bossDead && player.x > stage.portalX - 8 && Math.abs(player.y - GROUND) < 40) {
    stage.cleared = true;
    G.victoryT = 70;
    G.score += 500 + player.hp * 100;
    setTier(G.tier + (stage.isBoss ? 0.10 : 0.05));   // 熊貓：撐得住，那就加點料
    sfx.clear();
    banner('過關！', 90);
    const last = stage.isBoss && G.stage >= FINAL_STAGE;
    setTimeout(() => {
      if (G.mode !== 'play') return;
      if (last) { finishGame(); return; }
      player.hp = Math.min(player.maxHp, player.hp + 1);
      advanceStage(G.stage + 1);
    }, 1100);
  }
}

// ------------------------------ 繪圖 ------------------------------
function drawBackground() {
  const th = stage.theme;
  if (!skyCache || skyCache.theme !== th) {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
    skyCache = { theme: th, grad: g };
  }
  ctx.fillStyle = skyCache.grad;
  ctx.fillRect(0, 0, VW, VH);

  // 太陽 / 月亮
  ctx.fillStyle = th.sun;
  ctx.beginPath();
  ctx.arc(VW - 78, th.sunY, 18, 0, Math.PI * 2);
  ctx.fill();
  if (th.night) {
    ctx.fillStyle = th.sky[0];
    ctx.beginPath();
    ctx.arc(VW - 84, th.sunY - 5, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      const x = (i * 97 + 31) % VW, y = (i * 53) % 130;
      if ((G.frame + i * 9) % 150 < 108) ctx.fillRect(x, y, 1, 1);
    }
  }

  // 雲（像素風：疊方塊）
  ctx.fillStyle = th.cloud;
  for (const c of stage.clouds) {
    let x = (c.x - cam.x * 0.12) % (stage.len + VW);
    if (x < -80) x += stage.len + VW;
    if (x > VW + 80) continue;
    const w = c.w;
    ctx.fillRect(x, c.y, w, 5);
    ctx.fillRect(x + 5, c.y - 4, w - 12, 4);
    ctx.fillRect(x + 3, c.y + 5, w - 6, 3);
  }

  // 遠山
  ctx.fillStyle = th.far;
  for (const m of stage.far) {
    const x = m.x - cam.x * 0.25;
    if (x < -200 || x > VW + 60) continue;
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 4);
    ctx.lineTo(x + m.w / 2, GROUND - 4 - m.h);
    ctx.lineTo(x + m.w, GROUND - 4);
    ctx.closePath(); ctx.fill();
  }

  // 中景：松樹 / 岩石 / 高塔
  for (const t of stage.mid) {
    const x = t.x - cam.x * 0.55;
    if (x < -70 || x > VW + 40) continue;
    if (t.kind === 0) {
      // 兩層松樹
      const cx = x + t.w / 2;
      ctx.fillStyle = th.midDark;
      ctx.fillRect(cx - 2, GROUND - t.h * 0.34, 4, t.h * 0.34);
      ctx.fillStyle = th.mid;
      ctx.beginPath();
      ctx.moveTo(x - 5, GROUND - t.h * 0.32);
      ctx.lineTo(cx, GROUND - t.h * 0.72);
      ctx.lineTo(x + t.w + 5, GROUND - t.h * 0.32);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 2, GROUND - t.h * 0.62);
      ctx.lineTo(cx, GROUND - t.h);
      ctx.lineTo(x + t.w + 2, GROUND - t.h * 0.62);
      ctx.closePath(); ctx.fill();
    } else if (th.night) {
      // 魔王城高塔
      const w = t.w + 8, h = t.h + 30;
      ctx.fillStyle = th.midDark;
      ctx.fillRect(x, GROUND - h, w, h);
      ctx.fillStyle = th.mid;
      ctx.fillRect(x - 3, GROUND - h - 4, w + 6, 5);
      ctx.beginPath();
      ctx.moveTo(x - 3, GROUND - h - 4);
      ctx.lineTo(x + w / 2, GROUND - h - 16);
      ctx.lineTo(x + w + 3, GROUND - h - 4);
      ctx.closePath();
      ctx.fillStyle = '#5a2740'; ctx.fill();
      ctx.fillStyle = '#ffcc4d';
      if ((G.frame + t.x) % 200 < 150) ctx.fillRect(x + w / 2 - 1, GROUND - h + 10, 3, 4);
    } else {
      // 岩石叢
      ctx.fillStyle = th.midDark;
      ctx.fillRect(x, GROUND - t.h * 0.34, t.w + 10, t.h * 0.34);
      ctx.fillStyle = th.mid;
      ctx.fillRect(x + 2, GROUND - t.h * 0.44, t.w + 4, t.h * 0.16);
      ctx.fillRect(x + t.w - 2, GROUND - t.h * 0.3, 8, t.h * 0.3);
    }
  }
}

function drawGround() {
  const th = stage.theme;
  ctx.fillStyle = th.dirt;
  ctx.fillRect(0, GROUND, VW, VH - GROUND);
  ctx.fillStyle = th.grass;
  ctx.fillRect(0, GROUND, VW, 6);
  ctx.fillStyle = th.grass2;
  ctx.fillRect(0, GROUND + 6, VW, 3);
  ctx.fillStyle = th.dirt2;
  const off = Math.floor(cam.x) % 16;
  for (let x = -off; x < VW; x += 16) {
    ctx.fillRect(x, GROUND + 12, 3, 3);
    ctx.fillRect(x + 8, GROUND + 22, 4, 3);
  }
  // 前景草叢
  ctx.fillStyle = th.grass2;
  for (const t of stage.tufts) {
    const x = Math.round(t.x - cam.x);
    if (x < -6 || x > VW + 6) continue;
    ctx.fillRect(x, GROUND - t.h, t.w, t.h);
  }
  // 平台
  for (const p of stage.plats) {
    const x = Math.round(p.x - cam.x);
    if (x < -p.w - 20 || x > VW + 20) continue;
    ctx.fillStyle = th.dirt2;
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = th.grass;
    ctx.fillRect(x, p.y, p.w, 3);
    ctx.fillStyle = th.grass2;
    ctx.fillRect(x, p.y + 3, p.w, 2);
  }
}

function playerFrame() {
  if (player.spin > 0) return 'atk2';
  if (player.atk > 0) {
    const total = player.atkTotal;
    const t = total - player.atk;
    if (t < 5) return 'atk1';
    return player.combo === 1 ? 'atk2' : 'atk3';
  }
  if (!player.onGround) return player.vy < 0 ? 'jump' : 'fall';
  if (Math.abs(player.vx) > 0.35) return 'run' + (Math.floor(player.anim / 6) % 4);
  const blinkPhase = player.anim % 190;
  if (blinkPhase < 7) return 'blink';                     // 待機時偶爾眨眼
  return 'idle' + (Math.floor(player.anim / 30) % 2);
}

function drawPlayer() {
  if (HERO.ready) return drawPlayerHD();
  if (player.dead) {
    // 哭哭（坐在地上／被熊貓車載走）
    const key = 'cry' + (Math.floor(G.frame / 14) % 2);
    drawSprite(S.player[key], player.dir, Math.round(player.x - cam.x - PLAYER_W / 2), Math.round(player.y - PLAYER_FOOT));
    return;
  }
  if (player.inv > 0 && player.spin <= 0 && G.frame % 6 < 2) return;

  const key = playerFrame();
  const sx = Math.round(player.x - cam.x - PLAYER_W / 2);
  const sy = Math.round(player.y - PLAYER_FOOT);

  if (player.spin > 0) {
    // 旋風斬：旋轉繪製 + 劍光圈
    ctx.save();
    ctx.translate(sx + PLAYER_W / 2, sy + 24);
    ctx.rotate((G.frame * 0.55) % (Math.PI * 2));
    ctx.globalAlpha = 0.9;
    ctx.drawImage(S.player[key][1], -PLAYER_W / 2, -24);
    ctx.restore();
    ctx.strokeStyle = 'rgba(191,233,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx + PLAYER_W / 2, sy + 24, 46 + Math.sin(G.frame * 0.4) * 4, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  const set = (player.inv > 48 && !player.dead) ? S.playerFlash : S.player;
  drawSprite(set[key], player.dir, sx, sy);

  // 劍光特效
  if (player.atk > 0 && !CHAR.noSlashFx) {
    const t = player.atkTotal - player.atk;
    if (t >= 3 && t <= 12) {
      const a = clamp((12 - t) / 8, 0, 1);
      const cx = player.x - cam.x + player.dir * 10;
      const cy = player.y - 20;
      const r = player.combo === 2 ? 42 : 34;
      const base = player.dir > 0 ? -1.9 : Math.PI + 1.9;
      const sweep = player.dir > 0 ? 1 : -1;
      const ang = 0.45 + (t - 3) * 0.17;
      ctx.save();
      // 外層寬拖尾
      ctx.globalAlpha = a * 0.35;
      ctx.strokeStyle = player.combo === 2 ? '#ffd45e' : '#bfe9ff';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 3, base, base + sweep * ang);
      ctx.stroke();
      // 內層亮線
      ctx.globalAlpha = a * 0.95;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, base, base + sweep * ang);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawPlayerHD() {
  const key = heroFrame();
  if (player.inv > 0 && !player.dead && player.spin <= 0 && G.frame % 6 < 2) return;

  if (player.spin > 0 && CHAR.ranged) {
    // 魔法齊射：站著詠唱 + 腳下魔法陣
    const cx = player.x - cam.x, cy = player.y;
    ctx.save();
    ctx.strokeStyle = 'rgba(120,210,255,0.9)';
    ctx.lineWidth = 2;
    for (const k of [1, 0.66]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, 46 * k, 13 * k, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.rotate(0);
    ctx.restore();
    for (let i = 0; i < 2; i++) {
      const a = rnd(0, Math.PI * 2);
      parts.push({ x: player.x + Math.cos(a) * 42, y: player.y - 4, vx: 0, vy: rnd(-2.4, -1),
        life: 20, c: '#9fe4ff', s: 2, g: 0 });
    }
    drawHero(pick('special1', 'atk_thrust'), player.dir, player.x, player.y);
    return;
  }

  if (player.spin > 0 && has('special1')) {
    // 有專屬的大招影格：兩格交替，不用把整張圖轉起來
    drawHero(key, player.dir, player.x, player.y);
    const cx = player.x - cam.x, cy = player.y - HERO_H * 0.5;
    ctx.strokeStyle = 'rgba(191,233,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 56 + Math.sin(G.frame * 0.4) * 5, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  if (player.spin > 0) {
    // 沒有專屬影格：沿用「把 atk_thrust 轉起來」的做法
    const cx = player.x - cam.x, cy = player.y - HERO_H * 0.5;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.translate(cx, cy);
    ctx.rotate((G.frame * 0.5) % (Math.PI * 2));
    const s = HERO.scale;
    ctx.drawImage(HERO.img, HERO.index.atk_thrust * HERO.fw, 0, HERO.fw, HERO.fh,
      -HERO.ax * s, -HERO.ay * s + HERO_H * 0.5, HERO.fw * s, HERO.fh * s);
    ctx.imageSmoothingEnabled = false;
    ctx.restore();
    ctx.strokeStyle = 'rgba(191,233,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 56 + Math.sin(G.frame * 0.4) * 5, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  drawHero(key, player.dir, player.x, player.y + heroBob());

  // 劍光
  if (player.atk > 0 && !CHAR.noSlashFx && !CHAR.ranged) {
    const t = player.atkTotal - player.atk;
    if (t >= 3 && t <= 12) {
      const a = clamp((12 - t) / 8, 0, 1);
      const cx = player.x - cam.x + player.dir * 16;
      const cy = player.y - 36;
      const r = player.combo === 2 ? 72 : 58;
      const base = player.dir > 0 ? -1.9 : Math.PI + 1.9;
      const sweep = player.dir > 0 ? 1 : -1;
      const ang = 0.45 + (t - 3) * 0.17;
      ctx.save();
      ctx.globalAlpha = a * 0.32;
      ctx.strokeStyle = player.combo === 2 ? '#ffd45e' : '#bfe9ff';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, r - 6, base, base + sweep * ang); ctx.stroke();
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, r, base, base + sweep * ang); ctx.stroke();
      ctx.restore();
    }
  }
}

function drawEnemies() {
  for (const e of enemies) {
    const sx = Math.round(e.x - cam.x), sy = Math.round(e.y);
    let frames = S[e.type];
    if (e.hurt > 7) frames = S.flash[e.type];
    let idx = 0;
    if (e.type === 'bat') idx = Math.floor(e.anim / 7) % 2;
    const f = frames[idx];
    const w = f.w, h = f.h;

    if (e.type === 'slime') {
      // 用縮放做出彈跳擠壓感
      const sq = e.onGround ? 1 + Math.sin(e.anim / 9) * 0.06 : 0.86;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1 / sq, sq);
      ctx.drawImage(f[e.dir > 0 ? 1 : '-1'], -w / 2, -h);
      ctx.restore();
    } else if (e.type === 'orc' && e.st === 'wind') {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(e.dir * -0.18);
      ctx.drawImage(f[e.dir > 0 ? 1 : '-1'], -w / 2, -h);
      ctx.restore();
    } else if (e.type === 'boss') {
      ctx.save();
      if (e.st === 'cast') {
        ctx.shadowColor = '#ff5a1f'; ctx.shadowBlur = 12;
      }
      ctx.drawImage(f[e.dir > 0 ? 1 : '-1'], sx - w / 2, sy - h + 4);
      ctx.restore();
    } else {
      ctx.drawImage(f[e.dir > 0 ? 1 : '-1'], sx - w / 2, sy - h);
    }

    // 小血條
    if (e.hp < e.maxHp && e.type !== 'boss') {
      const bw = e.w + 4;
      ctx.fillStyle = '#000000aa';
      ctx.fillRect(sx - bw / 2, sy - e.h - 7, bw, 3);
      ctx.fillStyle = '#66e07a';
      ctx.fillRect(sx - bw / 2, sy - e.h - 7, bw * (e.hp / e.maxHp), 3);
    }

    // 哥布林蓄力警示
    if (e.type === 'orc' && e.st === 'wind' && Math.floor(e.t / 4) % 2 === 0) {
      ctx.fillStyle = '#ff5a5a';
      ctx.fillRect(sx - 1, sy - e.h - 14, 3, 6);
    }
    if (e.atkBox) {
      const b = e.atkBox;
      ctx.fillStyle = 'rgba(255,120,60,0.35)';
      ctx.fillRect(b.x - cam.x, b.y, b.w, b.h);
    }
  }
}

function drawWorldFx() {
  // 投射物
  for (const sh of shots) {
    const x = sh.x - cam.x;
    if (sh.team === 'player') {
      // 魔法飛彈：藍色菱形 + 光暈 + 拖尾
      const r = sh.big ? 9 : 6.5;
      ctx.save();
      ctx.translate(x, sh.y);
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.6);
      grd.addColorStop(0, 'rgba(159,228,255,0.55)');
      grd.addColorStop(1, 'rgba(159,228,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(-r * 2.6, -r * 2.6, r * 5.2, r * 5.2);
      ctx.rotate(G.frame * 0.22);
      ctx.fillStyle = '#3fb8ff';
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.62, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.62, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eaf9ff';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.5); ctx.lineTo(r * 0.3, 0); ctx.lineTo(0, r * 0.5); ctx.lineTo(-r * 0.3, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      if (sh.life % 2 === 0) {
        parts.push({ x: sh.x - sh.vx * 0.6, y: sh.y + rnd(-2, 2), vx: -sh.vx * 0.08, vy: rnd(-0.3, 0.3),
          life: 12, c: '#7fd8ff', s: 2, g: 0 });
      }
    } else {
      ctx.save();
      ctx.translate(x, sh.y);
      ctx.rotate(G.frame * 0.3);
      ctx.drawImage(S.fireball[1], -3, -3);
      ctx.restore();
    }
  }
  // 衝擊波
  for (const w of waves) {
    const x = w.x - cam.x;
    const h = 6 + Math.sin(w.t * 0.5) * 3;
    ctx.fillStyle = '#ffb35c';
    ctx.fillRect(x - 3, GROUND - h, 6, h);
    ctx.fillStyle = '#ff6a2a';
    ctx.fillRect(x - 2, GROUND - h + 2, 4, h - 2);
  }
  // 道具
  for (const it of items) {
    const spr = it.kind === 'coin' ? S.coin : it.kind === 'heart' ? S.heart : S.potion;
    const bob = Math.sin((it.t + it.x) / 14) * 2;
    ctx.drawImage(spr[1], Math.round(it.x - cam.x - 3), Math.round(it.y - 7 + bob));
  }
  // 傳送門
  if (stage.bossDead) {
    const x = stage.portalX - cam.x;
    if (x > -40 && x < VW + 40) {
      ctx.save();
      ctx.globalAlpha = 0.85 + Math.sin(G.frame * 0.12) * 0.15;
      ctx.drawImage(S.portal[1], Math.round(x - 10), Math.round(GROUND - 40 + Math.sin(G.frame * 0.06) * 3));
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GOAL', x, GROUND - 46);
      ctx.textAlign = 'left';
    }
  }
  // 倒地演出：熊貓車 + 脫手的劍
  if (G.faint) {
    drawCart();
    const sw = G.faint.sword;
    ctx.save();
    ctx.translate(Math.round(sw.x - cam.x), Math.round(sw.y - 2));
    ctx.rotate(sw.landed ? 0 : sw.rot);
    ctx.drawImage(S.swordFlat[1], -6, -2);
    ctx.restore();
  }
  // 粒子
  for (const p of parts) {
    ctx.globalAlpha = Math.min(1, p.life / 14);
    ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x - cam.x), Math.round(p.y), p.s, p.s);
  }
  ctx.globalAlpha = 1;
  // 傷害數字
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  for (const t of texts) {
    ctx.globalAlpha = Math.min(1, t.life / 16);
    ctx.fillStyle = '#000';
    ctx.fillText(t.text, Math.round(t.x - cam.x) + 1, Math.round(t.y) + 1);
    ctx.fillStyle = t.c;
    ctx.fillText(t.text, Math.round(t.x - cam.x), Math.round(t.y));
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawHUD() {
  // 愛心
  for (let i = 0; i < player.maxHp; i++) {
    const x = 6 + i * 10, y = 6;
    if (i < player.hp) ctx.drawImage(S.heart[1], x, y);
    else { ctx.globalAlpha = 0.28; ctx.drawImage(S.heart[1], x, y); ctx.globalAlpha = 1; }
  }
  // 氣力槽
  ctx.fillStyle = '#00000088';
  ctx.fillRect(6, 17, 62, 6);
  const rf = player.rage / player.maxRage;
  ctx.fillStyle = rf >= 1 ? (G.frame % 16 < 8 ? '#ffffff' : '#6ff0c8') : '#3fd0e0';
  ctx.fillRect(7, 18, 60 * rf, 4);
  ctx.font = '8px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(rf >= 1 ? '必殺 READY' : '氣力', 72, 23);

  // 分數 / 關卡（放左側，避開右上系統鍵）
  ctx.font = '10px monospace';
  const line = (txt, x, y, col) => {
    ctx.fillStyle = '#000'; ctx.fillText(txt, x + 1, y + 1);
    ctx.fillStyle = col; ctx.fillText(txt, x, y);
  };
  line(`SCORE ${G.score}`, 6, 36, '#ffe066');
  line(`STAGE ${G.stage}`, 6, 48, '#ffffff');

  // 進度條（含騎士圖示）
  const prog = clamp(player.x / stage.len, 0, 1);
  const bx = VW / 2 - 55;
  ctx.fillStyle = '#00000077';
  ctx.fillRect(bx - 1, 7, 112, 6);
  ctx.fillStyle = '#ffffffcc';
  ctx.fillRect(bx, 8, 110 * prog, 4);
  ctx.fillStyle = '#ffe066';
  ctx.fillRect(bx + 110 * prog - 1, 6, 3, 8);
  ctx.fillStyle = '#7fe3ff';
  ctx.fillRect(bx + 108, 5, 4, 10);

  // 魔王血條
  const boss = enemies.find((e) => e.type === 'boss');
  if (boss) {
    ctx.fillStyle = '#000000aa';
    ctx.fillRect(VW / 2 - 100, VH - 24, 200, 10);
    ctx.fillStyle = '#c0243a';
    ctx.fillRect(VW / 2 - 98, VH - 22, 196 * (boss.hp / boss.maxHp), 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('魔騎士 · DARK KNIGHT', VW / 2, VH - 27);
    ctx.textAlign = 'left';
  }

  // 關卡橫幅
  if (G.bannerT > 0 && G.banner) {
    const a = Math.min(1, G.bannerT / 25);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#000000aa';
    ctx.fillRect(0, VH / 2 - 22, VW, 34);
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe066';
    ctx.fillText(G.banner, VW / 2, VH / 2 + 2);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function render(withHud = true) {
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  ctx.save();
  if (G.shake > 0.4) ctx.translate(rnd(-G.shake, G.shake) * 0.5, rnd(-G.shake, G.shake) * 0.5);
  drawBackground();
  drawGround();
  drawWorldFx();
  drawEnemies();
  drawPet();
  drawPlayer();
  ctx.restore();
  if (withHud) drawHUD();
}

// ------------------------------ 過場 ------------------------------
// 第 FINAL_STAGE 關的魔王 = 該角色故事的最終魔王，打完會播結局。
// 想改成更長／更短的一輪，只要動這個數字。
const FINAL_STAGE = 9;

const FACE = { knight: 1, mage: 1, elder: 1 };

// 表情差分的半身立繪。切出來的檔案放 assets/character/<角色>/bust/<表情>.png，
// 哪個角色做好了就把代號列進來；沒列到的、或檔案還沒有的，一律退回圓形頭像。
const BUSTS = {
  mage: ['normal', 'worried', 'relieved', 'scold', 'speechless',
         'sly', 'serious', 'flustered', 'soft'],
  elder: ['normal', 'cold', 'fury', 'tearful', 'scold',
          'blush', 'soft', 'exhausted', 'smug'],
};

function bustOf(who, expr) {
  const list = BUSTS[who];
  if (!list) return null;
  const name = list.includes(expr) ? expr : 'normal';
  return `assets/character/${who}/bust/${name}.png`;
}

const cut = new Cutscene({
  sfx,
  bustOf,
  portraitOf: (who) => (FACE[who] ? `assets/character/${who}/face.png` : null),
  // 熊貓沒有頭像圖，直接用遊戲裡的跟班 sprite 放大
  drawMascot: (c, x, y, size) => {
    c.save();
    c.beginPath();
    c.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    c.fillStyle = '#2b2450';
    c.fill();
    c.clip();
    const spr = S.panda[1];
    const k = (size * 0.86) / spr.height;
    c.drawImage(spr, Math.round(x + (size - spr.width * k) / 2), Math.round(y + size * 0.16),
      Math.round(spr.width * k), Math.round(spr.height * k));
    c.restore();
    c.strokeStyle = '#6b58bd';
    c.beginPath();
    c.arc(x + size / 2, y + size / 2, size / 2 - 0.5, 0, Math.PI * 2);
    c.stroke();
    return true;
  },
});

function playCut(script, onDone) {
  if (!script || !script.length) { if (onDone) onDone(); return; }
  G.mode = 'cut';
  ui.pad.classList.add('hidden');
  ui.start.classList.add('hidden');
  ui.over.classList.add('hidden');
  ui.pause.classList.add('hidden');
  if (ui.cutSkip) ui.cutSkip.classList.remove('hidden');
  sfx.stopMusic();
  cut.play(script, () => {
    if (ui.cutSkip) ui.cutSkip.classList.add('hidden');
    if (onDone) onDone();
  });
}

// 開始／回到實際的關卡操作
function resumePlay() {
  G.mode = 'play';
  ui.pad.classList.remove('hidden');
  sfx.startMusic();
}

// 換關：這一關前面有中段劇情就先播
function advanceStage(n) {
  const mid = midFor(CHAR.key, n);
  startStage(n);
  if (mid) playCut(mid, resumePlay);
}

const seenKey = (kind) => `kg_${kind}_${CHAR.key}`;
function hasCleared(key) { return !!localStorage.getItem(`kg_clear_${key}`); }

// 全破：播結局 → 記旗標（解鎖下一位）→ 回標題
function finishGame() {
  if (G.mode !== 'play') return;
  G.best = Math.max(G.best, G.score);
  localStorage.setItem('kg_best', String(G.best));
  ui.best.textContent = G.best;

  const script = (scriptFor(CHAR.key, 'end') || []).slice();
  const next = ROSTER.find((c) => CLEAR_UNLOCK[c.key] === CHAR.key);
  if (next && !isUnlocked(next)) {
    script.push({ text: `新角色解鎖：${next.name}（${next.diff}難度）`, black: true, center: true, hold: 200 });
  }
  localStorage.setItem(seenKey('clear'), '1');
  sfx.stopMusic();
  playCut(script, toTitle);
}

function toTitle() {
  G.mode = 'title';
  G.faint = null;
  ui.over.classList.add('hidden');
  ui.pause.classList.add('hidden');
  ui.pad.classList.add('hidden');
  ui.start.classList.remove('hidden');
  buildCharSelect();
}

// ------------------------------ 畫面流程 ------------------------------
function newGame() {
  G.score = 0;
  G.faint = null;
  G.victoryT = 0;
  player.maxHp = CHAR.maxHp;
  player.hp = player.maxHp;
  player.rage = 0;
  ui.start.classList.add('hidden');
  ui.over.classList.add('hidden');
  sfx.ensure();
  startStage(1);

  // 這個角色的開場只自動播一次，之後從標題的「故事」重看
  const key = seenKey('seen_open');
  const open = scriptFor(CHAR.key, 'open');
  if (open && !localStorage.getItem(key)) {
    localStorage.setItem(key, '1');
    playCut(open, resumePlay);
  } else {
    resumePlay();
  }
}

function gameOver() {
  if (G.mode !== 'play') return;
  G.mode = 'dead';
  G.best = Math.max(G.best, G.score);
  localStorage.setItem('kg_best', String(G.best));
  ui.finalScore.textContent = G.score;
  ui.finalStage.textContent = G.stage;
  ui.best.textContent = G.best;
  const tierEl = document.getElementById('tierText');
  if (tierEl) tierEl.textContent = tierStars();
  pickDefeatArt();

  ui.over.classList.remove('hidden');
  ui.pad.classList.add('hidden');
  buildCharSelect();          // 可能剛解鎖新角色
  sfx.stopMusic();
}

function togglePause() {
  if (G.mode === 'play') {
    G.mode = 'pause';
    ui.pause.classList.remove('hidden');
    sfx.stopMusic();
  } else if (G.mode === 'pause') {
    G.mode = 'play';
    ui.pause.classList.add('hidden');
    sfx.startMusic();
  }
}

// 標題畫面的示範背景
stage = makeStage(1);

document.getElementById('startBtn').addEventListener('click', newGame);
document.getElementById('retryBtn').addEventListener('click', newGame);
document.getElementById('titleBtn').addEventListener('click', toTitle);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
ui.pauseBtn.addEventListener('click', togglePause);
ui.muteBtn.addEventListener('click', () => {
  const m = sfx.toggleMute();
  ui.muteBtn.textContent = m ? '🔇' : '🔊';
});
addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play') togglePause(); });

// 過場：點畫面任一處推進（逐字中就先補完），左上角可跳過
document.getElementById('wrap').addEventListener('pointerdown', () => {
  if (G.mode === 'cut') cut.tap = true;
});
if (ui.cutSkip) {
  ui.cutSkip.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
  ui.cutSkip.addEventListener('click', (e) => { e.stopPropagation(); cut.skip(); });
}

ui.best.textContent = G.best;

// 結算插畫：有該角色專屬的就用，沒有才退回小公主那組（她有兩張，隨機挑）
const DEFEAT_ART = ['assets/cart.png', 'assets/cry.png'];

function defeatArtFor(c) {
  return c.key === 'knight' ? DEFEAT_ART[Math.floor(Math.random() * DEFEAT_ART.length)]
    : c.dir + '/defeat.jpg';
}

function pickDefeatArt() {
  const el = document.getElementById('cryArt');
  if (!el) return;
  const want = defeatArtFor(CHAR);
  el.classList.remove('hidden');
  ui.over.classList.remove('has-portrait');
  el.onload = () => { if (el.naturalWidth) ui.over.classList.add('has-portrait'); };
  // 缺該角色的圖就退回小公主的，再缺就整個藏起來
  el.onerror = () => {
    if (el.src.endsWith('/defeat.jpg')) el.src = DEFEAT_ART[0];
    else el.classList.add('hidden');
  };
  el.src = want;
}

// 標題封面：同樣是「有專屬的就用，沒有就用小公主的」
function applyCover() {
  const cover = document.getElementById('coverArt');
  const wide = document.getElementById('coverArtWide');
  const set = (el, own, base, cls) => {
    if (!el) return;
    ui.start.classList.remove(cls);
    el.onload = () => { if (el.naturalWidth) ui.start.classList.add(cls); };
    el.onerror = () => { if (el.getAttribute('src') !== base) el.src = base; };
    el.src = CHAR.key === 'knight' ? base : own;
  };
  set(cover, CHAR.dir + '/cover.jpg', 'assets/cover.jpg', 'has-art');
  set(wide, CHAR.dir + '/cover-wide.jpg', 'assets/cover-wide.jpg', 'has-wide');
}

// ------------------------------ 選角 ------------------------------
// 解鎖：破前一位的台（才符合劇情順序）
const CLEAR_UNLOCK = { mage: 'knight', elder: 'mage' };

// 舊版是掛「累計討伐魔王數」。更新後把當下的魔王數凍結起來當作既得權益，
// 舊玩家已經解鎖的角色不會被鎖回去；新存檔凍結值是 0，所以只認破台旗標。
const LEGACY_BOSSES = (() => {
  const k = 'kg_legacy_bosses';
  if (localStorage.getItem(k) === null) localStorage.setItem(k, String(G.bosses));
  return +localStorage.getItem(k) || 0;
})();

function isUnlocked(c) {
  if (!c.unlockBoss) return true;
  const need = CLEAR_UNLOCK[c.key];
  if (need && hasCleared(need)) return true;
  return LEGACY_BOSSES >= c.unlockBoss;
}

function buildCharSelect() {
  const box = document.getElementById('charSelect');
  const blurb = document.getElementById('charBlurb');
  if (!box) return;
  box.innerHTML = '';
  for (const c of ROSTER) {
    const b = document.createElement('button');
    b.className = 'charcard';
    b.dataset.key = c.key;
    b.innerHTML =
      '<img class="cface" src="' + c.dir + '/face.png" alt="">' +
      '<span class="cname">' + c.name + '</span>' +
      '<span class="cdiff">' + c.diff + '</span>';
    if (!isUnlocked(c)) {
      b.classList.add('is-locked');
      const lk = document.createElement('span');
      lk.className = 'clock';
      const need = ROSTER.find((r) => r.key === CLEAR_UNLOCK[c.key]);
      lk.innerHTML = need ? '<b>🔒</b>破完<br>' + need.name + '篇' : '<b>🔒</b>尚未解鎖';
      b.appendChild(lk);
    }
    b.addEventListener('click', () => {
      if (!isUnlocked(c)) return;
      CHAR = c;
      localStorage.setItem('kg_char', c.key);
      loadHero(c.dir);
      applyCover();
      refreshCharSelect();
    });
    box.appendChild(b);
  }
  refreshCharSelect();

  function refreshCharSelect() {
    if (!isUnlocked(CHAR)) { CHAR = ROSTER[0]; localStorage.setItem('kg_char', CHAR.key); loadHero(CHAR.dir); }
    for (const el of box.children) el.classList.toggle('is-on', el.dataset.key === CHAR.key);
    if (blurb) {
      blurb.innerHTML = CHAR.blurb +
        (CHAR.todo ? '<br><span class="todo">※ ' + CHAR.todo + '</span>' : '');
    }
    buildReplay();
  }
  buildCharSelect.refresh = refreshCharSelect;
}

// 標題畫面「故事」裡的重看鍵：開場永遠可以重看，結局要破過台才出現
function buildReplay() {
  const box = document.getElementById('storyReplay');
  if (!box) return;
  box.innerHTML = '';
  const add = (label, kind) => {
    const b = document.createElement('button');
    b.className = 'smallbtn';
    b.textContent = label;
    b.addEventListener('click', () => { sfx.ensure(); playCut(scriptFor(CHAR.key, kind), toTitle); });
    box.appendChild(b);
  };
  if (scriptFor(CHAR.key, 'open')) add('重看 ' + CHAR.name + ' 篇開場', 'open');
  if (hasCleared(CHAR.key) && scriptFor(CHAR.key, 'end')) add('重看 ' + CHAR.name + ' 篇結局', 'end');
}
buildCharSelect();

// ------------------------ 封面插畫（可選素材） ------------------------
// assets/ 底下放了圖就自動套用，沒有的話畫面維持純程式繪製的樣子。
(function setupArtwork() {
  const cover = document.getElementById('coverArt');
  const wide = document.getElementById('coverArtWide');
  // 圖片可能在這支 module 執行前就載完了，所以先照 complete 的狀態標一次
  for (const [el, cls] of [[cover, 'has-art'], [wide, 'has-wide']]) {
    if (el && el.complete && el.naturalWidth) ui.start.classList.add(cls);
  }
  applyCover();
  // 結算插畫先預載，倒下時才不會閃一下
  const i = new Image(); i.src = defeatArtFor(CHAR);
})();

// ------------------------------ 主迴圈 ------------------------------
let last = performance.now(), acc = 0;
const STEP = 1000 / 60;

function loop(now) {
  requestAnimationFrame(loop);
  let dt = now - last;
  last = now;
  if (dt > 250) dt = STEP;
  acc += dt;
  let steps = 0;
  while (acc >= STEP && steps < 5) {
    acc -= STEP; steps++;
    input.beginFrame();
    if (G.mode === 'play') {
      if (input.pressed.pause) { togglePause(); }
      else update();
    } else if (G.mode === 'pause') {
      if (input.pressed.pause) togglePause();
    } else if (G.mode === 'cut') {
      cut.update(input);
    } else {
      G.frame++;
      if (input.pressed.jump || input.pressed.attack) {
        if (G.mode === 'title' || G.mode === 'dead') newGame();
      }
    }
    input.endFrame();
  }
  if (G.mode === 'cut') {
    // 中段對話沒有 CG，就把（暫停中的）關卡畫面當背景，跟洛克人一樣
    if (cut.needsWorld) render(false);
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    cut.draw(ctx, VW, VH);
  } else if (G.mode === 'title' || G.mode === 'dead') {
    // 標題／結束畫面：背景 + 待機中的女騎士
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    ctx.save();
    drawBackground();
    drawGround();
    if (HERO.ready) {
      const sc = HERO.scale * 1.9;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.translate(Math.round(VW * 0.20), GROUND);
      ctx.drawImage(HERO.img, HERO.index.idle * HERO.fw, 0, HERO.fw, HERO.fh,
        -HERO.ax * sc, -HERO.ay * sc, HERO.fw * sc, HERO.fh * sc);
      ctx.imageSmoothingEnabled = false;
      ctx.restore();
    } else {
      const k = 2;
      const idle = S.player['idle' + (Math.floor(G.frame / 34) % 2)][1];
      ctx.drawImage(idle, Math.round(VW * 0.10), GROUND - 40 * k, PLAYER_W * k, 44 * k);
    }
    const hop = Math.abs(Math.sin(G.frame / 26)) * 16;
    const sl = S.slime[0]['-1'];
    ctx.drawImage(sl, Math.round(VW * 0.78), Math.round(GROUND - S.slime[0].h - hop), S.slime[0].w, S.slime[0].h);
    ctx.restore();
  } else {
    render();
  }
}
requestAnimationFrame(loop);

// 依視窗大小縮放畫布（保持像素感）
function resize() {
  const wrap = document.getElementById('wrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  // 直向手機用較窄的視野，角色在螢幕上會比較大；橫向則拉寬
  const want = clamp(Math.round(VH * (w / h)), VW_MIN, VW_MAX);
  if (want !== VW) VW = want;
  const scale = Math.min(w / VW, h / VH);
  // 內部像素直接對齊裝置像素，瀏覽器就不用再縮放一次（插畫才不會糊或閃爍）
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const res = clamp(Math.round(scale * dpr), 1, 3);
  if (canvas.width !== VW * res || canvas.height !== VH * res) {
    RES = res;
    canvas.width = VW * RES;
    canvas.height = VH * RES;
    ctx.imageSmoothingEnabled = false;   // 改變畫布尺寸會重置 context
    skyCache = null;
  }
  canvas.style.width = Math.floor(VW * scale) + 'px';
  canvas.style.height = Math.floor(VH * scale) + 'px';
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 120));
resize();

// 對外除錯用
window.__game = { G, player, S, HERO, cut, playCut, scriptFor, midFor, toTitle, FINAL_STAGE,
  get frame() { return heroFrame(); },
  get shots() { return shots; }, get enemies() { return enemies; }, get stage() { return stage; },
  get VW() { return VW; }, VH, get RES() { return RES; }, GROUND, HERO_H,
  newGame, startStage, cam };
