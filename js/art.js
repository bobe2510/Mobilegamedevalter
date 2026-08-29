// ---------------------------------------------------------------------------
// art.js — 全部素材都是「字元點陣圖」，不需要任何外部圖檔。
// 每個圖形是一組等長字串，字元對應 PAL 調色盤。
// ---------------------------------------------------------------------------

export const PAL = {
  '.': null,
  '0': '#150f22', // 深輪廓
  '1': '#2b2340', // 玩偶黑
  'k': '#241a33', // 眼線 / 嘴
  's': '#ffe0c2', // 膚色
  'S': '#f0b48d', // 膚色陰影
  'q': '#ff9fb0', // 腮紅 / 粉色
  'h': '#fff0a8', // 頭髮亮
  'H': '#f8d05f', // 頭髮
  'y': '#c99a2e', // 頭髮暗
  'a': '#fdfdff', // 盔甲亮
  'A': '#ccd8f0', // 盔甲
  'B': '#7f90b8', // 盔甲暗 / 靴子
  'c': '#ff6b86', // 粉紅裙 / 披風
  'C': '#c23a5c', // 粉紅暗
  'e': '#3f63d8', // 眼睛
  'E': '#7aa8ff', // 眼睛亮部
  'l': '#ffffff', // 高光
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
  'u': '#b57a44', // 皮革 / 木頭亮
  'U': '#6b4326', // 皮革 / 木頭暗
  'r': '#ff5a5a', // 紅光 / 愛心
  'm': '#c3ccd8', // 金屬亮
  'M': '#6d7787', // 金屬暗
  'v': '#4a2f6b', // 魔王甲亮
  'V': '#291645', // 魔王甲暗
  'x': '#f7f1e4', // 骨白 / 玩偶白
  'X': '#dcd2be', // 玩偶白陰影
  'f': '#ff9a3c', // 火亮
  'F': '#ff4d1f', // 火暗
  'i': '#8fd8ff', // 眼淚 / 魔法藍
  'z': '#2de0b0', // 藥水綠
};

// ------------------------- 女騎士（分部位組合） -------------------------
export const KNIGHT = {
  // 頭：14x14，chibi 大頭 + 大眼 + 腮紅
  head: [
    '....HHHHHH....',
    '..HHhhhhhhHH..',
    '.HhhhhhhhhhhH.',
    'HhhgggggggghhH',
    'Hhhhhhhhhhhhyy',
    'Hhhssssssssshy',
    'Hhhskkssskkshy',
    'Hhqseessseeqhy',
    'Hhqslesssleqhy',
    'HhhsEEsssEEshy',
    'Hhhssssksssshy',
    '.Hhsssssssshh.',
    '..HhssssssshH.',
    '.....sss......',
  ],
  // 哭哭臉：>< 閉眼 + 眼淚 + 張嘴
  headCry: [
    '....HHHHHH....',
    '..HHhhhhhhHH..',
    '.HhhhhhhhhhhH.',
    'HhhgggggggghhH',
    'Hhhhhhhhhhhhyy',
    'Hhhssssssssshy',
    'Hhhkssksksskhy',
    'Hhqskkssskkqhy',
    'Hhqsissssisqhy',
    'Hhhsissssisshy',
    'HhhsssCCCssshy',
    '.Hhsssssssshh.',
    '..HhssssssshH.',
    '.....sss......',
  ],
  // 身體：12x8，白甲 + 粉紅心型徽章 + 粉紅裙
  torso: [
    '..aaaaaaaa..',
    '.CaAAAAAAa..',
    'CCaAqqqqAA..',
    'CCaAAqqAAA..',
    'CC.BBBBBB...',
    'CC.cccccc...',
    'C.cccCcccc..',
    '..ccCCccc...',
  ],
  legStand: [
    '..ss..ss..',
    '..ss..ss..',
    '.BBB.BBB..',
    '.BBB.BBB..',
    '.BBB.BBB..',
    'BBBB.BBBB.',
    '..........',
  ],
  legRunA: [
    '..ss.ss...',
    '.sss.sss..',
    '.BB...BB..',
    'BBB...BBB.',
    'BB.....BBB',
    '..........',
    '..........',
  ],
  legRunB: [
    '...ss.ss..',
    '..sss.sss.',
    '..BB...BB.',
    '.BBB...BBB',
    'BBB.....BB',
    '..........',
    '..........',
  ],
  legJump: [
    '..ssss....',
    '.sss.sss..',
    '.BBB..BBB.',
    'BBBB..BBBB',
    '..........',
    '..........',
    '..........',
  ],
  // 坐在地上（哭哭 / 被載走時用）
  legSit: [
    '..ssssss..',
    '.sssssss..',
    '.BBBBBBB..',
    '..BBBBBB..',
    '..........',
    '..........',
    '..........',
  ],
  // 後方大馬尾（綁紅緞帶）
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
  // 前方小馬尾（雙馬尾感）
  tailFront: [
    '.cc.',
    'chhc',
    '.hhH',
    '.hhH',
    '.hHy',
    '.hHy',
    '..Hy',
    '..Hy',
    '..y.',
    '....',
  ],
  armIdle: [
    '.aa.....',
    '.aa.....',
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
  // 哭哭時兩隻小拳頭揉眼睛
  armCry: [
    '.aa..aa.',
    '.ss..ss.',
    '.ss..ss.',
    '........',
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

// ------------------------- 熊貓車（玩偶風熊貓） -------------------------
export const PANDA = [
  '.11........11.',
  '1111......1111',
  '11xx......xx11',
  '.xxxxxxxxxxxx.',
  'xxxxxxxxxxxxxx',
  'xx11xxxxxx11xx',
  'x111xxxxxx111x',
  'x11k1xxxx1k11x',
  'xx11xxxxxx11xx',
  'xxxxx1111xxxxx',
  'xxxxxx11xxxxxx',
  'xxxxx1xx1xxxxx',
  '.xxxxxxxxxxxx.',
  '..XXXXXXXXXX..',
];

// 倒地時掉在旁邊的劍
export const SWORD_FLAT = [
  '..g.........',
  'ggggwwwwwwww',
  'ggggwWWWWWWw',
  '..g.........',
];
