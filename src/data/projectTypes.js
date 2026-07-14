// Step 1: Project types the client can choose from.
export const PROJECT_TYPES = [
  { key: 'villa', en: 'Villa', ar: 'فيلا', enDesc: 'Full villa interiors, from majlis to private wings.', arDesc: 'تصميم داخلي كامل للفلل من المجلس إلى الأجنحة الخاصة.' },
  { key: 'apartment', en: 'Apartment', ar: 'شقة', enDesc: 'Compact, efficient layouts for modern city living.', arDesc: 'تصاميم عملية ومدمجة لأسلوب الحياة الحضري العصري.' },
  { key: 'office', en: 'Office', ar: 'مكتب', enDesc: 'Workspaces that balance focus, brand and comfort.', arDesc: 'مساحات عمل توازن بين التركيز والهوية والراحة.' },
  { key: 'retail', en: 'Retail Shop', ar: 'محل تجاري', enDesc: 'Retail environments built to showcase and sell.', arDesc: 'بيئات بيع مصممة لعرض المنتجات وجذب العملاء.' },
  { key: 'restaurant', en: 'Restaurant / Café', ar: 'مطعم أو مقهى', enDesc: 'Dining atmospheres that keep guests coming back.', arDesc: 'أجواء تناول طعام تجعل الضيوف يعودون دائماً.' },
  { key: 'hotel', en: 'Hotel', ar: 'فندق', enDesc: 'Guest-facing hospitality spaces with lasting impact.', arDesc: 'مساحات ضيافة تترك انطباعاً دائماً لدى الضيوف.' },
  { key: 'majlis', en: 'Majlis', ar: 'مجلس', enDesc: 'Traditional gathering spaces, reimagined.', arDesc: 'مجالس تقليدية بلمسة عصرية معاد تصورها.' },
  { key: 'bedroom', en: 'Bedroom', ar: 'غرفة نوم', enDesc: 'Private, restful rooms designed around comfort.', arDesc: 'غرف خاصة وهادئة مصممة حول الراحة.' },
  { key: 'living', en: 'Living Room', ar: 'غرفة معيشة', enDesc: 'The heart of the home, styled for gathering.', arDesc: 'قلب المنزل، مصمم للتجمع العائلي.' },
  { key: 'kitchen', en: 'Kitchen', ar: 'مطبخ', enDesc: 'Functional kitchens with a refined finish.', arDesc: 'مطابخ عملية بلمسة نهائية راقية.' },
  { key: 'bathroom', en: 'Bathroom', ar: 'حمام', enDesc: 'Spa-like bathrooms in durable materials.', arDesc: 'حمامات بأجواء منتجع صحي وخامات متينة.' },
  { key: 'outdoor', en: 'Outdoor Space', ar: 'مساحة خارجية', enDesc: 'Courtyards, terraces and gardens, designed to live in.', arDesc: 'ساحات وتراسات وحدائق مصممة للعيش فيها.' },
  { key: 'custom', en: 'Custom Project', ar: 'مشروع مخصص', enDesc: 'Something else entirely — tell us about it.', arDesc: 'مشروع مختلف تماماً — أخبرنا عنه.' },
];

export const PREFILL_PROJECT_IMAGES = {
  villa: '/assets/type-villa.jpeg',
  apartment: '/assets/type-apartment.jpeg',
  office: '/assets/type-office.jpeg',
  retail: '/assets/type-retail.jpeg',
  restaurant: '/assets/type-restaurant.jpeg',
  hotel: '/assets/type-hotel.jpeg',
  majlis: '/assets/type-majlis.jpeg',
  bedroom: '/assets/type-bedroom.jpeg',
  living: '/assets/type-living.jpeg',
  bathroom: '/assets/type-bathroom.jpeg',
  outdoor: '/assets/type-outdoor.jpeg',
};
