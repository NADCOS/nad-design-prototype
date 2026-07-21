// Core TypeScript types shared across the app.

export type Lang = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type Role = 'admin' | 'guest' | null;

export const STEP_KEYS = [
  'type', 'level', 'style', 'materials', 'furniture', 'upload', 'summary', 'generate',
] as const;
export type StepKey = typeof STEP_KEYS[number];

export interface LocalizedKV {
  key: string;
  en: string;
  ar: string;
}

export interface ProjectType extends LocalizedKV {
  enDesc: string;
  arDesc: string;
}

export interface DesignLevel extends LocalizedKV {
  priceMin: number;
  priceMax: number;
  enDesc: string;
  arDesc: string;
  enMaterials: string;
  arMaterials: string;
  enQuality: string;
  arQuality: string;
}

export type StyleOption = LocalizedKV;

export type MaterialTier = 'high' | 'mid' | 'low';

export interface MaterialCategory {
  key: string;
  en: string;
  ar: string;
  tier: MaterialTier;
  items: Array<[string, string]>;
}

export type FurnitureFinishType = 'wood' | 'fabric' | 'metal';

export interface FurnitureCategory {
  key: string;
  en: string;
  ar: string;
  finishes: FurnitureFinishType[];
}

export type Availability = 'inStock' | 'madeToOrder';

export interface FurnitureItem {
  id: string;
  category: string;
  name: string;
  code: string;
  supplier: string;
  price: number;
  dims: string;
  woodFinish: [string, string];
  fabric: [string, string];
  metal: [string, string];
  availability: Availability;
}

export interface FurnitureSelection extends FurnitureItem {
  uid: string;
}

export interface ProjectInfo {
  location: string;
  area: string;
  ceiling: string;
  colors: string;
  functions: string;
  budget: string;
  special: string;
}

export interface MaterialChoice {
  en: string;
  ar: string;
}

export interface BoardItem {
  catKey: string;
  en: string;
  ar: string;
}

export interface KeyRef {
  key: string;
  en: string;
  ar: string;
}

export interface UploadItem {
  name: string;
  isImage: boolean;
  dataUrl: string | null;
}

export interface Selections {
  projectType: KeyRef | null;
  designLevel: KeyRef | null;
  stylePrimary: KeyRef | null;
  styleSecondary: KeyRef | null;
  materials: Record<string, MaterialChoice>;
  board: BoardItem[];
  furniture: FurnitureSelection[];
  uploads: UploadItem[];
  projectInfo: ProjectInfo;
}

export interface Supplier {
  id: number;
  name: string;
  category: string;
  delivery: string;
  contact: string;
  status: 'approved' | 'hidden';
}

export interface Consultation {
  id: number;
  name: string;
  type: 'online' | 'inPerson';
  date: string;
  project: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface Client {
  id: number;
  name: string;
  email: string;
  projects: number;
  lastActive: string;
}

export interface Registration {
  id: number;
  email: string;
  phone: string;
  registeredAt: string;
  status: 'pending' | 'verified';
}

export interface PriceOverride {
  priceMin?: number;
  priceMax?: number;
}

export interface CostBreakdown {
  level: DesignLevel;
  area: number;
  baseCost: number;
  materialsAddon: number;
  furnitureCost: number;
  lightingCost: number;
  installation: number;
  designFee: number;
  total: number;
  perSqm: number;
}

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export interface GenerationResult {
  version: number;
  imageUrl: string | null;
  mood: string;
  quality: string;
}
