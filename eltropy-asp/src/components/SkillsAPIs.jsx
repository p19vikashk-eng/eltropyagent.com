import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Wifi, WifiOff, AlertCircle, CheckCircle, ExternalLink, X, Package, Wrench } from 'lucide-react'
import { Card, Badge, Button, Section, colors, Dot, Divider } from './ui'

const CONNECTED_SYSTEMS = [
  { name: 'Symitar (primary core)', id: 'symitar', status: 'connected' },
  { name: 'Visa DPS (card network)', id: 'visa', status: 'connected' },
  { name: 'LOS (lending system)', id: 'los', status: 'auth_pending' },
]

const SKILL_HEALTH = [
  { skill: 'member_profile_read', uptime: '99.8%', status: 'healthy' },
  { skill: 'card_block', uptime: '99.6%', status: 'healthy' },
  { skill: 'los_submit', uptime: 'Degraded · 340ms avg', status: 'degraded' },
]

const SKILLS = [
  // Eltropy in-house skills
  { name: 'member_profile_read', permission: 'read', policy: 'Auth, Data, Fulfilment', source: 'inhouse',
    endpoint: 'GET /v1/members/{id}',
    input: { member_id: 'string' }, output: { name: 'string', address: 'string', ssn_masked: 'string' } },
  { name: 'address_update', permission: 'write', policy: 'Fulfilment only', source: 'inhouse',
    endpoint: 'PUT /v1/members/{id}/address',
    input: { member_id: 'string', new_address: 'object', approval_token: 'string?' }, output: { status: 'string', ref: 'string' } },
  { name: 'card_block', permission: 'write', policy: 'Fulfilment only', source: 'inhouse',
    endpoint: 'POST /v1/cards/{id}/block',
    input: { card_id: 'string', reason: 'string' }, output: { status: 'string', ref: 'string', blocked_at: 'string' } },
  { name: 'audit_log_write', permission: 'write', policy: 'All skills', source: 'inhouse',
    endpoint: 'POST /v1/audit/events',
    input: { event_type: 'string', agent_id: 'string', payload: 'object' }, output: { event_id: 'string' } },
  { name: 'regulation_check', permission: 'read', policy: 'Compliance only', source: 'inhouse',
    endpoint: 'POST /v1/compliance/check',
    input: { action: 'string', member_id: 'string', context: 'object' }, output: { decision: 'pass|fail', score: 'number', flags: 'string[]' } },
  { name: 'otp_send', permission: 'write', policy: 'Auth only', source: 'inhouse',
    endpoint: 'POST /v1/auth/otp',
    input: { member_id: 'string', channel: 'sms|email' }, output: { otp_ref: 'string', expires_at: 'string' } },
  { name: 'session_token_create', permission: 'write', policy: 'Auth only', source: 'inhouse',
    endpoint: 'POST /v1/auth/sessions',
    input: { otp_ref: 'string', member_id: 'string' }, output: { token: 'string', expires_at: 'string' } },
  { name: 'account_read', permission: 'read', policy: 'Auth, Data, Fulfilment', source: 'inhouse',
    endpoint: 'GET /v1/accounts/{id}',
    input: { account_id: 'string' }, output: { balance: 'number', currency: 'string', status: 'string' } },
  { name: 'los_submit', permission: 'write', policy: 'Fulfilment only', source: 'inhouse',
    endpoint: 'POST /v1/loans/applications',
    input: { member_id: 'string', loan_type: 'string', amount: 'number' }, output: { application_id: 'string', decision: 'string' } },
  // Custom skills (built by Cobalt CU)
  { name: 'cd_rate_lookup', permission: 'read', policy: 'Auth, Data, Fulfilment', source: 'custom',
    endpoint: 'GET /cu/rates/cd',
    input: { term_months: 'number', amount: 'number' }, output: { apy: 'number', effective_date: 'string' } },
  { name: 'member_loyalty_check', permission: 'read', policy: 'Compliance only', source: 'custom',
    endpoint: 'GET /cu/members/{id}/loyalty',
    input: { member_id: 'string' }, output: { tier: 'string', points: 'number', since: 'string' } },
  { name: 'branch_appointment_book', permission: 'write', policy: 'Fulfilment only', source: 'custom',
    endpoint: 'POST /cu/appointments',
    input: { member_id: 'string', branch_id: 'string', slot: 'string', reason: 'string' }, output: { confirmation_id: 'string', slot: 'string' } },
]

