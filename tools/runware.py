#!/usr/bin/env python3
"""Runware 影像 API 的小包裝：產圖與「只改表情」的編輯。

金鑰只從環境變數 RUNWARE_API_KEY 讀，不會寫進檔案也不會印出來。

用法：
    # 產圖（文字轉圖）
    python3 tools/runware.py gen out.jpg "prompt..." --w 1536 --h 864 --seed 3001

    # 編輯（只改指定的地方，其他原封不動）
    python3 tools/runware.py edit src.jpg out.jpg "Change ONLY her expression to ..."

實測筆記（2026-09）：
  * 產**遊戲用的小 sprite** 建議還是用 Grok——線條更粗、色塊對比更強，
    在 70 px 的顯示尺寸下讀得清楚；Runware 上的模型偏「插畫」，縮小會糊。
  * 產**大圖**（過場 CG、封面、結算插畫）與**表情差分**則是 Runware 大勝。
  * 動漫專精的 SDXL checkpoint（Animagine / Illustrious / NoobAI）畫風好看但
    **不聽版面指令**——綠幕、側面、多格排版都做不到。要挑**指令遵循強**的
    模型（如 alibaba:qwen-image@3.0），這點跟直覺相反。
  * outputType 用 base64Data 才拿得到圖（圖片 CDN 的網域被代理擋住）；
    PNG 在大尺寸會回不了圖，用 JPG。
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import time
import urllib.request
import uuid

URL = "https://api.runware.ai/v1"
DEFAULT_MODEL = "alibaba:qwen-image@3.0"


def call(tasks, timeout=600):
    """送一批 task。注意：一次送太多會 504（實測 6 張就會），
    要一次產很多張請用 call_many()。"""
    key = os.environ.get("RUNWARE_API_KEY")
    if not key:
        raise SystemExit("!! 沒有 RUNWARE_API_KEY（在環境設定裡加，不要貼在對話或程式碼裡）")
    for t in tasks:
        t.setdefault("taskUUID", str(uuid.uuid4()))
    req = urllib.request.Request(
        URL, data=json.dumps(tasks).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"_httpError": e.code, "_body": e.read().decode()[:4000]}
    except Exception as e:                       # 連線中斷、逾時之類
        return {"_httpError": 0, "_body": repr(e)}


def call_many(tasks, chunk=2, timeout=600, retries=2, on_result=None):
    """分批送，逐批重試，任何一批掛掉不影響其他批。

    一次送六張實測會 504（gateway timeout），而且整批的結果都拿不回來——
    圖已經產了、錢也扣了，只是 URL 收不到。所以寧可分小批多送幾次。

    on_result(task, result) 會在每張成功時立刻呼叫，讓呼叫端可以馬上存檔，
    不必等整批跑完。回傳 (成功數, 失敗的 task 清單, 總花費)。
    """
    ok, failed, cost = 0, [], 0.0
    for i in range(0, len(tasks), chunk):
        batch = tasks[i:i + chunk]
        for attempt in range(retries + 1):
            d = call(batch, timeout=timeout)
            if "_httpError" not in d and "errors" not in d:
                break
            why = d.get("_httpError") or "errors"
            if attempt < retries:
                print("   （第 %d~%d 張失敗：%s，重試 %d/%d）"
                      % (i + 1, i + len(batch), why, attempt + 1, retries))
                time.sleep(3 * (attempt + 1))
        if "_httpError" in d or "errors" in d:
            body = d.get("_body") or json.dumps(d.get("errors", ""), ensure_ascii=False)
            print("   ❌ 第 %d~%d 張放棄：%s" % (i + 1, i + len(batch), str(body)[:200]))
            failed += batch
            continue
        by = {r.get("taskUUID"): r for r in d.get("data", [])}
        for t in batch:
            r = by.get(t["taskUUID"])
            if not r:
                failed.append(t)
                continue
            cost += r.get("cost") or 0
            ok += 1
            if on_result:
                on_result(t, r)
    return ok, failed, cost


def _fetch(url, dst):
    """從 im.runware.ai 下載（代理已放行）。"""
    urllib.request.urlretrieve(url, dst)


def _save(data, dst):
    """把回應裡的影像寫成檔案，回傳 (張數, 花費)。"""
    if "_httpError" in data:
        raise SystemExit("!! HTTP %s\n%s" % (data["_httpError"], data["_body"]))
    if "errors" in data:
        raise SystemExit("!! " + json.dumps(data["errors"], ensure_ascii=False, indent=2))
    n, cost = 0, 0.0
    results = data.get("data", [])
    for i, r in enumerate(results):
        cost += r.get("cost") or 0
        out = dst if len(results) == 1 else "%s-%d%s" % (os.path.splitext(dst)[0], i + 1,
                                                         os.path.splitext(dst)[1])
        b64 = r.get("imageBase64Data")
        if b64:
            open(out, "wb").write(base64.b64decode(b64.split(",")[-1]))
        elif r.get("imageURL"):
            _fetch(r["imageURL"], out)
        else:
            print("   （第 %d 張沒有回傳影像，欄位：%s）" % (i + 1, ",".join(r.keys())))
            continue
        print("   → %s (%.0f KB)" % (out, os.path.getsize(out) / 1024))
        n += 1
    print("共 %d 張，花費 US$%.4f" % (n, cost))
    return n, cost


def generate(dst, prompt, model=DEFAULT_MODEL, w=1024, h=1024, seed=None,
             negative=None, steps=None, cfg=None, n=1):
    task = {"taskType": "imageInference", "model": model, "positivePrompt": prompt,
            "width": w, "height": h, "numberResults": n,
            "outputType": "base64Data", "outputFormat": "JPG", "includeCost": True}
    if seed is not None:
        task["seed"] = seed
    if negative:
        task["negativePrompt"] = negative
    if steps:
        task["steps"] = steps
    if cfg:
        task["CFGScale"] = cfg
    return _save(call([task]), dst)


def edit(src, dst, prompt, model=DEFAULT_MODEL, w=None, h=None, n=1):
    """以 src 為底做局部修改。prompt 要明講『只改什麼、其餘完全不變』。"""
    from PIL import Image
    im = Image.open(src)
    w = w or im.width
    h = h or im.height
    mime = "image/png" if src.lower().endswith(".png") else "image/jpeg"
    ref = "data:%s;base64,%s" % (mime, base64.b64encode(open(src, "rb").read()).decode())
    task = {"taskType": "imageInference", "model": model, "positivePrompt": prompt,
            "referenceImages": [ref], "width": w, "height": h, "numberResults": n,
            "outputType": "base64Data", "outputFormat": "JPG", "includeCost": True}
    return _save(call([task]), dst)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("gen", help="文字轉圖")
    g.add_argument("dst"); g.add_argument("prompt")
    g.add_argument("--model", default=DEFAULT_MODEL)
    g.add_argument("--w", type=int, default=1024); g.add_argument("--h", type=int, default=1024)
    g.add_argument("--seed", type=int); g.add_argument("--neg")
    g.add_argument("--steps", type=int); g.add_argument("--cfg", type=float)
    g.add_argument("-n", type=int, default=1)

    e = sub.add_parser("edit", help="以既有圖片為底做局部修改")
    e.add_argument("src"); e.add_argument("dst"); e.add_argument("prompt")
    e.add_argument("--model", default=DEFAULT_MODEL)
    e.add_argument("--w", type=int); e.add_argument("--h", type=int)
    e.add_argument("-n", type=int, default=1)

    s = sub.add_parser("models", help="搜尋模型")
    s.add_argument("term"); s.add_argument("--category", default="checkpoint")
    s.add_argument("--limit", type=int, default=20)

    a = ap.parse_args()
    if a.cmd == "gen":
        generate(a.dst, a.prompt, a.model, a.w, a.h, a.seed, a.neg, a.steps, a.cfg, a.n)
    elif a.cmd == "edit":
        edit(a.src, a.dst, a.prompt, a.model, a.w, a.h, a.n)
    else:
        d = call([{"taskType": "modelSearch", "search": a.term,
                   "category": a.category, "limit": a.limit}])
        if "_httpError" in d:
            raise SystemExit("!! HTTP %s %s" % (d["_httpError"], d["_body"][:400]))
        blk = d.get("data", [{}])[0]
        rows = blk.get("results", [])
        rows.sort(key=lambda r: r.get("inferenceCount24h", 0), reverse=True)
        print("共 %s 筆，依 24h 用量排序：" % blk.get("totalResults", "?"))
        for r in rows:
            print("  %-40s %-32s %s" % (r["name"][:40], r["air"][:32],
                                        r.get("architecture", "")))


if __name__ == "__main__":
    main()
