// ---------------------------------------------------------------------------
// 劇本資料 — 開場 / 中段對話 / 結局，全部餵給 js/cutscene.js 播放。
//
// 一句 = { cg?, who?, name?, text, black?, center?, hold? }
// 只有 cg 有值的那句會換圖，之後的句子沿用同一張。
// 圖片是延遲載入的，所以在這裡加場景不會拖慢首次開啟。
//
// 分鏡出處：assets/story/cutscenes.md（小公主篇）、assets/story/ending.md（大結局）
// ---------------------------------------------------------------------------

const CG = (who, name) => `assets/story/cg/${who}/${name}.jpg`;

// 旁白（不畫名牌）
const n = (text, extra) => ({ text, ...extra });
// 有人說話
const say = (who, text, extra) => ({ who, text, ...extra });
// 黑底一行卡：自動停留，不用點
const card = (text, hold = 150) => ({ text, black: true, center: true, hold });

// ------------------------------ 小公主篇 ------------------------------
const KNIGHT_OPEN = [
  n('小時候，我看過一個背影。', { cg: CG('knight', 'open-1') }),
  n('紅色的披風，還有一把比我還高的大劍。'),
  say('knight', '……好帥。'),
  n('那天起我就決定了——我也要當騎士。'),

  n('而在王宮的另一頭。', { cg: CG('knight', 'open-2') }),
  say('mage', '陛下放心。她想出去，就讓她出去。', { expr: 'normal' }),
  say('mage', '只是……得有人跟著。'),
  n('她把自己的人格複製了一份，放進一隻東方來的熊貓玩偶裡。'),
  say('mage', '去吧。好好保護那個笨蛋。', { expr: 'soft' }),

  n('王宮花園，天還沒亮。', { cg: CG('knight', 'open-3') }),
  say('panda', '仁慈的騎士啊——能否聽聽您忠誠臣民的困擾？'),
  say('knight', '……這是什麼？'),
  say('knight', '玩偶……熊？為什麼玩偶熊會講話？'),
  say('knight', '怎麼辦，是陷阱嗎……？'),
  say('knight', '可是這個，超可愛的。'),
  say('knight', '……還是聽一下好了。'),
  n('——小公主的騎士修行，就這樣開始了。'),
];

const KNIGHT_END = [
  say('knight', '呼……贏、贏了……', { cg: CG('knight', 'end-1') }),
  say('panda', '騎士大人，您剛才把劍握反了三次。'),
  say('knight', '別說出來啦！'),
  n('角落裡，頭上腫著一個包的闇騎士，悄悄鬆了一口氣。'),

  n('回程的路上——', { cg: CG('knight', 'end-2') }),
  { name: '村民', text: '請、請等一下！騎士大人！' },
  say('panda', '（不對。這個委託不在劇本裡。）'),

  say('knight', '交給我吧！我可是騎士！', { cg: CG('knight', 'end-3') }),
  say('panda', '等一下等一下等一下——'),
  n('熊貓用盡全身力氣拉著她。但剛嘗到勝利滋味的小公主，已經停不下來了。'),

  card('—— 小公主篇 · 完 ——', 130),
  card('接下來，是把她找回來的人的故事。', 170),
];

// ------------------------------ 魔法大臣篇 ------------------------------
const MAGE_OPEN = [
  n('冒險照理說已經結束了。', { cg: CG('mage', 'open-1') }),
  say('mage', '……斷了。', { expr: 'worried' }),
  say('mage', '熊貓還在動，但我連不上它。', { expr: 'worried' }),

  say('mage', '早知道就不管她說什麼，直接跟去了。', { cg: CG('mage', 'open-2'), expr: 'scold' }),
  say('mage', '「被天才跟著就沒有挑戰性」——那種話，虧她說得出口。', { expr: 'speechless' }),

  say('mage', '等我，笨蛋。', { cg: CG('mage', 'open-3'), expr: 'serious' }),
];

const MAGE_END = [
  say('knight', '……大臣？', { cg: CG('mage', 'end-1') }),
  say('mage', '妳這個笨蛋。', { expr: 'scold' }),
  n('狼狽歸狼狽，人是全的。這樣就夠了。'),

  n('就在這時，地在震。', { cg: CG('mage', 'end-2') }),
  say('mage', '……這個規模，不是我們兩個能處理的。', { expr: 'serious' }),
  say('mage', '得把信送回去。', { expr: 'serious' }),

  n('求救的信，送到了帝國首席騎士團長的手上。', { cg: CG('mage', 'end-3') }),
  card('—— 魔法大臣篇 · 完 ——', 130),
];

