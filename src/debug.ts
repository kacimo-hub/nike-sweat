/**
 * debug.ts — overlay showing p, band and frame index per scene.
 * Toggle: backtick key or `?debug` in the URL.
 */
import { DEBUG_DEFAULT } from './config';

const enabled = DEBUG_DEFAULT || new URLSearchParams(location.search).has('debug');

export function debugEnabled(): boolean {
  return enabled;
}

export function createDebugOverlay(): HTMLElement | null {
  if (!enabled) return null;
  const el = document.createElement('div');
  el.id = 'debug-overlay';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  return el;
}

export function updateDebug(
  el: HTMLElement | null,
  sceneId: string,
  p: number,
  frame: number,
): void {
  if (!el) return;
  const band =
    p < 0.1 ? 'B0' : p < 0.45 ? 'B1' : p < 0.62 ? 'B2' : p < 0.88 ? 'B3' : 'B4';
  el.textContent = `${sceneId}  p=${p.toFixed(3)}  ${band}  frame=${frame}`;
}

// backtick toggles a live re-check of ?debug
window.addEventListener('keydown', (e) => {
  if (e.key === '`') {
    const url = new URL(location.href);
    if (url.searchParams.has('debug')) url.searchParams.delete('debug');
    else url.searchParams.set('debug', '1');
    history.replaceState(null, '', url);
    location.reload();
  }
});
