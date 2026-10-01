# BRIEF — Cinematic Product Page: Nike Heather-Grey Hoodie

**Type:** Client project · **Reference style:** apple.com/iphone-18-pro (dark, cinematic, scroll-driven) · **Languages:** Arabic (RTL) + English toggle

> **Note on the Apple reference:** I could not load the live iPhone 18 Pro page while writing this. The section map below follows the long-standing structure of Apple's iPhone Pro pages (hero → highlights → design/material → performance → camera → buy). Send a screen recording or screenshots of the page and I'll tighten the mapping.

---

## 1. Source material reviewed

Two images, same product, shot on a near-black studio backdrop:

| # | View | Notes |
|---|------|-------|
| 1 | Front, hood up, straight-on | Oversized boxy fit, dropped shoulders, kangaroo pocket, flat white drawstrings, small white swoosh on chest |
| 2 | Three-quarter, hood up, angled | Shows sleeve volume, ribbed cuff and hem, hood depth |

- **No bag or packaging appears in either image**, so there is no existing Arabic text to extract (see §3).
- The images look AI-generated. Every generated video will inherit any quirks in them, so consistency checks matter (§6).
- We have **only front and 3/4 views**. No back, no interior hood, no fabric macro, no tag.

---

## 2. Brand colors (sampled from the hoodie image)

The palette comes from the product itself. Values were sampled from the image, not from Nike brand guidelines.

| Token | Hex | Use |
|-------|-----|-----|
| `--void` | `#030303` | Page background (matches the studio backdrop) |
| `--ink-white` | `#F4F4F4` | Headlines, swoosh, drawstring; primary text |
| `--fleece-peak` | `#D8D8D8` | Highlights, hairlines, secondary text |
| `--fleece-light` | `#A5A5A5` | Muted text, icons |
| `--fleece-mid` | `#919090` | Core heather grey (product body) |
| `--fleece-shadow` | `#575657` | Borders, cards on black, disabled states |

**Direction:** strictly monochrome so the product is the only texture on the page. Any accent color (for buttons or links) is an open question (§8). Avoid Nike's own typefaces and orange; use a neutral grotesk for Latin and a clean Arabic sans (e.g. IBM Plex Sans Arabic, Tajawal or Noto Kufi Arabic) with matched weights.

---

## 3. Arabic text already on packaging

**None.** There is no packaging in the supplied images. For now, all Arabic on the page is new copy written for this project, with the drafts in §4. If the client has a bag, hang tag or box, send a photo and I'll extract and match its wording and typography.

---

## 4. Page structure, mapped from Apple

Scroll model: full-bleed black sections, one idea per screen, pinned scroll scenes, large type that fades in and out. Sticky glass sub-nav throughout.

