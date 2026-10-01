/**
 * scenes.ts — every pinned scene's bands, frame ranges and track heights.
 * Single source of truth for the scroll choreography.
 *
 * Bands over progress p (0 = stage locks, 1 = stage releases):
 *   B0 0.00–0.10  setup (near-black, no text)
 *   B1 0.10–0.80  media start-state -> end-state
 *   B2 0.45–0.62  headline fades in, holds
 *   B3 0.55–0.90  support copy + micro-motion
 *   B4 0.88–1.00  exit
 */
import manifest from './asset-manifest.json';
import { withBase } from './baseUrl';

export interface SceneDef {
  id: string;
  dir: string;
  frames: number;
  trackVh: number;
  /** frame index when p === band.b1[0] */
  frameStart: number;
  /** frame index when p === band.b1[1] */
  frameEnd: number;
  bands: {
    b0: [number, number];
    b1: [number, number];
    b2: [number, number];
    b3: [number, number];
    b4: [number, number];
  };
  /** media focal point (0..1) for contain/positioning */
  focal?: { x: number; y: number };
  /** native extraction size (upscale cap is relative to this) */
  width?: number;
  height?: number;
}

const B = {
  b0: [0.0, 0.1],
  b1: [0.1, 0.8],
  b2: [0.45, 0.62],
  b3: [0.55, 0.9],
  b4: [0.88, 1.0],
} as { b0: [number, number]; b1: [number, number]; b2: [number, number]; b3: [number, number]; b4: [number, number] };

export const scenes: Record<string, SceneDef> = {
  hero: {
    id: 'hero',
    dir: withBase(manifest.scenes.hero.dir),
    frames: manifest.scenes.hero.frames,
    trackVh: 320,
    frameStart: 0,
    frameEnd: manifest.scenes.hero.frames - 1,
    bands: B,
  },
  design360: {
    id: 'design360',
    dir: withBase(manifest.scenes.design360.dir),
    frames: manifest.scenes.design360.frames,
    trackVh: 300,
    frameStart: 0,
    frameEnd: manifest.scenes.design360.frames - 1,
    bands: B,
  },
  fabric: {
    id: 'fabric',
    dir: withBase(manifest.scenes.fabric.dir),
    frames: manifest.scenes.fabric.frames,
    trackVh: 280,
    frameStart: 0,
    frameEnd: manifest.scenes.fabric.frames - 1,
    bands: B,
  },
  hoodfit: {
    id: 'hoodfit',
    dir: withBase(manifest.scenes.hoodfit.dir),
    frames: manifest.scenes.hoodfit.frames,
    trackVh: 260,
    frameStart: 0,
    frameEnd: manifest.scenes.hoodfit.frames - 1,
    bands: B,
  },
};

export const sceneList: SceneDef[] = Object.values(scenes);

/** map progress p (0..1) to a frame index between frameStart..frameEnd using B1 */
export function frameIndexFor(scene: SceneDef, p: number): number {
  const [a, b] = scene.bands.b1;
  const t = clamp01((p - a) / (b - a));
  // ease-out for a slightly weighty feel
  const e = 1 - Math.pow(1 - t, 2);
  return Math.round(scene.frameStart + (scene.frameEnd - scene.frameStart) * e);
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
