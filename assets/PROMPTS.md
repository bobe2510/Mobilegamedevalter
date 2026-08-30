# 插畫素材規格與 Grok Prompt

這份管的是**封面與結算畫面的插畫**。另外兩份規格分開放：

- **遊戲內的動作圖**（綠幕、一張多格）→ [`character/SPRITE_SHEETS.md`](character/SPRITE_SHEETS.md)
- **過場 CG**（開場／結局）→ [`story/cutscenes.md`](story/cutscenes.md)

把圖丟進 `assets/`、檔名對上，遊戲就會自動套用；沒有檔案時會退回純程式繪製的版本，不會壞掉。

## 需要的檔案

| 檔名 | 用途 | 建議尺寸 | 備註 |
|---|---|---|---|
| `cover.jpg` | 標題畫面主視覺（直向手機） | 3:4 | **下方約 30% 要留白**，會被標題面板蓋住 |
| `cover-wide.jpg` | 標題畫面主視覺（橫向／桌機） | 16:9 或 3:2 | 角色放**右半邊**，左半邊留白給標題面板 |
| `cart.png` | 結算畫面：熊貓車載走公主 | 3:2 左右 | 像素風，會用 `image-rendering: pixelated` 顯示 |
| `cry.png` | 結算畫面：公主坐在地上哭 | 3:2 左右 | 同上 |

- 插畫類（cover）用 JPG，像素風（cart / cry）用 PNG。單張建議 300 KB 以內。
- 圖片**不要含文字**，標題是程式畫的，會疊在上面。

---

## 故事設定

> 王宮最受寵愛的小公主，偷偷立志要成為騎士，帶著劍溜出了城堡。
> 放心不下的王宮派出擅長操控人偶的**魔法大臣**，把一隻**魔法熊貓娃娃**交給公主——
> 熊貓會依她當下的實力安排剛剛好的試煉；萬一撐不住，就用**熊貓車**把公主平安送回王宮。

熊貓在遊戲裡有三個身分：平常跟在公主身邊的跟班、暗中調整難度的考官、以及倒下時拉車的司機。

---

## 角色設定（每張圖都貼這段，確保長相一致）

```
A 16-year-old anime princess-knight girl, the beloved little princess of the royal palace.
Long golden-blonde hair tied in a high ponytail with a RED ribbon, soft bangs and
two shoulder-length side locks framing her face. A delicate GOLD tiara with a blue
gemstone on her forehead. Large sapphire-blue eyes with bright highlights, long
eyelashes, light blush, fair skin, gentle dignified expression.

She wears an elegant WHITE dress-armor with rich GOLD filigree trim: a white
breastplate with a blue gem at the collar, white gloves, a gold-and-blue jeweled
belt, a short white layered skirt with gold embroidery, white thigh-high stockings
and white-and-gold armored boots. A flowing RED cape with a gold edge hangs
from her shoulders.

She carries a European longsword with a deep-blue grip, an ornate gold cross-guard
and a blue jewel set in the guard.
```

伙伴角色（出現在結算插畫裡）：

```
A chubby cute panda plush doll, black and white, with a simple stitched smile —
a magical puppet controlled by the royal court mage. It pulls a small wooden cart
with iron-rimmed wheels.
```

---

## Prompt 1 — 直式封面 `cover.jpg`

```
[貼上上面的角色設定]

Full-body heroic key visual: she stands proudly on a grassy hilltop at sunrise,
her longsword planted point-down into the ground with both hands resting on the
pommel, crimson cape billowing in the wind, chin slightly raised with a calm,
dignified, confident expression. Behind her, a fantasy landscape of distant blue
mountains and a white castle, dramatic golden rim lighting, cinematic light rays,
floating glowing particles.

Style: Japanese anime light-novel cover illustration, official key visual quality,
crisp cel shading, vivid saturated colors, clean line art, highly detailed.

Composition: vertical 3:4 portrait. The character fills the middle of the frame,
her head near the upper third. Keep the bottom 30% of the image simple and mostly
empty (just grass and sky) — UI will be placed there.

No text, no letters, no logo, no watermark, no signature, no border frame.
```

## Prompt 2 — 橫式封面 `cover-wide.jpg`

```
[貼上上面的角色設定]
[如果 Grok 支援參考圖，把 cover.png 一起附上並加一句：same character as the attached image]

Full-body heroic key visual, horizontal composition: she stands on the RIGHT
third of the frame, resting her longsword on her shoulder, crimson cape sweeping
to the side, looking toward the camera with a confident smile. The LEFT half of
the image is an open fantasy landscape — sunrise sky, distant mountains, a
castle silhouette — kept simple and uncluttered.

Style: Japanese anime light-novel cover illustration, official key visual quality,
crisp cel shading, vivid saturated colors, clean line art, highly detailed,
dramatic golden rim lighting.

Composition: horizontal 16:9. Character on the right, empty sky and landscape on
the left (that space is reserved for the title UI). 

No text, no letters, no logo, no watermark, no signature, no border frame.
```

## Prompt 3 — 結算插畫 `cart.png` / `cry.png`（像素風）

```
[貼上上面的角色設定]
[附上 cover.png 並加一句：same character as the attached image]

Comedic "defeated" illustration: the same proud knight girl has completely lost
her composure — she sits on the ground with her knees together, both small fists
rubbing her eyes, huge comedic anime tears streaming down her face, mouth open in
a wobbly crying pout, eyebrows raised in distress, cheeks flushed red. Her tiara
is slightly crooked and her hair is a little messy. Her longsword lies on the
grass beside her. Behind her, a cute plush-toy panda pulling a small wooden cart
comes to pick her up.

The mood is funny and adorable, not tragic — the gap between her dignified knight
look and this crying face is the whole point.

Style: Japanese anime illustration, cel shading, soft warm lighting, slightly
chibi proportions, very cute.

Composition: square 1:1, character centered, simple soft background (blurred
grass with warm bokeh).

No text, no letters, no logo, no watermark, no signature.
```

---

## ⚠️ 目前的封面與遊戲 sprite 不一致

`cover.jpg` / `cover-wide.jpg` 裡小公主的披風是**白色**，遊戲裡的 sprite 是**紅色**。
定案是**以 sprite 為準（紅色）**——上面的角色設定已經改好了，
兩張封面之後要用新設定重產一次。

理由：紅披風是開場 CG 第 1 張那個「背影反轉」的關鍵（兩姊妹都穿紅披風，
玩家才會誤認）；而且重產一張封面比重拍四張動作圖便宜太多。

其餘的服裝差異對照見 [`character/SPRITE_SHEETS.md`](character/SPRITE_SHEETS.md) 第三節。

---

## 小技巧

- 第 2、3 張如果長相跑掉，把第 1 張當**參考圖**附上去，並在 prompt 開頭加
  `same character as the attached image, keep the exact same outfit and hair`。
- Grok 有時會自己加簽名或文字，出現的話重生成，或是留著也沒關係——可以裁掉。
- 想換配色（例如披風改成藍色）就直接改角色設定那段，三張一起改，才會一致。
