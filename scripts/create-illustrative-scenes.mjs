/** Original, location-neutral SVG studies. No imagery or geographic measurements are inferred. */
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("public/ar/scenes", { recursive: true });
const names = [
  "transit",
  "crossing",
  "barrier",
  "alternative",
  "north-crossing",
  "avenue",
];
function windows(side) {
  let out = "";
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 5; col++) {
      const x = side === "left" ? 55 + col * 105 : 1030 + col * 110,
        y = 300 + row * 105 + (side === "left" ? col * 22 : (4 - col) * 16),
        w = side === "left" ? 68 - col * 7 : 42 + col * 7;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${85 - col * 5}" rx="3" fill="#b6c3ce" stroke="#f7f7f3" stroke-width="8"/>`;
    }
  return out;
}
function tree(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="210" rx="105" ry="19" fill="#6f7e7920"/><path d="M0 0V210" stroke="#9a9487" stroke-width="13"/><ellipse cy="-35" rx="100" ry="130" fill="#a9c2ae"/><ellipse cx="-30" cy="-66" rx="76" ry="97" fill="#b9d0bb"/><path d="M0 120L-30 20M0 80L34-2" fill="none" stroke="#819b84" stroke-width="4" opacity=".35"/></g>`;
}
function cone(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="71" rx="37" ry="8" fill="#5a3c2c20"/><path d="M-32 70L-7 0H7L32 70Z" fill="#c89259"/><path d="M-19 34H19L24 47H-24Z" fill="#fff5df"/><rect x="-38" y="66" width="76" height="10" rx="5" fill="#a87644"/></g>`;
}
for (const [index, name] of names.entries()) {
  const crossing = name.includes("crossing") || name === "crossing";
  const alt = name === "alternative" || name === "avenue";
  const barrier = name === "barrier";
  const horizon = 460;
  const center = alt ? 955 : 830;
  const sidewalk = alt
    ? "M620 1200L820 885Q910 730 965 520H1025Q1055 760 1180 1200Z"
    : "M575 1200L775 520H895L1160 1200Z";
  const seams = Array.from({ length: 7 }, (_, i) => {
    const y = 560 + i * i * 14,
      t = (y - 520) / 680;
    return `<path d="M${775 - (alt ? 80 : 200) * t} ${y}H${895 + 260 * t}" stroke="#c9c6bf" stroke-width="2" opacity=".65"/>`;
  }).join("");
  const crosswalk = crossing
    ? `<path d="M530 1140L1080 660L1390 700L865 1200Z" fill="#b5bac4"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${655 + i * 75} ${1020 - i * 65}l150 20 28-33-153-20z" fill="#f5f3ec"/>`).join("")}<path d="M755 805l65-25 78 27-64 34z" fill="#e7d8bf" stroke="#b9b0a0" stroke-width="3"/>`
    : "";
  const shelter =
    name === "transit"
      ? `<g><ellipse cx="325" cy="932" rx="205" ry="28" fill="#69748222"/><path d="M170 630L460 602L540 625L240 664Z" fill="#6c6880"/><path d="M193 657V903M503 634V880" stroke="#8d8a98" stroke-width="12"/><path d="M218 668L457 642V875L218 909Z" fill="#e8f0f1" fill-opacity=".75" stroke="#b5c0c5" stroke-width="6"/><path d="M238 831L443 806V824L238 849Z" fill="#918a7e"/><text x="265" y="713" font-family="sans-serif" font-size="22" fill="#635e78" letter-spacing="4">PICKUP</text><rect x="104" y="618" width="12" height="286" rx="4" fill="#8e8e9a"/><rect x="80" y="553" width="60" height="75" rx="10" fill="#9886b7"/><path d="M95 577h29v25H95z" fill="none" stroke="white" stroke-width="4"/></g>`
      : "";
  const works = barrier
    ? `<g><path d="M805 760h160v60H805z" fill="#ddc8a8" stroke="#af9672" stroke-width="5"/><path d="M810 770l30 40m20-40 30 40m20-40 30 40" stroke="#f8f1e4" stroke-width="15"/>${cone(790, 780, 0.9)}${cone(970, 790, 0.85)}<path d="M900 790V697" stroke="#9a8f7e" stroke-width="6"/><path d="M900 656l40 40h-80z" fill="#d3a161" stroke="#fff5df" stroke-width="6"/></g>`
    : "";
  const park = alt
    ? `<path d="M1100 790Q1250 730 1600 820V1130Q1290 940 1100 790" fill="#b7cbb5"/>${tree(1260, 570, 1.05)}${tree(1480, 650, 1.25)}`
    : `${tree(1230, 600, 0.95)}${tree(1460, 700, 1.25)}`;
  const landmark = name==='north-crossing'?'<path d="M610 500l210-90 220 90z" fill="#a6b8b4"/><path d="M650 503v150m330-150v150" stroke="#c5c2b7" stroke-width="20"/>':name==='avenue'?'<path d="M690 380h300v290H690z" fill="#bfae9f"/><path d="M760 660V510a80 80 0 0 1 160 0v150" fill="#8d9c98"/><path d="M680 380h320v25H680z" fill="#e9dfcd"/>':'';
  const art = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${alt ? "#dce6ed" : "#e1e8ef"}"/><stop offset="1" stop-color="#faf7f1"/></linearGradient><linearGradient id="ground" x2="0" y2="1"><stop stop-color="#dfdfdc"/><stop offset="1" stop-color="#b8bdc7"/></linearGradient><linearGradient id="paving" x2="0" y2="1"><stop stop-color="#f5eee2"/><stop offset="1" stop-color="#e3ddd2"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h1600v1200H0z"/><circle cx="${1180 - index * 75}" cy="180" r="120" fill="#fff" opacity=".5"/><path d="M0 220L640 390V720L0 1020Z" fill="#d4cbbb"/><path d="M0 235L640 398V430L0 279Z" fill="#f2ece0"/>${windows("left")}<path d="M1600 240L970 400V715L1600 1010Z" fill="${alt ? "#d9d3cb" : "#d8d5d0"}"/><path d="M1600 265L970 417V442L1600 305Z" fill="#f4f1e8"/>${windows("right")}<path d="M0 ${horizon + 270}L${center} ${horizon}L1600 760V1200H0Z" fill="url(#ground)"/><path d="${sidewalk}" fill="url(#paving)" stroke="#faf6ec" stroke-width="9"/>${seams}${crosswalk}<path d="M55 1110L660 610M1540 1095L1110 730" stroke="#ececef" stroke-width="9" stroke-dasharray="90 60" opacity=".7"/>${tree(570, 510, 0.55)}${tree(340, 600, 0.85)}${park}${shelter}${works}${landmark}<g fill="#f1f0e9"><path d="M680 546h42v93h-42z"/><path d="M900 522h32v80h-32z"/></g><g stroke="#9a9ea7" stroke-width="6"><path d="M720 555v200M1100 585v220"/></g><g fill="#faf8f0"><circle cx="720" cy="550" r="14"/><circle cx="1100" cy="580" r="17"/></g><path d="M0 1180H1600" stroke="#faf7f1" stroke-width="2" opacity=".4"/></svg>`;
  writeFileSync(`public/ar/scenes/${name}.svg`, art);
}
console.log("Created six original, location-neutral perspective viewpoints.");
