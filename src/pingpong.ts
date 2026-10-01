/**
 * pingpong.ts — highlights-tile playback.
 *
 * Small WebP frame sets (2 fps segments). Most source clips have a huge
 * loop seam (~63 luma), so these ping-pong (forward then reverse) instead
 * of looping.
 */
export class PingPong {
  private imgs: HTMLImageElement[] = [];
  private i = 0;
  private dir = 1;
  private timer: number | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(host: HTMLElement, dir: string, count: number, private intervalMs = 450) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.canvas.className = 'tile__canvas';
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    for (let i = 0; i < count; i++) {
      const img = new Image();
      // logical indices are 0-based; ffmpeg %03d output files are 1-based
      img.src = `${dir}/t${String(i + 1).padStart(3, '0')}.webp`;
      img.onerror = () => console.error(`[hoodie] tile frame failed to load: ${img.src}`);
      this.imgs.push(img);
    }
  }

  start() {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => {
      // wait until at least the current frame is loaded
      const img = this.imgs[this.i];
      if (!img.complete || img.naturalWidth === 0) return;
      this.draw();
      this.i += this.dir;
      if (this.i >= this.imgs.length) {
        this.i = this.imgs.length - 2;
        this.dir = -1;
      } else if (this.i < 0) {
        this.i = 1;
        this.dir = 1;
      }
    }, this.intervalMs);
  }

  /** draw a single frame once loaded — reduced-motion poster */
  drawOnce(index = 0) {
    const img = this.imgs[index];
    const draw = () => {
      if (img.naturalWidth) this.drawAt(img);
    };
    img.decode().then(draw).catch(() => {
      img.onload = draw;
      img.onerror = () => console.error(`[hoodie] tile poster failed to decode: ${img.src}`);
    });
  }

  private draw() {
    this.drawAt(this.imgs[this.i]);
  }

  private drawAt(img: HTMLImageElement) {
    const { width: cw, height: ch } = this.canvas;
    this.ctx.clearRect(0, 0, cw, ch);
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
