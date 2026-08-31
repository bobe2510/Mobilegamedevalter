# 小公主 · Grok Prompt 包（可直接複製）

**每一張都要附上參考圖** [`knight/REFERENCE.png`](knight/REFERENCE.png)
（正面／斜前／側面／背面，已經是定案的服裝與白披風）。

順序建議：**A → B → C → D → 立繪**。A 是最急的，走路的問題就是它。

---

## 0. 服裝定案：以遊戲 sprite 為準

現有封面跟 sprite 其實是**兩套不同的衣服**：

| 部位 | 舊封面立繪 | 遊戲 sprite | 定案 |
|---|---|---|---|
| **肩甲** | 沒有（布質泡泡袖） | **有，圓形白金肩甲** | ✅ **有肩甲** |
| **胸口寶石** | 沒有 | **有，金框藍寶石** | ✅ **有** |
| 腰帶 | 兩顆藍寶石嵌在腰帶上 | 圓形金扣，中央一顆藍寶石 | ✅ 圓形金扣 |
| 袖子 | 長袖 + 手套到手肘 | 短泡泡袖 + 白手套 | ✅ 短袖 |
| 裙子 | 長版，金色藤蔓刺繡 | 短裙 + 金色 V 字滾邊 | ✅ 短裙 |
| 披風 | 白（金藤蔓） | 已改成白 | ✅ 白 + 金邊 |
| 髮飾緞帶 | 紅 | 紅 | ✅ 紅 |

理由：她的主題是**騎士**，肩甲和胸口寶石是騎士感的來源；而且 sprite 是玩家看最久的東西。
所以要重產的是**立繪**，不是動作圖。

---

## 1. 共用段落（每張都貼在最前面）

### 風格段

```
Chibi pixel-art game sprite, 2.5-heads-tall proportions, clean thick outlines,
rich shading with a limited palette — the look of a high-resolution SNES/PS1
JRPG character sprite. Crisp pixels, no anti-aliased blur, no painterly rendering.
Same character, same outfit, same colors and the same scale as the attached
reference image.
```

### 角色設定段

```
Character: a young princess-knight girl, cheerful and a bit reckless.
- Hair: golden-blonde, HIGH PONYTAIL tied with a RED ribbon (keep the ribbon
  RED), short fringe, two short side locks
- Eyes: large BLUE eyes
- Head: small GOLD tiara with a BLUE gem
- Shoulders: rounded WHITE-and-GOLD armored pauldrons on both shoulders
- Chest: a BLUE GEM in a gold setting at the collar of her white breastplate
- Body: WHITE dress-armor with GOLD trim, SHORT puffed sleeves, white gloves
- Belt: a round GOLD buckle with a BLUE gem in the centre
- Skirt: SHORT white layered skirt with a gold V-shaped hem trim
- Legs: WHITE thigh-high stockings, WHITE-and-GOLD armored boots
- Cape: a WHITE cape with a GOLD edge, hanging from both shoulders.
  Warm ivory white, shaded so it reads as a separate layer over the armor.
- Weapon: a straight one-handed longsword — pale blue steel blade,
  GOLD cross-guard, blue grip
```

### 技術要求段

```
TECHNICAL REQUIREMENTS — follow these exactly:
- Background: PURE GREEN (#00FF00), completely flat. No gradient, no shadow,
  no ground line, no floor, no vignette.
- Layout: ONE horizontal row of poses, evenly spaced, left to right,
  in the exact order listed below.
- Leave a WIDE, CLEARLY VISIBLE GREEN GAP between every pair of figures.
  Nothing may cross into a neighbour's space — not the cape, not the sword tip,
  not a strand of hair. This is the single most important rule.
- All figures at EXACTLY the same scale, same head size, same body proportions.
- All figures FACING RIGHT (the viewer's right), strict side view.
- Every figure standing on the ground shares the same horizontal foot line.
- Identical outfit, colors and accessories in every pose.
- No text, no labels, no numbers, no panel borders, no grid lines.
- No motion blur, no speed lines, no glow, no sparks, no particles,
  no slash effects — effects are added by the game engine.
```

---

## 2. Sheet A — 跑步循環（5 格）⭐ 最優先

> 現在的「走路」只有兩格，而且**兩格的腳距都是 124 px**——同一個步態相位，
> 沒有雙腳交會的那一格，所以看起來像在地上滑。這張就是解方。

