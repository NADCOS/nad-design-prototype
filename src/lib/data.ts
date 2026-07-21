// Mock catalogue data — ported from the approved NAD Design prototype.
// Swap this file for real API/Supabase-backed fetches later; the shapes match lib/types.ts.

import type {
  ProjectType, DesignLevel, StyleOption, MaterialCategory, FurnitureCategory, FurnitureItem,
} from './types';

export const SUPPLIERS: string[] = [
  'Alwafi Interiors', 'Studio Terra', 'Bergman Nordic', 'Casa Bronze',
  'Al Faisaliah Furnishings', 'Noir Metal Works', 'Linen & Co.', 'Riyadh Stone Co.',
];

export const PROJECT_TYPES: ProjectType[] = [
  { key: 'apartment', en: 'Apartment', ar: 'شقة', enDesc: 'Compact, efficient layouts for modern city living.', arDesc: 'تصاميم عملية ومدمجة لأسلوب الحياة الحضري العصري.' },
  { key: 'majlis', en: 'Majlis', ar: 'مجلس', enDesc: 'Traditional gathering spaces, reimagined.', arDesc: 'مجالس تقليدية بلمسة عصرية معاد تصورها.' },
  { key: 'bedroom', en: 'Bedroom', ar: 'غرفة نوم', enDesc: 'Private, restful rooms designed around comfort.', arDesc: 'غرف خاصة وهادئة مصممة حول الراحة.' },
  { key: 'living', en: 'Living Room', ar: 'غرفة معيشة', enDesc: 'The heart of the home, styled for gathering.', arDesc: 'قلب المنزل، مصمم للتجمع العائلي.' },
  { key: 'kitchen', en: 'Kitchen', ar: 'مطبخ', enDesc: 'Functional kitchens with a refined finish.', arDesc: 'مطابخ عملية بلمسة نهائية راقية.' },
  { key: 'bathroom', en: 'Bathroom', ar: 'حمام', enDesc: 'Spa-like bathrooms in durable materials.', arDesc: 'حمامات بأجواء منتجع صحي وخامات متينة.' },
  { key: 'outdoor', en: 'Outdoor Space', ar: 'مساحة خارجية', enDesc: 'Courtyards, terraces and gardens, designed to live in.', arDesc: 'ساحات وتراسات وحدائق مصممة للعيش فيها.' },
  { key: 'custom', en: 'Custom Project', ar: 'مشروع مخصص', enDesc: 'Something else entirely — tell us about it.', arDesc: 'مشروع مختلف تماماً — أخبرنا عنه.' },
];

export const DESIGN_LEVELS: DesignLevel[] = [
  { key: 'luxury', en: 'Luxury', ar: 'فاخر', priceMin: 4200, priceMax: 7500,
    enDesc: 'Premium imported materials, bespoke furniture and exclusive finishes.', arDesc: 'خامات مستوردة فاخرة، أثاث مصمم خصيصاً، ولمسات نهائية حصرية.',
    enMaterials: 'Natural stone, marble, fine wood, custom lighting', arMaterials: 'حجر طبيعي، رخام، خشب فاخر، إضاءة مخصصة',
    enQuality: 'Exclusive, bespoke, museum-grade detailing', arQuality: 'تفاصيل حصرية ومصممة خصيصاً بمستوى متحفي' },
  { key: 'highend', en: 'High-End', ar: 'راقي', priceMin: 2800, priceMax: 4200,
    enDesc: 'High-quality materials and furniture with refined finishes and premium lighting.', arDesc: 'خامات وأثاث عالي الجودة بلمسات نهائية راقية وإضاءة مميزة.',
    enMaterials: 'Select stone, engineered wood, designer lighting', arMaterials: 'حجر مختار، خشب هندسي، إضاءة تصميمية',
    enQuality: 'Strong design detail, selected custom elements', arQuality: 'تفاصيل تصميم قوية مع عناصر مخصصة مختارة' },
  { key: 'midrange', en: 'Mid-Range', ar: 'متوسط', priceMin: 1600, priceMax: 2800,
    enDesc: 'Balanced design quality and budget using durable, stylish materials.', arDesc: 'توازن بين الجودة والميزانية باستخدام خامات متينة وعصرية.',
    enMaterials: 'Porcelain, laminate wood, standard fixtures', arMaterials: 'بورسلان، خشب لامينيت، تجهيزات قياسية',
    enQuality: 'Practical, stylish, carefully selected decor', arQuality: 'عملي وأنيق مع ديكور مختار بعناية' },
  { key: 'budget', en: 'Budget-Friendly', ar: 'اقتصادي', priceMin: 900, priceMax: 1600,
    enDesc: 'Affordable, functional and attractive using economical finishes.', arDesc: 'حلول اقتصادية وعملية وجذابة بخامات موفرة للتكلفة.',
    enMaterials: 'Ceramic, paint finishes, ready-made furniture', arMaterials: 'سيراميك، دهانات، أثاث جاهز',
    enQuality: 'Clean, functional, cost-effective', arQuality: 'عملي ونظيف واقتصادي' },
];

