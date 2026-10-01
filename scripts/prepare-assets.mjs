#!/usr/bin/env node
/**
 * prepare-assets.mjs
 * - Copies the five stills into public/assets under clean names (JPEG q90, originals untouched)
 * - Extracts WebP frame sequences for the scroll-scrubbed scenes
 * - Extracts low-fps segments for the highlights ping-pong tiles
 * - Renders contact sheets (8 frames per clip) into scratch/ for visual verification
 * - Writes src/asset-manifest.json
 *
 * Scene frame ranges (match src/scenes.ts):
 *   hero      product_video     frames 0..143   -> 72 frames (12 fps)
 *   design360 rotating          frames 0..90    -> 46 frames (12 fps)
 *   fabric    fabric_macro      frames 30..120  -> 46 frames (12 fps)
 *   hoodfit   product_showcase  frames 0..143   -> 72 frames (12 fps)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readdirSync, statSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public');
const A = join(PUB, 'assets');
const SCRATCH = join(ROOT, 'scratch');

const SOURCES = {
  product_video: 'Gray_hoodie_product_video_20260923213611.mp4',
  fabric_macro: 'Gray_hoodie_fabric_macro_shot_20260923214044.mp4',
  product_showcase: 'Gray_hoodie_product_showcase_20260923214348.mp4',
  rotating: 'Hoodie_rotating_on_black_background_20260923213251.mp4',
  orbits: 'Camera_orbits_gray_hoodie_showcase_20260923213809.mp4',
  still_pair: 'ChatGPT Image Sep 23, 2026, 09_16_38 PM.png',
  still_front: 'ChatGPT Image Sep 23, 2026, 09_48_13 PM.png',
  still_front_portrait: 'ChatGPT Image Sep 23, 2026, 09_48_21 PM.png',
  still_hood_closeup: 'ChatGPT Image Sep 23, 2026, 09_50_01 PM.png',
  still_back: 'ChatGPT Image Sep 23, 2026, 09_51_29 PM.png',
};

// fps-based extraction: source is 24 fps; every 2nd frame -> fps=12
const SRC_FPS = 24;
// Native resolution (no downscale). q per scene: 90-95 hero/fabric, 85+ elsewhere.
// Lossless for first and last frame of each scene (hero p=0 and scene end states).
const SCENES = [
  { scene: 'hero',      key: 'product_video',    f0: 0,  f1: 143, q: 92, scaleW: null, sharpen: 'unsharp=5:5:0.35:5:5:0.0' },
  { scene: 'design360', key: 'rotating',         f0: 0,  f1: 90,  q: 88, scaleW: null, sharpen: 'unsharp=5:5:0.3:5:5:0.0' },
  { scene: 'fabric',    key: 'fabric_macro',     f0: 30, f1: 120, q: 93, scaleW: null, sharpen: 'unsharp=5:5:0.4:5:5:0.0' },
  { scene: 'hoodfit',   key: 'product_showcase', f0: 0,  f1: 143, q: 88, scaleW: null, sharpen: 'unsharp=5:5:0.3:5:5:0.0' },
];

/**
 * Black-point crush: values below ~10/255 map to 0 so the clip backdrop matches
 * --void (#030303) and WebP blocky compression squares in the near-black field
 * disappear. Mild luma-only unsharp counters upscale softness.
 */
const CRUSH = 'colorlevels=rimin=0.0392:gimin=0.0392:bimin=0.0392:rimax=1.0:gimax=1.0:bimax=1.0';

function vfFor(sc) {
  const parts = [`fps=12:start_time=${(sc.f0 / SRC_FPS).toFixed(4)}`];
  parts.push(CRUSH);
  parts.push(sc.sharpen);
  if (sc.scaleW) parts.push(`scale=${sc.scaleW}:-2`);
  return parts.join(',');
}

function encodeScene(sc, extraArgs, suffix = '') {
  const outDir = join(A, 'frames', sc.scene + suffix);
  mkdirSync(outDir, { recursive: true });
  const pattern = join(outDir, 'f%03d.webp');
  ff([
    '-y', '-v', 'error',
    '-i', join(ROOT, SOURCES[sc.key]),
    '-vf', vfFor(sc),
    '-frames:v', String(nFramesFor(sc)),
    '-c:v', 'libwebp', '-q:v', String(sc.q), '-lossless', '0', '-preset', 'picture',
    '-an',
    pattern,
  ]);
  return outDir;
}

function nFramesFor(sc) {
  return Math.floor((sc.f1 - sc.f0) / 2) + 1;
}

