// One backlit pixel keycap. Lights up green when `on`. Styling from theme.mkKey.

export default function Keycap({ label, on, onClick, theme }) {
  const key = theme.mkKey(on)
  return (
    <div onClick={onClick} style={key.wrap} role="button" aria-pressed={on}>
      <div style={key.face}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={key.label}>{label}</span>
        </div>
      </div>
    </div>
  )
}
