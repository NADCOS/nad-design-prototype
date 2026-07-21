// NAD Design — builds the structured Nano Banana (Gemini) prompt from the
// client's full selection state. Pure/deterministic: no I/O, easy to test.
import { LIGHT_MOODS } from '../data/aiOptions.js';

const CATEGORY_LABELS = {
  flooring: { en: 'Flooring', ar: 'الأرضيات' },
  walls: { en: 'Wall finish', ar: 'تشطيب الجدران' },
  ceilings: { en: 'Ceiling design', ar: 'تصميم السقف' },
  woodFinishes: { en: 'Wood finish', ar: 'تشطيب الخشب' },
  fabrics: { en: 'Fabric', ar: 'القماش' },
  metals: { en: 'Metal', ar: 'المعدن' },
  stoneMarble: { en: 'Stone', ar: 'الحجر' },
};

const PRESERVATION_LINES = {
  en: [
    'Camera position', 'Camera angle', 'Framing', 'Perspective', 'Image orientation',
    'Room proportions', 'Floor level', 'Ceiling height', 'Wall positions',
    'Doors', 'Windows', 'Columns', 'Beams', 'Staircases', 'Openings', 'Fixed architectural elements',
  ],
  ar: [
    'موضع الكاميرا', 'زاوية الكاميرا', 'التأطير', 'المنظور', 'اتجاه الصورة',
    'نسب الغرفة', 'مستوى الأرضية', 'ارتفاع السقف', 'مواضع الجدران',
    'الأبواب', 'النوافذ', 'الأعمدة', 'العوارض', 'السلالم', 'الفتحات', 'العناصر المعمارية الثابتة',
  ],
};

const NEGATIVE_LINES = {
  en: [
    'No changes to the camera', 'No changes to the architecture', 'No distorted walls',
    'No curved straight lines', 'No missing doors or windows', 'No additional openings',
    'No incorrect furniture', 'No unselected materials', 'No people', 'No text', 'No logos',
    'No watermark', 'No interface elements', 'No unrealistic reflections', 'No overexposure',
    'No excessive depth of field', 'No distorted furniture', 'No duplicated objects', 'No floating objects',
  ],
  ar: [
    'لا تغييرات في الكاميرا', 'لا تغييرات في التصميم المعماري', 'لا جدران مشوّهة',
    'لا خطوط مستقيمة منحنية', 'لا أبواب أو نوافذ مفقودة', 'لا فتحات إضافية',
    'لا أثاث غير صحيح', 'لا خامات لم يتم اختيارها', 'لا أشخاص', 'لا نصوص', 'لا شعارات',
    'لا علامات مائية', 'لا عناصر واجهة برمجية', 'لا انعكاسات غير واقعية', 'لا إفراط في الإضاءة',
    'لا عمق ميدان مبالغ فيه', 'لا أثاث مشوّه', 'لا عناصر مكررة', 'لا عناصر عائمة',
  ],
};

/**
 * @param {Object} args
 * @param {import('../data.js').Selections} args.selections
 * @param {'en'|'ar'} args.lang
 * @param {string} args.customTypeText - free-text description for a "Custom Project" type
 * @param {string} args.mood - selected LIGHT_MOODS key
 * @param {boolean} args.hasUploadedImage - whether an existing room image is being edited
 * @param {boolean} [args.allowFullRedesign] - if true, architecture-preservation rules are relaxed
 * @returns {string} the full structured prompt, ready to send to Nano Banana
 */
