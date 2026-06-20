import { CLIP_6 } from '../lib/theme.js'

// Reusable pixel window frame: dark outer border + white inner panel with the
// stair-stepped corners, plus an optional title bar. Shared by every sheet and
// the loading/error card. Ported from the design's about/detail windows.

const outer = {
  background: 'var(--txt)',
  padding: '3px',
  filter: 'drop-shadow(5px 6px 0 rgba(30,45,60,.20))',
  clipPath: CLIP_6,
}
const inner = {
  background: '#ffffff',
  clipPath: CLIP_6,
}
const titleBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  background: 'var(--titleBar)',
  padding: '15px 18px',
  color: 'var(--txt)',
  fontFamily: "'Misaki Mincho','DotGothic16',monospace",
  fontSize: 'clamp(15px,3vw,20px)',
  letterSpacing: '.08em',
}

export default function PixelWindow({ title, children }) {
  return (
    <div style={outer}>
      <div style={inner}>
        {title && <div style={titleBarStyle}>{title}</div>}
        {children}
      </div>
    </div>
  )
}
