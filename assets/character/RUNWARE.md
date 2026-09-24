# Runware API：實測結果與分工

2026-09 實測，總花費不到 US$1。工具在 [`tools/runware.py`](../../tools/runware.py)。

金鑰放在環境變數 `RUNWARE_API_KEY`，程式只從環境讀，不寫進 repo。
代理要放行 `api.runware.ai`。

---

## 結論：跟直覺相反，不要挑「擅長二次元」的模型

| 模型類型 | 畫風 | 聽不聽指令 | 結果 |
|---|---|---|---|
| 動漫專精 SDXL（Animagine XL 4.0） | 漂亮 | ❌ 很差 | 綠幕變青綠、髮色被鄰近字汙染、憑空長出華麗金框、沒有劍 |
| 指令遵循強（Qwen-Image-3.0） | 稍平 | ✅ 很好 | 純綠幕、側面朝右、服裝細節全中、seed 之間一致 |

動漫模型吃的是 danbooru tag，對「純綠背景」「側面」「五格排版」這種
**版面與構圖指令**幾乎無效。要產可用的素材，指令遵循比畫風重要。

---

## 分工：哪些用 Grok，哪些用 Runware

### 🟢 遊戲內 sprite → Qwen-Image-3.0（2026-09-24 更新）

第一輪測試時 Qwen 輸給 Grok，原因是**線太細、縮小會糊**。
後來發現那不是模型的問題，是 prompt 沒講——補上這段之後就追上了：

```
ART STYLE — this is the most important part: a classic 2D game sprite meant to be
shown very small on screen, so it must read clearly at tiny size. Use THICK DARK
OUTLINES around every shape, BOLD FLAT COLOR BLOCKS with a limited palette, strong
light-dark contrast, and chunky simplified forms. Big readable silhouette: large
head, large cape, large sword. No fine linework, no thin lines, no soft gradients,
no airbrushed shading, no painterly rendering, no glossy highlights. Think 16-bit
JRPG sprite art, not a detailed illustration.
```

這段**同時修好了背景**——加進去之後綠幕才真的變純綠。
顯然「要當成遊戲素材用」這個脈絡，比逐條下指令更有效。

#### 同一份 prompt 四個模型實測

| 模型 | 單價 | 頭身比變異 | 身高變異 | 最小間隙 | 小尺寸可讀性 |
|---|---|---|---|---|---|
| Grok（已停訂） | — | 0% | 14% | 13 px | 基準 |
| **Qwen-Image-3.0** | **$0.030** | **0%** | **8%** | **27 px** ✅ | 接近 Grok |
| FLUX.2 [dev] | $0.011 | 4% | **2%** | 9 px | 好，但**自帶地面陰影** |
| FLUX.2 [klein] 9B | $0.0008 | 4% | 21% | 1 px | 臉不穩、細節糊 |
| FLUX.2 [pro] | $0.045 | — | — | 重疊 | 風格最好，但**背景變白、人物疊在一起** |

**選 Qwen-Image-3.0。** 它是唯一四格間隙全部 ≥ 27 px 的（不會黏在一起），
頭身比 0%，而且真的照著「著地低 / 通過高」的步態畫。

FLUX 系的風格其實更像遊戲 sprite，但兩個毛病很傷：
**FLUX.2 [dev] 會自己畫地面陰影**（去背會連陰影一起抓進來），
**[pro] 直接無視綠幕背景**。叫它不要畫也沒用。

> 這也回答了「指令遵循強 = 要用自然語言型」的推論：**方向對，但不是全對**。
> FLUX 系確實是自然語言型，可是它把 prompt 當「氛圍描述」而不是「規格」；
> Qwen 才是真的逐條執行。自然語言只是必要條件。

### 🟢 大圖 → Runware

過場 CG、封面、結算插畫這些是**全畫面顯示**的，沒有縮小可讀性問題，
而且不需要幀間一致。每張 US$0.03，21 張 CG 約 US$0.63。

### 🟢 表情差分 → 用 Runware 的「編輯」，這是它的殺手級用途

`edit` 以既有圖片為底，**只改指定的地方**。實測拿大臣的立繪改表情：
帽子、頭髮、法杖、小熊貓、衣服、背景、構圖全部維持不變，
只有臉變了，連額頭的青筋符號都畫得出來。

這在結構上解決了「分開產會飄」的問題——因為根本沒有重畫。

