# 熊貓娃娃

魔法大臣操控的傀儡，三個身分：跟在公主身邊的跟班、暗中調整難度的考官、
倒下時拉熊貓車的司機。

| 檔案 | 說明 |
|---|---|
| `REFERENCE.png` | **定裝圖**（正面／側面／背面）。所有動作圖都以它為準 |
| `frames/` | 一姿勢一張的原始綠幕圖（`tools/gen_sprites.py panda`） |
| `anim/` | 合併後的 sheet（`tools/build_character.py panda_frames`） |
| `candidates/` | 定裝圖的六個候選與去縫線版本，留著當紀錄 |

## 動作格

`idle` / `walk1`~`walk4` / `jump` / `fall` / `talk` / `tilt` / `pull`

- **`walk1`~`walk4`**：跟班跟在公主後面時的四格循環
- **`talk`**：舉起一隻手，對話用（過場的頭像也是這格）
- **`tilt`**：歪頭。大結局裡牠歪著頭看長公主那段要用
- **`pull`**：四足加挽具，拉熊貓車那段用

## 怎麼重產

```bash
python3 tools/gen_sprites.py panda            # 全部，約 US$0.33
python3 tools/gen_sprites.py panda talk tilt  # 只補這幾格
python3 tools/build_character.py panda_frames # 合併
```

姿勢描述在 `tools/gen_sprites.py` 的 `PANDA_POSES`。

> 熊貓沒有膚色，所以 `build_character.py` 量不到臉。它會自動改用
> **頭部區域的最大寬度**當對齊基準——圓頭角色這個值很穩，實測十格全部
> 對齊到頭寬 51 px。之後的 BOSS 也會走這條路徑。
