// 把 art.js 的點陣資料組裝成一張張動作影格（含左右翻轉版本）。
import { KNIGHT, SLIME, BAT_A, BAT_B, ORC, BOSS, HEART, COIN, POTION, FIREBALL, PORTAL } from './art.js';
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

  const P = (head, torso, legs, arm, tail) => compose(PW, PH, [
    { img: K.ponytail, x: tail[0], y: tail[1] },
    { img: K[legs.k], x: legs.x, y: legs.y },
    { img: K.torso, x: torso.x, y: torso.y },
    { img: K.head, x: head.x, y: head.y },
    { img: K[arm.k], x: arm.x, y: arm.y },
  ]);

  const player = {
    idle0: P({ x: 5, y: 0 }, { x: 6, y: 10 }, { k: 'legStand', x: 7, y: 18 }, { k: 'armIdle', x: 12, y: 12 }, [1, 7]),
    idle1: P({ x: 5, y: 1 }, { x: 6, y: 11 }, { k: 'legStand', x: 7, y: 18 }, { k: 'armIdle', x: 12, y: 13 }, [1, 8]),
    run0:  P({ x: 5, y: 0 }, { x: 6, y: 10 }, { k: 'legRunA', x: 7, y: 18 }, { k: 'armIdle', x: 13, y: 12 }, [2, 6]),
    run1:  P({ x: 5, y: 1 }, { x: 6, y: 11 }, { k: 'legStand', x: 7, y: 18 }, { k: 'armIdle', x: 12, y: 13 }, [1, 7]),
    run2:  P({ x: 5, y: 0 }, { x: 6, y: 10 }, { k: 'legRunB', x: 7, y: 18 }, { k: 'armIdle', x: 11, y: 12 }, [2, 6]),
    run3:  P({ x: 5, y: 1 }, { x: 6, y: 11 }, { k: 'legStand', x: 7, y: 18 }, { k: 'armIdle', x: 12, y: 13 }, [1, 7]),
    jump:  P({ x: 5, y: 0 }, { x: 6, y: 10 }, { k: 'legJump', x: 7, y: 18 }, { k: 'armIdle', x: 13, y: 11 }, [2, 5]),
    fall:  P({ x: 5, y: 1 }, { x: 6, y: 11 }, { k: 'legJump', x: 7, y: 19 }, { k: 'armIdle', x: 12, y: 13 }, [1, 8]),
    atk1:  P({ x: 5, y: 0 }, { x: 6, y: 10 }, { k: 'legStand', x: 7, y: 18 }, { k: 'armUp', x: 13, y: 0 }, [1, 6]),
    atk2:  P({ x: 6, y: 1 }, { x: 7, y: 11 }, { k: 'legRunA', x: 7, y: 18 }, { k: 'armSlash', x: 8, y: 14 }, [2, 8]),
    atk3:  P({ x: 5, y: 2 }, { x: 6, y: 11 }, { k: 'legStand', x: 7, y: 18 }, { k: 'armDown', x: 12, y: 13 }, [1, 8]),
  };

  const S = { player: {}, playerFlash: {} };
  for (const k in player) {
    S.player[k] = pair(player[k]);
    S.playerFlash[k] = pair(silhouette(player[k], '#ffffff'));
  }

  const mk = (rows, k = 1) => {
    const base = makeSprite(rows);
    const cv = k === 1 ? base : scaleUp(base, k);
    return pair(cv);
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

  // 敵人受擊閃白版本
  S.flash = {};
  for (const key of ['slime', 'bat', 'orc', 'boss']) {
    S.flash[key] = S[key].map((f) => pair(silhouette(f[1], '#ffffff')));
  }
  return S;
}
