# 劍姬騎行 Knight Girl — 8-bit 橫向捲軸動作遊戲

日系美少女騎士的橫向捲軸動作遊戲。**HTML5 + Canvas，零建置流程**，
推上 GitHub Pages 就能用手機瀏覽器直接玩（改完 push → 重整約 30 秒）。

> **故事**：王宮最受寵愛的小公主，偷偷立志要成為騎士，帶著劍溜出了城堡。
> 放心不下的王宮派出擅長操控人偶的**魔法大臣**，把一隻**魔法熊貓娃娃**交給公主——
> 熊貓會依她當下的實力安排剛剛好的試煉；萬一撐不住，就用**熊貓車**把公主平安送回王宮。

主角是**插畫等級的動畫角色**（`assets/character/anim/sheet.png`，十格動作），
敵人與背景目前仍是**程式產生的點陣圖**（寫在 `js/art.js` 的字元陣列，執行時才畫進 canvas），
音效與配樂則是 WebAudio 即時合成。所有外部素材都是選用的——
`assets/` 缺檔時會自動退回純程式繪製的版本，遊戲照樣能跑。

> 目前主角是插畫、敵人是點陣，風格上還沒統一，這是過渡狀態。

## 三個可玩角色

標題畫面可以選角，**破台會解鎖下一位**（小公主 → 魔法大臣 → 長公主），結局播完會直接跳出解鎖提示。
三人的故事、玩法差異與實作進度見 [`DESIGN.md`](DESIGN.md)。

## 玩法

- 目標：一路往右打到終點傳送門過關，關卡會愈來愈長、敵人愈來愈多。
- **每 3 關會出現魔王**，打倒後才會開傳送門。**第 9 關的魔王打完就是全破**，
  會播該角色的結局並解鎖下一位。
- 打怪、撿金幣加分；愛心回血、藥水回血並補氣力。
- 累積氣力可放**必殺旋風斬**（無敵 + 範圍傷害）。
- **熊貓娃娃**平常會跟在公主身後跑；牠同時是暗中的考官——
  連續倒下時試煉會變溫和，一路過關則逐漸嚴苛（敵人數量與血量會跟著變），
  結算畫面的「熊貓評定」就是目前的試煉強度，這個評定會存在瀏覽器裡。
- 血量歸零會播一段**倒地演出**：騎士的劍脫手飛出去，她坐在地上哭哭（會噴眼淚），
  接著**熊貓車**噗噗地開過來，玩偶風格的熊貓司機把她抱上木頭板車，一路載出畫面。
  整段大約 4.5 秒，結束才跳結算畫面。

### 操作

| 動作 | 手機 | 電腦 |
|---|---|---|
| 移動 | 左下 ◀ ▶ | `←` `→` 或 `A` `D` |
| 跳躍（可二段跳） | 右下「跳」 | `空白鍵` / `W` / `↑` |
| 攻擊（三段連擊） | 右下「斬」 | `J` 或 `Z` |
| 必殺旋風斬 | 右下「必殺」 | `K` 或 `X` |
| 暫停 | 右上 ⏸ | `P` / `Esc` |

戰鬥小技巧：連續按「斬」會接出第二、三段，第三段傷害與擊退最高；
按住跳躍鍵越久跳越高，落地前還能再跳一次。

## 過場與劇情

開場、中段對話、結局共用同一支播放器（[`js/cutscene.js`](js/cutscene.js)）：

- **開場／結局**是全畫面 CG 靜畫 + 逐字對話框，每個角色的開場只會自動播一次
- **中段對話**走洛克人風格：不需要 CG，直接把關卡畫面當背景壓暗
- 點畫面任一處推進（逐字中就先補完），左上角可跳過
- 標題畫面的「故事」裡可以**重看開場**；破過台的角色還會多一顆**重看結局**
- CG 圖是**延遲載入**的：播到那一幕才抓，並預抓後面幾句要用的圖，
  所以劇情再多也不會拖慢首次開啟

台詞在 [`js/story.js`](js/story.js)，CG 清單與規格在
[`assets/story/cutscenes.md`](assets/story/cutscenes.md)。

## 部署到 GitHub Pages

兩種方式擇一：

1. **Actions（本專案已內建）**：Repo → Settings → Pages → Source 選 **GitHub Actions**。
   之後每次 push 到 `main` / `master` / `claude/**` 都會自動部署。
2. **直接發佈分支**：Settings → Pages → Source 選 **Deploy from a branch**，
   分支選你要的、資料夾選 `/ (root)` 即可（專案根目錄已有 `.nojekyll`）。

