import { LayoutDashboard, Bot, Wrench, BookOpen, MessageSquare, FileText, Settings, FlaskConical, ChevronDown, BookMarked } from 'lucide-react'
import { colors } from './ui'

const NAV = [
  { section: 'OVERVIEW' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { section: 'BUILD' },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'skills', label: 'Skills & APIs', icon: Wrench },
  { id: 'knowledge', label: 'Knowledge base', icon: BookOpen },
  { section: 'OPERATE' },
  { id: 'inbox', label: 'AI conversations', icon: MessageSquare },
  { section: 'TEST' },
  { id: 'simulation', label: 'Test simulation', icon: FlaskConical },
]

export default function Sidebar({ active, onNav }) {
  return (
    <aside style={{
      width: 220, background: '#fff', borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', overflow: 'auto'
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1a56db, #5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>E</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>Eltropy ASP</div>
            <div style={{ fontSize: 10, color: colors.textMuted }}>Cobalt Credit Union</div>
          </div>
          <ChevronDown size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px' }}>
        {NAV.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} style={{
                fontSize: 10, fontWeight: 600, color: colors.textMuted,
                letterSpacing: '0.08em', padding: '10px 8px 4px', marginTop: i > 0 ? 4 : 0
              }}>{item.section}</div>
            )
          }
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 10px', borderRadius: 7, textAlign: 'left',
              background: isActive ? colors.brandLight : 'transparent',
              color: isActive ? colors.brand : colors.text,
              fontWeight: isActive ? 600 : 400,
              fontSize: 13, marginBottom: 1,
              transition: 'background 0.15s',
            }}>
              <Icon size={15} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: '#dc2626', color: '#fff', borderRadius: 99,
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center'
                }}>{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}` }}>
        <button onClick={() => onNav('settings')} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 7, textAlign: 'left',
          background: active === 'settings' ? colors.brandLight : 'transparent',
          color: active === 'settings' ? colors.brand : colors.textMuted,
          fontSize: 13,
        }}>
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  )
}
