# 插畫素材規格與 Grok Prompt

遊戲內的角色維持 8-bit 點陣（程式產生），這裡的插畫只用在**封面／結算畫面**。
把圖丟進這個 `assets/` 資料夾、檔名對上，遊戲就會自動套用；沒有檔案時畫面會退回純程式繪製的版本，不會壞掉。

## 需要的檔案

| 檔名 | 用途 | 建議尺寸 | 備註 |
|---|---|---|---|
| `cover.png` | 標題畫面主視覺（直向手機） | 1080 × 1440（3:4） | **下方約 30% 要留白**，會被標題面板蓋住 |
| `cover-wide.png` | 標題畫面主視覺（橫向／桌機） | 1920 × 1080（16:9） | 角色放**右半邊**，左半邊留白給標題面板 |
| `cry.png` | 結算畫面的哭哭立繪 | 1024 × 1024（1:1） | 角色置中，背景單純即可 |

- 格式 PNG（或 JPG 也行，改一下檔名即可）。單張建議壓到 1.5 MB 以內，載入比較快。
- 圖片**不要含文字**，標題是程式畫的，會疊在上面。

---

## 角色設定（每張圖都貼這段，確保長相一致）

```
A 16-year-old anime bishoujo knight girl.
Long golden-blonde hair in a high ponytail tied with a crimson ribbon, plus two
shoulder-length side locks framing her face. A thin gold tiara on her forehead.
Large sapphire-blue eyes with bright highlights, long eyelashes, light blush on
her cheeks, fair skin.
She wears an ornate silver-white breastplate with gold trim and a blue gemstone
at the chest, matching shoulder pauldrons, a short pink pleated skirt with a
white underlayer, a wide gold-buckled belt, and silver thigh-high armored boots
with gold edging. A deep crimson knight's cape flows from her shoulders.
She carries a European longsword with a gold cross-guard and a blue jewel in the
pommel.
```

---

## Prompt 1 — 直式封面 `cover.png`

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

## Prompt 2 — 橫式封面 `cover-wide.png`

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

## Prompt 3 — 哭哭立繪 `cry.png`

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

## 小技巧

- 第 2、3 張如果長相跑掉，把第 1 張當**參考圖**附上去，並在 prompt 開頭加
  `same character as the attached image, keep the exact same outfit and hair`。
- Grok 有時會自己加簽名或文字，出現的話重生成，或是留著也沒關係——可以裁掉。
- 想換配色（例如披風改成藍色）就直接改角色設定那段，三張一起改，才會一致。