export const STYLES: StyleOption[] = [
  { key: 'modern', en: 'Modern', ar: 'عصري' }, { key: 'contemporary', en: 'Contemporary', ar: 'معاصر' },
  { key: 'minimalist', en: 'Minimalist', ar: 'بسيط' }, { key: 'japandi', en: 'Japandi', ar: 'جاباندي' },
  { key: 'modernluxury', en: 'Modern Luxury', ar: 'فخامة عصرية' }, { key: 'classic', en: 'Classic', ar: 'كلاسيكي' },
  { key: 'neoclassical', en: 'Neoclassical', ar: 'نيوكلاسيكي' }, { key: 'industrial', en: 'Industrial', ar: 'صناعي' },
  { key: 'scandinavian', en: 'Scandinavian', ar: 'إسكندنافي' }, { key: 'najdi', en: 'Modern Najdi', ar: 'نجدي عصري' },
  { key: 'islamic', en: 'Islamic Contemporary', ar: 'إسلامي معاصر' }, { key: 'mediterranean', en: 'Mediterranean', ar: 'متوسطي' },
  { key: 'custom', en: 'Custom Style', ar: 'نمط مخصص' },
];

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  { key: 'flooring', en: 'Flooring', ar: 'الأرضيات', tier: 'high', items: [['Marble', 'رخام'], ['Porcelain', 'بورسلان'], ['Ceramic', 'سيراميك'], ['Terrazzo', 'تيرازو'], ['Natural Stone', 'حجر طبيعي'], ['Wood Flooring', 'أرضية خشبية'], ['Vinyl', 'فينيل'], ['Carpet', 'سجاد'], ['Microcement', 'ميكروسمنت']] },
  { key: 'walls', en: 'Walls', ar: 'الجدران', tier: 'mid', items: [['Paint', 'دهان'], ['Wallpaper', 'ورق جدران'], ['Wood Panels', 'ألواح خشبية'], ['Marble', 'رخام'], ['Natural Stone', 'حجر طبيعي'], ['Decorative Plaster', 'جص ديكوري'], ['Microcement', 'ميكروسمنت'], ['Fabric Panels', 'ألواح قماشية'], ['Acoustic Panels', 'ألواح عازلة للصوت']] },
  { key: 'ceilings', en: 'Ceilings', ar: 'الأسقف', tier: 'mid', items: [['Simple Gypsum Ceiling', 'سقف جبسي بسيط'], ['Decorative Gypsum', 'جبس ديكوري'], ['Wooden Ceiling', 'سقف خشبي'], ['Metal Ceiling', 'سقف معدني'], ['Acoustic Ceiling', 'سقف عازل للصوت'], ['Exposed Ceiling', 'سقف مكشوف'], ['Hidden Lighting Ceiling', 'سقف إضاءة مخفية']] },
  { key: 'woodFinishes', en: 'Wood Finishes', ar: 'تشطيبات الخشب', tier: 'mid', items: [['Light Wood', 'خشب فاتح'], ['Warm Wood', 'خشب دافئ'], ['Dark Walnut', 'جوز غامق'], ['Oak', 'بلوط'], ['Reddish Wood', 'خشب محمر'], ['Black Stained Wood', 'خشب أسود']] },
  { key: 'fabrics', en: 'Fabrics', ar: 'الأقمشة', tier: 'low', items: [['Brown Linen', 'كتان بني'], ['Gray Linen', 'كتان رمادي'], ['Off-white Linen', 'كتان أبيض مائل للبيج'], ['Green Linen', 'كتان أخضر'], ['Velvet', 'مخمل'], ['Bouclé', 'بوكليه'], ['Leather', 'جلد'], ['Suede', 'سويدي']] },
  { key: 'metals', en: 'Metals', ar: 'المعادن', tier: 'mid', items: [['Black Metal', 'معدن أسود'], ['Bronze Metal', 'برونز'], ['Gold Metal', 'ذهبي'], ['Silver Metal', 'فضي'], ['Brushed Stainless Steel', 'ستانلس ستيل مصقول']] },
  { key: 'stoneMarble', en: 'Stone & Marble', ar: 'الحجر والرخام', tier: 'high', items: [['Riyadh Stone', 'حجر رياضي'], ['Travertine', 'ترافرتين'], ['Limestone', 'حجر جيري'], ['White Marble', 'رخام أبيض'], ['Beige Marble', 'رخام بيج'], ['Gray Marble', 'رخام رمادي'], ['Black Marble', 'رخام أسود']] },
];