> ⚠️ **第一次一定要手動去 Settings → Pages 開啟**。GitHub Actions 用的內建 token
> 沒有「建立 Pages 站台」的權限，在還沒開啟前 workflow 會出現
> `Get Pages site failed ... Not Found`。開啟之後重跑一次 workflow（Actions 頁面
> 按 Re-run jobs）或隨便再 push 一次就會成功。
>
> 另外 **私有 repo 的 Pages 需要付費方案**；如果是免費帳號，把 repo 設成 public 即可。

網址會是 `https://<帳號>.github.io/<repo 名稱>/`。

## 本機開發

因為用了 ES modules，不能直接用 `file://` 開，起一個小 server 就好：

```bash
npx http-server . -p 8080 -c-1     # 或 python3 -m http.server 8080
```

然後開 http://localhost:8080 。

## 檔案結構

```
index.html      畫面、觸控按鍵、標題／死亡／暫停面板
style.css       RWD 版面（直向、橫向都可玩，含瀏海安全區處理）
assets/         標題與結算用的插畫（選用，缺檔不影響遊戲）
tools/          綠幕素材處理腳本（去背、切件、對齊、驗證）
js/art.js       所有點陣素材（字元圖 + 調色盤）
js/pixel.js     把字元圖編譯成 canvas（翻轉、剪影）
js/sprites.js   把部位組成女騎士的各個動作影格
js/input.js     鍵盤 + 多點觸控輸入
js/audio.js     WebAudio 8-bit 音效與循環配樂
js/game.js      主程式：物理、敵人 AI、關卡生成、繪圖、HUD
js/cutscene.js  過場播放器（CG 靜畫 + 逐字對話，開場／中段／結局共用）
js/story.js     所有台詞與過場的分鏡資料
```

## 想改東西的話

- **難度／手感**：`js/game.js` 最上面的 `GRAV`、`updatePlayer()` 裡的速度與跳躍值、
  `ETYPE` 敵人血量與分數、`makeStage()` 的關卡長度與敵人數量。
- **換角色外觀**：直接改 `js/art.js` 的字元圖。每個字元對應 `PAL` 裡的一個顏色，
  `.` 是透明。想加新顏色就往 `PAL` 加一個字元即可。女騎士是「頭／哭臉／身體／腿（站、跑 A、
  跑 B、跳、坐）／雙馬尾／持劍手」分開畫，再由 `js/sprites.js` 用座標疊成每個影格，
  所以改一個部位就會套用到所有動作。
- **倒地演出**：`js/game.js` 的 `startFaint()` / `updateFaint()` / `drawCart()`，
  裡面可以調哭多久、熊貓車速度、板車尺寸（`CART`）。
- **加新敵人**：在 `art.js` 畫圖 → `sprites.js` 註冊 → `game.js` 的 `ETYPE` 加數值、
  `updateEnemy()` 加一段 AI。
- **改背景主題**：`js/game.js` 的 `THEMES`（森林白天 / 黃昏丘陵 / 魔王城夜晚，每 3 關循環）。
- **難度自動調節**：`js/game.js` 的 `TIER_MIN` / `TIER_MAX` 與 `setTier()` 呼叫處。
- **主角大小**：`js/game.js` 的 `HERO_H`（站姿在遊戲座標裡的高度，目前 70）。
  改了要跟著調碰撞箱 `player.w/h` 與 `attackHitbox()` 的範圍。
- **畫面解析度**：`RES` 由 `resize()` 依裝置像素密度自動決定（1~3 倍），
  繪圖座標維持虛擬解析度，所以改解析度不用重調物理。
- **換插畫**：把圖丟進 `assets/`（檔名見 [`assets/README.md`](assets/README.md)），
  生成用的角色設定與 prompt 在 [`assets/PROMPTS.md`](assets/PROMPTS.md)。
- **改劇情台詞**：`js/story.js`，一句就是一筆 `{ cg, who, text }`。
- **補過場 CG**：丟進 `assets/story/cg/<角色>/`，檔名與分鏡見
  [`assets/story/cutscenes.md`](assets/story/cutscenes.md)。缺圖時遊戲會顯示
  寫著檔名的佔位卡，所以可以一張一張補。
- **一輪的長度**：`js/game.js` 的 `FINAL_STAGE`（目前 9，= 第三隻魔王）。

## 之後想包成 APK？

這份程式碼可以直接被 Capacitor 包起來（`npx cap add android` 後把整個資料夾當 web 資產），
再用 GitHub Actions 出 APK，遊戲邏輯完全不用改。
