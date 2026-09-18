import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { exportElementToPdf } from '../../utils/exportUtils';
import { KdkZenitTemplate } from './templates/KdkZenitTemplate';
import { ModernExecutiveTemplate } from './templates/ModernExecutiveTemplate';
import { CaAuditTemplate } from './templates/CaAuditTemplate';

const parseFinancialYear = (fy) => {
  if (!fy) return 0;
  const match = String(fy).match(/(\d{4}|\d{2})/);
  if (!match) return 0;
  let yr = parseInt(match[1], 10);
  if (yr < 100) yr += 2000;
  return yr;
};

export const BatchComputationDownloadModal = ({
  isOpen,
  onClose,
  computations = [],
  companies = [],
  activeCompany,
}) => {
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (26-27 -> 25-26 -> 24-25) or 'asc' (24-25 -> 25-26 -> 26-27)
  const [exportMode, setExportMode] = useState('individual'); // 'individual' or 'combined'
  const [isExporting, setIsExporting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [completedMap, setCompletedMap] = useState({});
  const [activeRenderComputation, setActiveRenderComputation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const isCancelledRef = useRef(false);
  const isExportingRef = useRef(false);

  // Deduplicate computations to prevent any duplicate entries
  const uniqueComputations = Array.from(
    new Map(computations.map((c) => [c._id || `${c.financialYear}-${c.personalDetails?.pan || ''}-${c.personalDetails?.name || ''}`, c])).values()
  );

  // Sort computations based on selected order
  const sortedComputations = [...uniqueComputations].sort((a, b) => {
    const yrA = parseFinancialYear(a.financialYear);
    const yrB = parseFinancialYear(b.financialYear);
    if (yrA !== yrB) {
      return sortOrder === 'desc' ? yrB - yrA : yrA - yrB;
    }
    const nameA = (a.personalDetails?.name || '').toLowerCase();
    const nameB = (b.personalDetails?.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  useEffect(() => {
    if (isOpen) {
      setCompletedMap({});
      setCurrentIndex(-1);
      setErrorMsg('');
      isCancelledRef.current = false;
      isExportingRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const findCompanyForComp = (comp) => {
    const compId = comp.companyId?._id || comp.companyId;
    return companies.find((c) => c._id === compId) || activeCompany || {};
  };

  const handleStartExport = async () => {
    // Strict concurrency lock: prevent double-clicks or multiple runs
    if (isExportingRef.current || isExporting || sortedComputations.length === 0) return;
    isExportingRef.current = true;
    setIsExporting(true);
    setErrorMsg('');
    isCancelledRef.current = false;
    setCompletedMap({});

    try {
      if (exportMode === 'individual') {
        // Sequentially export each computation as its own PDF
        for (let i = 0; i < sortedComputations.length; i++) {
          if (isCancelledRef.current) break;

          setCurrentIndex(i);
          const comp = sortedComputations[i];
          setActiveRenderComputation(comp);

          // Allow React to mount and flush the preview to the hidden DOM container
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (isCancelledRef.current) break;

          const el = document.getElementById('batch-individual-computation-render-target');
          if (!el) {
            throw new Error('Export render target not mounted in DOM');
          }

          const assessee = (comp.personalDetails?.name || 'Assessee').replace(/\s+/g, '_');
          const fy = comp.financialYear || 'FY';
          const filename = `Tax_Computation_${assessee}_FY${fy}.pdf`;

          await exportElementToPdf(el, filename, {
            multiPage: true,
            margin: [7, 7, 7, 7],
          });

          setCompletedMap((prev) => ({ ...prev, [comp._id]: true }));

          // Small delay between downloads so the browser handles each cleanly
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      } else {
        // Combined Master PDF mode
        setCurrentIndex(0);
        await new Promise((resolve) => setTimeout(resolve, 350));
        const el = document.getElementById('batch-combined-computations-render-target');
        if (!el) {
          throw new Error('Combined export target not found');
        }

        const orderLabel = sortOrder === 'desc' ? 'Desc' : 'Asc';
        const filename = `All_Tax_Computations_Consolidated_${orderLabel}.pdf`;

        await exportElementToPdf(el, filename, {
          multiPage: true,
          margin: [7, 7, 7, 7],
        });

        // Mark all as completed
        const map = {};
        sortedComputations.forEach((c) => {
          map[c._id] = true;
        });
        setCompletedMap(map);
      }
    } catch (err) {
      console.error('Batch computation export failed:', err);
      setErrorMsg(err.message || 'Batch export encountered an error');
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
      setCurrentIndex(-1);
    }
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    isExportingRef.current = false;
    setIsExporting(false);
    setCurrentIndex(-1);
  };

  const progressPercent = sortedComputations.length > 0 && currentIndex >= 0
    ? Math.round(((currentIndex + 1) / sortedComputations.length) * 100)
    : Object.keys(completedMap).length === sortedComputations.length && sortedComputations.length > 0
    ? 100
    : 0;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-content glass-panel"
        style={{
          maxWidth: '780px',
          width: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Batch Download Computations
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Download all assessment sheets in sequence with real digital vector text
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--accent-rose)',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sequence Sort Order Option */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calendar size={16} style={{ color: 'var(--accent-cyan)' }} />
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>1. Download Sequence Order:</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {/* Descending Option */}
              <div
                onClick={() => !isExporting && setSortOrder('desc')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${sortOrder === 'desc' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: sortOrder === 'desc' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="sortOrder"
                  checked={sortOrder === 'desc'}
                  onChange={() => setSortOrder('desc')}
                  disabled={isExporting}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: sortOrder === 'desc' ? '#fff' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ArrowDown size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Descending Order (Recommended)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    First <strong>26-27</strong>, then <strong>25-26</strong>, then <strong>24-25</strong>...
                  </div>
                </div>
              </div>

              {/* Ascending Option */}
              <div
                onClick={() => !isExporting && setSortOrder('asc')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${sortOrder === 'asc' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: sortOrder === 'asc' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="sortOrder"
                  checked={sortOrder === 'asc'}
                  onChange={() => setSortOrder('asc')}
                  disabled={isExporting}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: sortOrder === 'asc' ? '#fff' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ArrowUp size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Ascending Order</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    First <strong>24-25</strong>, then <strong>25-26</strong>, then <strong>26-27</strong>...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Format Mode Option */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Layers size={16} style={{ color: 'var(--primary)' }} />
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>2. Download Output Format:</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              <div
                onClick={() => !isExporting && setExportMode('individual')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${exportMode === 'individual' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: exportMode === 'individual' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="radio"
                  name="exportMode"
                  checked={exportMode === 'individual'}
                  onChange={() => setExportMode('individual')}
                  disabled={isExporting}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                    Individual PDF Files
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Downloads each computation as its own file in sequence
                  </div>
                </div>
              </div>

              <div
                onClick={() => !isExporting && setExportMode('combined')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${exportMode === 'combined' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: exportMode === 'combined' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="radio"
                  name="exportMode"
                  checked={exportMode === 'combined'}
                  onChange={() => setExportMode('combined')}
                  disabled={isExporting}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                    Single Combined Master PDF
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Merges all years in sequence into 1 consolidated PDF document
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sequence Execution Queue List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                EXECUTION QUEUE ({sortedComputations.length} COMPUTATIONS IN ORDER)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {sortOrder === 'desc' ? 'Latest FY First 🔻' : 'Oldest FY First 🔺'}
              </span>
            </div>

            <div
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.3)',
              }}
            >
              {sortedComputations.map((c, idx) => {
                const isCurrent = currentIndex === idx;
                const isDone = completedMap[c._id];
                const p = c.personalDetails || {};
                const name = p.name || c.employeeId?.fullName || 'Assessee';

                return (
                  <div
                    key={c._id || idx}
                    style={{
                      padding: '0.65rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: isCurrent
                        ? 'rgba(99, 102, 241, 0.15)'
                        : isDone
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'transparent',
                      fontSize: '0.825rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDone
                            ? 'var(--accent-emerald)'
                            : isCurrent
                            ? 'var(--primary)'
                            : 'rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>
                          FY {c.financialYear} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({name})</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                          AY {c.assessmentYear} • {c.regime === 'new_115bac' ? 'New 115BAC' : 'Old Regime'} • ₹{(Number(c.grossTotalIncome) || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isDone ? (
                        <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Downloaded
                        </span>
                      ) : isCurrent ? (
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Loader2 size={14} className="spin" /> Exporting...
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar during Export */}
          {isExporting && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>
                  {exportMode === 'individual'
                    ? `Exporting ${currentIndex + 1} of ${sortedComputations.length}: FY ${sortedComputations[currentIndex]?.financialYear}...`
                    : 'Compiling Consolidated Master PDF...'}
                </span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total: <strong>{sortedComputations.length}</strong> Computations in sequence
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isExporting ? (
              <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            ) : (
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Close
              </button>
            )}

            <button
              onClick={handleStartExport}
              disabled={isExporting || sortedComputations.length === 0}
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Exporting In Sequence...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Start Download All ({sortedComputations.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* OFF-SCREEN DOM RENDERING TARGET FOR INDIVIDUAL EXPORT */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          width: '850px',
          visibility: 'visible',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {activeRenderComputation && (
          <div id="batch-individual-computation-render-target">
            {activeRenderComputation.templateId === 'ca_audit' ? (
              <CaAuditTemplate
                computation={activeRenderComputation}
                company={findCompanyForComp(activeRenderComputation)}
              />
            ) : activeRenderComputation.templateId === 'modern_executive' ? (
              <ModernExecutiveTemplate
                computation={activeRenderComputation}
                company={findCompanyForComp(activeRenderComputation)}
              />
            ) : (
              <KdkZenitTemplate
                computation={activeRenderComputation}
                company={findCompanyForComp(activeRenderComputation)}
              />
            )}
          </div>
        )}
      </div>

      {/* OFF-SCREEN DOM RENDERING TARGET FOR COMBINED EXPORT */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          width: '850px',
          visibility: 'visible',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div id="batch-combined-computations-render-target">
          {sortedComputations.map((c, i) => {
            const company = findCompanyForComp(c);
            return (
              <div
                key={c._id || i}
                className="batch-combined-item"
                style={{
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                  marginBottom: '2rem',
                }}
              >
                {c.templateId === 'ca_audit' ? (
                  <CaAuditTemplate computation={c} company={company} />
                ) : c.templateId === 'modern_executive' ? (
                  <ModernExecutiveTemplate computation={c} company={company} />
                ) : (
                  <KdkZenitTemplate computation={c} company={company} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
