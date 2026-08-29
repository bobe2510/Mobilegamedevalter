#!/usr/bin/env python3
"""把綠幕動作圖轉成對齊好的 sprite sheet。

用法：
    python3 tools/greenscreen_sheet.py 輸入.jpg 輸出資料夾 名稱1 名稱2 ...

流程：去背去綠邊 → 連通區域切出每個姿勢（含披風與劍）→ 以頭部中心與地平線對齊
     → 輸出共用畫格的 sheet.png 與 frames.json → 驗證有沒有被裁切。

注意：一定要用連通區域切，不能用垂直中線切。角色的披風會往左伸、劍會往右伸，
     中線切法會同時「切掉自己的披風」跟「切進隔壁的劍」。
"""
import sys, os, json
from collections import deque
import numpy as np
from PIL import Image

MIN_BLOB = 40          # 小於這個像素數的區塊視為雜訊
SOLID = 0.4            # 判定為實體的 alpha 門檻


def key_out(path):
    """綠幕去背，回傳 (RGB 陣列, alpha 0~1)。"""
    im = Image.open(path).convert("RGB")
    a = np.array(im).astype(float)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    greenness = np.clip((G - np.maximum(R, B)) / 70.0, 0, 1)
    alpha = 1.0 - np.clip((greenness - 0.25) / 0.35, 0, 1)
    spill = G > (R + B) / 2 + 6                     # 去掉邊緣的綠色溢色
    g2 = G.copy()
    g2[spill] = ((R + B) / 2 + 6)[spill]
    return np.dstack([R, g2, B]).clip(0, 255), alpha


def label_blobs(mask):
    """8 連通標記，回傳 (標籤圖, 依 x 排序的區塊清單)。"""
    H, W = mask.shape
    lab = np.zeros((H, W), np.int32)
    blobs, cur = [], 0
    for sy in range(H):
        for sx in range(W):
            if mask[sy, sx] and lab[sy, sx] == 0:
                cur += 1
                lab[sy, sx] = cur
                q = deque([(sy, sx)])
                px, minx = 0, sx
                while q:
                    y, x = q.popleft()
                    px += 1
                    minx = min(minx, x)
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and lab[ny, nx] == 0:
                                lab[ny, nx] = cur
                                q.append((ny, nx))
                if px >= MIN_BLOB:
                    blobs.append({"id": cur, "px": px, "x0": minx})
    blobs.sort(key=lambda b: b["x0"])
    return lab, blobs


def build(src, dst, names):
    rgb, alpha = key_out(src)
    mask = alpha > SOLID
    lab, blobs = label_blobs(mask)
    print("偵測到 %d 個姿勢" % len(blobs))
    if len(blobs) != len(names):
        print("!! 姿勢數與名稱數不符（%d vs %d），請確認圖上的角色沒有互相碰到"
              % (len(blobs), len(names)))

    ground = int(np.where(mask.any(axis=1))[0].max())      # 最低的腳當地平線
    PADX, TOPY = 200, 380
    CW, CH = PADX * 2, TOPY + 40

    frames, srcpx = [], []
    for blob, nm in zip(blobs, names):
        m = lab == blob["id"]
        fig = Image.fromarray(np.dstack([rgb, np.where(m, alpha, 0) * 255]).astype(np.uint8), "RGBA")
        solid = (alpha > SOLID) & m
        rowW = solid.sum(axis=1)
        top = int(np.where(rowW > 14)[0].min())            # 夠寬的列才算身體，避開細長的劍
        hb = solid[top:top + 70]
        hx = np.where(hb.any(axis=0))[0]
        head_cx = (hx.min() + hx.max()) / 2
        canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        canvas.paste(fig, (int(PADX - head_cx), TOPY - ground), fig)
        frames.append(canvas)
        srcpx.append(int(m.sum()))

    bbs = [f.getbbox() for f in frames]
    x0, y0 = min(b[0] for b in bbs), min(b[1] for b in bbs)
    x1, y1 = max(b[2] for b in bbs), max(b[3] for b in bbs)
    FW, FH = x1 - x0, y1 - y0
    os.makedirs(dst, exist_ok=True)
    sheet = Image.new("RGBA", (FW * len(frames), FH), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f.crop((x0, y0, x1, y1)), (i * FW, 0))
    sheet.save(os.path.join(dst, "sheet.png"), optimize=True)
    json.dump({"frames": names, "frame_w": FW, "frame_h": FH,
               "anchor": {"head_center_x": PADX - x0, "ground_y": TOPY - y0}},
              open(os.path.join(dst, "frames.json"), "w"), ensure_ascii=False, indent=2)
    print("畫格 %dx%d，sheet.png %.0f KB"
          % (FW, FH, os.path.getsize(os.path.join(dst, "sheet.png")) / 1024))

    # 驗證：畫格內的像素數要跟原圖的區塊一致，少了就是被裁切
    arr = np.array(Image.open(os.path.join(dst, "sheet.png")))
    bad = 0
    for i, (nm, sp) in enumerate(zip(names, srcpx)):
        out = int((arr[:, i * FW:(i + 1) * FW, 3] > 100).sum())
        d = out - sp
        flag = "OK" if abs(d) < sp * 0.02 else "!! 被裁切"
        if flag != "OK":
            bad += 1
        print("  %-12s %6d → %6d (%+d) %s" % (nm, sp, out, d, flag))
    print("驗證：" + ("全部完整" if bad == 0 else "%d 格有問題" % bad))


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    build(sys.argv[1], sys.argv[2], sys.argv[3:])
