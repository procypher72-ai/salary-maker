import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  Square,
  Columns,
  Type,
  Check,
  ChevronDown,
  ChevronUp,
  Layout,
  Palette,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';

const PRESET_CONFIGS = [
  {
    name: 'Standard',
    icon: '📄',
    config: {
      slipWidth: 950,
      slipMinHeight: 0,
      slipPadding: 24,
      slipBorderWidth: 1,
      slipBorderStyle: 'solid',
      slipBorderColor: '#000000',
      slipBorderRadius: 0,
      incomeDeductionHeight: 30,
      incomeDeductionMinHeight: 160,
      incomeColumnWidth: 50,
      tableBorderWidth: 1,
      tableBorderStyle: 'solid',
      tableBorderColor: '#000000',
      fontSizeScale: 100,
    },
  },
  {
    name: 'Spacious Tall',
    icon: '↕️',
    config: {
      slipWidth: 1000,
      slipMinHeight: 750,
      slipPadding: 32,
      slipBorderWidth: 1,
      slipBorderStyle: 'solid',
      slipBorderColor: '#334155',
      slipBorderRadius: 4,
      incomeDeductionHeight: 44,
      incomeDeductionMinHeight: 280,
      incomeColumnWidth: 50,
      tableBorderWidth: 1,
      tableBorderStyle: 'solid',
      tableBorderColor: '#334155',
      fontSizeScale: 105,
    },
  },
  {
    name: 'Compact Dense',
    icon: '🤏',
    config: {
      slipWidth: 880,
      slipMinHeight: 0,
      slipPadding: 16,
      slipBorderWidth: 1,
      slipBorderStyle: 'solid',
      slipBorderColor: '#111111',
      slipBorderRadius: 0,
      incomeDeductionHeight: 22,
      incomeDeductionMinHeight: 120,
      incomeColumnWidth: 50,
      tableBorderWidth: 1,
      tableBorderStyle: 'solid',
      tableBorderColor: '#111111',
      fontSizeScale: 92,
    },
  },
  {
    name: 'Bold Double Border',
    icon: '🔳',
    config: {
      slipWidth: 960,
      slipMinHeight: 0,
      slipPadding: 26,
      slipBorderWidth: 3,
      slipBorderStyle: 'double',
      slipBorderColor: '#0f172a',
      slipBorderRadius: 6,
      incomeDeductionHeight: 36,
      incomeDeductionMinHeight: 180,
      incomeColumnWidth: 52,
      tableBorderWidth: 1,
      tableBorderStyle: 'solid',
      tableBorderColor: '#0f172a',
      fontSizeScale: 100,
    },
  },
  {
    name: 'Modern Executive',
    icon: '💎',
    config: {
      slipWidth: 980,
      slipMinHeight: 680,
      slipPadding: 28,
      slipBorderWidth: 2,
      slipBorderStyle: 'solid',
      slipBorderColor: '#6366f1',
      slipBorderRadius: 10,
      incomeDeductionHeight: 38,
      incomeDeductionMinHeight: 220,
      incomeColumnWidth: 50,
      tableBorderWidth: 1,
      tableBorderStyle: 'solid',
      tableBorderColor: '#cbd5e1',
      fontSizeScale: 102,
    },
  },
];

const COLOR_SWATCHES = [
  '#000000',
  '#1e293b',
  '#334155',
  '#0a2540',
  '#0056b3',
  '#0d9488',
  '#059669',
  '#6366f1',
  '#7c3aed',
  '#b45309',
  '#991b1b',
  '#cbd5e1',
];

