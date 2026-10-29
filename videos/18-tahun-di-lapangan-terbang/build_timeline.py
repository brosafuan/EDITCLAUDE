"""Gabung VO setiap babak jadi satu trek dan tulis timeline.js (masa babak + masa setiap perkataan)."""
import json, subprocess

LEAD = 0.35   # senyap sebelum VO pertama
GAP = 0.45    # jeda antara babak
TAIL = 1.2    # tahan babak akhir selepas VO tamat

def dur(p):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

scenes, t = [], 0.0
n = len(json.load(open("vo/skrip.json")))
for i in range(1, n + 1):
    d = dur(f"vo/s{i}.mp3")
    lead = LEAD if i == 1 else 0.0
    words = [{"w": w["w"], "t": round(t + lead + w["t"], 3), "d": round(w["d"], 3)}
             for w in json.load(open(f"vo/s{i}.json"))]
    length = lead + d + (TAIL if i == n else GAP)
    scenes.append({"start": round(t, 3), "end": round(t + length, 3), "voStart": round(t + lead, 3), "words": words})
    t += length

open("timeline.js", "w").write("window.TIMELINE = " + json.dumps({"duration": round(t, 3), "scenes": scenes}, ensure_ascii=False) + ";\n")

# trek audio: setiap babak dipad dengan senyap ke panjang babaknya
inputs, filt = [], []
for i, s in enumerate(scenes):
    inputs += ["-i", f"vo/s{i+1}.mp3"]
    delay = int((s["voStart"] - s["start"]) * 1000)
    filt.append(f"[{i}:a]aresample=48000,adelay={delay}|{delay},apad,atrim=0:{s['end']-s['start']:.3f}[a{i}]")
filt.append("".join(f"[a{i}]" for i in range(len(scenes))) + f"concat=n={len(scenes)}:v=0:a=1,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt),
                "-map", "[out]", "-ac", "2", "vo/vo_penuh.wav"], check=True)
print(f"tempoh {t:.2f}s, {len(scenes)} babak")
