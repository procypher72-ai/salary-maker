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

  // Dimensions
  const [width, setWidth] = useState(company?.[widthKey] || (isSecondary ? 85 : 65));
  const [height, setHeight] = useState(company?.[heightKey] || (isSecondary ? 60 : 65));

  // Position & Offsets
  const [position, setPosition] = useState(company?.[posKey] || (isSecondary ? 'right' : 'left'));
  const [offsetX, setOffsetX] = useState(company?.[offXKey] || 0);
  const [offsetY, setOffsetY] = useState(company?.[offYKey] || 0);

  // Logo URL
  const [logoUrl, setLogoUrl] = useState(company?.[urlKey] || '');

  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const resizeStartRef = useRef({ x: 0, y: 0, w: 65, h: 65 });
  const moveStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Synchronize when company updates
  useEffect(() => {
    if (company?.[widthKey]) setWidth(company[widthKey]);
    if (company?.[heightKey]) setHeight(company[heightKey]);
    if (company?.[posKey]) setPosition(company[posKey]);
    if (company?.[offXKey] !== undefined) setOffsetX(company[offXKey]);
    if (company?.[offYKey] !== undefined) setOffsetY(company[offYKey]);
    if (company?.[urlKey] !== undefined) setLogoUrl(company[urlKey]);
  }, [company, widthKey, heightKey, posKey, offXKey, offYKey, urlKey]);

  // ─── 1. CORNER RESIZE HANDLER ────────────────────────────────────
  const handleResizeMouseDown = (e) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: width,
      h: height,
    };

    const handleResizeMouseMove = (ev) => {
      const dx = ev.clientX - resizeStartRef.current.x;
      const dy = ev.clientY - resizeStartRef.current.y;
      const newWidth = Math.max(30, Math.min(280, resizeStartRef.current.w + dx));
      const newHeight = Math.max(30, Math.min(280, resizeStartRef.current.h + dy));
      setWidth(Math.round(newWidth));
      setHeight(Math.round(newHeight));
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
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
      ox: offsetX,
      oy: offsetY,
    };

    const handleMoveMouseMove = (ev) => {
      const dx = ev.clientX - moveStartRef.current.x;
      const dy = ev.clientY - moveStartRef.current.y;
      setOffsetX(Math.round(moveStartRef.current.ox + dx));
      setOffsetY(Math.round(moveStartRef.current.oy + dy));
    };

    const handleMoveMouseUp = () => {
      setIsMoving(false);
      window.removeEventListener('mousemove', handleMoveMouseMove);
      window.removeEventListener('mouseup', handleMoveMouseUp);
    };

    window.addEventListener('mousemove', handleMoveMouseMove);
    window.addEventListener('mouseup', handleMoveMouseUp);
  };

  // ─── 3. QUICK SNAP ALIGNMENTS ────────────────────────────────────
  const handleSnapAlign = (align) => {
    setPosition(align);
    setOffsetX(0);
    setOffsetY(0);
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
        setLogoUrl(reader.result);
        showToast('Image replaced! Click "Save Layout" to persist.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── 5. SAVE LAYOUT & PERSIST ────────────────────────────────────
  const handleSaveLayout = async () => {
    if (!company?._id) return;
    setIsSaving(true);
    try {
      const payload = {
        [widthKey]: width,
        [heightKey]: height,
        [posKey]: position,
        [offXKey]: offsetX,
        [offYKey]: offsetY,
        [urlKey]: logoUrl,
      };

      const res = await api.updateCompany(company._id, payload);
      showToast(
        `Saved ${isSecondary ? 'Secondary / G20' : 'Company'} logo layout (${width}×${height}px, ${position}) for ${company.name}!`,
        'success'
      );
      if (onSizeSaved) {
        onSizeSaved(res.company);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── 6. RESET LAYOUT ─────────────────────────────────────────────
  const handleResetLayout = () => {
    setWidth(isSecondary ? 85 : 65);
    setHeight(isSecondary ? 60 : 65);
    setPosition(isSecondary ? 'right' : 'left');
    setOffsetX(0);
    setOffsetY(0);
    setLogoUrl(company?.[urlKey] || '');
  };

  // Compute container justify alignment
  const getJustifyContent = () => {
    if (position === 'center') return 'center';
    if (position === 'right') return 'flex-end';
    return 'flex-start';
  };

  return (
    <div
      className="resizable-logo-wrapper"
      style={{
        display: 'flex',
        justifyContent: getJustifyContent(),
        alignItems: 'center',
        width: '100%',
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
              top: '-8px',
              left: '-8px',
              width: '18px',
              height: '18px',
              background: isSecondary ? '#f97316' : '#0284c7',
              color: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              zIndex: 35,
              pointerEvents: 'none',
            }}
            title="Drag to reposition logo"
          >
            <Move size={10} />
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
            }}
          >
            {fallbackLogo ? (
              <div style={{ transform: `scale(${width / (isSecondary ? 75 : 50)})`, transformOrigin: 'center center' }}>
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
                right: '-6px',
                bottom: '-6px',
                width: '14px',
                height: '14px',
                background: isSecondary ? '#f97316' : '#06b6d4',
                border: '2px solid #ffffff',
                borderRadius: '3px',
                cursor: 'se-resize',
                zIndex: 35,
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}
            />

            {/* Quick Floating Toolbar with Size, Alignments, Replace & Save */}
            <div
              className={`logo-size-pill no-print ${showToolbar || isResizing || isMoving ? 'visible' : ''}`}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '-44px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.95)',
                border: isSecondary ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(6, 182, 212, 0.4)',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                zIndex: 60,
                boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                pointerEvents: 'auto',
                transition: 'opacity 0.2s ease',
                opacity: showToolbar || isResizing || isMoving ? 1 : 0,
              }}
            >
              <span>{width}×{height}px</span>

              {/* Snap Position Alignments */}
              <div style={{ display: 'flex', gap: '0.2rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleSnapAlign('left')}
                  style={{
                    background: position === 'left' && offsetX === 0 ? '#0284c7' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.15rem 0.3rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  title="Snap Left"
                >
                  <AlignLeft size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapAlign('center')}
                  style={{
                    background: position === 'center' && offsetX === 0 ? '#0284c7' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.15rem 0.3rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  title="Snap Center"
                >
                  <AlignCenter size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSnapAlign('right')}
                  style={{
                    background: position === 'right' && offsetX === 0 ? '#0284c7' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.15rem 0.3rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                  title="Snap Right"
                >
                  <AlignRight size={11} />
                </button>
              </div>

              {/* Replace / Upload Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#38bdf8',
                  border: 'none',
                  padding: '0.18rem 0.4rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
                title={`Replace ${isSecondary ? 'G20' : 'Company'} Logo Image`}
              >
                <ImagePlus size={11} /> Replace
              </button>

              {/* Save Layout Button */}
              <button
                type="button"
                onClick={handleSaveLayout}
                disabled={isSaving}
                style={{
                  background: isSecondary ? '#f97316' : '#06b6d4',
                  color: '#fff',
                  border: 'none',
                  padding: '0.18rem 0.45rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title="Save position, size, and image for all salary slips"
              >
                <Save size={11} /> Save
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleResetLayout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                  border: 'none',
                  padding: '0.15rem 0.35rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                title="Reset layout to default"
              >
                <RotateCcw size={11} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
