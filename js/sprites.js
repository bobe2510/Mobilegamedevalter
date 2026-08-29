// 把 art.js 的點陣資料組裝成一張張動作影格（含左右翻轉版本）。
import { KNIGHT, PANDA, SWORD_FLAT, SLIME, BAT_A, BAT_B, ORC, BOSS, HEART, COIN, POTION, FIREBALL, PORTAL } from './art.js';
import { makeSprite, compose, flip, silhouette } from './pixel.js';

const PW = 24, PH = 28;          // 女騎士影格尺寸
export const PLAYER_FOOT = 26;   // 腳底在影格中的 y

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
    idle0: F([['ponytail', 1, 8], ['legStand', 7, 20], ['torso', 6, 13], ['head', 5, 0], ['tailFront', 18, 9], ['armIdle', 14, 13]]),
    idle1: F([['ponytail', 1, 9], ['legStand', 7, 20], ['torso', 6, 14], ['head', 5, 1], ['tailFront', 18, 10], ['armIdle', 14, 14]]),
    run0:  F([['ponytail', 2, 7], ['legRunA', 7, 20], ['torso', 6, 13], ['head', 5, 0], ['tailFront', 18, 8], ['armIdle', 14, 13]]),
    run1:  F([['ponytail', 1, 8], ['legStand', 7, 20], ['torso', 6, 14], ['head', 5, 1], ['tailFront', 18, 9], ['armIdle', 14, 14]]),
    run2:  F([['ponytail', 2, 7], ['legRunB', 7, 20], ['torso', 6, 13], ['head', 5, 0], ['tailFront', 18, 8], ['armIdle', 13, 13]]),
    run3:  F([['ponytail', 1, 8], ['legStand', 7, 20], ['torso', 6, 14], ['head', 5, 1], ['tailFront', 18, 9], ['armIdle', 14, 14]]),
    jump:  F([['ponytail', 2, 6], ['legJump', 7, 20], ['torso', 6, 13], ['head', 5, 0], ['tailFront', 18, 8], ['armIdle', 15, 12]]),
    fall:  F([['ponytail', 1, 9], ['legJump', 7, 21], ['torso', 6, 14], ['head', 5, 1], ['tailFront', 18, 10], ['armIdle', 14, 14]]),
    atk1:  F([['ponytail', 1, 7], ['legStand', 7, 20], ['torso', 6, 13], ['head', 5, 0], ['tailFront', 18, 8], ['armUp', 13, 4]]),
    atk2:  F([['ponytail', 2, 9], ['legRunA', 7, 20], ['torso', 7, 14], ['head', 6, 1], ['tailFront', 19, 10], ['armSlash', 8, 16]]),
    atk3:  F([['ponytail', 1, 9], ['legStand', 7, 20], ['torso', 6, 14], ['head', 5, 2], ['tailFront', 18, 11], ['armDown', 13, 14]]),
    // 倒地哭哭（也用在被熊貓車載走時）
    cry0:  F([['ponytail', 1, 11], ['legSit', 7, 23], ['torso', 6, 16], ['headCry', 5, 4], ['tailFront', 18, 13], ['armCry', 8, 13]]),
    cry1:  F([['ponytail', 1, 12], ['legSit', 7, 23], ['torso', 6, 17], ['headCry', 5, 5], ['tailFront', 18, 14], ['armCry', 8, 14]]),
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

  S.slime = [mk(SLIME)];
  S.bat = [mk(BAT_A), mk(BAT_B)];
  S.orc = [mk(ORC)];
  S.boss = [mk(BOSS, 1.75)];
  S.heart = mk(HEART);
  S.coin = mk(COIN);
  S.potion = mk(POTION);
  S.fireball = mk(FIREBALL);
  S.portal = mk(PORTAL, 2.5);
  S.panda = mk(PANDA);
  S.swordFlat = mk(SWORD_FLAT);

  // 敵人受擊閃白版本
  S.flash = {};
  for (const key of ['slime', 'bat', 'orc', 'boss']) {
    S.flash[key] = S[key].map((f) => pair(silhouette(f[1], '#ffffff')));
  }
  return S;
}
