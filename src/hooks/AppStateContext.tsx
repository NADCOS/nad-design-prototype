'use client';

// Global app state — auth/session, wizard selections, admin data, generation state.
// Lives in a React Context provided once in app/layout.tsx, so it survives client-side
// navigation between /design/[step] routes (the layout never remounts).
//
// Persistence today = localStorage via services/adminService + services/authService.
// Those service files are the seam to swap for Supabase later; this file never talks
// to storage directly except for small ephemeral bits (lang/theme).

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BoardItem, Client, Consultation, FurnitureFinishType, FurnitureItem, FurnitureSelection,
  GenerationStatus, KeyRef, Lang, MaterialChoice, PriceOverride, Registration, Role, Selections,
  StepKey, Supplier, Theme, UploadItem,
} from '@/lib/types';
import { STEP_KEYS } from '@/lib/types';
import * as authService from '@/services/authService';
import * as adminService from '@/services/adminService';
import { generateDesignImage } from '@/services/imageGenerationService';

export interface MaterialDetailRef { catKey: string; en: string; ar: string; }

export interface AppState {
  hydrated: boolean;
  lang: Lang;
  theme: Theme;
  role: Role;
  maxStepIndex: number;
  customTypeText: string;
  compareOpen: boolean;
  materialTab: string;
  materialDetail: MaterialDetailRef | null;
  furnitureTab: string;
  furnitureDetail: FurnitureItem | null;
  furnitureDraftFinish: Partial<Record<FurnitureFinishType, [string, string]>>;
  selections: Selections;
  toast: string | null;
  imageOverrides: Record<string, string>;
  adminSuppliers: Supplier[];
  adminConsultations: Consultation[];
  adminClients: Client[];
  adminRegistrations: Registration[];
  priceOverrides: Record<string, PriceOverride>;
  newSupplierName: string;
  adminTab: string;
  generationMood: string;
  generationQuality: string;
  generationStatus: GenerationStatus;
  generationVersion: number;
  generationImageUrl: string | null;
  generationError: string | null;
  sliderPos: number;
}

const initialSelections: Selections = {
  projectType: null,
  designLevel: null,
  stylePrimary: null,
  styleSecondary: null,
  materials: {},
  board: [],
  furniture: [],
  uploads: [],
  projectInfo: { location: '', area: '150', ceiling: '', colors: '', functions: '', budget: '', special: '' },
};

const initialState: AppState = {
  hydrated: false,
  lang: 'en',
  theme: 'light',
  role: null,
  maxStepIndex: 0,
  customTypeText: '',
  compareOpen: false,
  materialTab: 'flooring',
  materialDetail: null,
  furnitureTab: 'sofas',
  furnitureDetail: null,
  furnitureDraftFinish: {},
  selections: initialSelections,
  toast: null,
  imageOverrides: {},
  adminSuppliers: [],
  adminConsultations: [],
  adminClients: [],
  adminRegistrations: [],
  priceOverrides: {},
  newSupplierName: '',
  adminTab: 'overview',
  generationMood: 'daylight',
  generationQuality: 'photorealistic',
  generationStatus: 'idle',
  generationVersion: 0,
  generationImageUrl: null,
  generationError: null,
  sliderPos: 50,
};

type Updater = Partial<AppState> | ((s: AppState) => Partial<AppState>);
type SelectionsUpdater = Partial<Selections> | ((s: Selections) => Partial<Selections>);

interface Ctx {
  state: AppState;
  patch: (u: Updater) => void;
  patchSelections: (u: SelectionsUpdater) => void;

  toggleTheme: () => void;
  toggleLang: () => void;
  showToast: (msg: string) => void;

  advance: (step: StepKey) => void;
  canAccessStep: (step: StepKey) => boolean;