export function buildStructuredPrompt({ selections, lang, customTypeText, mood, hasUploadedImage, allowFullRedesign, referenceItems }) {
  const ar = lang === 'ar';
  const L = (en, arText) => (ar ? arText : en);
  const lines = [];

  // ---- 1. Project context ----
  const projectTypeLabel = selections.projectType
    ? (selections.projectType.key === 'custom' ? (customTypeText || selections.projectType[lang]) : selections.projectType[lang])
    : null;
  lines.push(L('NAD Design — AI architectural visualization request', 'ناد ديزاين — طلب تصور معماري بالذكاء الاصطناعي'));
  lines.push('');
  if (projectTypeLabel) lines.push(L('Project type', 'نوع المشروع') + ': ' + projectTypeLabel);
  if (selections.projectType) lines.push(L('Space / room type', 'نوع المساحة') + ': ' + selections.projectType[lang]);
  if (selections.designLevel) lines.push(L('Design level', 'مستوى التصميم') + ': ' + selections.designLevel[lang]);
  if (selections.stylePrimary) lines.push(L('Main design style', 'النمط الرئيسي') + ': ' + selections.stylePrimary[lang]);
  if (selections.styleSecondary) lines.push(L('Secondary design style', 'النمط الثانوي') + ': ' + selections.styleSecondary[lang]);

  const pi = selections.projectInfo || {};
  if (pi.location) lines.push(L('Location', 'الموقع') + ': ' + pi.location);
  if (pi.area) lines.push(L('Room area', 'مساحة الغرفة') + ': ' + pi.area + ' m\u00b2');
  if (pi.roomSize) lines.push(L('Room dimensions (L \u00d7 W)', 'أبعاد الغرفة (طول \u00d7 عرض)') + ': ' + pi.roomSize + ' m');
  if (pi.ceiling) lines.push(L('Ceiling height', 'ارتفاع السقف') + ': ' + pi.ceiling + ' m');
  if (pi.colors) lines.push(L('Preferred colours', 'الألوان المفضلة') + ': ' + pi.colors);
  if (pi.budget) lines.push(L('Budget', 'الميزانية') + ': ' + pi.budget);
  if (pi.special) lines.push(L('Client notes', 'ملاحظات العميل') + ': ' + pi.special);
  lines.push(L('Uploaded reference image', 'الصورة المرجعية المرفوعة') + ': ' + (hasUploadedImage ? L('yes — existing room photo, used as the exact architectural and camera reference', 'نعم — صورة غرفة حالية، تُستخدم كمرجع دقيق للتصميم المعماري والكاميرا') : L('none — generate from the description only', 'لا يوجد — يتم التوليد من الوصف فقط')));

  // ---- 2. Items to introduce: materials & finishes ----
  const materialKeys = Object.keys(selections.materials || {});
  if (materialKeys.length) {
    lines.push('');
    lines.push(L('MATERIALS & FINISHES TO APPLY', 'الخامات والتشطيبات المطلوب تطبيقها') + ':');
    materialKeys.forEach((catKey) => {
      const label = (CATEGORY_LABELS[catKey] && CATEGORY_LABELS[catKey][lang]) || catKey;
      lines.push('- ' + label + ': ' + selections.materials[catKey][lang]);
    });
  }

  // ---- 3. Items to introduce: furniture (with full accuracy details) ----
  if (selections.furniture && selections.furniture.length) {
    lines.push('');
    lines.push(L('FURNITURE TO PLACE (preserve exact geometry — do not redesign)', 'الأثاث المطلوب وضعه (حافظ على الشكل الهندسي الدقيق — لا تعيد تصميمه)') + ':');
    selections.furniture.forEach((f) => {
      lines.push('- ' + L('Product', 'المنتج') + ': ' + f.name);
      lines.push('  ' + L('Code', 'الرمز') + ': ' + f.code + (f.supplier ? ' | ' + L('Supplier', 'المورّد') + ': ' + f.supplier : ''));
      if (f.dims) lines.push('  ' + L('Dimensions', 'الأبعاد') + ': ' + f.dims);
      const finishParts = [];
      if (f.fabric) finishParts.push(L('Fabric', 'القماش') + ' ' + f.fabric[lang]);
      if (f.woodFinish) finishParts.push(L('Wood', 'الخشب') + ' ' + f.woodFinish[lang]);
      if (f.metal) finishParts.push(L('Metal', 'المعدن') + ' ' + f.metal[lang]);
      if (finishParts.length) lines.push('  ' + L('Finish', 'التشطيب') + ': ' + finishParts.join(', '));
    });
    lines.push('- ' + L('Preserve the selected furniture geometry, proportions, and distinctive design.', 'حافظ على الشكل الهندسي وتناسب وتصميم الأثاث المختار المميز.'));
    lines.push('- ' + L('Do not replace it with an unrelated furniture model.', 'لا تستبدله بموديل أثاث غير مرتبط.'));
    lines.push('- ' + L('Changing colour or material must not change its design.', 'تغيير اللون أو الخامة يجب ألا يغيّر تصميمه.'));
    lines.push('- ' + L('Place the selected furniture at a realistic scale.', 'ضع الأثاث المختار بمقياس واقعي.'));
  }

  // ---- 4. Lighting & atmosphere ----
  const moodObj = LIGHT_MOODS.find((m) => m.key === mood);
  lines.push('');
  lines.push(L('LIGHTING & ATMOSPHERE', 'الإضاءة والأجواء') + ':');
  lines.push('- ' + (moodObj ? moodObj[lang] : L('Soft, natural lighting', 'إضاءة طبيعية ناعمة')));

  // ---- 4b. Attached product photos of the selected furniture & lighting ----
  if (referenceItems && referenceItems.length) {
    lines.push('');
    lines.push(L('PRODUCT REFERENCE IMAGES (exact pieces \u2014 reproduce faithfully)', '\u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0631\u062c\u0639\u064a\u0629 (\u0642\u0637\u0639 \u0645\u062d\u062f\u062f\u0629 \u2014 \u0627\u0646\u0633\u062e\u0647\u0627 \u0628\u062f\u0642\u0629)') + ':');
    if (hasUploadedImage) {
      lines.push(L('The first attached image is the existing room photo (architecture reference). The following images are product photos of the selected furniture & lighting, in this order:', '\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0647\u064a \u0635\u0648\u0631\u0629 \u0627\u0644\u063a\u0631\u0641\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629 (\u0645\u0631\u062c\u0639 \u0645\u0639\u0645\u0627\u0631\u064a). \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u062a\u0627\u0644\u064a\u0629 \u0647\u064a \u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0644\u0644\u0623\u062b\u0627\u062b \u0648\u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629\u060c \u0628\u0647\u0630\u0627 \u0627\u0644\u062a\u0631\u062a\u064a\u0628:'));
    } else {
      lines.push(L('The attached images are product photos of the selected furniture & lighting, in this order:', '\u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u0647\u064a \u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0644\u0644\u0623\u062b\u0627\u062b \u0648\u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629\u060c \u0628\u0647\u0630\u0627 \u0627\u0644\u062a\u0631\u062a\u064a\u0628:'));
    }
    referenceItems.forEach((name, i) => lines.push('- ' + L('Product image', '\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062a\u062c') + ' ' + (i + 1) + ': ' + name));
    lines.push(L('Place these exact products in the design. Match each product photo precisely \u2014 shape, proportions, materials, upholstery, colors and details. Do not substitute similar-looking alternatives.', '\u0636\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0646\u0641\u0633\u0647\u0627 \u0641\u064a \u0627\u0644\u062a\u0635\u0645\u064a\u0645. \u0637\u0627\u0628\u0642 \u0643\u0644 \u0635\u0648\u0631\u0629 \u0645\u0646\u062a\u062c \u0628\u062f\u0642\u0629 \u2014 \u0627\u0644\u0634\u0643\u0644 \u0648\u0627\u0644\u0646\u0633\u0628 \u0648\u0627\u0644\u062e\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u062a\u0646\u062c\u064a\u062f \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0648\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644. \u0644\u0627 \u062a\u0633\u062a\u0628\u062f\u0644\u0647\u0627 \u0628\u0628\u062f\u0627\u0626\u0644 \u0645\u0634\u0627\u0628\u0647\u0629.'));
  }

  // ---- 5. Final image quality ----
  lines.push('');
  lines.push(L('FINAL IMAGE QUALITY', 'جودة الصورة النهائية') + ':');
  lines.push('- ' + L('Photorealistic, presentation-quality architectural visualization, high resolution.', 'تصور معماري واقعي بجودة عرض تقديمي وبدقة عالية.'));

  // ---- 6. Existing architecture that must remain unchanged ----
  if (hasUploadedImage && !allowFullRedesign) {
    lines.push('');
    lines.push(L('ARCHITECTURE PRESERVATION (existing structure — do not change)', 'الحفاظ على التصميم المعماري (البنية الحالية — لا تتغير)') + ':');
    lines.push(L('Use the uploaded image as the exact architectural and camera reference.', 'استخدم الصورة المرفوعة كمرجع دقيق للتصميم المعماري والكاميرا.'));
    lines.push(L('Preserve exactly:', 'حافظ تماماً على:'));
    PRESERVATION_LINES[ar ? 'ar' : 'en'].forEach((l) => lines.push('- ' + l));
    lines.push(L('Do not zoom, crop, rotate, shift or distort the image.', 'لا تقم بتكبير أو اقتصاص أو تدوير أو إزاحة أو تشويه الصورة.'));
    lines.push(L('Do not redesign the architecture unless \u201cAllow Full Redesign\u201d is enabled.', 'لا تعيد تصميم البنية المعمارية إلا إذا تم تفعيل \u201cالسماح بإعادة التصميم الكامل\u201d.'));
    lines.push(L('Modify only: materials, finishes, furniture, decorative elements, lighting, styling, and landscaping when applicable.', 'عدّل فقط: الخامات والتشطيبات والأثاث والعناصر الديكورية والإضاءة والتنسيق، وتنسيق الحدائق عند الحاجة.'));
  } else if (allowFullRedesign) {
    lines.push('');
    lines.push(L('Full redesign is allowed for this request — the architecture may be reimagined.', 'يُسمح بإعادة التصميم الكامل لهذا الطلب — يمكن إعادة تصور التصميم المعماري.'));
  }

  // ---- 7. Negative instructions ----
  lines.push('');
  lines.push(L('DO NOT', 'تجنّب') + ':');
  NEGATIVE_LINES[ar ? 'ar' : 'en'].forEach((l) => lines.push('- ' + l));

  return lines.join('\n');
}
