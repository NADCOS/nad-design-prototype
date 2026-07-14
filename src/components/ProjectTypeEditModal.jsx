import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import Hoverable from './Hoverable.jsx';
import { sx } from '../utils/sx.js';

const inputStyle = 'width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid oklch(75% 0.02 70);background:var(--surface);font-size:13.5px;color:var(--text);';

// Admin edit modal for a single Supabase-backed project_types row: name,
// description, image, display order, and active status. The image preview
// shown here is a local, temporary object URL only — the permanent image
// isn't saved until "Save Changes" succeeds against Supabase.
export default function ProjectTypeEditModal() {
  const { state, closeProjectTypeEditor, saveProjectTypeEdit } = useAppState();
  const row = state.editingProjectType;
  const T = STRINGS[state.lang];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const objectUrlRef = useRef('');

  useEffect(() => {
    if (!row) return;
    setName(row.name || '');
    setDescription(row.description || '');
    setSortOrder(Number.isFinite(row.sort_order) ? row.sort_order : 0);
    setIsActive(row.is_active !== false);
    setImageFile(null);
    setLocalError('');
    setPreviewUrl('');
  }, [row]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  if (!row) return null;

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_BYTES = 7 * 1024 * 1024;

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('Images must be 7MB or smaller.');
      return;
    }
    setLocalError('');
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageFile(file);
    setPreviewUrl(url);
  }

  async function handleSave() {
    setLocalError('');
    await saveProjectTypeEdit(row.id, { name, description, sort_order: Number(sortOrder) || 0, is_active: isActive }, imageFile);
  }

  function handleCancel() {
    if (state.projectTypeSaving) return;
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = ''; }
    closeProjectTypeEditor();
  }

  const displayImage = previewUrl || row.imageUrl || '';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 50 / 0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleCancel} role="dialog" aria-modal="true" aria-label={'Edit ' + (row.name || 'project type')}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 18, padding: 30, maxWidth: 460, width: '90%', maxHeight: '88vh', overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--head-font)', fontSize: 20, color: 'var(--text)', marginBottom: 18 }}>Edit Project Type</div>

        <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: 'oklch(90% 0.02 75)', marginBottom: 16 }}>
          {displayImage ? (
            <img src={displayImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-2)', textAlign: 'center', padding: 10, background: 'repeating-linear-gradient(135deg, oklch(92% 0.015 78) 0px, oklch(92% 0.015 78) 10px, oklch(87% 0.02 72) 10px, oklch(87% 0.02 72) 20px)' }}>
              No image yet
            </div>
          )}
          <label style={{ position: 'absolute', top: 8, left: 8, background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
            {T.common.edit}
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} aria-label="Upload project type image" />
          </label>
        </div>

        <label htmlFor="pt-name" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Name</label>
        <input id="pt-name" value={name} onChange={(e) => setName(e.target.value)} style={{ ...sx(inputStyle), marginBottom: 14 }} />

        <label htmlFor="pt-desc" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Description</label>
        <textarea id="pt-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...sx(inputStyle), marginBottom: 14, resize: 'vertical' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label htmlFor="pt-order" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Display order</label>
            <input id="pt-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={sx(inputStyle)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active (visible to clients)
            </label>
          </div>
        </div>

        {(localError || state.projectTypeSaveError) && (
          <div role="alert" style={{ fontSize: 12.5, color: 'oklch(48% 0.14 30)', marginBottom: 14 }}>{localError || state.projectTypeSaveError}</div>
        )}
        {state.projectTypeSaving && (
          <div role="status" aria-live="polite" style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>Saving changes…</div>
        )}
        {state.projectTypeSaveSuccess && (
          <div role="status" style={{ fontSize: 12.5, color: 'oklch(40% 0.1 145)', marginBottom: 14 }}>Saved successfully.</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Hoverable as="button" type="button" style="font-size:14px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 20px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={handleCancel} disabled={state.projectTypeSaving}>Cancel</Hoverable>
          <Hoverable
            as="button" type="button" disabled={state.projectTypeSaving}
            style={'font-size:14px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:13px 20px;border-radius:100px;cursor:' + (state.projectTypeSaving ? 'not-allowed' : 'pointer') + ';opacity:' + (state.projectTypeSaving ? '0.7' : '1') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;'}
            hoverStyle={state.projectTypeSaving ? '' : 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);'}
            onClick={handleSave}
          >
            {state.projectTypeSaving ? 'Saving…' : 'Save Changes'}
          </Hoverable>
        </div>
      </div>
    </div>
  );
}
