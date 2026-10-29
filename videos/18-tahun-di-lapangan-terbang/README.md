# 18 Tahun Di Lapangan Terbang (T22 Escaping Ordinary, BM, 9:16)

Versi Bahasa Melayu bagi short "18 Years in an Airport" (kisah Mehran Karimi Nasseri), dalam gaya T22 Escaping Ordinary
(Pustaka Inspo): watak vektor flat, kata kunci berulang di latar, tag hitam, tajuk merah, pil label, pelekat bertimbun, sarikata kotak gelap.

Kit `mgo-orchestrator` tiada dalam repo ini, jadi video dibina terus dalam kod:

| Fail | Fungsi |
|---|---|
| `vo/skrip.json` | Skrip VO BM, satu baris setiap babak |
| `vo/s*.mp3`, `vo/s*.json` | VO (edge-tts, `ms-MY-OsmanNeural`) dan masa setiap perkataan |
| `build_timeline.py` | Gabung VO jadi `vo/vo_penuh.wav` dan tulis `timeline.js` |
| `index.html` | Semua babak, lukisan SVG dan animasi; `window.render(t)` melukis frame pada masa `t` |
| `render.js` | Render 30 fps dengan Playwright dan salurkan ke ffmpeg |
| `keluaran/18-tahun-di-lapangan-terbang.mp4` | Video akhir (1080x1920, ~65 s) |

Bina semula:

```bash
python3 build_timeline.py && node render.js
```

Pratonton frame tertentu: `node render.js --preview 4.5,12,30` (simpan ke `pratonton/`).

Fon: Montserrat (SIL OFL, lihat `fonts/OFL.txt`).
