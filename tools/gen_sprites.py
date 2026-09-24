#!/usr/bin/env python3
"""用定裝圖當 reference，一張圖產一個姿勢。

為什麼是「一姿勢一張」而不是「一張排五格」：
  * 排版圖會有間隙問題——實測加了 reference 之後模型把注意力花在對齊角色，
    間隙就縮到負數（人物疊在一起），去背會黏住
  * 一姿勢一張在結構上不可能黏住，去背永遠只有一個區塊
  * 想補幾格就補幾格，某一格壞掉只要重產那一格（US$0.03）
  * 大小不一致由 build_character.py 用頭高對齊處理，本來就會做

輸出到 assets/character/<角色>/frames/<姿勢>.jpg，
接著用 `python3 tools/build_character.py <角色>_frames` 合成 sheet。

    python3 tools/gen_sprites.py knight              # 產全部
    python3 tools/gen_sprites.py knight idle run1    # 只補這幾格
"""
import base64
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from runware import call_many

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = "alibaba:qwen-image@3.0"

# 這段是關鍵：講「這是要縮很小顯示的遊戲素材」比逐條下指令有效，
# 而且它同時把背景也修對了。不要拿掉。
STYLE = (
 "ART STYLE — this is the most important part: a classic 2D game sprite meant to be shown "
 "very small on screen, so it must read clearly at tiny size. Use THICK DARK OUTLINES around "
 "every shape, BOLD FLAT COLOR BLOCKS with a limited palette, strong light-dark contrast, and "
 "chunky simplified forms. No fine linework, no thin lines, no soft gradients, no airbrushed "
 "shading, no painterly rendering, no glossy highlights. Think 16-bit JRPG sprite art, not a "
 "detailed illustration. ")

BG = ("The background is COMPLETELY FLAT PURE GREEN (#00FF00) — no scenery, no frame, no "
      "border, no shadow, no gradient, no ground texture, no text, no labels.")

FRAME = ("Draw ONE single full-body figure, centered in the frame, in strict side view "
         "FACING RIGHT, standing on a level ground line. ")

# 三個主角共用的姿勢表。{w} 會換成該角色的武器講法。
POSES = {
 "idle":      "{s} stands at rest, weight on both feet, {w} lowered at {p} side, calm face.",
 "run1":      "{s} is running: the RIGHT leg forward with the heel striking the ground and the "
              "left leg extended far behind, feet FAR APART, torso leaning forward, body LOW.",
 "run2":      "{s} is running mid-stride with BOTH FEET OFF THE GROUND, the rear leg swinging "
              "through directly under the body so the legs are CLOSE TOGETHER, body at its "
              "HIGHEST point.",
 "run3":      "{s} is running: the LEFT leg forward with the heel striking the ground and the "
              "right leg extended far behind, feet FAR APART, body LOW, opposite arm swing.",
 "run4":      "{s} is running mid-stride with BOTH FEET OFF THE GROUND again, legs CLOSE "
              "TOGETHER under the body, body HIGH, opposite arm swing.",
 "jump":      "{s} has just left the ground and is rising, both knees pulled up toward the "
              "chest, arms up, cape and hair streaming downward.",
 "apex":      "{s} is at the top of a jump, body upright, legs slightly apart and relaxed, "
              "cape spread out.",
 "fall":      "{s} is falling, legs reaching down toward the ground, arms slightly out for "
              "balance, cape and hair streaming upward.",
 "land":      "{s} has just landed: a deep knee bend, free hand near the ground, head low, "
              "cape settling downward.",
 "atk1_wind": "{s} winds up to attack: {w} raised high overhead and drawn back, body coiled, "
              "back foot planted, weight on the back leg.",
 "atk1_hit":  "{s} swings {w} down and forward in a diagonal slash, front foot stepping in.",
 "atk2_hit":  "{s} sweeps {w} horizontally across the body from the opposite side, torso "
              "rotated, hair and cape trailing the motion.",
 "atk3_hit":  "{s} delivers a heavy lunging strike, {w} driven far forward, front leg deep "
              "and bent, back leg fully extended, the whole body committed.",
 "hurt":      "{s} is knocked backwards in pain, head thrown back, eyes screwed shut, one arm "
              "flung up, body arched away from the blow.",
 "victory":   "{s} celebrates, {w} raised triumphantly overhead, head up, eyes closed in a "
              "wide happy smile.",
}

