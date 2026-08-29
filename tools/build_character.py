#!/usr/bin/env python3
"""把多張綠幕動作圖合併成一份比例一致的角色 sprite sheet。

不同批次產出的角色大小會不一樣，所以要指定一個「站姿參考幀」，
以它的身高把每張圖縮放到同一比例，再用共同錨點（頭部中心 x、地平線 y）對齊。

用法見檔案最下方的設定區。
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from greenscreen_sheet import key_out, label_blobs, merge_orphans, SOLID

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # repo 根目錄


def figures(path, names, air, ref):
    """回傳每個姿勢的圖與量測資料。"""
    rgb, alpha = key_out(path)
    mask = alpha > SOLID
    lab, blobs = label_blobs(mask)
    blobs = merge_orphans(lab, blobs)
    if len(blobs) != len(names):
        raise SystemExit("!! %s 偵測到 %d 個姿勢，但給了 %d 個名稱" % (path, len(blobs), len(names)))
    ground = int(np.where(mask.any(axis=1))[0].max())
    # 先量站姿參考幀的身高，空中姿勢要用它推算「虛擬地面」
    std_h = None
    for blob, nm in zip(blobs, names):
        if nm != ref:
            continue
        solid = (alpha > SOLID) & np.isin(lab, blob["ids"])
        body = np.where(solid.sum(axis=1) > 14)[0]
        std_h = int(body.max() - body.min() + 1)
    out = []
    for blob, nm in zip(blobs, names):
        m = np.isin(lab, blob["ids"])
        solid = (alpha > SOLID) & m
        rowW = solid.sum(axis=1)
        body = np.where(rowW > 14)[0]
        top, bot = int(body.min()), int(body.max())
        hb = solid[top:top + 70]
        hx = np.where(hb.any(axis=0))[0]
        img = Image.fromarray(np.dstack([rgb, np.where(m, alpha, 0) * 255]).astype(np.uint8), "RGBA")
        bb = img.getbbox()
        out.append(dict(name=nm, img=img.crop(bb), bx=bb[0], by=bb[1],
                        head_cx=(hx.min() + hx.max()) / 2, top=top,
                        body_h=bot - top + 1,
                        anchor_y=(top + std_h) if nm in air else ground,
                        px=int(m.sum())))
    return out


def build(sources, dst, ref_frame, target_h=None):
    dst = dst if os.path.isabs(dst) else os.path.join(ROOT, dst)
    all_figs, ref_h = [], None
    for path, names, air, ref in sources:
        figs = figures(path, names, air, ref)
        for f in figs:
            if f["name"] == ref:
                base = f["body_h"]
        for f in figs:
            f["_base"] = base
        all_figs += figs
        print("%s → %d 格，站姿參考 %s 身高 %d px" % (os.path.basename(path), len(figs), ref, base))

    ref_h = [f for f in all_figs if f["name"] == ref_frame][0]["body_h"]
    target = target_h or ref_h
    print("\n統一縮放到站姿身高 %d px：" % target)

    prepared = []
    for f in all_figs:
        s = (target / ref_h) * (ref_h / f["_base"])          # 先對齊各批次，再縮到目標
        im = f["img"]
        nw, nh = max(1, round(im.width * s)), max(1, round(im.height * s))
        im2 = im.resize((nw, nh), Image.LANCZOS)
        ax = (f["head_cx"] - f["bx"]) * s                     # 錨點在縮放後圖中的座標
        ay = (f["anchor_y"] - f["by"]) * s
        prepared.append(dict(name=f["name"], img=im2, ax=ax, ay=ay,
                             h=round(f["body_h"] * s), scale=s))
        print("  %-11s 縮放 %.3f → 身高 %d px" % (f["name"], s, round(f["body_h"] * s)))

    PADX = int(max(max(p["ax"] for p in prepared),
                   max(p["img"].width - p["ax"] for p in prepared))) + 4
    UP = int(max(p["ay"] for p in prepared)) + 4
    DOWN = int(max(p["img"].height - p["ay"] for p in prepared)) + 4
    FW, FH = PADX * 2, UP + DOWN
    os.makedirs(dst, exist_ok=True)
    sheet = Image.new("RGBA", (FW * len(prepared), FH), (0, 0, 0, 0))
    for i, p in enumerate(prepared):
        sheet.paste(p["img"], (i * FW + int(PADX - p["ax"]), int(UP - p["ay"])), p["img"])
    sheet.save(os.path.join(dst, "sheet.png"), optimize=True)
    json.dump({"frames": [p["name"] for p in prepared], "frame_w": FW, "frame_h": FH,
               "anchor": {"x": PADX, "y": UP},
               "note": "anchor 是角色的頭部中心 x 與地平線 y；空中姿勢以頭頂對齊，其餘以地平線對齊"},
              open(os.path.join(dst, "frames.json"), "w"), ensure_ascii=False, indent=2)
    print("\n畫格 %dx%d x %d 格，sheet.png %.0f KB"
          % (FW, FH, len(prepared), os.path.getsize(os.path.join(dst, "sheet.png")) / 1024))
    return prepared


if __name__ == "__main__":
    U = "/root/.claude/uploads/a00c3426-eadb-56be-b7d5-c44c6a7b378f/"
    build(
        sources=[
            (U + "914c3a25-image.jpg",
             ["idle", "walk1", "walk2", "jump", "atk_up", "atk_thrust"], ("jump",), "idle"),
            (U + "1ad07008-image.jpg",
             ["fall", "hurt", "sit_cry", "victory"], ("fall", "hurt"), "victory"),
        ],
        dst="assets/character/anim",
        ref_frame="idle",
    )