export const FURNITURE_CATEGORIES: FurnitureCategory[] = [
  { key: 'sofas', en: 'Sofas', ar: 'أرائك', finishes: ['fabric', 'wood'] },
  { key: 'lounge', en: 'Lounge Chairs', ar: 'كراسي استرخاء', finishes: ['fabric', 'wood'] },
  { key: 'diningChairs', en: 'Dining Chairs', ar: 'كراسي طعام', finishes: ['fabric', 'wood'] },
  { key: 'diningTables', en: 'Dining Tables', ar: 'طاولات طعام', finishes: ['wood', 'metal'] },
  { key: 'coffeeTables', en: 'Coffee Tables', ar: 'طاولات قهوة', finishes: ['wood', 'metal'] },
  { key: 'sideTables', en: 'Side Tables', ar: 'طاولات جانبية', finishes: ['wood', 'metal'] },
  { key: 'beds', en: 'Beds', ar: 'أسرّة', finishes: ['fabric', 'wood'] },
  { key: 'cabinets', en: 'Cabinets', ar: 'خزائن', finishes: ['wood', 'metal'] },
  { key: 'desks', en: 'Desks', ar: 'مكاتب', finishes: ['wood', 'metal'] },
  { key: 'outdoor', en: 'Outdoor Furniture', ar: 'أثاث خارجي', finishes: ['fabric', 'metal'] },
  { key: 'decoLighting', en: 'Decorative Lighting', ar: 'إضاءة ديكورية', finishes: ['metal'] },
  { key: 'archLighting', en: 'Architectural Lighting', ar: 'إضاءة معمارية', finishes: ['metal'] },
];

export const WOOD_FINISH_OPTS: Array<[string, string]> = [['Light Wood', 'خشب فاتح'], ['Warm Wood', 'خشب دافئ'], ['Dark Walnut', 'جوز غامق'], ['Oak', 'بلوط'], ['Reddish Wood', 'خشب محمر'], ['Black Stained Wood', 'خشب أسود']];
export const FABRIC_OPTS: Array<[string, string]> = [['Brown Linen', 'كتان بني'], ['Gray Linen', 'كتان رمادي'], ['Off-white Linen', 'كتان أبيض مائل للبيج'], ['Velvet', 'مخمل'], ['Bouclé', 'بوكليه'], ['Leather', 'جلد']];
export const METAL_OPTS: Array<[string, string]> = [['Black Metal', 'معدن أسود'], ['Bronze Metal', 'برونز'], ['Gold Metal', 'ذهبي'], ['Brushed Stainless Steel', 'ستانلس ستيل مصقول']];

const DESCRIPTORS = ['Dara', 'Souk', 'Nomad', 'Dune', 'Rimal', 'Wadi', 'Zahra', 'Amal', 'Noor', 'Reem', 'Layan', 'Sadu', 'Qasr', 'Marw', 'Badr', 'Jood', 'Sahra', 'Waha', 'Rakan', 'Hala', 'Fahd', 'Yara', 'Salma', 'Talal'];

function buildFurniture(): FurnitureItem[] {
  const out: FurnitureItem[] = [];
  let d = 0;
  FURNITURE_CATEGORIES.forEach((cat) => {
    for (let i = 0; i < 2; i++) {
      const desc = DESCRIPTORS[d % DESCRIPTORS.length];
      const supplier = SUPPLIERS[d % SUPPLIERS.length];
      const price = 1200 + (d * 137) % 4200;
      out.push({
        id: cat.key + '-' + i,
        category: cat.key,
        name: desc + ' ' + cat.en.replace(/s$/, '').replace(/ Furniture$/, '').replace(/Chairs$/, 'Chair').replace(/Tables$/, 'Table').replace(/Lighting$/, 'Light'),
        code: 'NAD-' + cat.key.slice(0, 3).toUpperCase() + (100 + d),
        supplier,
        price,
        dims: (60 + (d * 7) % 80) + ' x ' + (50 + (d * 11) % 70) + ' x ' + (70 + (d * 5) % 40) + ' cm',
        woodFinish: WOOD_FINISH_OPTS[d % WOOD_FINISH_OPTS.length],
        fabric: FABRIC_OPTS[d % FABRIC_OPTS.length],
        metal: METAL_OPTS[d % METAL_OPTS.length],
        availability: d % 3 === 0 ? 'madeToOrder' : 'inStock',
      });
      d++;
    }
  });
  return out;
}
export const FURNITURE_ITEMS: FurnitureItem[] = buildFurniture();

