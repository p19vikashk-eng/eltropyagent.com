import { useState } from 'react'
import { Bot, User, Clock, AlertTriangle, Shield, Zap, ArrowUpRight } from 'lucide-react'
import { colors, Avatar } from './ui'

// Each session has a single `timeline` — interleaved messages and system events
const SESSIONS = [
  {
    id: 's1', member: 'James Mitchell', acct: '#4821', time: '12 min ago',
    agent: 'Address update agent', status: 'escalated', channel: 'Chat',
    duration: '3m 24s', subAgents: ['Auth', 'Data collect', 'Compliance'],
    escalationReason: 'Out-of-state address change — compliance approval required',
    timeline: [
      { type: 'message', role: 'member', text: 'I need to update my mailing address to 4521 Oak Street, Austin TX' },
      { type: 'event',   kind: 'skill',      ts: '09:14:01', label: 'otp_send',            status: 'success', detail: 'OTP dispatched to +1•••7823' },
      { type: 'message', role: 'ai', sub: 'Auth', text: 'Sending OTP to registered mobile number ending in 7823.' },
      { type: 'message', role: 'member', text: 'Code is 482910' },
      { type: 'event',   kind: 'skill',      ts: '09:14:38', label: 'member_profile_read', status: 'success', detail: 'Member record fetched from Symitar (acct #4821)' },
      { type: 'message', role: 'ai', sub: 'Auth', text: 'Identity verified via OTP.' },
      { type: 'message', role: 'ai', sub: 'Data collect', text: 'Collecting new address. Current: 1020 Maple Ave, San Jose CA. New: 4521 Oak Street, Austin TX.' },
      { type: 'event',   kind: 'compliance', ts: '09:14:39', label: 'regulation_check',    status: 'flag',    detail: 'Out-of-state change detected. Risk score: 0.78. Approval required.' },
      { type: 'message', role: 'ai', sub: 'Compliance', text: 'Flag: out-of-state address change. Routing to human inbox for approval.' },
      { type: 'event',   kind: 'escalation', ts: '09:14:40', label: 'Escalated',            status: 'warn',    detail: 'Session routed to human inbox. Reason: compliance flag.' },
    ],
  },
  {
    id: 's2', member: 'Sandra Reyes', acct: '#4822', time: '34 min ago',
    agent: 'Address update agent', status: 'escalated', channel: 'SMS',
    duration: '5m 10s', subAgents: ['Auth', 'Data collect'],
    escalationReason: 'Intent unclear after 2 clarification attempts',
    timeline: [
      { type: 'event',   kind: 'skill',      ts: '08:52:11', label: 'member_profile_read', status: 'success', detail: 'Member record fetched (acct #4822)' },
      { type: 'message', role: 'member', text: 'I want to change my payment thing on the card' },
      { type: 'event',   kind: 'intent',     ts: '08:54:02', label: 'Intent classification', status: 'flag',  detail: 'Confidence: 0.41 (threshold: 0.65). Retry #1.' },
      { type: 'message', role: 'ai', sub: 'Data collect', text: 'Could you clarify — do you mean autopay schedule, preferred payment method, or billing address?' },
      { type: 'message', role: 'member', text: 'The schedule, I think? No wait the address' },
      { type: 'event',   kind: 'intent',     ts: '08:55:20', label: 'Intent classification', status: 'flag',  detail: 'Confidence: 0.38. Max retries reached.' },
      { type: 'message', role: 'ai', sub: 'Data collect', text: 'Intent unclear after 2 attempts. Escalating to a staff member.' },
      { type: 'event',   kind: 'escalation', ts: '08:55:21', label: 'Escalated',            status: 'warn',   detail: 'Reason: low-confidence intent after 2 retries.' },
    ],
  },
  {
    id: 's3', member: 'Thomas Kwon', acct: '#4843', time: '58 min ago',
    agent: 'Card services agent', status: 'escalated', channel: 'Chat',
    duration: '4m 02s', subAgents: ['Auth', 'Compliance', 'Fulfilment'],
    escalationReason: 'Policy exception: 2nd card replacement within 30 days',
    timeline: [
      { type: 'message', role: 'member', text: 'My card was stolen during travel, I need an emergency replacement' },
      { type: 'event',   kind: 'skill',      ts: '08:28:05', label: 'member_profile_read', status: 'success', detail: 'Member record and card history fetched.' },
      { type: 'message', role: 'ai', sub: 'Auth', text: 'Identity confirmed via KBA.' },
      { type: 'event',   kind: 'compliance', ts: '08:28:06', label: 'regulation_check',    status: 'flag',    detail: '2nd card replacement within 30 days (prev: 2026-06-01). Policy exception required.' },
      { type: 'message', role: 'ai', sub: 'Compliance', text: 'Flag: 2nd card replacement within 30 days (previous: June 1). Policy exception required. Escalating.' },
      { type: 'event',   kind: 'escalation', ts: '08:28:07', label: 'Escalated',            status: 'warn',    detail: 'Reason: card replacement policy exception.' },
    ],
  },
  {
    id: 's4', member: 'Maria Chen', acct: '#4801', time: '1h 15m ago',
    agent: 'Card services agent', status: 'contained', channel: 'Chat',
    duration: '2m 11s', subAgents: ['Auth', 'Fulfilment', 'Notify'],
    escalationReason: null,
    timeline: [
      { type: 'message', role: 'member', text: 'I lost my card, please block it' },
      { type: 'event',   kind: 'skill',      ts: '08:11:04', label: 'member_profile_read', status: 'success', detail: 'Member record fetched (acct #4801).' },
      { type: 'event',   kind: 'compliance', ts: '08:11:05', label: 'regulation_check',    status: 'pass',    detail: 'No compliance flags. Card block approved.' },
      { type: 'message', role: 'ai', sub: 'Auth', text: 'Verified identity via KBA. Proceeding with card block.' },
      { type: 'event',   kind: 'skill',      ts: '08:11:09', label: 'card_block',          status: 'success', detail: 'Card ending 4821 blocked in Visa DPS. Ref: VB-20483.' },
      { type: 'message', role: 'ai', sub: 'Fulfilment', text: 'Card ending in 4821 has been blocked successfully.' },
      { type: 'event',   kind: 'skill',      ts: '08:11:11', label: 'notify_sms',          status: 'success', detail: 'SMS sent: "Your card has been blocked."' },
      { type: 'message', role: 'ai', sub: 'Notify', text: 'SMS confirmation sent to member.' },
      { type: 'message', role: 'ai', sub: null, text: "Your card has been blocked. You'll receive a confirmation SMS shortly. Is there anything else?" },
      { type: 'message', role: 'member', text: "No thanks, that's all" },
      { type: 'event',   kind: 'skill',      ts: '08:11:15', label: 'audit_log_write',     status: 'success', detail: 'Audit record written. Action: card_block. Actor: AI agent.' },
    ],
  },
  {
    id: 's5', member: 'Derek Lim', acct: '#4855', time: '1h 42m ago',
    agent: 'Address update agent', status: 'contained', channel: 'Voice',
    duration: '1m 58s', subAgents: ['Auth', 'Data collect', 'Fulfilment', 'Notify'],
    escalationReason: null,
    timeline: [
      { type: 'message', role: 'member', text: 'Need to update my address to 302 Pine St, San Jose CA' },
      { type: 'event',   kind: 'skill',      ts: '07:44:10', label: 'otp_send',            status: 'success', detail: 'OTP dispatched to +1•••5532.' },
      { type: 'event',   kind: 'skill',      ts: '07:44:32', label: 'member_profile_read', status: 'success', detail: 'Member record fetched (acct #4855).' },
      { type: 'message', role: 'ai', sub: 'Auth', text: 'OTP sent and verified.' },
      { type: 'event',   kind: 'compliance', ts: '07:44:33', label: 'regulation_check',    status: 'pass',    detail: 'In-state address change. No compliance flag.' },
      { type: 'message', role: 'ai', sub: 'Data collect', text: 'New address collected: 302 Pine St, San Jose CA. In-state — no compliance flag.' },
      { type: 'event',   kind: 'skill',      ts: '07:44:37', label: 'address_update',      status: 'success', detail: 'Address updated in Symitar. Old: 88 Elm St. New: 302 Pine St, San Jose CA.' },
      { type: 'message', role: 'ai', sub: 'Fulfilment', text: 'Address updated in Symitar.' },
      { type: 'event',   kind: 'skill',      ts: '07:44:38', label: 'audit_log_write',     status: 'success', detail: 'Audit record written. Action: address_update. Actor: AI agent.' },
      { type: 'message', role: 'ai', sub: 'Notify', text: 'In-channel confirmation sent.' },
    ],
  },
  {
    id: 's6', member: 'Priya Shah', acct: '#4862', time: '2h 05m ago',
    agent: 'Card services agent', status: 'contained', channel: 'Chat',
    duration: '3m 30s', subAgents: ['Auth', 'Fulfilment', 'Notify'],
    escalationReason: null,
    timeline: [
      { type: 'message', role: 'member', text: 'Can I get a replacement card? Mine is damaged.' },
      { type: 'event',   kind: 'skill',      ts: '07:21:14', label: 'member_profile_read', status: 'success', detail: 'Member record and card history fetched.' },
      { type: 'event',   kind: 'compliance', ts: '07:21:15', label: 'regulation_check',    status: 'pass',    detail: 'No prior card replacement in last 30 days. Approved.' },
      { type: 'message', role: 'ai', sub: 'Auth', text: 'Identity verified via KBA.' },
      { type: 'message', role: 'ai', sub: 'Compliance', text: 'No prior replacement in the last 30 days. Clear to proceed.' },
      { type: 'event',   kind: 'skill',      ts: '07:21:22', label: 'card_replace',        status: 'success', detail: 'Replacement card ordered via Visa DPS. ETA: 5–7 business days. Ref: VR-88821.' },
      { type: 'message', role: 'ai', sub: 'Fulfilment', text: 'Replacement card ordered. Delivery in 5–7 business days.' },
      { type: 'event',   kind: 'skill',      ts: '07:21:24', label: 'notify_sms',          status: 'success', detail: 'SMS sent: "Your replacement card is on its way."' },
      { type: 'message', role: 'ai', sub: 'Notify', text: 'SMS confirmation sent.' },
      { type: 'event',   kind: 'skill',      ts: '07:21:25', label: 'audit_log_write',     status: 'success', detail: 'Audit record written. Action: card_replace. Actor: AI agent.' },
    ],
  },
]

