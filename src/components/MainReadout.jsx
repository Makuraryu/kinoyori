// Central readout: 「今日は昨日より〔phrase〕」 with temp values, a pixel divider,
// then the dew-point phrase (a full sentence) with dew-point values. Ported from the design.

const block = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 'clamp(7px,1.4vw,15px)',
}
const subline = {
  fontFamily: "'Misaki Mincho','DotGothic16',monospace",
  fontSize: 'clamp(13px,2.6vw,18px)',
  color: 'var(--txtDim)',
  letterSpacing: '.05em',
  marginTop: '6px',
  whiteSpace: 'nowrap',
}

export default function MainReadout({ model }) {
  return (
    <div style={block}>
      <div style={{ fontSize: 'clamp(20px,5vw,42px)', letterSpacing: '.07em' }}>今日は昨日より</div>
      <div
        style={{
          fontSize: 'clamp(52px,15vw,176px)',
          lineHeight: 0.9,
          letterSpacing: '.01em',
          textShadow: '4px 4px 0 var(--shadow)',
        }}
      >
        {model.tempPhrase}
      </div>
      <div style={subline}>
        気温 {model.tTemp}°C ・ 昨日 {model.yTemp}°C
      </div>
      <div
        style={{
          height: '4px',
          width: 'clamp(120px,30vw,320px)',
          margin: 'clamp(10px,2vw,22px) 0',
          background: 'repeating-linear-gradient(90deg,var(--txt) 0 10px,transparent 10px 18px)',
        }}
      />
      <div style={{ fontSize: 'clamp(20px,5vw,40px)', letterSpacing: '.03em' }}>{model.dewLine}</div>
      <div style={subline}>
        露点 {model.tDew}°C ・ 昨日 {model.yDew}°C
      </div>
    </div>
  )
}
