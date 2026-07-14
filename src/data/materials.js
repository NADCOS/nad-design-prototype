// Step 4: Material categories + swatch items, plus the helper functions used to
// derive a stable image-slot id and mocked supplier metadata for each swatch.
import { SUPPLIERS } from './suppliers.js';
import { fmtSar } from './translations.js';

export const MATERIAL_CATEGORIES = [
  { key: 'flooring', en: 'Flooring', ar: 'الأرضيات', tier: 'high', items: [['Marble', 'رخام'], ['Porcelain', 'بورسلان'], ['Ceramic', 'سيراميك'], ['Terrazzo', 'تيرازو'], ['Natural Stone', 'حجر طبيعي'], ['Wood Flooring', 'أرضية خشبية'], ['Vinyl', 'فينيل'], ['Carpet', 'سجاد'], ['Microcement', 'ميكروسمنت']] },
  { key: 'walls', en: 'Walls', ar: 'الجدران', tier: 'mid', items: [['Paint', 'دهان'], ['Wallpaper', 'ورق جدران'], ['Wood Panels', 'ألواح خشبية'], ['Marble', 'رخام'], ['Natural Stone', 'حجر طبيعي'], ['Decorative Plaster', 'جص ديكوري'], ['Microcement', 'ميكروسمنت'], ['Fabric Panels', 'ألواح قماشية'], ['Acoustic Panels', 'ألواح عازلة للصوت']] },
  { key: 'ceilings', en: 'Ceilings', ar: 'الأسقف', tier: 'mid', items: [['Simple Gypsum Ceiling', 'سقف جبسي بسيط'], ['Decorative Gypsum', 'جبس ديكوري'], ['Wooden Ceiling', 'سقف خشبي'], ['Metal Ceiling', 'سقف معدني'], ['Acoustic Ceiling', 'سقف عازل للصوت'], ['Exposed Ceiling', 'سقف مكشوف'], ['Hidden Lighting Ceiling', 'سقف إضاءة مخفية']] },
  { key: 'woodFinishes', en: 'Wood Finishes', ar: 'تشطيبات الخشب', tier: 'mid', items: [['Light Wood', 'خشب فاتح'], ['Warm Wood', 'خشب دافئ'], ['Dark Walnut', 'جوز غامق'], ['Oak', 'بلوط'], ['Reddish Wood', 'خشب محمر'], ['Black Stained Wood', 'خشب أسود']] },
  { key: 'fabrics', en: 'Fabrics', ar: 'الأقمشة', tier: 'low', items: [['Brown Linen', 'كتان بني'], ['Gray Linen', 'كتان رمادي'], ['Off-white Linen', 'كتان أبيض مائل للبيج'], ['Green Linen', 'كتان أخضر'], ['Velvet', 'مخمل'], ['Bouclé', 'بوكليه'], ['Leather', 'جلد'], ['Suede', 'سويدي']] },
  { key: 'metals', en: 'Metals', ar: 'المعادن', tier: 'mid', items: [['Black Metal', 'معدن أسود'], ['Bronze Metal', 'برونز'], ['Gold Metal', 'ذهبي'], ['Silver Metal', 'فضي'], ['Brushed Stainless Steel', 'ستانلس ستيل مصقول']] },
  { key: 'stoneMarble', en: 'Stone & Marble', ar: 'الحجر والرخام', tier: 'high', items: [['Riyadh Stone', 'حجر رياضي'], ['Travertine', 'ترافرتين'], ['Limestone', 'حجر جيري'], ['White Marble', 'رخام أبيض'], ['Beige Marble', 'رخام بيج'], ['Gray Marble', 'رخام رمادي'], ['Black Marble', 'رخام أسود']] },
];

export const WOOD_FINISH_OPTS = [['Light Wood', 'خشب فاتح'], ['Warm Wood', 'خشب دافئ'], ['Dark Walnut', 'جوز غامق'], ['Oak', 'بلوط'], ['Reddish Wood', 'خشب محمر'], ['Black Stained Wood', 'خشب أسود']];
export const FABRIC_OPTS = [['Brown Linen', 'كتان بني'], ['Gray Linen', 'كتان رمادي'], ['Off-white Linen', 'كتان أبيض مائل للبيج'], ['Velvet', 'مخمل'], ['Bouclé', 'بوكليه'], ['Leather', 'جلد']];
export const METAL_OPTS = [['Black Metal', 'معدن أسود'], ['Bronze Metal', 'برونز'], ['Gold Metal', 'ذهبي'], ['Brushed Stainless Steel', 'ستانلس ستيل مصقول']];

