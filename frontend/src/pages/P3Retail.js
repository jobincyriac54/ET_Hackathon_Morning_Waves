import React, { useState } from 'react';
import { streamPost } from '../utils/api';
import { AIOutput, Btn, Card, RangeSlider, Tabs, Label, Select, Textarea } from '../components/Shared';

const TABS = [
  { id: 'strategy', label: '📊 Strategy' },
  { id: 'cannibal', label: '⚠️ Cannibalization' },
  { id: 'geo', label: '🗺️ Geo Customisation' },
  { id: 'simulation', label: '🔮 Pre-Launch Sim' },
  { id: 'reasoning', label: '🤖 Agent Reasoning' },
];

const PRODUCTS = [
  { id: 'tshirts', label: '👕 T-Shirts' },
  { id: 'jeans', label: '👖 Jeans' },
  { id: 'sneakers', label: '👟 Sneakers' },
  { id: 'jackets', label: '🧥 Jackets' },
  { id: 'bags', label: '👜 Bags' },
  { id: 'watches', label: '⌚ Watches' },
  { id: 'accessories', label: '💄 Accessories' },
  { id: 'footwear', label: '🥿 Footwear' },
];

const SEGMENTS = [
  { id: 'youth', label: '🧑 Youth 18–25' },
  { id: 'working', label: '💼 Working 26–40' },
  { id: 'premium', label: '💎 Premium' },
  { id: 'family', label: '👨‍👩‍👧 Family' },
];

