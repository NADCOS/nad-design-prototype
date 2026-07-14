// Step 3: Interior design styles (primary + optional secondary) and their
// suggested colour palettes (used behind the palette swatches on the Style step).
export const STYLES = [
  { key: 'modern', en: 'Modern', ar: 'عصري' }, { key: 'contemporary', en: 'Contemporary', ar: 'معاصر' },
  { key: 'minimalist', en: 'Minimalist', ar: 'بسيط' }, { key: 'japandi', en: 'Japandi', ar: 'جاباندي' },
  { key: 'modernluxury', en: 'Modern Luxury', ar: 'فخامة عصرية' }, { key: 'classic', en: 'Classic', ar: 'كلاسيكي' },
  { key: 'neoclassical', en: 'Neoclassical', ar: 'نيوكلاسيكي' }, { key: 'industrial', en: 'Industrial', ar: 'صناعي' },
  { key: 'scandinavian', en: 'Scandinavian', ar: 'إسكندنافي' }, { key: 'najdi', en: 'Modern Najdi', ar: 'نجدي عصري' },
  { key: 'islamic', en: 'Islamic Contemporary', ar: 'إسلامي معاصر' }, { key: 'mediterranean', en: 'Mediterranean', ar: 'متوسطي' },
  { key: 'custom', en: 'Custom Style', ar: 'نمط مخصص' },
];

export const STYLE_PALETTES = {
  modern: ['oklch(93% 0.01 80)', 'oklch(70% 0.02 60)', 'oklch(30% 0.02 50)', 'oklch(64% 0.10 68)'],
  contemporary: ['oklch(95% 0.01 75)', 'oklch(75% 0.03 70)', 'oklch(40% 0.03 55)', 'oklch(60% 0.09 65)'],
  minimalist: ['oklch(97% 0.005 80)', 'oklch(88% 0.01 75)', 'oklch(55% 0.01 60)', 'oklch(30% 0.01 50)'],
  japandi: ['oklch(95% 0.015 80)', 'oklch(80% 0.03 75)', 'oklch(55% 0.03 60)', 'oklch(35% 0.02 50)'],
  modernluxury: ['oklch(20% 0.01 40)', 'oklch(40% 0.02 50)', 'oklch(65% 0.09 68)', 'oklch(90% 0.01 80)'],
  classic: ['oklch(92% 0.02 78)', 'oklch(70% 0.04 70)', 'oklch(45% 0.04 55)', 'oklch(28% 0.02 45)'],
  neoclassical: ['oklch(94% 0.015 78)', 'oklch(75% 0.03 70)', 'oklch(55% 0.06 65)', 'oklch(30% 0.02 45)'],
  industrial: ['oklch(85% 0.01 70)', 'oklch(55% 0.01 55)', 'oklch(35% 0.01 40)', 'oklch(20% 0.005 30)'],
  scandinavian: ['oklch(97% 0.005 85)', 'oklch(88% 0.015 80)', 'oklch(70% 0.02 70)', 'oklch(40% 0.02 55)'],
  najdi: ['oklch(90% 0.02 75)', 'oklch(65% 0.05 60)', 'oklch(45% 0.06 50)', 'oklch(60% 0.10 68)'],
  islamic: ['oklch(92% 0.015 78)', 'oklch(70% 0.05 65)', 'oklch(50% 0.07 60)', 'oklch(35% 0.03 45)'],
  mediterranean: ['oklch(95% 0.02 85)', 'oklch(80% 0.04 75)', 'oklch(55% 0.05 200)', 'oklch(40% 0.03 60)'],
  custom: ['oklch(90% 0.02 75)', 'var(--border)', 'oklch(50% 0.04 60)', 'oklch(30% 0.02 50)'],
};

// Suggested materials per style, used to badge "Recommended" swatches on the Materials step.
export const STYLE_RECS = {
  najdi: ['Riyadh Stone', 'Natural Stone', 'Decorative Gypsum', 'Warm Wood'],
  islamic: ['Decorative Gypsum', 'Natural Stone', 'Brass', 'Gold Metal'],
  scandinavian: ['Light Wood', 'Off-white Linen', 'Wood Flooring'],
  japandi: ['Light Wood', 'Off-white Linen', 'Microcement'],
  industrial: ['Exposed Ceiling', 'Black Metal', 'Microcement'],
  modernluxury: ['White Marble', 'Gold Metal', 'Velvet'],
  mediterranean: ['Limestone', 'Travertine', 'Off-white Linen'],
};
