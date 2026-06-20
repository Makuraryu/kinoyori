// Top bar: place name + status subtitle (left, tappable to open search) and the
// date (right). Ported from the design header.

const SUBTITLE = {
  geo: '現在地を検出しました',
  fallback: '現在地を取得できません',
}

const barStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  fontFamily: "'Misaki Mincho','DotGothic16',monospace",
  fontSize: 'clamp(12px,2.4vw,16px)',
  color: 'var(--txtDim)',
  letterSpacing: '.04em',
}

export default function LocationHeader({ location, dateStr, onSearch }) {
  const subtitle = SUBTITLE[location?.source] ?? location?.admin ?? ''
  return (
    <div style={barStyle}>
      <div onClick={onSearch} style={{ cursor: 'pointer' }} title="ばしょをさがす">
        {location?.name ?? '—'}
        <div style={{ fontSize: '.78em', opacity: 0.8, marginTop: 5 }}>{subtitle}</div>
      </div>
      <div style={{ textAlign: 'right' }}>{dateStr}</div>
    </div>
  )
}
