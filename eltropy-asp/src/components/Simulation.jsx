import { useState } from 'react'
import { Play, CheckCircle, XCircle, Clock, Zap, RotateCcw, ChevronDown, ChevronRight, Bot, Save, BookOpen, RefreshCw } from 'lucide-react'
import { Card, Badge, Button, Section, colors } from './ui'

const SCENARIOS = [
  {
    id: 1, name: 'Address update — standard', category: 'Address',
    desc: 'Member requests address change, OTP verified, out-of-state flag',
    expectedOutcome: 'Pending approval',
    result: 'pass', confidence: 0.94, duration: '1.1s',
    subAgentsInvoked: ['orchestrator', 'auth', 'data', 'compliance', 'fulfilment'],
    steps: [
      { agent: 'orchestrator', action: 'Intent: address_update (0.94)', pass: true },
      { agent: 'auth', action: 'OTP sent + verified · session created', pass: true },
      { agent: 'data', action: 'Address collected + validated · out-of-state flag raised', pass: true },
      { agent: 'compliance', action: 'regulation_check PASS · audit written', pass: true },
      { agent: 'fulfilment', action: 'address_update PENDING APPROVAL', pass: true },
    ]
  },
  {
    id: 2, name: 'Card block — lost card', category: 'Card',
    desc: 'Member reports lost card, immediate block required',
    expectedOutcome: 'Card blocked',
    result: 'pass', confidence: 0.97, duration: '0.8s',
    subAgentsInvoked: ['orchestrator', 'auth', 'fulfilment', 'compliance', 'notification'],
    steps: [
      { agent: 'orchestrator', action: 'Intent: card_block (0.97)', pass: true },
      { agent: 'auth', action: 'KBA verified · session created', pass: true },
      { agent: 'fulfilment', action: 'card_block executed · reference #CB-4821', pass: true },
      { agent: 'compliance', action: 'FDCPA check PASS · audit written', pass: true },
      { agent: 'notification', action: 'SMS confirmation sent to member', pass: true },
    ]
  },
  {
    id: 3, name: 'Loan enquiry — rate lookup', category: 'Loan',
    desc: 'Member asks about current auto loan rates — fast path',
    expectedOutcome: 'Rate returned',
    result: 'pass', confidence: 0.99, duration: '0.3s',
    subAgentsInvoked: ['orchestrator'],
    steps: [
      { agent: 'orchestrator', action: 'Intent: rate_enquiry (0.99) · fast path invoked', pass: true },
      { agent: 'orchestrator', action: 'loan_rate_read skill called directly', pass: true },
      { agent: 'orchestrator', action: 'Rates returned: 36m 6.49%, 48m 6.74%, 60m 7.24%', pass: true },
    ]
  },
  {
    id: 4, name: 'Address update — ambiguous member', category: 'Address',
    desc: 'Member provides conflicting addresses across turns',
    expectedOutcome: 'Escalated',
    result: 'fail', confidence: 0.48, duration: '2.3s',
    subAgentsInvoked: ['orchestrator', 'auth', 'data'],
    steps: [
      { agent: 'orchestrator', action: 'Intent: address_update (0.82)', pass: true },
      { agent: 'auth', action: 'OTP verified · session created', pass: true },
      { agent: 'data', action: 'Address 1 collected: "123 Main" → contradicted next turn', pass: false },
      { agent: 'data', action: 'Clarification attempt 1 · member re-contradicts', pass: false },
      { agent: 'orchestrator', action: 'Confidence dropped to 0.48 → ESCALATED', pass: false },
    ]
  },
  {
    id: 5, name: 'Card replacement — policy exception', category: 'Card',
    desc: '2nd card replacement in 30 days, fraud risk elevated',
    expectedOutcome: 'Escalated (compliance fail)',
    result: 'fail', confidence: 0.41, duration: '1.8s',
    subAgentsInvoked: ['orchestrator', 'auth', 'data', 'compliance'],
    steps: [
      { agent: 'orchestrator', action: 'Intent: card_replace (0.91)', pass: true },
      { agent: 'auth', action: 'OTP verified · session created', pass: true },
      { agent: 'data', action: 'Fields collected: member confirms 2nd replacement request', pass: true },
      { agent: 'compliance', action: 'regulation_check FAIL: 2nd replacement in 30 days · fraud_check flagged', pass: false },
      { agent: 'orchestrator', action: 'ESCALATED → compliance violation', pass: false },
    ]
  },
  {
    id: 6, name: 'Balance enquiry — simple', category: 'General',
    desc: 'Member requests account balance — read-only fast path',
    expectedOutcome: 'Balance returned',
    result: 'pass', confidence: 0.99, duration: '0.2s',
    subAgentsInvoked: ['orchestrator'],
    steps: [
      { agent: 'orchestrator', action: 'Intent: balance_enquiry (0.99) · fast path', pass: true },
      { agent: 'orchestrator', action: 'account_read skill called · balance: $4,218.32', pass: true },
    ]
  },
]

