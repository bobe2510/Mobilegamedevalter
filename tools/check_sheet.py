#!/usr/bin/env python3
"""檢查一張綠幕動作圖：每個姿勢的大小、頭身比、間隙是否一致。

Grok 每次產圖的頭身比會飄，這支會把飄的程度量出來，並可以自動校正
（把每個姿勢縮放到頭高一致——頭是眼睛最會盯的地方，頭一跳就很明顯）。

    python3 tools/check_sheet.py <綠幕圖> <姿勢數>
    python3 tools/check_sheet.py <綠幕圖> <姿勢數> --fix <輸出圖>
"""
import sys, os
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from greenscreen_sheet import key_out, label_blobs, merge_orphans, to_masks, split_to_count, SOLID


def head_height(rgb, solid, top, H):
    """頭頂到下巴：用膚色找臉，只看上半部避開裸露的大腿。"""
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    skin = solid & (r > 195) & (g > 150) & (b > 120) & (r > b + 20) & ((r - g) < 75)
    band = skin[top:top + int(H * 0.5)]
    ys = np.where(band.any(axis=1))[0]
    return int(ys.max()) + 1 if len(ys) else None


def measure(path, count):
    rgb, alpha = key_out(path)
    mask = alpha > SOLID
    lab, blobs = label_blobs(mask)
    blobs = merge_orphans(lab, blobs)
    masks = split_to_count(to_masks(lab, blobs), count)
    if len(masks) != count:
        raise SystemExit('!! 偵測到 %d 個姿勢，但預期 %d 個' % (len(masks), count))
    out = []
    for i, m in enumerate(masks):
        solid = (alpha > SOLID) & m
        rows = np.where(solid.sum(axis=1) > 14)[0]
        cols = np.where(solid.sum(axis=0) > 3)[0]
        top, bot = int(rows.min()), int(rows.max())
        H = bot - top + 1
        out.append(dict(i=i, mask=m, top=top, bot=bot, h=H,
                        x0=int(cols.min()), x1=int(cols.max()),
                        head=head_height(rgb, solid, top, H)))
    return rgb, alpha, out


def report(figs, W):
    print('%-4s %-8s %-8s %-9s %s' % ('姿勢', '身高', '頭高', '頭身比', '水平範圍'))
    ratios = []
    for f in figs:
        if f['head']:
            rr = f['h'] / f['head']
            ratios.append(rr)
            print('  %-4d %5d px %6d px %7.2f 頭身  x %4d~%4d'
                  % (f['i'] + 1, f['h'], f['head'], rr, f['x0'], f['x1']))
        else:
            print('  %-4d %5d px      —          —      x %4d~%4d（看不到臉）'
                  % (f['i'] + 1, f['h'], f['x0'], f['x1']))
    if ratios:
        lo, hi = min(ratios), max(ratios)
        spread = (hi - lo) / (sum(ratios) / len(ratios)) * 100
        verdict = '✅ 穩定' if spread < 8 else ('🔸 有點飄' if spread < 18 else '❌ 飄很多，建議重產')
        print('\n頭身比 %.2f ~ %.2f，變異 %.0f%%   %s' % (lo, hi, spread, verdict))
    hs = [f['h'] for f in figs]
    print('身高 %d ~ %d px，變異 %.0f%%' % (min(hs), max(hs), (max(hs) - min(hs)) / (sum(hs) / len(hs)) * 100))
    gaps = []
    order = sorted(figs, key=lambda f: f['x0'])
    for a, b in zip(order, order[1:]):
        gaps.append(b['x0'] - a['x1'])
    if gaps:
        bad = [g for g in gaps if g < 25]
        print('姿勢間隙 %s px   %s' % (gaps, '❌ 太窄，去背可能會黏在一起' if bad else '✅ 夠寬'))


def fix(rgb, alpha, figs, dst, ref=0):
    """把每個姿勢縮放到與參考姿勢頭高一致。"""
    base = figs[ref]['head']
    if not base:
        raise SystemExit('!! 參考姿勢看不到臉，無法對齊頭高')
    canvas = Image.new('RGBA', (rgb.shape[1], rgb.shape[0]), (0, 0, 0, 0))
    for f in figs:
        img = Image.fromarray(np.dstack([rgb, np.where(f['mask'], alpha, 0) * 255]).astype(np.uint8), 'RGBA')
        bb = img.getbbox()
        crop = img.crop(bb)
        s = 1.0 if not f['head'] else base / f['head']
        nw, nh = max(1, round(crop.width * s)), max(1, round(crop.height * s))
        crop = crop.resize((nw, nh), Image.LANCZOS)
        # 以腳底中心對齊回原位
        cx = (bb[0] + bb[2]) / 2
        canvas.alpha_composite(crop, (int(cx - nw / 2), int(f['bot'] - nh + (bb[3] - f['bot']) * s)))
        if f['head']:
            print('  姿勢 %d 縮放 %.3f' % (f['i'] + 1, s))
    canvas.save(dst)
    print('→ %s' % dst)


if __name__ == '__main__':
    path, count = sys.argv[1], int(sys.argv[2])
    rgb, alpha, figs = measure(path, count)
    print('=== %s（%d 格）===' % (os.path.basename(path), count))
    report(figs, rgb.shape[1])
    if '--fix' in sys.argv:
        print('\n對齊頭高：')
        fix(rgb, alpha, figs, sys.argv[sys.argv.index('--fix') + 1])
