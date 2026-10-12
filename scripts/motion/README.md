# NerdyGent Press product films

Two original, silent software concept films; fictional editorial content. The persistent concept label is intentional. These are product illustrations, not recordings of a live source integration.

- `sources-to-stories.mp4`: local desk, RSS, and Reddit stories assemble into a reading shortlist.
- `made-for-you.mp4`: three net topic votes lead to an accepted one-point interest suggestion and the newspaper takes shape.
- Matching `*-poster.png` stills are taken at 10 seconds.

Format: 1280 × 800, 24 frames per second, 12 seconds, H.264, yuv420p, fast-start MP4. Use native video controls or a clear play/pause button. Do not autoplay when the visitor requests reduced motion. The poster conveys the full story without playback.

Regenerate on macOS with Pillow and imageio-ffmpeg installed. Fonts are system Georgia and Arial; set `PRESS_FONT_DIR` to a directory containing equivalent licensed font files for other systems. `render_films.py` creates the MP4s, posters, and QA frames. Run `python scripts/motion/render_films.py --out public/films` from the website root. Install Pillow and imageio-ffmpeg in a local Python environment first. QA frames are generated for inspection and excluded from source control.
