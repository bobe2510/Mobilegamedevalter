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

### 🟡 遊戲內 sprite → 還是用 Grok

在遊戲實際尺寸（70 虛擬 px）下比對，**Grok 的輸出反而比較好**：
線條更粗、色塊對比更強、披風更大，縮小後讀得清楚；
Qwen 是「插畫縮小」，細線會糊掉。

Qwen 的多格排版其實做得出來（五格、綠幕、朝右、間隙夠寬，
連「著地低 / 通過高」的步態對比都對，`check_sheet.py` 量出來頭身比變異 0%、
去背區塊數剛好），只是**小尺寸的可讀性輸了**。

### 🟢 大圖 → 用 Runware

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
| 產完抓不到圖 | 圖片 CDN 的網域被代理擋住。用 `outputType: base64Data` 讓 API 直接回傳 |
| 大尺寸 PNG 回不了圖 | 改用 `outputFormat: JPG` |
| `query` 搜不到東西 | 參數名是 **`search`** 不是 `query`；用 `query` 會一直回同一批精選模型 |
| 部分模型不吃 seed | 回 `unsupportedArchitectureSeed`，拿掉 `seed` 即可 |
| 費用回報是 0 | 要加 `includeCost: true` |

---

## 建議的下一步

1. **21 張過場 CG** 由我直接產，不用再燒你的 Grok 額度
2. **表情差分**改用 `edit`：先產一張基準立繪，其餘八種表情用編輯生出來
3. **敵人與背景**目前還是程式畫的點陣圖，跟角色風格對不起來，可以整套重做
4. 動作 sprite 維持 Grok
