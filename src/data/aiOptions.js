// Step 8: AI generation options — lighting mood and render-quality descriptors
// (feed into the Nano Banana prompt; separate from image size/aspect ratio,
// which live in src/config/aiGeneration.js).
export const LIGHT_MOODS = [
  { key: 'daylight', en: 'Daylight', ar: 'ضوء النهار' }, { key: 'sunset', en: 'Sunset', ar: 'غروب الشمس' },
  { key: 'night', en: 'Night', ar: 'ليلي' }, { key: 'warm', en: 'Warm Interior', ar: 'إضاءة دافئة' },
  { key: 'soft', en: 'Soft Neutral', ar: 'إضاءة محايدة ناعمة' },
];
export const QUALITY_OPTS = [
  { key: 'photorealistic', en: 'Photorealistic', ar: 'واقعي' }, { key: 'conceptual', en: 'Conceptual', ar: 'مفاهيمي' },
  { key: 'presentation', en: 'Presentation Quality', ar: 'جودة عرض تقديمي' }, { key: 'highres', en: 'High-Resolution', ar: 'دقة عالية' },
];