export const PREFILL_MATERIAL_IMAGES = {
  flooringMarbleImage: '/assets/marble.jpeg',
  flooringPorcelainImage: '/assets/porcelain.jpeg',
  flooringCeramicImage: '/assets/ceramic.jpeg',
  flooringTerrazzoImage: '/assets/mat-terrazzo.jpg',
  flooringNaturalStoneImage: '/assets/mat-natural-stone.jpg',
  flooringWoodFlooringImage: '/assets/mat-wood-flooring.jpg',
  flooringVinylImage: '/assets/mat-vinyl.jpg',
  flooringCarpetImage: '/assets/mat-carpet.jpg',
  flooringMicrocementImage: '/assets/mat-microcement.jpg',
  wallsPaintImage: '/assets/mat-paint.jpg',
  wallsWallpaperImage: '/assets/mat-wallpaper.jpg',
  wallsWoodPanelsImage: '/assets/mat-wood-panels.jpg',
  wallsMarbleImage: '/assets/mat-marble-gray.jpg',
  wallsNaturalStoneImage: '/assets/mat-natural-stone.jpg',
  wallsDecorativePlasterImage: '/assets/mat-decorative-plaster.jpg',
  wallsMicrocementImage: '/assets/mat-microcement.jpg',
  wallsFabricPanelsImage: '/assets/mat-fabric-panels.jpg',
  wallsAcousticPanelsImage: '/assets/mat-acoustic-panels.jpg',
  ceilingsSimpleGypsumCeilingImage: '/assets/mat-simple-gypsum-ceiling.jpg',
  ceilingsDecorativeGypsumImage: '/assets/mat-decorative-gypsum.jpg',
  ceilingsWoodenCeilingImage: '/assets/mat-wooden-ceiling.jpg',
  ceilingsMetalCeilingImage: '/assets/mat-metal-ceiling.jpg',
  ceilingsAcousticCeilingImage: '/assets/mat-acoustic-ceiling.jpg',
  ceilingsExposedCeilingImage: '/assets/mat-exposed-ceiling.jpg',
  ceilingsHiddenLightingCeilingImage: '/assets/mat-hidden-lighting-ceiling.jpg',
  woodFinishesLightWoodImage: '/assets/mat-light-wood.jpg',
  woodFinishesWarmWoodImage: '/assets/mat-warm-wood.jpg',
  woodFinishesDarkWalnutImage: '/assets/mat-dark-walnut.jpg',
  woodFinishesOakImage: '/assets/mat-oak.jpg',
  woodFinishesReddishWoodImage: '/assets/mat-reddish-wood.jpg',
  woodFinishesBlackStainedWoodImage: '/assets/mat-black-stained-wood.jpg',
  fabricsBrownLinenImage: '/assets/mat-brown-linen.jpg',
  fabricsGrayLinenImage: '/assets/mat-gray-linen.jpg',
  fabricsOffWhiteLinenImage: '/assets/mat-offwhite-linen.jpg',
  fabricsGreenLinenImage: '/assets/mat-green-linen.jpg',
  fabricsVelvetImage: '/assets/mat-velvet.jpg',
  fabricsBoucleImage: '/assets/mat-boucle.jpg',
  fabricsLeatherImage: '/assets/mat-leather.jpg',
  fabricsSuedeImage: '/assets/mat-suede.jpg',
  metalsBlackMetalImage: '/assets/mat-black-metal.jpg',
  metalsBronzeMetalImage: '/assets/mat-bronze-metal.jpg',
  metalsGoldMetalImage: '/assets/mat-bronze-metal.jpg',
  metalsSilverMetalImage: '/assets/mat-silver-metal.jpg',
  metalsBrushedStainlessSteelImage: '/assets/mat-brushed-stainless-steel.jpg',
  stoneMarbleRiyadhStoneImage: '/assets/mat-natural-stone.jpg',
  stoneMarbleTravertineImage: '/assets/mat-travertine.jpg',
  stoneMarbleLimestoneImage: '/assets/mat-limestone.jpg',
  stoneMarbleWhiteMarbleImage: '/assets/marble.jpeg',
  stoneMarbleBeigeMarbleImage: '/assets/mat-marble-beige.jpg',
  stoneMarbleGrayMarbleImage: '/assets/mat-marble-gray.jpg',
  stoneMarbleBlackMarbleImage: '/assets/mat-marble-black.jpg',
};

function toCamelWords(s) {
  return s.replace(/[éÉ]/g, 'e').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
function materialImageKey(catKey, en) {
  return catKey + toCamelWords(en) + 'Image';
}
export function materialSlotId(catKey, en) {
  return 'mat-' + materialImageKey(catKey, en);
}

export function materialMeta(catKey, item, lang) {
  const cat = MATERIAL_CATEGORIES.find((c) => c.key === catKey);
  const idx = cat.items.findIndex((it) => it[0] === item.en);
  const supplier = SUPPLIERS[(catKey.length + idx) % SUPPLIERS.length];
  const code = 'NAD-' + catKey.slice(0, 3).toUpperCase() + '-' + (100 + idx);
  const tierPrice = { high: [220, 480], mid: [90, 220], low: [45, 120] };
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
