// Render index.html frame demi frame (deterministik melalui window.render(t)) dan salurkan ke ffmpeg.
// Guna: node render.js [output.mp4] [--preview t1,t2,...]
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const FPS = 30;
const args = process.argv.slice(2);
const previewIdx = args.indexOf("--preview");
const out = args.find(a => a.endsWith(".mp4")) || "keluaran/18-tahun-di-lapangan-terbang.mp4";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.join(__dirname, "index.html"));
  await page.evaluate(() => document.fonts.ready);
  const dur = await page.evaluate(() => window.TIMELINE.duration);

  if (previewIdx >= 0) {
    fs.mkdirSync("pratonton", { recursive: true });
    for (const t of args[previewIdx + 1].split(",").map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: `pratonton/t${t.toFixed(2)}.jpg`, type: "jpeg", quality: 85 });
    }
    await browser.close();
    return;
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn("ffmpeg", ["-v", "error", "-y",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", "vo/vo_penuh.wav",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "20",
    "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.ceil(dur * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`frame ${f}/${n}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log("siap:", out);
})();
