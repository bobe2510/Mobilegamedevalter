# 長公主 · Grok Prompt 包（可直接複製）

**每一張都附上參考圖** [`elder/REFERENCE.png`](elder/REFERENCE.png)。

跟另外兩人最大的差別：**大劍（雙手持）**、**紅瞳**、**紅披風**、
攻速是別人的 1.5 倍，大招是**分身前後夾擊 + 換位**。

順序：**A → B → C → D → 表情 → 立繪**。

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

### 角色設定

```
Character: the elder princess — the empire's chief knight commander, and the
little princess's big sister. Composed, elegant and genuinely dangerous.
- Hair: golden-blonde, HIGH PONYTAIL tied with a RED ribbon
- Eyes: large RED eyes, sharp and level
- Head: thin GOLD circlet across her forehead
- Body: full WHITE-and-GOLD plate armor — rounded pauldrons, gauntlets,
  breastplate and faulds, all trimmed in gold filigree; RED cloth under-layers
  showing at the sleeves and as a red skirt panel
- Legs: WHITE-and-GOLD armored thigh-high boots
- Cape: a long RED cape with GOLD vine patterns, hanging from both shoulders
- Weapon: a large TWO-HANDED GREATSWORD — broad steel blade, ornate GOLD
  cross-guard with a red gem, red-wrapped grip. It is nearly as tall as she is
  and she holds it in BOTH hands. This is the biggest visual difference from
  her little sister, who uses a slim one-handed longsword.
- She is the more mature, more heavily armored of the two sisters.
```

### 技術要求

```
TECHNICAL REQUIREMENTS — follow these exactly:
- Background: PURE GREEN (#00FF00), completely flat. No gradient, no shadow,
  no ground line, no floor, no vignette.
- Layout: ONE horizontal row of poses, evenly spaced, left to right,
  in the exact order listed below.
- Leave a WIDE, CLEARLY VISIBLE GREEN GAP between every pair of figures.
  Nothing may cross into a neighbour's space — not the cape, not the blade,
  not a strand of hair. This is the single most important rule.
- All figures at EXACTLY the same scale, same head size, same body proportions.
- All figures FACING RIGHT (the viewer's right), strict side view.
- Every figure standing on the ground shares the same horizontal foot line.
- Identical outfit, colors and accessories in every pose.
- No text, no labels, no numbers, no panel borders, no grid lines.
- No motion blur, no speed lines, no glow, no sparks, no particles,
  NO GOLDEN SLASH ARCS, no sword trails — all effects are added by the
  game engine.
```

> ⚠️ **最後一條對她特別重要。** 她上一批的攻擊格自帶金色斬擊光弧，
> 那個沒辦法獨立調時間，而且會跟程式的劍光疊成兩層。這批畫乾淨的，
> 我會把程式的劍光開回來。

---

## 2. A · 跑步循環（5 格）⭐ 最優先

```
Poses, left to right:

1. IDLE — standing at rest, weight on both feet, the greatsword held
   point-down at her side in one hand or resting against her shoulder,
   calm and level. This pose is the size reference for the whole sheet.

2. RUN CONTACT A — running: her RIGHT leg is forward with the heel just
   striking the ground, left leg extended far behind, torso leaning forward,
   the greatsword carried angled back. Feet are FAR APART.

3. RUN PASS A — running: BOTH FEET OFF THE GROUND, the rear leg swinging
   through directly underneath her body so the legs are CLOSE TOGETHER,
   body at the HIGHEST point of the stride, red cape lifted behind her.

4. RUN CONTACT B — running: her LEFT leg is forward with the heel just
   striking the ground, right leg extended far behind. Feet FAR APART.

5. RUN PASS B — running: BOTH FEET OFF THE GROUND again, legs CLOSE TOGETHER
   under the body, opposite arm swing to pose 3.

The two PASS poses must be clearly different from the two CONTACT poses:
in CONTACT the feet are far apart and the body is LOW, in PASS the legs are
together and the body is HIGH. That contrast is what makes the run read.
She runs like someone carrying real weight — heavier and more grounded than
her little sister.
```

## 3. B · 空中與落地（5 格）

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. JUMP — just after take-off, rising: both knees pulled up, the greatsword
   swept back in one hand, red cape streaming downward.
3. APEX — the top of the jump: body upright, legs slightly apart, the
   greatsword brought across her body in both hands, cape spread out.
4. FALL — descending: legs reaching down toward the ground, greatsword held
   ready, cape and hair streaming upward.
5. LAND — the instant of landing: deep knee bend, the greatsword driven
   point-down into the ground beside her taking her weight, head low,
   cape settling.
