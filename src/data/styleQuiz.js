// Style quiz — 5 quick "this or that" rounds for users who don't know their
// style yet. Each option shows real material swatches / room imagery from the
// existing asset library and adds weighted points to style keys; the top two
// scores become the suggested primary + secondary style.
export const QUIZ_ROUNDS = [
  {
    q: { en: 'Which materials speak to you?', ar: 'أي الخامات تلامسك أكثر؟' },
    a: {
      imgs: ['/assets/mat-light-wood.jpg', '/assets/mat-offwhite-linen.jpg', '/assets/mat-microcement.jpg'],
      label: { en: 'Light wood, linen & soft plaster', ar: 'خشب فاتح، كتان وجبس ناعم' },
      weights: { japandi: 2, scandinavian: 1, minimalist: 1 },
    },
    b: {
      imgs: ['/assets/mat-marble-beige.jpg', '/assets/mat-bronze-metal.jpg', '/assets/mat-velvet.jpg'],
      label: { en: 'Marble, bronze & velvet', ar: 'رخام، برونز ومخمل' },
      weights: { modernluxury: 2, classic: 1, neoclassical: 1 },
    },
  },
  {
    q: { en: 'Your ideal walls & ceiling?', ar: 'الجدران والسقف المثاليان لك؟' },
    a: {
      imgs: ['/assets/mat-decorative-gypsum.jpg', '/assets/mat-natural-stone.jpg', '/assets/mat-warm-wood.jpg'],
      label: { en: 'Carved gypsum, stone & warm wood', ar: 'جبس منقوش، حجر وخشب دافئ' },
      weights: { najdi: 2, islamic: 2 },
    },
    b: {
      imgs: ['/assets/mat-paint.jpg', '/assets/mat-simple-gypsum-ceiling.jpg', '/assets/mat-hidden-lighting-ceiling.jpg'],
      label: { en: 'Clean paint & hidden lighting', ar: 'دهان نظيف وإضاءة مخفية' },
      weights: { modern: 2, contemporary: 1, minimalist: 1 },
    },
  },
  {
    q: { en: 'Pick a texture story', ar: 'اختر قصة الملمس' },
    a: {
      imgs: ['/assets/mat-black-metal.jpg', '/assets/mat-exposed-ceiling.jpg', '/assets/mat-microcement.jpg'],
      label: { en: 'Raw metal & exposed concrete', ar: 'معدن خام وخرسانة مكشوفة' },
      weights: { industrial: 2, modern: 1 },
    },
    b: {
      imgs: ['/assets/mat-boucle.jpg', '/assets/mat-oak.jpg', '/assets/mat-gray-linen.jpg'],
      label: { en: 'Bouclé, oak & soft fabric', ar: 'بوكليه، بلوط وأقمشة ناعمة' },
      weights: { scandinavian: 2, japandi: 1, contemporary: 1 },
    },
  },
  {
    q: { en: 'The floor underfoot?', ar: 'الأرضية تحت قدميك؟' },
    a: {
      imgs: ['/assets/mat-travertine.jpg', '/assets/mat-limestone.jpg', '/assets/mat-terrazzo.jpg'],
      label: { en: 'Travertine, limestone & terrazzo', ar: 'ترافرتين، حجر جيري وتيرازو' },
      weights: { mediterranean: 2, classic: 1, najdi: 1 },
    },
    b: {
      imgs: ['/assets/mat-marble-gray.jpg', '/assets/mat-marble-black.jpg', '/assets/mat-silver-metal.jpg'],
      label: { en: 'Polished marble & steel', ar: 'رخام مصقول وفولاذ' },
      weights: { modern: 2, modernluxury: 1, contemporary: 1 },
    },
  },
  {
    q: { en: 'And the overall spirit?', ar: 'والروح العامة للمكان؟' },
    a: {
      imgs: ['/assets/type-majlis.jpeg'],
      label: { en: 'Rooted in heritage, made modern', ar: 'متجذر في التراث بروح عصرية' },
      weights: { najdi: 2, islamic: 1, classic: 1 },
    },
    b: {
      imgs: ['/assets/type-apartment.jpeg'],
      label: { en: 'Light, open and of-the-moment', ar: 'مضيء، مفتوح وابن اللحظة' },
      weights: { contemporary: 2, modern: 1, minimalist: 1 },
    },
  },
];

export function scoreQuiz(picks) {
  // picks: array of weight objects chosen per round
  const totals = {};
  picks.forEach((w) => Object.entries(w).forEach(([k, v]) => { totals[k] = (totals[k] || 0) + v; }));
  const sorted = Object.entries(totals).sort((x, y) => y[1] - x[1]);
  return { primary: sorted[0] ? sorted[0][0] : 'modern', secondary: sorted[1] && sorted[1][1] > 0 ? sorted[1][0] : null };
}
