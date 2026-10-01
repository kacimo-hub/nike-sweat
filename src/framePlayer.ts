/**
 * framePlayer.ts — moving-window WebP frame loader/drawer.
 *
 * Never holds the full decoded set in memory. Maintains a window of decoded
 * ImageBitmaps around the current index and decodes on demand.
 *
 * Quality rules:
 *  - backing store = CSS size x min(devicePixelRatio, 2)  (1:1 device pixels)
 *  - imageSmoothingEnabled + quality 'high'
 *  - drawn media never exceeds MAX_UPSCALE x native (CSS keeps its layout
 *    size; the extra area stays empty so the page void shows through)
 *  - drawn frame gets a feathered edge fading into transparent (page #030303)
 */
export interface FramePlayerOpts {
  nativeW?: number;
  nativeH?: number;
  maxUpscale?: number;
  feather?: boolean;
}

export class FramePlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bitmaps: (ImageBitmap | null)[];
  private pending = new Set<number>();
  private current = -1;
  private count: number;
  private dir: string;
  private window = 10; // decoded frames each side of current
  private destroyed = false;
  private ro: ResizeObserver | null = null;
  private nativeW: number;
  private nativeH: number;
  private maxUpscale: number;
  private feather: boolean;
  private firstDrawResolve: (() => void) | null = null;
  private firstDrawPromise: Promise<void>;

  /** `?dpr=N` forces a backing-store ratio for QA on a DPR-1 display */
  private dprOverride = (() => {
    const v = parseFloat(new URLSearchParams(location.search).get('dpr') ?? '');
    return Number.isFinite(v) && v > 0 ? v : null;
  })();

  constructor(canvas: HTMLCanvasElement, dir: string, count: number, opts: FramePlayerOpts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dir = dir;
    this.count = count;
    this.nativeW = opts.nativeW ?? 1280;
    this.nativeH = opts.nativeH ?? 720;
    this.maxUpscale = opts.maxUpscale ?? 1.3;
    this.feather = opts.feather ?? true;
    this.bitmaps = new Array(count).fill(null);
    this.firstDrawPromise = new Promise((res) => (this.firstDrawResolve = res));

    this.resize();
    this.ro = new ResizeObserver(() => {
      this.resize();
      if (this.current >= 0) this.seek(this.current);
    });
    this.ro.observe(canvas);
  }

  /** backing store = CSS size x min(dpr, 2); CSS size untouched (no double scale) */
  private resize() {
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    if (!cw || !ch) return;
    const raw = this.dprOverride ?? window.devicePixelRatio ?? 1;
    const dpr = Math.min(raw, 2);
    const w = Math.round(cw * dpr);
    const h = Math.round(ch * dpr);
    if (w !== this.canvas.width || h !== this.canvas.height) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  url(i: number): string {
    // logical indices are 0-based; ffmpeg %03d output files are 1-based
    return `${this.dir}/f${String(i + 1).padStart(3, '0')}.webp`;
  }

  /** request decode of frames near i, draw frame i */
  seek(i: number) {
    if (this.destroyed || i < 0 || i >= this.count) return;
    this.current = i;
    const lo = Math.max(0, i - this.window);
    const hi = Math.min(this.count - 1, i + this.window);
    for (let k = lo; k <= hi; k++) {
      if (!this.bitmaps[k] && !this.pending.has(k)) {
        this.pending.add(k);
        this.decode(k);
      }
    }
    this.draw(i);
  }

  private decode(i: number) {
    const img = new Image();
    img.decoding = 'async';
    img.src = this.url(i);
    img
      .decode()
      .then(() => {
        if (this.destroyed) return;
        this.pending.delete(i);
        // ImageBitmap avoids keeping the DOM node around
        createImageBitmap(img)
          .then((bmp) => {
            if (this.destroyed) {
              bmp.close();
              return;
            }
            this.bitmaps[i] = bmp;
            // if this frame is the one on screen, redraw
            if (i === this.current) this.draw(i);
          })
          .catch(() => {
            this.pending.delete(i);
            console.error(`[hoodie] bitmap decode failed: ${this.url(i)}`);
          });
      })
      .catch(() => {
        this.pending.delete(i);
        console.error(`[hoodie] frame failed to load: ${this.url(i)}`);
      });
  }

  private draw(i: number) {
    const bmp = this.bitmaps[i];
    if (!bmp) {
      // frame not ready: try nearest decoded frame in-window
      for (let d = 1; d <= this.window; d++) {
        if (this.bitmaps[i - d]) return this.drawBitmap(this.bitmaps[i - d]!);
        if (this.bitmaps[i + d]) return this.drawBitmap(this.bitmaps[i + d]!);
      }
      return;
    }
    this.drawBitmap(bmp);
  }

  private drawBitmap(bmp: ImageBitmap) {
    this.resize();
    const { width: cw, height: ch } = this.canvas;
    this.ctx.clearRect(0, 0, cw, ch);

    // contain-fit, capped at maxUpscale x native (device px)
    const maxW = this.nativeW * this.maxUpscale * (this.dprOverride ?? Math.min(window.devicePixelRatio ?? 1, 2));
    const maxH = this.nativeH * this.maxUpscale * (this.dprOverride ?? Math.min(window.devicePixelRatio ?? 1, 2));
    const scale = Math.min(cw / bmp.width, ch / bmp.height, maxW / bmp.width, maxH / bmp.height);
    const w = bmp.width * scale;
    const h = bmp.height * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    this.ctx.drawImage(bmp, x, y, w, h);

    if (this.feather) {
      // radial feather aligned to the drawn rect: edges melt into the page void
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(w / 2, h / 2);
      const g = ctx.createRadialGradient(0, 0, 0.62, 0, 0, 1.02);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }

    this.firstDrawResolve?.();
    this.firstDrawResolve = null;
  }

  /** resolves after the first frame actually hits the canvas (preloader gate) */
  whenFirstDrawn(): Promise<void> {
    return this.firstDrawPromise;
  }

  /** last frame index (for reduced-motion poster) */
  endFrame(): number {
    return this.count - 1;
  }

  /**
   * Draw one frame via a plain <img>, independent of the moving window and
   * of destroy(). Used for the reduced-motion poster: seek() starts an async
   * decode that destroy() would cancel, leaving the canvas blank.
   */
  drawStill(index: number): void {
    this.resize();
    const img = new Image();
    img.src = this.url(index);
    const draw = () => {
      if (!img.naturalWidth) return;
      this.resize();
      const { width: cw, height: ch } = this.canvas;
      this.ctx.clearRect(0, 0, cw, ch);
      const dpr = Math.min(this.dprOverride ?? window.devicePixelRatio ?? 1, 2);
      const maxW = this.nativeW * this.maxUpscale * dpr;
      const maxH = this.nativeH * this.maxUpscale * dpr;
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight, maxW / img.naturalWidth, maxH / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
      this.ctx.drawImage(img, x, y, w, h);
      if (this.feather) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(w / 2, h / 2);
        const g = ctx.createRadialGradient(0, 0, 0.62, 0, 0, 1.02);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }
      this.firstDrawResolve?.();
      this.firstDrawResolve = null;
    };
    img.onerror = () => {
      console.error(`[hoodie] poster frame failed to load: ${this.url(index)}`);
    };
    img.decode().then(draw).catch(() => { img.onload = draw; });
  }

  destroy() {
    this.destroyed = true;
    this.ro?.disconnect();
    this.ro = null;
    for (const b of this.bitmaps) b?.close();
    this.bitmaps = [];
  }
}
