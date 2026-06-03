import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Bot, ArrowRight, Pause, Play, AlertTriangle, ShieldCheck, MessageSquare, Lightbulb } from 'lucide-react'
import { Card, Badge, Button, StatCard, Section, colors, ProgressBar } from './ui'

export default function Dashboard({ onNav, agents, setAgents }) {
  const [confirmPause, setConfirmPause] = useState(null)

  function pauseAgent(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'paused' } : a))
    setConfirmPause(null)
  }

  function resumeAgent(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'live' } : a))
  }

  return (
    <Section>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Good morning, Vikash</h1>
            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#ede9fe', color: '#5b21b6' }}>Admin</span>
          </div>
          <p style={{ color: colors.textMuted, fontSize: 12 }}>Cobalt Credit Union · Last 7 days</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <StatCard label="Sessions handled" value="1,284" sub="+19% vs last week" trendUp={true} />
        <StatCard label="Containment rate" value="83%" sub="+4 pts" trendUp={true} />
        <StatCard label="Avg resolution time" value="4.2 min" sub="Target: <3 min" trendUp={false} />
        <StatCard label="Escalated to staff" value="218" sub="17% of sessions" />
      </div>

      {/* Second row — compliance + session quality */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Compliance pass rate" value="96.4%" sub="+1.2 pts vs last week" trendUp={true} />
        <StatCard label="Avg turns per session" value="6.1" sub="–0.8 vs last week" trendUp={true} />
        <StatCard label="Compliance flags" value="47" sub="3.7% of sessions" />
        <StatCard label="PII masked entries" value="100%" sub="All sessions compliant" trendUp={true} />
      </div>

      {/* Session quality */}
      <div style={{ marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <MessageSquare size={14} color={colors.brand} />
            <div style={{ fontWeight: 600, fontSize: 13 }}>Session quality</div>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.textMuted }}>Last 7 days</span>
          </div>
          {[
            { label: 'Avg turns — Address update agent', value: 5.4, max: 12, trend: '–0.6', up: true },
            { label: 'Avg turns — Card services agent', value: 6.8, max: 12, trend: '+0.3', up: false },
            { label: 'Avg turns — escalated sessions', value: 9.2, max: 12, trend: '+1.1', up: false },
            { label: 'Avg turns — contained sessions', value: 5.1, max: 12, trend: '–1.0', up: true },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: colors.text }}>{row.label}</span>
                <span style={{ fontWeight: 700, color: colors.text }}>{row.value}
                  <span style={{ fontWeight: 400, color: row.up ? colors.green : colors.red, marginLeft: 6 }}>{row.trend}</span>
                </span>
              </div>
              <ProgressBar value={row.value} max={row.max} color={row.up ? colors.green : colors.brand} height={5} />
            </div>
          ))}
        </Card>
      </div>

      {/* Active agents */}
      <div>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>Active agents</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agents.filter(a => a.status !== 'draft').map(agent => {
              const isLive = agent.status === 'live'
              const isPaused = agent.status === 'paused'
              const isDraft = agent.status === 'draft'
              const issues = agent.health?.issues || []
              const hasIssues = issues.length > 0
              const highSeverity = issues.some(i => i.severity === 'high')

              const borderColor = hasIssues
                ? (highSeverity ? '#fca5a5' : '#fbbf24')
                : isPaused ? '#fbbf24' : colors.border
              const bgColor = hasIssues
                ? (highSeverity ? '#fff5f5' : '#fffbeb')
                : isPaused ? '#fffbeb' : '#f9fafb'

              return (
                <div key={agent.id} style={{
                  borderRadius: 8, border: `1px solid ${borderColor}`,
                  background: bgColor, overflow: 'hidden',
                }}>
                  {/* Agent row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: isDraft ? '#f3f4f6' : isPaused ? '#fff7ed' : hasIssues ? (highSeverity ? '#fee2e2' : '#fef3c7') : '#e8f0fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {hasIssues
                        ? <AlertTriangle size={14} color={highSeverity ? colors.red : '#d97706'} />
                        : <Bot size={15} color={isDraft ? colors.textMuted : isPaused ? '#d97706' : colors.brand} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{agent.name}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                        {agent.subAgents.slice(0, 4).map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: '1px 5px', borderRadius: 4,
                            background: isDraft ? '#fef3c7' : '#f3f4f6',
                            color: isDraft ? '#92400e' : colors.textMuted
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {/* Health metrics */}
                      {agent.health && !isDraft && (
                        <div style={{ display: 'flex', gap: 8, fontSize: 11, marginRight: 4 }}>
                          <span style={{ color: agent.health.containment >= agent.health.containmentTarget ? colors.green : colors.red, fontWeight: 600 }}>
                            {agent.health.containment}% contained
                          </span>
                          <span style={{ color: agent.health.avgTurns <= agent.health.avgTurnsTarget ? colors.textMuted : '#d97706', fontWeight: 600 }}>
                            {agent.health.avgTurns} turns
                          </span>
                        </div>
                      )}
                      <Badge variant="live">Live</Badge>
                      {hasIssues && (
                        <Badge variant={highSeverity ? 'degraded' : 'pending'}>
                          {highSeverity ? 'Needs attention' : 'Warning'}
                        </Badge>
                      )}
                      {isLive && (
                        <button onClick={() => setConfirmPause(agent)} style={{
                          padding: '3px 8px', borderRadius: 5, border: '1px solid #fbbf24',
                          fontSize: 11, fontWeight: 600, color: '#92400e', background: '#fff7ed',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
                        }}>
                          <Pause size={9} /> Pause
                        </button>
                      )}
                      {isPaused && (
                        <button onClick={() => resumeAgent(agent.id)} style={{
                          padding: '3px 8px', borderRadius: 5, border: '1px solid #bbf7d0',
                          fontSize: 11, fontWeight: 600, color: '#166534', background: '#f0fdf4',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
                        }}>
                          <Play size={9} /> Resume
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Issues + suggestions */}
                  {hasIssues && (
                    <div style={{ borderTop: `1px solid ${borderColor}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {issues.map((issue, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                            <AlertTriangle size={11} color={issue.severity === 'high' ? colors.red : '#d97706'} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: issue.severity === 'high' ? colors.red : '#92400e' }}>{issue.metric}</span>
                              <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: 6 }}>{issue.detail}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 17 }}>
                            {issue.actions.map((action, ai) => (
                              <div key={ai} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                                <Lightbulb size={10} color='#7c3aed' style={{ flexShrink: 0, marginTop: 1 }} />
                                <span style={{ fontSize: 11, color: '#5b21b6' }}>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button onClick={() => onNav('agents')} style={{
            marginTop: 14, width: '100%', padding: '8px', borderRadius: 7, fontSize: 12,
            background: 'transparent', border: `1px solid ${colors.border}`, color: colors.brand,
            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
          }}>
            Manage agents <ArrowRight size={13} />
          </button>
        </Card>
      </div>

      {confirmPause && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: 420, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Pause "{confirmPause.name}"?</div>
                <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>
                  This agent is currently live and handling member sessions. Pausing it will stop new sessions from being routed to it. In-progress sessions will be escalated to the human inbox.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setConfirmPause(null)}>Cancel</Button>
              <button onClick={() => pauseAgent(confirmPause.id)} style={{
                padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: '#fff7ed', color: '#92400e', border: '1px solid #fbbf24'
              }}>
                Pause agent
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Section>
  )
}