```bash
python3 tools/runware.py edit src.jpg out.jpg \
  "Change ONLY her facial expression to angry scolding: eyebrows down, eyes
   narrowed, mouth open mid-shout, a cross-popping anger mark on her temple.
   Keep everything else in the image EXACTLY the same — identical pose,
   identical hat, identical hair, identical outfit, identical background,
   identical framing and scale."
```

**關鍵句是後面那段「其餘完全不變」**，要把不可以動的東西一項一項列出來。

---

## 踩到的坑

| 症狀 | 原因 / 解法 |
|---|---|
| 產完抓不到圖 | 圖片 CDN 是 `im.runware.ai`，被代理擋住。用 `outputType: base64Data` 讓 API 直接回傳就好；要用 URL 模式才需要把這個網域加進例外 |
| 大尺寸 PNG 回不了圖 | 改用 `outputFormat: JPG` |
| `query` 搜不到東西 | 參數名是 **`search`** 不是 `query`；用 `query` 會一直回同一批精選模型 |
| 部分模型不吃 seed | 回 `unsupportedArchitectureSeed`，拿掉 `seed` 即可 |
| 費用回報是 0 | 要加 `includeCost: true` |

---

---

## 角色一貫性的解法：定裝圖當 reference，一姿勢一張

這是整套流程的重點。**不要讓模型「重畫」角色，要讓它「參考」角色。**

### 為什麼不是「一張排五格」

加了 reference 之後模型會把注意力花在對齊角色，**版面就鬆了**——
實測同一份 prompt，間隙從 27px 掉到 **-13px**（人物直接疊在一起，去背會黏住）。

改成一姿勢一張，這個問題在結構上就不存在：

| | 一張排五格 | **一姿勢一張** |
|---|---|---|
| 去背黏在一起 | 會，要一直重產 | **不可能**（每張只有一個人） |
| 補一格 | 整張重產 | 只產那一格，US$0.03 |
| 格數上限 | 受圖寬限制 | 無 |
| 大小不一致 | 得靠運氣 | 合併時用頭高對齊 |

### 實測結果（小公主，三格）

| 指標 | 一張排五格（Grok） | **一姿勢一張（Qwen + reference）** |
|---|---|---|
| 頭身比變異 | 0% | **0%** |
| 去背區塊 | 剛好 5（運氣好） | **每張 1 個** |
| 合併後頭心偏移 | 13.2 px | **0.9 px** |

頭心偏移差一個數量級——單姿勢圖讓臉部偵測有乾淨的目標，不會被旁邊的人干擾。

### 怎麼跑

```bash
# 1. 產圖（每格 US$0.033）
python3 tools/gen_sprites.py knight            # 全部
python3 tools/gen_sprites.py knight idle run1  # 只補這幾格

# 2. 合併（用頭高對齊，輸出 anim/sheet.png + frames.json）
python3 tools/build_character.py knight_frames
```

姿勢表寫在 `tools/gen_sprites.py` 的 `POSES`，角色差異寫在 `CHARS`
（武器講法、要保留的外觀特徵、專屬姿勢）。要加新動作就加一行。

### 還沒解決的

**幀間色偏**：同一件披風在不同格會偏白／偏米／偏灰。目前靠 `recolor_cape.py`
那類後處理壓，之後可以做一支「用基準格的調色盤重新量化」的工具一次解決。

---

## 建議的下一步

Grok 已經停訂，所以全部改由 Runware 產：

全部改成「定裝圖 → 一姿勢一張」的流程：

| 項目 | 格數 | 費用 |
|---|---|---|
| 小公主動作圖（重產，統一流程） | 18 | ~US$0.60 |
| 魔法大臣動作圖（含熊貓子機 4 格） | 22 | ~US$0.73 |
| 長公主動作圖 | 18 | ~US$0.60 |
| 熊貓：先產定裝圖，再產動作圖 | 1 + 6 | ~US$0.23 |
| 三隻 BOSS：各先產定裝圖，再產動作圖 | 3 + 24 | ~US$0.90 |
| 表情差分（用 `edit`，不用拼版了） | 27 | ~US$0.90 |
| 21 張過場 CG | 21 | ~US$0.63 |
| **合計** | | **~US$4.6** |

熊貓與 BOSS 目前完全沒有插畫素材，所以要多一步：
**先用文字產一張定裝圖（正面／側面／背面），確認後再拿它當 reference 產動作圖。**
定裝圖那一步值得多試幾個 seed，因為它會決定後面全部。
