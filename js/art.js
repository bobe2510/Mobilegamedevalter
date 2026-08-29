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
  'a': '#fffaf0', // 白金鎧甲（亮）
  'A': '#ded6ea', // 白金鎧甲（陰影）
  'B': '#c6bed8', // 鎧甲深陰影 / 白長靴
  'c': '#e23c4e', // 紅緞帶
  'D': '#a79dc0', // 白色物件的描邊
  'j': '#d63a4a', // 騎士披風
  'J': '#8f1f2c', // 披風陰影
  'C': '#9e2131', // 紅暗 / 哭泣的嘴
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
  head: [
    '....HHHH....',
    '..HhhhhhhH..',
    '.HhhhhhhhhH.',
    '.HggggggggH.',
    'HHhhhhhhhhyy',
    'Hhsssssssshy',
    'Hhkkksskkkhy',
    'Hhslessleshy',
    'HhqEEssEEqhy',
    'HhssssSssshy',
    '.hsssssssshy',
    '..hsssssshy.',
  ],
  headCry: [
    '....HHHH....',
    '..HhhhhhhH..',
    '.HhhhhhhhhH.',
    '.HggggggggH.',
    'HHhhhhhhhhyy',
    'Hhsssssssshy',
    'Hhksssssskhy',
    'Hhskksskkshy',
    'Hhqissssiqhy',
    'HhsisCCCishy',
    '.hsssCCCsshy',
    '..hsssssshy.',
  ],
  torso: [
    '.AA.aaaa.AA.',
    'gaaaaaaaaaag',
    '.gaaaaaaaag.',
    '.gaaaiiaaag.',
    '.aayaiiayaa.',
    '..gaaaaaag..',
    '.ggggyygggg.',
    '.DAaaaaaaAD.',
    'DAaaaaaaaaAD',
    '.gAAgAAgAAg.',
  ],
  legStand: [
    '..ss..ss..',
    '..gg..gg..',
    '..aa..aa..',
    '..aA..aA..',
    '..aA..aA..',
    '.ggg..ggg.',
  ],
  legRunA: [
    '..ss.ss...',
    '.gg...gg..',
    '.aa...aa..',
    '.aA....aA.',
    'aA.....aA.',
    'ggg....ggg',
  ],
  legRunB: [
    '...ss.ss..',
    '...gg..gg.',
    '..aa...aa.',
    '..aA...aA.',
    '..aA....aA',
    '.ggg...ggg',
  ],
  legJump: [
    '..ssss....',
    '.gg..gg...',
    '.aa...aa..',
    'aaA...aaA.',
    'gg.....gg.',
    '..........',
  ],
  legSit: [
    '..ssssss..',
    '.ggggggg..',
    '.aaaaaaa..',
    '.aaaaaA...',
    '..ggggg...',
    '..........',
  ],
  cape: [
    '..JJJ.',
    '.Jjjj.',
    '.JjjjJ',
    'JJjjjJ',
    'JjjjjJ',
    'JjjjjJ',
    'JjjjjJ',
    'JjjjJJ',
    'JjjjJ.',
    'JjjjJ.',
    'JJjjJ.',
    '.JjjJ.',
    '.JJj..',
    '..JJ..',
    '..J...',
  ],
  ponytail: [
    '.ccc.',
    'chhhc',
    'HhhhH',
    'HhhhH',
    'yhhhH',
    'yhhH.',
    'yhhH.',
    '.yhH.',
    '.yhH.',
    '..yH.',
    '..y..',
  ],
  tailFront: [
    '.cc.',
    'chhc',
    '.hhH',
    '.hhH',
    '.hHy',
    '.hHy',
    '.hHy',
    '..Hy',
    '..Hy',
    '..y.',
    '..y.',
    '....',
  ],
  armIdle: [
    '.AA......',
    '.aa......',
    '..ss.....',
    '...e.....',
    '.ggggg...',
    '...e.....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...w.....',
  ],
  armUp: [
    '...w.....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '...wW....',
    '.ggggg...',
    '...e.....',
    '...ss....',
    '..aas....',
    '.AA......',
  ],
  armSlash: [
    '............wwwwwwww',
    'AAasggwwwwwwwwwwwwww',
    '...sggWWWWWWwwwwwwww',
    '..........wwwwwwww..',
  ],
  armDown: [
    '.AA..........',
    '.ss..........',
    '.ggg.........',
    '..gww........',
    '....wW.......',
    '.....wW......',
    '......wW.....',
    '.......wW....',
    '........wW...',
    '.........wW..',
    '..........ww.',
    '...........w.',
  ],
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