export default function P3Retail() {
  const [tab, setTab] = useState('strategy');
  const [outputs, setOutputs] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedProducts, setSelectedProducts] = useState(['tshirts', 'sneakers', 'bags']);
  const [selectedSegments, setSelectedSegments] = useState(['youth', 'working']);
  const [marginFloor, setMarginFloor] = useState(20);
  const [budget, setBudget] = useState(35);
  const [clearance, setClearance] = useState(30);
  const [season, setSeason] = useState('Diwali Season (Oct–Nov)');
  const [geo, setGeo] = useState('All India — Regional Customisation');
  const [competitorCtx, setCompetitorCtx] = useState('Competitor A running 30% off T-shirts. Competitor B doing BOGO sneakers. Our T-shirt price ₹699 vs their ₹599.');
  const [planDesc, setPlanDesc] = useState('Configure inputs on the left and click Generate to get a full AI-powered plan.');

  const toggleProduct = id => setSelectedProducts(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleSeg = id => setSelectedSegments(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const productNames = selectedProducts.map(id => PRODUCTS.find(p => p.id === id)?.label.replace(/[^\w\s]/gi, '').trim());
  const segmentNames = selectedSegments.map(id => SEGMENTS.find(s => s.id === id)?.label.replace(/[^\w\s]/gi, '').trim());

  async function stream(key, path, body) {
    setLoading(l => ({ ...l, [key]: true }));
    setOutputs(o => ({ ...o, [key]: '' }));
    try {
      await streamPost(path, body, text => setOutputs(o => ({ ...o, [key]: text })));
    } catch (e) {
      setOutputs(o => ({ ...o, [key]: `Error: ${e.message}` }));
    }
    setLoading(l => ({ ...l, [key]: false }));
  }

  async function generateAll() {
    setPlanDesc(`AI strategy for ${season} · Margin ≥${marginFloor}% · Budget ₹${budget}L`);
    const base = { products: productNames, marginFloor, budget, clearanceTarget: clearance, season, geography: geo, segments: segmentNames, competitorContext: competitorCtx };

    // Fire all tabs in parallel
    setTab('strategy');
    stream('strategy', '/p3/generate', base);
    stream('cannibal', '/p3/cannibalization', base);
    stream('geo', '/p3/geo', base);
    stream('simulation', '/p3/simulate', { ...base, discountRange: `${Math.max(15, 35 - marginFloor)}-${Math.max(20, 40 - marginFloor)}` });
    stream('reasoning', '/p3/reasoning', base);
  }

  const checkStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 9px', border: `1px solid ${active ? '#2D6A1E' : '#D0DAC8'}`,
    borderRadius: 5, cursor: 'pointer', fontSize: 12, marginBottom: 5,
    background: active ? '#EBF5E6' : '#fff', color: active ? '#2D6A1E' : '#5A6B50',
    transition: 'all .15s', userSelect: 'none',
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 240px', height: 'calc(100vh - 52px)', background: '#F4F7F0' }}>
      {/* Sidebar */}
      <div style={{ background: '#fff', borderRight: '1px solid #D0DAC8', padding: 18, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#7A8B70', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Product Selection</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 16 }}>
          {PRODUCTS.map(p => (
            <div key={p.id} style={checkStyle(selectedProducts.includes(p.id))} onClick={() => toggleProduct(p.id)}>
              <input type="checkbox" readOnly checked={selectedProducts.includes(p.id)} style={{ accentColor: '#2D6A1E', cursor: 'pointer' }} />
              {p.label}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: '#7A8B70', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Business Constraints</div>
        <RangeSlider label="Minimum Margin Floor" min={10} max={40} value={marginFloor} onChange={setMarginFloor} format={v => `${v}%`} />
        <RangeSlider label="Marketing Budget" min={5} max={100} value={budget} onChange={setBudget} format={v => `₹${v}L`} />
        <RangeSlider label="Inventory Clearance Target" min={0} max={80} value={clearance} onChange={setClearance} format={v => `${v}%`} />

        <div style={{ fontSize: 10, fontWeight: 700, color: '#7A8B70', letterSpacing: 1.5, margin: '16px 0 10px', textTransform: 'uppercase' }}>Season & Geography</div>
        <Label>Upcoming Event</Label>
        <Select value={season} onChange={e => setSeason(e.target.value)} style={{ marginBottom: 10 }}>
          {['Diwali Season (Oct–Nov)', 'End of Season Sale', 'New Year Clearance', 'Independence Day', 'Back to School', 'Republic Day Sale'].map(s => <option key={s}>{s}</option>)}
        </Select>
        <Label>Target Geography</Label>
        <Select value={geo} onChange={e => setGeo(e.target.value)} style={{ marginBottom: 16 }}>
          {['All India — Regional Customisation', 'Metro Cities Only', 'Tier 2 & 3 Cities Focus', 'South India Focus', 'North India Focus'].map(g => <option key={g}>{g}</option>)}
        </Select>

        <div style={{ fontSize: 10, fontWeight: 700, color: '#7A8B70', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Customer Segments</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 16 }}>
          {SEGMENTS.map(s => (
            <div key={s.id} style={checkStyle(selectedSegments.includes(s.id))} onClick={() => toggleSeg(s.id)}>
              <input type="checkbox" readOnly checked={selectedSegments.includes(s.id)} style={{ accentColor: '#2D6A1E' }} />
              {s.label}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: '#7A8B70', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Competitor Context</div>
        <Textarea rows={3} value={competitorCtx} onChange={e => setCompetitorCtx(e.target.value)} style={{ marginBottom: 16 }} />

        <button onClick={generateAll} disabled={Object.values(loading).some(Boolean) || selectedProducts.length === 0}
          style={{
            width: '100%', padding: '12px', background: '#2D6A1E', color: '#fff', border: 'none', borderRadius: 7,
            fontFamily: 'Inter', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            opacity: Object.values(loading).some(Boolean) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {Object.values(loading).some(Boolean) && <span className="spinner" style={{ borderTopColor: '#fff' }} />}
          🤖 Generate AI Promotion Plan
        </button>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
        <div style={{ padding: '14px 20px 4px', borderBottom: '1px solid #D0DAC8' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1A2010' }}>AI Promotion Strategy</div>
          <div style={{ fontSize: 12, color: '#7A8B70', marginTop: 2, marginBottom: 10 }}>{planDesc}</div>
        </div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {tab === 'strategy' && (
            outputs.strategy || loading.strategy
              ? <AIOutput text={outputs.strategy} loading={loading.strategy} placeholder="Full promotion strategy will stream in here…" />
              : <div style={{ background: '#F4F7F0', border: '1.5px dashed #D0DAC8', borderRadius: 10, padding: 40, textAlign: 'center', color: '#7A8B70' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2010' }}>Ready to build your promotion strategy</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Configure inputs on the left → Click Generate → Get complete AI-powered plan across all 5 tabs</div>
                </div>
          )}
          {tab === 'cannibal' && <AIOutput text={outputs.cannibal} loading={loading.cannibal} placeholder="Cannibalization risk matrix, safe/unsafe combinations, and optimal sequencing calendar will appear here…" />}
          {tab === 'geo' && <AIOutput text={outputs.geo} loading={loading.geo} placeholder="City-by-city discount depths, media channel mix, and budget allocation by geography will appear here…" />}
          {tab === 'simulation' && <AIOutput text={outputs.simulation} loading={loading.simulation} placeholder="4-week revenue forecast, best/expected/worst case scenarios, break-even analysis, and contingency plans will appear here…" />}
          {tab === 'reasoning' && <AIOutput text={outputs.reasoning} loading={loading.reasoning} placeholder="The agent's full step-by-step decision reasoning — product selection, discount math, sequencing logic, and constraint checks — will appear here…" />}
        </div>
      </div>

      {/* Right */}
      <div style={{ background: '#1A2010', color: '#fff', padding: 18, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#4A7040', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>Constraint Check</div>
        {[
          [`✓ Margin floor: ${marginFloor}%`, true],
          [`✓ Budget: ₹${budget}L set`, true],
          [`⚠ T-shirts: High stock`, false],
          [`⚠ Clearance target: ${clearance}%`, false],
        ].map(([msg, ok]) => (
          <div key={msg} style={{ padding: '7px 10px', borderRadius: 5, marginBottom: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, background: ok ? 'rgba(74,158,48,0.15)' : 'rgba(217,94,16,0.15)', color: ok ? '#7FCC5A' : '#FF9060' }}>{msg}</div>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: '#4A7040', letterSpacing: 2, margin: '16px 0 12px', textTransform: 'uppercase' }}>Competitor Intel</div>
        {[
          ['Competitor A', 'T-Shirt ₹599', 'We ₹699 ↑', false],
          ['Competitor B', 'Sneakers BOGO', 'Aggressive', false],
          ['Market', season.split(' ')[0], 'High demand', true],
        ].map(([name, price, diff, good]) => (
          <div key={name} style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#A0C090' }}>{name}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono', color: '#fff', fontSize: 11 }}>{price}</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: good ? '#70CC70' : '#FF7070' }}>{diff}</div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: '#4A7040', letterSpacing: 2, margin: '16px 0 12px', textTransform: 'uppercase' }}>Selected Products</div>
        <div style={{ fontSize: 12, color: '#7A9070', lineHeight: 2.2 }}>
          {selectedProducts.map(id => {
            const p = PRODUCTS.find(p => p.id === id);
            return <div key={id}>{p?.label}</div>;
          })}
          {selectedProducts.length === 0 && <div style={{ color: '#FF9060' }}>No products selected</div>}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: '#4A7040', letterSpacing: 2, margin: '16px 0 12px', textTransform: 'uppercase' }}>Product Relationships</div>
        <div style={{ fontSize: 11, color: '#7A9070', lineHeight: 2.2 }}>
          <div>👟 Sneakers → 🧦 Socks (67%)</div>
          <div>👜 Bags → 💄 Accessories (43%)</div>
          <div>👕 T-Shirt → 👖 Jeans (paired)</div>
        </div>
      </div>
    </div>
  );
}
