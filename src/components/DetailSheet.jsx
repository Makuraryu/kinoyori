import BottomSheet from './BottomSheet.jsx'

// Today's detail table. Rows come from model.detailRows.

const labelStyle = {
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(15px,3vw,20px)',
  color: 'var(--txtDim)',
  letterSpacing: '.05em',
  whiteSpace: 'nowrap',
}
const valueStyle = {
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(16px,3.4vw,22px)',
  color: 'var(--txt)',
  letterSpacing: '.04em',
  whiteSpace: 'nowrap',
}

export default function DetailSheet({ open, theme, model, location }) {
  return (
    <BottomSheet open={open} title="きょうの天気" theme={theme}>
      <div style={{ padding: 'clamp(18px,4vw,30px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(24px,5vw,34px)',
              letterSpacing: '.04em',
              color: 'var(--txt)',
              whiteSpace: 'nowrap',
            }}
          >
            {location?.name ?? '—'}
          </div>
          <div
            style={{
              fontFamily: "'DotGothic16',monospace",
              fontSize: 'clamp(15px,3vw,20px)',
              color: 'var(--txtDim)',
              letterSpacing: '.05em',
            }}
          >
            {model?.dateStr}
          </div>
        </div>
        {model?.detailRows.map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '9px 2px',
            }}
          >
            <div style={labelStyle}>{row.label}</div>
            <div
              style={{
                flex: 1,
                height: '3px',
                background: 'repeating-linear-gradient(90deg,var(--btnEdge) 0 4px,transparent 4px 8px)',
              }}
            />
            <div style={valueStyle}>{row.value}</div>
          </div>
        ))}
      </div>
    </BottomSheet>
  )
}
