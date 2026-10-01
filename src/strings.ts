/**
 * strings.ts — EN + AR copy, keyed per section.
 *
 * EVERY line is a placeholder draft. Anything that makes a claim about the
 * product (fabric, construction, fit, origin) is flagged unverified: true
 * and needs client confirmation before launch.
 */
export type Lang = 'en' | 'ar';

export interface Line {
  en: string;
  ar: string;
  /** true when the claim needs client confirmation before launch */
  unverified?: boolean;
}

export const strings = {
  meta: {
    title: { en: 'Heather-Grey Hoodie', ar: 'هودي رمادي', unverified: true },
  },
  nav: {
    highlights: { en: 'Highlights', ar: 'أبرز التفاصيل' },
    design: { en: 'Design', ar: 'التصميم' },
    fabric: { en: 'Fabric', ar: 'القماش' },
    fit: { en: 'Fit', ar: 'القَصّة' },
    details: { en: 'Details', ar: 'التفاصيل' },
    buy: { en: 'Buy', ar: 'اشترِ الآن' },
  },
  hero: {
    kicker: { en: 'Heather-Grey Hoodie', ar: 'هودي رمادي', unverified: true },
    headline: { en: 'Made to stay.', ar: 'صُنع ليبقى.' },
    sub: {
      en: 'An oversized fleece hoodie, built from the yarn up.',
      ar: 'هودي واسع من الفليس، مبني من الخيط حتى القطعة.',
      unverified: true,
    },
    price: { en: 'From $89', ar: 'ابتداءً من ٨٩ دولار', unverified: true },
    cta: { en: 'Buy', ar: 'اشترِ الآن' },
  },
  highlights: {
    kicker: { en: 'Highlights', ar: 'أبرز التفاصيل' },
    headline: { en: 'The highlights.', ar: 'أبرز التفاصيل.' },
    t_fabric: { en: 'Brushed fleece, up close.', ar: 'فليس مصقول عن قرب.', unverified: true },
    t_orbits: { en: 'Every angle, considered.', ar: 'كل زاوية محسوبة.', unverified: true },
    t_rotating: { en: 'A silhouette that holds.', ar: 'قَصّة تحافظ على شكلها.', unverified: true },
    t_showcase: { en: 'Volume with intent.', ar: 'حجم بنيّة مقصودة.', unverified: true },
  },
  design: {
    kicker: { en: 'Design', ar: 'التصميم' },
    headline: { en: 'Oversized by design.', ar: 'قصّة واسعة، بتصميم مقصود.' },
    beat_front: {
      en: 'Straight front. Flat drawstrings. One quiet mark.',
      ar: 'واجهة مستقيمة. أربطة مسطّحة. علامة واحدة هادئة.',
      unverified: true,
    },
    beat_side: {
      en: 'Dropped shoulders. Sleeve volume that falls, not bulges.',
      ar: 'أكتاف هابطة. أكمام واسعة تسقط ولا تنتفخ.',
      unverified: true,
    },
    beat_back: {
      en: 'Clean from behind. Nothing extra.',
      ar: 'نظيف من الخلف. لا شيء زائد.',
      unverified: true,
    },
  },
  fabric: {
    kicker: { en: 'Fabric', ar: 'القماش' },
    headline: { en: 'Soft inside. Tough outside.', ar: 'ناعم من الداخل، متين من الخارج.' },
    spec_weight: { en: '380 gsm', ar: '٣٨٠ غ/م²', unverified: true },
    spec_weight_label: { en: 'midweight fleece', ar: 'فليس متوسط الوزن', unverified: true },
    spec_face: { en: '100% cotton face', ar: 'وجه قطن ١٠٠٪', unverified: true },
    spec_face_label: { en: 'loopback, brushed back', ar: 'حلقة مصقولة من الداخل', unverified: true },
    spec_weave: { en: 'Heather knit', ar: 'نسيج مبقّع', unverified: true },
    spec_weave_label: { en: 'visible at every angle', ar: 'ظاهر من كل زاوية', unverified: true },
  },
  hoodfit: {
    kicker: { en: 'Hood & Fit', ar: 'القبّعة والقَصّة' },
    headline: { en: 'A hood that holds its shape.', ar: 'قبّعة تحافظ على شكلها.' },
    card_hood: {
      en: 'Double-layer hood with flat drawcords — structured, never floppy.',
      ar: 'قبّعة بطبقتين مع أربطة مسطّحة — هيكلية ولا تتدلى.',
      unverified: true,
    },
    card_shoulder: {
      en: 'Dropped shoulders and a boxy body for true oversized drape.',
      ar: 'أكتاف هابطة وجسم مربّع لتدلٍّ واسع حقيقي.',
      unverified: true,
    },
    card_rib: {
      en: 'Ribbed cuffs and hem lock the shape in.',
      ar: 'أساور وحواف مضلّعة تثبّت الشكل.',
      unverified: true,
    },
  },
  details: {
    kicker: { en: 'Details', ar: 'التفاصيل' },
    headline: { en: 'Every detail, considered.', ar: 'كل تفصيلة محسوبة.' },
    d_hood: { en: 'Hood depth', ar: 'عمق القبّعة', unverified: true },
    d_back: { en: 'Back panel', ar: 'اللوح الخلفي', unverified: true },
    d_front: { en: 'Front profile', ar: 'الواجهة الأمامية', unverified: true },
    d_swoosh: { en: 'Chest embroidery', ar: 'تطريز الصدر', unverified: true },
  },
  sizefit: {
    kicker: { en: 'Size & Fit', ar: 'المقاس والقَصّة' },
    headline: { en: 'Find your fit.', ar: 'اعثر على مقاسك.' },
    note: {
      en: 'Oversized cut. Size down for a regular fit.',
      ar: 'قَصّة واسعة. اختر مقاساً أصغر للقَصّة العادية.',
      unverified: true,
    },
    col_size: { en: 'Size', ar: 'المقاس' },
    col_chest: { en: 'Chest', ar: 'الصدر' },
    col_length: { en: 'Body length', ar: 'طول الجسم' },
    col_sleeve: { en: 'Sleeve', ar: 'الكمّ' },
    unit_note: { en: 'cm, garment measured flat', ar: 'سم، القياس على القطعة مفرودة', unverified: true },
    sizes: ['S', 'M', 'L', 'XL'] as string[],
    table: [
      { size: 'S', chest: 108, length: 68, sleeve: 61 },
      { size: 'M', chest: 112, length: 70, sleeve: 62 },
      { size: 'L', chest: 116, length: 72, sleeve: 63 },
      { size: 'XL', chest: 121, length: 74, sleeve: 64 },
    ] as { size: string; chest: number; length: number; sleeve: number }[],
  },
  buy: {
    kicker: { en: 'Buy', ar: 'اشترِ الآن' },
    headline: { en: 'Get yours.', ar: 'احصل عليه الآن.' },
    size_label: { en: 'Size', ar: 'المقاس' },
    qty_label: { en: 'Quantity', ar: 'الكمية' },
    total_label: { en: 'Total', ar: 'المجموع' },
    unit_price: 89,
    currency: { en: 'USD', ar: 'دولار', unverified: true },
    cta: { en: 'Order', ar: 'اطلب الآن' },
    note: {
      en: 'Free delivery over $120. Returns within 14 days.',
      ar: 'توصيل مجاني فوق ١٢٠ دولار. إرجاع خلال ١٤ يوماً.',
      unverified: true,
    },
  },
  specs: {
    kicker: { en: 'Specs & Care', ar: 'المواصفات والعناية' },
    headline: { en: 'Details & care.', ar: 'التفاصيل والعناية.' },
    composition: {
      label: { en: 'Composition', ar: 'التركيب' },
      value: { en: '80% cotton, 20% polyester', ar: '٨٠٪ قطن، ٢٠٪ بوليستر', unverified: true },
    },
    weight: {
      label: { en: 'Weight', ar: 'الوزن' },
      value: { en: '380 gsm midweight fleece', ar: 'فليس متوسط الوزن ٣٨٠ غ/م²', unverified: true },
    },
    care: {
      label: { en: 'Care', ar: 'العناية' },
      value: {
        en: 'Machine wash cold, inside out. Tumble dry low.',
        ar: 'غسيل بارد بالآلة من الداخل للخارج. تجفيف منخفض.',
        unverified: true,
      },
    },
    origin: {
      label: { en: 'Origin', ar: 'بلد الصنع' },
      value: { en: 'Unconfirmed', ar: 'غير مؤكد', unverified: true },
    },
  },
  footer: {
    legal: {
      en: 'Placeholder demo page. All product claims unconfirmed.',
      ar: 'صفحة تجريبية. جميع ادعاءات المنتج غير مؤكدة.',
    },
    lang: { en: 'العربية', ar: 'English' },
  },
} as const;

export type Strings = typeof strings;
