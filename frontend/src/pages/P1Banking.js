import React, { useState } from 'react';
import { streamPost } from '../utils/api';
import { AIOutput, Btn, Card, SectionTitle, Label, Input, Textarea, Select, Tabs, MetricCard, Tag } from '../components/Shared';

const TABS = [
  { id: 'analyse', label: '📥 Document Analysis' },
  { id: 'obligations', label: '📋 Obligations' },
  { id: 'gaps', label: '🚨 Gap Analysis' },
  { id: 'remediation', label: '💊 Remediation' },
  { id: 'simulate', label: '🔮 What-If Sim' },
  { id: 'crossreg', label: '⚡ Cross-Regulation' },
];

const REGS = [
  'Basel III — Capital Adequacy Framework',
  'DPDPA 2023 — Data Protection Rules',
  'AML / PMLA Anti-Money Laundering Rules',
  'RBI Master Circular on KYC Norms',
  'FEMA Guidelines',
  'SEBI Listing Obligations',
];

export default function P1Banking() {
  const [tab, setTab] = useState('analyse');
  const [outputs, setOutputs] = useState({});
  const [loading, setLoading] = useState({});
  const [activeReg, setActiveReg] = useState(REGS[0]);

  // Form states
  const [form, setForm] = useState({
    regulationType: REGS[0],
    bankType: 'Domestic Scheduled Commercial Bank (D-SIB)',
    regulatoryText: '',
    controlsText: '',
    oblText: '',
    gapReg: 'Basel III LCR',
    gapDate: 'April 2026',
    gapStatus: 'We have CP-LIQ-03 (LCR policy). Last evidence: April 2026. Only covers HQ and 2 metro branches — 4 regional branches excluded. NSFR also partial. Unsure about 5-year vs DPDPA 3-year retention.',
    remInput: 'LCR evidence gap: 5 months missing (May–Sep 2026). Policy exists but upload is manual and was missed. Basel III requires monthly evidence. We are a D-SIB.',
    remUrgency: 'Critical — Immediate regulatory risk',
    remSize: 'D-SIB (large, systemically important)',
    simReg: 'Basel IV Phase 2: New output floor rules at 72.5% of standardised approach. Revised credit risk weights for residential mortgages and SME lending.',
    simControls: 'Using IRB approach. CET1 at 14.2%. Internal models for mortgages (RW:25%), SME (RW:75%), corporate (RW:60-80%). Documented in CP-CAP-01/02.',
    crRegA: 'Basel III requires complete audit trail of capital adequacy computations and evidence for minimum 5 years, including all HQLA data, LCR calculations, and supporting documentation.',
    crRegB: 'DPDPA 2023: Personal data shall not be retained beyond period necessary, and in no case beyond 3 years unless individual re-gives consent. Penalty: up to ₹250 crore.',
    crContext: 'Customer account data used in LCR computation — includes name, account balance, transaction history',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function callStream(key, path, body) {
    setLoading(l => ({ ...l, [key]: true }));
    setOutputs(o => ({ ...o, [key]: '' }));
    try {
      await streamPost(path, body, text => setOutputs(o => ({ ...o, [key]: text })));
    } catch (e) {
      setOutputs(o => ({ ...o, [key]: `Error: ${e.message}` }));
    }
    setLoading(l => ({ ...l, [key]: false }));
  }

  const loadDemo = () => {
    set('regulatoryText', 'RBI/2026-27/45 — Basel III Capital Framework Update\n\nAll Scheduled Commercial Banks shall maintain:\n1. Minimum CET1 ratio: 5.5% of RWA\n2. Tier 1 Capital: minimum 7% of RWA\n3. Total Capital: minimum 9% of RWA\n4. Capital Conservation Buffer: 2.5% additional CET1\n5. LCR: minimum 100% at all times for D-SIBs\n6. NSFR: minimum 100% effective April 2025\n7. Evidence of LCR compliance submitted monthly to Board Risk Committee with HQLA schedules\n8. All computation evidence retained for 5 years');
    set('controlsText', 'Controls: CP-CAP-01 (daily capital computation), CP-LIQ-03 (LCR policy — HQ and 2 metro branches only), CP-LIQ-05 (NSFR — partial, 3 of 7 branches). Last LCR evidence: April 2026. Regional branches (Pune, Surat, Coimbatore, Bhopal) not in LCR/NSFR scope.');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 260px', height: 'calc(100vh - 52px)', background: '#F0F5FA' }}>
      {/* Sidebar */}
      <div style={{ background: '#0D2040', borderRight: '1px solid rgba(201,168,76,0.2)', padding: '18px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>ACTIVE REGULATIONS</div>
          {REGS.map(r => (
            <div key={r} onClick={() => { setActiveReg(r); set('regulationType', r); }}
              style={{
                padding: '8px 10px', borderRadius: 6, marginBottom: 5, cursor: 'pointer',
                fontSize: 12, display: 'flex', alignItems: 'center', gap: 8,
                background: activeReg === r ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: activeReg === r ? '#fff' : '#9BB5D0',
                transition: 'all 0.15s',
              }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.includes('Basel') || r.includes('FEMA') ? '#E74C3C' : r.includes('DPDPA') || r.includes('RBI') ? '#F39C12' : '#2ECC71', flexShrink: 0 }} />
              {r.split(' — ')[0]}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>AGENT STATUS</div>
          {[['Regulatory Monitor', 'Active', '#2ECC71'], ['Gap Analysis', 'Running', '#F39C12'], ['Remediation Engine', 'Ready', '#2ECC71'], ['Change Detector', 'Live', '#2ECC71']].map(([n, s, c]) => (
            <div key={n} style={{ fontSize: 12, color: '#7A9AB8', marginBottom: 8 }}>
              <span style={{ color: c, marginRight: 6 }}>●</span>{n}: {s}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>QUICK ACTIONS</div>
          <Btn variant="primary" onClick={() => setTab('analyse')} style={{ width: '100%', marginBottom: 8, fontSize: 12, justifyContent: 'center' }}>+ Analyse Document</Btn>
          <Btn variant="dark" onClick={() => setTab('simulate')} style={{ width: '100%', fontSize: 12, justifyContent: 'center' }}>Run What-If Sim</Btn>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {tab === 'analyse' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Step 1 — Regulatory Document Ingestion & Intelligence</SectionTitle>
              <Card>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div><Label>Regulation Type</Label>
                    <Select value={form.regulationType} onChange={e => { set('regulationType', e.target.value); setActiveReg(e.target.value); }}>
                      {REGS.map(r => <option key={r}>{r}</option>)}
                      <option>Custom Regulation</option>
                    </Select>
                  </div>
                  <div><Label>Bank Type</Label>
                    <Select value={form.bankType} onChange={e => set('bankType', e.target.value)}>
                      <option>Domestic Scheduled Commercial Bank (D-SIB)</option>
                      <option>Private Sector Bank</option>
                      <option>Public Sector Bank</option>
                      <option>Small Finance Bank</option>
                      <option>Foreign Bank Branch</option>
                    </Select>
                  </div>
                </div>
                <Label>Regulatory Text or Requirement Description</Label>
                <Textarea rows={5} value={form.regulatoryText} onChange={e => set('regulatoryText', e.target.value)}
                  placeholder="Paste regulatory circular text, or describe the requirement…" style={{ marginBottom: 10 }} />
                <Label>Current Internal Controls (Optional)</Label>
                <Textarea rows={3} value={form.controlsText} onChange={e => set('controlsText', e.target.value)}
                  placeholder="Describe existing policies, evidence submitted, coverage gaps you already know about…" style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn loading={loading.analyse} onClick={() => callStream('analyse', '/p1/analyse', { regulationType: form.regulationType, bankType: form.bankType, regulatoryText: form.regulatoryText, controlsText: form.controlsText })}>🤖 Run AI Analysis</Btn>
                  <Btn variant="secondary" onClick={loadDemo}>Load Demo Data</Btn>
                </div>
              </Card>
              <AIOutput text={outputs.analyse} loading={loading.analyse} placeholder="Analysis output will appear here after clicking Run AI Analysis" />
            </div>
          )}

          {tab === 'obligations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Step 2 — Obligation Extraction & Control Mapping</SectionTitle>
              <Card>
                <Label>Regulation or Context to Extract Obligations From</Label>
                <Textarea rows={5} value={form.oblText} onChange={e => set('oblText', e.target.value)}
                  placeholder="Describe the regulation or paste key sections. The AI will extract numbered obligations the bank must fulfil…&#10;&#10;Example: Basel III LCR requirements for D-SIBs in India, including evidence requirements and monthly reporting timelines…"
                  style={{ marginBottom: 12 }} />
                <Btn loading={loading.obligations} onClick={() => callStream('obligations', '/p1/obligations', { text: form.oblText || form.regulatoryText })}>Extract Obligations & Map Controls</Btn>
              </Card>
              <AIOutput text={outputs.obligations} loading={loading.obligations} placeholder="Extracted obligations with OBL-IDs, control mapping template, and evidence requirements will appear here…" />
            </div>
          )}

          {tab === 'gaps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Step 3 — Gap Identification & Risk-Based Prioritization</SectionTitle>
              <Card>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div><Label>Regulation</Label><Input value={form.gapReg} onChange={e => set('gapReg', e.target.value)} /></div>
                  <div><Label>Last Evidence Date</Label><Input value={form.gapDate} onChange={e => set('gapDate', e.target.value)} /></div>
                </div>
                <Label>Describe Current Control Status</Label>
                <Textarea rows={4} value={form.gapStatus} onChange={e => set('gapStatus', e.target.value)} style={{ marginBottom: 12 }} />
                <Btn loading={loading.gaps} onClick={() => callStream('gaps', '/p1/gaps', { regulation: form.gapReg, lastEvidenceDate: form.gapDate, currentStatus: form.gapStatus })}>Identify & Prioritize Gaps</Btn>
              </Card>
              <AIOutput text={outputs.gaps} loading={loading.gaps} placeholder="Gap inventory with risk scores, priority ranking, and regulatory exposure will appear here…" />
            </div>
          )}

          {tab === 'remediation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Step 4 — Remediation Recommendation Engine</SectionTitle>
              <Card>
                <Label>Gap Description</Label>
                <Textarea rows={4} value={form.remInput} onChange={e => set('remInput', e.target.value)} style={{ marginBottom: 10 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div><Label>Urgency</Label>
                    <Select value={form.remUrgency} onChange={e => set('remUrgency', e.target.value)}>
                      <option>Critical — Immediate regulatory risk</option>
                      <option>High — Address within 30 days</option>
                      <option>Medium — Address within 90 days</option>
                      <option>Low — Monitor quarterly</option>
                    </Select>
                  </div>
                  <div><Label>Bank Size</Label>
                    <Select value={form.remSize} onChange={e => set('remSize', e.target.value)}>
                      <option>D-SIB (large, systemically important)</option>
                      <option>Mid-size private bank</option>
                      <option>Small finance bank</option>
                    </Select>
                  </div>
                </div>
                <Btn loading={loading.remediation} onClick={() => callStream('remediation', '/p1/remediation', { gapDescription: form.remInput, urgency: form.remUrgency, bankSize: form.remSize })}>Generate Remediation Plan</Btn>
              </Card>
              <AIOutput text={outputs.remediation} loading={loading.remediation} placeholder="Step-by-step remediation plan with owners, timelines, and verification checkpoints will appear here…" />
            </div>
          )}

          {tab === 'simulate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Step 5 — What-If Regulatory Impact Simulator</SectionTitle>
              <Card>
                <Label>Proposed / Upcoming Regulation</Label>
                <Textarea rows={3} value={form.simReg} onChange={e => set('simReg', e.target.value)} style={{ marginBottom: 10 }} />
                <Label>Your Current Control Framework</Label>
                <Textarea rows={3} value={form.simControls} onChange={e => set('simControls', e.target.value)} style={{ marginBottom: 12 }} />
                <Btn loading={loading.simulate} onClick={() => callStream('simulate', '/p1/simulate', { proposedRegulation: form.simReg, currentControls: form.simControls })}>Run Impact Simulation</Btn>
              </Card>
              <AIOutput text={outputs.simulate} loading={loading.simulate} placeholder="Impact analysis, pre-emptive gap forecast, financial impact quantification, and remediation roadmap will appear here…" />
            </div>
          )}

          {tab === 'crossreg' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionTitle>Step 6 — Cross-Regulation Conflict Detection</SectionTitle>
              <Card>
                <Label>Regulation A</Label>
                <Textarea rows={3} value={form.crRegA} onChange={e => set('crRegA', e.target.value)} style={{ marginBottom: 10 }} />
                <Label>Regulation B</Label>
                <Textarea rows={3} value={form.crRegB} onChange={e => set('crRegB', e.target.value)} style={{ marginBottom: 10 }} />
                <Label>Data / Context in Question</Label>
                <Input value={form.crContext} onChange={e => set('crContext', e.target.value)} style={{ marginBottom: 12 }} />
                <Btn loading={loading.crossreg} onClick={() => callStream('crossreg', '/p1/crossreg', { regA: form.crRegA, regB: form.crRegB, context: form.crContext })}>Detect Conflicts & Recommend Resolution</Btn>
              </Card>
              <AIOutput text={outputs.crossreg} loading={loading.crossreg} placeholder="Conflict identification, legal risk assessment, resolution options, and board communication guidance will appear here…" />
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ background: '#0D2040', borderLeft: '1px solid rgba(201,168,76,0.2)', padding: 18, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>LIVE COMPLIANCE SCORE</div>
        <MetricCard label="Overall Compliance" value="64%" sub="▼ 12% since Basel III update" dark />
        <div style={{ marginTop: 8 }} />
        <MetricCard label="Critical Gaps Open" value="3" valueColor="#E74C3C" sub="Immediate action needed" dark />
        <div style={{ marginTop: 8 }} />
        <MetricCard label="Controls Mapped" value="47/52" sub="5 unmapped obligations" dark />
        <div style={{ marginTop: 8 }} />
        <MetricCard label="Regs Monitored" value="6" sub="Across RBI, SEBI, MCA" dark />

        <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 700, letterSpacing: 2, margin: '20px 0 12px' }}>AGENT LOG</div>
        {[
          ['09:42', 'Ingested RBI circular — 3 new obligations'],
          ['09:38', 'Contradiction: DPDPA vs Basel III retention'],
          ['09:31', 'LCR evidence gap: 5-month window found'],
          ['09:20', 'Basel III LCR formula change ingested'],
          ['08:55', 'Control re-mapping triggered OBL-002'],
        ].map(([t, m]) => (
          <div key={t+m} style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: '#8AAEC8', display: 'flex', gap: 8 }}>
            <span style={{ color: '#C9A84C', flexShrink: 0 }}>{t}</span>{m}
          </div>
        ))}
      </div>
    </div>
  );
}
