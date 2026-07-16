import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { DESIGN_LEVELS } from '../data/designLevels.js';
import { sx } from '../utils/sx.js';

const inputSm = 'padding:12px 14px;border-radius:10px;border:1px solid oklch(75% 0.02 70);background:var(--surface);font-size:14px;color:var(--text);width:100%;box-sizing:border-box;';

export default function AdminPage() {
  const navigate = useNavigate();
  const {
    state, setAdminTab, setNewSupplierName, setNewSupplierWebsite, setNewSupplierEmail, setNewSupplierPhone,
    addSupplier, toggleSupplierStatus, removeSupplier, updateSupplierField,
    getLevelRangeFor, setPriceOverride, setConsultationStatus, removeConsultation, removeClient, setRegistrationStatus,
    toggleRegistrationSuspended, removeDuplicateRegistrations, loadGenerationCounts,
  } = useAppState();
  const T = STRINGS[state.lang];
  const isAdmin = state.role === 'admin';

  useEffect(() => { if (!isAdmin) navigate('/login?intent=admin', { replace: true }); }, [isAdmin, navigate]);
  useEffect(() => { if (isAdmin) loadGenerationCounts(); }, [isAdmin, loadGenerationCounts]);
  if (!isAdmin) return null;

  const tabs = ['overview', 'suppliers', 'pricing', 'consultations', 'clients', 'registrations'];
  const registrationsSorted = [...state.adminRegistrations].reverse();

  return (
    <main data-screen-label="Admin Dashboard" className="nad-page" style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 28px 80px' }}>
      <h1 style={{ fontFamily: 'var(--head-font)', fontSize: 30, color: 'var(--text)', margin: '0 0 6px', fontWeight: 500 }}>{T.admin.title}</h1>
      <p style={{ fontSize: 14.5, color: 'var(--text-2)', margin: '0 0 26px' }}>{T.admin.sub}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 26 }} role="tablist">
        {tabs.map((key) => {
          const active = state.adminTab === key;
          const tabStyle = 'padding:10px 18px;border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:' + (active ? 'var(--btn-bg)' : 'transparent') + ';color:' + (active ? 'var(--btn-text)' : 'oklch(35% 0.02 55)') + ';border:1px solid ' + (active ? 'var(--btn-bg)' : 'var(--border)') + ';';
          return <div key={key} onClick={() => setAdminTab(key)} style={sx(tabStyle)} role="tab" aria-selected={active} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setAdminTab(key)}>{T.admin.tabs[key]}</div>;
        })}
      </div>

      {state.adminTab === 'overview' && (
        <div className="nad-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { label: T.admin.overview.suppliers, value: state.adminSuppliers.filter((x) => x.status === 'approved').length },
            { label: T.admin.overview.consultations, value: state.adminConsultations.filter((c) => c.status === 'pending').length },
            { label: T.admin.overview.clients, value: state.adminClients.length },
            { label: T.admin.overview.pendingRegistrations, value: state.adminRegistrations.filter((r) => r.status === 'pending').length },
            { label: T.admin.overview.projects, value: Math.max(1, state.maxStepIndex) },
          ].map((ov, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
              <div style={{ fontFamily: 'var(--head-font)', fontSize: 32, color: 'var(--text)' }}>{ov.value}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6 }}>{ov.label}</div>
            </div>
          ))}
        </div>
      )}

      {state.adminTab === 'suppliers' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={state.newSupplierName} onChange={setNewSupplierName} placeholder={T.admin.suppliers.addPlaceholder} style={{ ...sx(inputSm), flex: '1 1 180px' }} aria-label={T.admin.suppliers.addPlaceholder} />
            <input value={state.newSupplierWebsite} onChange={setNewSupplierWebsite} placeholder={T.admin.suppliers.websitePlaceholder} style={{ ...sx(inputSm), flex: '1 1 180px' }} aria-label={T.admin.suppliers.websitePlaceholder} />
            <input value={state.newSupplierEmail} onChange={setNewSupplierEmail} placeholder={T.admin.suppliers.emailPlaceholder} style={{ ...sx(inputSm), flex: '1 1 180px' }} aria-label={T.admin.suppliers.emailPlaceholder} />
            <input value={state.newSupplierPhone} onChange={setNewSupplierPhone} placeholder={T.admin.suppliers.phonePlaceholder} style={{ ...sx(inputSm), flex: '1 1 160px' }} aria-label={T.admin.suppliers.phonePlaceholder} />
            <button type="button" style={{ padding: '12px 22px', borderRadius: 100, border: 'none', background: 'var(--btn-bg)', color: 'var(--btn-text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={addSupplier}>{T.admin.suppliers.add}</button>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
            {state.adminSuppliers.map((sup) => {
              const statusStyle = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;background:' + (sup.status === 'approved' ? 'oklch(90% 0.06 145)' : 'var(--border)') + ';color:' + (sup.status === 'approved' ? 'oklch(35% 0.08 145)' : 'oklch(45% 0.02 55)') + ';';
              const siteHref = sup.website && (/^https?:\/\//i.test(sup.website) ? sup.website : 'https://' + sup.website);
              const cellField = (field, extra) => 'font-size:12px;color:var(--text-2);background:transparent;border:none;border-bottom:1px dashed var(--border);padding:2px 0;width:100%;min-width:0;box-sizing:border-box;' + (extra || '');
              const linkStyle = { fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' };
              return (
                <div key={sup.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.7fr auto auto auto', minWidth: 860, gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <input value={sup.name} onChange={(e) => updateSupplierField(sup.id, 'name', e.target.value)} style={sx(cellField('name', 'font-weight:600;color:var(--text);font-size:13.5px;'))} aria-label={T.admin.suppliers.name} />
                  <input value={sup.category} onChange={(e) => updateSupplierField(sup.id, 'category', e.target.value)} style={sx(cellField('category', 'font-size:12.5px;'))} aria-label={T.admin.suppliers.category} />
                  <input value={sup.delivery} onChange={(e) => updateSupplierField(sup.id, 'delivery', e.target.value)} style={sx(cellField('delivery', 'font-size:12.5px;'))} aria-label={T.admin.suppliers.delivery} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {siteHref && <a href={siteHref} target="_blank" rel="noreferrer noopener" style={linkStyle}>{T.admin.suppliers.linkLabel}</a>}
                      <input value={sup.website} onChange={(e) => updateSupplierField(sup.id, 'website', e.target.value)} placeholder={T.admin.suppliers.websitePlaceholder} style={sx(cellField('website'))} aria-label={T.admin.suppliers.websitePlaceholder} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {sup.email && <a href={'mailto:' + sup.email} style={linkStyle}>{T.admin.suppliers.emailLabel}</a>}
                      <input value={sup.email} onChange={(e) => updateSupplierField(sup.id, 'email', e.target.value)} placeholder={T.admin.suppliers.emailPlaceholder} style={sx(cellField('email'))} aria-label={T.admin.suppliers.emailPlaceholder} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {sup.phone && <a href={'tel:' + sup.phone.replace(/[^\d+]/g, '')} style={linkStyle}>{T.admin.suppliers.callLabel}</a>}
                      <input value={sup.phone} onChange={(e) => updateSupplierField(sup.id, 'phone', e.target.value)} placeholder={T.admin.suppliers.phonePlaceholder} style={sx(cellField('phone'))} aria-label={T.admin.suppliers.phonePlaceholder} />
                    </div>
                  </div>
                  <span style={sx(statusStyle)}>{sup.status === 'approved' ? T.admin.suppliers.approved : T.admin.suppliers.hidden}</span>
                  <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => toggleSupplierStatus(sup.id)}>{sup.status === 'approved' ? T.admin.suppliers.hide : T.admin.suppliers.show}</button>
                  <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'oklch(50% 0.12 30)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => removeSupplier(sup.id)}>{T.admin.suppliers.remove}</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {state.adminTab === 'pricing' && (
        <>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 16 }}>{T.admin.pricing.note}</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', minWidth: 420, gap: 14, padding: '12px 18px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>
              <span>{T.admin.pricing.level}</span><span>{T.admin.pricing.min}</span><span>{T.admin.pricing.max}</span>
            </div>
            {DESIGN_LEVELS.map((lv) => {
              const range = getLevelRangeFor(lv.key);
              return (
                <div key={lv.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', minWidth: 420, gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{lv[state.lang]}</div>
                  <input type="number" value={range.priceMin} onChange={setPriceOverride(lv.key, 'priceMin')} style={sx(inputSm)} aria-label={lv[state.lang] + ' ' + T.admin.pricing.min} />
                  <input type="number" value={range.priceMax} onChange={setPriceOverride(lv.key, 'priceMax')} style={sx(inputSm)} aria-label={lv[state.lang] + ' ' + T.admin.pricing.max} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {state.adminTab === 'consultations' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
          {state.adminConsultations.map((cn) => {
            const statusStyle = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;background:' + (cn.status === 'pending' ? 'oklch(92% 0.05 80)' : cn.status === 'confirmed' ? 'oklch(90% 0.05 230)' : 'oklch(90% 0.06 145)') + ';color:' + (cn.status === 'pending' ? 'oklch(45% 0.08 70)' : cn.status === 'confirmed' ? 'oklch(40% 0.08 230)' : 'oklch(35% 0.08 145)') + ';';
            return (
              <div key={cn.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr auto auto auto', minWidth: 720, gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{cn.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{cn.type === 'online' ? T.admin.consultations.online : T.admin.consultations.inPerson}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{cn.date}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{cn.project}</div>
                <span style={sx(statusStyle)}>{T.admin.consultations[cn.status]}</span>
                {cn.status === 'pending' && <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => setConsultationStatus(cn.id, 'confirmed')}>{T.admin.consultations.confirm}</button>}
                {cn.status === 'confirmed' && <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => setConsultationStatus(cn.id, 'completed')}>{T.admin.consultations.complete}</button>}
                <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'oklch(50% 0.12 30)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => removeConsultation(cn.id)}>{T.admin.consultations.remove}</button>
              </div>
            );
          })}
        </div>
      )}

      {state.adminTab === 'clients' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
          {state.adminClients.map((cl) => (
            <div key={cl.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr auto 1fr auto', minWidth: 600, gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{cl.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', fontFamily: 'ui-monospace,monospace' }}>{cl.email}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{cl.projects}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{cl.lastActive}</div>
              <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'oklch(50% 0.12 30)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => removeClient(cl.id)}>{T.admin.clients.remove}</button>
            </div>
          ))}
        </div>
      )}

      {state.adminTab === 'registrations' && (
        <>
          {registrationsSorted.length === 0 && <div style={{ fontSize: 13.5, color: 'var(--text-2)', padding: '20px 0' }}>{T.admin.registrations.empty}</div>}
          {registrationsSorted.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button type="button" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'transparent', border: '1px solid var(--border)', borderRadius: 100, padding: '9px 18px' }} onClick={removeDuplicateRegistrations}>{T.admin.registrations.removeDuplicates}</button>
            </div>
          )}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflowX: 'auto' }}>
            {registrationsSorted.map((rg) => {
              const statusStyle = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;background:' + (rg.suspended ? 'oklch(90% 0.10 30)' : rg.status === 'verified' ? 'oklch(90% 0.06 145)' : 'oklch(92% 0.05 80)') + ';color:' + (rg.suspended ? 'oklch(38% 0.14 30)' : rg.status === 'verified' ? 'oklch(35% 0.08 145)' : 'oklch(45% 0.08 70)') + ';';
              const genCount = state.generationCounts[((rg.email || rg.phone || '').trim().toLowerCase())] || 0;
              return (
                <div key={rg.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 1fr auto auto auto', minWidth: 700, gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'ui-monospace,monospace' }}>{rg.email || '\u2014'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'ui-monospace,monospace' }}>{rg.phone || '\u2014'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{rg.registeredAt}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{T.admin.registrations.generations}: <strong style={{ color: 'var(--text)' }}>{genCount}</strong></div>
                  <span style={sx(statusStyle)}>{rg.suspended ? T.admin.registrations.suspended : rg.status === 'verified' ? T.admin.registrations.verified : T.admin.registrations.pending}</span>
                  <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {!rg.suspended && rg.status !== 'verified' && <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'oklch(35% 0.08 145)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => setRegistrationStatus(rg.id, 'verified')}>{T.admin.registrations.verify}</button>}
                    {!rg.suspended && rg.status === 'verified' && <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => setRegistrationStatus(rg.id, 'pending')}>{T.admin.registrations.markPending}</button>}
                    <button type="button" style={{ fontSize: 12, fontWeight: 600, color: 'oklch(50% 0.12 30)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', padding: 0 }} onClick={() => toggleRegistrationSuspended(rg.id)}>{rg.suspended ? T.admin.registrations.unsuspend : T.admin.registrations.suspend}</button>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