export const SlipLayoutToolbar = ({
  company = {},
  layoutConfig,
  onChangeLayout,
  onSaveCompanyLayout,
}) => {
  const { showToast } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('columns'); // 'dimensions' | 'borders' | 'columns' | 'presets'
  const [isSaving, setIsSaving] = useState(false);

  const config = layoutConfig || {
    slipWidth: company?.slipWidth || 950,
    slipMinHeight: company?.slipMinHeight || 0,
    slipPadding: company?.slipPadding || 24,
    slipBorderWidth: company?.slipBorderWidth !== undefined ? company.slipBorderWidth : 1,
    slipBorderStyle: company?.slipBorderStyle || 'solid',
    slipBorderColor: company?.slipBorderColor || '#000000',
    slipBorderRadius: company?.slipBorderRadius || 0,
    incomeDeductionHeight: company?.incomeDeductionHeight || 30,
    incomeDeductionMinHeight: company?.incomeDeductionMinHeight || 160,
    incomeColumnWidth: company?.incomeColumnWidth || 50,
    tableBorderWidth: company?.tableBorderWidth !== undefined ? company.tableBorderWidth : 1,
    tableBorderStyle: company?.tableBorderStyle || 'solid',
    tableBorderColor: company?.tableBorderColor || '#000000',
    fontSizeScale: company?.fontSizeScale || 100,
  };

  const updateField = (field, value) => {
    const updated = {
      ...config,
      [field]: value,
    };
    if (onChangeLayout) {
      onChangeLayout(updated);
    }
  };

  const handleApplyPreset = (preset) => {
    if (onChangeLayout) {
      onChangeLayout(preset.config);
    }
    showToast(`Applied "${preset.name}" layout preset!`, 'info');
  };

  const handleSave = async () => {
    if (!company?._id) return;
    setIsSaving(true);
    try {
      const payload = {
        slipWidth: Number(config.slipWidth) || 950,
        slipMinHeight: Number(config.slipMinHeight) || 0,
        slipPadding: Number(config.slipPadding) || 24,
        slipBorderWidth: Number(config.slipBorderWidth) || 0,
        slipBorderStyle: config.slipBorderStyle || 'solid',
        slipBorderColor: config.slipBorderColor || '#000000',
        slipBorderRadius: Number(config.slipBorderRadius) || 0,
        incomeDeductionHeight: Number(config.incomeDeductionHeight) || 30,
        incomeDeductionMinHeight: Number(config.incomeDeductionMinHeight) || 160,
        incomeColumnWidth: Number(config.incomeColumnWidth) || 50,
        tableBorderWidth: Number(config.tableBorderWidth) || 0,
        tableBorderStyle: config.tableBorderStyle || 'solid',
        tableBorderColor: config.tableBorderColor || '#000000',
        fontSizeScale: Number(config.fontSizeScale) || 100,
      };

      const res = await api.updateCompany(company._id, payload);
      showToast('Slip sizing & column styling saved as company default!', 'success');
      if (onSaveCompanyLayout) {
        onSaveCompanyLayout(res.company);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save layout', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const standard = PRESET_CONFIGS[0].config;
    if (onChangeLayout) {
      onChangeLayout(standard);
    }
    showToast('Reset to default dimensions and borders', 'info');
  };

  return (
    <div className="slip-layout-toolbar-panel no-print">
      {/* Header bar / toggle trigger */}
      <div className="layout-toolbar-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="toolbar-header-left">
          <div className="toolbar-icon-badge">
            <Sliders size={16} />
          </div>
          <div>
            <div className="toolbar-title">
              Slip Dimensions, Borders & Column Height Controls
            </div>
            <div className="toolbar-subtitle">
              Width: {config.slipWidth}px • Height: {config.slipMinHeight ? `${config.slipMinHeight}px` : 'Auto'} • Row Spacing: {config.incomeDeductionHeight}px • Border: {config.slipBorderWidth}px {config.slipBorderStyle}
            </div>
          </div>
        </div>

        <div className="toolbar-header-right">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={isSaving}
            id="save-layout-btn"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Layout to Company'}</span>
          </button>
          <button
            type="button"
            className="btn-toggle-expand"
            aria-label="Toggle Layout Customizer"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable Controls Drawer */}
      {isExpanded && (
        <div className="layout-toolbar-body">
          {/* Sub Navigation Tabs */}
          <div className="toolbar-tabs">
            <button
              type="button"
              className={`toolbar-tab ${activeTab === 'columns' ? 'active' : ''}`}
              onClick={() => setActiveTab('columns')}
            >
              <Columns size={15} />
              <span>Income & Deduction Columns</span>
            </button>
            <button
              type="button"
              className={`toolbar-tab ${activeTab === 'dimensions' ? 'active' : ''}`}
              onClick={() => setActiveTab('dimensions')}
            >
              <Maximize2 size={15} />
              <span>Slip Height & Width</span>
            </button>
            <button
              type="button"
              className={`toolbar-tab ${activeTab === 'borders' ? 'active' : ''}`}
              onClick={() => setActiveTab('borders')}
            >
              <Square size={15} />
              <span>Outer & Table Borders</span>
            </button>
            <button
              type="button"
              className={`toolbar-tab ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveTab('presets')}
            >
              <Sparkles size={15} />
              <span>Quick Presets</span>
            </button>
          </div>

          <div className="toolbar-tab-content">
            {/* 1. INCOME & DEDUCTION COLUMNS TAB */}
            {activeTab === 'columns' && (
              <div className="toolbar-controls-grid">
                {/* Row Height / Spacing */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Income & Deduction Row Height</label>
                    <span className="control-value-badge">{config.incomeDeductionHeight} px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="70"
                    step="2"
                    value={config.incomeDeductionHeight}
                    onChange={(e) => updateField('incomeDeductionHeight', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[
                      { label: 'Compact (22px)', val: 22 },
                      { label: 'Standard (30px)', val: 30 },
                      { label: 'Spacious (42px)', val: 42 },
                      { label: 'Extra Tall (56px)', val: 56 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        className={`btn-chip ${config.incomeDeductionHeight === btn.val ? 'active' : ''}`}
                        onClick={() => updateField('incomeDeductionHeight', btn.val)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Minimum Height */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Financial Table Min-Height</label>
                    <span className="control-value-badge">
                      {config.incomeDeductionMinHeight ? `${config.incomeDeductionMinHeight} px` : 'Auto'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={config.incomeDeductionMinHeight || 160}
                    onChange={(e) => updateField('incomeDeductionMinHeight', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[120, 160, 220, 300, 400].map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`btn-chip ${config.incomeDeductionMinHeight === h ? 'active' : ''}`}
                        onClick={() => updateField('incomeDeductionMinHeight', h)}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Income vs Deduction Column Width Split Ratio */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Income vs Deduction Width Split</label>
                    <span className="control-value-badge">
                      {config.incomeColumnWidth}% Earnings / {100 - config.incomeColumnWidth}% Deductions
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="65"
                    step="1"
                    value={config.incomeColumnWidth}
                    onChange={(e) => updateField('incomeColumnWidth', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[
                      { label: '50% / 50% (Equal)', val: 50 },
                      { label: '55% / 45% (Wider Income)', val: 55 },
                      { label: '60% / 40% (Max Income)', val: 60 },
                      { label: '45% / 55% (Wider Deductions)', val: 45 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        className={`btn-chip ${config.incomeColumnWidth === btn.val ? 'active' : ''}`}
                        onClick={() => updateField('incomeColumnWidth', btn.val)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scaling */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Table & Slip Font Size Scale</label>
                    <span className="control-value-badge">{config.fontSizeScale || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="125"
                    step="2"
                    value={config.fontSizeScale || 100}
                    onChange={(e) => updateField('fontSizeScale', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[
                      { label: '90% (Fine)', val: 90 },
                      { label: '100% (Standard)', val: 100 },
                      { label: '110% (Large)', val: 110 },
                      { label: '120% (Prominent)', val: 120 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        className={`btn-chip ${(config.fontSizeScale || 100) === btn.val ? 'active' : ''}`}
                        onClick={() => updateField('fontSizeScale', btn.val)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SLIP HEIGHT & WIDTH TAB */}
            {activeTab === 'dimensions' && (
              <div className="toolbar-controls-grid">
                {/* Slip Width */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Overall Slip Width (Max Width)</label>
                    <span className="control-value-badge">{config.slipWidth} px</span>
                  </div>
                  <input
                    type="range"
                    min="720"
                    max="1200"
                    step="10"
                    value={config.slipWidth}
                    onChange={(e) => updateField('slipWidth', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[
                      { label: '850px (Compact A4)', val: 850 },
                      { label: '950px (Standard)', val: 950 },
                      { label: '1050px (Wide)', val: 1050 },
                      { label: '1150px (Ultra-Wide)', val: 1150 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        className={`btn-chip ${config.slipWidth === btn.val ? 'active' : ''}`}
                        onClick={() => updateField('slipWidth', btn.val)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slip Minimum Height */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Overall Slip Minimum Height</label>
                    <span className="control-value-badge">
                      {config.slipMinHeight ? `${config.slipMinHeight} px` : 'Auto (Dynamic)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1200"
                    step="50"
                    value={config.slipMinHeight}
                    onChange={(e) => updateField('slipMinHeight', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[
                      { label: 'Auto (Fit Content)', val: 0 },
                      { label: '650px (Standard A4 Page)', val: 650 },
                      { label: '800px (Full Page Height)', val: 800 },
                      { label: '950px (Extended Slip)', val: 950 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        className={`btn-chip ${config.slipMinHeight === btn.val ? 'active' : ''}`}
                        onClick={() => updateField('slipMinHeight', btn.val)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slip Inner Padding */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Slip Sheet Inner Margin / Padding</label>
                    <span className="control-value-badge">{config.slipPadding} px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    step="2"
                    value={config.slipPadding}
                    onChange={(e) => updateField('slipPadding', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[12, 20, 26, 36, 44].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`btn-chip ${config.slipPadding === p ? 'active' : ''}`}
                        onClick={() => updateField('slipPadding', p)}
                      >
                        {p}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. BORDERS TAB */}
            {activeTab === 'borders' && (
              <div className="toolbar-controls-grid">
                {/* Outer Border Thickness */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Outer Border Thickness</label>
                    <span className="control-value-badge">{config.slipBorderWidth} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={config.slipBorderWidth}
                    onChange={(e) => updateField('slipBorderWidth', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[0, 1, 2, 3, 4, 6].map((w) => (
                      <button
                        key={w}
                        type="button"
                        className={`btn-chip ${config.slipBorderWidth === w ? 'active' : ''}`}
                        onClick={() => updateField('slipBorderWidth', w)}
                      >
                        {w === 0 ? 'No Border' : `${w}px`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outer Border Style */}
                <div className="control-card">
                  <label className="control-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    Outer Border Style
                  </label>
                  <div className="control-quick-buttons">
                    {['solid', 'dashed', 'dotted', 'double', 'groove', 'none'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`btn-chip ${config.slipBorderStyle === st ? 'active' : ''}`}
                        onClick={() => updateField('slipBorderStyle', st)}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Color */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Border Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="color"
                        value={config.slipBorderColor || '#000000'}
                        onChange={(e) => updateField('slipBorderColor', e.target.value)}
                        style={{ width: '28px', height: '24px', cursor: 'pointer', border: 'none', background: 'none' }}
                      />
                      <span className="control-value-badge">{config.slipBorderColor}</span>
                    </div>
                  </div>
                  <div className="color-swatches-grid">
                    {COLOR_SWATCHES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className={`color-swatch-dot ${config.slipBorderColor === hex ? 'active' : ''}`}
                        style={{ backgroundColor: hex }}
                        onClick={() => updateField('slipBorderColor', hex)}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                {/* Outer Border Radius */}
                <div className="control-card">
                  <div className="control-label-row">
                    <label className="control-label">Outer Corner Radius</label>
                    <span className="control-value-badge">{config.slipBorderRadius} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="2"
                    value={config.slipBorderRadius}
                    onChange={(e) => updateField('slipBorderRadius', Number(e.target.value))}
                    className="toolbar-range-slider"
                  />
                  <div className="control-quick-buttons">
                    {[
                      { label: 'Square (0px)', val: 0 },
                      { label: 'Subtle (4px)', val: 4 },
                      { label: 'Medium (8px)', val: 8 },
                      { label: 'Rounded (14px)', val: 14 },
                      { label: 'Card (20px)', val: 20 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        className={`btn-chip ${config.slipBorderRadius === btn.val ? 'active' : ''}`}
                        onClick={() => updateField('slipBorderRadius', btn.val)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. PRESETS TAB */}
            {activeTab === 'presets' && (
              <div className="presets-grid">
                {PRESET_CONFIGS.map((p) => (
                  <div
                    key={p.name}
                    className="preset-card"
                    onClick={() => handleApplyPreset(p)}
                  >
                    <div className="preset-card-header">
                      <span className="preset-icon">{p.icon}</span>
                      <strong className="preset-name">{p.name}</strong>
                    </div>
                    <div className="preset-card-details">
                      <span>Width: {p.config.slipWidth}px</span>
                      <span>Row Height: {p.config.incomeDeductionHeight}px</span>
                      <span>Border: {p.config.slipBorderWidth}px {p.config.slipBorderStyle}</span>
                    </div>
                    <button type="button" className="btn btn-sm btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Apply Preset
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="toolbar-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving Layout...' : 'Save As Default For Company'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