  loginAsAdmin: (passcode: string) => Promise<{ ok: boolean; error?: string }>;
  registerGuest: (email: string, phone: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  handleAdminImageChange: (slotId: string, file: File) => void;
  setPriceOverride: (levelKey: string, field: 'priceMin' | 'priceMax', value: number | undefined) => void;

  addSupplier: (name: string) => void;
  toggleSupplierStatus: (id: number) => void;
  removeSupplier: (id: number) => void;
  setConsultationStatus: (id: number, status: Consultation['status']) => void;
  removeConsultation: (id: number) => void;
  removeClient: (id: number) => void;
  setRegistrationStatus: (id: number, status: Registration['status']) => void;

  selectProjectType: (pt: KeyRef) => void;
  setCustomType: (text: string) => void;
  selectLevel: (lv: KeyRef) => void;
  toggleCompare: () => void;
  selectPrimaryStyle: (st: KeyRef) => void;
  selectSecondaryStyle: (st: KeyRef) => void;

  setMaterialTab: (key: string) => void;
  openMaterialDetail: (catKey: string, item: [string, string]) => void;
  closeMaterialDetail: () => void;
  chooseMaterial: (catKey: string, item: [string, string]) => void;
  saveMaterialToBoard: (catKey: string, item: [string, string]) => void;
  removeFromBoard: (i: number) => void;

  setFurnitureTab: (key: string) => void;
  openFurnitureDetail: (item: FurnitureItem) => void;
  closeFurnitureDetail: () => void;
  setDraftFinish: (type: FurnitureFinishType, val: [string, string]) => void;
  addFurnitureToDesign: () => void;
  removeFurnitureItem: (uid: string) => void;

  handleFileUpload: (files: FileList) => void;
  removeUpload: (i: number) => void;
  setProjectInfoField: (field: keyof Selections['projectInfo'], value: string) => void;

  setLightMood: (key: string) => void;
  setQuality: (key: string) => void;
  generateDesign: (promptText: string) => Promise<void>;
  downloadPlaceholder: () => void;
  saveProject: () => void;
  requestConsult: () => void;
  setSliderPos: (n: number) => void;
}

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch = useCallback((u: Updater) => {
    setState((s) => ({ ...s, ...(typeof u === 'function' ? u(s) : u) }));
  }, []);
  const patchSelections = useCallback((u: SelectionsUpdater) => {
    setState((s) => ({ ...s, selections: { ...s.selections, ...(typeof u === 'function' ? u(s.selections) : u) } }));
  }, []);

  // ---- hydrate from localStorage / admin service on mount ----
  useEffect(() => {
    let theme: Theme = 'light';
    try {
      const savedTheme = localStorage.getItem('nad_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') theme = savedTheme;
    } catch (e) {}
    const role = authService.getStoredRole();

    (async () => {
      const [suppliers, consultations, clients, registrations, priceOverrides, imageOverrides] = await Promise.all([
        adminService.getSuppliers(),
        adminService.getConsultations(),
        adminService.getClients(),
        adminService.getRegistrations(),
        adminService.getPriceOverrides(),
        adminService.getImageOverrides(),
      ]);
      patch({
        theme, role, hydrated: true,
        adminSuppliers: suppliers, adminConsultations: consultations, adminClients: clients,
        adminRegistrations: registrations, priceOverrides, imageOverrides,
      });
    })();
  }, [patch]);

  // ---- persist slices once hydrated ----
  useEffect(() => { if (state.hydrated) { try { localStorage.setItem('nad_theme', state.theme); } catch (e) {} } }, [state.hydrated, state.theme]);
  useEffect(() => { if (state.hydrated) adminService.saveImageOverrides(state.imageOverrides); }, [state.hydrated, state.imageOverrides]);
  useEffect(() => { if (state.hydrated) adminService.savePriceOverrides(state.priceOverrides); }, [state.hydrated, state.priceOverrides]);
  useEffect(() => { if (state.hydrated) adminService.saveSuppliers(state.adminSuppliers); }, [state.hydrated, state.adminSuppliers]);
  useEffect(() => { if (state.hydrated) adminService.saveConsultations(state.adminConsultations); }, [state.hydrated, state.adminConsultations]);
  useEffect(() => { if (state.hydrated) adminService.saveClients(state.adminClients); }, [state.hydrated, state.adminClients]);
  useEffect(() => { if (state.hydrated) adminService.saveRegistrations(state.adminRegistrations); }, [state.hydrated, state.adminRegistrations]);

