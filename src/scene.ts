/**
 * scene.ts — the Scene primitive.
 *
 * .scene__track  (height: trackVh)  — scroll distance
 *   .scene__stage (sticky top:0, 100svh)
 *     .scene__media  > canvas
 *     .scene__copy   > [data-copy] blocks with data-in / data-out fractions
 *
 * State is a pure function of lerped progress p. No time-based tweens.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROGRESS_LERP } from './config';
import { FramePlayer } from './framePlayer';
import { type SceneDef, frameIndexFor } from './scenes';

gsap.registerPlugin(ScrollTrigger);

interface CopyBlock {
  el: HTMLElement;
  in: number;
  out: number;
}

export class Scene {
  def: SceneDef;
  track: HTMLElement;
  player: FramePlayer;
  copies: CopyBlock[] = [];
  p = 0; // lerped
  target = 0; // raw
  st: ScrollTrigger | null = null;
  private raf = 0;
  private onProgress: ((p: number, frame: number) => void) | null = null;

  /** resolves after the first frame is actually on the canvas (preloader gate) */
  get whenFirstDrawn(): Promise<void> {
    return this.player.whenFirstDrawn();
  }

  constructor(def: SceneDef, onProgress?: (p: number, frame: number) => void) {
    this.def = def;
    this.onProgress = onProgress ?? null;
    this.track = document.querySelector<HTMLElement>(`[data-scene="${def.id}"]`)!;

    const canvas = this.track.querySelector<HTMLCanvasElement>('canvas')!;
    this.player = new FramePlayer(canvas, def.dir, def.frames, {
      nativeW: def.width ?? 1280,
      nativeH: def.height ?? 720,
      maxUpscale: 1.3,
      feather: true,
    });

    this.copies = Array.from(this.track.querySelectorAll<HTMLElement>('[data-copy]')).map((el) => ({
      el,
      in: parseFloat(el.dataset.in ?? '0.45'),
      out: parseFloat(el.dataset.out ?? '0.9'),
    }));

    // preload the first frame before anything draws
    this.player.seek(0);

    this.st = ScrollTrigger.create({
      trigger: this.track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.target = self.progress;
      },
    });

    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = () => {
    // lerp toward raw progress
    const d = this.target - this.p;
    this.p = Math.abs(d) < 0.0005 ? this.target : this.p + d * PROGRESS_LERP;

    const frame = frameIndexFor(this.def, this.p);
    this.player.seek(frame);

    // copy opacities from band data
    for (const c of this.copies) {
      const o = bandOpacity(this.p, c.in, c.out);
      c.el.style.opacity = String(o);
      c.el.style.transform = `translateY(${(1 - o) * 24}px)`;
      c.el.toggleAttribute('data-visible', o > 0.35);
    }

    // micro-motion during B3 so p never feels dead: subtle scale on the media
    const media = this.track.querySelector<HTMLElement>('.scene__media');
    if (media) {
      const s = 1 + 0.04 * band(this.p, this.def.bands.b3[0], this.def.bands.b3[1]);
      media.style.transform = `scale(${s.toFixed(4)})`;
    }

    this.onProgress?.(this.p, frame);
    this.raf = requestAnimationFrame(this.tick);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    this.st?.kill();
    this.player.destroy();
  }
}

/** 0..1 ramp up at `a`, hold 1, ramp down at `b` */
export function bandOpacity(p: number, a: number, b: number): number {
  const rise = Math.min(1, Math.max(0, (p - a) / 0.12));
  const fall = Math.min(1, Math.max(0, (b - p) / 0.08));
  return Math.min(rise, fall);
}

/** 0..1 linear ramp between a..b, clamped, no fall */
export function band(p: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
