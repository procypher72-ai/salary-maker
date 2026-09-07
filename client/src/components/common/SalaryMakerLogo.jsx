import React from 'react';
import logoImg from '../../assets/salary-maker-logo.png';

/**
 * Modern corporate logo for Salary Maker:
 * - Left: Sleek minimalist icon of interlocking shield and payroll document with a glowing cyan currency accent ($)
 * - Right: Bold modern typography reading "SALARY MAKER" with sub-label "PAYROLL SYSTEM"
 */
export const SalaryMakerIcon = ({ size = 36, className = '', glow = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`salary-maker-icon-svg ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Cyan Neon Glow Filter */}
        <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Linear Gradients */}
        <linearGradient id="shieldGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="docGrad" x1="50" y1="15" x2="105" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id="cyanAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* 1. Background Document with folded corner (Payroll Document) */}
      <path
        d="M48 20 H86 L102 36 V92 C102 96.4183 98.4183 100 94 100 H48"
        stroke="url(#docGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Document Folded Corner Line */}
      <path
        d="M86 20 V36 H102"
        stroke="url(#docGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Document Subtle Content Lines */}
      <path
        d="M80 54 H94 M80 66 H94 M80 78 H90"
        stroke="#06b6d4"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* 2. Interlocking Security Shield */}
      <path
        d="M24 38 L58 24 L68 28 M24 38 V66 C24 86 58 102 58 102 C58 102 76 93.5 86 80"
        stroke="url(#shieldGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shield Inner Geometric Notch */}
      <path
        d="M36 47 L58 37 M36 47 V65 C36 78 58 90 58 90"
        stroke="#06b6d4"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* 3. Glowing Cyan Currency Symbol ($) Accent */}
      <g filter={glow ? 'url(#cyanGlow)' : undefined}>
        {/* Glow halo circle */}
        <circle cx="58" cy="62" r="18" fill="rgba(6, 182, 212, 0.12)" />
        {/* Currency $ text/mark */}
        <text
          x="58"
          y="72"
          textAnchor="middle"
          fill="#00f2fe"
          fontSize="30"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          style={{ textShadow: '0 0 12px rgba(0, 242, 254, 0.8)' }}
        >
          $
        </text>
      </g>
    </svg>
  );
};

export const SalaryMakerLogo = ({
  variant = 'full', // 'full' | 'icon' | 'image' | 'horizontal'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  className = '',
  style = {},
  onClick,
}) => {
  const sizeMap = {
    sm: { icon: 28, titleSize: '1rem', subSize: '0.55rem', imgHeight: 28 },
    md: { icon: 38, titleSize: '1.25rem', subSize: '0.65rem', imgHeight: 38 },
    lg: { icon: 52, titleSize: '1.65rem', subSize: '0.75rem', imgHeight: 52 },
    xl: { icon: 72, titleSize: '2.25rem', subSize: '0.9rem', imgHeight: 72 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'image') {
    return (
      <div
        className={`salary-maker-logo-wrapper image-mode ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', cursor: onClick ? 'pointer' : 'default', ...style }}
        onClick={onClick}
      >
        <img
          src={logoImg}
          alt="Salary Maker Logo"
          style={{
            height: currentSize.imgHeight,
            width: 'auto',
            borderRadius: '8px',
            objectFit: 'contain',
            boxShadow: '0 4px 16px rgba(0, 242, 254, 0.15)',
          }}
        />
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div
        className={`salary-maker-logo-icon-wrap ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
        onClick={onClick}
      >
        <SalaryMakerIcon size={currentSize.icon} />
      </div>
    );
  }

  return (
    <div
      className={`salary-maker-brand-header ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.85rem',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      <div className="brand-icon-emblem">
        <SalaryMakerIcon size={currentSize.icon} />
      </div>
      <div className="brand-titles">
        <h1
          style={{
            fontSize: currentSize.titleSize,
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: 0,
            lineHeight: 1.1,
            color: '#ffffff',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            textTransform: 'uppercase',
          }}
        >
          Salary Maker
        </h1>
        {showTagline && (
          <span
            style={{
              fontSize: currentSize.subSize,
              fontWeight: 700,
              color: '#00f2fe',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              display: 'block',
              marginTop: '2px',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            Payroll System
          </span>
        )}
      </div>
    </div>
  );
};

export default SalaryMakerLogo;
