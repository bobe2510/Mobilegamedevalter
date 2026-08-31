#!/usr/bin/env python3
"""把綠幕的表情差分圖切成一張張半身立繪。

用法：
    python3 tools/build_busts.py mage

會讀 assets/character/<角色>/raw/bust-a.*、bust-b.* …（開頭 bust- 就行），
依 BUSTS 的表情名稱由左到右對應，切成 assets/character/<角色>/bust/<表情>.png。

跟動作圖一樣，第二張以後的第 1 格重畫同一個 NORMAL 當基準格，用來對齊
兩張的縮放；名稱前面加底線的不會輸出。

對齊方式跟動作圖不同：立繪沒有地平線，所以用**頭高**統一縮放、
用**臉的中心 x** 對齊，這樣切表情時頭不會跳。
"""
import glob
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from greenscreen_sheet import key_out, label_blobs, merge_orphans, to_masks, split_to_count, SOLID

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 每張圖由左到右的表情名稱；底線開頭 = 只用來對齊，不輸出
BUSTS = {
    "mage": [
        ("bust-a", ["normal", "worried", "relieved", "scold", "speechless"]),
        ("bust-b", ["_ref", "sly", "serious", "flustered", "soft"]),
    ],
}

OUT_H = 640          # 輸出的立繪高度（遊戲裡最多顯示約 190 實際 px，這個綽綽有餘）


def face_metrics(rgb, solid, top, H):
    """回傳 (臉中心 x, 頭高)。頭高 = 頭頂到下巴，用膚色找臉。"""
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    skin = solid & (r > 195) & (g > 150) & (b > 120) & (r > b + 20) & ((r - g) < 75)
    band = skin[top:top + int(H * 0.85)]
    ys, xs = np.where(band)
    if len(xs) < 40:
        cols = np.where(solid.any(axis=0))[0]
        return float((cols.min() + cols.max()) / 2), H * 0.5
    sel = ys <= ys.min() + H * 0.6
    return float(xs[sel].mean()), float(ys[sel].max() + 1)


def cut(path, names):
    rgb, alpha = key_out(path)
    mask = alpha > SOLID
    lab, blobs = label_blobs(mask)
    masks = split_to_count(to_masks(lab, merge_orphans(lab, blobs)), len(names))
    if len(masks) != len(names):
        raise SystemExit("!! %s 偵測到 %d 格，但給了 %d 個表情名稱"
                         % (os.path.basename(path), len(masks), len(names)))
    out = []
    for m, nm in zip(masks, names):
        solid = (alpha > SOLID) & m
        rows = np.where(solid.sum(axis=1) > 6)[0]
        top, bot = int(rows.min()), int(rows.max())
        cx, head = face_metrics(rgb, solid, top, bot - top + 1)
        img = Image.fromarray(np.dstack([rgb, np.where(m, alpha, 0) * 255]).astype(np.uint8), "RGBA")
        out.append(dict(name=nm, img=img, cx=cx, top=top, bot=bot, head=head))
    return out


def build(who):
    src_dir = os.path.join(ROOT, "assets", "character", who, "raw")
    dst_dir = os.path.join(ROOT, "assets", "character", who, "bust")
    os.makedirs(dst_dir, exist_ok=True)
    figs = []
    for stem, names in BUSTS[who]:
        hits = sorted(g for g in glob.glob(os.path.join(src_dir, stem + "*"))
                      if os.path.splitext(g)[1].lower() in (".png", ".jpg", ".jpeg", ".webp"))
        if not hits:
            raise SystemExit("!! 找不到 %s/%s*" % (src_dir, stem))
        got = cut(hits[0], names)
        print("%s → %d 格，頭高 %s"
              % (os.path.basename(hits[0]), len(got), " ".join("%.0f" % f["head"] for f in got)))
        figs.append((got, got[0]["head"]))

    base = figs[0][1]                      # 用第一張的第一格當基準頭高
    print("\n統一頭高到 %.0f px：" % base)
    written = 0
    for got, ref_head in figs:
        k = base / ref_head
        for f in got:
            if f["name"].startswith("_"):
                continue
            im = f["img"]
            # 以「臉中心 x、頭頂 y」為錨點裁一個固定框，切表情時頭才不會跳
            fw, fh = base * 3.2, base * 4.0
            x0 = f["cx"] - fw / 2
            y0 = f["top"] - base * 0.35
            box = im.crop((round(x0), round(y0), round(x0 + fw), round(y0 + fh)))
            s = OUT_H / (fh * k) * k
            box = box.resize((max(1, round(fw * s)), OUT_H), Image.LANCZOS)
            out = os.path.join(dst_dir, f["name"] + ".png")
            box.save(out, optimize=True)
            print("  %-11s → %s (%.0f KB)"
                  % (f["name"], os.path.basename(out), os.path.getsize(out) / 1024))
            written += 1
    print("\n共 %d 張，放在 %s" % (written, os.path.relpath(dst_dir, ROOT)))


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "mage")