| # | Section | Apple equivalent | What happens | Draft headline (EN / AR) — *placeholders, to be refined with the client* |
|---|---------|------------------|--------------|------|
| 0 | **Sticky nav** | Local product nav | Product name left, section anchors, **AR / EN toggle**, "Buy" pill. Flips to RTL with the toggle. | — |
| 1 | **Hero** | iPhone hero film | Hoodie emerges from darkness and rotates slowly. Headline fades in, price line and CTA below. | Made to stay. / صُنع ليبقى. |
| 2 | **Highlights reel** | "Get the highlights" | Horizontal card carousel of short clips (fabric, hood, pocket, drawstring), each with a one-line caption. | The highlights. / أبرز التفاصيل. |
| 3 | **Design / silhouette** | Design section | Pinned scene: scrolling scrubs a 360° turn (front → side → back). Text lines appear at key angles. | Oversized by design. / قصّة واسعة، بتصميم مقصود. |
| 4 | **Fabric / material** | Titanium / materials | Macro zoom into the heather texture, the grey fibres resolve out of black. Fabric specs appear as large numerals or short lines. | Soft inside. Tough outside. / ناعم من الداخل، متين من الخارج. |
| 5 | **Hood & fit** | Chip / performance | Slow hood push-in and drape shot. Short cards: hood structure, drop shoulder, ribbed cuff and hem. | A hood that holds its shape. / قبّعة تحافظ على شكلها. |
| 6 | **Details grid** | Feature bento | 4 to 6 tiles: kangaroo pocket, flat drawstrings, embroidered swoosh, cuffs, hem, interior. Each tile has a small looping clip. | Every detail, considered. / كل تفصيلة محسوبة. |
| 7 | **Size & fit** | "Compare models" | Size selector with fit visual and measurement table (fills the role of Apple's compare table). | Find your fit. / اعثر على مقاسك. |
| 8 | **Buy** | Buy / "Get iPhone" | Sticky summary: size, quantity, price, CTA. Delivery and returns lines. | Get yours. / احصل عليه الآن. |
| 9 | **Specs & care** | Tech specs | Collapsible accordion: composition, weight, care, origin. | Details & care. / التفاصيل والعناية. |
| 10 | **Footer** | Apple footer | Legal, links, contact, language switch. | — |

*Claims about fabric, hood construction, cuffs and fit are inferred from the photos. Confirm every one with the client before it goes on the page.*

**Motion rules:** pinned scenes scrubbed with GSAP ScrollTrigger (or equivalent), autoplay muted loops for tiles, `prefers-reduced-motion` fallback to static posters, and lazy loading for everything below the hero.

**RTL rules:** `dir="rtl"` on `<html>` in Arabic. Use CSS logical properties (`margin-inline`, `inset-inline`). Mirror carousels and arrows. The hoodie video itself is never mirrored (the swoosh would flip), so Arabic layouts must be composed around unmirrored media.

---

## 5. Video assets to generate

Common specs: 16:9, 4K master exported to 1080p and 720p, 24 fps, near-black backdrop `#030303` matching the stills, no text baked in, H.264 MP4 plus WebM, poster frame for each.

| ID | Asset | Length | Used in | Notes |
|----|-------|--------|---------|-------|
| V1 | **Hero reveal** | 6–8 s | §1 | Hoodie emerges from darkness with a slow rocking rotation. Slow push-in. Ends on a clean front pose. |
| V2 | **360° turntable** | 5–6 s (or 120–180 frame sequence) | §3 | Locked camera, even lighting, front → side → back. Preferably exported as a WebP frame sequence for scroll-scrubbing. |
| V3 | **Fabric macro** | 4–5 s | §4 | Extreme close-up of heather fleece, slow lateral drift, raking light. |
| V4 | **Hood drape** | 4–5 s | §5 | Slow push into the hood opening, showing depth and interior. |
| V5 | **Pocket & drawstring** | 3–4 s each | §2, §6 | Drawstring settling with subtle motion, hand-in-pocket suggestion (no faces). |
| V6 | **Swoosh embroidery** | 3 s | §6 | Macro of the chest logo, stitch texture catching light. |
| V7 | **Cuff & hem** | 3 s | §6 | Rib detail, slight fabric movement. |
| V8 | **Highlights supercut** | 15–20 s (optional) | §2 | Only if we want one continuous reel instead of separate cards. |

---

## 6. Image assets needed

Provided so far: **front (hood up)** and **3/4 (hood up)**.

| ID | Asset | Purpose |
|----|-------|---------|
| I1 | **Back view** | Completes the turntable and the design section |
| I2 | **Side profile (90°)** | Anchor frame for the turntable |
| I3 | **Hood interior / opening** | Reference for V4 |
| I4 | **Fabric macro still** | Reference for V3 and the specs section |
| I5 | **Swoosh macro still** | Reference for V6 |
| I6 | **Cuff and hem macro stills** | Reference for V7 and the details grid |
| I7 | **Pocket detail** | Details grid tile |
| I8 | **Drawstring end detail** | Details grid tile |
| I9 | **Hood down (relaxed) variant** | Showing the hoodie in a second state |
| I10 | **Flat lay, top-down** | Size chart visual |
| I11 | **Neck label / inner tag** | Specs section, authenticity |
| I12 | **Transparent PNG cutouts** of front, 3/4 and back | Layering in scroll scenes |
| I13 | **Social/OG image (1200×630)** | Sharing |
| I14 | **Favicon / app icon** | Site polish |

**Consistency requirements for all generated assets:** the same fabric tone (`#919090` body), the same swoosh size and position, the same drawstring length, identical lighting direction, and the source stills used as first/last-frame references. Reject any output where the logo warps, the hood geometry changes, or the fabric texture shifts mid-clip.

---

## 7. Build assumptions (change if needed)

- Static site: HTML/CSS/JS with GSAP ScrollTrigger, no framework unless the client needs a CMS.
- Bilingual through a single data file of strings keyed by section, with the language saved in `localStorage` (on the deployed site, not inside a Claude artifact).
- Performance target: hero video under about 3 MB at 1080p, everything below the fold lazy-loaded, poster frames first.
- Deliverables: responsive (mobile-first), keyboard accessible, reduced-motion support.

---

## 8. Open questions for the client

1. **Authorization:** is the client an authorized Nike retailer or licensee, and may the swoosh and Nike name be used in generated video and on the page?
2. **Product data:** official product name, price and currency, available sizes, fabric composition and weight, care instructions, other colorways.
3. **Colorways:** only heather grey, or several? This decides whether §7 includes a color picker like Apple's finish selector.
4. **Purchase flow:** real checkout, WhatsApp/Instagram order button, or contact form?
5. **Accent color:** stay purely monochrome, or one restrained accent for CTAs?
6. **Domain, hosting and deadline.**
7. **Arabic copy:** should the client approve the wording, and should it be Modern Standard Arabic or lean toward Algerian dialect?
