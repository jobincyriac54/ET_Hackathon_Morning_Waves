import React, { useState, useEffect, useRef } from 'react';
import { streamPost } from '../utils/api';
import { LogItem } from '../components/Shared';

const SCENARIOS = [
  { id: 'cloud', label: '☁️ Cloud covers solar' },
  { id: 'wind_spike', label: '💨 Wind spike +50%' },
  { id: 'price_spike', label: '📈 Price spike ₹7.8/kWh' },
  { id: 'battery_fail', label: '🔋 Battery fault' },
  { id: 'demand_surge', label: '⚡ Demand surge' },
  { id: 'transmission', label: '🔌 Transmission limit' },
  { id: 'storm', label: '🌪️ Storm alert' },
  { id: 'weather_update', label: '🌦️ Forecast updated' },
  { id: 'maintenance', label: '🔧 Maintenance window' },
];

const SCENARIO_UPDATES = {
  cloud: { solar: 303, surplus: -7, storm: 'None' },
  wind_spike: { wind: 215, surplus: 53 },
  price_spike: { price: 7.8 },
  battery_fail: { batBeta: 0, batBetaStatus: 'OFFLINE — BMS FAULT' },
  demand_surge: { demand: 531, surplus: -33 },
  transmission: { transmission: 98 },
  storm: { wind: 109, storm: 'CYCLONE 6HR ⚠' },
  weather_update: { solar: 303 },
  maintenance: {},
};

