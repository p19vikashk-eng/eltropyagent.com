import { useState } from 'react'
import { Download, Shield, Cpu, Lock, Database, FileCheck, Bell } from 'lucide-react'
import { Card, Badge, Button, Section, colors } from './ui'

const AUDIT_TRAIL = [
  { time: '09:14:02', agent: 'orchestrator', action: 'Intent classified: address_update (conf 0.94)', type: 'info' },
  { time: '09:14:03', agent: 'auth', action: 'otp_send → member_id [masked] · channel: SMS', type: 'info' },
  { time: '09:14:31', agent: 'auth', action: 'otp_check → PASS · session_token_create', type: 'success' },
  { time: '09:14:55', agent: 'data', action: 'member_profile_read → address field pre-filled', type: 'info' },
  { time: '09:15:12', agent: 'data', action: 'New address collected · field_validate → PASS · regulation_check → out-of-state flag raised', type: 'warning' },
  { time: '09:15:01', agent: 'compliance', action: 'regulation_check → PASS · audit_log_write triggered', type: 'success' },
  { time: '09:15:01', agent: 'fulfilment', action: 'address_update → PENDING APPROVAL · staff_alert sent', type: 'pending' },
]

const AGENT_COLORS = {
  orchestrator: { bg: '#ede9fe', color: '#5b21b6', icon: Cpu },
  auth: { bg: '#dbeafe', color: '#1e40af', icon: Lock },
  data: { bg: '#dcfce7', color: '#166534', icon: Database },
  compliance: { bg: '#fef3c7', color: '#92400e', icon: Shield },
  fulfilment: { bg: '#fce7f3', color: '#9d174d', icon: FileCheck },
  notification: { bg: '#f0fdf4', color: '#166534', icon: Bell },
}

const TYPE_COLORS = {
  success: colors.green, warning: '#d97706', info: colors.textMuted, pending: colors.brand, error: colors.red
}

export default function AuditLogs() {
  const [sessionFilter, setSessionFilter] = useState('4821')

  return (
    <Section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Audit & logs</h1>
          <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            Immutable · NCUA compliant · 90-day retention
          </p>
        </div>
        <Button variant="secondary" style={{ gap: 6 }}>
          <Download size={14} /> Export report
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Compliance pass rate', value: '100%', sub: '0 violations', color: colors.green },
          { label: 'Write action accuracy', value: '99.7%', sub: '4 of 1,284 flagged', color: colors.green },
          { label: 'Audit entries today', value: '6,841', sub: 'Across all sessions', color: colors.text },
          { label: 'PII masked entries', value: '6,841', sub: '100% of entries', color: colors.text },
        ].map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 11, color: colors.textMuted }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 2px', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Audit trail */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Recent audit trail — session #{sessionFilter}</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>James Mitchell · Address update · June 3 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['4821', '4822', '4843'].map(s => (
              <button key={s} onClick={() => setSessionFilter(s)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: sessionFilter === s ? colors.brand : '#f3f4f6',
                color: sessionFilter === s ? '#fff' : colors.textMuted, border: 'none'
              }}>#{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {AUDIT_TRAIL.map((entry, i) => {
            const ac = AGENT_COLORS[entry.agent] || { bg: '#f3f4f6', color: colors.textMuted, icon: Cpu }
            const Icon = ac.icon
            return (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '10px 0',
                borderBottom: i < AUDIT_TRAIL.length - 1 ? `1px solid ${colors.border}` : 'none',
                alignItems: 'flex-start'
              }}>
                {/* Timeline */}
                <div style={{ width: 58, flexShrink: 0, fontSize: 11, fontFamily: 'monospace', color: colors.textMuted, paddingTop: 2 }}>
                  {entry.time}
                </div>
                {/* Dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: ac.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={13} color={ac.color} />
                  </div>
                  {i < AUDIT_TRAIL.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: colors.border, minHeight: 12, marginTop: 4 }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{
                      padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: ac.bg, color: ac.color
                    }}>{entry.agent}</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLORS[entry.type], flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5, fontFamily: 'monospace' }}>
                    {entry.action}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 16, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 11, color: colors.textMuted, display: 'flex', gap: 20 }}>
          <span>Session: <strong style={{ color: colors.text }}>#4821</strong></span>
          <span>Duration: <strong style={{ color: colors.text }}>1m 03s</strong></span>
          <span>Skills called: <strong style={{ color: colors.text }}>7</strong></span>
          <span>Outcome: <strong style={{ color: '#d97706' }}>Pending approval</strong></span>
          <span style={{ marginLeft: 'auto' }}>Audit ID: <strong style={{ color: colors.text, fontFamily: 'monospace' }}>aud_2026_06_03_4821</strong></span>
        </div>
      </Card>

      {/* Compliance summary */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Compliance checks run this session</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { rule: 'NCUA identity verification', result: 'PASS', detail: 'OTP + member_lookup' },
            { rule: 'ECOA out-of-state flag', result: 'FLAGGED', detail: 'Routed to human review' },
            { rule: 'PII masking', result: 'PASS', detail: '3 fields masked in log' },
            { rule: 'Audit log immutability', result: 'PASS', detail: 'Append-only write confirmed' },
            { rule: 'Adverse action notice', result: 'N/A', detail: 'Not triggered (approval pending)' },
            { rule: 'FDCPA compliance', result: 'PASS', detail: 'No collection language used' },
          ].map(c => (
            <div key={c.rule} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: `1px solid ${colors.border}` }}>
              <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 3 }}>{c.rule}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.result === 'PASS' ? colors.green : c.result === 'FLAGGED' ? colors.yellow : colors.textMuted }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: c.result === 'PASS' ? colors.green : c.result === 'FLAGGED' ? '#d97706' : colors.textMuted }}>{c.result}</span>
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>{c.detail}</div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  )
}
