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
from greenscreen_sheet import key_out, label_blobs, merge_orphans, to_masks, split_to_count, SOLID

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # repo 根目錄


def figures(path, names, air, ref):
    """回傳每個姿勢的圖與量測資料。"""
    rgb, alpha = key_out(path)
    mask = alpha > SOLID
    lab, blobs = label_blobs(mask)
    blobs = merge_orphans(lab, blobs)
    masks = split_to_count(to_masks(lab, blobs), len(names))
    if len(masks) != len(names):
        raise SystemExit("!! %s 偵測到 %d 個姿勢，但給了 %d 個名稱" % (path, len(masks), len(names)))
    ground = int(np.where(mask.any(axis=1))[0].max())
    # 先量站姿參考幀的身高，空中姿勢要用它推算「虛擬地面」
    std_h = None
    for m0, nm in zip(masks, names):
        if nm != ref:
            continue
        solid = (alpha > SOLID) & m0
        body = np.where(solid.sum(axis=1) > 14)[0]
        std_h = int(body.max() - body.min() + 1)
    out = []
    for m, nm in zip(masks, names):
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

    # 底線開頭的是「基準格」：每張綠幕圖都重畫同一個站姿，用來對齊各批次的縮放。
    # 對齊完就丟掉，不會進最終的 sheet。
    dropped = [f["name"] for f in all_figs if f["name"].startswith("_")]
    if dropped:
        print("  （基準格 %s 只用來對齊縮放，不寫進 sheet）" % "、".join(dropped))

    prepared = []
    for f in all_figs:
        if f["name"].startswith("_"):
            continue
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
               "anchor": {"x": PADX, "y": UP}, "stand_h": target,
               "note": "anchor 是角色的頭部中心 x 與地平線 y；空中姿勢以頭頂對齊，其餘以地平線對齊"},
              open(os.path.join(dst, "frames.json"), "w"), ensure_ascii=False, indent=2)
    print("\n畫格 %dx%d x %d 格，sheet.png %.0f KB"
          % (FW, FH, len(prepared), os.path.getsize(os.path.join(dst, "sheet.png")) / 1024))
    return prepared


CHARACTERS = {
    # 小公主：白金鎧的劍士
    "knight": dict(
        dst="assets/character/knight/anim",
        ref="idle",
        sources=[
            ("914c3a25-image.jpg",
             ["idle", "walk1", "walk2", "jump", "atk_up", "atk_thrust"], ("jump",), "idle"),
            ("1ad07008-image.jpg",
             ["fall", "hurt", "sit_cry", "victory"], ("fall", "hurt"), "victory"),
        ],
    ),
    # 魔法大臣：藍色系的魔女，atk_thrust = 射出魔法飛彈，sit_cry = 跪地撐杖
    "mage": dict(
        dst="assets/character/mage/anim",
        ref="idle",
        sources=[
            ("c0feed91-image.jpg",
             ["idle", "walk1", "walk2", "jump", "atk_up", "atk_thrust"], ("jump",), "idle"),
            ("bc36a5f7-image.jpg",
             ["fall", "hurt", "sit_cry", "victory"], ("fall", "hurt"), "victory"),
        ],
    ),
    # 長公主：白金鎧 + 紅披風的大劍騎士，攻速最快
    "elder": dict(
        dst="assets/character/elder/anim",
        ref="idle",
        sources=[
            ("b2827476-image.jpg",
             ["idle", "walk1", "walk2", "jump", "atk_up", "atk_thrust"], ("jump",), "idle"),
            ("1f913f97-image.jpg",
             ["fall", "hurt", "sit_cry", "victory"], ("fall", "hurt"), "victory"),
        ],
    ),
}

# 下一批動作圖的格名（規格見 assets/character/SPRITE_SHEETS.md）。
# 圖進來之後把檔名填進 CHARACTERS 的 sources 就好；`_ref` 是每張的基準站姿，
# 只用來對齊各批次的縮放，不會寫進最終 sheet。
NEXT_SHEETS = {
    "A": (["idle", "run1", "run2", "run3", "run4"], ("run2", "run4")),
    "B": (["_ref", "jump", "apex", "fall", "land"], ("_ref", "jump", "apex", "fall")),
    "C": (["_ref", "atk1_wind", "atk1_hit", "atk2_hit"], ("_ref",)),
    "D": (["_ref", "atk3_hit", "special1", "special2"], ("_ref",)),
    # 魔法大臣專屬：拿小熊貓子機聯絡失聯的熊貓
    "E": (["_ref", "call1", "call2", "call3", "call4"], ("_ref",)),
}

if __name__ == "__main__":
    U = "/root/.claude/uploads/a00c3426-eadb-56be-b7d5-c44c6a7b378f/"
    who = sys.argv[1] if len(sys.argv) > 1 else "knight"
    cfg = CHARACTERS[who]
    print("=== %s ===" % who)
    build(
        sources=[(U + f, n, a, r) for f, n, a, r in cfg["sources"]],
        dst=cfg["dst"],
        ref_frame=cfg["ref"],
        target_h=cfg.get("target_h"),
    )
