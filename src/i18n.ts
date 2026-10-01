/**
 * i18n.ts — language state, DOM text swap, dir flip.
 *
 * The scroll timeline is direction-agnostic: only text and layout direction
 * change. Media is NEVER mirrored (flipping the hoodie flips the swoosh).
 */
import { strings, type Lang } from './strings';

const KEY = 'hoodie-lang';
let current: Lang = 'en';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dict = any;

function resolve(path: string): Dict | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = strings;
  for (const part of path.split('.')) {
    node = node?.[part];
    if (node == null) return null;
  }
  return node;
}

/** translate: t('hero.headline') -> text in current lang */
export function t(path: string): string {
  const node = resolve(path);
  if (node == null) return path;
  if (typeof node === 'string') return node;
  return node[current] ?? node.en ?? path;
}

export function lang(): Lang {
  return current;
}

export function initI18n() {
  const saved = localStorage.getItem(KEY) as Lang | null;
  current = saved === 'ar' ? 'ar' : 'en';
  applyLang();
}

export function setLang(l: Lang) {
  current = l;
  localStorage.setItem(KEY, l);
  applyLang();
}

export function toggleLang() {
  setLang(current === 'en' ? 'ar' : 'en');
}

function applyLang() {
  document.documentElement.lang = current;
  document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
  document.title = t('meta.title');

  // swap every [data-i18n] text content
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n!);
  });

  // unverified-claim chips: read the flag from strings via data-i18n path
  document.querySelectorAll<HTMLElement>('[data-claim]').forEach((el) => {
    const node = resolve(el.dataset.claim!);
    el.toggleAttribute('data-unverified', !!node?.unverified);
  });

  // announce for screen readers
  const live = document.getElementById('lang-live');
  if (live) live.textContent = current === 'ar' ? 'العربية' : 'English';
}
