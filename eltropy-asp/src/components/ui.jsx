// Shared UI primitives

export const colors = {
  brand: '#1a56db',
  brandLight: '#e8f0fe',
  green: '#16a34a',
  greenBg: '#dcfce7',
  red: '#dc2626',
  redBg: '#fee2e2',
  yellow: '#d97706',
  yellowBg: '#fef3c7',
  gray: '#6b7280',
  grayBg: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  surface: '#ffffff',
  surfaceHover: '#f9fafb',
}

export function Badge({ variant = 'default', children, style }) {
  const variants = {
    live: { background: colors.greenBg, color: colors.green },
    draft: { background: '#fef3c7', color: '#92400e' },
    pending: { background: '#fef3c7', color: '#92400e' },
    read: { background: '#dbeafe', color: '#1e40af' },
    write: { background: '#fce7f3', color: '#9d174d' },
    active: { background: colors.greenBg, color: colors.green },
    outdated: { background: colors.redBg, color: colors.red },
    degraded: { background: colors.redBg, color: colors.red },
    healthy: { background: colors.greenBg, color: colors.green },
    connected: { background: colors.greenBg, color: colors.green },
    default: { background: colors.grayBg, color: colors.gray },
    high: { background: '#fee2e2', color: '#991b1b' },
    low: { background: '#fef3c7', color: '#92400e' },
    medium: { background: '#fef3c7', color: '#92400e' },
    approval: { background: '#fef3c7', color: '#92400e' },
    phase2: { background: '#ede9fe', color: '#5b21b6' },
    paused: { background: '#fff7ed', color: '#92400e' },
  }
  const s = variants[variant] || variants.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      ...s, ...style
    }}>
      {(variant === 'live' || variant === 'connected') && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.green, display: 'inline-block' }} />
      )}
      {children}
    </span>
  )
}

export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: 16,
      ...(onClick ? { cursor: 'pointer' } : {}),
      ...style
    }}>
      {children}
    </div>
  )
}

export function Button({ variant = 'primary', children, onClick, style, disabled }) {
  const variants = {
    primary: { background: colors.brand, color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: colors.text, border: `1px solid ${colors.border}` },
    ghost: { background: 'transparent', color: colors.textMuted, border: 'none' },
    danger: { background: colors.red, color: '#fff', border: 'none' },
    success: { background: colors.green, color: '#fff', border: 'none' },
    outline: { background: '#fff', color: colors.brand, border: `1px solid ${colors.brand}` },
  }
  const s = variants[variant] || variants.primary
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s, padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...style
    }}>
      {children}
    </button>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>{title}</h1>
        {subtitle && <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, sub, trend, trendUp }) {
  return (
    <Card>
      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, marginTop: 3, color: trendUp ? colors.green : trendUp === false ? colors.red : colors.textMuted }}>
          {trend && <span>{trend} </span>}
          {sub}
        </div>
      )}
    </Card>
  )
}

export function Dot({ color = '#16a34a', size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
}

export function Section({ children, style }) {
  return <div style={{ padding: '24px 28px', ...style }}>{children}</div>
}

export function Divider() {
  return <div style={{ height: 1, background: colors.border, margin: '16px 0' }} />
}

export function Avatar({ name, size = 32, bg = '#1a56db' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0
    }}>{initials}</div>
  )
}

export function Tag({ children, style }) {
  return (
    <span style={{
      padding: '1px 7px', borderRadius: 5, fontSize: 11,
      background: colors.grayBg, color: colors.textMuted, border: `1px solid ${colors.border}`,
      ...style
    }}>{children}</span>
  )
}

export function ProgressBar({ value, max = 100, color = colors.brand, height = 4 }) {
  return (
    <div style={{ height, background: colors.border, borderRadius: height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: height, transition: 'width 0.3s' }} />
    </div>
  )
}
