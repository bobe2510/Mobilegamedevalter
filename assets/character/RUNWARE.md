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

## 建議的下一步

Grok 已經停訂，所以全部改由 Runware 產：

1. **魔法大臣的五張動作圖**（A~E）用 Qwen，$0.03 × 5 ≈ US$0.15
2. **長公主的四張**同上，約 US$0.12
3. **表情差分**改用 `edit`：先產一張基準立繪，其餘八種表情用編輯生出來。
   這樣就不用再做「兩張 bust 拼版」那套了
4. **21 張過場 CG**，約 US$0.63
5. **敵人與背景**目前還是程式畫的點陣圖，跟角色風格對不起來，可以整套重做

全部加起來大約 **US$1.5**。
