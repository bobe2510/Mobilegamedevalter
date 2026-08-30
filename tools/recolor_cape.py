"""把小公主 sprite 的紅披風改成冷銀白，紅緞帶保持紅色。

這是暫時的過渡處理——之後重拍的動作圖會直接畫成白披風。
判定規則：紅色連通區塊裡，位置在角色上緣 38% 以內、而且不到最大塊 30% 的，
判定為緞帶（綁在馬尾根部），維持原色；其餘都是披風。
"""
import sys, os, colorsys
import numpy as np
from PIL import Image
sys.path.insert(0, 'tools')
from greenscreen_sheet import label_blobs


def red_mask(rgb, al):
    r, g, b = [rgb[..., i].astype(float) for i in range(3)]
    mx, mn = rgb.max(2).astype(float), rgb.min(2).astype(float)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    return (al > 0) & (g < r * 0.52) & (b < r * 0.60) & (sat > 0.45) & (mx > 40)


def cape_of(red, al):
    """從紅色區塊裡挑出披風（排除緞帶）。"""
    keep = np.zeros_like(red)
    lab, blobs = label_blobs(red)
    if not blobs:
        return keep
    ys = np.where((al > 0).any(axis=1))[0]
    if not len(ys):
        return keep
    top, bot = ys.min(), ys.max()
    head_band = top + (bot - top) * 0.38          # 馬尾根部落在這個範圍內
    big = max(bl["px"] for bl in blobs)
    for bl in blobs:
        m = (lab == bl["id"])
        cy = np.where(m.any(axis=1))[0].mean()
        ribbon = cy < head_band and bl["px"] < big * 0.30
        if not ribbon:
            keep |= m
    return keep


def recolor(src, dst, hue=0.60, sat=0.20, lo=0.42, hi=0.96, frames=1):
    a = np.array(Image.open(src).convert('RGBA'))
    h, w = a.shape[:2]
    fw = w // frames
    total = 0
    for i in range(frames):                        # 一格一格處理，避免跨格互相影響
        sl = slice(i * fw, (i + 1) * fw)
        rgb, al = a[:, sl, :3], a[:, sl, 3]
        m = cape_of(red_mask(rgb, al), al)
        v = rgb.max(2).astype(float) / 255.0
        v2 = np.clip(lo + v * (hi - lo), 0, 1)
        for y, x in zip(*np.where(m)):
            rr, gg, bb = colorsys.hsv_to_rgb(hue, sat, v2[y, x])
            a[y, i * fw + x, :3] = [round(rr * 255), round(gg * 255), round(bb * 255)]
        total += int(m.sum())
    Image.fromarray(a).save(dst, optimize=True)
    return total


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 1
    print('%-14s 改色 %d px（%d 格）' % (os.path.basename(dst), recolor(src, dst, frames=n), n))
