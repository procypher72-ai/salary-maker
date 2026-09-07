import React from 'react';

/**
 * High-fidelity Digital Signature and Official Company Seal / Stamp renderer
 */
export const SignatureStampBox = ({
  company = {},
  isEditable = false,
  signatoryTitle = 'Authorized Signatory',
  signatorySubtitle = '',
  align = 'right', // 'left' | 'center' | 'right'
}) => {
  const isSigEnabled = company?.showSignature !== false;
  const isStampEnabled = company?.showStamp !== false;

  // If BOTH Digital Signature & Stamp are unchecked/disabled by the user, completely hide the entire signature block
  if (!isSigEnabled && !isStampEnabled) {
    return null;
  }

  const showSig = isSigEnabled && Boolean(company?.signatureUrl);
  const showStm = isStampEnabled && Boolean(company?.stampUrl);
  const sigUrl = company?.signatureUrl;
  const stampUrl = company?.stampUrl;

  const sigWidth = company?.signatureWidth || 120;
  const sigHeight = company?.signatureHeight || 45;
  const sigOffsetX = company?.signatureOffsetX || 0;
  const sigOffsetY = company?.signatureOffsetY || 0;

  const stampWidth = company?.stampWidth || 85;
  const stampHeight = company?.stampHeight || 85;
  const stampOffsetX = company?.stampOffsetX || 0;
  const stampOffsetY = company?.stampOffsetY || 0;
  const stampOpacity = company?.stampOpacity !== undefined ? company.stampOpacity / 100 : 0.85;

  const hasMedia = showSig || showStm;

  const containerAlignStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
    textAlign: align,
    position: 'relative',
    minWidth: '180px',
  };

  return (
    <div className="sig-stamp-container" style={containerAlignStyle}>
      {/* Visual Overlay Zone for Stamp & Signature */}
      <div
        style={{
          position: 'relative',
          height: hasMedia ? '65px' : '22px',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
          marginBottom: '4px',
        }}
      >
        {/* Official Seal / Company Stamp (Positioned with authentic slight rotation) */}
        {showStm && stampUrl && (
          <div
            style={{
              position: 'absolute',
              right: align === 'right' ? `${20 + stampOffsetX}px` : undefined,
              left: align === 'left' ? `${20 + stampOffsetX}px` : undefined,
              bottom: `${-10 + stampOffsetY}px`,
              opacity: stampOpacity,
              transform: 'rotate(-10deg)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <img
              src={stampUrl}
              alt="Company Official Seal"
              style={{
                width: `${stampWidth}px`,
                height: `${stampHeight}px`,
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
              }}
            />
          </div>
        )}

        {/* Digital Signature */}
        {showSig && sigUrl && (
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              transform: `translate(${sigOffsetX}px, ${sigOffsetY}px)`,
            }}
          >
            <img
              src={sigUrl}
              alt="Digital Signature"
              style={{
                width: `${sigWidth}px`,
                height: `${sigHeight}px`,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}
      </div>

      {/* Signatory Text & Rule Line */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid #334155',
          paddingTop: '4px',
          zIndex: 3,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', letterSpacing: '0.02em' }}>
          {signatoryTitle || company?.signatoryName || 'Authorized Signatory'}
        </div>
        {(signatorySubtitle || company?.signatoryDesignation) && (
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: '1px' }}>
            {signatorySubtitle || company?.signatoryDesignation}
          </div>
        )}
      </div>
    </div>
  );
};