/** lossless re-encode of frames 1 and N (the p=0 and end states) */
function makeEndpointLossless(sc, outDir) {
  const n = frameCount(outDir);
  for (const idx of [1, n]) {
    const f = join(outDir, `f${String(idx).padStart(3, '0')}.webp`);
    const tmp = f + '.lossless.webp';
    ff(['-y', '-v', 'error', '-i', f, '-c:v', 'libwebp', '-q:v', '100', '-lossless', '1', tmp]);
    renameSync(f, f + '.before');
    renameSync(tmp, f);
    rmSync(f + '.before');
  }
}

// highlights tiles: low-fps segments (2 fps), ping-ponged in the browser
const TILES = [
  { name: 'fabric',  key: 'fabric_macro',    f0: 20, f1: 100 },
  { name: 'orbits',  key: 'orbits',          f0: 0,  f1: 60 },
  { name: 'rotating', key: 'rotating',       f0: 0,  f1: 60 },
  { name: 'showcase', key: 'product_showcase', f0: 0, f1: 70 },
];

const manifest = { generatedAt: new Date().toISOString(), scenes: {}, tiles: {}, stills: {} };

const STILLS = [
  { name: 'still-pair.jpg',          key: 'still_pair' },
  { name: 'still-front.jpg',         key: 'still_front' },
  { name: 'still-front-portrait.jpg', key: 'still_front_portrait' },
  { name: 'still-hood-closeup.jpg',  key: 'still_hood_closeup' },
  { name: 'still-back.jpg',         key: 'still_back' },
];

for (const dir of [A, join(A, 'frames'), join(A, 'tiles'), SCRATCH]) {
  mkdirSync(dir, { recursive: true });
}

function ff(args) {
  execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
}

function frameCount(dir) {
  return readdirSync(dir).filter((f) => f.endsWith('.webp')).length;
}

// 1) Stills -> clean-named JPEGs (q90), no resize
for (const s of STILLS) {
  const src = join(ROOT, SOURCES[s.key]);
  if (!existsSync(src)) throw new Error(`missing source: ${SOURCES[s.key]}`);
  const dest = join(A, s.name);
  ff(['-y', '-v', 'error', '-i', src, '-q:v', '2', dest]);
  manifest.stills[s.name] = { file: `assets/${s.name}`, bytes: statSync(dest).size };
  console.log(`[still] ${s.name} <- ${SOURCES[s.key]}`);
}

// 2) Frame sequences per scene
for (const sc of SCENES) {
  const outDir = encodeScene(sc);
  makeEndpointLossless(sc, outDir);
  const count = frameCount(outDir);
  manifest.scenes[sc.scene] = {
    dir: `assets/frames/${sc.scene}`,
    frames: count,
    q: sc.q,
    native: true,
    width: 1280,
    height: 720,
    crush: '0.0392',
    source: SOURCES[sc.key],
    f0: sc.f0,
    f1: sc.f1,
  };
  console.log(`[frames] ${sc.scene}: ${count} frames (native 1280x720, q${sc.q}, endpoints lossless)`);
}

// 3) Tile segments at 2 fps
for (const t of TILES) {
  const outDir = join(A, 'tiles', t.name);
  mkdirSync(outDir, { recursive: true });
  const pattern = join(outDir, 't%03d.webp');
  const startTime = t.f0 / SRC_FPS;
  const dur = (t.f1 - t.f0) / SRC_FPS;
  ff([
    '-y', '-v', 'error',
    '-ss', startTime.toFixed(4),
    '-t', dur.toFixed(4),
    '-i', join(ROOT, SOURCES[t.key]),
    '-vf', 'fps=2,scale=480:-2',
    '-c:v', 'libwebp', '-q:v', '60', '-lossless', '0',
    '-an',
    pattern,
  ]);
  const count = frameCount(outDir);
  manifest.tiles[t.name] = { dir: `assets/tiles/${t.name}`, frames: count };
  console.log(`[tiles] ${t.name}: ${count} frames`);
}

// 4) Contact sheets: 8 frames per clip, 4x2 grid, for visual verification
const SHEETS = ['product_video', 'fabric_macro', 'product_showcase', 'rotating', 'orbits'];
for (const key of SHEETS) {
  const out = join(SCRATCH, `sheet-${key}.png`);
  ff([
    '-y', '-v', 'error',
    '-i', join(ROOT, SOURCES[key]),
    '-vf', "select='not(mod(n,18))',scale=320:-2,tile=4x2",
    '-frames:v', '1',
    out,
  ]);
  console.log(`[sheet] scratch/sheet-${key}.png`);
}

writeFileSync(join(ROOT, 'src', 'asset-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('[prepare-assets] manifest written to src/asset-manifest.json');
