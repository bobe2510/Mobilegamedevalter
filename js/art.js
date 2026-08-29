// ---------------------------------------------------------------------------
// art.js — 全部素材都是「字元點陣圖」，不需要任何外部圖檔。
// 每個圖形是一組等長字串，字元對應 PAL 調色盤。
// ---------------------------------------------------------------------------

export const PAL = {
  '.': null,
  '0': '#150f22', // 深輪廓
  '1': '#2b2340',
  's': '#ffd9b0', // 膚色
  'S': '#e0a67c', // 膚色陰影
  'h': '#ffe98a', // 頭髮亮
  'H': '#eec14a', // 頭髮
  'y': '#b8842a', // 頭髮暗
  'a': '#f0f5ff', // 盔甲亮
  'A': '#aebfdb', // 盔甲
  'B': '#5f7096', // 盔甲暗 / 靴子
  'c': '#e2465c', // 紅裙 / 披風
  'C': '#8f2036', // 紅暗
  'e': '#3550c8', // 眼睛
  'w': '#f4faff', // 劍刃
  'W': '#a5bccf', // 劍刃陰影
  'g': '#ffcc4d', // 金
  'n': '#8fe39b', // 史萊姆亮
  'N': '#43a35c', // 史萊姆
  'd': '#1f6b3a', // 史萊姆暗
  'p': '#a878e0', // 蝙蝠亮
  'P': '#6b40a8', // 蝙蝠暗
  'o': '#93c85e', // 哥布林皮膚
  'O': '#5b8c34', // 哥布林皮膚暗
  'u': '#b57a44', // 皮革亮
  'U': '#6b4326', // 皮革暗
  'r': '#ff5a5a', // 紅光 / 愛心
  'm': '#c3ccd8', // 金屬亮
  'M': '#6d7787', // 金屬暗
  'v': '#4a2f6b', // 魔王甲亮
  'V': '#291645', // 魔王甲暗
  'x': '#f2e8d0', // 骨白
  'f': '#ff9a3c', // 火亮
  'F': '#ff4d1f', // 火暗
  'i': '#7fe3ff', // 魔法藍
  'z': '#2de0b0', // 藥水綠
};

// ------------------------- 女騎士（分部位組合） -------------------------
export const KNIGHT = {
  ponytail: [
    '.ccc..',
    'cHhhc.',
    '.HhhH.',
    'HhhhH.',
    'HhhH..',
    'HhhH..',
    'yhhH..',
    'yhhH..',
    '.yhH..',
    '.yhH..',
    '.yyH..',
    '..yH..',
    '..y...',
    '......',
  ],
  head: [
    '....HHHH....',
    '..HHhhhhHH..',
    '.HhhhhhhhhH.',
    '.HhgggggghH.',
    '.HhssssssHy.',
    '.Hhsesesshy.',
    '.HhssssssSy.',
    '..hssssSsy..',
    '..HhssssH...',
    '...HssSH....',
    '....sss.....',
    '....SSS.....',
  ],
  torso: [
    '..aaaaaa....',
    '.CaAAAAAa...',
    'CCaAaggAA...',
    'CCaAAggAA...',
    'CCaAAAAAA...',
    'CC.BBBBB....',
    'CC.ccccc....',
    'C..ccCccc...',
    '...cCCcc....',
  ],
  legStand: [
    '..ss..ss..',
    '..ss..ss..',
    '..ss..ss..',
    '..BB..BB..',
    '..BB..BB..',
    '..BB..BB..',
    '.BBB.BBB..',
    '..........',
  ],
  legRunA: [
    '..ss.ss...',
    '.ss..ss...',
    '.ss...ss..',
    '.BB...BB..',
    'BB.....BB.',
    'BBB...BBB.',
    '..........',
    '..........',
  ],
  legRunB: [
    '...ss.ss..',
    '...ss..ss.',
    '..ss...ss.',
    '..BB...BB.',
    '.BB.....BB',
    '.BBB...BBB',
    '..........',
    '..........',
  ],
  legJump: [
    '..ssss....',
    '.ss..ss...',
    '.BB...BB..',
    'BBB...BBB.',
    '..........',
    '..........',
    '..........',
    '..........',
  ],
  // 手臂 + 劍（各姿勢自帶尺寸，組合時用偏移量對齊肩膀）
  armIdle: [
    '.aa.....',
    '.aa.....',
    '.ss.....',
    '.ss.....',
    '.gg.....',
    'ggggg...',
    '..ww....',
    '..wW....',
    '..ww....',
    '..wW....',
    '..ww....',
    '..wW....',
    '...w....',
    '........',
  ],
  armUp: [
    '...ww...',
    '...wW...',
    '...ww...',
    '...wW...',
    '...ww...',
    '...wW...',
    '...ww...',
    '..ggggg.',
    '...ss...',
    '..aass..',
    '..aa....',
    '........',
  ],
  armSlash: [
    '................',
    'aassggwwwwwwww..',
    '..s.ggWWwwwwwwww',
    '................',
  ],
  armDown: [
    '.aa.......',
    '.ss.......',
    '.ggg......',
    '..gww.....',
    '...ww.....',
    '....ww....',
    '.....ww...',
    '......ww..',
    '.......ww.',
    '........w.',
  ],
};