const STATUS_META = {
  contained: { label: 'Contained', bg: '#dcfce7', color: '#166534' },
  escalated:  { label: 'Escalated',  bg: '#fef3c7', color: '#92400e' },
}

const SUB_COLORS = {
  Auth:           { bg: '#ede9fe', color: '#5b21b6' },
  'Data collect': { bg: '#e0f2fe', color: '#0369a1' },
  Fulfilment:     { bg: '#dcfce7', color: '#166534' },
  Compliance:     { bg: '#fef3c7', color: '#92400e' },
  Notify:         { bg: '#f3f4f6', color: '#374151' },
}

const EVENT_META = {
  skill:      { Icon: Zap,          bg: '#eff6ff', color: '#1e40af' },
  compliance: { Icon: Shield,       bg: '#fefce8', color: '#92400e' },
  intent:     { Icon: Bot,          bg: '#faf5ff', color: '#5b21b6' },
  escalation: { Icon: ArrowUpRight, bg: '#fff7ed', color: '#92400e' },
}

const STATUS_DOT = { success: '#16a34a', pass: '#16a34a', flag: '#d97706', warn: '#d97706' }

export default function AIConversations() {
  const [selected, setSelected] = useState(SESSIONS[0])
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all' ? SESSIONS : SESSIONS.filter(s => s.status === statusFilter)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ width: 300, borderRight: `1px solid ${colors.border}`, background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>AI Conversations</div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            {SESSIONS.length} sessions today · {SESSIONS.filter(s => s.status === 'contained').length} contained · {SESSIONS.filter(s => s.status === 'escalated').length} escalated
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {['all', 'contained', 'escalated'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${statusFilter === f ? colors.brand : colors.border}`,
                background: statusFilter === f ? colors.brandLight : '#fff',
                color: statusFilter === f ? colors.brand : colors.textMuted,
              }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
          {filtered.map(s => {
            const sm = STATUS_META[s.status]
            const isActive = selected?.id === s.id
            return (
              <div key={s.id} onClick={() => setSelected(s)} style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                border: `1px solid ${isActive ? colors.brand : colors.border}`,
                background: isActive ? colors.brandLight : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Avatar name={s.member} size={26} bg={isActive ? colors.brand : '#6b7280'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.member}</div>
                    <div style={{ fontSize: 10, color: colors.textMuted }}>Acct {s.acct} · {s.channel}</div>
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <Clock size={10} /> {s.time}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bot size={11} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.agent}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: sm.bg, color: sm.color }}>
                    {s.status === 'escalated' ? '⚠ ' : ''}{sm.label}
                  </span>
                  <span style={{ fontSize: 10, color: colors.textMuted }}>{s.duration}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel */}
      {selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9fafb' }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={selected.member} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.member}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                Acct {selected.acct} · {selected.channel} · {selected.agent} · {selected.time} · {selected.duration}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 200 }}>
              {selected.subAgents.map(sa => {
                const c = SUB_COLORS[sa] || { bg: '#f3f4f6', color: '#374151' }
                return <span key={sa} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.color }}>{sa}</span>
              })}
            </div>
          </div>

          {/* Escalation banner */}
          {selected.status === 'escalated' && (
            <div style={{ padding: '9px 20px', background: '#fffbeb', borderBottom: `1px solid #fbbf24`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <AlertTriangle size={13} color="#d97706" style={{ flexShrink: 0 }} />
              <span style={{ color: '#92400e' }}><strong>Escalated</strong> — {selected.escalationReason}</span>
            </div>
          )}

          {/* Unified timeline */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
            {selected.timeline.map((item, i) => {

              if (item.type === 'message') {
                const isAI = item.role === 'ai'
                const subColor = item.sub ? (SUB_COLORS[item.sub] || { bg: '#f3f4f6', color: '#374151' }) : null
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, flexDirection: isAI ? 'row' : 'row-reverse' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: isAI ? '#e8f0fe' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isAI ? <Bot size={13} color={colors.brand} /> : <User size={13} color={colors.textMuted} />}
                    </div>
                    <div style={{ maxWidth: '68%' }}>
                      {isAI && item.sub && (
                        <div style={{ marginBottom: 3 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: subColor.bg, color: subColor.color }}>{item.sub}</span>
                        </div>
                      )}
                      <div style={{
                        padding: '9px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                        background: isAI ? '#e8f0fe' : '#fff',
                        border: `1px solid ${isAI ? '#bfdbfe' : colors.border}`,
                        color: colors.text,
                      }}>{item.text}</div>
                    </div>
                  </div>
                )
              }

              if (item.type === 'event') {
                const em = EVENT_META[item.kind] || EVENT_META.skill
                const Icon = em.Icon
                const dotColor = STATUS_DOT[item.status] || '#9ca3af'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 6px 19px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: em.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={11} color={em.color} />
                    </div>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 10px', borderRadius: 6,
                      background: '#fff', border: `1px solid ${colors.border}`, fontSize: 11,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
                      <code style={{ fontFamily: 'monospace', fontWeight: 700, color: colors.text, fontSize: 11 }}>{item.label}</code>
                      <span style={{ color: colors.textMuted, flex: 1 }}>{item.detail}</span>
                      <span style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>{item.ts}</span>
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>

          {/* Footer stats */}
          <div style={{ padding: '11px 20px', borderTop: `1px solid ${colors.border}`, background: '#fff', display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ fontSize: 11 }}><span style={{ color: colors.textMuted }}>Duration: </span><strong>{selected.duration}</strong></div>
            <div style={{ fontSize: 11 }}><span style={{ color: colors.textMuted }}>Messages: </span><strong>{selected.timeline.filter(t => t.type === 'message').length}</strong></div>
            <div style={{ fontSize: 11 }}><span style={{ color: colors.textMuted }}>Skill calls: </span><strong>{selected.timeline.filter(t => t.type === 'event' && t.kind === 'skill').length}</strong></div>
            <div style={{ fontSize: 11 }}><span style={{ color: colors.textMuted }}>Outcome: </span>
              <strong style={{ color: selected.status === 'contained' ? colors.green : '#d97706' }}>
                {selected.status === 'contained' ? 'Contained' : 'Escalated'}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>Select a session to view</div>
        </div>
      )}
    </div>
  )
}