# 熊貓的姿勢跟人不一樣：沒有武器，而且有「四足拉車」這個型態
PANDA_POSES = {
 "idle":   "The plush panda stands upright at rest, arms hanging at its sides, looking ahead.",
 "walk1":  "The plush panda waddles forward: its RIGHT leg is forward and planted, the left leg "
           "back, body tilted slightly forward, short arms swinging in opposition.",
 "walk2":  "The plush panda is mid-waddle with BOTH FEET just off the ground in a small hop, "
           "legs close together under the body, body at its highest point.",
 "walk3":  "The plush panda waddles forward: its LEFT leg is forward and planted, the right leg "
           "back, opposite arm swing to the previous pose.",
 "walk4":  "The plush panda is mid-waddle with BOTH FEET just off the ground again, legs close "
           "together, opposite arm swing.",
 "jump":   "The plush panda hops upward, both short legs tucked up, both arms raised, body "
           "stretched slightly taller.",
 "fall":   "The plush panda is falling, short legs reaching down toward the ground, arms out "
           "to the sides for balance.",
 "talk":   "The plush panda stands upright and gestures as if speaking politely, one short arm "
           "raised and held forward, head tilted slightly up, mouth open a little.",
 "tilt":   "The plush panda stands upright and tilts its head far to one side in curiosity, "
           "arms still at its sides.",
 "pull":   "The plush panda is down on ALL FOURS like a real panda, leaning forward and "
           "straining to pull something heavy behind it, a simple brown leather harness around "
           "its shoulders, head low and determined.",
}

CHARS = {
 "panda": dict(
   ref="assets/character/panda/REFERENCE.png", s="It", p="its", w="",
   poses=PANDA_POSES,
   keep=("the same chubby plush panda body, the same face with the small black button eyes "
         "and stitched smile, the same black ears and black arms and legs, the same white "
         "face and white belly, and the same LARGE blue ribbon bow at its neck with wide "
         "loops and long hanging tails")),
 "knight": dict(
   ref="assets/character/knight/REFERENCE.png", s="She", p="her", w="her longsword",
   keep=("the same face, the same golden-blonde high ponytail with the red ribbon, the same "
         "gold tiara, the same white-and-gold armor with shoulder pauldrons and the blue "
         "collar gem, the same white cape with gold edge, the same longsword"),
   extra={"special1": "{s} crouches low, {w} drawn back across the body in both hands, "
                      "about to spin.",
          "special2": "{s} is mid-spin, {w} swept all the way around at waist height, "
                      "ponytail and cape whipped out horizontally.",
          "sit_cry":  "{s} sits on the ground crying, both fists rubbing her eyes, big comedic "
                      "anime tears, mouth open in a wobbly pout, {w} lying on the ground beside her."}),
 "mage": dict(
   ref="assets/character/mage/REFERENCE.png", s="She", p="her", w="her wooden staff",
   keep=("the same face, the same long black hair, the same pointed dark-blue witch hat with "
         "the gold buckle, the same dark-blue robe-cape with gold trim over a white blouse, "
         "the same black leggings and blue boots, the same wooden staff with the blue crystal, "
         "and the same small panda plush with a blue bow hanging from the staff"),
   extra={"special1": "{s} stands firm, {w} raised straight up in both hands, head tilted "
                      "back, chanting.",
          "special2": "{s} sweeps {w} forward and down, the crystal pointing ahead, free hand "
                      "thrown out, hair and robe blown back.",
          "sit_cry":  "{s} has dropped to one knee, one hand gripping {w} planted in the "
                      "ground holding her weight, the other hand flat on the ground, head "
                      "down, eyes closed, exhausted but not crying.",
          "call1":    "{s} has unhooked the small panda plush from the staff and holds it in "
                      "one open palm at chest height, looking down at it.",
          "call2":    "{s} holds the small panda plush up in front of her face with both "
                      "hands the way someone looks at a phone, a faint frown.",
          "call3":    "{s} presses the small panda plush against her ear, head tilted toward "
                      "it, eyes narrowed, eyebrows drawn together, listening hard.",
          "call4":    "The hand holding the small panda plush has dropped to her side; {s} "
                      "looks away and down, mouth a small flat line, clearly worried."}),
 "elder": dict(
   ref="assets/character/elder/REFERENCE.png", s="She", p="her", w="her two-handed greatsword",
   keep=("the same face, the same RED eyes, the same golden-blonde high ponytail with the red "
         "ribbon, the same gold circlet, the same white-and-gold plate armor with red cloth "
         "under-layers, the same long red cape with gold vine patterns, and the same "
         "two-handed greatsword with the gold cross-guard"),
   extra={"special1": "{s} crouches very low like a sprinter in the blocks, {w} drawn back "
                      "and held low behind her, about to burst forward.",
          "special2": "{s} stands tall after the strike, {w} swept fully out behind her at hip "
                      "height, body turned slightly away, NOT looking back.",
          "sit_cry":  "{s} is down on one knee, both hands gripping {w} driven point-down into "
                      "the ground holding her upright, head bowed but eyes open and forward, "
                      "teeth clenched, furious at herself."}),
}


