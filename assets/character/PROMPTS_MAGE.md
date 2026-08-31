# 魔法大臣 · Grok Prompt 包（可直接複製）

**每一張都附上參考圖** [`mage/REFERENCE.png`](mage/REFERENCE.png)。
圖的右邊用紅框標出了**要補的小熊貓子機**——現在的 sprite 上沒有，
但劇情要用（她拿它像拿手機一樣聯絡失聯的熊貓）。

順序：**A → B → C → D → E**。A 最優先。小公主那批用同一套規格做出來
頭身比變異 **0%**，所以下面的東西一個字都不要改。

---

## 1. 共用段落（每張都貼在最前面）

### 風格 + 比例

```
Chibi pixel-art game sprite. PROPORTIONS ARE CRITICAL: the character is
EXACTLY 2 HEADS TALL — her head, measured from the top of the hair to the
chin, is 50% of her total standing height. This ratio must be IDENTICAL in
every pose and identical to the attached reference image. Do not make her
slimmer, taller or more realistic in the action poses.
Clean thick outlines, rich shading with a limited palette — the look of a
high-resolution SNES/PS1 JRPG character sprite. Crisp pixels, no anti-aliased
blur, no painterly rendering.
Same character, same outfit, same colors, same proportions and the same
scale as the attached reference image.
```

> 帽子不算在頭高裡。頭高是**髮際到下巴**，尖帽是額外往上長的。

### 角色設定

```
Character: a young court mage, calm and deadpan, the little princess's
best friend. A prodigy who became a minister of state the year she came of age.
- Hair: LONG BLACK straight hair, past the waist, parted so it frames her face
- Eyes: large BLUE eyes, level and unimpressed
- Hat: tall pointed DARK-BLUE witch hat with a dark band and a GOLD square buckle
- Body: DARK-BLUE hooded robe-cape with GOLD trim, worn over a WHITE blouse
  with long white sleeves and a white bodice; brown belt with a gold buckle;
  short dark-blue skirt with a gold hem
- Legs: BLACK leggings, BLUE ankle boots with gold trim
- Weapon: a WOODEN staff, held in one hand, topped with a large BLUE crystal
- REQUIRED ACCESSORY: a SMALL SITTING PANDA PLUSH about the size of her hand —
  white face and belly, black ears, arms and legs, wearing a BLUE BOW at its
  neck — hanging from the shaft of her staff at chest height on a short cord.
  It is her remote link to the panda guarding the princess.
  IT MUST BE CLEARLY VISIBLE IN EVERY SINGLE POSE. See the red box in the
  attached reference image.
```

### 技術要求

```
TECHNICAL REQUIREMENTS — follow these exactly:
- Background: PURE GREEN (#00FF00), completely flat. No gradient, no shadow,
  no ground line, no floor, no vignette.
- Layout: ONE horizontal row of poses, evenly spaced, left to right,
  in the exact order listed below.
- Leave a WIDE, CLEARLY VISIBLE GREEN GAP between every pair of figures.
  Nothing may cross into a neighbour's space — not the robe, not the staff,
  not a strand of hair. This is the single most important rule.
- All figures at EXACTLY the same scale, same head size, same body proportions.
- All figures FACING RIGHT (the viewer's right), strict side view.
- Every figure standing on the ground shares the same horizontal foot line.
- Identical outfit, colors and accessories in every pose.
- No text, no labels, no numbers, no panel borders, no grid lines.
- No motion blur, no speed lines, no glow, no sparks, no particles,
  no magic effects, no projectiles — effects are added by the game engine.
```

> 最後一條對大臣特別重要：**不要畫魔法飛彈**。飛彈是程式射出來的，
> 畫在圖上會變成她手上永遠掛著一顆球。

---

## 2. A · 跑步循環（5 格）⭐ 最優先

```
Poses, left to right:

1. IDLE — standing at rest, weight on both feet, staff held upright in one
   hand beside her, calm deadpan face. This pose is the size reference for
   the whole sheet.

2. RUN CONTACT A — running: her RIGHT leg is forward with the heel just
   striking the ground, left leg extended far behind, torso leaning forward,
   the staff carried angled back in one hand. Feet are FAR APART.

3. RUN PASS A — running: BOTH FEET OFF THE GROUND, the rear leg swinging
   through directly underneath her body so the legs are CLOSE TOGETHER,
   body at the HIGHEST point of the stride, robe and long hair lifted.

4. RUN CONTACT B — running: her LEFT leg is forward with the heel just
   striking the ground, right leg extended far behind. Feet FAR APART.

5. RUN PASS B — running: BOTH FEET OFF THE GROUND again, legs CLOSE TOGETHER
   under the body, opposite arm swing to pose 3.

The two PASS poses must be clearly different from the two CONTACT poses:
in CONTACT the feet are far apart and the body is LOW, in PASS the legs are
together and the body is HIGH. That contrast is what makes the run read.
The small panda plush swings on the staff in the running poses.
```

