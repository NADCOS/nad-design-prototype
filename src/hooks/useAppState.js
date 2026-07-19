// NAD Design — global app state & all handlers, ported from the original
// single-file App.jsx class component into a React Context + hook so pages
// can be split into separate files while sharing one source of truth.
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPPLIERS } from '../data/suppliers.js';
import { DESIGN_LEVELS } from '../data/designLevels.js';
import { FURNITURE_ITEMS } from '../data/furniture.js';
import { STEP_KEYS } from '../data/navigation.js';
import { STRINGS } from '../data/translations.js';
import { getLevelRange, computeCost, computeWarnings } from '../utils/pricing.js';
import { generateDesign as requestNanoBananaDesign, getRemainingGenerations } from '../services/nanoBananaClient.js';
import { buildStructuredPrompt } from '../utils/promptBuilder.js';
import { AI_GENERATION_CONFIG } from '../config/aiGeneration.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import * as projectTypesService from '../services/projectTypesService.js';
import * as furnitureService from '../services/furnitureService.js';

async function getAdminAuthHeaders() {
  if (!isSupabaseConfigured) return {};
  try {
    const { data } = await supabase.auth.getSession();
    const token = data && data.session && data.session.access_token;
    return token ? { Authorization: 'Bearer ' + token } : {};
  } catch (e) { return {}; }
}

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
    adminSuppliers: isSupabaseConfigured ? [] : SUPPLIERS.map((name, i) => {
      const slug = name.toLowerCase().replace(/[^a-z]+/g, '');
      return {
        id: i, name,
        category: ['Flooring & Stone', 'Furniture', 'Lighting', 'Fabrics', 'Metal & Hardware'][i % 5],
        delivery: ['2-3 weeks', '4-6 weeks', '6-8 weeks'][i % 3],
        website: 'https://' + slug + '.sa',
        email: slug + '@supplier.sa',
        phone: '+966 5' + (10 + i) + ' ' + (200 + i * 11) + ' ' + (4000 + i * 87),
        status: 'approved',
      };
    }),
    newSupplierName: '',
    newSupplierWebsite: '',
    newSupplierEmail: '',
    newSupplierPhone: '',
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
    generationCounts: {},
    guestEmail: '', guestPhone: '', guestFormError: '', loginIntent: null,
    guestPanelMode: 'signup', guestLoginIdentifier: '', guestLoginError: '',
    currentGuestIdentifier: null,
    generationMood: 'daylight', generationQuality: 'photorealistic', generationStatus: 'idle', generationVersion: 0, sliderPos: 50,
    promptDraft: null, generatedImageUrl: null, generationError: null,
    generationAspectRatio: AI_GENERATION_CONFIG.defaultAspectRatio, generationImageSize: AI_GENERATION_CONFIG.defaultImageSize, allowFullRedesign: false,
    projectTypesRemote: [], projectTypesStatus: 'idle', projectTypesError: null,
    editingProjectType: null, projectTypeSaving: false, projectTypeSaveError: null, projectTypeSaveSuccess: false,
    furnitureRemote: [], furnitureStatus: 'idle', furnitureError: null,
    editingFurnitureItem: null, furnitureItemIsNew: false, furnitureSaving: false, furnitureSaveError: null, furnitureSaveSuccess: false,
    activityStats: { monthly: [], yearly: [] }, activityStatsStatus: 'idle',
  });
  const toastTimer = useRef(null);

  const patch = useCallback((updater) => setState((s) => ({ ...s, ...(typeof updater === 'function' ? updater(s) : updater) })), []);

  useEffect(() => {
    try { const saved = localStorage.getItem('nad_role'); if (saved === 'admin' || saved === 'guest') patch({ role: saved }); } catch (e) {}
    try { const savedIdentifier = localStorage.getItem('nad_guest_identifier'); if (savedIdentifier) patch({ currentGuestIdentifier: savedIdentifier }); } catch (e) {}
    try { const savedImages = JSON.parse(localStorage.getItem('nad_image_overrides') || '{}'); if (savedImages && typeof savedImages === 'object') patch({ imageOverrides: savedImages }); } catch (e) {}
    try { const savedTheme = localStorage.getItem('nad_theme'); if (savedTheme === 'dark' || savedTheme === 'light') patch({ theme: savedTheme }); } catch (e) {}
    if (!isSupabaseConfigured) {
      try { const savedRegs = JSON.parse(localStorage.getItem('nad_registrations') || '[]'); if (Array.isArray(savedRegs)) patch({ adminRegistrations: savedRegs }); } catch (e) {}
      try { const savedSuppliers = JSON.parse(localStorage.getItem('nad_suppliers') || 'null'); if (Array.isArray(savedSuppliers) && savedSuppliers.length) patch({ adminSuppliers: savedSuppliers }); } catch (e) {}
    }
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
  const setGuestPanelMode = useCallback((mode) => patch({ guestPanelMode: mode, guestFormError: '', guestLoginError: '' }), [patch]);
  const setGuestLoginIdentifier = useCallback((e) => patch({ guestLoginIdentifier: e.target.value, guestLoginError: '' }), [patch]);

  // Returning guests: look up their email/phone among existing registrations
  // (signed up before, verified or not) and sign them straight in — no need
  // to fill out the registration form again.
  const loginAsGuest = useCallback(async () => {
    const identifier = state.guestLoginIdentifier.trim().toLowerCase();
    const lang = state.lang;
    if (!identifier) {
      patch({ guestLoginError: lang === 'ar' ? STRINGS.ar.login.guestFormError : STRINGS.en.login.guestFormError });
      return;
    }
    let match = null;
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/guest-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier }) });
        const data = await res.json();
        if (data && data.success && data.found) match = { email: data.email, phone: data.phone };
      } catch (e) {}
    } else {
      match = state.adminRegistrations.find((r) => (r.email && r.email.toLowerCase() === identifier) || (r.phone && r.phone.replace(/\s+/g, '') === identifier.replace(/\s+/g, ''))) || null;
    }
    if (!match) {
      patch({ guestLoginError: lang === 'ar' ? STRINGS.ar.login.guestLoginNotFound : STRINGS.en.login.guestLoginNotFound });
      return;
    }
    try { localStorage.setItem('nad_role', 'guest'); } catch (e) {}
    try { localStorage.setItem('nad_guest_identifier', match.email || match.phone || ''); } catch (e) {}
    const idx = STEP_KEYS.indexOf(state.loginIntent);
    patch((s) => ({
      role: 'guest', currentGuestIdentifier: match.email || match.phone || null,
      maxStepIndex: idx >= 0 ? Math.max(s.maxStepIndex, idx) : s.maxStepIndex,
      loginIntent: null, guestLoginIdentifier: '', guestLoginError: '',
    }));
    showToast(lang === 'ar' ? STRINGS.ar.login.guestWelcomeBack : STRINGS.en.login.guestWelcomeBack);
    navigate(state.loginIntent ? '/design/' + state.loginIntent : '/');
  }, [state.guestLoginIdentifier, state.lang, state.adminRegistrations, state.loginIntent, patch, navigate, showToast]);

  const registerGuest = useCallback(async () => {
    const email = state.guestEmail.trim();
    const phone = state.guestPhone.trim();
    if (!email && !phone) {
      patch({ guestFormError: state.lang === 'ar' ? STRINGS.ar.login.guestFormError : STRINGS.en.login.guestFormError });
      return;
    }
    let reg = { id: Date.now(), email, phone, registeredAt: new Date().toISOString().slice(0, 10), status: 'pending' };
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/admin-registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, phone }) });
        const data = await res.json();
        if (data && data.success && data.registration) reg = data.registration;
      } catch (e) {}
    }
    setState((s) => {
      const nextRegs = [...s.adminRegistrations, reg];
      if (!isSupabaseConfigured) { try { localStorage.setItem('nad_registrations', JSON.stringify(nextRegs)); } catch (e) {} }
      try { localStorage.setItem('nad_role', 'guest'); } catch (e) {}
      try { localStorage.setItem('nad_guest_identifier', email || phone || ''); } catch (e) {}
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
        ...s, adminRegistrations: nextRegs, role: 'guest', currentGuestIdentifier: email || phone || null,
        maxStepIndex: idx >= 0 ? Math.max(s.maxStepIndex, idx) : s.maxStepIndex,
        loginIntent: null, guestEmail: '', guestPhone: '', guestFormError: '',
      };
    });
  }, [state.guestEmail, state.guestPhone, state.lang, state.loginIntent, patch, navigate, showToast]);

  const loginAsAdmin = useCallback(async () => {
    const passcode = state.loginPasscode;
    const lang = state.lang;
    const loginIntent = state.loginIntent;
    try {
      const res = await fetch('/api/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }) });
      const data = await res.json();
      if (data && data.success) {
        try { localStorage.setItem('nad_role', 'admin'); } catch (e) {}
        if (isSupabaseConfigured) { try { await supabase.auth.signInAnonymously(); } catch (e) {} }
        patch({ role: 'admin', loginError: '', loginPasscode: '', loginIntent: null });
        navigate(loginIntent ? '/design/' + loginIntent : '/admin');
        return;
      }
    } catch (e) {}
    patch({ loginError: lang === 'ar' ? STRINGS.ar.login.error : STRINGS.en.login.error });
  }, [state.loginPasscode, state.lang, state.loginIntent, patch, navigate]);

  const logout = useCallback(() => {
    try { localStorage.removeItem('nad_role'); } catch (e) {}
    try { localStorage.removeItem('nad_guest_identifier'); } catch (e) {}
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    patch({ role: null, currentGuestIdentifier: null });
    navigate('/');
  }, [patch, navigate]);

  const goToAdmin = useCallback(() => navigate('/admin'), [navigate]);
  const setAdminTab = useCallback((key) => patch({ adminTab: key }), [patch]);
  const setRegistrationStatus = useCallback(async (id, status) => {
    if (isSupabaseConfigured) {
      try {
        const headers = { 'Content-Type': 'application/json', ...(await getAdminAuthHeaders()) };
        const res = await fetch('/api/admin-registrations', { method: 'PATCH', headers, body: JSON.stringify({ id, status }) });
        const data = await res.json();
        if (data && data.success) patch((s) => ({ adminRegistrations: s.adminRegistrations.map((r) => (r.id === id ? data.registration : r)) }));
      } catch (e) {}
      return;
    }
    patch((s) => {
      const next = s.adminRegistrations.map((r) => (r.id === id ? { ...r, status } : r));
      try { localStorage.setItem('nad_registrations', JSON.stringify(next)); } catch (e) {}
      return { adminRegistrations: next };
    });
  }, [patch]);
  const toggleRegistrationSuspended = useCallback(async (id) => {
    if (isSupabaseConfigured) {
      const current = state.adminRegistrations.find((r) => r.id === id);
      const suspended = !(current && current.suspended);
      try {
        const headers = { 'Content-Type': 'application/json', ...(await getAdminAuthHeaders()) };
        const res = await fetch('/api/admin-registrations', { method: 'PATCH', headers, body: JSON.stringify({ id, suspended }) });
        const data = await res.json();
        if (data && data.success) patch((s) => ({ adminRegistrations: s.adminRegistrations.map((r) => (r.id === id ? data.registration : r)) }));
      } catch (e) {}
      return;
    }
    patch((s) => {
      const next = s.adminRegistrations.map((r) => (r.id === id ? { ...r, suspended: !r.suspended } : r));
      try { localStorage.setItem('nad_registrations', JSON.stringify(next)); } catch (e) {}
      return { adminRegistrations: next };
    });
  }, [patch, state.adminRegistrations]);
  const removeDuplicateRegistrations = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const headers = { 'Content-Type': 'application/json', ...(await getAdminAuthHeaders()) };
        const res = await fetch('/api/admin-registrations', { method: 'POST', headers, body: JSON.stringify({ action: 'dedupe' }) });
        const data = await res.json();
        if (data && data.success) patch({ adminRegistrations: data.registrations });
      } catch (e) {}
      return;
    }
    patch((s) => {
      const bestByKey = new Map();
      const noKey = [];
      s.adminRegistrations.forEach((r) => {
        const key = (r.email || r.phone || '').trim().toLowerCase();
        if (!key) { noKey.push(r); return; }
        const score = (r.status === 'verified' ? 1 : 0) * 1e15 + new Date(r.registeredAt || 0).getTime();
        const existing = bestByKey.get(key);
        if (!existing || score > existing.score) bestByKey.set(key, { r, score });
      });
      const next = [...Array.from(bestByKey.values()).map((x) => x.r), ...noKey];
      try { localStorage.setItem('nad_registrations', JSON.stringify(next)); } catch (e) {}
      return { adminRegistrations: next };
    });
  }, [patch]);
  const loadRegistrations = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin-registrations', { headers });
      const data = await res.json();
      if (data && data.success) patch({ adminRegistrations: data.registrations || [] });
    } catch (e) {}
  }, [patch]);
  const loadGenerationCounts = useCallback(() => {
    fetch('/api/admin-generation-counts').then((r) => r.json()).then((data) => {
      if (data && data.success) patch({ generationCounts: data.counts || {} });
    }).catch(() => {});
  }, [patch]);
  const loadActivityStats = useCallback(() => {
    patch({ activityStatsStatus: 'loading' });
    fetch('/api/admin-activity-stats').then((r) => r.json()).then((data) => {
      if (data && data.success) patch({ activityStats: { monthly: data.monthly || [], yearly: data.yearly || [] }, activityStatsStatus: 'loaded' });
      else patch({ activityStatsStatus: 'error' });
    }).catch(() => patch({ activityStatsStatus: 'error' }));
  }, [patch]);
  const getLevelRangeFor = useCallback((key) => getLevelRange(key, state.priceOverrides), [state.priceOverrides]);
  const setPriceOverride = useCallback((key, field) => (e) => {
    const num = parseFloat(e.target.value);
    patch((s) => ({ priceOverrides: { ...s.priceOverrides, [key]: { ...s.priceOverrides[key], [field]: isNaN(num) ? undefined : num } } }));
  }, [patch]);

  const setNewSupplierName = useCallback((e) => patch({ newSupplierName: e.target.value }), [patch]);
  const setNewSupplierWebsite = useCallback((e) => patch({ newSupplierWebsite: e.target.value }), [patch]);
  const setNewSupplierEmail = useCallback((e) => patch({ newSupplierEmail: e.target.value }), [patch]);
  const setNewSupplierPhone = useCallback((e) => patch({ newSupplierPhone: e.target.value }), [patch]);
  const addSupplier = useCallback(async () => {
    const name = state.newSupplierName.trim();
    if (!name) return;
    if (isSupabaseConfigured) {
      try {
        const headers = { 'Content-Type': 'application/json', ...(await getAdminAuthHeaders()) };
        const res = await fetch('/api/admin-suppliers', { method: 'POST', headers, body: JSON.stringify({ name, website: state.newSupplierWebsite, email: state.newSupplierEmail, phone: state.newSupplierPhone }) });
        const data = await res.json();
        if (data && data.success) patch((s) => ({ adminSuppliers: [...s.adminSuppliers, data.supplier], newSupplierName: '', newSupplierWebsite: '', newSupplierEmail: '', newSupplierPhone: '' }));
      } catch (e) {}
      return;
    }
    patch((s) => {
      const slug = name.toLowerCase().replace(/[^a-z]+/g, '');
      const nextSuppliers = [...s.adminSuppliers, {
        id: s.adminSuppliers.reduce((m, x) => Math.max(m, x.id), 0) + 1, name,
        category: 'Furniture', delivery: '4-6 weeks',
        website: s.newSupplierWebsite.trim() || ('https://' + slug + '.sa'),
        email: s.newSupplierEmail.trim() || (slug + '@supplier.sa'),
        phone: s.newSupplierPhone.trim(),
        status: 'approved',
      }];
      try { localStorage.setItem('nad_suppliers', JSON.stringify(nextSuppliers)); } catch (e) {}
      return { adminSuppliers: nextSuppliers, newSupplierName: '', newSupplierWebsite: '', newSupplierEmail: '', newSupplierPhone: '' };
    });
  }, [patch, state.newSupplierName, state.newSupplierWebsite, state.newSupplierEmail, state.newSupplierPhone]);
  const toggleSupplierStatus = useCallback(async (id) => {
    if (isSupabaseConfigured) {
      const current = state.adminSuppliers.find((sup) => sup.id === id);
      const status = current && current.status === 'approved' ? 'hidden' : 'approved';
      try {
        const headers = { 'Content-Type': 'application/json', ...(await getAdminAuthHeaders()) };
        const res = await fetch('/api/admin-suppliers', { method: 'PATCH', headers, body: JSON.stringify({ id, status }) });
        const data = await res.json();
        if (data && data.success) patch((s) => ({ adminSuppliers: s.adminSuppliers.map((sup) => (sup.id === id ? data.supplier : sup)) }));
      } catch (e) {}
      return;
    }
    patch((s) => {
      const next = s.adminSuppliers.map((sup) => (sup.id === id ? { ...sup, status: sup.status === 'approved' ? 'hidden' : 'approved' } : sup));
      try { localStorage.setItem('nad_suppliers', JSON.stringify(next)); } catch (e) {}
      return { adminSuppliers: next };
    });
  }, [patch, state.adminSuppliers]);
  const removeSupplier = useCallback(async (id) => {
    if (isSupabaseConfigured) {
      try {
        const headers = { 'Content-Type': 'application/json', ...(await getAdminAuthHeaders()) };
        await fetch('/api/admin-suppliers', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
      } catch (e) {}
      patch((s) => ({ adminSuppliers: s.adminSuppliers.filter((sup) => sup.id !== id) }));
      return;
    }
    patch((s) => {
      const next = s.adminSuppliers.filter((sup) => sup.id !== id);
      try { localStorage.setItem('nad_suppliers', JSON.stringify(next)); } catch (e) {}
      return { adminSuppliers: next };
    });
  }, [patch]);
  const updateSupplierField = useCallback((id, field, value) => {
    patch((s) => {
      const next = s.adminSuppliers.map((sup) => (sup.id === id ? { ...sup, [field]: value } : sup));
      if (!isSupabaseConfigured) { try { localStorage.setItem('nad_suppliers', JSON.stringify(next)); } catch (e) {} }
      return { adminSuppliers: next };
    });
    if (isSupabaseConfigured) {
      getAdminAuthHeaders().then((extra) => fetch('/api/admin-suppliers', { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...extra }, body: JSON.stringify({ id, field, value }) })).catch(() => {});
    }
  }, [patch]);
  const loadSuppliers = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin-suppliers', { headers });
      const data = await res.json();
      if (data && data.success) patch({ adminSuppliers: data.suppliers || [] });
    } catch (e) {}
  }, [patch]);

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
      guestIdentifier: state.role === 'guest' ? state.currentGuestIdentifier : null,
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

  const loadProjectTypes = useCallback(async () => {
    patch({ projectTypesStatus: 'loading', projectTypesError: null });
    const result = await projectTypesService.getProjectTypes();
    if (result.ok) {
      patch({ projectTypesRemote: result.data, projectTypesStatus: 'loaded', projectTypesError: null });
    } else {
      patch({ projectTypesStatus: 'error', projectTypesError: result.error || 'Could not load project types.' });
    }
  }, [patch]);

  const openProjectTypeEditor = useCallback((row) => patch({ editingProjectType: row, projectTypeSaveError: null, projectTypeSaveSuccess: false }), [patch]);
  const closeProjectTypeEditor = useCallback(() => {
    if (state.projectTypeSaving) return;
    patch({ editingProjectType: null, projectTypeSaveError: null, projectTypeSaveSuccess: false });
  }, [patch, state.projectTypeSaving]);

  // Quick admin action from the card grid itself: swap only the image and
  // save immediately (no name/description/order editing) — distinct from
  // the full edit modal, so admins get a one-click "change photo, publish
  // now" path right on "Start Your Design".
  const quickSaveProjectTypeImage = useCallback(async (row, imageFile) => {
    if (!row || !imageFile) return { ok: false };
    patch({ projectTypeSaving: true, projectTypeSaveError: null });

    if (isSupabaseConfigured) {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        patch({ projectTypeSaving: false, projectTypeSaveError: 'You do not have permission to modify this content.' });
        showToast(state.lang === 'ar' ? 'ليست لديك صلاحية لتعديل هذا المحتوى.' : 'You do not have permission to modify this content.');
        return { ok: false };
      }
    }

    const result = await projectTypesService.saveProjectTypeEdit(
      row.id,
      { name: row.name, description: row.description, sort_order: row.sort_order, is_active: row.is_active },
      imageFile
    );
    if (!result.ok) {
      patch({ projectTypeSaving: false, projectTypeSaveError: result.error || null });
      showToast(result.error || (state.lang === 'ar' ? 'تعذّر حفظ الصورة.' : 'Could not save the image.'));
      return result;
    }

    await loadProjectTypes();
    patch({ projectTypeSaving: false });
    showToast(state.lang === 'ar' ? 'تم تحديث الصورة ونشرها على الموقع.' : 'Image updated — now live on the site.');
    return result;
  }, [patch, loadProjectTypes, showToast, state.lang]);

  const saveProjectTypeEditFn = useCallback(async (id, fields, imageFile) => {
    patch({ projectTypeSaving: true, projectTypeSaveError: null, projectTypeSaveSuccess: false });

    if (isSupabaseConfigured) {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        patch({ projectTypeSaving: false, projectTypeSaveError: 'You do not have permission to modify this content.' });
        return { ok: false };
      }
    }

    const result = await projectTypesService.saveProjectTypeEdit(id, fields, imageFile);
    if (!result.ok) {
      patch({ projectTypeSaving: false, projectTypeSaveError: result.error || 'Something went wrong saving your changes. Please try again.' });
      return result;
    }

    await loadProjectTypes();
    patch({ projectTypeSaving: false, projectTypeSaveSuccess: true });
    setTimeout(() => patch((s) => (s.editingProjectType ? { editingProjectType: null, projectTypeSaveSuccess: false } : {})), 900);
    return result;
  }, [patch, loadProjectTypes]);

  const loadFurnitureItems = useCallback(async () => {
    patch({ furnitureStatus: 'loading', furnitureError: null });
    const result = await furnitureService.getFurnitureItems();
    if (result.ok) patch({ furnitureRemote: result.data, furnitureStatus: 'loaded', furnitureError: null });
    else patch({ furnitureStatus: 'error', furnitureError: result.error || 'Could not load furniture items.' });
  }, [patch]);

  const openFurnitureEditor = useCallback((row) => patch({ editingFurnitureItem: row, furnitureItemIsNew: false, furnitureSaveError: null, furnitureSaveSuccess: false }), [patch]);
  const openNewFurnitureItem = useCallback((categoryKey) => patch({
    editingFurnitureItem: { category: categoryKey, name: '', code: '', supplier: '', price: 0, dims: '', wood_finish: '', fabric: '', metal: '', availability: 'inStock', is_active: true, sort_order: 0 },
    furnitureItemIsNew: true, furnitureSaveError: null, furnitureSaveSuccess: false,
  }), [patch]);
  const closeFurnitureEditor = useCallback(() => {
    if (state.furnitureSaving) return;
    patch({ editingFurnitureItem: null, furnitureSaveError: null, furnitureSaveSuccess: false });
  }, [patch, state.furnitureSaving]);

  const saveFurnitureItemEdit = useCallback(async (id, fields, imageFile, isNew) => {
    patch({ furnitureSaving: true, furnitureSaveError: null, furnitureSaveSuccess: false });
    if (isSupabaseConfigured) {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        patch({ furnitureSaving: false, furnitureSaveError: 'You do not have permission to modify this content.' });
        return { ok: false };
      }
    }
    const result = await furnitureService.saveFurnitureEdit(id, fields, imageFile, isNew);
    if (!result.ok) {
      patch({ furnitureSaving: false, furnitureSaveError: result.error || 'Something went wrong saving your changes. Please try again.' });
      return result;
    }
    await loadFurnitureItems();
    patch({ furnitureSaving: false, furnitureSaveSuccess: true });
    setTimeout(() => patch((s) => (s.editingFurnitureItem ? { editingFurnitureItem: null, furnitureSaveSuccess: false } : {})), 900);
    return result;
  }, [patch, loadFurnitureItems]);

  const deleteFurnitureItemFn = useCallback(async (row) => {
    if (!row || !row.id) return { ok: false };
    patch({ furnitureSaving: true, furnitureSaveError: null });
    if (isSupabaseConfigured) {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        patch({ furnitureSaving: false, furnitureSaveError: 'You do not have permission to modify this content.' });
        return { ok: false };
      }
    }
    const result = await furnitureService.deleteFurnitureItem(row.id, row.image_path);
    if (!result.ok) {
      patch({ furnitureSaving: false, furnitureSaveError: result.error || 'Could not delete this item.' });
      return result;
    }
    await loadFurnitureItems();
    patch({ furnitureSaving: false, editingFurnitureItem: null });
    return result;
  }, [patch, loadFurnitureItems]);

  const quickSaveFurnitureImage = useCallback(async (row, imageFile) => {
    if (!row || !imageFile) return { ok: false };
    patch({ furnitureSaving: true, furnitureSaveError: null });
    if (isSupabaseConfigured) {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        patch({ furnitureSaving: false, furnitureSaveError: 'You do not have permission to modify this content.' });
        showToast(state.lang === 'ar' ? 'ليست لديك صلاحية لتعديل هذا المحتوى.' : 'You do not have permission to modify this content.');
        return { ok: false };
      }
    }
    const result = await furnitureService.saveFurnitureEdit(row.id, {}, imageFile, false);
    if (!result.ok) {
      patch({ furnitureSaving: false, furnitureSaveError: result.error || null });
      showToast(result.error || (state.lang === 'ar' ? 'تعذّر حفظ الصورة.' : 'Could not save the image.'));
      return result;
    }
    await loadFurnitureItems();
    patch({ furnitureSaving: false });
    showToast(state.lang === 'ar' ? 'تم تحديث الصورة ونشرها على الموقع.' : 'Image updated — now live on the site.');
    return result;
  }, [patch, loadFurnitureItems, showToast, state.lang]);

  const seedFurnitureCatalog = useCallback(async () => {
    patch({ furnitureSaving: true, furnitureSaveError: null });
    if (isSupabaseConfigured) {
      const { data: { session } = {} } = await supabase.auth.getSession();
      if (!session) {
        patch({ furnitureSaving: false, furnitureSaveError: 'You do not have permission to modify this content.' });
        return { ok: false };
      }
    }
    const result = await furnitureService.seedFurnitureItems(FURNITURE_ITEMS);
    if (!result.ok) {
      patch({ furnitureSaving: false, furnitureSaveError: result.error || 'Could not import the catalogue.' });
      return result;
    }
    await loadFurnitureItems();
    patch({ furnitureSaving: false });
    showToast(state.lang === 'ar' ? 'تم استيراد الكتالوج — يمكنك الآن تعديله وحذف عناصره.' : 'Catalogue imported — you can now edit and delete items.');
    return result;
  }, [patch, loadFurnitureItems, showToast, state.lang]);

  const value = {
    state, patch, showToast,
    toggleTheme, handleAdminImageChange,
    goToLogin, setLoginPasscode, setGuestEmail, setGuestPhone, registerGuest, loginAsAdmin, logout,
    setGuestPanelMode, setGuestLoginIdentifier, loginAsGuest,
    goToAdmin, setAdminTab, setRegistrationStatus, toggleRegistrationSuspended, removeDuplicateRegistrations, loadGenerationCounts, loadActivityStats, loadRegistrations, loadSuppliers,
    getLevelRangeFor, setPriceOverride,
    setNewSupplierName, setNewSupplierWebsite, setNewSupplierEmail, setNewSupplierPhone, addSupplier, toggleSupplierStatus, removeSupplier, updateSupplierField,
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
    loadProjectTypes, openProjectTypeEditor, closeProjectTypeEditor, saveProjectTypeEdit: saveProjectTypeEditFn, quickSaveProjectTypeImage,
    loadFurnitureItems, openFurnitureEditor, openNewFurnitureItem, closeFurnitureEditor, saveFurnitureItemEdit, deleteFurnitureItemFn, quickSaveFurnitureImage, seedFurnitureCatalog,
    computeCost: () => computeCost(state.selections, state.priceOverrides),
    computeWarnings: () => computeWarnings(state.selections, state.lang),
    getRemainingGenerations,
  };

  return React.createElement(AppStateContext.Provider, { value }, children);
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within <AppStateProvider>');
  return ctx;
}
