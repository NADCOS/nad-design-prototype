// Step 5: Furniture categories + a deterministic mock catalogue (2 SKUs per
// category) with codes, suppliers, dimensions and default finishes.
import { SUPPLIERS } from './suppliers.js';
import { WOOD_FINISH_OPTS, FABRIC_OPTS, METAL_OPTS } from './materials.js';

export { WOOD_FINISH_OPTS, FABRIC_OPTS, METAL_OPTS };

export const FURNITURE_CATEGORIES = [
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

const DESCRIPTORS = ['Dara', 'Souk', 'Nomad', 'Dune', 'Rimal', 'Wadi', 'Zahra', 'Amal', 'Noor', 'Reem', 'Layan', 'Sadu', 'Qasr', 'Marw', 'Badr', 'Jood', 'Sahra', 'Waha', 'Rakan', 'Hala', 'Fahd', 'Yara', 'Salma', 'Talal'];

function buildFurniture() {
  const out = [];
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

export const FURNITURE_ITEMS = buildFurniture();
