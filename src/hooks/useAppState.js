// NAD Design — global app state & all handlers, ported from the original
// single-file App.jsx class component into a React Context + hook so pages
// can be split into separate files while sharing one source of truth.
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPPLIERS } from '../data/suppliers.js';
import { DESIGN_LEVELS } from '../data/designLevels.js';
import { STEP_KEYS } from '../data/navigation.js';
import { STRINGS } from '../data/translations.js';
import { getLevelRange, computeCost, computeWarnings } from '../utils/pricing.js';
import { generateDesign as requestNanoBananaDesign, getRemainingGenerations } from '../services/nanoBananaClient.js';
import { buildStructuredPrompt } from '../utils/promptBuilder.js';
import { AI_GENERATION_CONFIG } from '../config/aiGeneration.js';

const initialSelections = {
  projectType: null,
  designLevel: null,
  stylePrimary: null,
  styleSecondary: null,
  materials: {},
  board: [],
  furniture: [],
  uploads: [],
  projectInfo: { location: '', area: '150', rooms: '', ceiling: '', colors: '', functions: '', budget: '', special: '' },
};

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    lang: 'en',
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
    theme: 'light',
    role: null,
    loginPasscode: '',
    loginError: '',
    adminTab: 'overview',
    priceOverrides: {},
    adminSuppliers: SUPPLIERS.map((name, i) => ({
      id: i, name,
      category: ['Flooring & Stone', 'Furniture', 'Lighting', 'Fabrics', 'Metal & Hardware'][i % 5],
      delivery: ['2-3 weeks', '4-6 weeks', '6-8 weeks'][i % 3],
      contact: name.toLowerCase().replace(/[^a-z]+/g, '') + '@supplier.sa',
      status: 'approved',
    })),
    newSupplierName: '',
    adminConsultations: [
      { id: 1, name: 'Sara Al-Qahtani', type: 'online', date: '2026-07-18', project: 'Villa', status: 'pending' },
      { id: 2, name: 'Faisal Al-Otaibi', type: 'inPerson', date: '2026-07-20', project: 'Office', status: 'confirmed' },
      { id: 3, name: 'Noura Al-Harbi', type: 'online', date: '2026-07-22', project: 'Apartment', status: 'pending' },
    ],
    adminClients: [
      { id: 1, name: 'Abdulaziz Al-Mutairi', email: 'a.mutairi@example.com', projects: 2, lastActive: '2026-07-10' },
      { id: 2, name: 'Lama Al-Fahad', email: 'lama.fahad@example.com', projects: 1, lastActive: '2026-07-05' },
      { id: 3, name: 'Khalid Al-Dossari', email: 'khalid.d@example.com', projects: 3, lastActive: '2026-07-01' },
    ],
    adminRegistrations: [],
    guestEmail: '', guestPhone: '', guestFormError: '', loginIntent: null,
    generationMood: 'daylight', generationQuality: 'photorealistic', generationStatus: 'idle', generationVersion: 0, sliderPos: 50,
    promptDraft: null, generatedImageUrl: null, generationError: null,
    generationAspectRatio: AI_GENERATION_CONFIG.defaultAspectRatio, generationImageSize: AI_GENERATION_CONFIG.defaultImageSize, allowFullRedesign: false,
  });
  const toastTimer = useRef(null);

  const patch = useCallback((updater) => setState((s) => ({ ...s, ...(typeof updater === 'function' ? updater(s) : updater) })), []);

  useEffect(() => {
    try { const saved = localStorage.getItem('nad_role'); if (saved === 'admin' || saved === 'guest') patch({ role: saved }); } catch (e) {}
    try { const savedImages = JSON.parse(localStorage.getItem('nad_image_overrides') || '{}'); if (savedImages && typeof savedImages === 'object') patch({ imageOverrides: savedImages }); } catch (e) {}
    try { const savedTheme = localStorage.getItem('nad_theme'); if (savedTheme === 'dark' || savedTheme === 'light') patch({ theme: savedTheme }); } catch (e) {}
    try { const savedRegs = JSON.parse(localStorage.getItem('nad_registrations') || '[]'); if (Array.isArray(savedRegs)) patch({ adminRegistrations: savedRegs }); } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = useCallback(() => setState((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('nad_theme', next); } catch (e) {}
    return { ...s, theme: next };
  }), []);

  const handleAdminImageChange = useCallback((slotId, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setState((s) => {
      const next = { ...s.imageOverrides, [slotId]: ev.target.result };
      try { localStorage.setItem('nad_image_overrides', JSON.stringify(next)); } catch (err) {}
      return { ...s, imageOverrides: next };
    });
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const showToast = useCallback((msg) => {
    patch({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState((s) => (s.toast === msg ? { ...s, toast: null } : s)), 2600);
  }, [patch]);

  const goToLogin = useCallback((intent) => { patch({ loginError: '', loginPasscode: '', guestFormError: '', loginIntent: intent || null }); navigate('/login'); }, [patch, navigate]);
  const setLoginPasscode = useCallback((e) => patch({ loginPasscode: e.target.value, loginError: '' }), [patch]);
  const setGuestEmail = useCallback((e) => patch({ guestEmail: e.target.value, guestFormError: '' }), [patch]);
  const setGuestPhone = useCallback((e) => patch({ guestPhone: e.target.value, guestFormError: '' }), [patch]);

  const registerGuest = useCallback(() => {
    setState((s) => {
      const email = s.guestEmail.trim();
      const phone = s.guestPhone.trim();
      if (!email && !phone) {
        return { ...s, guestFormError: s.lang === 'ar' ? STRINGS.ar.login.guestFormError : STRINGS.en.login.guestFormError };
      }
      const reg = { id: Date.now(), email, phone, registeredAt: new Date().toISOString().slice(0, 10), status: 'pending' };
      const nextRegs = [...s.adminRegistrations, reg];
      try { localStorage.setItem('nad_registrations', JSON.stringify(nextRegs)); } catch (e) {}
      try { localStorage.setItem('nad_role', 'guest'); } catch (e) {}
      const idx = STEP_KEYS.indexOf(s.loginIntent);
      try {
        const subject = encodeURIComponent('New NAD Design registration to verify');
        const body = encodeURIComponent('A new visitor registered on NAD Design and needs verification.\n\nEmail: ' + (email || '\u2014') + '\nPhone: ' + (phone || '\u2014') + '\nDate: ' + reg.registeredAt);
        const mailtoLink = document.createElement('a');
        mailtoLink.href = 'mailto:admin@nadcos.com?subject=' + subject + '&body=' + body;
        mailtoLink.click();
      } catch (e) {}
      setTimeout(() => {
        showToast(s.lang === 'ar' ? STRINGS.ar.login.guestNotified : STRINGS.en.login.guestNotified);
        navigate(s.loginIntent ? '/design/' + s.loginIntent : '/');
      }, 0);
      return {
        ...s, adminRegistrations: nextRegs, role: 'guest',
        maxStepIndex: idx >= 0 ? Math.max(s.maxStepIndex, idx) : s.maxStepIndex,
        loginIntent: null, guestEmail: '', guestPhone: '', guestFormError: '',
      };
    });
  }, [navigate, showToast]);

  const loginAsAdmin = useCallback(() => {
    setState((s) => {
      if (s.loginPasscode === 'Drive@2424') {
        try { localStorage.setItem('nad_role', 'admin'); } catch (e) {}
        setTimeout(() => navigate(s.loginIntent ? '/design/' + s.loginIntent : '/admin'), 0);
        return { ...s, role: 'admin', loginError: '', loginPasscode: '', loginIntent: null };
      }
      return { ...s, loginError: s.lang === 'ar' ? STRINGS.ar.login.error : STRINGS.en.login.error };
    });
  }, [navigate]);

  const logout = useCallback(() => {
    try { localStorage.removeItem('nad_role'); } catch (e) {}
    patch({ role: null });
    navigate('/');
  }, [patch, navigate]);

  const goToAdmin = useCallback(() => navigate('/admin'), [navigate]);
  const setAdminTab = useCallback((key) => patch({ adminTab: key }), [patch]);
  const setRegistrationStatus = useCallback((id, status) => setState((s) => {
    const next = s.adminRegistrations.map((r) => (r.id === id ? { ...r, status } : r));
    try { localStorage.setItem('nad_registrations', JSON.stringify(next)); } catch (e) {}
    return { ...s, adminRegistrations: next };
  }), []);

  const getLevelRangeFor = useCallback((key) => getLevelRange(key, state.priceOverrides), [state.priceOverrides]);
  const setPriceOverride = useCallback((key, field) => (e) => {
    const num = parseFloat(e.target.value);
    patch((s) => ({ priceOverrides: { ...s.priceOverrides, [key]: { ...s.priceOverrides[key], [field]: isNaN(num) ? undefined : num } } }));
  }, [patch]);

  const setNewSupplierName = useCallback((e) => patch({ newSupplierName: e.target.value }), [patch]);
  const addSupplier = useCallback(() => setState((s) => {
    const name = s.newSupplierName.trim();
    if (!name) return s;
    return {
      ...s,
      adminSuppliers: [...s.adminSuppliers, {
        id: s.adminSuppliers.reduce((m, x) => Math.max(m, x.id), 0) + 1, name,
        category: 'Furniture', delivery: '4-6 weeks', contact: name.toLowerCase().replace(/[^a-z]+/g, '') + '@supplier.sa', status: 'approved',
      }],
      newSupplierName: '',
    };
  }), []);
  const toggleSupplierStatus = useCallback((id) => patch((s) => ({ adminSuppliers: s.adminSuppliers.map((sup) => (sup.id === id ? { ...sup, status: sup.status === 'approved' ? 'hidden' : 'approved' } : sup)) })), [patch]);
  const removeSupplier = useCallback((id) => patch((s) => ({ adminSuppliers: s.adminSuppliers.filter((sup) => sup.id !== id) })), [patch]);

  const setConsultationStatus = useCallback((id, status) => patch((s) => ({ adminConsultations: s.adminConsultations.map((c) => (c.id === id ? { ...c, status } : c)) })), [patch]);
  const removeConsultation = useCallback((id) => patch((s) => ({ adminConsultations: s.adminConsultations.filter((c) => c.id !== id) })), [patch]);
  const removeClient = useCallback((id) => patch((s) => ({ adminClients: s.adminClients.filter((c) => c.id !== id) })), [patch]);

  const goHome = useCallback(() => navigate('/'), [navigate]);
  const goToStart = useCallback(() => {
    if (!state.role) { goToLogin('type'); return; }
    patch((s) => ({ maxStepIndex: Math.max(s.maxStepIndex, 0) }));
    navigate('/design/type');
  }, [state.role, goToLogin, patch, navigate]);
  const goToLevels = useCallback(() => {
    if (!state.role) { goToLogin('level'); return; }
    patch((s) => ({ maxStepIndex: Math.max(s.maxStepIndex, 1) }));
    navigate('/design/level');
  }, [state.role, goToLogin, patch, navigate]);
  const toggleLang = useCallback(() => patch((s) => ({ lang: s.lang === 'en' ? 'ar' : 'en' })), [patch]);

  const goToStep = useCallback((key) => {
    const idx = STEP_KEYS.indexOf(key);
    if (idx <= state.maxStepIndex) navigate('/design/' + key);
  }, [state.maxStepIndex, navigate]);
  const advanceTo = useCallback((key) => {
    const idx = STEP_KEYS.indexOf(key);
    patch((s) => ({ maxStepIndex: Math.max(s.maxStepIndex, idx) }));
    navigate('/design/' + key);
  }, [patch, navigate]);

  const selectProjectType = useCallback((pt) => patch((s) => ({ selections: { ...s.selections, projectType: pt } })), [patch]);
  const setCustomType = useCallback((e) => patch({ customTypeText: e.target.value }), [patch]);
  const nextFromType = useCallback(() => advanceTo('level'), [advanceTo]);

  const selectLevel = useCallback((lv) => patch((s) => ({ selections: { ...s.selections, designLevel: lv } })), [patch]);
  const toggleCompare = useCallback(() => patch((s) => ({ compareOpen: !s.compareOpen })), [patch]);
  const nextFromLevel = useCallback(() => advanceTo('style'), [advanceTo]);

  const selectPrimaryStyle = useCallback((st) => patch((s) => ({ selections: { ...s.selections, stylePrimary: st, styleSecondary: s.selections.styleSecondary && s.selections.styleSecondary.key === st.key ? null : s.selections.styleSecondary } })), [patch]);
  const selectSecondaryStyle = useCallback((st) => patch((s) => ({ selections: { ...s.selections, styleSecondary: s.selections.styleSecondary && s.selections.styleSecondary.key === st.key ? null : st } })), [patch]);
  const nextFromStyle = useCallback(() => advanceTo('materials'), [advanceTo]);

  const setMaterialTab = useCallback((key) => patch({ materialTab: key, materialDetail: null }), [patch]);
  const openMaterialDetail = useCallback((catKey, item) => patch({ materialDetail: { catKey, en: item[0], ar: item[1] } }), [patch]);
  const closeMaterialDetail = useCallback(() => patch({ materialDetail: null }), [patch]);
  const chooseMaterial = useCallback((catKey, item) => patch((s) => ({ selections: { ...s.selections, materials: { ...s.selections.materials, [catKey]: { en: item[0], ar: item[1] } } } })), [patch]);
  const saveMaterialToBoard = useCallback((catKey, item) => patch((s) => {
    const exists = s.selections.board.some((b) => b.catKey === catKey && b.en === item[0]);
    if (exists) return {};
    return { selections: { ...s.selections, board: [...s.selections.board, { catKey, en: item[0], ar: item[1] }] } };
  }), [patch]);
  const removeFromBoard = useCallback((i) => patch((s) => ({ selections: { ...s.selections, board: s.selections.board.filter((_, idx) => idx !== i) } })), [patch]);
  const nextFromMaterials = useCallback(() => advanceTo('furniture'), [advanceTo]);

  const setFurnitureTab = useCallback((key) => patch({ furnitureTab: key, furnitureDetail: null }), [patch]);
  const openFurnitureDetail = useCallback((item) => patch({ furnitureDetail: item, furnitureDraftFinish: { wood: item.woodFinish, fabric: item.fabric, metal: item.metal } }), [patch]);
  const closeFurnitureDetail = useCallback(() => patch({ furnitureDetail: null }), [patch]);
  const setDraftFinish = useCallback((type, val) => patch((s) => ({ furnitureDraftFinish: { ...s.furnitureDraftFinish, [type]: val } })), [patch]);
  const addFurnitureToDesign = useCallback(() => patch((s) => {
    const item = s.furnitureDetail; if (!item) return {};
    const resolved = { ...item, ...s.furnitureDraftFinish, uid: item.id + '-' + Date.now() };
    return { selections: { ...s.selections, furniture: [...s.selections.furniture, resolved] }, furnitureDetail: null };
  }), [patch]);
  const removeFurnitureItem = useCallback((uid) => patch((s) => ({ selections: { ...s.selections, furniture: s.selections.furniture.filter((f) => f.uid !== uid) } })), [patch]);
  const nextFromFurniture = useCallback(() => advanceTo('upload'), [advanceTo]);

  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const MAX_BYTES = 15 * 1024 * 1024;
    let rejected = false;
    files.forEach((file) => {
      if (file.size > MAX_BYTES) { rejected = true; return; }
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const reader = new FileReader();
        reader.onerror = () => showToast(state.lang === 'ar' ? 'تعذّرت قراءة الملف. حاول مرة أخرى.' : 'Could not read that file. Please try again.');
        reader.onload = (ev) => patch((s) => ({ selections: { ...s.selections, uploads: [...s.selections.uploads, { name: file.name, isImage: true, dataUrl: ev.target.result }] } }));
        reader.readAsDataURL(file);
      } else {
        patch((s) => ({ selections: { ...s.selections, uploads: [...s.selections.uploads, { name: file.name, isImage: false, dataUrl: null }] } }));
      }
    });
    if (rejected) showToast(state.lang === 'ar' ? 'بعض الملفات كبيرة جداً (الحد الأقصى 15 ميجابايت) ولم تتم إضافتها.' : 'Some files were too large (15MB max) and were not added.');
    e.target.value = '';
  }, [patch, showToast, state.lang]);
  const removeUpload = useCallback((i) => patch((s) => ({ selections: { ...s.selections, uploads: s.selections.uploads.filter((_, idx) => idx !== i) } })), [patch]);
  const setProjectInfoField = useCallback((field) => (e) => patch((s) => ({ selections: { ...s.selections, projectInfo: { ...s.selections.projectInfo, [field]: e.target.value } } })), [patch]);
  const nextFromUpload = useCallback(() => advanceTo('summary'), [advanceTo]);

  const setLightMood = useCallback((key) => patch({ generationMood: key }), [patch]);
  const setQuality = useCallback((key) => patch({ generationQuality: key }), [patch]);
  const goGenerate = useCallback(() => {
    if (!state.role) { goToLogin('generate'); return; }
    advanceTo('generate');
  }, [state.role, goToLogin, advanceTo]);

  const getAutoPrompt = useCallback(() => {
    const uploadedImage = (state.selections.uploads || []).find((u) => u.isImage && u.dataUrl);
    return buildStructuredPrompt({
      selections: state.selections,
      lang: state.lang,
      customTypeText: state.customTypeText,
      mood: state.generationMood,
      hasUploadedImage: !!uploadedImage,
      allowFullRedesign: state.allowFullRedesign,
    });
  }, [state.selections, state.lang, state.customTypeText, state.generationMood, state.allowFullRedesign]);

  const setPromptDraft = useCallback((e) => patch({ promptDraft: e.target.value }), [patch]);
  const resetPromptToAuto = useCallback(() => patch({ promptDraft: null }), [patch]);
  const setAspectRatio = useCallback((key) => patch({ generationAspectRatio: key }), [patch]);
  const setImageSize = useCallback((key) => patch({ generationImageSize: key }), [patch]);
  const toggleAllowFullRedesign = useCallback(() => patch((s) => ({ allowFullRedesign: !s.allowFullRedesign })), [patch]);

  const generateDesign = useCallback(async () => {
    if (!state.role) { goToLogin('generate'); return; }
    if (state.generationStatus === 'generating') return;
    const prompt = (state.promptDraft !== null && state.promptDraft !== undefined) ? state.promptDraft : getAutoPrompt();
    patch({ generationStatus: 'generating', generationError: null });
    const uploadedImage = (state.selections.uploads || []).find((u) => u.isImage && u.dataUrl);
    const result = await requestNanoBananaDesign({
      prompt,
      imageDataUrl: uploadedImage ? uploadedImage.dataUrl : undefined,
      aspectRatio: state.generationAspectRatio || AI_GENERATION_CONFIG.defaultAspectRatio,
      imageSize: state.generationImageSize || AI_GENERATION_CONFIG.defaultImageSize,
      projectId: state.selections.projectType ? state.selections.projectType.key : null,
    });
    if (result.success) {
      patch((s) => ({ generationStatus: 'done', generationVersion: (s.generationVersion || 0) + 1, generatedImageUrl: result.image, generationError: null }));
    } else {
      patch({ generationStatus: 'error', generationError: result.error });
    }
  }, [state, goToLogin, getAutoPrompt, patch]);
  const regenerate = useCallback(() => generateDesign(), [generateDesign]);
  const resetGeneration = useCallback(() => patch({ generationStatus: 'idle', generatedImageUrl: null, generationError: null, promptDraft: null }), [patch]);

  const downloadPlaceholder = useCallback(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < 800; y += 24) { ctx.fillStyle = (y / 24) % 2 === 0 ? '#e9e0d2' : '#d8c9ab'; ctx.fillRect(0, y, 1200, 24); }
    ctx.fillStyle = 'rgba(26,20,14,0.85)'; ctx.fillRect(0, 700, 1200, 100);
    ctx.fillStyle = '#f7f3ea'; ctx.font = '600 30px Georgia, serif'; ctx.fillText('NAD Design — Conceptual Visualization', 30, 745);
    ctx.font = '15px monospace'; ctx.fillText('Prototype output · not a final rendered image', 30, 775);
    const a = document.createElement('a'); a.download = 'nad-design-concept.jpg'; a.href = canvas.toDataURL('image/jpeg'); a.click();
  }, []);
  const downloadGeneratedImage = useCallback(() => {
    if (state.generatedImageUrl) {
      const projectTypeSlug = state.selections.projectType ? state.selections.projectType.key : 'project';
      const levelSlug = state.selections.designLevel ? state.selections.designLevel.key : 'level';
      const timestamp = Date.now();
      const a = document.createElement('a');
      a.href = state.generatedImageUrl;
      a.download = `NAD-Design-${projectTypeSlug}-${levelSlug}-${timestamp}.jpg`;
      a.click();
      return;
    }
    downloadPlaceholder();
  }, [state.generatedImageUrl, state.selections, downloadPlaceholder]);

  const saveProject = useCallback(() => showToast(state.lang === 'en' ? STRINGS.en.generate.savedToast : STRINGS.ar.generate.savedToast), [showToast, state.lang]);
  const requestConsult = useCallback(() => {
    if (!state.role) { goToLogin(); return; }
    showToast(state.lang === 'en' ? STRINGS.en.generate.consultToast : STRINGS.ar.generate.consultToast);
  }, [state.role, goToLogin, showToast, state.lang]);

  const buildWhatsAppLink = useCallback(() => {
    const s = state.selections; const lang = state.lang;
    const lines = [
      'NAD Design — ' + (lang === 'ar' ? 'ملخص المشروع' : 'Project Summary'),
      (lang === 'ar' ? 'نوع المشروع' : 'Project type') + ': ' + (s.projectType ? s.projectType[lang] : '-'),
      (lang === 'ar' ? 'المستوى' : 'Level') + ': ' + (s.designLevel ? s.designLevel[lang] : '-'),
      (lang === 'ar' ? 'النمط' : 'Style') + ': ' + (s.stylePrimary ? s.stylePrimary[lang] : '-'),
      (lang === 'ar' ? 'المساحة' : 'Area') + ': ' + (s.projectInfo.area || '-') + ' m²',
    ];
    return 'https://wa.me/?text=' + encodeURIComponent(lines.join('\n'));
  }, [state.selections, state.lang]);

  const setSliderPos = useCallback((n) => patch({ sliderPos: n }), [patch]);

  const value = {
    state, patch, showToast,
    toggleTheme, handleAdminImageChange,
    goToLogin, setLoginPasscode, setGuestEmail, setGuestPhone, registerGuest, loginAsAdmin, logout,
    goToAdmin, setAdminTab, setRegistrationStatus,
    getLevelRangeFor, setPriceOverride,
    setNewSupplierName, addSupplier, toggleSupplierStatus, removeSupplier,
    setConsultationStatus, removeConsultation, removeClient,
    goHome, goToStart, goToLevels, toggleLang, goToStep, advanceTo,
    selectProjectType, setCustomType, nextFromType,
    selectLevel, toggleCompare, nextFromLevel,
    selectPrimaryStyle, selectSecondaryStyle, nextFromStyle,
    setMaterialTab, openMaterialDetail, closeMaterialDetail, chooseMaterial, saveMaterialToBoard, removeFromBoard, nextFromMaterials,
    setFurnitureTab, openFurnitureDetail, closeFurnitureDetail, setDraftFinish, addFurnitureToDesign, removeFurnitureItem, nextFromFurniture,
    handleFileUpload, removeUpload, setProjectInfoField, nextFromUpload,
    setLightMood, setQuality, goGenerate, getAutoPrompt, setPromptDraft, resetPromptToAuto,
    setAspectRatio, setImageSize, toggleAllowFullRedesign,
    generateDesign, regenerate, resetGeneration, downloadPlaceholder, downloadGeneratedImage,
    saveProject, requestConsult, buildWhatsAppLink, setSliderPos,
    computeCost: () => computeCost(state.selections, state.priceOverrides),
    computeWarnings: () => computeWarnings(state.selections, state.lang),
    getRemainingGenerations,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within <AppStateProvider>');
  return ctx;
}
