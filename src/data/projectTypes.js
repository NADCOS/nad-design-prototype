// Step 1: Project types the client can choose from.
export const PROJECT_TYPES = [
  { key: 'apartment', en: 'Apartment', ar: 'شقة', enDesc: 'Compact, efficient layouts for modern city living.', arDesc: 'تصاميم عملية ومدمجة لأسلوب الحياة الحضري العصري.' },
  { key: 'majlis', en: 'Majlis', ar: 'مجلس', enDesc: 'Traditional gathering spaces, reimagined.', arDesc: 'مجالس تقليدية بلمسة عصرية معاد تصورها.' },
  { key: 'bedroom', en: 'Bedroom', ar: 'غرفة نوم', enDesc: 'Private, restful rooms designed around comfort.', arDesc: 'غرف خاصة وهادئة مصممة حول الراحة.' },
  { key: 'living', en: 'Living Room', ar: 'غرفة معيشة', enDesc: 'The heart of the home, styled for gathering.', arDesc: 'قلب المنزل، مصمم للتجمع العائلي.' },
  { key: 'kitchen', en: 'Kitchen', ar: 'مطبخ', enDesc: 'Functional kitchens with a refined finish.', arDesc: 'مطابخ عملية بلمسة نهائية راقية.' },
  { key: 'bathroom', en: 'Bathroom', ar: 'حمام', enDesc: 'Spa-like bathrooms in durable materials.', arDesc: 'حمامات بأجواء منتجع صحي وخامات متينة.' },
  { key: 'outdoor', en: 'Outdoor Space', ar: 'مساحة خارجية', enDesc: 'Courtyards, terraces and gardens, designed to live in.', arDesc: 'ساحات وتراسات وحدائق مصممة للعيش فيها.' },
  { key: 'custom', en: 'Custom Project', ar: 'مشروع مخصص', enDesc: 'Something else entirely — tell us about it.', arDesc: 'مشروع مختلف تماماً — أخبرنا عنه.' },
];

export const PREFILL_PROJECT_IMAGES = {
  apartment: '/assets/type-apartment.jpeg',
  bedroom: '/assets/type-bedroom.jpeg',
  living: '/assets/type-living.jpeg',
  bathroom: '/assets/type-bathroom.jpeg',
  outdoor: '/assets/type-outdoor.jpeg',
};
