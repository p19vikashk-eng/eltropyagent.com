import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Agents from './components/Agents'
import SkillsAPIs from './components/SkillsAPIs'
import KnowledgeBase from './components/KnowledgeBase'
import AIConversations from './components/AIConversations'
import AuditLogs from './components/AuditLogs'
import Settings from './components/Settings'
import Simulation from './components/Simulation'
import SystemDocs from './components/SystemDocs'

export const INITIAL_AGENTS = [
  {
    id: 'addr', name: 'Address update agent', status: 'live',
    description: 'Handles member requests to update mailing or physical addresses. Verifies identity, validates the new address, flags out-of-state changes, and routes for compliance approval when required.',
    subAgents: ['Auth', 'Data collect', 'Fulfilment', 'Notify'],
    integrations: 'Symitar', sessions: '342 sessions this week · 97% containment',
    sop: `1. Verify member identity via OTP before any data collection.
2. Pre-fill current address from Symitar core system.
3. Collect new address; validate format and completeness.
4. Flag out-of-state changes for compliance review.
5. Submit address_update skill only after compliance check passes.
6. Notify member via in-channel message on success.`,
    health: {
      containment: 97, containmentTarget: 90,
      avgTurns: 5.4, avgTurnsTarget: 7,
      escalationRate: 3, escalationTarget: 10,
      issues: [],
    },
  },
  {
    id: 'card', name: 'Card services agent', status: 'live',
    description: 'Manages card-related requests including blocking lost/stolen cards, issuing replacements, and handling disputes. Runs compliance checks before any card action.',
    subAgents: ['Auth', 'Fulfilment', 'Compliance', 'Notify'],
    integrations: 'Symitar + Visa', sessions: '521 sessions this week · 88% containment',
    sop: `1. Authenticate member via KBA before any card action.
2. Determine card action: block, replace, or dispute.
3. For card_block: execute immediately after auth.
4. For card_replace: check for 2nd replacement within 30 days — flag for compliance if found.
5. Log all actions to audit_log_write.
6. Send SMS confirmation to member.`,
    health: {
      containment: 88, containmentTarget: 90,
      avgTurns: 8.2, avgTurnsTarget: 7,
      escalationRate: 18, escalationTarget: 10,
      issues: [
        {
          severity: 'high',
          metric: 'Escalation rate 18% — above 10% target',
          detail: '94 of 521 sessions escalated this week, up from 11% last week.',
          actions: ['Review card_replace SOP — policy check triggers too broadly', 'Add clarification step before routing to compliance'],
        },
        {
          severity: 'medium',
          metric: 'Avg turns 8.2 — above 7-turn target',
          detail: 'Sessions involving card disputes average 11.4 turns before resolution.',
          actions: ['Add a dispute type selector early in the flow to reduce back-and-forth', 'Pre-fill last 3 transactions to speed up dispute identification'],
        },
      ],
    },
  },
  {
    id: 'loan', name: 'Loan enquiry agent', status: 'draft',
    description: 'Answers member questions about loan products, rates, and eligibility. Planned to integrate with LOS for pre-qualification lookups.',
    subAgents: ['Auth', 'Data collect'],
    integrations: null, sessions: 'Pending: SOP definition · API integration not tested',
    step: 2, totalSteps: 3,
    sop: '',
  },
]

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [agents, setAgents] = useState(INITIAL_AGENTS)

  const screenProps = { onNav: setScreen, agents, setAgents }

  const SCREENS = {
    dashboard: <Dashboard {...screenProps} />,
    agents: <Agents {...screenProps} />,
    skills: <SkillsAPIs onNav={setScreen} />,
    knowledge: <KnowledgeBase onNav={setScreen} />,
    inbox: <AIConversations onNav={setScreen} />,
    audit: <AuditLogs onNav={setScreen} />,
    settings: <Settings onNav={setScreen} />,
    simulation: <Simulation onNav={setScreen} agents={agents} />,
    docs: <SystemDocs onNav={setScreen} />,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Sidebar active={screen} onNav={setScreen} />
      <div id="main-scroll" style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        {SCREENS[screen] || SCREENS.dashboard}
      </div>
    </div>
  )
}
