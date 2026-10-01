/**
 * main.ts — wiring: i18n, scenes, rail, size table, buy widget, accordion,
 * nav state, bumper veil, preloader.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './tokens.css';
import './nav-scene.css';
import './sections.css';

import { sceneList } from './scenes';
import { Scene } from './scene';
import { FramePlayer } from './framePlayer';
import { PingPong } from './pingpong';
import { withBase } from './baseUrl';
import { initI18n, toggleLang, t } from './i18n';
import { createDebugOverlay, updateDebug, debugEnabled } from './debug';
import { CONTACT_EMAIL, ORDER_MODE } from './config';
import manifest from './asset-manifest.json';
import { strings } from './strings';

gsap.registerPlugin(ScrollTrigger);

// Motion selection:
//  - `?motion=on`  forces the full scrubbed experience (QA / demo on any device,
//    including reduced-motion browsers) — dev convenience, not a11y advice
//  - `?debug`      also forces it (back-compat) and shows the overlay
//  - otherwise     respect prefers-reduced-motion
const params = new URLSearchParams(location.search);
const reduced =
  params.get('motion') !== 'on' &&
  !debugEnabled() &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced) {
  console.warn(
    '[hoodie] prefers-reduced-motion: reduce is active — showing static posters. ' +
      'For the full scroll experience append ?motion=on to the URL.',
  );
}

initI18n();

/* ---------- language toggle ---------- */
document.getElementById('lang-toggle')?.addEventListener('click', () => {
  toggleLang();
  buildSizeTable(); // re-render localized table bits
  updateBuyTotal();
});

/* ---------- preloader ---------- */
const preloader = document.getElementById('preloader')!;
function hidePreloader() {
  preloader.setAttribute('data-done', '');
  setTimeout(() => preloader.remove(), 600);
}

/* ---------- nav stuck state ---------- */
const nav = document.getElementById('nav')!;
ScrollTrigger.create({
  start: 80,
  end: 'max',
  onToggle: (self) => nav.toggleAttribute('data-stuck', self.isActive),
});

/* ---------- active nav link ---------- */
const navLinks = Array.from(nav.querySelectorAll<HTMLAnchorElement>('.nav__links a'));
for (const a of navLinks) {
  const id = a.getAttribute('href')!.slice(1);
  ScrollTrigger.create({
    trigger: `#${id}`,
    start: 'top 45%',
    end: 'bottom 45%',
    onToggle: (self) => a.setAttribute('aria-current', String(self.isActive)),
  });
}

/* ---------- scenes ---------- */
const debugEl = debugEnabled() ? createDebugOverlay() : null;

interface SceneState {
  scene: Scene;
  p: number;
  frame: number;
}
const sceneStates: SceneState[] = [];

function drawReducedPosters() {
  // No scenes, no ScrollTrigger, no RAF: just paint each scene's end frame
  // so the page shows finished states instead of empty black canvases.
  for (const def of sceneList) {
    const track = document.querySelector<HTMLElement>(`[data-scene="${def.id}"]`);
    if (!track) continue;
    const canvas = track.querySelector('canvas');
    if (!canvas) continue;
    const player = new FramePlayer(canvas, def.dir, def.frames, {
      nativeW: def.width ?? 1280,
      nativeH: def.height ?? 720,
    });
    player.drawStill(player.endFrame());
  }
}

function initScenes() {
  for (const def of sceneList) {
    const scene = new Scene(def, (p, frame) => {
      const st = sceneStates.find((s) => s.scene === scene);
      if (st) {
        st.p = p;
        st.frame = frame;
      }
    });
    sceneStates.push({ scene, p: 0, frame: 0 });
  }
  // one overlay writer: the scene currently pinned (or nearest to viewport)
  if (debugEl) {
    const writeOverlay = () => {
      const active =
        sceneStates.find((s) => s.scene.st?.isActive) ??
        sceneStates.reduce((best, s) => (s.p > best.p ? s : best), sceneStates[0]);
      if (active) updateDebug(debugEl, active.scene.def.id, active.p, active.frame);
      requestAnimationFrame(writeOverlay);
    };
    requestAnimationFrame(writeOverlay);
  }
}

if (reduced) {
  document.documentElement.setAttribute('data-reduced', '');
  drawReducedPosters();
} else {
  initScenes();
  if (params.get('motion') === 'on' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.info('[hoodie] ?motion=on: full scrubbed experience forced over prefers-reduced-motion.');
  }
}

/* ---------- highlights rail ---------- */
const TILE_LABELS: Record<string, string> = {
  fabric: 'highlights.t_fabric',
  orbits: 'highlights.t_orbits',
  rotating: 'highlights.t_rotating',
  showcase: 'highlights.t_showcase',
};