const AGENT_COLORS = {
  orchestrator: '#5b21b6', auth: '#1e40af', data: '#166534',
  compliance: '#92400e', fulfilment: '#9d174d', notification: '#0369a1'
}

const AGENT_NAME_MAP = {
  'Address update agent': 'addr',
  'Card services agent': 'card',
  'Loan enquiry agent': 'loan',
}

function snapshotAgent(agent) {
  if (!agent) return null
  return {
    subAgents: [...agent.subAgents].sort().join(','),
    sop: agent.sop || '',
    integrations: agent.integrations || '',
  }
}

function diffSnapshot(saved, current) {
  if (!saved || !current) return []
  const changes = []
  if (saved.subAgents !== current.subAgents) changes.push('Sub-agents changed')
  if (saved.sop !== current.sop) changes.push('SOP updated')
  if (saved.integrations !== current.integrations) changes.push('Integrations changed')
  return changes
}

export default function Simulation({ agents = [] }) {
  const [selectedAgent, setSelectedAgent] = useState('Address update agent')
  const [running, setRunning] = useState(false)
  // mode: 'idle' | 'ran' | 'viewing-saved'
  const [mode, setMode] = useState('idle')
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')
  const [saved, setSaved] = useState([])
  const [viewingSaved, setViewingSaved] = useState(null) // saved run object
  const [saveToast, setSaveToast] = useState(false)

  const passed = SCENARIOS.filter(s => s.result === 'pass').length
  const failed = SCENARIOS.filter(s => s.result === 'fail').length

  function runSimulation() {
    setRunning(true)
    setMode('idle')
    setViewingSaved(null)
    setExpanded(null)
    setTimeout(() => { setRunning(false); setMode('ran') }, 1800)
  }

  function saveSimulation() {
    const agentObj = agents.find(a => a.id === AGENT_NAME_MAP[selectedAgent])
    const entry = {
      id: Date.now(),
      agent: selectedAgent,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      passed,
      failed,
      scenarios: SCENARIOS,
      agentSnapshot: snapshotAgent(agentObj),
    }
    setSaved(prev => [entry, ...prev])
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2500)
    // Clear results so user starts fresh
    setMode('idle')
    setExpanded(null)
    setFilter('all')
  }

  function openSaved(run) {
    setViewingSaved(run)
    setMode('viewing-saved')
    setExpanded(null)
    setFilter('all')
  }

  function rerunSaved(run) {
    setSelectedAgent(run.agent)
    setViewingSaved(null)
    runSimulation()
  }

  function saveSavedAgain(run) {
    const entry = { ...run, id: Date.now(), date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    setSaved(prev => [entry, ...prev])
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2500)
  }

  const activeScenarios = mode === 'viewing-saved' ? viewingSaved.scenarios : SCENARIOS
  const filtered = filter === 'all' ? activeScenarios : activeScenarios.filter(s => s.result === filter)
  const activePassed = activeScenarios.filter(s => s.result === 'pass').length
  const activeFailed = activeScenarios.filter(s => s.result === 'fail').length

  const agentSavedRuns = saved.filter(r => r.agent === selectedAgent)

  const showResults = mode === 'ran' || mode === 'viewing-saved'

  return (
    <Section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Test simulation</h1>
          <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            Run your agent against synthetic member conversations before going live
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={selectedAgent} onChange={e => { setSelectedAgent(e.target.value); setMode('idle'); setViewingSaved(null) }} style={{
            padding: '7px 12px', border: `1px solid ${colors.border}`, borderRadius: 8,
            fontSize: 12, background: '#fff', outline: 'none', color: colors.text
          }}>
            <option>Address update agent</option>
            <option>Card services agent</option>
            <option>Loan enquiry agent</option>
          </select>
          <Button onClick={runSimulation} disabled={running} style={{ gap: 6 }}>
            {running
              ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />Running…</>
              : <><Play size={13} /> Run simulation</>
            }
          </Button>
          {mode === 'ran' && (
            <Button variant="secondary" onClick={saveSimulation} style={{ gap: 5 }}>
              <Save size={13} /> Save
            </Button>
          )}
          {mode === 'viewing-saved' && (
            <>
              <Button variant="secondary" onClick={() => rerunSaved(viewingSaved)} style={{ gap: 5 }}>
                <RefreshCw size={13} /> Re-run
              </Button>
              <Button variant="secondary" onClick={() => saveSavedAgain(viewingSaved)} style={{ gap: 5 }}>
                <Save size={13} /> Save again
              </Button>
              <Button variant="secondary" onClick={() => { setMode('idle'); setViewingSaved(null) }} style={{ gap: 5 }}>
                ✕ Close
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {showResults && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Scenarios run', value: activeScenarios.length, color: colors.text },
            { label: 'Passed', value: activePassed, color: colors.green },
            { label: 'Failed', value: activeFailed, color: colors.red },
            { label: 'Avg confidence', value: `${(activeScenarios.reduce((a, s) => a + s.confidence, 0) / activeScenarios.length * 100).toFixed(0)}%`, color: colors.brand },
          ].map(s => (
            <Card key={s.label}>
              <div style={{ fontSize: 11, color: colors.textMuted }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Viewing saved banner */}
      {mode === 'viewing-saved' && (
        <div style={{ padding: '9px 14px', background: '#eff6ff', border: `1px solid #bfdbfe`, borderRadius: 8, fontSize: 12, marginBottom: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 7 }}>
          <BookOpen size={13} />
          <span>Viewing saved run — <strong>{viewingSaved.agent}</strong> · {viewingSaved.date}</span>
        </div>
      )}

      {/* Idle empty state */}
      {!showResults && !running && (
        <Card style={{ marginBottom: 16, padding: 24, textAlign: 'center' }}>
          <Bot size={40} color={colors.border} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Ready to simulate</div>
          <p style={{ fontSize: 12, color: colors.textMuted, maxWidth: 420, margin: '0 auto 16px', lineHeight: 1.6 }}>
            {SCENARIOS.length} synthetic member conversations loaded. Run the simulation to see how your agent handles each scenario.
          </p>
          <Button onClick={runSimulation} style={{ gap: 6 }}><Play size={13} /> Start simulation</Button>
        </Card>
      )}

      {/* Running spinner */}
      {running && (
        <Card style={{ padding: 32, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${colors.brand}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontWeight: 600 }}>Running {SCENARIOS.length} scenarios…</div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Evaluating agent responses against expected outcomes</div>
        </Card>
      )}

      {/* Scenario results */}
      {showResults && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['all', 'pass', 'fail'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: filter === f ? colors.brand : '#f3f4f6',
                color: filter === f ? '#fff' : colors.textMuted, border: 'none'
              }}>
                {f === 'all' ? 'All scenarios' : f === 'pass' ? `✓ Passed (${activePassed})` : `✗ Failed (${activeFailed})`}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(sc => (
              <Card key={sc.id} style={{ cursor: 'pointer', ...(expanded === sc.id ? { boxShadow: `0 0 0 2px ${colors.brand}` } : {}) }}>
                <div onClick={() => setExpanded(expanded === sc.id ? null : sc.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: sc.result === 'pass' ? colors.greenBg : colors.redBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {sc.result === 'pass' ? <CheckCircle size={18} color={colors.green} /> : <XCircle size={18} color={colors.red} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{sc.name}</span>
                      <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: '#f3f4f6', color: colors.textMuted }}>{sc.category}</span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{sc.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: colors.textMuted, alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Zap size={11} /> {sc.subAgentsInvoked.length} skills</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {sc.duration}</span>
                    <span style={{ fontWeight: 700, color: sc.confidence >= 0.7 ? colors.green : colors.red }}>
                      {(sc.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  {expanded === sc.id ? <ChevronDown size={16} color={colors.textMuted} /> : <ChevronRight size={16} color={colors.textMuted} />}
                </div>

                {expanded === sc.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, marginBottom: 14 }}>
                      <span style={{ color: colors.textMuted }}>Expected: <strong style={{ color: colors.text }}>{sc.expectedOutcome}</strong></span>
                      <span style={{ color: colors.textMuted }}>Actual: <strong style={{ color: sc.result === 'pass' ? colors.green : colors.red }}>{sc.result === 'pass' ? sc.expectedOutcome : 'ESCALATED'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                      {sc.subAgentsInvoked.map(a => (
                        <span key={a} style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: (AGENT_COLORS[a] || '#6b7280') + '20', color: AGENT_COLORS[a] || '#6b7280' }}>{a}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {sc.steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: step.pass ? colors.greenBg : colors.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {step.pass ? <CheckCircle size={11} color={colors.green} /> : <XCircle size={11} color={colors.red} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, marginRight: 6, background: (AGENT_COLORS[step.agent] || '#6b7280') + '20', color: AGENT_COLORS[step.agent] || '#6b7280' }}>{step.agent}</span>
                            <span style={{ fontSize: 12, fontFamily: 'monospace', color: step.pass ? colors.text : colors.red }}>{step.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Saved runs for selected agent */}
      {agentSavedRuns.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <BookOpen size={13} color={colors.textMuted} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Saved runs — {selectedAgent}</span>
            <span style={{ marginLeft: 4, fontSize: 11, color: colors.textMuted }}>({agentSavedRuns.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {agentSavedRuns.map(run => {
              const currentAgent = agents.find(a => a.id === AGENT_NAME_MAP[run.agent])
              const changes = diffSnapshot(run.agentSnapshot, snapshotAgent(currentAgent))
              const hasChanges = changes.length > 0
              return (
              <div key={run.id} style={{
                borderRadius: 7, overflow: 'hidden',
                border: `1px solid ${hasChanges ? '#fbbf24' : viewingSaved?.id === run.id ? colors.brand : colors.border}`,
                cursor: 'pointer',
              }} onClick={() => openSaved(run)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 12px', fontSize: 12,
                  background: hasChanges ? '#fffbeb' : viewingSaved?.id === run.id ? colors.brandLight : '#f9fafb',
                }}>
                  <Bot size={13} color={viewingSaved?.id === run.id ? colors.brand : colors.textMuted} />
                  <span style={{ color: colors.textMuted, flex: 1 }}>{run.date}</span>
                  {hasChanges && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#92400e' }}>
                      <span>⚠</span> Config changed — re-run recommended
                    </span>
                  )}
                  <span style={{ color: colors.green, fontWeight: 600 }}>✓ {run.passed} passed</span>
                  <span style={{ color: colors.red, fontWeight: 600 }}>✗ {run.failed} failed</span>
                <button onClick={e => { e.stopPropagation(); rerunSaved(run) }} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5,
                  border: `1px solid ${colors.border}`, background: '#fff', fontSize: 11,
                  fontWeight: 600, color: colors.brand, cursor: 'pointer'
                }}>
                  <RefreshCw size={10} /> Re-run
                </button>
                {mode === 'ran' && (
                  <button onClick={e => { e.stopPropagation(); saveSavedAgain(run) }} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5,
                    border: `1px solid ${colors.border}`, background: '#fff', fontSize: 11,
                    fontWeight: 600, color: colors.textMuted, cursor: 'pointer'
                  }}>
                    <Save size={10} /> Save again
                  </button>
                )}
                </div>
                {hasChanges && (
                  <div style={{ padding: '7px 12px', background: '#fef3c7', borderTop: '1px solid #fbbf24', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {changes.map(c => (
                      <span key={c} style={{ fontSize: 11, color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )})}
          </div>
        </Card>
      )}

      {/* Save toast */}
      {saveToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          background: '#111827', color: '#fff', borderRadius: 8,
          padding: '10px 16px', fontSize: 12, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <CheckCircle size={14} color="#4ade80" /> Simulation saved
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Section>
  )
}
