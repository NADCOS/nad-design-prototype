import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppStateProvider, useAppState } from './hooks/useAppState.js';
import { STEP_KEYS } from './data/navigation.js';
import Header from './components/Header.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Toast from './components/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import DesignJourneyLayout from './pages/DesignJourneyLayout.jsx';
import TypePage from './pages/TypePage.jsx';
import LevelPage from './pages/LevelPage.jsx';
import StylePage from './pages/StylePage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import FurniturePage from './pages/FurniturePage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import SummaryPage from './pages/SummaryPage.jsx';
import GeneratePage from './pages/GeneratePage.jsx';
import SharePage from './pages/SharePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function Shell() {
  const { state } = useAppState();
  const lang = state.lang;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const headFont = lang === 'ar' ? "'Noto Kufi Arabic', sans-serif" : "'Century Gothic', 'Futura', sans-serif";
  const isDark = state.theme === 'dark';
  const themeVars = isDark
    ? { '--bg': 'oklch(16% 0.02 50)', '--nav-bg': 'oklch(16% 0.02 50 / 0.9)', '--surface': 'oklch(22% 0.015 50)', '--text': 'oklch(92% 0.01 80)', '--text-2': 'oklch(70% 0.02 70)', '--border': 'oklch(32% 0.02 55)', '--btn-bg': '#C4A05A', '--btn-text': '#2a2013', '--glass-bg': 'rgba(28, 24, 18, 0.94)', '--glass-border': 'rgba(200, 190, 170, 0.28)' }
    : { '--bg': 'oklch(97% 0.015 80)', '--nav-bg': 'oklch(97% 0.015 80 / 0.9)', '--surface': '#fff', '--text': 'oklch(24% 0.02 55)', '--text-2': 'oklch(46% 0.02 55)', '--border': 'oklch(87% 0.02 70)', '--btn-bg': '#1B6045', '--btn-text': '#ffffff', '--glass-bg': 'rgba(255, 255, 255, 0.94)', '--glass-border': 'rgba(255, 255, 255, 0.6)' };
  const rootStyle = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: headFont, '--head-font': headFont, ...themeVars };

  // Block image download (right-click save / drag-to-save) everywhere EXCEPT
  // inside a [data-allow-download] container (the AI-generated result).
  useEffect(() => {
    const isAllowed = (t) => t && t.closest && t.closest('[data-allow-download]');
    const onContextMenu = (e) => {
      if (e.target && e.target.tagName === 'IMG' && !isAllowed(e.target)) e.preventDefault();
    };
    const onDragStart = (e) => {
      if (e.target && e.target.tagName === 'IMG' && !isAllowed(e.target)) e.preventDefault();
    };
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, []);

  return (
    <div dir={dir} data-theme={state.theme} style={rootStyle}>
      <Header headFont={headFont} />
      <Routes>
        <Route path="/" element={<HomePage headFont={headFont} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {STEP_KEYS.map((step) => (
          <Route key={step} path={'/design/' + step} element={<DesignJourneyLayout step={step}>{stepPage(step, headFont)}</DesignJourneyLayout>} />
        ))}
        <Route path="/design" element={<Navigate to="/design/type" replace />} />
        <Route path="/s/:token" element={<SharePage />} />
        <Route path="/contact" element={<ContactPage headFont={headFont} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <WhatsAppButton />
      <Toast />
    </div>
  );
}

function stepPage(step, headFont) {
  switch (step) {
    case 'type': return <TypePage />;
    case 'level': return <LevelPage headFont={headFont} />;
    case 'style': return <StylePage headFont={headFont} />;
    case 'materials': return <MaterialsPage />;
    case 'furniture': return <FurniturePage headFont={headFont} />;
    case 'upload': return <UploadPage />;
    case 'summary': return <SummaryPage />;
    case 'generate': return <GeneratePage />;
    default: return null;
  }
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
