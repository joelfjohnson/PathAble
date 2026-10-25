/** Reproducible, licensed downtown imagery. Run with the Commons API response path. */
import { readFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const files = [
  ["Bentonville City Hall.jpg", "city-hall"],
  ["Hotel Massey.jpg", "hotel-massey"],
  ["Roy's Office Supply Building.jpg", "roy-building"],
  ["Terry Block Building.jpg", "terry-block"],
  ["Walmart Visitors Center in Bentonville, Arkansas.jpg", "visitors-center"],
  ["Walton five and dime Bentonville AR (14292373504).jpg", "walton-store"],
  ["Charles R. Craig Building.jpg", "craig-building"],
  ["Downtown Bentonville, AR.jpg", "square"],
];
const api = new URL("https://commons.wikimedia.org/w/api.php");
api.search = new URLSearchParams({
  action: "query",
  titles: files.map(([title]) => `File:${title}`).join("|"),
  prop: "imageinfo",
  iiprop: "url|extmetadata",
  iiurlwidth: "1600",
  format: "json",
});
const data = JSON.parse(
  process.argv[2]
    ? readFileSync(process.argv[2], "utf8")
    : execFileSync("curl", ["-L", "--fail", "--max-time", "45", api.href], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
      }),
);
mkdirSync("public/ar/bentonville", { recursive: true });
for (const [title, slug] of files) {
  const page = Object.values(data.query.pages).find(
    (p) => p.title === `File:${title}`,
  );
  const info = page?.imageinfo?.[0];
  if (!info?.extmetadata?.LicenseShortName?.value.startsWith("CC BY"))
    throw new Error(`Missing license: ${title}`);
  const input = `/private/tmp/pathable-${slug}.jpg`;
  execFileSync(
    "curl",
    [
      "-L",
      "--fail",
      "--retry",
      "2",
      "--max-time",
      "45",
      (info.thumburl || info.url).split("?")[0],
      "-o",
      input,
    ],
    { stdio: "ignore" },
  );
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      input,
      "-vf",
      "scale=1600:-2",
      "-frames:v",
      "1",
      "-quality",
      "85",
      `public/ar/bentonville/${slug}.webp`,
    ],
    { stdio: "ignore" },
  );
  console.log(`Prepared ${slug}: ${info.extmetadata.LicenseShortName.value}`);
}
// An eight-second photographic clip exercises native video playback. Camera
// motion is applied in the browser to both the photograph and ground overlay.
execFileSync(
  ffmpeg,
  [
    "-y",
    "-loop",
    "1",
    "-i",
    "public/ar/bentonville/city-hall.webp",
    "-t",
    "8",
    "-vf",
    "scale=1280:-2",
    "-r",
    "24",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "25",
    "-pix_fmt",
    "yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    "public/ar/bentonville/city-hall.mp4",
  ],
  { stdio: "ignore" },
);
execFileSync(
  ffmpeg,
  [
    "-y",
    ...files.flatMap(([, slug]) => [
      "-i",
      `public/ar/bentonville/${slug}.webp`,
    ]),
    "-filter_complex",
    files
      .map(
        (_, i) =>
          `[${i}:v]scale=400:300:force_original_aspect_ratio=decrease,pad=400:300:(ow-iw)/2:(oh-ih)/2[v${i}]`,
      )
      .join(";") +
      ";" +
      files.map((_, i) => `[v${i}]`).join("") +
      "xstack=inputs=8:layout=0_0|400_0|800_0|1200_0|0_300|400_300|800_300|1200_300[out]",
    "-map",
    "[out]",
    "-frames:v",
    "1",
    "/private/tmp/pathable-media-contact.jpg",
  ],
  { stdio: "ignore" },
);
