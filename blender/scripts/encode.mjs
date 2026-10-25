import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
execFileSync(
  ffmpeg,
  [
    "-y",
    "-framerate",
    "24",
    "-i",
    resolve(root, "blender/frames/phone-%04d.png"),
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    resolve(root, "public/animations/pathable-phone.mp4"),
  ],
  { stdio: "inherit" },
);
execFileSync(
  ffmpeg,
  [
    "-y",
    "-i",
    resolve(root, "blender/frames/phone-0020.png"),
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-q:v",
    "82",
    resolve(root, "public/animations/phone-poster.webp"),
  ],
  { stdio: "inherit" },
);