```

## 4. C · 三段連擊 前段（4 格）

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).
2. WIND-UP — anticipation: the greatsword hauled up and back over her
   shoulder in both hands, body coiled, back foot planted, weight loaded.
3. SLASH 1 — the first cut: a diagonal downward slash with both hands, the
   blade sweeping down and forward, front foot stepping in hard.
4. SLASH 2 — the second cut: a horizontal sweep across her body from the
   opposite side, torso rotated fully, ponytail and cape trailing the blade.

Clean poses only — no golden arcs, no sword trails, no glow.
```

## 5. D · 重斬與分身大招（4 格）

> 她的大招是**分身前後夾擊**：分身與本體各砍一刀，結束後本體出現在敵人**後方**
> （分身與本體換位）。分身的殘影是程式畫的，這裡只要本體的兩個姿勢。

```
Poses, left to right:

1. IDLE — the exact same standing pose as sheet A pose 1 (size reference).

2. HEAVY SLASH — the third and heaviest blow: a full-body lunging strike,
   the greatsword driven far forward in both hands, front leg deep and bent,
   back leg fully extended, her whole weight behind it.

3. DASH START — crouched very low like a sprinter in the blocks, the
   greatsword drawn back and held low behind her in both hands, eyes forward,
   about to burst forward. Coiled and still.

4. AFTER THE STRIKE — the finish: standing tall and composed, the greatsword
   swept fully out behind her at hip height, arm extended, body turned
   slightly away, NOT looking back. The pose of someone who has already
   walked past the target.

Clean poses only — no afterimages, no motion blur, no glow. The clone and
the after-image are drawn by the game engine.
```

---

## 6. 表情差分（兩張綠幕，各 5 格）

> 跟大臣一樣**一定要拼在同一張**。她的軸線是：
> **對外是團長，對妹妹才是姐姐。** 全遊戲只有結局那一段會看到後者。

#### 表情 A · `elder/raw/bust-a.jpg`

```
[貼上「角色設定」段]

FIVE BUST PORTRAITS of the same character in ONE image, in a single
horizontal row, left to right.

CRITICAL — this is the whole point of the sheet:
Every one of the five is the SAME DRAWING. Identical head size, identical
angle, identical shoulder line, identical circlet position, identical hair
silhouette, identical armor collar. ONLY THE FACE CHANGES — eyes, eyebrows,
mouth, blush. Imagine one drawing with five different faces pasted onto it.
If the head size or the angle differs between two of them, the sheet is wrong.

Framing: HEAD AND SHOULDERS ONLY — crop just below the collarbone, showing
the top of the white-and-gold pauldrons. Not a half body. No sword in frame.
Facing slightly toward the viewer, three-quarter view.

Expressions, left to right:

1. NORMAL — the commander's face. Calm, level, composed, eyes steady,
   mouth relaxed but firm. Dignified, not cold. This is the reference for
   the whole sheet.

2. COLD — dressing down the people who failed her sisters. Eyes narrowed
   and utterly flat, eyebrows low, mouth a hard line, chin slightly lifted.
   No shouting. This face is worse than shouting.

3. FURY — on the battlefield, going through anything in her way. Eyes wide
   and blazing red, pupils sharp, teeth bared slightly, hair lifting.
   Pure killing intent.

4. TEARFUL — she has just found both her sisters alive. Eyes wide and
   glassy with unshed tears, eyebrows raised in the middle, mouth trembling
   slightly, cheeks warm. She is about to lose it and she knows it.

5. SCOLDING — one second later, composure slammed back on. Eyes closed or
   narrowed hard, one eyebrow twitching, mouth a stern flat line, a
   cross-popping anger mark on her temple. The "you two idiots" face.
```

#### 表情 B · `elder/raw/bust-b.jpg`

```
[貼上「角色設定」段]
[附上剛產好的 bust-a.jpg，加一句：
 same character, same drawing, same head size and same framing as the
 attached image — only the faces differ]

FIVE BUST PORTRAITS, same rules as before: one drawing, five faces,
head and shoulders only, pure green background, wide gaps, same scale.

Expressions, left to right:

1. NORMAL — exactly the same composed face as portrait 1 of the previous
   sheet. This one exists only to match the two sheets together.

2. BLUSH — she has just been caught looking at something embarrassingly
   cute. Cheeks bright red, eyes wide and darting away, eyebrows up,
   mouth small and tight. Mortified that anyone saw.

3. SOFT — the face she only makes at her little sister. Eyes gently
   half-closed and warm, eyebrows relaxed, a small fond closed-mouth smile.
   Nothing of the commander left.

4. EXHAUSTED — after the fight she barely won. Eyes half-open and unfocused,
   brows drawn, mouth open breathing hard, sweat on her temple, a smear of
   dirt on one cheek. Refusing to look beaten.

5. SMUG — the older-sister smirk. One eyebrow raised, eyes half-lidded and
   amused, one corner of the mouth pulled up. Insufferable, and she knows it.

Style, technical requirements: identical to the previous sheet.
```

