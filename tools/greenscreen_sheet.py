#!/usr/bin/env python3
"""把綠幕動作圖轉成對齊好的 sprite sheet。

用法：
    python3 tools/greenscreen_sheet.py 輸入.jpg 輸出資料夾 名稱1 名稱2 ... [--air 名稱,名稱]

    --air 列出「腳沒踩地」的姿勢（跳躍、下墜、受傷）。這些姿勢的錨點會用
          「頭頂 + 站姿身高」推算，讓每一格的錨點都落在同一個語意位置（腳下的地面）。

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


def merge_orphans(lab, blobs):
    """把落單的小區塊（掉在地上的劍、飛濺的眼淚）併回最近的角色。"""
    if not blobs:
        return blobs
    big_px = max(b["px"] for b in blobs)
    mains = [b for b in blobs if b["px"] >= big_px * 0.3]
    orphans = [b for b in blobs if b["px"] < big_px * 0.3]
    for b in blobs:
        ys, xs = np.where(lab == b["id"])
        b["cx"], b["cy"] = xs.mean(), ys.mean()
        b["ids"] = [b["id"]]
    for o in orphans:
        near = min(mains, key=lambda m: (m["cx"] - o["cx"]) ** 2 + (m["cy"] - o["cy"]) ** 2)
        near["ids"].append(o["id"])
        near["px"] += o["px"]
        print("  （把 %d px 的落單區塊併入第 %d 個姿勢）" % (o["px"], mains.index(near) + 1))
    mains.sort(key=lambda b: b["x0"])
    return mains


def to_masks(lab, blobs):
    """把合併後的區塊轉成遮罩清單，之後才好再切開。"""
    return [np.isin(lab, b["ids"]) for b in blobs]


def split_to_count(masks, n):
    """區塊數少於預期時，把最寬的那塊從最窄的欄位切開（兩個角色的武器相連時會用到）。"""
    masks = list(masks)
    guard = 0
    while len(masks) < n and guard < 8:
        guard += 1
        widths = []
        for m in masks:
            xs = np.where(m.any(axis=0))[0]
            widths.append(xs.max() - xs.min() + 1)
        k = int(np.argmax(widths))
        m = masks[k]
        xs = np.where(m.any(axis=0))[0]
        x0, x1 = int(xs.min()), int(xs.max())
        pad = int((x1 - x0) * 0.28)                 # 只在中段找切點，避免切到邊緣
        col = m[:, x0 + pad:x1 - pad].sum(axis=0)
        if col.size == 0:
            break
        cut = x0 + pad + int(np.argmin(col))
        left = m.copy(); left[:, cut:] = False
        right = m.copy(); right[:, :cut] = False
        if left.sum() < 200 or right.sum() < 200:
            break
        print("  （第 %d 塊太寬，從 x=%d 切成兩個角色）" % (k + 1, cut))
        masks[k:k + 1] = [left, right]
        masks.sort(key=lambda mm: np.where(mm.any(axis=0))[0].min())
    return masks


def build(src, dst, names, air=()):
    rgb, alpha = key_out(src)
    mask = alpha > SOLID
    lab, blobs = label_blobs(mask)
    blobs = merge_orphans(lab, blobs)
    masks = split_to_count(to_masks(lab, blobs), len(names))
    print("偵測到 %d 個姿勢" % len(masks))
    if len(masks) != len(names):
        print("!! 姿勢數與名稱數不符（%d vs %d），請確認圖上的角色沒有互相碰到"
              % (len(masks), len(names)))

    ground = int(np.where(mask.any(axis=1))[0].max())      # 最低的腳當地平線

    # 站姿身高：拿來推算空中姿勢的「虛擬地面」，讓每一格的錨點語意一致
    std_h = None
    for m0, nm in zip(masks, names):
        if nm in air:
            continue
        solid = (alpha > SOLID) & m0
        body = np.where(solid.sum(axis=1) > 14)[0]
        h = int(body.max() - body.min() + 1)
        std_h = h if std_h is None else std_h
    if std_h is None:
        std_h = 0

    # 先量每個姿勢相對於錨點的伸展範圍，畫布才不會把披風切掉
    info = []
    for m, nm in zip(masks, names):
        solid = (alpha > SOLID) & m
        rowW = solid.sum(axis=1)
        top = int(np.where(rowW > 14)[0].min())
        hb = solid[top:top + 70]
        hx = np.where(hb.any(axis=0))[0]
        head_cx = (hx.min() + hx.max()) / 2
        ys, xs = np.where(solid)
        anchor_y = (top + std_h) if nm in air else ground   # 空中姿勢用「虛擬地面」
        info.append(dict(m=m, nm=nm, head_cx=head_cx, top=top, anchor_y=anchor_y,
                         l=head_cx - xs.min(), r=xs.max() - head_cx,
                         u=anchor_y - ys.min(), d=ys.max() - anchor_y, px=int(m.sum())))
    PADX = int(max(max(i["l"] for i in info), max(i["r"] for i in info))) + 6
    UP = int(max(i["u"] for i in info)) + 6
    DOWN = int(max(i["d"] for i in info)) + 6
    CW, CH = PADX * 2, UP + DOWN
    TOPY = UP                                          # 錨點在畫布中的 y

    frames, srcpx = [], []
    for i in info:
        m = i["m"]
        fig = Image.fromarray(np.dstack([rgb, np.where(m, alpha, 0) * 255]).astype(np.uint8), "RGBA")
        canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        canvas.paste(fig, (int(PADX - i["head_cx"]), int(TOPY - i["anchor_y"])), fig)
        frames.append(canvas)
        srcpx.append(i["px"])

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
    args = sys.argv[1:]
    air = ()
    if "--air" in args:
        k = args.index("--air")
        air = tuple(args[k + 1].split(","))
        args = args[:k] + args[k + 2:]
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    build(args[0], args[1], args[2:], air)
