import { useState } from 'react'
import { Clock, CheckCircle, XCircle, User, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react'
import { Card, Badge, Button, Section, colors, Avatar } from './ui'

const ESCALATIONS = [
  {
    id: 1, name: 'James Mitchell', acct: '#4821', time: '12 min ago',
    type: 'Address update', priority: 'approval',
    reason: 'Member wants to update address to out-of-state. High-risk flag triggered.',
    conversation: [
      { role: 'member', text: 'I need to update my mailing address to 4521 Oak Street, Austin TX*' },
      { role: 'agent', text: 'Identity verified via OTP. New address collected. Flagged for approval: out-of-state + new transaction account.' },
    ],
    recommendation: {
      action: 'Approve address update',
      reasoning: 'Member authenticated via OTP. No fraud signals detected.',
      validated: ['Identity confirmed via OTP', 'All fields validated', 'Address field pre-filled'],
      confidence: 0.92,
    }
  },
  {
    id: 2, name: 'Sandra Reyes', acct: '#4822', time: '34 min ago',
    type: 'Intent unclear', priority: 'low',
    reason: 'Intent unclear after 2 clarification attempts. Member seems frustrated.',
    conversation: [
      { role: 'member', text: 'I want to change my payment thing on the card' },
      { role: 'agent', text: 'Could you clarify — do you mean autopay schedule, preferred payment method, or billing address?' },
      { role: 'member', text: 'The schedule, I think? No wait the address' },
    ],
    recommendation: {
      action: 'Take over conversation',
      reasoning: 'Member intent ambiguous after 2 attempts. Human clarification recommended.',
      validated: ['Identity verified', 'Account located'],
      confidence: 0.51,
    }
  },
  {
    id: 3, name: 'Thomas Kwon', acct: '#4843', time: '58 min ago',
    type: 'Policy exception', priority: 'approval',
    reason: 'Compliance check failed on card replacement — policy exception.',
    conversation: [
      { role: 'member', text: 'My card was stolen during travel, I need an emergency replacement' },
      { role: 'agent', text: 'Flagged: card replacement outside home state + 2nd replacement in 30 days. Policy exception required.' },
    ],
    recommendation: {
      action: 'Review policy exception',
      reasoning: 'Fraud flag: 2nd card replacement within 30 days. Recommend manual review before approval.',
      validated: ['Identity confirmed', 'Previous replacement: June 1'],
      confidence: 0.45,
    }
  },
]

const PRIORITY_COLORS = {
  approval: { bg: '#fef3c7', text: '#92400e', label: 'Approval needed' },
  low: { bg: '#f0f9ff', text: '#0369a1', label: 'Low confidence' },
  high: { bg: '#fef2f2', text: '#991b1b', label: 'High risk' },
}

export default function HumanInbox() {
  const [selected, setSelected] = useState(ESCALATIONS[0])
  const [resolved, setResolved] = useState([])

  const pending = ESCALATIONS.filter(e => !resolved.includes(e.id))

  function resolve(id, action) {
    setResolved(r => [...r, id])
    if (pending.filter(e => e.id !== id).length > 0) {
      setSelected(pending.find(e => e.id !== id))
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left panel — queue */}
      <div style={{ width: 300, borderRight: `1px solid ${colors.border}`, background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Human inbox</div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {pending.length} escalations waiting · oldest: {pending[0]?.time || '—'}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
          {pending.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textMuted, fontSize: 12 }}>
              <CheckCircle size={28} color={colors.green} style={{ margin: '0 auto 8px' }} />
              All caught up! No pending escalations.
            </div>
          )}
          {pending.map(e => {
            const pc = PRIORITY_COLORS[e.priority] || PRIORITY_COLORS.low
            const isActive = selected?.id === e.id
            return (
              <div key={e.id} onClick={() => setSelected(e)} style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                border: `1px solid ${isActive ? colors.brand : colors.border}`,
                background: isActive ? colors.brandLight : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Avatar name={e.name} size={26} bg={isActive ? colors.brand : '#6b7280'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: colors.textMuted }}>Acct {e.acct}</div>
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {e.time}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, lineHeight: 1.4 }}>
                  {e.reason.length > 70 ? e.reason.slice(0, 70) + '…' : e.reason}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: pc.bg, color: pc.text
                }}>{pc.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel — session detail */}
      {selected && !resolved.includes(selected.id) ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9fafb' }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={selected.name} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>Acct {selected.acct} · {selected.type} · Escalated {selected.time}</div>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
              border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600,
              background: '#fff', cursor: 'pointer', color: colors.brand
            }}>
              <Sparkles size={13} /> AI summary
            </button>
          </div>

          {/* Conversation */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginBottom: 10, letterSpacing: '0.05em' }}>CONVERSATION</div>
            {selected.conversation.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, marginBottom: 10,
                flexDirection: msg.role === 'member' ? 'row' : 'row-reverse'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'member' ? '#f3f4f6' : '#e8f0fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {msg.role === 'member'
                    ? <User size={13} color={colors.textMuted} />
                    : <Sparkles size={13} color={colors.brand} />
                  }
                </div>
                <div style={{
                  maxWidth: '70%', padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                  background: msg.role === 'member' ? '#fff' : '#e8f0fe',
                  border: `1px solid ${msg.role === 'member' ? colors.border : '#bfdbfe'}`,
                  color: colors.text,
                }}>{msg.text}</div>
              </div>
            ))}

            {/* Agent recommendation */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, marginBottom: 10, letterSpacing: '0.05em' }}>AGENT RECOMMENDATION</div>
              <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <Sparkles size={14} color={colors.green} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{selected.recommendation.action}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.textMuted }}>
                    Confidence: <strong style={{ color: selected.recommendation.confidence >= 0.8 ? colors.green : colors.yellow }}>
                      {(selected.recommendation.confidence * 100).toFixed(0)}%
                    </strong>
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#166534', marginBottom: 10, lineHeight: 1.5 }}>
                  {selected.recommendation.reasoning}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.recommendation.validated.map(v => (
                    <span key={v} style={{
                      display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
                      padding: '3px 8px', borderRadius: 99, background: '#dcfce7', color: '#166534'
                    }}>
                      <CheckCircle size={10} /> {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div style={{
            padding: '14px 20px', borderTop: `1px solid ${colors.border}`,
            background: '#fff', display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <Button variant="success" onClick={() => resolve(selected.id, 'approve')} style={{ gap: 5 }}>
              <CheckCircle size={14} /> Approve
            </Button>
            <Button variant="danger" onClick={() => resolve(selected.id, 'decline')} style={{ gap: 5 }}>
              <XCircle size={14} /> Decline
            </Button>
            <Button variant="secondary" onClick={() => resolve(selected.id, 'takeover')} style={{ gap: 5 }}>
              <User size={14} /> Take over
            </Button>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.textMuted }}>
              Approving will trigger the Notification skill to inform member
            </span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', color: colors.textMuted }}>
            <CheckCircle size={40} color={colors.green} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>All caught up!</div>
            <div style={{ fontSize: 12 }}>No pending escalations in the queue.</div>
          </div>
        </div>
      )}
    </div>
  )
}
