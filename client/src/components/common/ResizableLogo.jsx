import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Move, Save, RotateCcw, AlignLeft, AlignCenter, AlignRight, ImagePlus, Trash2 } from 'lucide-react';

export const ResizableLogo = ({
  company = {},
  fieldPrefix = 'logo', // 'logo' or 'secondaryLogo'
  isEditable = false,
  fallbackLogo = null,
  onSizeSaved,
  defaultPosition = null,
  defaultWidth = null,
  defaultHeight = null,
}) => {
  const { showToast } = useAuth();
  const fileInputRef = useRef(null);

  const isSecondary = fieldPrefix === 'secondaryLogo';
  const widthKey = isSecondary ? 'secondaryLogoWidth' : 'logoWidth';
  const heightKey = isSecondary ? 'secondaryLogoHeight' : 'logoHeight';
  const posKey = isSecondary ? 'secondaryLogoPosition' : 'logoPosition';
  const offXKey = isSecondary ? 'secondaryLogoOffsetX' : 'logoOffsetX';
  const offYKey = isSecondary ? 'secondaryLogoOffsetY' : 'logoOffsetY';
  const urlKey = isSecondary ? 'secondaryLogoUrl' : 'logoUrl';

  const defaultPosVal = defaultPosition || (isSecondary ? 'right' : 'left');
  const defWidthVal = defaultWidth || (isSecondary ? 85 : 65);
  const defHeightVal = defaultHeight || (isSecondary ? 60 : 65);

  // Dimensions
  const [width, setWidth] = useState(company?.[widthKey] || defWidthVal);
  const [height, setHeight] = useState(company?.[heightKey] || defHeightVal);

  // Position & Offsets
  const [position, setPosition] = useState(company?.[posKey] || defaultPosVal);
  const [offsetX, setOffsetX] = useState(company?.[offXKey] || 0);
  const [offsetY, setOffsetY] = useState(company?.[offYKey] || 0);

  // Logo URL
  const [logoUrl, setLogoUrl] = useState(company?.[urlKey] || '');

  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Active Ref tracking the absolute latest values to prevent stale closures during mouse drag/resize
  const latestValuesRef = useRef({
    width: company?.[widthKey] || defWidthVal,
    height: company?.[heightKey] || defHeightVal,
    position: company?.[posKey] || defaultPosVal,
    offsetX: company?.[offXKey] || 0,
    offsetY: company?.[offYKey] || 0,
    logoUrl: company?.[urlKey] || '',
  });

  const resizeStartRef = useRef({ x: 0, y: 0, w: defWidthVal, h: defHeightVal });
  const moveStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const persistLogoToBackend = async (payload) => {
    const targetCompanyId =
      company?._id ||
      company?.companyId ||
      localStorage.getItem('salarymaker_active_company_id');

    if (!targetCompanyId) return;

    try {
      const res = await api.updateCompany(targetCompanyId, payload);
      if (onSizeSaved) {
        onSizeSaved({
          ...payload,
          company: res.company,
          _persisted: true,
        });
      }
    } catch (err) {
      console.error('Auto save logo layout failed:', err);
    }
  };

  // Synchronize when company updates externally (like selecting a different company)
  useEffect(() => {
    if (isResizing || isMoving) return;

    const w = company?.[widthKey] !== undefined ? company[widthKey] : defWidthVal;
    const h = company?.[heightKey] !== undefined ? company[heightKey] : defHeightVal;
    const p = company?.[posKey] !== undefined ? company[posKey] : defaultPosVal;
    const ox = company?.[offXKey] !== undefined ? company[offXKey] : 0;
    const oy = company?.[offYKey] !== undefined ? company[offYKey] : 0;
    const url = company?.[urlKey] !== undefined ? company[urlKey] : '';

    setWidth(w);
    setHeight(h);
    setPosition(p);
    setOffsetX(ox);
    setOffsetY(oy);
    setLogoUrl(url);

    latestValuesRef.current = {
      width: w,
      height: h,
      position: p,
      offsetX: ox,
      offsetY: oy,
      logoUrl: url,
    };
  }, [
    company?._id,
    company?.[widthKey],
    company?.[heightKey],
    company?.[posKey],
    company?.[offXKey],
    company?.[offYKey],
    company?.[urlKey],
  ]);

  // ─── 1. CORNER RESIZE HANDLER ────────────────────────────────────
  const handleResizeMouseDown = (e) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: latestValuesRef.current.width,
      h: latestValuesRef.current.height,
    };

    const handleResizeMouseMove = (ev) => {
      const dx = ev.clientX - resizeStartRef.current.x;
      const dy = ev.clientY - resizeStartRef.current.y;
      const newWidth = Math.round(Math.max(30, Math.min(280, resizeStartRef.current.w + dx)));
      const newHeight = Math.round(Math.max(30, Math.min(280, resizeStartRef.current.h + dy)));
      
      latestValuesRef.current.width = newWidth;
      latestValuesRef.current.height = newHeight;
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
      
      const payload = {
        [widthKey]: latestValuesRef.current.width,
        [heightKey]: latestValuesRef.current.height,
        [posKey]: latestValuesRef.current.position,
        [offXKey]: latestValuesRef.current.offsetX,
        [offYKey]: latestValuesRef.current.offsetY,
        [urlKey]: latestValuesRef.current.logoUrl,
      };

      if (onSizeSaved) {
        onSizeSaved(payload);
      }
      persistLogoToBackend(payload);
    };

    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  // ─── 2. FREE MOVE / DRAG POSITION HANDLER ─────────────────────────
  const handleMoveMouseDown = (e) => {
    if (!isEditable) return;
    if (e.target.closest('.logo-resize-drag-handle') || e.target.closest('.logo-size-pill')) return;
    e.preventDefault();
    e.stopPropagation();
    setIsMoving(true);
    moveStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: latestValuesRef.current.offsetX,
      oy: latestValuesRef.current.offsetY,
    };

    const handleMoveMouseMove = (ev) => {
      const dx = ev.clientX - moveStartRef.current.x;
      const dy = ev.clientY - moveStartRef.current.y;
      const newOffsetX = Math.round(moveStartRef.current.ox + dx);
      const newOffsetY = Math.round(moveStartRef.current.oy + dy);

      latestValuesRef.current.offsetX = newOffsetX;
      latestValuesRef.current.offsetY = newOffsetY;
      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);
    };

    const handleMoveMouseUp = () => {
      setIsMoving(false);
      window.removeEventListener('mousemove', handleMoveMouseMove);
      window.removeEventListener('mouseup', handleMoveMouseUp);
      
      const payload = {
        [widthKey]: latestValuesRef.current.width,
        [heightKey]: latestValuesRef.current.height,
        [posKey]: latestValuesRef.current.position,
        [offXKey]: latestValuesRef.current.offsetX,
        [offYKey]: latestValuesRef.current.offsetY,
        [urlKey]: latestValuesRef.current.logoUrl,
      };

      if (onSizeSaved) {
        onSizeSaved(payload);
      }
      persistLogoToBackend(payload);
    };

    window.addEventListener('mousemove', handleMoveMouseMove);
    window.addEventListener('mouseup', handleMoveMouseUp);
  };

  // ─── 3. QUICK SNAP ALIGNMENTS ────────────────────────────────────
  const handleSnapAlign = (align) => {
    latestValuesRef.current.position = align;
    latestValuesRef.current.offsetX = 0;
    latestValuesRef.current.offsetY = 0;
    setPosition(align);
    setOffsetX(0);
    setOffsetY(0);
    if (onSizeSaved) {
      onSizeSaved({
        [widthKey]: latestValuesRef.current.width,
        [heightKey]: latestValuesRef.current.height,
        [posKey]: align,
        [offXKey]: 0,
        [offYKey]: 0,
        [urlKey]: latestValuesRef.current.logoUrl,
      });
    }
  };

  // ─── 4. IMAGE UPLOAD & REPLACE ───────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrl = reader.result;
        latestValuesRef.current.logoUrl = newUrl;
        setLogoUrl(newUrl);
        if (onSizeSaved) {
          onSizeSaved({
            [widthKey]: latestValuesRef.current.width,
            [heightKey]: latestValuesRef.current.height,
            [posKey]: latestValuesRef.current.position,
            [offXKey]: latestValuesRef.current.offsetX,
            [offYKey]: latestValuesRef.current.offsetY,
            [urlKey]: newUrl,
          });
        }
        showToast('Image replaced! Click "Save" on toolbar or "Save & Update Slip" to persist.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── 5. SAVE LAYOUT & PERSIST ────────────────────────────────────
  const handleSaveLayout = async () => {
    const targetCompanyId =
      company?._id ||
      company?.companyId ||
      localStorage.getItem('salarymaker_active_company_id');

    if (!targetCompanyId) {
      showToast('Please select an active company first', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        [widthKey]: latestValuesRef.current.width,
        [heightKey]: latestValuesRef.current.height,
        [posKey]: latestValuesRef.current.position,
        [offXKey]: latestValuesRef.current.offsetX,
        [offYKey]: latestValuesRef.current.offsetY,
        [urlKey]: latestValuesRef.current.logoUrl,
      };

      const res = await api.updateCompany(targetCompanyId, payload);
      showToast(
        `Saved ${isSecondary ? 'Secondary / G20' : 'Company'} logo layout (${latestValuesRef.current.width}×${latestValuesRef.current.height}px) and updated across all salary slips!`,
        'success'
      );
      if (onSizeSaved) {
        onSizeSaved({
          ...payload,
          company: res.company,
          _persisted: true,
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to save logo layout', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── 6. REMOVE CUSTOM IMAGE / REVERT TO DEFAULT ──────────────────
  const handleRemoveCustomImage = () => {
    latestValuesRef.current.logoUrl = '';
    setLogoUrl('');
    const payload = {
      [widthKey]: latestValuesRef.current.width,
      [heightKey]: latestValuesRef.current.height,
      [posKey]: latestValuesRef.current.position,
      [offXKey]: latestValuesRef.current.offsetX,
      [offYKey]: latestValuesRef.current.offsetY,
      [urlKey]: '',
    };
    if (onSizeSaved) {
      onSizeSaved(payload);
    }
    persistLogoToBackend(payload);
    showToast('Custom logo removed. Reverted to default transparent vector logo!', 'info');
  };

  // ─── 7. RESET LAYOUT ─────────────────────────────────────────────
  const handleResetLayout = () => {
    const defW = isSecondary ? 85 : 65;
    const defH = isSecondary ? 60 : 65;
    const defP = isSecondary ? 'right' : 'left';

    latestValuesRef.current.width = defW;
    latestValuesRef.current.height = defH;
    latestValuesRef.current.position = defP;
    latestValuesRef.current.offsetX = 0;
    latestValuesRef.current.offsetY = 0;
    latestValuesRef.current.logoUrl = '';

    setWidth(defW);
    setHeight(defH);
    setPosition(defP);
    setOffsetX(0);
    setOffsetY(0);
    setLogoUrl('');

    const payload = {
      [widthKey]: defW,
      [heightKey]: defH,
      [posKey]: defP,
      [offXKey]: 0,
      [offYKey]: 0,
      [urlKey]: '',
    };

    if (onSizeSaved) {
      onSizeSaved(payload);
    }
    persistLogoToBackend(payload);
    showToast('Reset logo position, dimensions, and reverted to default transparent vector logo.', 'info');
  };

  // Compute container justify alignment
  const getJustifyContent = () => {
    if (position === 'center') return 'center';
    if (position === 'right') return 'flex-end';
    return 'flex-start';
  };

  // Smart horizontal anchoring for the toolbar to prevent overflowing or clipping
  const getToolbarStyle = () => {
    const base = {
      position: 'absolute',
      top: '-46px',
      background: 'rgba(15, 23, 42, 0.98)',
      border: isSecondary ? '1.5px solid rgba(249, 115, 22, 0.7)' : '1.5px solid rgba(6, 182, 212, 0.6)',
      color: '#fff',
      padding: '0.35rem 0.65rem',
      borderRadius: '8px',
      fontSize: '0.72rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      whiteSpace: 'nowrap',
      zIndex: 99999,
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      pointerEvents: 'auto',
      transition: 'opacity 0.2s ease, transform 0.15s ease',
      opacity: 1, // Always visible when isEditable is active
    };

    if (isSecondary || position === 'right' || defaultPosVal === 'right' || offsetX > 10) {
      return {
        ...base,
        right: '0px',
        left: 'auto',
        transform: 'none',
      };
    }
    if (position === 'center') {
      return {
        ...base,
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
      };
    }
    return {
      ...base,
      left: '0px',
      right: 'auto',
      transform: 'none',
    };
  };

  return (
    <div
      className="resizable-logo-wrapper"
      style={{
        display: 'flex',
        justifyContent: getJustifyContent(),
        alignItems: 'center',
        width: '100%',
        overflow: 'visible',
        position: 'relative',
        zIndex: isEditable ? 40 : 1,
      }}
    >
      <div
        className={`resizable-logo-container ${isEditable ? 'editable' : ''}`}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => setShowToolbar(false)}
        onMouseDown={handleMoveMouseDown}
        style={{
          position: 'relative',
          display: 'inline-block',
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          cursor: isEditable ? (isMoving ? 'grabbing' : 'grab') : 'default',
          transition: isMoving ? 'none' : 'transform 0.15s ease',
          userSelect: 'none',
          zIndex: isEditable ? 50 : 1,
          overflow: 'visible',
        }}
        title={isEditable ? `Click & drag anywhere to move ${isSecondary ? 'Secondary / G20' : 'Company'} logo, drag corner to resize, or replace image` : undefined}
      >
        {/* Hidden File Input for Image Replacement */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Move Indicator Pin on top-left (visible when editing) */}
        {isEditable && (
          <div
            className="no-print"
            style={{
              position: 'absolute',
              top: '-9px',
              left: '-9px',
              width: '20px',
              height: '20px',
              background: isSecondary ? '#f97316' : '#0284c7',
              color: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            title="Drag to reposition logo"
          >
            <Move size={11} />
          </div>
        )}

        {/* The Logo Image or Fallback */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={isSecondary ? 'Secondary Logo' : 'Company Logo'}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              objectFit: 'contain',
              display: 'block',
              borderRadius: '4px',
              userSelect: 'none',
              pointerEvents: 'none',
              background: 'transparent',
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              background: 'transparent',
            }}
          >
            {fallbackLogo ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                {fallbackLogo}
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#fff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${Math.max(12, Math.round(width / 3))}px`,
                }}
              >
                {company?.name ? company.name.charAt(0).toUpperCase() : 'CO'}
              </div>
            )}
          </div>
        )}

        {/* Interactive Corner Drag Handle for Resizing */}
        {isEditable && (
          <>
            <div
              className="logo-resize-drag-handle no-print"
              onMouseDown={handleResizeMouseDown}
              title="Drag corner to resize width & height"
              style={{
                position: 'absolute',
                right: '-7px',
                bottom: '-7px',
                width: '16px',
                height: '16px',
                background: isSecondary ? '#f97316' : '#06b6d4',
                border: '2px solid #ffffff',
                borderRadius: '3px',
                cursor: 'se-resize',
                zIndex: 9999,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            />

            {/* Quick Floating Toolbar with Size, Alignments, Replace & Save */}
            <div
              className="logo-size-pill no-print"
              onMouseDown={(e) => e.stopPropagation()}
              style={getToolbarStyle()}
            >
              <span style={{ color: '#e2e8f0', fontWeight: 700, letterSpacing: '0.02em' }}>
                {width}×{height}px
              </span>

              {/* Save Layout Button - Prominent High Visibility Action */}
              <button
                type="button"
                onClick={handleSaveLayout}
                disabled={isSaving}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.22rem 0.6rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.5)',
                  letterSpacing: '0.02em',
                }}
                title="Save position, size, and image for all salary slips"
              >
                <Save size={12} /> {isSaving ? 'Saving...' : 'Save'}
              </button>

              {/* Replace / Upload Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  padding: '0.22rem 0.45rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title={`Replace ${isSecondary ? 'G20' : 'Company'} Logo Image`}
              >
                <ImagePlus size={12} /> Replace
              </button>

              {/* Remove Custom Image Button (reverts to clean transparent default logo) */}
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveCustomImage}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '0.22rem 0.45rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Remove uploaded image & revert to clean transparent default vector logo"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}

              {/* Snap Position Alignments */}
              <div style={{ display: 'flex', gap: '0.2rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleSnapAlign('left')}
                  style={{
                    background: position === 'left' && offsetX === 0 ? '#0284c7' : 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.2rem 0.35rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Snap Left"
                >
                  <AlignLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapAlign('center')}
                  style={{
                    background: position === 'center' && offsetX === 0 ? '#0284c7' : 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.2rem 0.35rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Snap Center"
                >
                  <AlignCenter size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapAlign('right')}
                  style={{
                    background: position === 'right' && offsetX === 0 ? '#0284c7' : 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.2rem 0.35rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Snap Right"
                >
                  <AlignRight size={12} />
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetLayout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '0.2rem 0.35rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Reset layout & revert to default transparent vector logo"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
