import { useState } from 'react'
import { Shield, Sliders, Users, Bell, Lock, ChevronRight } from 'lucide-react'
import { Card, Badge, Button, Section, colors, Divider } from './ui'

const TABS = [
  { id: 'confidence', label: 'Confidence & escalation', icon: Sliders },
  { id: 'safeai', label: 'Safe AI', icon: Shield },
  { id: 'team', label: 'Team & roles', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
]

export default function Settings() {
  const [tab, setTab] = useState('confidence')
  const [thresholds, setThresholds] = useState({
    clarify: 75, escalate: 50, autonomousWrite: false, phase2Review: true
  })

  return (
    <Section>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Settings</h1>
        <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>CU-level configuration for Cobalt Credit Union</p>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
                  borderRadius: 7, textAlign: 'left', fontSize: 13, cursor: 'pointer',
                  background: tab === t.id ? colors.brandLight : 'transparent',
                  color: tab === t.id ? colors.brand : colors.text,
                  fontWeight: tab === t.id ? 600 : 400, border: 'none'
                }}>
                  <Icon size={14} /> {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {tab === 'confidence' && (
            <ConfidenceTab thresholds={thresholds} setThresholds={setThresholds} />
          )}
          {tab === 'safeai' && <SafeAITab />}
          {tab === 'team' && <TeamTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'security' && <SecurityTab />}
        </div>
      </div>
    </Section>
  )
}

