import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../hooks/useAppState.js';
import { STRINGS } from '../data/translations.js';
import { FURNITURE_CATEGORIES, WOOD_FINISH_OPTS, FABRIC_OPTS, METAL_OPTS } from '../data/furniture.js';
import Hoverable from './Hoverable.jsx';
import { sx } from '../utils/sx.js';

const inputStyle = 'width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid oklch(75% 0.02 70);background:var(--surface);font-size:13.5px;color:var(--text);';
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 };

// Admin edit modal for a single furniture_items row: name, code, supplier,
// price, dimensions, category, availability, finish options, image, and
// active status. Works for both editing an existing item and creating a new
// one (state.furnitureItemIsNew). The image preview shown here is a local,
// temporary object URL — the permanent image isn't saved until "Save" succeeds.
export default function FurnitureEditModal() {
  const { state, closeFurnitureEditor, saveFurnitureItemEdit, deleteFurnitureItemFn } = useAppState();
  const row = state.editingFurnitureItem;
  const isNew = state.furnitureItemIsNew;
  const T = STRINGS[state.lang];

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState(0);
  const [dims, setDims] = useState('');
  const [category, setCategory] = useState('sofas');
  const [availability, setAvailability] = useState('inStock');
  const [woodFinish, setWoodFinish] = useState('');
  const [fabric, setFabric] = useState('');
  const [metal, setMetal] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const objectUrlRef = useRef('');

  useEffect(() => {
    if (!row) return;
    setName(row.name || '');
    setCode(row.code || '');
    setSupplier(row.supplier || '');
    setPrice(row.price || 0);
    setDims(row.dims || '');
    setCategory(row.category || 'sofas');
    setAvailability(row.availability || 'inStock');
    setWoodFinish(row.wood_finish || '');
    setFabric(row.fabric || '');
    setMetal(row.metal || '');
    setIsActive(row.is_active !== false);
    setImageFile(null);
    setPreviewUrl('');
    setLocalError('');
    setConfirmingDelete(false);
  }, [row]);

  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);

  if (!row) return null;

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_BYTES = 7 * 1024 * 1024;
  const cat = FURNITURE_CATEGORIES.find((c) => c.key === category) || FURNITURE_CATEGORIES[0];

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) { setLocalError('Please choose a JPG, PNG, or WebP image.'); return; }
    if (file.size > MAX_BYTES) { setLocalError('Images must be 7MB or smaller.'); return; }
    setLocalError('');
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageFile(file);
    setPreviewUrl(url);
  }

  async function handleSave() {
    setLocalError('');
    if (!name.trim()) { setLocalError('Name is required.'); return; }
    const fields = {
      name: name.trim(), code: code.trim(), supplier: supplier.trim(), price: Number(price) || 0, dims: dims.trim(),
      category, availability, wood_finish: woodFinish, fabric, metal, is_active: isActive,
    };
    await saveFurnitureItemEdit(row.id, fields, imageFile, isNew);
  }

  async function handleDelete() {
    if (!confirmingDelete) { setConfirmingDelete(true); return; }
    await deleteFurnitureItemFn(row);
  }

  function handleCancel() {
    if (state.furnitureSaving) return;
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = ''; }
    closeFurnitureEditor();
  }

  const displayImage = previewUrl || row.imageUrl || '';
  const saving = state.furnitureSaving;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'oklch(20% 0.02 50 / 0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={handleCancel} role="dialog" aria-modal="true" aria-label={isNew ? 'Add furniture item' : 'Edit ' + (row.name || 'furniture item')}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 18, padding: 30, maxWidth: 480, width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--head-font)', fontSize: 20, color: 'var(--text)', marginBottom: 18 }}>{isNew ? 'Add Furniture Item' : 'Edit Furniture Item'}</div>

        <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: 'oklch(90% 0.02 75)', marginBottom: 16 }}>
          {displayImage ? (
            <img src={displayImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-2)', textAlign: 'center', padding: 10, background: 'repeating-linear-gradient(135deg, oklch(92% 0.015 78) 0px, oklch(92% 0.015 78) 10px, oklch(87% 0.02 72) 10px, oklch(87% 0.02 72) 20px)' }}>No image yet</div>
          )}
          <label style={{ position: 'absolute', top: 8, left: 8, background: 'oklch(20% 0.02 50 / 0.7)', color: '#fff', fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
            {T.common.edit}
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} aria-label="Upload furniture image" />
          </label>
        </div>

        <label htmlFor="fi-name" style={sx(labelStyle)}>Name</label>
        <input id="fi-name" value={name} onChange={(e) => setName(e.target.value)} style={{ ...sx(inputStyle), marginBottom: 14 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label htmlFor="fi-code" style={sx(labelStyle)}>Code</label>
            <input id="fi-code" value={code} onChange={(e) => setCode(e.target.value)} style={sx(inputStyle)} />
          </div>
          <div>
            <label htmlFor="fi-supplier" style={sx(labelStyle)}>Supplier</label>
            <input id="fi-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} style={sx(inputStyle)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label htmlFor="fi-price" style={sx(labelStyle)}>Price (SAR)</label>
            <input id="fi-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={sx(inputStyle)} />
          </div>
          <div>
            <label htmlFor="fi-dims" style={sx(labelStyle)}>Dimensions</label>
            <input id="fi-dims" value={dims} onChange={(e) => setDims(e.target.value)} placeholder="60 x 50 x 70 cm" style={sx(inputStyle)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label htmlFor="fi-category" style={sx(labelStyle)}>Category</label>
            <select id="fi-category" value={category} onChange={(e) => setCategory(e.target.value)} style={sx(inputStyle)}>
              {FURNITURE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.en}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fi-availability" style={sx(labelStyle)}>Availability</label>
            <select id="fi-availability" value={availability} onChange={(e) => setAvailability(e.target.value)} style={sx(inputStyle)}>
              <option value="inStock">In stock</option>
              <option value="madeToOrder">Made to order</option>
            </select>
          </div>
        </div>

        {(cat.finishes.includes('wood') || cat.finishes.includes('fabric') || cat.finishes.includes('metal')) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + cat.finishes.length + ',1fr)', gap: 14, marginBottom: 14 }}>
            {cat.finishes.includes('wood') && (
              <div>
                <label htmlFor="fi-wood" style={sx(labelStyle)}>Wood finish</label>
                <select id="fi-wood" value={woodFinish} onChange={(e) => setWoodFinish(e.target.value)} style={sx(inputStyle)}>
                  <option value="">\u2014</option>
                  {WOOD_FINISH_OPTS.map((o) => <option key={o[0]} value={o[0]}>{o[0]}</option>)}
                </select>
              </div>
            )}
            {cat.finishes.includes('fabric') && (
              <div>
                <label htmlFor="fi-fabric" style={sx(labelStyle)}>Fabric</label>
                <select id="fi-fabric" value={fabric} onChange={(e) => setFabric(e.target.value)} style={sx(inputStyle)}>
                  <option value="">\u2014</option>
                  {FABRIC_OPTS.map((o) => <option key={o[0]} value={o[0]}>{o[0]}</option>)}
                </select>
              </div>
            )}
            {cat.finishes.includes('metal') && (
              <div>
                <label htmlFor="fi-metal" style={sx(labelStyle)}>Metal finish</label>
                <select id="fi-metal" value={metal} onChange={(e) => setMetal(e.target.value)} style={sx(inputStyle)}>
                  <option value="">\u2014</option>
                  {METAL_OPTS.map((o) => <option key={o[0]} value={o[0]}>{o[0]}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer', marginBottom: 16 }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible to clients)
        </label>

        {(localError || state.furnitureSaveError) && <div role="alert" style={{ fontSize: 12.5, color: 'oklch(48% 0.14 30)', marginBottom: 14 }}>{localError || state.furnitureSaveError}</div>}
        {saving && <div role="status" aria-live="polite" style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>Saving\u2026</div>}
        {state.furnitureSaveSuccess && <div role="status" style={{ fontSize: 12.5, color: 'oklch(40% 0.1 145)', marginBottom: 14 }}>Saved successfully.</div>}

        <div style={{ display: 'grid', gridTemplateColumns: isNew ? '1fr 1fr' : '1fr 1fr 1fr', gap: 10 }}>
          <Hoverable as="button" type="button" style="font-size:13.5px;font-weight:600;color:var(--text);background:transparent;border:1px solid var(--border);padding:13px 16px;border-radius:100px;cursor:pointer;transition:transform .18s ease,background .18s ease;" hoverStyle="transform:translateY(-2px);background:var(--border);" onClick={handleCancel} disabled={saving}>Cancel</Hoverable>
          {!isNew && (
            <Hoverable as="button" type="button" disabled={saving} style={'font-size:13.5px;font-weight:600;color:' + (confirmingDelete ? '#fff' : 'oklch(50% 0.14 30)') + ';background:' + (confirmingDelete ? 'oklch(52% 0.16 30)' : 'transparent') + ';border:1px solid oklch(50% 0.14 30);padding:13px 16px;border-radius:100px;cursor:pointer;transition:transform .18s ease,filter .18s ease;'} hoverStyle="transform:translateY(-2px);filter:brightness(1.05);" onClick={handleDelete}>
              {confirmingDelete ? 'Confirm delete' : 'Delete'}
            </Hoverable>
          )}
          <Hoverable
            as="button" type="button" disabled={saving}
            style={'font-size:13.5px;font-weight:600;color:var(--btn-text);background:var(--btn-bg);border:none;padding:13px 16px;border-radius:100px;cursor:' + (saving ? 'not-allowed' : 'pointer') + ';opacity:' + (saving ? '0.7' : '1') + ';transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;'}
            hoverStyle={saving ? '' : 'transform:translateY(-2px);box-shadow:0 10px 22px -8px oklch(20% 0.02 50 / 0.4);filter:brightness(1.08);'}
            onClick={handleSave}
          >
            {saving ? 'Saving\u2026' : 'Save'}
          </Hoverable>
        </div>
      </div>
    </div>
  );
}
