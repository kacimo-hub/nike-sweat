/**
 * config.ts — build-time flags and global knobs.
 */

/** Nike wordmark in page copy is OFF until usage is authorized. */
export const BRAND_TEXT_ENABLED = false;

/** Show the p / band / frame debug overlay by default (also `?debug` or backtick). */
export const DEBUG_DEFAULT = false;

/** Lerp factor for smoothing raw ScrollTrigger progress (0..1). Higher = snappier. */
export const PROGRESS_LERP = 0.12;

/** Contact email shown in footer / buy section. */
export const CONTACT_EMAIL = 'orders@example.com';

/** Order flow: 'email' until a real checkout exists. */
export const ORDER_MODE: 'email' | 'checkout' | 'whatsapp' = 'email';