function ConfidenceTab({ thresholds, setThresholds }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Confidence thresholds</div>
        <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 18, lineHeight: 1.5 }}>
          These are CU-level policy decisions — they govern how cautious your agents behave across all sessions. Lower thresholds mean more autonomy; higher means more human oversight.
        </p>

        {[
          {
            key: 'clarify', label: 'Clarification threshold', desc: 'Below this confidence, agent asks member to rephrase',
            min: 50, max: 95, unit: '%', warning: thresholds.clarify < 65 ? 'Low threshold may lead to more escalations without clarification' : null
          },
          {
            key: 'escalate', label: 'Escalation threshold', desc: 'Below this confidence, session is routed to human inbox',
            min: 30, max: 80, unit: '%', warning: thresholds.escalate > 70 ? 'High threshold may overwhelm human inbox' : null
          },
        ].map(t => (
          <div key={t.key} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>{t.desc}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.brand, minWidth: 44, textAlign: 'right' }}>
                {thresholds[t.key]}{t.unit}
              </div>
            </div>
            <input type="range" min={t.min} max={t.max} value={thresholds[t.key]}
              onChange={e => setThresholds(p => ({ ...p, [t.key]: +e.target.value }))}
              style={{ width: '100%', accentColor: colors.brand }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
              <span>{t.min}{t.unit} (more autonomy)</span>
              <span>{t.max}{t.unit} (more oversight)</span>
            </div>
            {t.warning && (
              <div style={{ marginTop: 6, padding: '6px 10px', background: '#fef3c7', borderRadius: 6, fontSize: 11, color: '#92400e' }}>
                ⚠ {t.warning}
              </div>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Escalation routing</div>
        <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>Which teams receive escalations</p>
        {[
          { label: 'Default queue', value: 'Member Services · all escalations' },
          { label: 'High-risk actions', value: 'Compliance team + Manager approval' },
          { label: 'After hours', value: 'Email + next business day queue' },
        ].map(r => (
          <div key={r.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{r.label}</span>
              <span style={{ color: colors.textMuted }}> · {r.value}</span>
            </div>
            <button style={{ fontSize: 11, color: colors.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Edit
            </button>
          </div>
        ))}
      </Card>
    </div>
  )
}

function SafeAITab() {
  const [autonomousWrites, setAutonomousWrites] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ border: '1.5px solid #6d28d9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ padding: '6px 12px', background: '#ede9fe', borderRadius: 99, fontSize: 12, fontWeight: 700, color: '#5b21b6' }}>
            Phase 2 · Review mode
          </div>
          <span style={{ fontSize: 12, color: colors.textMuted }}>Autonomous writes require human sign-off</span>
        </div>
        <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
          Your credit union is in Phase 2 of the trust-building journey. The Fulfilment agent proposes write actions; a human approves before execution. Phase 3 (full autonomy) unlocks when accuracy threshold ≥ 95% over 30 days.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Autonomous write actions</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Allow Fulfilment agent to write to core systems without human approval</div>
          </div>
          <div onClick={() => setAutonomousWrites(v => !v)} style={{
            width: 44, height: 24, borderRadius: 99, background: autonomousWrites ? colors.brand : '#d1d5db',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
          }}>
            <div style={{
              position: 'absolute', top: 2, left: autonomousWrites ? 22 : 2, width: 20, height: 20,
              borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
        {autonomousWrites && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 7, fontSize: 11, color: colors.red }}>
            ⚠ Enabling autonomous writes is irreversible until Phase 3 approval. Requires VP approval and will be logged.
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Phase roadmap</div>
        {[
          { phase: 'Phase 1', label: 'Read-only', done: true, desc: 'Agents read data, humans take all write actions' },
          { phase: 'Phase 2', label: 'Review mode', active: true, desc: 'Agent proposes, human approves before write · Current' },
          { phase: 'Phase 3', label: 'Supervised autonomy', done: false, desc: 'Agent writes autonomously; confidence ≥ 95% for 30 days required' },
        ].map(p => (
          <div key={p.phase} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${colors.border}`, alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: p.done ? colors.green : p.active ? colors.brand : colors.border,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff'
            }}>
              {p.done ? '✓' : p.active ? '●' : ''}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{p.phase} — {p.label}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function TeamTab() {
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Team members</div>
      {[
        { name: 'Priya Sharma', role: 'Admin', email: 'priya@cobaltcu.org', you: true },
        { name: 'Marcus Webb', role: 'Reviewer', email: 'marcus@cobaltcu.org' },
        { name: 'Linda Cho', role: 'Viewer', email: 'linda@cobaltcu.org' },
      ].map(m => (
        <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: colors.brandLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: colors.brand
          }}>
            {m.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name} {m.you && <span style={{ fontSize: 10, color: colors.textMuted }}>(you)</span>}</div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>{m.email}</div>
          </div>
          <Badge variant="default">{m.role}</Badge>
          <button style={{ fontSize: 11, color: colors.brand, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
        </div>
      ))}
      <Button variant="outline" style={{ marginTop: 14, gap: 6 }}>+ Invite team member</Button>
    </Card>
  )
}

function NotificationsTab() {
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Notification preferences</div>
      {[
        { label: 'Escalation to human inbox', sub: 'Alert when agent escalates to staff', enabled: true },
        { label: 'Accuracy threshold dipped', sub: 'Alert when agent accuracy drops below 80%', enabled: true },
        { label: 'Knowledge base stale', sub: 'Alert when source not synced in 7+ days', enabled: true },
        { label: 'System integration failure', sub: 'Alert when connected API returns errors', enabled: false },
        { label: 'Weekly summary report', sub: 'Every Monday morning', enabled: true },
      ].map(n => (
        <div key={n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{n.label}</div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>{n.sub}</div>
          </div>
          <div style={{
            width: 40, height: 22, borderRadius: 99, background: n.enabled ? colors.brand : '#d1d5db',
            cursor: 'pointer', position: 'relative', flexShrink: 0
          }}>
            <div style={{
              position: 'absolute', top: 2, left: n.enabled ? 20 : 2, width: 18, height: 18,
              borderRadius: '50%', background: '#fff', transition: 'left 0.2s'
            }} />
          </div>
        </div>
      ))}
    </Card>
  )
}

function SecurityTab() {
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Security settings</div>
      {[
        { label: 'SSO integration', value: 'Okta SAML 2.0 · Active', status: 'active' },
        { label: 'MFA enforcement', value: 'All admin users required', status: 'active' },
        { label: 'API key rotation', value: 'Last rotated: 45 days ago', status: 'warning' },
        { label: 'Audit log export', value: 'SFTP to compliance.cobaltcu.org', status: 'active' },
        { label: 'Data residency', value: 'US-West-2 · SOC 2 Type II', status: 'active' },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.status === 'warning' ? colors.yellow : colors.textMuted }}>{s.value}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.status === 'active' ? colors.green : colors.yellow }} />
            <button style={{ fontSize: 11, color: colors.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Configure</button>
          </div>
        </div>
      ))}
    </Card>
  )
}