  const toggleTheme = useCallback(() => patch((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })), [patch]);
  const toggleLang = useCallback(() => patch((s) => ({ lang: s.lang === 'en' ? 'ar' : 'en' })), [patch]);

  const showToast = useCallback((msg: string) => {
    patch({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => patch((s) => (s.toast === msg ? { toast: null } : {})), 2600);
  }, [patch]);

  const advance = useCallback((step: StepKey) => {
    const idx = STEP_KEYS.indexOf(step);
    patch((s) => ({ maxStepIndex: Math.max(s.maxStepIndex, idx) }));
  }, [patch]);
  const canAccessStep = useCallback((step: StepKey) => STEP_KEYS.indexOf(step) <= state.maxStepIndex, [state.maxStepIndex]);

  const loginAsAdmin = useCallback(async (passcode: string) => {
    const res = await authService.loginAsAdmin(passcode);
    if (res.ok) patch({ role: 'admin' });
    return res;
  }, [patch]);

  const registerGuest = useCallback(async (email: string, phone: string) => {
    const res = await authService.registerGuest(email, phone);
    if (res.ok && res.registration) {
      patch((s) => ({ role: 'guest', adminRegistrations: [...s.adminRegistrations, res.registration as Registration] }));
    }
    return res;
  }, [patch]);

  const logout = useCallback(() => { authService.clearStoredRole(); patch({ role: null }); }, [patch]);

  const handleAdminImageChange = useCallback((slotId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      patch((s) => ({ imageOverrides: { ...s.imageOverrides, [slotId]: url } }));
    };
    reader.readAsDataURL(file);
  }, [patch]);

  const setPriceOverride = useCallback((levelKey: string, field: 'priceMin' | 'priceMax', value: number | undefined) => {
    patch((s) => ({ priceOverrides: { ...s.priceOverrides, [levelKey]: { ...s.priceOverrides[levelKey], [field]: value } } }));
  }, [patch]);

  const addSupplier = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    patch((s) => ({
      adminSuppliers: [...s.adminSuppliers, {
        id: s.adminSuppliers.reduce((m, x) => Math.max(m, x.id), 0) + 1, name: trimmed,
        category: 'Furniture', delivery: '4-6 weeks', contact: trimmed.toLowerCase().replace(/[^a-z]+/g, '') + '@supplier.sa', status: 'approved',
      }],
      newSupplierName: '',
    }));
  }, [patch]);
  const toggleSupplierStatus = useCallback((id: number) => patch((s) => ({ adminSuppliers: s.adminSuppliers.map((sup) => (sup.id === id ? { ...sup, status: sup.status === 'approved' ? 'hidden' : 'approved' } : sup)) })), [patch]);
  const removeSupplier = useCallback((id: number) => patch((s) => ({ adminSuppliers: s.adminSuppliers.filter((sup) => sup.id !== id) })), [patch]);

  const setConsultationStatus = useCallback((id: number, status: Consultation['status']) => patch((s) => ({ adminConsultations: s.adminConsultations.map((c) => (c.id === id ? { ...c, status } : c)) })), [patch]);
  const removeConsultation = useCallback((id: number) => patch((s) => ({ adminConsultations: s.adminConsultations.filter((c) => c.id !== id) })), [patch]);
  const removeClient = useCallback((id: number) => patch((s) => ({ adminClients: s.adminClients.filter((c) => c.id !== id) })), [patch]);
  const setRegistrationStatus = useCallback((id: number, status: Registration['status']) => patch((s) => ({ adminRegistrations: s.adminRegistrations.map((r) => (r.id === id ? { ...r, status } : r)) })), [patch]);

  const selectProjectType = useCallback((pt: KeyRef) => patchSelections({ projectType: pt }), [patchSelections]);
  const setCustomType = useCallback((text: string) => patch({ customTypeText: text }), [patch]);
  const selectLevel = useCallback((lv: KeyRef) => patchSelections({ designLevel: lv }), [patchSelections]);
  const toggleCompare = useCallback(() => patch((s) => ({ compareOpen: !s.compareOpen })), [patch]);
  const selectPrimaryStyle = useCallback((st: KeyRef) => patchSelections((sel) => ({ stylePrimary: st, styleSecondary: sel.styleSecondary && sel.styleSecondary.key === st.key ? null : sel.styleSecondary })), [patchSelections]);
  const selectSecondaryStyle = useCallback((st: KeyRef) => patchSelections((sel) => ({ styleSecondary: sel.styleSecondary && sel.styleSecondary.key === st.key ? null : st })), [patchSelections]);

  const setMaterialTab = useCallback((key: string) => patch({ materialTab: key, materialDetail: null }), [patch]);
  const openMaterialDetail = useCallback((catKey: string, item: [string, string]) => patch({ materialDetail: { catKey, en: item[0], ar: item[1] } }), [patch]);
  const closeMaterialDetail = useCallback(() => patch({ materialDetail: null }), [patch]);
  const chooseMaterial = useCallback((catKey: string, item: [string, string]) => patchSelections((sel) => ({ materials: { ...sel.materials, [catKey]: { en: item[0], ar: item[1] } } })), [patchSelections]);
  const saveMaterialToBoard = useCallback((catKey: string, item: [string, string]) => {
    patchSelections((sel) => {
      const exists = sel.board.some((b) => b.catKey === catKey && b.en === item[0]);
      if (exists) return {};
      const boardItem: BoardItem = { catKey, en: item[0], ar: item[1] };
      return { board: [...sel.board, boardItem] };
    });
  }, [patchSelections]);
  const removeFromBoard = useCallback((i: number) => patchSelections((sel) => ({ board: sel.board.filter((_, idx) => idx !== i) })), [patchSelections]);

  const setFurnitureTab = useCallback((key: string) => patch({ furnitureTab: key, furnitureDetail: null }), [patch]);
  const openFurnitureDetail = useCallback((item: FurnitureItem) => patch({ furnitureDetail: item, furnitureDraftFinish: { wood: item.woodFinish, fabric: item.fabric, metal: item.metal } }), [patch]);
  const closeFurnitureDetail = useCallback(() => patch({ furnitureDetail: null }), [patch]);
  const setDraftFinish = useCallback((type: FurnitureFinishType, val: [string, string]) => patch((s) => ({ furnitureDraftFinish: { ...s.furnitureDraftFinish, [type]: val } })), [patch]);
  const addFurnitureToDesign = useCallback(() => {
    setState((s) => {
      const item = s.furnitureDetail;
      if (!item) return s;
      const resolved: FurnitureSelection = { ...item, ...s.furnitureDraftFinish, uid: item.id + '-' + Date.now() } as FurnitureSelection;
      return { ...s, selections: { ...s.selections, furniture: [...s.selections.furniture, resolved] }, furnitureDetail: null };
    });
  }, []);
  const removeFurnitureItem = useCallback((uid: string) => patchSelections((sel) => ({ furniture: sel.furniture.filter((f) => f.uid !== uid) })), [patchSelections]);

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const item: UploadItem = { name: file.name, isImage: true, dataUrl: ev.target?.result as string };
          patchSelections((sel) => ({ uploads: [...sel.uploads, item] }));
        };
        reader.readAsDataURL(file);
      } else {
        const item: UploadItem = { name: file.name, isImage: false, dataUrl: null };
        patchSelections((sel) => ({ uploads: [...sel.uploads, item] }));
      }
    });
  }, [patchSelections]);
  const removeUpload = useCallback((i: number) => patchSelections((sel) => ({ uploads: sel.uploads.filter((_, idx) => idx !== i) })), [patchSelections]);
  const setProjectInfoField = useCallback((field: keyof Selections['projectInfo'], value: string) => patchSelections((sel) => ({ projectInfo: { ...sel.projectInfo, [field]: value } })), [patchSelections]);

  const setLightMood = useCallback((key: string) => patch({ generationMood: key }), [patch]);
  const setQuality = useCallback((key: string) => patch({ generationQuality: key }), [patch]);

  const generateDesign = useCallback(async (promptText: string) => {
    patch({ generationStatus: 'generating', generationError: null });
    const res = await generateDesignImage({ prompt: promptText, mood: state.generationMood, quality: state.generationQuality });
    if (res.ok) {
      patch((s) => ({ generationStatus: 'done', generationVersion: (s.generationVersion || 0) + 1, generationImageUrl: res.imageUrl || null }));
    } else {
      patch({ generationStatus: 'error', generationError: res.error || 'Generation failed.' });
    }
  }, [patch, state.generationMood, state.generationQuality]);

  const downloadPlaceholder = useCallback(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    for (let y = 0; y < 800; y += 24) { ctx.fillStyle = (y / 24) % 2 === 0 ? '#e9e0d2' : '#d8c9ab'; ctx.fillRect(0, y, 1200, 24); }
    ctx.fillStyle = 'rgba(26,20,14,0.85)'; ctx.fillRect(0, 700, 1200, 100);
    ctx.fillStyle = '#f7f3ea'; ctx.font = '600 30px Georgia, serif'; ctx.fillText('NAD Design — Conceptual Visualization', 30, 745);
    ctx.font = '15px monospace'; ctx.fillText('Prototype output · not a final rendered image', 30, 775);
    const a = document.createElement('a'); a.download = 'nad-design-concept.png'; a.href = canvas.toDataURL('image/png'); a.click();
  }, []);

  const saveProject = useCallback(() => showToast(state.lang === 'en' ? 'Project saved (demo)' : 'تم حفظ المشروع (تجريبي)'), [showToast, state.lang]);
  const requestConsult = useCallback(() => showToast(state.lang === 'en' ? 'Consultation request sent — our team will contact you shortly.' : 'تم إرسال طلب الاستشارة — سيتواصل معك فريقنا قريباً.'), [showToast, state.lang]);
  const setSliderPos = useCallback((n: number) => patch({ sliderPos: n }), [patch]);

  const value = useMemo<Ctx>(() => ({
    state, patch, patchSelections, toggleTheme, toggleLang, showToast, advance, canAccessStep,
    loginAsAdmin, registerGuest, logout, handleAdminImageChange, setPriceOverride,
    addSupplier, toggleSupplierStatus, removeSupplier, setConsultationStatus, removeConsultation, removeClient, setRegistrationStatus,
    selectProjectType, setCustomType, selectLevel, toggleCompare, selectPrimaryStyle, selectSecondaryStyle,
    setMaterialTab, openMaterialDetail, closeMaterialDetail, chooseMaterial, saveMaterialToBoard, removeFromBoard,
    setFurnitureTab, openFurnitureDetail, closeFurnitureDetail, setDraftFinish, addFurnitureToDesign, removeFurnitureItem,
    handleFileUpload, removeUpload, setProjectInfoField, setLightMood, setQuality, generateDesign, downloadPlaceholder,
    saveProject, requestConsult, setSliderPos,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): Ctx {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within <AppStateProvider>');
  return ctx;
}
