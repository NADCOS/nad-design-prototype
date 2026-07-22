import React, { useEffect } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { SOCIAL_META, SOCIAL_ICON } from '../data/contact.js';

export default function ContactPage({ headFont }) {
  const { state, loadSiteData } = useAppState();
  const T = STRINGS[state.lang];
  const C = state.contactInfo || {};
  const lang = state.lang;

  useEffect(() => { loadSiteData(false); }, [loadSiteData]);

  const waDigits = (C.whatsapp || '').replace(/[^\d]/g, '');
  const details = [
    C.email && { label: T.contactPage.emailLabel, value: C.email, href: 'mailto:' + C.email },
    C.phone && { label: T.contactPage.phoneLabel, value: C.phone, href: 'tel:' + C.phone.replace(/[^\d+]/g, '') },
    C.address && { label: T.contactPage.addressLabel, value: C.address, href: null },
    C.hours && { label: T.contactPage.hoursLabel, value: C.hours, href: null },
  ].filter(Boolean);

  const activeSocials = SOCIAL_META.filter((m) => (C.socials && C.socials[m.key] || '').trim());

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 30 };
  const label = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 6 };
  const linkStyle = { fontSize: 18, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', wordBreak: 'break-word' };

  return (
    <main data-screen-label="Contact" className="nad-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 28px 96px' }}>
      <div style={{ maxWidth: 620, marginBottom: 40 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent, oklch(58% 0.09 65))', marginBottom: 12 }}>{T.contactPage.kicker}</div>
        <h1 style={{ fontFamily: headFont || 'var(--head-font)', fontSize: 40, lineHeight: 1.08, color: 'var(--text)', margin: '0 0 14px', fontWeight: 500 }}>{T.contactPage.title}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-2)', margin: 0, textWrap: 'pretty' }}>{T.contactPage.sub}</p>
      </div>

      <div className="nad-contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 34 }}>
        {details.map((d, i) => (
          <div key={i} style={card}>
            <div style={label}>{d.label}</div>
            {d.href
              ? <a href={d.href} style={linkStyle}>{d.value}</a>
              : <div style={{ ...linkStyle }}>{d.value}</div>}
          </div>
        ))}
      </div>

      {waDigits && (
        <a href={'https://wa.me/' + waDigits} target="_blank" rel="noreferrer noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15.5, fontWeight: 650, color: 'var(--btn-text)', background: 'linear-gradient(180deg, color-mix(in oklch, var(--btn-bg) 88%, white), var(--btn-bg))', border: 'none', padding: '15px 30px', borderRadius: 100, textDecoration: 'none', boxShadow: 'inset 0 1px 0 oklch(100% 0 0 / 0.18), 0 6px 16px -8px oklch(20% 0.02 50 / 0.45)', marginBottom: 46 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12 0a12 12 0 0 0-10.3 18.1L0 24l6.05-1.58A12 12 0 1 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.75.98 1-3.66-.24-.37A9.9 9.9 0 1 1 12 21.9z"/></svg>
          {T.contactPage.whatsappCta}
        </a>
      )}

      {activeSocials.length > 0 && (
        <div>
          <div style={{ ...label, marginBottom: 16 }}>{T.contactPage.follow}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {activeSocials.map((m) => (
              <a key={m.key} href={C.socials[m.key]} target="_blank" rel="noreferrer noopener" aria-label={m.label} title={m.label} style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', transition: 'transform .18s ease, background .18s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--surface)'; }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d={SOCIAL_ICON[m.key]} /></svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
