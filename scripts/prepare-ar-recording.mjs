import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

// Local preview assets only. Keep the complete captured frame, including
// source attribution. No AI interpolation invents buildings or accessibility.
const source = readdirSync(".").find(
  (name) => name.startsWith("Screen Recording") && name.endsWith(".mov"),
);
if (!source) throw new Error("The supplied screen recording is missing.");
const segments = {
  depart: [0, 8, 8],
  intersection: [8, 16, 8],
  curb: [16, 24, 8],
  barrier: [24, 34, 10],
  alternative: [24, 28, 8],
  "north-crossing": [28, 32, 8],
  rejoin: [32, 34, 8],
  square: [34, 41, 7],
};
for (const [id, [start, end, duration]] of Object.entries(segments)) {
  const output = `public/ar/videos/ar-recording-${id}`;
  // --branches refreshes only previously out-of-order alternate footage.
  if (
    !process.argv.includes("--branches") ||
    ["alternative", "north-crossing", "rejoin"].includes(id)
  ) {
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-ss",
        String(start),
        "-t",
        String(end - start),
        "-i",
        source,
        "-vf",
        `setpts=${duration / (end - start)}*(PTS-STARTPTS),fps=30,scale=1280:674`,
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        `${output}.mp4`,
      ],
      { stdio: "ignore" },
    );
  }
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      `${output}.mp4`,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      `${output}.jpg`,
    ],
    { stdio: "ignore" },
  );
  console.log(`Rendered ${id}: source ${start}–${end}s → ${duration}s`);
}
