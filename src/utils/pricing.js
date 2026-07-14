// Pure cost-estimation logic — no React, no I/O. Depends only on data/*.js.
import { DESIGN_LEVELS } from '../data/designLevels.js';
import { MATERIAL_CATEGORIES } from '../data/materials.js';

export function getLevelRange(key, priceOverrides) {
  const base = DESIGN_LEVELS.find((l) => l.key === key);
  const ov = (priceOverrides && priceOverrides[key]) || {};
  return {
    priceMin: Number.isFinite(ov.priceMin) ? ov.priceMin : base.priceMin,
    priceMax: Number.isFinite(ov.priceMax) ? ov.priceMax : base.priceMax,
  };
}

export function computeCost(selections, priceOverrides) {
  const level = selections.designLevel ? DESIGN_LEVELS.find((l) => l.key === selections.designLevel.key) : DESIGN_LEVELS[2];
  const range = getLevelRange(level.key, priceOverrides);
  const area = parseFloat(selections.projectInfo.area) || 0;
  const baseRate = (range.priceMin + range.priceMax) / 2;
  const baseCost = baseRate * area;
  const tierAddon = { high: 180, mid: 90, low: 40 };
  const materialsAddon = Object.keys(selections.materials).reduce((sum, catKey) => {
    const cat = MATERIAL_CATEGORIES.find((c) => c.key === catKey);
    return sum + (cat ? tierAddon[cat.tier] : 60);
  }, 0) * area;
  const lightingItems = selections.furniture.filter((f) => f.category === 'decoLighting' || f.category === 'archLighting');
  const lightingCost = lightingItems.reduce((sum, f) => sum + f.price, 0);
  const furnitureCost = selections.furniture.reduce((sum, f) => sum + f.price, 0) - lightingCost;
  const installation = (baseCost + materialsAddon + furnitureCost + lightingCost) * 0.12;
  const designFee = (baseCost + materialsAddon + furnitureCost + lightingCost + installation) * 0.10;
  const total = baseCost + materialsAddon + furnitureCost + lightingCost + installation + designFee;
  const perSqm = area > 0 ? total / area : baseRate;
  return { level, area, baseCost, materialsAddon, furnitureCost, lightingCost, installation, designFee, total, perSqm };
}

export function computeWarnings(selections, lang) {
  const warnings = [];
  const flooring = selections.materials.flooring;
  const woodFinish = selections.materials.woodFinishes;
  const lightFloors = ['Wood Flooring', 'Porcelain', 'Microcement'];
  if (flooring && woodFinish && woodFinish.en === 'Black Stained Wood' && lightFloors.includes(flooring.en)) {
    warnings.push(lang === 'ar'
      ? 'قد تتعارض أرضية ' + flooring.ar + ' مع تشطيبات الخشب الأسود — يفضل استخدام درجة خشب متوسطة للربط بينهما.'
      : 'Your ' + flooring.en + ' flooring may visually conflict with Black Stained Wood finishes — consider a mid-tone wood to bridge them.');
  }
  const metalsUsed = new Set(selections.furniture.map((f) => f.metal && f.metal[0]).filter(Boolean));
  if (metalsUsed.has('Gold Metal') && metalsUsed.has('Silver Metal')) {
    warnings.push(lang === 'ar'
      ? 'مزج تشطيبات المعدن الذهبي والفضي في الأثاث قد يسبب تعارضاً بصرياً — يفضل توحيد درجات المعدن.'
      : 'Mixing gold and silver metal finishes across furniture can visually conflict — consider unifying your metal tones.');
  }
  return warnings;
}