## 3. B · 空中與落地（5 格）

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. JUMP — just after take-off, rising: both knees pulled up toward the chest,
   staff arm raised, robe and hair streaming downward.
3. APEX — the top of the jump: body upright, legs slightly apart and relaxed,
   robe spread out around her.
4. FALL — descending: legs reaching down toward the ground, free arm out for
   balance, robe and hair streaming upward.
5. LAND — the instant of landing: deep knee bend, the staff planted on the
   ground taking her weight, head low, robe settling.
```

## 4. C · 揮杖射擊（4 格）

> 她的普通攻擊是**揮杖射出魔法飛彈**，三段連擊。飛彈不要畫。

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. WIND-UP — anticipation: she draws the staff back over her shoulder with
   both hands, weight on the back leg, body coiled, eyes forward.
3. CAST 1 — the first strike: she swings the staff forward and down in a
   sharp arc, the crystal thrust ahead of her, front foot stepping in.
4. CAST 2 — the second strike: a horizontal sweep of the staff across her
   body from the opposite side, torso rotated, hair and robe trailing.
   Her free hand is thrown out.

Do NOT draw any projectile, glow, spark or magic circle — only the girl
and the staff.
```

## 5. D · 重擊與齊射大招（4 格）

> 大招是**站定詠唱，射出七發扇形飛彈**，腳下有魔法陣。魔法陣也是程式畫的，不要畫。

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. HEAVY CAST — the third and heaviest strike: a full-body lunging thrust,
   the staff driven far forward with both hands, front leg deep and bent,
   back leg fully extended, her whole body committed.
3. CHANT — standing firm and grounded, the staff raised straight up in both
   hands, head tilted back, eyes closed, chanting. Robe and hair lifted as if
   by rising air.
4. RELEASE — the staff swept forward and down, crystal pointing ahead, free
   hand thrown out to the side, hair and robe blown back hard by the release.

Do NOT draw any projectile, magic circle, glow or particles.
```

## 6. E · 熊貓子機通訊（5 格）— 大臣專屬

> 劇情：塔納托斯覺醒那天早上魔力流混亂，遠端連線斷了，她聯絡不上
> 派去保護小公主的那隻熊貓。她像拿手機一樣拿著綁在法杖上的小熊貓子機。
> **第 4 格要演得出「聽不到」**，後面的解釋才接得上。

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).

2. UNHOOK — she has just unhooked the small panda plush from her staff and
   holds it in one open palm at chest height, looking down at it; the staff
   rests in the crook of her other arm.

3. LOOK — she holds the small panda up in front of her face with both hands,
   exactly the way someone looks at a phone; eyes down on it, a faint frown.

4. LISTEN — the small panda pressed against her ear, head tilted toward it,
   eyes narrowed almost shut, eyebrows drawn together, listening hard and
   hearing nothing. Her whole posture is straining toward the doll.

5. NO ANSWER — the hand holding the panda has dropped to her side, she looks
   away and down, mouth a small flat line, shoulders lowered. Clearly worried.

The panda plush must be the SAME plush in every pose — white face and belly,
black ears, arms and legs, blue bow at the neck.
```

---

## 7. 立繪（插畫，不是點陣）

目前封面與結算插畫是**寫死小公主的**——選大臣去玩，倒下時看到的還是公主在哭。
這四張補完就能改成依角色切換。

| 檔名 | 用途 | 尺寸 |
|---|---|---|
| `mage/cover.jpg` | 選到她時的標題主視覺（直向手機） | 3:4 |
| `mage/cover-wide.jpg` | 同上（橫向／桌機） | 16:9 |
| `mage/defeat.jpg` | 她的戰敗結算插畫 | 3:2 |
| `mage/bust-*.png` | 對話立繪（三種表情，可選） | 透明底，約 800px 高 |

**共通的開頭**（四張都貼，注意風格段跟動作圖那份不一樣）：

```
[貼上第 1 節的「角色設定」段]

Style: Japanese anime light-novel cover illustration, official key visual
quality, crisp cel shading, clean line art, highly detailed. NOT pixel art.

The outfit must match the attached pixel-art reference exactly — the pointed
dark-blue witch hat with the gold buckle, the dark-blue robe-cape with gold
trim over a white blouse, the black leggings and blue boots, the wooden staff
with the blue crystal, and the small panda plush with a blue bow hanging from
the staff shaft.
```

