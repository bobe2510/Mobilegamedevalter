// 把 art.js 的點陣資料組裝成一張張動作影格（含左右翻轉版本）。
import { KNIGHT, PANDA, SWORD_FLAT, SLIME, BAT_A, BAT_B, ORC, BOSS, HEART, COIN, POTION, FIREBALL, PORTAL } from './art.js';
import { makeSprite, compose, flip, silhouette } from './pixel.js';

const PW = 46, PH = 44;          // 女騎士影格尺寸（chibi 大頭版，含披風與長劍）
export const PLAYER_W = PW;
export const PLAYER_FOOT = 40;   // 腳底在影格中的 y

function pair(cv) { return { 1: cv, '-1': flip(cv), w: cv.width, h: cv.height }; }

function scaleUp(cv, k) {
  const out = document.createElement('canvas');
  out.width = Math.round(cv.width * k);
  out.height = Math.round(cv.height * k);
  const c = out.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(cv, 0, 0, out.width, out.height);
  return out;
}

export function buildSprites() {
  const K = {};
  for (const key in KNIGHT) K[key] = makeSprite(KNIGHT[key]);

  // 每個影格 = [部位名稱, x, y] 的疊圖順序（後面的畫在上面）
  const F = (parts) => compose(PW, PH, parts.map(([k, x, y]) => ({ img: K[k], x, y })));

  const player = {
    idle0: F([['cape', 6, 16], ['ponytail', 8, 5], ['legStand', 16, 29], ['torso', 15, 16], ['head', 14, 0], ['armIdle', 26, 16]]),
    idle1: F([['cape', 5, 17], ['ponytail', 8, 6], ['legStand', 16, 29], ['torso', 15, 17], ['head', 14, 1], ['armIdle', 26, 17]]),
    blink: F([['cape', 6, 16], ['ponytail', 8, 5], ['legStand', 16, 29], ['torso', 15, 16], ['headBlink', 14, 0], ['armIdle', 26, 16]]),
    run0:  F([['cape', 4, 16], ['ponytail', 7, 4], ['legRunA', 16, 29], ['torso', 15, 16], ['head', 14, 0], ['armIdle', 27, 16]]),
    run1:  F([['cape', 5, 17], ['ponytail', 8, 6], ['legStand', 16, 29], ['torso', 15, 17], ['head', 14, 1], ['armIdle', 26, 17]]),
    run2:  F([['cape', 4, 16], ['ponytail', 7, 4], ['legRunB', 16, 29], ['torso', 15, 16], ['head', 14, 0], ['armIdle', 25, 16]]),
    run3:  F([['cape', 5, 17], ['ponytail', 8, 6], ['legStand', 16, 29], ['torso', 15, 17], ['head', 14, 1], ['armIdle', 26, 17]]),
    jump:  F([['cape', 4, 14], ['ponytail', 7, 3], ['legJump', 16, 29], ['torso', 15, 16], ['head', 14, 0], ['armIdle', 27, 15]]),
    fall:  F([['cape', 5, 17], ['ponytail', 8, 6], ['legJump', 16, 30], ['torso', 15, 17], ['head', 14, 1], ['armIdle', 26, 17]]),
    atk1:  F([['cape', 5, 16], ['ponytail', 8, 5], ['legStand', 16, 29], ['torso', 15, 16], ['head', 14, 0], ['armUp', 24, 0]]),
    atk2:  F([['cape', 4, 17], ['ponytail', 7, 6], ['legRunA', 16, 29], ['torso', 16, 17], ['head', 15, 1], ['armSlash', 14, 21]]),
    atk3:  F([['cape', 5, 17], ['ponytail', 8, 6], ['legStand', 16, 29], ['torso', 15, 17], ['head', 14, 3], ['armDown', 25, 19]]),
    // 倒地哭哭（也用在被熊貓車載走時）
    cry0:  F([['cape', 6, 22], ['ponytail', 8, 12], ['legSit', 16, 31], ['torso', 15, 23], ['headCry', 14, 7], ['armCry', 17, 24]]),
    cry1:  F([['cape', 6, 23], ['ponytail', 8, 13], ['legSit', 16, 31], ['torso', 15, 24], ['headCry', 14, 8], ['armCry', 17, 25]]),
  };

  const S = { player: {}, playerFlash: {} };
  for (const k in player) {
    S.player[k] = pair(player[k]);
    S.playerFlash[k] = pair(silhouette(player[k], '#ffffff'));
  }

  const mk = (rows, k = 1) => {
    const base = makeSprite(rows);
    return pair(k === 1 ? base : scaleUp(base, k));
  };

  S.slime = [mk(SLIME, 1.5)];
  S.bat = [mk(BAT_A, 1.5), mk(BAT_B, 1.5)];
  S.orc = [mk(ORC, 1.5)];
  S.boss = [mk(BOSS, 2.6)];
  S.heart = mk(HEART);
  S.coin = mk(COIN);
  S.potion = mk(POTION);
  S.fireball = mk(FIREBALL);
  S.portal = mk(PORTAL, 2.5);
  S.panda = mk(PANDA, 1.5);
  S.swordFlat = mk(SWORD_FLAT);

  // 敵人受擊閃白版本
  S.flash = {};
  for (const key of ['slime', 'bat', 'orc', 'boss']) {
    S.flash[key] = S[key].map((f) => pair(silhouette(f[1], '#ffffff')));
  }
  return S;
}