function initRail() {
  const rail = document.getElementById('rail')!;
  const players: PingPong[] = [];
  for (const [name, info] of Object.entries(manifest.tiles) as [string, { dir: string; frames: number }][]) {
    const tile = document.createElement('article');
    tile.className = 'tile';
    const caption = document.createElement('p');
    caption.className = 'tile__caption';
    caption.dataset.i18n = TILE_LABELS[name] ?? 'highlights.kicker';
    caption.textContent = t(caption.dataset.i18n);
    tile.appendChild(caption);
    rail.appendChild(tile);
    const pp = new PingPong(tile, withBase(info.dir), info.frames);
    if (reduced) pp.drawOnce(0);
    else players.push(pp);
  }
  // play only tiles in view
  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const pp = players[Array.from(rail.children).indexOf(e.target as Element)];
        if (!pp) continue;
        if (e.isIntersecting) pp.start();
        else pp.stop();
      }
    },
    { threshold: 0.25 },
  );
  Array.from(rail.children).forEach((c) => obs.observe(c));
}
initRail();

/* ---------- 360 copy beats: frame-anchored (design scene) ---------- */
// beats fade via data-in/data-out already; frame anchoring is implicit through bands.

/* ---------- bumper veil (fade to black on scroll) ---------- */
ScrollTrigger.create({
  trigger: '.bumper',
  start: 'top 80%',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    const veil = document.getElementById('bumper-veil');
    if (veil) veil.style.opacity = String(self.progress);
  },
});

/* ---------- size table + buy widget ---------- */
let selectedSize = 'M';
let qty = 1;

const sizeWrap = document.getElementById('size-buttons')!;
const fitBody = document.getElementById('fit-body')!;

function buildSizeButtons() {
  sizeWrap.innerHTML = '';
  for (const s of strings.sizefit.sizes) {
    const b = document.createElement('button');
    b.className = 'size-btn';
    b.textContent = s;
    b.setAttribute('aria-pressed', String(s === selectedSize));
    b.addEventListener('click', () => {
      selectedSize = s;
      buildSizeButtons();
      buildSizeTable();
      const bs = document.getElementById('buy-size');
      if (bs) bs.textContent = s;
    });
    sizeWrap.appendChild(b);
  }
}

function buildSizeTable() {
  fitBody.innerHTML = '';
  for (const row of strings.sizefit.table) {
    const tr = document.createElement('tr');
    if (row.size === selectedSize) tr.setAttribute('data-selected', '');
    tr.innerHTML = `
      <td>${row.size}</td>
      <td>${row.chest}</td>
      <td>${row.length}</td>
      <td>${row.sleeve}</td>`;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      selectedSize = row.size;
      buildSizeButtons();
      buildSizeTable();
      const bs = document.getElementById('buy-size');
      if (bs) bs.textContent = selectedSize;
    });
    fitBody.appendChild(tr);
  }
}
buildSizeButtons();
buildSizeTable();

const qtyN = document.getElementById('qty-n')!;
function updateBuyTotal() {
  const total = strings.buy.unit_price * qty;
  const el = document.getElementById('buy-total');
  if (el) el.textContent = `$${total}`;
  qtyN.textContent = String(qty);
}
document.getElementById('qty-minus')?.addEventListener('click', () => {
  qty = Math.max(1, qty - 1);
  updateBuyTotal();
});
document.getElementById('qty-plus')?.addEventListener('click', () => {
  qty = Math.min(9, qty + 1);
  updateBuyTotal();
});
updateBuyTotal();

/* ---------- buy CTA ---------- */
const cta = document.getElementById('buy-cta')!;
cta.addEventListener('click', (e) => {
  e.preventDefault();
  const total = strings.buy.unit_price * qty;
  const body = encodeURIComponent(
    `Order: heather-grey hoodie, size ${selectedSize}, qty ${qty}, total $${total}`,
  );
  if (ORDER_MODE === 'email') {
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Hoodie order')}&body=${body}`;
  } else {
    alert(`${t('buy.cta')}: ${selectedSize} × ${qty} — $${total}`);
  }
});

/* ---------- specs accordion ---------- */
const acc = document.getElementById('acc')!;
type AccItem = { key: string; label: string; value: string };
const accItems: AccItem[] = ['composition', 'weight', 'care', 'origin'].map((k) => ({
  key: `specs.${k}`,
  label: t(`specs.${k}.label`),
  value: t(`specs.${k}.value`),
}));

for (const item of accItems) {
  const wrap = document.createElement('div');
  wrap.className = 'acc__item';
  const btn = document.createElement('button');
  btn.className = 'acc__btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = `<span>${item.label}</span><span class="chev">▾</span>`;
  const panel = document.createElement('div');
  panel.className = 'acc__panel';
  panel.innerHTML = `<div>${item.value}</div>`;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.style.maxHeight = open ? '0' : `${panel.scrollHeight}px`;
  });
  wrap.append(btn, panel);
  acc.appendChild(wrap);
}

/* ---------- preloader: hide once the hero canvas has actually drawn p=0 ---------- */
// The hero Scene exposes whenFirstDrawn() which resolves only after frame 0
// (lossless f001.webp) hits the canvas backing store at full resolution.
if (reduced) {
  hidePreloader();
} else {
  const heroState = sceneStates[0];
  heroState?.scene.whenFirstDrawn
    .then(hidePreloader)
    .catch(() => hidePreloader());
  setTimeout(hidePreloader, 4000); // safety
}

/* ---------- refresh triggers after fonts/layout settle ---------- */
window.addEventListener('load', () => ScrollTrigger.refresh());