```
Poses, left to right:

1. IDLE — standing at rest, weight on both feet, sword lowered at her side,
   calm face. This pose is the size reference for the whole sheet.

2. RUN CONTACT A — running: her RIGHT leg is forward with the heel just
   striking the ground, left leg extended far behind, torso leaning forward,
   arms swinging in opposition. Feet are FAR APART.

3. RUN PASS A — running: BOTH FEET OFF THE GROUND, the rear leg swinging
   through directly underneath her body so the legs are CLOSE TOGETHER,
   body at the HIGHEST point of the stride.

4. RUN CONTACT B — running: her LEFT leg is forward with the heel just
   striking the ground, right leg extended far behind. Feet FAR APART,
   the opposite arm swing to pose 2.

5. RUN PASS B — running: BOTH FEET OFF THE GROUND again, legs CLOSE TOGETHER
   under the body, the opposite arm swing to pose 3.

The two PASS poses must be clearly different from the two CONTACT poses:
in CONTACT the feet are far apart and the body is LOW, in PASS the legs are
together and the body is HIGH. That contrast is what makes the run read.
```

---

## 3. Sheet B — 空中與落地（5 格）

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. JUMP — just after take-off, rising: both knees pulled up toward the chest,
   arms up, cape streaming downward.
3. APEX — the top of the jump: body upright, legs slightly apart and relaxed,
   cape spread out around her.
4. FALL — descending: legs reaching down toward the ground, arms slightly out
   for balance, cape and hair streaming upward.
5. LAND — the instant of landing: deep knee bend, free hand near the ground,
   head low, cape settling downward.
```

---

## 4. Sheet C — 三段連擊 前段（4 格）

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. WIND-UP — anticipation: sword raised high overhead and drawn back behind
   her, body coiled, back foot planted, weight on the back leg.
3. SLASH 1 — the first cut: a diagonal downward slash, the sword sweeping
   down and forward, front foot stepping in.
4. SLASH 2 — the second cut: a horizontal slash across the body from the
   opposite side, torso rotated, ponytail and cape trailing the motion.
```

---

## 5. Sheet D — 重斬與旋風斬（4 格）

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. SLASH 3 — the heavy finishing blow: a full-body lunging strike, the sword
   driven far forward, front leg deep and bent, back leg fully extended,
   her whole body committed to the blow.
3. SPIN WIND-UP — crouched low, the sword drawn back across her body in both
   hands, shoulders turned, about to spin.
4. SPIN — mid-spin: the sword swept all the way around at waist height,
   ponytail and cape whipped out horizontally by the rotation.
```

---

## 6. 新立繪（直式封面 `cover.jpg`）

**這張換掉現有的封面**，因為現有的沒有肩甲和胸口寶石。

```
[貼上「角色設定段」]

Style: Japanese anime light-novel cover illustration, official key visual
quality, crisp cel shading, vivid saturated colors, clean line art,
highly detailed. NOT pixel art.
The outfit must match the attached pixel-art reference exactly — the shoulder
pauldrons, the blue gem at the collar, the round gold belt buckle, the short
puffed sleeves and the short layered skirt are all required.

Full-body heroic key visual: she stands proudly on a grassy hilltop at sunrise,
her longsword planted point-down into the ground with both hands resting on the
pommel, white cape billowing in the wind, chin slightly raised with a calm,
dignified, confident expression. Behind her, a fantasy landscape of distant
blue mountains and a white castle, dramatic golden rim lighting, cinematic
light rays, floating glowing particles.

Composition: vertical 3:4 portrait. The character fills the middle of the
frame, her head near the upper third. Keep the bottom 30% of the image simple
and mostly empty (just grass and sky) — UI will be placed there.

No text, no letters, no logo, no watermark, no signature, no border frame.
```

## 7. 新立繪（橫式封面 `cover-wide.jpg`）

```
[貼上「角色設定段」]
[附上剛產好的 cover.jpg，加一句：same character as the attached image]

Style: Japanese anime light-novel cover illustration, official key visual
quality, crisp cel shading, vivid saturated colors, clean line art,
highly detailed, dramatic golden rim lighting. NOT pixel art.

Full-body heroic key visual, horizontal composition: she stands on the RIGHT
third of the frame, resting her longsword on her shoulder, white cape sweeping
to the side, looking toward the camera with a confident smile. The LEFT half
of the image is an open fantasy landscape — sunrise sky, distant mountains,
a castle silhouette — kept simple and uncluttered.

Composition: horizontal 16:9. Character on the right, empty sky and landscape
on the left (that space is reserved for the title UI).

No text, no letters, no logo, no watermark, no signature, no border frame.
```

---

## 8. 額度還有剩的話

依序：
1. **半身立繪**（對話用，透明背景或純色背景，約 400 px 高，表情：普通／激動／哭）
2. **開場 CG `knight/open-1.jpg`**（憧憬的回憶：**紅披風大劍的女騎士背影**，
   規格見 [`../story/cutscenes.md`](../story/cutscenes.md)）
3. 魔法大臣的 Sheet A

---

## 9. 產完給我，我會做

1. 去背合併：`python3 tools/build_character.py knight`
2. 驗證每一格沒有被切到
3. 把跑步接成 4 格循環 + 加上身體上下浮動，落地緩衝接進狀態機
4. 三段連擊拆成蓄力／命中，旋風斬換成專用的兩格
5. 換掉封面