// ------------------------------ 長公主篇 ------------------------------
const ELDER_OPEN = [
  // 回收小公主開場第一張的構圖：同樣的姿勢，這次看得到臉——紅瞳
  n('妳說，妳看過一個背影。', { cg: CG('elder', 'open-1') }),
  say('elder', '那是我。', { expr: 'normal' }),

  say('elder', '……所以，兩個都沒回來。', { cg: CG('elder', 'open-2'), expr: 'cold' }),
  say('elder', '而你們，是現在才來告訴我的。', { expr: 'cold' }),
  n('那天王宮裡，沒有人敢抬頭。'),

  say('elder', '不用準備部隊。', { cg: CG('elder', 'open-3'), expr: 'normal' }),
  say('elder', '我一個人比較快。', { expr: 'smug' }),
];

// 大結局〈兩個笨蛋〉—— 分鏡見 assets/story/ending.md
const ELDER_END = [
  n('戰場靜了下來。她開始找人。', { cg: CG('elder', 'end-1') }),
  n('四下無人，只有風聲。然後，草叢裡傳來對話——'),
  say('knight', '不好，想溜出去結果披風被勾到了', { name: '草叢裡的聲音' }),
  say('mage', '誰叫你沒事穿披風啊笨蛋', { name: '草叢裡的另一個聲音', expr: 'scold' }),
  n('長公主低頭，看了看自己的披風。'),
  n('……'),

  n('她走向草叢，一手一個，把兩小隻拎了起來。', { cg: CG('elder', 'end-2') }),
  say('mage', '隊長姐姐我不是說你', { expr: 'sly' }),
  say('knight', '姐、姐姐大人，怎麼會在這裡'),
  n('兩個讓她擔心得要命的人，都平安無事。她的眼眶熱了一下——'),
  say('elder', '……', { expr: 'tearful' }),

  n('……隨即，一人一記暴栗。', { cg: CG('elder', 'end-3') }),
  say('elder', '兩個笨蛋', { expr: 'scold' }),
  n('兩人痛得蹲了下來。'),

  n('這時旁邊的草叢又鑽出熊貓娃娃，歪著頭，好奇地看著她。', { cg: CG('elder', 'end-4') }),
  n('長公主看著這隻娃娃……臉一紅。隨即板起臉：'),
  say('elder', '作為懲罰，這個沒收一個月', { expr: 'blush' }),

  card('回城之後，這次事件的所有參與人——包含小公主與魔法大臣本人——都被長公主狠狠地懲罰了一頓。', 220),
  card('—— 一個月後 ——', 130),

  n('熊貓娃娃晃晃悠悠地走出長公主的房間。眼神完全放空、茫然。', { cg: CG('elder', 'end-5') }),
  n('小公主跑過去把它抱起來，聞了聞，然後哭了出來：'),
  say('knight', '都是姐姐的味道……回不去了'),

  n('魔法大臣把熊貓這一個月的記憶同步回自己身上。', { cg: CG('elder', 'end-6') }),
  n('然後緩緩走到牆角，蹲下。'),
  say('mage', '完了，我不純潔了，嫁不出去了', { expr: 'flustered' }),

  card('—— 全劇終 ——', 200),
];

// ------------------------------ 中段對話（洛克人式） ------------------------------
// key = 關卡編號；在該關開始前播。魔王關前的那段是重點。
const MID = {
  knight: {
    3: [
      say('boss', '止步。這裡不是公主該來的地方。', { name: '闇騎士' }),
      say('knight', '我不是公主。我是騎士！'),
      say('panda', '（……那個聲音，好像在哪裡聽過。）'),
      say('boss', '……那就證明給我看。', { name: '闇騎士' }),
    ],
  },
  mage: {
    3: [
      n('村民口中「一點小麻煩」，是這個東西。'),
      say('mage', '……半隻野雞，半條蛇。', { expr: 'serious' }),
      say('mage', '蛇面吐魔導彈，雞面會撲上來。'),
      say('mage', '看清楚它轉向哪一面——不然就死。'),
    ],
  },
  elder: {
    3: [
      n('千年才醒一次的東西，這次醒得不是時候。'),
      say('elder', '讓開。', { expr: 'fury' }),
      say('elder', '我妹妹在後面。', { expr: 'fury' }),
    ],
  },
};

export const STORY = {
  knight: { open: KNIGHT_OPEN, end: KNIGHT_END, mid: MID.knight },
  mage: { open: MAGE_OPEN, end: MAGE_END, mid: MID.mage },
  elder: { open: ELDER_OPEN, end: ELDER_END, mid: MID.elder },
};

// kind: 'open' | 'end'
export function scriptFor(charKey, kind) {
  const s = STORY[charKey];
  return (s && s[kind]) || null;
}

export function midFor(charKey, stageN) {
  const s = STORY[charKey];
  return (s && s.mid && s.mid[stageN]) || null;
}

// 這個角色的劇本一共會用到哪些 CG（給文件與檢查用）
export function cgList(charKey) {
  const out = [];
  for (const kind of ['open', 'end']) {
    for (const l of scriptFor(charKey, kind) || []) if (l.cg && !out.includes(l.cg)) out.push(l.cg);
  }
  return out;
}
