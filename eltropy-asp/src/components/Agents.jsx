import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Bot, Check, ArrowRight, ChevronRight, X, Zap, Shield, Database, Bell, FileText, Pause, Play, Trash2, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, Badge, Button, Section, colors, ProgressBar } from './ui'

const SUB_AGENT_OPTIONS = [
  { id: 'Auth', label: 'Auth', desc: 'OTP, KBA, step-up authentication', icon: Shield },
  { id: 'Data collect', label: 'Data collect', desc: 'Field schema, prefill, validation', icon: Database },
  { id: 'Fulfilment', label: 'Fulfilment', desc: 'Back-office write actions', icon: Zap },
  { id: 'Compliance', label: 'Compliance', desc: 'NCUA, ECOA, audit log', icon: FileText },
  { id: 'Notify', label: 'Notify', desc: 'SMS, email, in-channel', icon: Bell },
]

const SUB_AGENT_ICONS = {
  Auth: Shield, 'Data collect': Database, Fulfilment: Zap, Notify: Bell, Compliance: FileText
}

const BUILDER_STEPS = [
  { id: 1, label: 'Name & select skills', detail: 'Choose skills for your agent' },
  { id: 2, label: 'Add SOP & guardrails', detail: 'Define step-by-step operating procedure' },
  { id: 3, label: 'Test & publish', detail: 'Validate and go live' },
]

export default function Agents({ agents, setAgents }) {
  const [showBuilder, setShowBuilder] = useState(false)
  const [editAgent, setEditAgent] = useState(null)
  const [confirmPause, setConfirmPause] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  function handleCreate(newAgent) {
    setAgents(prev => [...prev, { ...newAgent, id: Date.now().toString(), status: 'live', sessions: '0 sessions this week', description: newAgent.description || '' }])
    setShowBuilder(false)
  }

  function pauseAgent(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'paused' } : a))
    setConfirmPause(null)
  }

  function resumeAgent(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'live' } : a))
  }

  function deleteAgent(id) {
    setAgents(prev => prev.filter(a => a.id !== id))
    setConfirmDelete(null)
  }

  return (
    <Section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Agents</h1>
          <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {agents.length} agents · {agents.filter(a => a.status === 'live').length} live
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)} style={{ gap: 6 }}>
          <Plus size={14} /> New agent <ArrowRight size={13} />
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={() => setEditAgent(agent)}
            onPause={() => setConfirmPause(agent)}
            onResume={() => resumeAgent(agent.id)}
            onDelete={() => setConfirmDelete(agent)}
          />
        ))}
      </div>

      {showBuilder && createPortal(
        <NewAgentModal onClose={() => setShowBuilder(false)} onCreate={handleCreate} />,
        document.body
      )}

      {editAgent && createPortal(
        <EditAgentModal agent={editAgent} onClose={() => setEditAgent(null)}
          onSave={(updated) => {
            setAgents(prev => prev.map(a => a.id === updated.id ? updated : a))
            setEditAgent(null)
          }}
        />,
        document.body
      )}

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

      {confirmDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: 420, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={20} color={colors.red} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Delete "{confirmDelete.name}"?</div>
                <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>
                  This will permanently delete the agent, its SOP, and all configuration. This action cannot be undone.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <button onClick={() => deleteAgent(confirmDelete.id)} style={{
                padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: colors.red, color: '#fff', border: 'none'
              }}>
                Delete agent
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Section>
  )
}

