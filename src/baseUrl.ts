/**
 * baseUrl.ts — prefix public/ asset paths with Vite's configured base.
 *
 * The asset manifest stores root-relative paths (`assets/frames/hero`). On
 * GitHub Pages the site is served under /hoodie-site/, so every runtime URL
 * must be prefixed with import.meta.env.BASE_URL instead of assuming the
 * site lives at /.
 */
const RAW_BASE = import.meta.env.BASE_URL ?? '/';

export function withBase(path: string): string {
  const base = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}
