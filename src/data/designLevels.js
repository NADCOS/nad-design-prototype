// Step 2: Design levels (Luxury / High-End / Mid-Range / Budget-Friendly) with
// their default SAR/m² price ranges. Admins can override priceMin/priceMax at
// runtime (see hooks/useAppState.js) without touching this file.
export const DESIGN_LEVELS = [
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

export const PREFILL_LEVEL_IMAGES = {
  luxury: '/assets/level-luxury.jpeg',
  highend: '/assets/level-highend.jpeg',
  midrange: '/assets/level-midrange.jpeg',
  budget: '/assets/level-budget.jpeg',
};
