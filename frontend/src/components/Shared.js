import React from 'react';

export function Btn({ onClick, disabled, loading, children, style: s }) {
  return (
    <button
      style={{
        padding: '9px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        border: 'none', fontFamily: "'Inter', sans-serif",
        opacity: disabled || loading ? 0.55 : 1,
        transition: 'all 0.15s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#00D4FF', color: '#050A12',
        ...s,
      }}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner" style={{ borderTopColor: 'currentColor' }} />}
      {children}
    </button>
  );
}

export function LogItem({ time, type, message }) {
  const typeColors = {
    info:  '#00D4FF',
    block: '#FF3B3B',
    pass:  '#00FF8C',
    alert: '#FF3D3D',
  };
  return (
    <div style={{
      padding: '6px 14px',
      borderBottom: 'solid 1px rgba(255,255,255,0.04)',
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      <span style={{ color: '#3A6080', flexShrink: 0, fontSize: 10, marginTop: 1 }}>{time}</span>
      <span style={{
        flexShrink: 0, padding: '1px 5px', borderRadius: 3,
        fontSize: 9, fontWeight: 700,
        color: typeColors[type] || '#00D4FF',
        background: `${typeColors[type] || '#00D4FF'}18`,
      }}>
        {type?.toUpperCase()}
      </span>
      <span style={{ color: '#B0CDE0', lineHeight: 1.5 }}>{message}</span>
    </div>
  );
}
