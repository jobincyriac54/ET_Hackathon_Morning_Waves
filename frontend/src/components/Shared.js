import React from 'react';

/* ── AIOutput ─────────────────────────────────────────────── */
export function AIOutput({ text, loading, placeholder, dark }) {
  const style = {
    background: dark ? '#0B1C2C' : '#F7FAFD',
    border: `1px solid ${dark ? '#1A3050' : '#D0E2F0'}`,
    borderRadius: 8,
    padding: 16,
    fontSize: 13,
    lineHeight: 1.8,
    color: dark ? '#B0CDE0' : '#1A2B3C',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 480,
    overflowY: 'auto',
    fontFamily: dark ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
    minHeight: 80,
  };

  return (
    <div style={style}>
      {loading ? (
        <span style={{ color: '#5A7A9A', fontStyle: 'italic' }}>
          <span className="spinner" style={{ borderTopColor: '#C9A84C' }} />
          AI agent is reasoning… this takes 10–20 seconds
        </span>
      ) : text ? text : (
        <span style={{ color: '#5A7A9A', fontStyle: 'italic' }}>
          {placeholder || 'Output will appear here…'}
        </span>
      )}
    </div>
  );
}

/* ── Btn ──────────────────────────────────────────────────── */
export function Btn({ onClick, disabled, loading, children, variant = 'primary', style: s }) {
  const base = {
    padding: '9px 20px',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    ...s,
  };
  const colors = {
    primary: { background: '#C9A84C', color: '#0B1E3D' },
    secondary: { background: 'transparent', color: '#1A2B3C', border: '1.5px solid #B0C8E0' },
    danger:  { background: '#C0392B', color: '#fff' },
    cyan:    { background: '#00D4FF', color: '#050A12' },
    green:   { background: '#2D6A1E', color: '#fff' },
    dark:    { background: '#1C3557', color: '#fff' },
  };
  return (
    <button style={{ ...base, ...colors[variant] }} onClick={onClick} disabled={disabled || loading}>
      {loading && <span className="spinner" style={{ borderTopColor: 'currentColor' }} />}
      {children}
    </button>
  );
}

/* ── Card ─────────────────────────────────────────────────── */
export function Card({ children, style: s, dark }) {
  return (
    <div style={{
      background: dark ? '#0C1825' : '#fff',
      border: `1px solid ${dark ? '#1A3050' : '#D8E5F0'}`,
      borderRadius: 10,
      padding: 18,
      ...s,
    }}>
      {children}
    </div>
  );
}

/* ── SectionTitle ─────────────────────────────────────────── */
export function SectionTitle({ children, style: s }) {
  return (
    <div style={{
      fontSize: 15,
      fontWeight: 700,
      color: '#0B1E3D',
      paddingBottom: 10,
      borderBottom: '2px solid #E8EEF5',
      marginBottom: 16,
      ...s,
    }}>
      {children}
    </div>
  );
}

/* ── Label ────────────────────────────────────────────────── */
export function Label({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#4A6080', marginBottom: 5 }}>{children}</div>;
}

/* ── Input / Textarea / Select ────────────────────────────── */
const inputBase = {
  width: '100%',
  padding: '8px 12px',
  border: '1.5px solid #B0C8E0',
  borderRadius: 6,
  fontSize: 13,
  color: '#1A2B3C',
  background: '#fff',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s',
};

export function Input({ style: s, ...props }) {
  return <input style={{ ...inputBase, ...s }} {...props} />;
}

export function Textarea({ rows = 4, style: s, ...props }) {
  return <textarea rows={rows} style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6, ...s }} {...props} />;
}

export function Select({ children, style: s, ...props }) {
  return <select style={{ ...inputBase, cursor: 'pointer', ...s }} {...props}>{children}</select>;
}

/* ── RangeSlider ──────────────────────────────────────────── */
export function RangeSlider({ label, min, max, value, onChange, format }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Label>{label}</Label>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', fontFamily: 'JetBrains Mono' }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#C9A84C', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5A7A9A', marginTop: 2 }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

/* ── Tag ──────────────────────────────────────────────────── */
export function Tag({ children, type = 'default' }) {
  const colors = {
    default: { bg: '#E8EEF5', color: '#4A6080' },
    red:     { bg: '#FDECEA', color: '#C0392B' },
    amber:   { bg: '#FEF6E4', color: '#D4820A' },
    green:   { bg: '#E8F5EE', color: '#1A7A4A' },
    blue:    { bg: '#E8F0F8', color: '#1A4F7A' },
    navy:    { bg: '#1C3557', color: '#C9A84C' },
  };
  const c = colors[type] || colors.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      background: c.bg,
      color: c.color,
    }}>
      {children}
    </span>
  );
}

/* ── MetricCard ───────────────────────────────────────────── */
export function MetricCard({ label, value, sub, valueColor, dark }) {
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      border: `1px solid ${dark ? 'rgba(201,168,76,0.2)' : '#D8E5F0'}`,
      borderRadius: 8,
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 10, color: dark ? '#5A7A9A' : '#5A7A9A', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: valueColor || (dark ? '#fff' : '#1A2B3C'), lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#C9A84C', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ── Tabs ─────────────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange, dark }) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: `2px solid ${dark ? '#1A3050' : '#E8EEF5'}`,
      background: dark ? '#0C1825' : '#F0F5FA',
      padding: '0 20px',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <div key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '12px 16px',
          fontSize: 12,
          fontWeight: active === t.id ? 700 : 500,
          cursor: 'pointer',
          color: active === t.id ? (dark ? '#00E5FF' : '#0B1E3D') : (dark ? '#3A6080' : '#5A7A9A'),
          borderBottom: `2px solid ${active === t.id ? (dark ? '#00E5FF' : '#C9A84C') : 'transparent'}`,
          marginBottom: -2,
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}>
          {t.label}
        </div>
      ))}
    </div>
  );
}

/* ── LogItem ──────────────────────────────────────────────── */
export function LogItem({ time, type, message, dark }) {
  const typeColors = {
    info:    '#00D4FF', block: '#FF3B3B', pass: '#00FF8C',
    charge:  '#00FF6A', sell:  '#2979FF', buy:  '#FFB800',
    curtail: '#FF3D3D', alert: '#FF3D3D', ai:   '#00FF6A',
  };
  return (
    <div style={{
      padding: '6px 14px',
      borderBottom: `1px solid rgba(255,255,255,0.04)`,
      fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
    }}>
      <span style={{ color: '#3A6080', flexShrink: 0, fontSize: 10, marginTop: 1 }}>{time}</span>
      <span style={{
        flexShrink: 0,
        padding: '1px 5px',
        borderRadius: 3,
        fontSize: 9,
        fontWeight: 700,
        color: typeColors[type] || '#00D4FF',
        background: `${typeColors[type] || '#00D4FF'}18`,
      }}>
        {type?.toUpperCase()}
      </span>
      <span style={{ color: dark ? '#B0CDE0' : '#1A2B3C', lineHeight: 1.5 }}>{message}</span>
    </div>
  );
}
