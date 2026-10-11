import React from 'react';
import SentinelAI from './pages/SentinelAI';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050A12' }}>
      {/* Header */}
      <nav style={{
        background: '#07152A',
        borderBottom: '1px solid #14304A',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 52,
        flexShrink: 0,
        gap: 12,
      }}>
        <div style={{
          width: 30, height: 30,
          background: 'linear-gradient(135deg, #00D4FF, #0066AA)',
          borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🛡️</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>SentinelAI</div>
          <div style={{ fontSize: 9, color: '#00D4FF', letterSpacing: 1.5 }}>PROMPT INJECTION FIREWALL · ET AI HACKATHON</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            padding: '3px 12px', borderRadius: 10, fontSize: 10, fontWeight: 700,
            border: '1px solid #00D4FF', color: '#00D4FF',
            background: 'rgba(0,212,255,0.1)',
          }}>9 ATTACK VECTORS · REAL-TIME DETECTION</div>
        </div>
      </nav>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SentinelAI />
      </div>
    </div>
  );
}