檔名開頭 `bust-a` / `bust-b`，丟 `elder/raw/`，然後 `python3 tools/build_busts.py elder`。

---

## 7. 立繪（插畫，不是點陣）

四張都先貼「角色設定」段，再接：

```
Style: Japanese anime light-novel cover illustration, official key visual
quality, crisp cel shading, clean line art, highly detailed. NOT pixel art.

The outfit must match the attached pixel-art reference exactly — the gold
circlet, the RED eyes, the white-and-gold plate armor with red under-layers,
the long red cape with gold vine patterns, and the two-handed greatsword
with the gold cross-guard and red gem.
```

### 7-1 · 直式封面 `elder/cover.jpg`

> 三張封面各代表一種出發的理由：妹妹是**日出的憧憬**，大臣是**破曉前的追尋**，
> 她是**正午的討伐**——沒有猶豫，只有要不要動手。

```
Full-body key visual: she stands at the top of a ridge in flat hard noon
light, the greatsword driven point-down into the rock in front of her with
both gauntleted hands resting on the pommel. She is looking straight ahead
down into the valley, red eyes level and unblinking, expression completely
calm. The long red cape snaps sideways in a hard wind. Behind and below her,
a broken battlefield and a dark storm front rolling in from the far side.
Cold white sunlight, high contrast, hard shadows, a few embers drifting.

The mood is not heroic — it is a professional arriving at work.

Composition: vertical 3:4 portrait. The character fills the middle of the
frame, her head near the upper third. Keep the bottom 30% of the image simple
and mostly empty (just bare rock) — UI will be placed there.

No text, no letters, no logo, no watermark, no signature, no border frame.
```

### 7-2 · 橫式封面 `elder/cover-wide.jpg`

```
[附上剛產好的 cover.jpg，加一句：same character and same scene as the
attached image]

Full-body key visual, horizontal composition, same noon ridge scene: she
stands on the RIGHT third of the frame, the greatsword resting across her
shoulders with one wrist hooked over it, looking toward the camera with a
level, faintly amused expression. The LEFT half of the image is the open
valley, the distant storm front and empty sky — kept simple and uncluttered.

Composition: horizontal 16:9. Character on the right, empty sky and valley
on the left (that space is reserved for the title UI).

No text, no letters, no logo, no watermark, no signature, no border frame.
```

### 7-3 · 戰敗插畫 `elder/defeat.jpg`

> 三個人的戰敗是三種輸法：妹妹**哭**，大臣**跪著不放手**，
> 她**根本不承認自己輸了**。

```
Defeat illustration: she is down on one knee but has not let go of anything.
Both gauntleted hands grip the greatsword, driven point-down into the ground
in front of her, and she is using it to hold herself upright. Her head is
bowed but her red eyes are open and still fixed forward, teeth clenched,
breathing hard. Sweat and dirt on her face, a strand of hair loose from the
ponytail, the red cape torn at the hem and spread on the ground behind her.
Furious — not at the enemy, at herself.

The point is that she is not crying and not giving up; she simply cannot
stand yet.

Style: Japanese anime illustration, cel shading, hard cold lighting,
slightly chibi proportions.

Composition: 3:2 horizontal, character centred, simple soft background
(cracked ground with dust and drifting embers).

No text, no letters, no logo, no watermark, no signature.
```

---

## 8. 之後才要的（開場 CG，先不急）

`elder/open-1.jpg` 是**全作最需要小心的一張**：它要跟小公主開場第 1 張
**同一個構圖、同一個姿勢，但從正面**——這次看得到紅瞳。
分鏡與理由見 [`../story/cutscenes.md`](../story/cutscenes.md)。
等小公主那張先產出來，才有得對照。

---

## 9. 產完之後

丟到
`https://github.com/bobe2510/Mobilegamedevalter/upload/<分支>/assets/character/elder/raw`
（動作圖開頭 A/B/C/D，表情圖開頭 bust-a / bust-b），然後：

```bash
python3 tools/check_sheet.py assets/character/elder/raw/A.* 5
python3 tools/build_character.py elder_v2
python3 tools/build_busts.py elder
```

`hurt` / `sit_cry`（兩手握劍插地撐著）/ `victory` 沿用上一批，會自動帶進來。
另外她的 `CHAR.noSlashFx` 要改回 false——新的攻擊格沒有內建光弧了。