export default function P4Energy() {
  const [gridState, setGridState] = useState({ solar: 342, wind: 187, batAlpha: 72, batAlphaStatus: 'Charging 40MW', batBeta: 61, batBetaStatus: 'Standby', demand: 498, price: 4.2, transmission: 62, surplus: 31, storm: 'None' });
  const [logs, setLogs] = useState([
    { time: '--:--', type: 'info', message: 'GridMind online — 5 solar, 3 wind, 2 BESS. Monitoring active.' },
    { time: '--:--', type: 'charge', message: 'BESS Alpha charging at 40MW — renewable surplus 31MW, price forecast to rise at 15:00.' },
    { time: '--:--', type: 'sell', message: 'Grid export 60MW @ ₹4.2/kWh. Delaying full sell — ₹5.8/kWh forecast at 15:15.' },
  ]);
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryOutput, setQueryOutput] = useState('');
  const [query, setQuery] = useState('Should I sell more power now or wait for the predicted price spike at 15:15? Also, what is the optimal battery strategy for the next 4 hours?');
  const [actionCount, setActionCount] = useState(3);
  const [firedScenario, setFiredScenario] = useState(null);
  const [clock, setClock] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Solar flicker
  useEffect(() => {
    const id = setInterval(() => {
      setGridState(g => ({ ...g, solar: Math.max(280, Math.min(400, g.solar + Math.round((Math.random() - 0.5) * 5))) }));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  function addLog(type, msg) {
    const time = new Date().toTimeString().slice(0, 5);
    setLogs(l => [{ time, type, message: msg }, ...l.slice(0, 49)]);
    setActionCount(c => c + 1);
  }

  async function fireScenario(sc) {
    setFiredScenario(sc.id);
    setAiOutput('');
    setAiLoading(true);

    // Update grid state
    const upd = SCENARIO_UPDATES[sc.id] || {};
    setGridState(g => ({ ...g, ...upd }));
    addLog('alert', `SCENARIO: ${sc.label}`);

    try {
      await streamPost('/p4/scenario', { scenario: sc.label, gridState }, text => setAiOutput(text));
    } catch (e) {
      setAiOutput('Error: ' + e.message);
    }

    // Extract and log key actions from AI output
    setAiOutput(prev => {
      const lines = prev.split('\n').filter(l => l.trim().length > 30);
      const kw = ['charge', 'discharge', 'sell', 'buy', 'curtail', 'demand response', 'alert'];
      let added = 0;
      for (const line of lines) {
        if (added >= 4) break;
        const lower = line.toLowerCase();
        for (const k of kw) {
          if (lower.includes(k)) {
            const type = k === 'discharge' ? 'charge' : k === 'demand response' ? 'demand' : k === 'alert' ? 'alert' : k;
            addLog(type, line.replace(/^[-•*\d.)\s]+/, '').trim().substring(0, 140));
            added++; break;
          }
        }
      }
      return prev;
    });

    setAiLoading(false);
    setTimeout(() => setFiredScenario(null), 3000);
  }

  async function askAgent() {
    if (!query.trim()) return;
    setQueryLoading(true);
    setQueryOutput('');
    try {
      await streamPost('/p4/query', { question: query, gridState }, text => setQueryOutput(text));
      addLog('ai', 'Custom query answered: ' + query.substring(0, 70));
    } catch (e) {
      setQueryOutput('Error: ' + e.message);
    }
    setQueryLoading(false);
  }

  const tm = (label, val, color) => (
    <div style={{ padding: '8px 16px', borderRight: '1px solid #14304A', textAlign: 'center', minWidth: 100 }}>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Share Tech Mono, JetBrains Mono, monospace', color, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 9, color: '#3A6080', marginTop: 2, letterSpacing: 0.4 }}>{label}</div>
    </div>
  );

  const asset = (emoji, name, stat, pct, color) => (
    <div style={{ border: '1px solid #14304A', borderRadius: 5, padding: '8px 10px', marginBottom: 7 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#E8F4FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{emoji} {name}</span>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: pct > 50 ? '#00FF6A' : '#FFB800', boxShadow: `0 0 5px ${pct > 50 ? '#00FF6A' : '#FFB800'}` }} />
      </div>
      <div style={{ fontSize: 10, color: '#3A6080', fontFamily: 'JetBrains Mono, monospace', marginTop: 3 }}>{stat}</div>
      <div style={{ height: 4, background: '#14304A', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)', background: '#06101A', color: '#B0CDE0' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', background: '#0B1C2C', borderBottom: '1px solid #14304A', overflowX: 'auto' }}>
        {tm('SOLAR OUTPUT', `${gridState.solar} MW`, '#FFB800')}
        {tm('WIND OUTPUT', `${gridState.wind} MW`, '#00E5FF')}
        {tm('BESS SOC', `${gridState.batAlpha}%`, '#00FF6A')}
        {tm('GRID DEMAND', `${gridState.demand} MW`, '#2979FF')}
        {tm('PRICE', `₹${gridState.price}/kWh`, '#FFB800')}
        {tm('RENEWABLE', `${Math.round((gridState.solar + gridState.wind) / gridState.demand * 100)}%`, '#00FF6A')}
        {tm('SURPLUS', `${gridState.surplus > 0 ? '+' : ''}${gridState.surplus} MW`, gridState.surplus >= 0 ? '#00FF6A' : '#FF3D3D')}
        <div style={{ padding: '8px 16px', textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#00E5FF' }}>{clock}</div>
          <div style={{ fontSize: 9, color: '#3A6080', marginTop: 2 }}>LIVE CLOCK</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 220px', flex: 1, overflow: 'hidden' }}>
        {/* Left: Assets */}
        <div style={{ background: '#0B1C2C', borderRight: '1px solid #14304A', overflowY: 'auto', padding: '12px 10px' }}>
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#3A6080', letterSpacing: 2, marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid #14304A' }}>// SOLAR FARMS (5)</div>
          {asset('☀️', 'SF1 — Rajasthan', `${Math.min(100, Math.round(gridState.solar * 0.24))} MW / 100 MW`, Math.round(gridState.solar * 0.24), '#FFB800')}
          {asset('☀️', 'SF2 — Gujarat', '95 MW / 120 MW', 79, '#FFB800')}
          {asset('☀️', 'SF3 — Andhra', '61 MW / 80 MW', 76, '#FFB800')}
          {asset('☀️', 'SF4 — Tamil Nadu', '74 MW / 90 MW', 82, '#FFB800')}
          {asset('☀️', 'SF5 — Maharashtra', '30 MW / 80 MW', 38, '#FFB800')}
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#3A6080', letterSpacing: 2, marginBottom: 8, marginTop: 10, paddingBottom: 5, borderBottom: '1px solid #14304A' }}>// WIND FARMS (3)</div>
          {asset('💨', 'WF-A — Kutch', `${Math.round(gridState.wind * 0.42)} MW / 90 MW`, Math.round(gridState.wind * 0.42 / 0.9), '#00E5FF')}
          {asset('💨', 'WF-B — TN Coast', '62 MW / 75 MW', 83, '#00E5FF')}
          {asset('💨', 'WF-C — Rajasthan', '47 MW / 60 MW', 78, '#00E5FF')}
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#3A6080', letterSpacing: 2, marginBottom: 8, marginTop: 10, paddingBottom: 5, borderBottom: '1px solid #14304A' }}>// BATTERY (2)</div>
          {asset('🔋', 'BESS Alpha 200MWh', `SOC:${gridState.batAlpha}% · ${gridState.batAlphaStatus}`, gridState.batAlpha, '#00FF6A')}
          {asset('🔋', 'BESS Beta 150MWh', `SOC:${gridState.batBeta}% · ${gridState.batBetaStatus}`, gridState.batBeta, gridState.batBeta === 0 ? '#FF3D3D' : '#00FF6A')}
        </div>

        {/* Center */}
        <div style={{ overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Scenarios */}
          <div style={{ background: '#0B1C2C', border: '1px solid #14304A', borderRadius: 7 }}>
            <div style={{ padding: '9px 14px', background: '#0F2338', borderBottom: '1px solid #14304A', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#00E5FF', borderRadius: '7px 7px 0 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>🌩️ INJECT SCENARIO → AI AGENT RESPONDS</span>
              <span style={{ color: '#00FF6A' }}>{actionCount} actions</span>
            </div>
            <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
              {SCENARIOS.map(s => (
                <button key={s.id} onClick={() => !aiLoading && fireScenario(s)} disabled={aiLoading}
                  style={{
                    padding: '7px 8px', border: `1px solid ${firedScenario === s.id ? '#FFB800' : '#14304A'}`,
                    borderRadius: 5, background: firedScenario === s.id ? 'rgba(255,184,0,0.1)' : 'transparent',
                    color: firedScenario === s.id ? '#FFB800' : '#B0CDE0',
                    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                    cursor: aiLoading ? 'not-allowed' : 'pointer', transition: 'all .15s',
                    opacity: aiLoading && firedScenario !== s.id ? 0.5 : 1,
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Log */}
          <div style={{ background: '#0B1C2C', border: '1px solid #14304A', borderRadius: 7 }}>
            <div style={{ padding: '9px 14px', background: '#0F2338', borderBottom: '1px solid #14304A', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#00E5FF', borderRadius: '7px 7px 0 0' }}>// AGENT ACTION LOG</div>
            <div style={{ maxHeight: 160, overflowY: 'auto' }} ref={logRef}>
              {logs.map((l, i) => <LogItem key={i} time={l.time} type={l.type} message={l.message} dark />)}
            </div>
          </div>

          {/* AI Response */}
          {(aiOutput || aiLoading) && (
            <div style={{ background: '#0B1C2C', border: '1px solid #14304A', borderRadius: 7 }}>
              <div style={{ padding: '9px 14px', background: '#0F2338', borderBottom: '1px solid #14304A', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#00E5FF', borderRadius: '7px 7px 0 0' }}>// FULL AI AGENT REASONING</div>
              <div style={{ padding: 12 }}>
                {aiLoading && !aiOutput && (
                  <div style={{ color: '#3A6080', fontStyle: 'italic', fontSize: 11, fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="spinner" style={{ borderTopColor: '#00E5FF' }} />
                    AI agent analysing scenario — computing optimal dispatch strategy…
                  </div>
                )}
                {aiOutput && (
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#B0CDE0', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto', lineHeight: 1.7 }}>
                    {aiOutput}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Objectives */}
          <div style={{ background: '#0B1C2C', border: '1px solid #14304A', borderRadius: 7 }}>
            <div style={{ padding: '9px 14px', background: '#0F2338', borderBottom: '1px solid #14304A', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#00E5FF', borderRadius: '7px 7px 0 0' }}>⚖️ MULTI-OBJECTIVE OPTIMALITY</div>
            <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['MINIMISE — COST', '₹2.1L/hr', '#FF3D3D', '↓ 18% vs baseline', 'rgba(255,61,61,.05)', 'rgba(255,61,61,.3)'],
                ['MINIMISE — CARBON', '4.2 t/hr', '#FFB800', '↓ 87% renewable mix', 'rgba(255,184,0,.05)', 'rgba(255,184,0,.3)'],
                ['MAXIMISE — REVENUE', '₹18.4L', '#00FF6A', '↑ Peak sell strategy', 'rgba(0,255,106,.05)', 'rgba(0,255,106,.3)'],
                ['MAXIMISE — RELIABILITY', '99.7%', '#00E5FF', '↑ 80MW reserve held', 'rgba(0,229,255,.05)', 'rgba(0,229,255,.2)'],
              ].map(([label, val, color, trend, bg, bc]) => (
                <div key={label} style={{ padding: '9px 11px', borderRadius: 5, border: `1px solid ${bc}`, background: bg }}>
                  <div style={{ fontSize: 9, letterSpacing: 0.5, color: '#3A6080' }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color, marginTop: 2 }}>{val}</div>
                  <div style={{ fontSize: 10, color: '#00FF6A', marginTop: 2 }}>{trend}</div>
                </div>
              ))}
            </div>
            <div style={{ margin: '0 12px 12px', padding: '8px 10px', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono', color: '#3A6080' }}>
              ACTIVE TRADE-OFF: Revenue vs Battery Degradation — BESS Beta in standby to preserve cycle life. Saves ₹12L/year in replacement cost. Revenue impact today: -₹0.8L.
            </div>
          </div>

          {/* Custom Query */}
          <div style={{ background: '#0B1C2C', border: '1px solid #14304A', borderRadius: 7 }}>
            <div style={{ padding: '9px 14px', background: '#0F2338', borderBottom: '1px solid #14304A', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#00E5FF', borderRadius: '7px 7px 0 0' }}>🤖 ASK THE AI AGENT ANYTHING</div>
            <div style={{ padding: 12 }}>
              <textarea value={query} onChange={e => setQuery(e.target.value)} rows={3}
                style={{ width: '100%', background: '#06101A', border: '1px solid #14304A', color: '#B0CDE0', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: 10, borderRadius: 4, resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                placeholder="Ask about dispatch decisions, battery strategy, market timing, 24h simulation…" />
              <button onClick={askAgent} disabled={queryLoading || !query.trim()}
                style={{ width: '100%', padding: 9, background: '#00E5FF', color: '#06101A', border: 'none', borderRadius: 5, fontFamily: 'Inter', fontSize: 13, fontWeight: 700, cursor: queryLoading ? 'not-allowed' : 'pointer', opacity: queryLoading ? 0.6 : 1, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {queryLoading && <span className="spinner" style={{ borderTopColor: '#06101A' }} />}
                🤖 Ask AI Agent
              </button>
              {queryOutput && (
                <div style={{ marginTop: 10, background: '#06101A', border: '1px solid #14304A', borderRadius: 5, padding: 10, fontSize: 11, fontFamily: 'JetBrains Mono', color: '#B0CDE0', whiteSpace: 'pre-wrap', maxHeight: 250, overflowY: 'auto', lineHeight: 1.7 }}>
                  {queryLoading && !queryOutput ? <span style={{ color: '#3A6080', fontStyle: 'italic' }}>Thinking…</span> : queryOutput}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Market data */}
        <div style={{ background: '#0B1C2C', borderLeft: '1px solid #14304A', overflowY: 'auto', padding: '12px 12px' }}>
          {[
            ['// MARKET DATA', null],
            ['Current Price', `₹${gridState.price}/kWh`, '#FFB800'],
            ['Peak Forecast (15:15)', '₹5.80/kWh', '#FF3D3D'],
            ['Carbon Price', '₹1,240/t CO₂', '#B0CDE0'],
            ['Demand Response', '₹180/MWh incentive', '#AA00FF'],
            ['// WEATHER', null],
            ['Irradiance (GHI)', '820 W/m²', '#FFB800'],
            ['Wind Speed', `${gridState.wind > 200 ? '28.0' : '14.2'} m/s`, '#00E5FF'],
            ['Storm Alert', gridState.storm, gridState.storm !== 'None' ? '#FF3D3D' : '#00FF6A'],
            ['Forecast Conf.', '94%', '#B0CDE0'],
            ['// TRANSMISSION', null],
            ['Line Capacity', '800 MW max', '#B0CDE0'],
            ['Current Load', `${gridState.demand} MW (${gridState.transmission}%)`, gridState.transmission > 90 ? '#FF3D3D' : '#00FF6A'],
            ['Headroom', `${800 - gridState.demand} MW`, gridState.transmission > 90 ? '#FF3D3D' : '#00FF6A'],
            ['// INDUSTRIAL', null],
            ['Steel Plant', '120 MW', '#E8F4FF'],
            ['Cement Plant', '85 MW', '#E8F4FF'],
            ['Data Center', '45 MW (DR eligible)', '#00E5FF'],
            ['Chemical Plant', '62 MW', '#E8F4FF'],
          ].map((item, i) => {
            if (!item[1]) return (
              <div key={i} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#3A6080', letterSpacing: 2, marginBottom: 8, marginTop: i > 0 ? 14 : 0, paddingBottom: 5, borderBottom: '1px solid #14304A' }}>{item[0]}</div>
            );
            return (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #14304A' }}>
                <div style={{ fontSize: 9, color: '#3A6080', fontFamily: 'JetBrains Mono' }}>{item[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono', color: item[2], marginTop: 1 }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#0F2338', borderTop: '1px solid #14304A', padding: '6px 20px', display: 'flex', gap: 16, fontSize: 10, fontFamily: 'JetBrains Mono', color: '#3A6080', overflowX: 'auto' }}>
        {[['DISPATCH', '15 MIN'], ['GRID FREQ', '50.02 Hz'], ['SURPLUS', `${gridState.surplus > 0 ? '+' : ''}${gridState.surplus} MW`], ['BESS RESERVE', '80 MW'], ['RENEWABLE MIX', '87%'], ['9-BLOCKER', 'F3/D3 FULL']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            {l} <span style={{ color: '#00E5FF', fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