def reference(path):
    from PIL import Image
    im = Image.open(os.path.join(ROOT, path)).convert("RGB")
    im.thumbnail((1400, 1400), Image.LANCZOS)
    tmp = "/tmp/_ref.jpg"
    im.save(tmp, quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(open(tmp, "rb").read()).decode()


def build(who, only=None, seed=6001, w=768, h=1024):
    cfg = CHARS[who]
    ref = reference(cfg["ref"])
    dst = os.path.join(ROOT, "assets", "character", who, "frames")
    os.makedirs(dst, exist_ok=True)
    poses = dict(cfg["poses"]) if "poses" in cfg else dict(POSES)
    poses.update(cfg.get("extra", {}))
    if only:
        poses = {k: v for k, v in poses.items() if k in only}
        missing = set(only) - set(poses)
        if missing:
            raise SystemExit("!! 沒有這些姿勢：%s" % ", ".join(sorted(missing)))

    it = cfg["s"] == "It"
    head = ("Use the character in the reference image. Keep %s EXACTLY as %s appears "
            "there — %s, the same proportions and the same art style. Do not redesign %s. "
            % ("it" if it else "her", "it" if it else "she", cfg["keep"],
               "it" if it else "her"))
    import uuid
    tasks, names = [], []
    for name, tmpl in poses.items():
        pose = tmpl.format(s=cfg["s"], p=cfg["p"], w=cfg["w"])
        # taskUUID 要自己先指定：下面用它把回應對回姿勢名稱，
        # 不能等 call() 裡的 setdefault 補（那時對照表已經建好了）
        tasks.append({"taskType": "imageInference", "model": MODEL,
                      "taskUUID": str(uuid.uuid4()),
                      "positivePrompt": head + pose + " " + FRAME + STYLE + BG,
                      "referenceImages": [ref], "width": w, "height": h,
                      "numberResults": 1, "seed": seed,
                      "outputType": "URL", "outputFormat": "JPG", "includeCost": True})
        names.append(name)

    print("=== %s：產 %d 格 ===" % (who, len(tasks)))
    import urllib.request
    name_of = {t["taskUUID"]: n for t, n in zip(tasks, names)}

    def save(task, r):
        name = name_of[task["taskUUID"]]
        out = os.path.join(dst, name + ".jpg")
        if r.get("imageURL"):
            urllib.request.urlretrieve(r["imageURL"], out)
        elif r.get("imageBase64Data"):
            open(out, "wb").write(base64.b64decode(r["imageBase64Data"].split(",")[-1]))
        else:
            print("  %-11s ❌ 沒有影像" % name)
            return
        print("  %-11s → %s (%.0f KB)" % (name, os.path.relpath(out, ROOT),
                                          os.path.getsize(out) / 1024))

    ok, failed, cost = call_many(tasks, chunk=2, timeout=600, on_result=save)
    print("\n成功 %d / %d 格，花費 US$%.4f（每格約 US$%.4f）"
          % (ok, len(tasks), cost, cost / max(1, ok)))
    if failed:
        print("失敗的格：%s" % ", ".join(name_of[t["taskUUID"]] for t in failed))
        print("→ 重跑：python3 tools/gen_sprites.py %s %s"
              % (who, " ".join(name_of[t["taskUUID"]] for t in failed)))


if __name__ == "__main__":
    build(sys.argv[1], only=sys.argv[2:] or None)