function SchemaModal({ skill, onClose }) {
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 480, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{skill.name}</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{skill.endpoint}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.05em', marginBottom: 8 }}>INPUT</div>
            <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 14px' }}>
              {Object.entries(skill.input).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, lastChild: { marginBottom: 0 } }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e40af' }}>{k}</span>
                  <span style={{ fontFamily: 'monospace', color: '#166534', fontSize: 11 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.05em', marginBottom: 8 }}>OUTPUT</div>
            <div style={{ background: '#f9fafb', border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 14px' }}>
              {Object.entries(skill.output).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e40af' }}>{k}</span>
                  <span style={{ fontFamily: 'monospace', color: '#166534', fontSize: 11 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#92400e' }}>Caller policy: </span>
            <span style={{ color: '#92400e' }}>{skill.policy}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function SkillsAPIs() {
  const [showRegister, setShowRegister] = useState(false)
  const [permFilter, setPermFilter] = useState('all')
  const [sourceTab, setSourceTab] = useState('all')
  const [schemaSkill, setSchemaSkill] = useState(null)

  const filtered = SKILLS
    .filter(s => sourceTab === 'all' || s.source === sourceTab)
    .filter(s => permFilter === 'all' || s.permission === permFilter)

  const inhouseCount = SKILLS.filter(s => s.source === 'inhouse').length
  const customCount = SKILLS.filter(s => s.source === 'custom').length

  return (
    <Section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Skills & APIs</h1>
          <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {SKILLS.length} skills registered · {CONNECTED_SYSTEMS.filter(s => s.status === 'connected').length} core systems connected
          </p>
        </div>
        <Button onClick={() => setShowRegister(true)} style={{ gap: 6 }}>
          <Plus size={14} /> Register skill <ExternalLink size={12} />
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Connected systems */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Connected systems</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CONNECTED_SYSTEMS.map(sys => (
              <div key={sys.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sys.status === 'connected'
                    ? <Wifi size={14} color={colors.green} />
                    : <WifiOff size={14} color={colors.yellow} />
                  }
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{sys.name}</span>
                </div>
                <Badge variant={sys.status === 'connected' ? 'connected' : 'pending'}>
                  {sys.status === 'connected' ? 'Connected' : 'Auth pending'}
                </Badge>
              </div>
            ))}
          </div>
          <button style={{
            marginTop: 14, width: '100%', padding: '8px', borderRadius: 7,
            border: `1px dashed ${colors.border}`, fontSize: 12, color: colors.brand,
            background: '#f9fafb', cursor: 'pointer', fontWeight: 500
          }}>
            + Add system integration
          </button>
        </Card>

        {/* Skill health */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Skill health</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SKILL_HEALTH.map(s => (
              <div key={s.skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {s.status === 'healthy'
                    ? <CheckCircle size={14} color={colors.green} />
                    : <AlertCircle size={14} color={colors.red} />
                  }
                  <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{s.skill}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: s.status === 'healthy' ? colors.green : colors.red
                }}>{s.uptime}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '8px 12px', background: '#f9fafb', borderRadius: 7, fontSize: 11, color: colors.textMuted }}>
            Last health check: 2 min ago · All read skills nominal
          </div>
        </Card>
      </div>

      {/* Skill registry */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Skill registry</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'read', 'write'].map(f => (
              <button key={f} onClick={() => setPermFilter(f)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: permFilter === f ? colors.brand : '#f3f4f6',
                color: permFilter === f ? '#fff' : colors.textMuted,
                border: 'none'
              }}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Source tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 14, borderBottom: `1px solid ${colors.border}` }}>
          {[
            { id: 'all', label: `All skills`, count: SKILLS.length },
            { id: 'inhouse', label: 'Eltropy in-house', count: inhouseCount },
            { id: 'custom', label: 'Custom', count: customCount },
          ].map(t => (
            <button key={t.id} onClick={() => setSourceTab(t.id)} style={{
              padding: '8px 16px', fontSize: 12, fontWeight: sourceTab === t.id ? 700 : 400, cursor: 'pointer',
              background: 'none', border: 'none', borderBottom: `2px solid ${sourceTab === t.id ? colors.brand : 'transparent'}`,
              color: sourceTab === t.id ? colors.brand : colors.textMuted, marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              {t.id === 'inhouse' && <Package size={12} />}
              {t.id === 'custom' && <Wrench size={12} />}
              {t.label}
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                background: sourceTab === t.id ? colors.brand : '#f3f4f6',
                color: sourceTab === t.id ? '#fff' : colors.textMuted
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {sourceTab !== 'all' && (
          <div style={{
            padding: '8px 12px', borderRadius: 7, marginBottom: 12, fontSize: 11,
            background: sourceTab === 'inhouse' ? '#eff6ff' : '#f0fdf4',
            border: `1px solid ${sourceTab === 'inhouse' ? '#bfdbfe' : '#bbf7d0'}`,
            color: sourceTab === 'inhouse' ? '#1e40af' : '#166534',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {sourceTab === 'inhouse'
              ? <><Package size={12} /> Eltropy in-house skills are maintained and versioned by Eltropy. Updates are applied automatically.</>
              : <><Wrench size={12} /> Custom skills are built and maintained by your team. You own the endpoint and schema.</>
            }
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              {['Skill name', 'Source', 'Permission', 'Caller policy', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 600, color: colors.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((skill, i) => (
              <tr key={skill.name} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                <td style={{ padding: '9px 10px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: colors.text }}>{skill.name}</span>
                </td>
                <td style={{ padding: '9px 10px' }}>
                  {skill.source === 'inhouse' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#eff6ff', color: '#1e40af' }}>
                      <Package size={10} /> Eltropy
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f0fdf4', color: '#166534' }}>
                      <Wrench size={10} /> Custom
                    </span>
                  )}
                </td>
                <td style={{ padding: '9px 10px' }}>
                  <Badge variant={skill.permission}>{skill.permission}</Badge>
                </td>
                <td style={{ padding: '9px 10px', fontSize: 12, color: colors.textMuted }}>{skill.policy}</td>
                <td style={{ padding: '9px 10px' }}>
                  <button onClick={() => setSchemaSkill(skill)} style={{ fontSize: 11, color: colors.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    View schema
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12, fontSize: 11, color: colors.textMuted, padding: '0 10px' }}>
          {inhouseCount} Eltropy in-house · {customCount} custom · Write skills require a skill intermediary
        </div>
      </Card>

      {schemaSkill && <SchemaModal skill={schemaSkill} onClose={() => setSchemaSkill(null)} />}

      {showRegister && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <Card style={{ width: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Register skill</span>
              <button onClick={() => setShowRegister(false)} style={{ fontSize: 20, color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            {[
              { label: 'Skill name', placeholder: 'e.g. loan_rate_read' },
              { label: 'Endpoint URL', placeholder: 'https://api.symitar.cu/v1/...' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 12, outline: 'none' }} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 4 }}>Permission level</label>
              <select style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 12, outline: 'none', background: '#fff' }}>
                <option>read</option>
                <option>write</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 4 }}>Caller policy</label>
              <select style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 7, fontSize: 12, outline: 'none', background: '#fff' }}>
                <option>Fulfilment only</option>
                <option>Auth only</option>
                <option>Compliance only</option>
                <option>All skills</option>
                <option>Auth, Data, Fulfilment</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowRegister(false)}>Cancel</Button>
              <Button onClick={() => setShowRegister(false)}>Register skill</Button>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </Section>
  )
}
