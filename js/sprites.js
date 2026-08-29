// 把 art.js 的點陣資料組裝成一張張動作影格（含左右翻轉版本）。
import { KNIGHT, PANDA, SWORD_FLAT, SLIME, BAT_A, BAT_B, ORC, BOSS, HEART, COIN, POTION, FIREBALL, PORTAL } from './art.js';
import { makeSprite, compose, flip, silhouette } from './pixel.js';

const PW = 30, PH = 28;          // 女騎士影格尺寸（加寬容納披風與長劍）
export const PLAYER_W = PW;
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
    idle0: F([['cape', 4, 11], ['ponytail', 5, 4], ['legStand', 10, 20], ['torso', 9, 11], ['head', 9, 0], ['tailFront', 17, 8], ['armIdle', 17, 11]]),
    idle1: F([['cape', 3, 12], ['ponytail', 5, 5], ['legStand', 10, 20], ['torso', 9, 12], ['head', 9, 1], ['tailFront', 17, 9], ['armIdle', 17, 12]]),
    run0:  F([['cape', 2, 11], ['ponytail', 4, 4], ['legRunA', 10, 20], ['torso', 9, 11], ['head', 9, 0], ['tailFront', 18, 8], ['armIdle', 18, 11]]),
    run1:  F([['cape', 3, 12], ['ponytail', 5, 5], ['legStand', 10, 20], ['torso', 9, 12], ['head', 9, 1], ['tailFront', 17, 9], ['armIdle', 17, 12]]),
    run2:  F([['cape', 2, 11], ['ponytail', 4, 4], ['legRunB', 10, 20], ['torso', 9, 11], ['head', 9, 0], ['tailFront', 16, 8], ['armIdle', 16, 11]]),
    run3:  F([['cape', 3, 12], ['ponytail', 5, 5], ['legStand', 10, 20], ['torso', 9, 12], ['head', 9, 1], ['tailFront', 17, 9], ['armIdle', 17, 12]]),
    jump:  F([['cape', 2, 10], ['ponytail', 4, 3], ['legJump', 10, 20], ['torso', 9, 11], ['head', 9, 0], ['tailFront', 18, 7], ['armIdle', 18, 10]]),
    fall:  F([['cape', 3, 12], ['ponytail', 5, 5], ['legJump', 10, 21], ['torso', 9, 12], ['head', 9, 1], ['tailFront', 17, 9], ['armIdle', 17, 12]]),
    atk1:  F([['cape', 3, 11], ['ponytail', 5, 4], ['legStand', 10, 20], ['torso', 9, 11], ['head', 9, 0], ['tailFront', 17, 8], ['armUp', 15, 0]]),
    atk2:  F([['cape', 2, 12], ['ponytail', 4, 5], ['legRunA', 10, 20], ['torso', 10, 12], ['head', 10, 1], ['tailFront', 18, 9], ['armSlash', 10, 14]]),
    atk3:  F([['cape', 3, 12], ['ponytail', 5, 5], ['legStand', 10, 20], ['torso', 9, 12], ['head', 9, 2], ['tailFront', 17, 10], ['armDown', 16, 13]]),
    // 倒地哭哭（也用在被熊貓車載走時）
    cry0:  F([['cape', 4, 16], ['ponytail', 5, 9], ['legSit', 10, 21], ['torso', 9, 16], ['headCry', 9, 5], ['tailFront', 17, 13], ['armCry', 11, 17]]),
    cry1:  F([['cape', 4, 17], ['ponytail', 5, 10], ['legSit', 10, 21], ['torso', 9, 17], ['headCry', 9, 6], ['tailFront', 17, 14], ['armCry', 11, 18]]),
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