export const LIGHT_MOODS: LocalizedKVLite[] = [
  { key: 'daylight', en: 'Daylight', ar: 'ضوء النهار' }, { key: 'sunset', en: 'Sunset', ar: 'غروب الشمس' },
  { key: 'night', en: 'Night', ar: 'ليلي' }, { key: 'warm', en: 'Warm Interior', ar: 'إضاءة دافئة' },
  { key: 'soft', en: 'Soft Neutral', ar: 'إضاءة محايدة ناعمة' },
];
export const QUALITY_OPTS: LocalizedKVLite[] = [
  { key: 'photorealistic', en: 'Photorealistic', ar: 'واقعي' }, { key: 'conceptual', en: 'Conceptual', ar: 'مفاهيمي' },
  { key: 'presentation', en: 'Presentation Quality', ar: 'جودة عرض تقديمي' }, { key: 'highres', en: 'High-Resolution', ar: 'دقة عالية' },
];

interface LocalizedKVLite { key: string; en: string; ar: string; }

export const STYLE_RECS: Record<string, string[]> = {
  najdi: ['Riyadh Stone', 'Natural Stone', 'Decorative Gypsum', 'Warm Wood'],
  islamic: ['Decorative Gypsum', 'Natural Stone', 'Brass', 'Gold Metal'],
  scandinavian: ['Light Wood', 'Off-white Linen', 'Wood Flooring'],
  japandi: ['Light Wood', 'Off-white Linen', 'Microcement'],
  industrial: ['Exposed Ceiling', 'Black Metal', 'Microcement'],
  modernluxury: ['White Marble', 'Gold Metal', 'Velvet'],
  mediterranean: ['Limestone', 'Travertine', 'Off-white Linen'],
};

export const STYLE_PALETTES: Record<string, string[]> = {
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
  custom: ['oklch(90% 0.02 75)', '#d8cdbd', 'oklch(50% 0.04 60)', 'oklch(30% 0.02 50)'],
};

function toCamelWords(str: string): string {
  return str.replace(/[éÉ]/g, 'e').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function materialImageKey(catKey: string, en: string): string {
  return catKey + toCamelWords(en) + 'Image';
}
export const PREFILL_MATERIAL_IMAGES: Record<string, string> = {
  flooringMarbleImage: '/assets/marble.jpeg',
  flooringPorcelainImage: '/assets/porcelain.jpeg',
  flooringCeramicImage: '/assets/ceramic.jpeg',
};
export function materialSlotId(catKey: string, en: string): string {
  return 'mat-' + materialImageKey(catKey, en);
}

export interface MaterialMeta {
  supplier: string; code: string; priceLabel: string; colorsList: string[]; sustain: string; suitable: string; maint: string;
}

export function materialMeta(catKey: string, item: { en: string }, lang: 'en' | 'ar', fmtSar: (n: number, lang: 'en' | 'ar') => string): MaterialMeta {
  const cat = MATERIAL_CATEGORIES.find((c) => c.key === catKey)!;
  const idx = cat.items.findIndex((it) => it[0] === item.en);
  const supplier = SUPPLIERS[(catKey.length + idx) % SUPPLIERS.length];
  const code = 'NAD-' + catKey.slice(0, 3).toUpperCase() + '-' + (100 + idx);
  const tierPrice: Record<MaterialTierKey, [number, number]> = { high: [220, 480], mid: [90, 220], low: [45, 120] };
  const [pmin, pmax] = tierPrice[cat.tier];
  const priceLabel = fmtSar(pmin, lang) + ' - ' + fmtSar(pmax, lang) + (lang === 'ar' ? ' / م²' : ' / m²');
  const colorsList = lang === 'ar' ? ['بيج', 'رمادي فاتح', 'عاجي', 'بني دافئ'] : ['Beige', 'Light Grey', 'Ivory', 'Warm Brown'];
  const sustain = idx % 2 === 0
    ? (lang === 'ar' ? 'مصدر محلي / منخفض الأثر البيئي' : 'Locally sourced / low embodied carbon')
    : (lang === 'ar' ? 'مستورد — شهادة استدامة متاحة' : 'Imported — sustainability certificate available');
  const suitable = lang === 'ar' ? 'فلل، شقق، مشاريع تجارية' : 'Villas, apartments, commercial projects';
  const maint = cat.tier === 'high' ? (lang === 'ar' ? 'متوسطة' : 'Medium') : cat.tier === 'low' ? (lang === 'ar' ? 'عالية' : 'High') : (lang === 'ar' ? 'منخفضة' : 'Low');
  return { supplier, code, priceLabel, colorsList, sustain, suitable, maint };
}
type MaterialTierKey = 'high' | 'mid' | 'low';