// ------------------------------- 敵人 -------------------------------
export const SLIME = [
  '....nnnn....',
  '..nnnnnnnn..',
  '.nnnnnnnnnn.',
  '.nn0nnn0nnn.',
  'nnnnnnnnnnnn',
  'nnnnnnnnnnnn',
  'nNNNNNNNNNNn',
  '.NNNNNNNNNN.',
  '..dddddddd..',
  '............',
];

export const BAT_A = [
  'PP..........PP',
  'PPP...pp...PPP',
  '.PPppppppppPP.',
  '..pp0pppp0pp..',
  '...pppppppp...',
  '....pp..pp....',
  '..............',
  '..............',
];

export const BAT_B = [
  '..............',
  '......pp......',
  '.PPpppppppppP.',
  '.PPp0pppp0pPP.',
  'PP.pppppppp.PP',
  'PP..pp..pp..PP',
  '..............',
  '..............',
];

export const ORC = [
  '...OOOOOO.....',
  '..OoooooooO...',
  '..Oo0ooo0oO...',
  '..Ooxxxxxxo...',
  '...OoooooO....',
  '..uuUUUUuu....',
  '.uUUuuuuUUu...',
  'oo.UUuuUU.oo..',
  'oo.UuuuuU.oo..',
  '.o..uuuu..o...',
  '....oooo......',
  '...oo..oo.....',
  '...oo..oo.....',
  '..UUU..UUU....',
  '.UUUU.UUUU....',
  '..............',
];

export const BOSS = [
  '...x................x...',
  '...xx..............xx...',
  '...xxx....MMMM....xxx...',
  '....xxx..MMmmMM..xxx....',
  '.....xxxMMmmmmMMxxx.....',
  '......MMMmmmmmmMMM......',
  '.....MMmmmmmmmmmmMM.....',
  '.....Mm0rr0mm0rr0mM.....',
  '.....MmmmmmmmmmmmmM.....',
  '......MMmmxxxxmmMM......',
  '.......MMmmmmmmMM.......',
  '....vvvVVMMMMMMVVvvv....',
  '...vvvVVvvmmmmvvVVvvv...',
  '..vvVVvvvvmmmmvvvvVVvv..',
  '..vVVvvvvvmrrmvvvvvVVv..',
  '..vVvvvvvvmmmmvvvvvvVv..',
  '...vvvvvvvvvvvvvvvvvv...',
  '....VVvvvvvvvvvvvvVV....',
  '.....VVvvvvvvvvvvVV.....',
  '......VVVvvvvvvVVV......',
  '.......VVvvvvvvVV.......',
  '......vvvv..vvvv........',
  '......vvvv..vvvv........',
  '......VVVV..VVVV........',
  '.....VVVV....VVVV.......',
  '....VVVVV....VVVVV......',
  '........................',
  '........................',
];

// ------------------------------- 道具 -------------------------------
export const HEART = [
  '.rr.rr.',
  'rrrrrrr',
  'rrrrrrr',
  '.rrrrr.',
  '..rrr..',
  '...r...',
  '.......',
];

export const COIN = [
  '..ggg..',
  '.ggggg.',
  'ggghggg',
  'ggghggg',
  'ggggggg',
  '.ggggg.',
  '..ggg..',
];

export const POTION = [
  '..mmm..',
  '..mmm..',
  '.mzzzm.',
  'mzzzzzm',
  'mzzhzzm',
  'mzzzzzm',
  '.mzzzm.',
];

export const FIREBALL = [
  '..FF..',
  '.FffF.',
  'FffffF',
  'FffffF',
  '.FffF.',
  '..FF..',
];

export const PORTAL = [
  '..iiii..',
  '.iwwwwi.',
  'iwwiiwwi',
  'iwiiiiwi',
  'iwiiiiwi',
  'iwwiiwwi',
  '.iwwwwi.',
  '..iiii..',
];