### 7-1 · 直式封面 `cover.jpg`

> 設計上要跟小公主那張**打對台**：妹妹是日出的草原，她是**破曉前的夜色**。
> 一個是「我要出發冒險」，一個是「我要去把人找回來」。

```
Full-body key visual, NIGHT scene just before dawn. She stands alone on a
road leading out of the royal capital, the city gate and warm window lights
small and far behind her. She has stopped and turned her head to look forward
down the road — calm, level, unimpressed, but her eyes are hard.
She holds her staff upright in one hand; the blue crystal is the brightest
light in the frame and lights her face and the small panda plush from below.
Her long black hair and the dark-blue robe drift in the night air.
Deep blue and indigo palette, cold moonlight, a thin band of cold dawn light
low on the horizon, drifting motes of blue magic light.

Composition: vertical 3:4 portrait. The character fills the middle of the
frame, her head near the upper third. Keep the bottom 30% of the image simple
and mostly empty (just the dark road) — UI will be placed there.

No text, no letters, no logo, no watermark, no signature, no border frame.
```

### 7-2 · 橫式封面 `cover-wide.jpg`

```
[附上剛產好的 cover.jpg，加一句：same character and same night scene as the
attached image]

Full-body key visual, horizontal composition, same night-before-dawn scene:
she stands on the RIGHT third of the frame, staff resting against her
shoulder, the small panda plush hanging at her chest, looking back over her
shoulder toward the camera with a flat, level expression. The LEFT half of
the image is the empty night road, distant capital lights and a thin cold
dawn band on the horizon — kept simple and uncluttered.

Composition: horizontal 16:9. Character on the right, empty night sky and
road on the left (that space is reserved for the title UI).

No text, no letters, no logo, no watermark, no signature, no border frame.
```

### 7-3 · 戰敗插畫 `defeat.jpg`

> 小公主輸了是**哭哭**，她輸了是**不肯倒下**。反差軸線不一樣：
> 公主是威嚴崩掉，大臣是那張撲克臉終於裂了。

```
Defeat illustration: she has dropped to one knee and cannot get up. One hand
grips her staff, planted in the ground, holding her whole weight; the other
hand is flat on the ground beside her. Her head is down, eyes closed, brows
drawn together, breathing hard — exhausted and in pain, but not crying.
Her hat has been knocked back off her forehead and hangs by its cord, her
long black hair falling loose over her face. The small panda plush is still
tied to the staff, hanging beside her hand.

The point is the gap: the unflappable prodigy, finally out of composure —
and still refusing to let go of the staff.

Style: Japanese anime illustration, cel shading, cool blue lighting,
slightly chibi proportions.

Composition: 3:2 horizontal, character centred, simple soft background
(dark ground with cold blue bokeh).

No text, no letters, no logo, no watermark, no signature.
```

### 7-4 · 對話立繪 `bust-normal.png` / `bust-worried.png` / `bust-flat.png`（可選）

> 她是撲克臉角色，所以**表情差分的 CP 值比誰都高**——沒有差分，她整段對話會像木頭。

```
Bust portrait (head and upper chest only), facing slightly toward the camera.
TRANSPARENT background (alpha channel), no background scenery at all.
The three images must be the SAME drawing with only the face changed —
same pose, same angle, same size, same hat position, same hair.

Expression for this one: [三選一，一次產一張]
  A) NORMAL  — level, calm, deadpan, mouth a small flat line, eyes half-lidded
  B) WORRIED — brows drawn together, eyes wide and looking off to the side,
     mouth slightly open; the composure has slipped
  C) EXASPERATED — eyes narrowed flat, one eyebrow raised, completely
     unimpressed; the face she makes at the princess

Style: Japanese anime illustration, cel shading, clean line art. NOT pixel art.
Roughly 800 px tall. No text, no watermark, no signature.
```

---

## 8. 額度還有剩

1. **長公主的 A**（大劍，姿勢清單同小公主，把 `longsword` 換成 `greatsword`）
2. 開場 CG，清單見 [`../story/cutscenes.md`](../story/cutscenes.md)

---

## 9. 產完之後

丟到
`https://github.com/bobe2510/Mobilegamedevalter/upload/<分支>/assets/character/mage/raw`
（檔名開頭 A/B/C/D/E），然後：

```bash
python3 tools/check_sheet.py assets/character/mage/raw/A.* 5   # 驗頭身比與間隙
python3 tools/build_character.py mage_v2                       # 合併
```

`hurt` / `sit_cry`（跪地撐杖）/ `victory` 沿用上一批，會自動帶進來。