function AgentCard({ agent, onEdit, onPause, onResume, onDelete }) {
  const isDraft = agent.status === 'draft'
  const isPaused = agent.status === 'paused'
  const isLive = agent.status === 'live'

  const iconBg = isDraft ? '#f3f4f6' : isPaused ? '#fff7ed' : 'linear-gradient(135deg, #e8f0fe, #dbeafe)'
  const iconColor = isDraft ? colors.textMuted : isPaused ? '#d97706' : colors.brand

  const badgeVariant = isLive ? 'live' : isDraft ? 'draft' : 'paused'
  const badgeLabel = isLive ? 'Live' : isDraft ? `Draft · step ${agent.step} of ${agent.totalSteps}` : 'Paused'

  return (
    <Card style={isPaused ? { borderColor: '#fbbf24', opacity: 0.85 } : {}}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, flexShrink: 0, marginTop: 2,
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={18} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{agent.name}</span>
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          </div>
          {agent.subAgents.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5 }}>
              {agent.subAgents.map(sa => {
                const Icon = SUB_AGENT_ICONS[sa] || Zap
                return (
                  <span key={sa} style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '2px 7px', borderRadius: 5, fontSize: 11,
                    background: colors.grayBg, color: colors.textMuted
                  }}>
                    <Icon size={10} /> {sa}
                  </span>
                )
              })}
              {agent.integrations && (
                <span style={{ fontSize: 11, color: colors.textMuted, padding: '2px 4px' }}>
                  · {agent.integrations}
                </span>
              )}
            </div>
          )}
          {agent.description && (
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, lineHeight: 1.5 }}>{agent.description}</div>
          )}
          <div style={{ fontSize: 11, color: colors.textMuted }}>{agent.sessions}</div>
          {isDraft && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{
                    flex: 1, height: 3, borderRadius: 3,
                    background: s <= (agent.step || 1) ? colors.brand : colors.border
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 3 }}>Step {agent.step} of 3</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          {isLive && (
            <>
              <button onClick={onEdit} style={{
                padding: '5px 14px', borderRadius: 6, border: `1px solid ${colors.border}`,
                fontSize: 12, fontWeight: 600, color: colors.brand, background: '#fff', cursor: 'pointer'
              }}>Edit</button>
              <button onClick={onPause} style={{
                padding: '5px 10px', borderRadius: 6, border: '1px solid #fbbf24',
                fontSize: 12, fontWeight: 600, color: '#92400e', background: '#fff7ed', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Pause size={11} /> Pause
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={onResume} style={{
                padding: '5px 12px', borderRadius: 6, border: `1px solid #bbf7d0`,
                fontSize: 12, fontWeight: 600, color: '#166534', background: '#f0fdf4', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Play size={11} /> Resume
              </button>
              <button onClick={onDelete} style={{
                padding: '5px 9px', borderRadius: 6, border: `1px solid #fecaca`,
                background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}>
                <Trash2 size={13} color={colors.red} />
              </button>
            </>
          )}
          {isDraft && (
            <>
              <button onClick={onEdit} style={{
                padding: '5px 14px', borderRadius: 6, border: `1px solid ${colors.border}`,
                fontSize: 12, fontWeight: 600, color: colors.brand, background: '#fff', cursor: 'pointer'
              }}>Continue ↗</button>
              <button onClick={onDelete} style={{
                padding: '5px 9px', borderRadius: 6, border: `1px solid #fecaca`,
                background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}>
                <Trash2 size={13} color={colors.red} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ─── New Agent Modal (3 steps) ─── */
const SOP_TEMPLATES = [
  {
    id: 'address',
    label: 'Address Update — Standard',
    category: 'Member Services',
    desc: 'OTP-verified address change with out-of-state compliance flag and approval routing.',
    sop: `1. Verify member identity via OTP before collecting any data.
2. Pre-fill current mailing address from Symitar core system.
3. Collect new address from member; validate street, city, state, and ZIP format.
4. If new address is out-of-state, raise compliance flag and require human approval before proceeding.
5. Run regulation_check to confirm no NCUA or state-specific restrictions apply.
6. Submit address_update skill only after compliance check passes and approval token is present.
7. Notify member via in-channel message confirming address update.
8. Write full event (old address, new address, agent session ID) to audit_log_write.
9. Escalate to human inbox if member disputes pre-filled address or provides conflicting values across turns.`,
  },
  {
    id: 'card_block',
    label: 'Card Block — Lost or Stolen',
    category: 'Card Services',
    desc: 'Immediate card block with KBA auth, fraud check, and SMS confirmation.',
    sop: `1. Authenticate member using KBA (last 4 SSN + ZIP) — do not proceed without successful auth.
2. Confirm the card to be blocked by displaying last 4 digits; ask member to verify.
3. Check if card is already blocked — if so, inform member and close session.
4. Execute card_block skill immediately upon member confirmation.
5. Run FDCPA compliance check; log outcome to audit_log_write.
6. Send SMS confirmation to member's registered number with reference ID.
7. Offer card replacement — if member accepts, initiate card_replace flow.
8. Escalate to human inbox if two consecutive KBA attempts fail.`,
  },
  {
    id: 'card_replace',
    label: 'Card Replacement — Policy Check',
    category: 'Card Services',
    desc: 'Replacement flow with 30-day duplicate check and fraud escalation guardrail.',
    sop: `1. Authenticate member via OTP sent to registered phone number.
2. Confirm reason for replacement (lost, damaged, expired, stolen).
3. Query Symitar for prior card replacement history within last 30 days.
4. If this is the 2nd replacement in 30 days: flag for fraud review, escalate to compliance team, and do NOT issue replacement without human approval.
5. If first replacement: verify member's current shipping address; allow update if needed.
6. Submit card_replace via Fulfilment skill only after all checks pass.
7. Provide estimated delivery timeframe (5–7 business days standard, 2-day expedited if available).
8. Log replacement reason, approval status, and session details to audit_log_write.`,
  },
  {
    id: 'loan_enquiry',
    label: 'Loan Enquiry — Rate & Eligibility',
    category: 'Lending',
    desc: 'Rate lookup and eligibility check with LOS hand-off guardrails.',
    sop: `1. Greet member and identify loan type: auto, home equity, personal, or CD-secured.
2. Retrieve current rates for requested loan type via loan_rate_read skill (no auth required for rate lookup).
3. Present rate tiers by term length; include APR and estimated monthly payment for common amounts.
4. If member asks about eligibility, verify identity via OTP before accessing account data.
5. Collect desired loan amount and term; calculate estimated payment and DTI indicator.
6. If DTI estimate exceeds 43% or loan amount > $250,000, inform member that a human loan officer will follow up — do not submit application.
7. If member wants to proceed, submit pre-qualification via los_submit skill.
8. Log all rate disclosures and eligibility checks to audit_log_write per ECOA requirements.`,
  },
  {
    id: 'account_enquiry',
    label: 'Account Enquiry — Balance & History',
    category: 'General',
    desc: 'Read-only account lookup with minimal auth and transaction redaction guardrails.',
    sop: `1. Verify member identity via OTP or last-4 SSN + account number.
2. Retrieve account balance and last 10 transactions via account_read skill.
3. Display balance rounded to 2 decimal places; do not expose internal ledger codes.
4. For transaction disputes: collect transaction date, amount, and merchant name; escalate to disputes queue — do NOT reverse charges within this agent.
5. If member requests a statement, initiate secure document delivery; do not send account numbers via in-channel message.
6. Do not expose full account number at any point — mask to last 4 digits only.
7. Log session to audit_log_write with member_id and query type.`,
  },
  {
    id: 'compliance_onboarding',
    label: 'Compliance Guardrails — General',
    category: 'Compliance',
    desc: 'Universal compliance rules applicable to any agent handling member data.',
    sop: `1. Never collect or store SSN, full account number, or card number in session memory.
2. Always verify member identity before accessing or modifying any account data.
3. Run regulation_check before executing any write action (address update, card action, loan submission).
4. If regulation_check returns FAIL or score > 0.8, immediately escalate to human inbox — do not attempt to retry the action.
5. Log every action (auth, data collection, skill invocation, outcome) to audit_log_write.
6. If member expresses distress, frustration, or requests a human agent at any point, escalate immediately — do not attempt to retain the session.
7. Do not make loan commitments, fee waivers, or policy exceptions — escalate all exception requests.
8. Adhere to NCUA, ECOA, FDCPA, and Regulation E requirements at all times.`,
  },
]

const SKILL_COLORS = {
  'Auth': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Data collect': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'Fulfilment': { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  'Compliance': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  'Notify': { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
}

function SOPEditor({ value, onChange, selectedSubs }) {
  const textareaRef = useRef(null)
  const backdropRef = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 })
  const [activeSuggestion, setActiveSuggestion] = useState(0)

  // Build highlighted HTML — marks must add NO extra width (use box-shadow not border, no padding)
  // Textarea uses color:transparent so only backdrop text is visible
  function renderHighlighted(text) {
    if (!text) return '​'
    const sorted = [...selectedSubs].sort((a, b) => b.length - a.length)
    if (!sorted.length) return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const pattern = sorted.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const regex = new RegExp(`(${pattern})`, 'gi')
    return escaped.replace(regex, match => {
      const key = selectedSubs.find(s => s.toLowerCase() === match.toLowerCase()) || match
      const c = SKILL_COLORS[key] || SKILL_COLORS['Auth']
      // No padding, no border — only box-shadow which doesn't affect layout
      return `<span style="background:${c.bg};color:${c.text};box-shadow:0 0 0 1px ${c.border};border-radius:3px;">${match}</span>`
    })
  }

  function syncScroll() {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  function getWordAtCursor(text, pos) {
    const before = text.slice(0, pos)
    const match = before.match(/[A-Za-z][A-Za-z ]*$/)
    if (!match) return { word: '', start: pos }
    // Trim trailing spaces from match
    const trimmed = match[0].trimEnd()
    return { word: trimmed, start: pos - match[0].length }
  }

  function computeSuggestionPos(text, pos) {
    const lines = text.slice(0, pos).split('\n')
    const lineNum = lines.length - 1
    const charPos = lines[lineNum].length
    const lineH = Math.round(12 * 1.7) // fontSize * lineHeight
    return { top: (lineNum + 1) * lineH + 14, left: Math.min(charPos * 7.2 + 13, 300) }
  }

  function handleChange(e) {
    const newVal = e.target.value
    onChange(newVal)
    const pos = e.target.selectionStart ?? newVal.length
    const { word } = getWordAtCursor(newVal, pos)
    if (word.length >= 1) {
      const matches = selectedSubs.filter(s =>
        s.toLowerCase().startsWith(word.toLowerCase()) && s.toLowerCase() !== word.toLowerCase()
      )
      setSuggestions(matches)
      setActiveSuggestion(0)
      if (matches.length > 0) setSuggestionPos(computeSuggestionPos(newVal, pos))
    } else {
      setSuggestions([])
    }
  }

  function applySuggestion(skill) {
    const ta = textareaRef.current
    const pos = ta.selectionStart
    const { word, start } = getWordAtCursor(value, pos)
    const newVal = value.slice(0, start) + skill + value.slice(start + word.length)
    onChange(newVal)
    setSuggestions([])
    setTimeout(() => {
      ta.focus()
      const newPos = start + skill.length
      ta.setSelectionRange(newPos, newPos)
    }, 0)
  }

  function handleKeyDown(e) {
    if (!suggestions.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Tab' || (e.key === 'Enter' && suggestions.length)) { e.preventDefault(); applySuggestion(suggestions[activeSuggestion]) }
    else if (e.key === 'Escape') setSuggestions([])
  }

  const sharedStyle = {
    padding: '11px 13px', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    border: '1px solid transparent', borderRadius: 8,
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Backdrop: same metrics as textarea, renders highlighted HTML */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: renderHighlighted(value) }}
        style={{
          ...sharedStyle,
          position: 'absolute', top: 0, left: 0, right: 0,
          minHeight: 160, overflow: 'hidden',
          pointerEvents: 'none', zIndex: 0,
          // Text not visible here — only colored span backgrounds show through transparent textarea
          color: colors.text,
        }}
      />
      {/* Transparent textarea on top — caret visible, text invisible so backdrop shows */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        autoFocus
        placeholder="1. Verify member identity via OTP before any data access.&#10;2. Run Compliance check before write action.&#10;3. Notify member on completion."
        style={{
          ...sharedStyle,
          position: 'relative', zIndex: 1,
          width: '100%', minHeight: 160,
          border: `1px solid ${colors.border}`,
          outline: 'none', resize: 'vertical',
          // Transparent so backdrop highlights show; caret remains visible
          background: 'transparent',
          color: 'transparent',
          caretColor: colors.text,
        }}
        onFocus={e => e.target.style.borderColor = colors.brand}
        onBlur={e => { e.target.style.borderColor = colors.border; setTimeout(() => setSuggestions([]), 150) }}
      />
      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 20,
          top: suggestionPos.top, left: suggestionPos.left,
          background: '#fff', border: `1px solid ${colors.border}`,
          borderRadius: 7, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          minWidth: 140, overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => {
            const c = SKILL_COLORS[s] || SKILL_COLORS['Auth']
            return (
              <div
                key={s}
                onMouseDown={() => applySuggestion(s)}
                style={{
                  padding: '7px 12px', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: i === activeSuggestion ? colors.brandLight : '#fff',
                  color: i === activeSuggestion ? colors.brand : colors.text,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{s}</span>
                <span style={{ fontSize: 10, color: colors.textMuted, marginLeft: 'auto' }}>skill</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NewAgentModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSubs, setSelectedSubs] = useState(['Auth', 'Data collect'])
  const [sop, setSop] = useState('')
  const [testPassed, setTestPassed] = useState(false)
  const [testing, setTesting] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  function toggleSub(id) {
    setSelectedSubs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function runTest() {
    setTesting(true)
    setTimeout(() => { setTesting(false); setTestPassed(true) }, 1200)
  }

  function publish() {
    onCreate({
      name: name || 'New agent',
      description,
      subAgents: selectedSubs,
      sop,
      integrations: null,
    })
  }

  const canNext = step === 1 ? name.trim().length > 0 && selectedSubs.length > 0
    : step === 2 ? sop.trim().length > 10
    : testPassed

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 540, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>New agent</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Step {step} of 3 — {BUILDER_STEPS[step-1].label}</div>
          </div>
          <button onClick={onClose}><X size={18} color={colors.textMuted} /></button>
        </div>

        {/* Step progress */}
        <div style={{ padding: '14px 24px 0' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 4,
                background: s <= step ? colors.brand : colors.border,
                transition: 'background 0.2s'
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 20 }}>
            {BUILDER_STEPS.map(s => (
              <span key={s.id} style={{
                fontSize: 10, color: s.id <= step ? colors.brand : colors.textMuted,
                fontWeight: s.id === step ? 700 : 400, flex: 1, textAlign: s.id === 1 ? 'left' : s.id === 3 ? 'right' : 'center'
              }}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px 24px' }}>
          {step === 1 && (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 6 }}>
                  AGENT NAME
                </label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mortgage pre-approval agent"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: `1px solid ${colors.border}`, borderRadius: 8,
                    fontSize: 13, outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = colors.brand}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 6 }}>
                  DESCRIPTION
                </label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Briefly describe what this agent does and when it should be invoked…"
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: `1px solid ${colors.border}`, borderRadius: 8,
                    fontSize: 12, outline: 'none', resize: 'vertical',
                    lineHeight: 1.6, color: colors.text, fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = colors.brand}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 8 }}>
                  SELECT SKILLS
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SUB_AGENT_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    const selected = selectedSubs.includes(opt.id)
                    return (
                      <div key={opt.id} onClick={() => toggleSub(opt.id)} style={{
                        display: 'flex', gap: 10, padding: '11px 13px', borderRadius: 9, cursor: 'pointer',
                        border: `1.5px solid ${selected ? colors.brand : colors.border}`,
                        background: selected ? colors.brandLight : '#fff',
                        transition: 'all 0.15s'
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                          background: selected ? colors.brand : '#f3f4f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Icon size={14} color={selected ? '#fff' : colors.textMuted} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: selected ? colors.brand : colors.text }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: colors.textMuted }}>{opt.desc}</div>
                        </div>
                        {selected && <Check size={16} color={colors.brand} style={{ flexShrink: 0, marginTop: 6 }} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* SOP editor */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>SOP & GUARDRAILS</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedSubs.map(s => {
                      const c = SKILL_COLORS[s] || SKILL_COLORS['Auth']
                      return <span key={s} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600 }}>{s}</span>
                    })}
                  </div>
                </div>
                <SOPEditor value={sop} onChange={setSop} selectedSubs={selectedSubs} />
                <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                  {sop.trim().length > 0 ? `${sop.split('\n').filter(l => l.trim()).length} steps defined` : 'Start typing your SOP… type a skill name to autocomplete'}
                </div>
              </div>

              {/* Suggested SOPs */}
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Sparkles size={13} color='#7c3aed' />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>Suggested SOPs & Guardrails</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SOP_TEMPLATES.map(t => (
                    <div key={t.id}>
                      <div
                        onClick={() => setPreviewTemplate(previewTemplate?.id === t.id ? null : t)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '9px 12px', borderRadius: previewTemplate?.id === t.id ? '8px 8px 0 0' : 8,
                          border: `1px solid ${previewTemplate?.id === t.id ? '#7c3aed' : '#ede9fe'}`,
                          background: previewTemplate?.id === t.id ? '#f5f3ff' : '#faf5ff',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>{t.label}</div>
                          <div style={{ fontSize: 11, color: '#7c3aed', opacity: 0.7, marginTop: 1 }}>{t.category} · {t.desc}</div>
                        </div>
                        <ChevronRight size={14} color='#7c3aed' style={{ transform: previewTemplate?.id === t.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
                      </div>

                      {/* Inline preview */}
                      {previewTemplate?.id === t.id && (
                        <div style={{
                          border: '1px solid #7c3aed', borderTop: 'none', borderRadius: '0 0 8px 8px',
                          background: '#fff', padding: 14
                        }}>
                          <pre style={{
                            fontSize: 11, fontFamily: 'monospace', color: colors.text,
                            lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: '0 0 12px',
                            maxHeight: 200, overflowY: 'auto'
                          }}>{t.sop}</pre>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setSop(t.sop); setPreviewTemplate(null) }} style={{
                              padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                              background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer'
                            }}>
                              Use this SOP
                            </button>
                            <button onClick={() => setPreviewTemplate(null)} style={{
                              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                              background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', cursor: 'pointer'
                            }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 18, lineHeight: 1.6 }}>
                Run a quick validation test before publishing <strong style={{ color: colors.text }}>{name || 'your agent'}</strong> to members.
              </p>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 10, border: `1px solid ${colors.border}`, marginBottom: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Agent summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                  <div><span style={{ color: colors.textMuted }}>Name:</span> <strong>{name}</strong></div>
                  {description && <div><span style={{ color: colors.textMuted }}>Description:</span> {description}</div>}
                  <div>
                    <span style={{ color: colors.textMuted }}>Skills: </span>
                    {selectedSubs.map(s => (
                      <span key={s} style={{ marginRight: 5, padding: '1px 7px', borderRadius: 5, background: colors.brandLight, color: colors.brand, fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div><span style={{ color: colors.textMuted }}>SOP:</span> {sop.split('\n').filter(l => l.trim()).length} steps defined</div>
                </div>
              </div>

              {!testPassed && (
                <button onClick={runTest} disabled={testing} style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: testing ? '#f3f4f6' : colors.brandLight, color: testing ? colors.textMuted : colors.brand,
                  border: `1.5px solid ${testing ? colors.border : colors.brand}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10
                }}>
                  {testing ? (
                    <>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${colors.brand}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                      Running test…
                    </>
                  ) : '▶ Run test'}
                </button>
              )}

              {testPassed && (
                <div style={{ padding: '13px 15px', background: '#f0fdf4', borderRadius: 9, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Check size={18} color={colors.green} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: colors.green }}>Test passed — ready to publish</div>
                    <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>All skills validated · SOP parsed · No compliance violations</div>
                  </div>
                </div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Button variant="secondary" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
            {step === 1 ? 'Cancel' : '← Back'}
          </Button>
          <Button onClick={() => step < 3 ? setStep(s => s + 1) : publish()} disabled={!canNext}>
            {step === 3 ? <><Check size={14} /> Publish agent</> : <>Continue <ChevronRight size={14} /></>}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Edit Agent Modal — same 3-step wizard as New, pre-populated ─── */
function EditAgentModal({ agent, onClose, onSave }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description || '')
  const [selectedSubs, setSelectedSubs] = useState([...agent.subAgents])
  const [sop, setSop] = useState(agent.sop || '')
  const [testPassed, setTestPassed] = useState(false)
  const [testing, setTesting] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  function toggleSub(id) {
    setSelectedSubs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function runTest() {
    setTesting(true)
    setTimeout(() => { setTesting(false); setTestPassed(true) }, 1200)
  }

  function save() {
    onSave({ ...agent, name, description, subAgents: selectedSubs, sop })
  }

  const canNext = step === 1 ? name.trim().length > 0 && selectedSubs.length > 0
    : step === 2 ? sop.trim().length > 10
    : testPassed

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 540, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Edit agent</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Step {step} of 3 — {BUILDER_STEPS[step-1].label}</div>
          </div>
          <button onClick={onClose}><X size={18} color={colors.textMuted} /></button>
        </div>

        {/* Step progress */}
        <div style={{ padding: '14px 24px 0' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 4,
                background: s <= step ? colors.brand : colors.border,
                transition: 'background 0.2s'
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: 20 }}>
            {BUILDER_STEPS.map(s => (
              <span key={s.id} style={{
                fontSize: 10, color: s.id <= step ? colors.brand : colors.textMuted,
                fontWeight: s.id === step ? 700 : 400, flex: 1,
                textAlign: s.id === 1 ? 'left' : s.id === 3 ? 'right' : 'center'
              }}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px 24px' }}>
          {step === 1 && (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 6 }}>AGENT NAME</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = colors.brand}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 12, outline: 'none', resize: 'vertical', lineHeight: 1.6, color: colors.text, fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = colors.brand}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 8 }}>SELECT SKILLS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SUB_AGENT_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    const selected = selectedSubs.includes(opt.id)
                    return (
                      <div key={opt.id} onClick={() => toggleSub(opt.id)} style={{
                        display: 'flex', gap: 10, padding: '11px 13px', borderRadius: 9, cursor: 'pointer',
                        border: `1.5px solid ${selected ? colors.brand : colors.border}`,
                        background: selected ? colors.brandLight : '#fff', transition: 'all 0.15s'
                      }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: selected ? colors.brand : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={14} color={selected ? '#fff' : colors.textMuted} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: selected ? colors.brand : colors.text }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: colors.textMuted }}>{opt.desc}</div>
                        </div>
                        {selected && <Check size={16} color={colors.brand} style={{ flexShrink: 0, marginTop: 6 }} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>SOP & GUARDRAILS</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selectedSubs.map(s => {
                      const c = SKILL_COLORS[s] || SKILL_COLORS['Auth']
                      return <span key={s} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600 }}>{s}</span>
                    })}
                  </div>
                </div>
                <SOPEditor value={sop} onChange={setSop} selectedSubs={selectedSubs} />
                <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                  {sop.trim().length > 0 ? `${sop.split('\n').filter(l => l.trim()).length} steps defined` : 'Start typing your SOP… type a skill name to autocomplete'}
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Sparkles size={13} color='#7c3aed' />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>Suggested SOPs & Guardrails</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SOP_TEMPLATES.map(t => (
                    <div key={t.id}>
                      <div onClick={() => setPreviewTemplate(previewTemplate?.id === t.id ? null : t)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px', borderRadius: previewTemplate?.id === t.id ? '8px 8px 0 0' : 8,
                        border: `1px solid ${previewTemplate?.id === t.id ? '#7c3aed' : '#ede9fe'}`,
                        background: previewTemplate?.id === t.id ? '#f5f3ff' : '#faf5ff', cursor: 'pointer',
                      }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>{t.label}</div>
                          <div style={{ fontSize: 11, color: '#7c3aed', opacity: 0.7, marginTop: 1 }}>{t.category} · {t.desc}</div>
                        </div>
                        <ChevronRight size={14} color='#7c3aed' style={{ transform: previewTemplate?.id === t.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
                      </div>
                      {previewTemplate?.id === t.id && (
                        <div style={{ border: '1px solid #7c3aed', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff', padding: 14 }}>
                          <pre style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: '0 0 12px', maxHeight: 200, overflowY: 'auto' }}>{t.sop}</pre>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setSop(t.sop); setPreviewTemplate(null) }} style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer' }}>Use this SOP</button>
                            <button onClick={() => setPreviewTemplate(null)} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 18, lineHeight: 1.6 }}>
                Review your changes and run a quick validation before saving <strong style={{ color: colors.text }}>{name}</strong>.
              </p>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 10, border: `1px solid ${colors.border}`, marginBottom: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Updated summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                  <div><span style={{ color: colors.textMuted }}>Name:</span> <strong>{name}</strong></div>
                  {description && <div><span style={{ color: colors.textMuted }}>Description:</span> {description}</div>}
                  <div>
                    <span style={{ color: colors.textMuted }}>Skills: </span>
                    {selectedSubs.map(s => (
                      <span key={s} style={{ marginRight: 5, padding: '1px 7px', borderRadius: 5, background: colors.brandLight, color: colors.brand, fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div><span style={{ color: colors.textMuted }}>SOP:</span> {sop.split('\n').filter(l => l.trim()).length} steps defined</div>
                </div>
              </div>
              {!testPassed && (
                <button onClick={runTest} disabled={testing} style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: testing ? '#f3f4f6' : colors.brandLight, color: testing ? colors.textMuted : colors.brand,
                  border: `1.5px solid ${testing ? colors.border : colors.brand}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10
                }}>
                  {testing ? (
                    <><div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${colors.brand}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />Running test…</>
                  ) : '▶ Run test'}
                </button>
              )}
              {testPassed && (
                <div style={{ padding: '13px 15px', background: '#f0fdf4', borderRadius: 9, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Check size={18} color={colors.green} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: colors.green }}>Test passed — ready to save</div>
                    <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>All skills validated · SOP parsed · No compliance violations</div>
                  </div>
                </div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Button variant="secondary" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
            {step === 1 ? 'Cancel' : '← Back'}
          </Button>
          <Button onClick={() => step < 3 ? setStep(s => s + 1) : save()} disabled={!canNext}>
            {step === 3 ? <><Check size={14} /> Save changes</> : <>Continue <ChevronRight size={14} /></>}
          </Button>
        </div>
      </div>
    </div>
  )
}
