import { colors, Divider } from './ui'
import { Bot, Zap, Shield, Database, Bell, ArrowRight, ArrowDown, GitBranch, Layers, RefreshCw, CheckCircle } from 'lucide-react'

// ─── Small layout primitives ───────────────────────────────────────────────

function DocSection({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${colors.brand}`, display: 'inline-block' }}>{title}</h2>
      {children}
    </div>
  )
}

function Para({ children }) {
  return <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
}

function Note({ children }) {
  return (
    <div style={{ padding: '10px 14px', background: '#eff6ff', borderLeft: `3px solid ${colors.brand}`, borderRadius: '0 6px 6px 0', marginBottom: 12, fontSize: 12, color: '#1e40af', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

function SubHeading({ children }) {
  return <h3 style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 8, marginTop: 20 }}>{children}</h3>
}

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  )
}

// ─── Architecture diagram boxes ────────────────────────────────────────────

function AgentBox({ label, sub, color = colors.brand, bg = '#eff6ff', icon: Icon }) {
  return (
    <div style={{
      padding: '10px 16px', borderRadius: 8, border: `1.5px solid ${color}`,
      background: bg, minWidth: 130, textAlign: 'center',
    }}>
      {Icon && <Icon size={16} color={color} style={{ marginBottom: 4 }} />}
      <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Arrow({ label, dir = 'right' }) {
  return (
    <div style={{ display: 'flex', flexDirection: dir === 'down' ? 'column' : 'row', alignItems: 'center', gap: 2 }}>
      {dir === 'right' && (
        <>
          <div style={{ width: 32, height: 1, background: '#9ca3af' }} />
          <ArrowRight size={12} color="#9ca3af" />
        </>
      )}
      {dir === 'down' && (
        <>
          <div style={{ width: 1, height: 20, background: '#9ca3af', margin: '0 auto' }} />
          <ArrowDown size={12} color="#9ca3af" style={{ margin: '0 auto' }} />
        </>
      )}
      {label && <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>{label}</span>}
    </div>
  )
}

function SkillPill({ label, variant = 'read' }) {
  const styles = {
    read:  { bg: '#dbeafe', color: '#1e40af' },
    write: { bg: '#fce7f3', color: '#9d174d' },
    check: { bg: '#fef3c7', color: '#92400e' },
  }
  const s = styles[variant]
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, margin: '2px 3px', display: 'inline-block' }}>
      {label}
    </span>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function SystemDocs() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 36px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Title */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #1a56db, #5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Agent Service Platform — System Architecture</h1>
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>Orchestration · Skills · Agent Coordination · Task Delegation</p>
          </div>
        </div>
      </div>

      {/* 1. Overview */}
      <DocSection title="1. System Overview">
        <Para>
          The Eltropy Agent Service Platform (ASP) is a multi-agent orchestration system designed to handle member-facing interactions at credit unions. It decomposes complex requests into discrete tasks, delegates each task to a specialised sub-agent, and enforces compliance guardrails at every step before any write action is committed.
        </Para>
        <Para>
          The platform is structured in three horizontal layers: the <strong>Channel layer</strong> (Chat, SMS, Voice) that receives raw member input; the <strong>Agent layer</strong> that plans and executes the request; and the <strong>Skills layer</strong> that provides atomic, audited integrations with core banking systems.
        </Para>

        {/* System overview diagram */}
        <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 10, padding: 24, marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.08em', marginBottom: 16 }}>SYSTEM LAYERS</div>

          {/* Channel layer */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>CHANNEL LAYER</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Chat', 'SMS', 'Voice'].map(c => (
                <div key={c} style={{ padding: '6px 16px', borderRadius: 6, border: `1px solid #d1d5db`, background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151' }}>{c}</div>
              ))}
            </div>
          </div>

          <Arrow dir="down" />

          {/* Agent layer */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>AGENT LAYER</div>
            <div style={{ background: '#eff6ff', border: `1.5px solid ${colors.brand}`, borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.brand, marginBottom: 8 }}>Orchestrator Agent</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Auth agent', bg: '#ede9fe', color: '#5b21b6' },
                  { label: 'Data collect agent', bg: '#e0f2fe', color: '#0369a1' },
                  { label: 'Compliance agent', bg: '#fef3c7', color: '#92400e' },
                  { label: 'Fulfilment agent', bg: '#dcfce7', color: '#166534' },
                  { label: 'Notify agent', bg: '#f3f4f6', color: '#374151' },
                ].map(a => (
                  <div key={a.label} style={{ padding: '5px 12px', borderRadius: 6, background: a.bg, fontSize: 11, fontWeight: 600, color: a.color }}>{a.label}</div>
                ))}
              </div>
            </div>
          </div>

          <Arrow dir="down" />

          {/* Skills layer */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>SKILLS LAYER</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['otp_send', 'member_profile_read', 'address_update', 'card_block', 'card_replace', 'regulation_check', 'audit_log_write', 'notify_sms'].map(s => (
                <div key={s} style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${colors.border}`, background: '#fff', fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{s}</div>
              ))}
            </div>
          </div>

          <Arrow dir="down" />

          {/* Core systems */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>CORE SYSTEMS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Symitar Core', 'Visa DPS', 'LOS'].map(s => (
                <div key={s} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid #d1d5db`, background: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#374151' }}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      {/* 2. Orchestrator */}
      <DocSection title="2. Orchestrator Agent">
        <Para>
          The Orchestrator is the top-level agent responsible for receiving raw member intent, decomposing it into a plan, and delegating each step to the appropriate sub-agent. It does not execute any skills directly — it only reasons, routes, and monitors.
        </Para>

        <SubHeading>2.1 Intent Classification</SubHeading>
        <Para>
          On session start, the Orchestrator classifies the member's message using a fine-tuned intent model. It assigns an intent label (e.g. <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '1px 5px', borderRadius: 3 }}>address_update</code>, <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '1px 5px', borderRadius: 3 }}>card_block</code>) and a confidence score. If confidence is above the threshold (default 0.65), it proceeds with planning. Below threshold, it requests clarification or escalates.
        </Para>

        <SubHeading>2.2 Plan Construction</SubHeading>
        <Para>
          Based on the classified intent, the Orchestrator looks up the registered SOP for the matching agent and constructs an ordered execution plan. Each step in the plan specifies: which sub-agent to invoke, what data is required, what the expected output is, and any preconditions that must be satisfied before proceeding.
        </Para>

        {/* Plan diagram */}
        <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.08em', marginBottom: 14 }}>EXAMPLE PLAN — address_update</div>
          {[
            { step: 1, agent: 'Auth', action: 'Verify member identity via OTP', pre: 'None', out: 'session_token' },
            { step: 2, agent: 'Data collect', action: 'Collect and validate new address', pre: 'session_token', out: 'validated_address' },
            { step: 3, agent: 'Compliance', action: 'Run regulation_check on new address', pre: 'validated_address', out: 'compliance_result' },
            { step: 4, agent: 'Fulfilment', action: 'Submit address_update to Symitar', pre: 'compliance_result = PASS', out: 'confirmation_ref' },
            { step: 5, agent: 'Notify', action: 'Send in-channel confirmation', pre: 'confirmation_ref', out: 'notified' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: colors.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{s.agent}</span>
                    <span style={{ fontSize: 12, color: '#374151' }}>— {s.action}</span>
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>
                    <span style={{ marginRight: 12 }}>Pre: <code style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '0 4px', borderRadius: 3 }}>{s.pre}</code></span>
                    <span>Out: <code style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '0 4px', borderRadius: 3 }}>{s.out}</code></span>
                  </div>
                </div>
              </div>
              {i < 4 && <div style={{ width: 1, height: 8, background: '#d1d5db', marginLeft: 10 }} />}
            </div>
          ))}
        </div>

        <SubHeading>2.3 Task Delegation</SubHeading>
        <Para>
          The Orchestrator invokes sub-agents sequentially by default, or in parallel when steps have no data dependency. Each sub-agent is passed a structured context object containing: the session token, member ID, the data collected so far, and any compliance flags raised in prior steps. Sub-agents report back with a typed result, and the Orchestrator either advances the plan, retries, or escalates based on the outcome.
        </Para>
        <Note>
          <strong>Key invariant:</strong> The Orchestrator never writes to any system directly. All write operations are executed exclusively through Fulfilment sub-agents via registered skills, ensuring every action is auditable and reversible at the skill level.
        </Note>

        <SubHeading>2.4 Escalation Decision</SubHeading>
        <BulletList items={[
          'Compliance check returns FAIL or risk score exceeds threshold',
          'Intent confidence drops below 0.65 after 2 clarification attempts',
          'Sub-agent returns a policy exception (e.g. 2nd card replacement in 30 days)',
          'Member explicitly requests a human agent',
          'Session timeout (> 10 min inactivity)',
        ]} />
      </DocSection>

      {/* 3. Sub-agents */}
      <DocSection title="3. Sub-Agent Roles">
        <Para>
          Each sub-agent is a stateless, single-responsibility unit. Sub-agents do not communicate with each other directly — all inter-agent communication is mediated through the Orchestrator's shared context object.
        </Para>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {[
            {
              name: 'Auth agent', color: '#5b21b6', bg: '#ede9fe',
              resp: 'Member identity verification. Manages OTP dispatch, KBA challenges, and session token issuance. Blocks the plan from advancing until identity is confirmed.',
              skills: [['otp_send', 'write'], ['otp_verify', 'read'], ['kba_check', 'read'], ['session_create', 'write']],
            },
            {
              name: 'Data collect agent', color: '#0369a1', bg: '#e0f2fe',
              resp: 'Gathers and validates structured member input (addresses, card details, account fields). Pre-fills known data from core system. Detects contradictions and requests clarification.',
              skills: [['member_profile_read', 'read'], ['address_validate', 'read'], ['field_collect', 'read']],
            },
            {
              name: 'Compliance agent', color: '#92400e', bg: '#fef3c7',
              resp: 'Runs regulatory checks before any write action. Evaluates risk score, checks policy rules (e.g. card replacement frequency, out-of-state flags), and writes a compliance record to the audit log.',
              skills: [['regulation_check', 'check'], ['fraud_check', 'check'], ['audit_log_write', 'write']],
            },
            {
              name: 'Fulfilment agent', color: '#166534', bg: '#dcfce7',
              resp: 'Executes the core action against the system of record. Only invoked after Auth and Compliance have passed. All fulfilment calls are write operations and generate an immutable audit entry.',
              skills: [['address_update', 'write'], ['card_block', 'write'], ['card_replace', 'write'], ['audit_log_write', 'write']],
            },
            {
              name: 'Notify agent', color: '#374151', bg: '#f3f4f6',
              resp: 'Sends confirmation to the member via the originating channel (SMS, in-chat message, or voice readback). Always the final step in a successful contained session.',
              skills: [['notify_sms', 'write'], ['notify_chat', 'write']],
            },
          ].map(a => (
            <div key={a.name} style={{ border: `1px solid ${a.color}30`, borderLeft: `3px solid ${a.color}`, borderRadius: 8, padding: '12px 16px', background: a.bg + '50' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: a.color, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7, marginBottom: 8 }}>{a.resp}</div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, marginRight: 8 }}>SKILLS:</span>
                {a.skills.map(([s, v]) => <SkillPill key={s} label={s} variant={v === 'write' ? 'write' : v === 'check' ? 'check' : 'read'} />)}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* 4. Agent coordination */}
      <DocSection title="4. Agent Coordination Model">
        <Para>
          Coordination between sub-agents is <strong>context-passing</strong>, not message-passing. The Orchestrator maintains a single mutable session context object that is passed by reference to each sub-agent in turn. Sub-agents read from context, execute their task, and append their output back to context. This ensures full traceability — every step can be replayed from the context snapshot.
        </Para>

        {/* Context object diagram */}
        <div style={{ background: '#1e1e2e', borderRadius: 10, padding: 20, marginBottom: 16, fontFamily: 'monospace', fontSize: 12 }}>
          <div style={{ color: '#7c3aed', marginBottom: 4 }}>// Session context object (passed through all sub-agents)</div>
          <div style={{ color: '#e2e8f0' }}>{'{'}</div>
          <div style={{ paddingLeft: 20, color: '#93c5fd' }}>  session_id<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#86efac' }}>"sess_20483"</span><span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#93c5fd' }}>  member_id<span style={{ color: '#94a3b8' }}>:</span>  <span style={{ color: '#86efac' }}>"mbr_4821"</span><span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#93c5fd' }}>  intent<span style={{ color: '#94a3b8' }}>:</span>      <span style={{ color: '#86efac' }}>"address_update"</span><span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#93c5fd' }}>  confidence<span style={{ color: '#94a3b8' }}>:</span>  <span style={{ color: '#fbbf24' }}>0.94</span><span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#7dd3fc' }}>  auth<span style={{ color: '#94a3b8' }}>:</span>        {'{'} verified<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#fbbf24' }}>true</span><span style={{ color: '#94a3b8' }}>,</span> method<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#86efac' }}>"otp"</span> {'}'}<span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#7dd3fc' }}>  data<span style={{ color: '#94a3b8' }}>:</span>        {'{'} new_address<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#86efac' }}>"4521 Oak St, Austin TX"</span> {'}'}<span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#7dd3fc' }}>  compliance<span style={{ color: '#94a3b8' }}>:</span>  {'{'} result<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#86efac' }}>"PENDING_APPROVAL"</span><span style={{ color: '#94a3b8' }}>,</span> risk<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#fbbf24' }}>0.78</span> {'}'}<span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#7dd3fc' }}>  fulfilment<span style={{ color: '#94a3b8' }}>:</span>  <span style={{ color: '#94a3b8' }}>null</span><span style={{ color: '#94a3b8' }}>,</span></div>
          <div style={{ paddingLeft: 20, color: '#7dd3fc' }}>  audit_trail<span style={{ color: '#94a3b8' }}>:</span> <span style={{ color: '#94a3b8' }}>[</span><span style={{ color: '#86efac' }}>"otp_send"</span><span style={{ color: '#94a3b8' }}>,</span> <span style={{ color: '#86efac' }}>"member_profile_read"</span><span style={{ color: '#94a3b8' }}>,</span> <span style={{ color: '#86efac' }}>"regulation_check"</span><span style={{ color: '#94a3b8' }}>]</span></div>
          <div style={{ color: '#e2e8f0' }}>{'}'}</div>
        </div>

        <SubHeading>4.1 Sequential vs Parallel Execution</SubHeading>
        <Para>
          By default the Orchestrator executes the plan sequentially — each sub-agent waits for the prior step's output before starting. Steps with no data dependency on each other can be promoted to parallel execution. For example, <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '1px 5px', borderRadius: 3 }}>fraud_check</code> and <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f3f4f6', padding: '1px 5px', borderRadius: 3 }}>member_profile_read</code> may run in parallel since neither depends on the other.
        </Para>

        {/* Sequential vs parallel diagram */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 12 }}>SEQUENTIAL (default)</div>
            {['Auth', 'Data collect', 'Compliance', 'Fulfilment', 'Notify'].map((a, i) => (
              <div key={a}>
                <div style={{ padding: '5px 10px', borderRadius: 5, background: '#e8f0fe', border: `1px solid #bfdbfe`, fontSize: 11, fontWeight: 600, color: colors.brand }}>{a}</div>
                {i < 4 && <div style={{ width: 1, height: 10, background: '#d1d5db', margin: '2px auto' }} />}
              </div>
            ))}
          </div>
          <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 12 }}>PARALLEL (when no dependency)</div>
            <div style={{ padding: '5px 10px', borderRadius: 5, background: '#e8f0fe', border: `1px solid #bfdbfe`, fontSize: 11, fontWeight: 600, color: colors.brand, marginBottom: 8 }}>Auth</div>
            <div style={{ width: 1, height: 10, background: '#d1d5db', margin: '2px auto 8px' }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <div style={{ flex: 1, padding: '5px 10px', borderRadius: 5, background: '#e0f2fe', border: `1px solid #bae6fd`, fontSize: 11, fontWeight: 600, color: '#0369a1', textAlign: 'center' }}>Data collect</div>
              <div style={{ flex: 1, padding: '5px 10px', borderRadius: 5, background: '#fef3c7', border: `1px solid #fde68a`, fontSize: 11, fontWeight: 600, color: '#92400e', textAlign: 'center' }}>fraud_check</div>
            </div>
            <div style={{ width: 1, height: 10, background: '#d1d5db', margin: '2px auto 8px' }} />
            <div style={{ padding: '5px 10px', borderRadius: 5, background: '#dcfce7', border: `1px solid #bbf7d0`, fontSize: 11, fontWeight: 600, color: '#166534' }}>Fulfilment</div>
          </div>
        </div>

        <SubHeading>4.2 Retry and Fault Handling</SubHeading>
        <BulletList items={[
          'Each sub-agent invocation has a configurable timeout (default 5s) and max retry count (default 2)',
          'On transient failure (e.g. Symitar timeout), the Orchestrator retries the step with exponential backoff',
          'On permanent failure (e.g. invalid compliance result), the Orchestrator halts the plan and escalates',
          'Partially-completed plans are snapshotted — if a session resumes, the Orchestrator fast-forwards to the last completed step',
        ]} />
      </DocSection>

      {/* 5. Skills layer */}
      <DocSection title="5. Skills Layer">
        <Para>
          Skills are the atomic integration units of the platform. Each skill wraps a single API call to a core system and enforces a strict caller policy — only designated sub-agents may invoke a given skill. All skill invocations are logged to an immutable audit trail.
        </Para>

        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Skill', 'Type', 'System', 'Caller policy', 'Audited'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['otp_send', 'write', 'SMS gateway', 'Auth only', true],
                ['member_profile_read', 'read', 'Symitar', 'Auth, Data, Fulfilment', true],
                ['address_update', 'write', 'Symitar', 'Fulfilment only', true],
                ['card_block', 'write', 'Visa DPS', 'Fulfilment only', true],
                ['card_replace', 'write', 'Visa DPS', 'Fulfilment only', true],
                ['regulation_check', 'read', 'Rules engine', 'Compliance only', true],
                ['fraud_check', 'read', 'Rules engine', 'Compliance only', true],
                ['audit_log_write', 'write', 'Audit store', 'All agents', true],
                ['notify_sms', 'write', 'SMS gateway', 'Notify only', true],
              ].map(([skill, type, system, policy, audited], i) => (
                <tr key={skill} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: '7px 12px', borderBottom: `1px solid ${colors.border}` }}>
                    <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#1e1e2e' }}>{skill}</code>
                  </td>
                  <td style={{ padding: '7px 12px', borderBottom: `1px solid ${colors.border}` }}>
                    <SkillPill label={type} variant={type === 'write' ? 'write' : 'read'} />
                  </td>
                  <td style={{ padding: '7px 12px', borderBottom: `1px solid ${colors.border}`, color: '#374151' }}>{system}</td>
                  <td style={{ padding: '7px 12px', borderBottom: `1px solid ${colors.border}`, color: '#374151' }}>{policy}</td>
                  <td style={{ padding: '7px 12px', borderBottom: `1px solid ${colors.border}` }}>
                    {audited && <CheckCircle size={13} color={colors.green} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Note>
          <strong>Caller policy enforcement</strong> is evaluated at runtime by the Skills runtime before each invocation. If a sub-agent attempts to call a skill outside its policy, the call is rejected and an anomaly is written to the audit log. This is the primary mechanism for preventing privilege escalation within the agent layer.
        </Note>
      </DocSection>

      {/* 6. End-to-end flow */}
      <DocSection title="6. End-to-End Request Flow">
        <Para>
          The following trace shows the full lifecycle of a successful address-update request, from channel ingestion to confirmation.
        </Para>
        <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20 }}>
          {[
            { t: '00:00', actor: 'Channel', color: '#374151', msg: 'Member sends: "I need to update my address to 302 Pine St, San Jose CA"' },
            { t: '00:00', actor: 'Orchestrator', color: colors.brand, msg: 'Intent classified: address_update (confidence 0.94). Plan constructed: 5 steps.' },
            { t: '00:01', actor: 'Auth', color: '#5b21b6', msg: '→ otp_send skill invoked. OTP dispatched to +1•••7823.' },
            { t: '00:18', actor: 'Auth', color: '#5b21b6', msg: '→ otp_verify skill: PASS. session_token issued. Context updated.' },
            { t: '00:19', actor: 'Data collect', color: '#0369a1', msg: '→ member_profile_read: Current address pre-filled. New address validated.' },
            { t: '00:20', actor: 'Compliance', color: '#92400e', msg: '→ regulation_check: In-state change, risk score 0.12. PASS. audit_log_write called.' },
            { t: '00:21', actor: 'Fulfilment', color: '#166534', msg: '→ address_update skill: COMMITTED to Symitar. Ref #AD-20231. audit_log_write called.' },
            { t: '00:21', actor: 'Notify', color: '#374151', msg: '→ notify_sms: Confirmation sent to member.' },
            { t: '00:21', actor: 'Orchestrator', color: colors.brand, msg: 'Plan complete. Session outcome: CONTAINED. All steps passed.' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
              <code style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', flexShrink: 0, marginTop: 2 }}>{row.t}</code>
              <span style={{ fontSize: 11, fontWeight: 700, color: row.color, minWidth: 90, flexShrink: 0 }}>{row.actor}</span>
              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{row.msg}</span>
            </div>
          ))}
        </div>
      </DocSection>

    </div>
  )
}
