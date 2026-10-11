import React, { useState } from 'react';
import P1Banking from './pages/P1Banking';
import P2Cybersec from './pages/P2Cybersec';
import P3Retail from './pages/P3Retail';
import P4Energy from './pages/P4Energy';

const PROBLEMS = [
  { id: 'p1', label: '⚖️ P1 — Banking', subtitle: 'RegGuard AI', color: '#C9A84C' },
  { id: 'p2', label: '🛡️ P2 — CyberSec', subtitle: 'SentinelAI', color: '#00D4FF' },
  { id: 'p3', label: '🏪 P3 — Retail', subtitle: 'PromoMind', color: '#4A9E30' },
  { id: 'p4', label: '⚡ P4 — Energy', subtitle: 'GridMind', color: '#FFB800' },
];

export default function App() {
  const [active, setActive] = useState('p1');
  const problem = PROBLEMS.find(p => p.id === active);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0B1E3D' }}>
      {/* ── Global Nav ── */}
      <nav style={{
        background: '#07152A',
        borderBottom: '1px solid #14304A',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 52,
        flexShrink: 0,
        gap: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 28 }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, #C9A84C, #E8C96D)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🏆</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>ET AI Hackathon</div>
            <div style={{ fontSize: 9, color: '#C9A84C', letterSpacing: 1.5 }}>AGENTIC EDITION × ACCENTURE</div>
          </div>
        </div>

        {/* Problem Tabs */}
        {PROBLEMS.map(p => (
          <button key={p.id} onClick={() => setActive(p.id)} style={{
            padding: '0 18px',
            height: 52,
            background: active === p.id ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: 'none',
            borderBottom: active === p.id ? `2px solid ${p.color}` : '2px solid transparent',
            color: active === p.id ? '#fff' : '#5A7A9A',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: active === p.id ? 700 : 500,
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}>
            <span>{p.label}</span>
            <span style={{ fontSize: 9, color: active === p.id ? p.color : '#3A5070', letterSpacing: 0.5 }}>{p.subtitle}</span>
          </button>
        ))}

        {/* Badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
            border: `1px solid ${problem.color}`, color: problem.color,
            background: `${problem.color}18`,
          }}>F3 / D3 FULL COVERAGE</div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {active === 'p1' && <P1Banking />}
        {active === 'p2' && <P2Cybersec />}
        {active === 'p3' && <P3Retail />}
        {active === 'p4' && <P4Energy />}
      </div>
    </div>
  );
}
