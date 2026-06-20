// Sky weather layer: a pulsing pixel sun (when sunny) and two drifting pixel
// clouds. Pure DOM/CSS, ported from the design. Colors come from --sun / --cloud.

const SUN_CLIP =
  'polygon(33% 0,67% 0,67% 11%,89% 11%,89% 33%,100% 33%,100% 67%,89% 67%,89% 89%,67% 89%,67% 100%,33% 100%,33% 89%,11% 89%,11% 67%,0 67%,0 33%,11% 33%,11% 11%,33% 11%)'

export default function SkyLayer({ isSunny }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      {isSunny && (
        <div
          style={{
            position: 'absolute',
            top: '9%',
            right: '9%',
            width: 'clamp(64px,11vw,120px)',
            aspectRatio: '1',
            background: 'var(--sun)',
            clipPath: SUN_CLIP,
            animation: 'kn-pulse 4.5s steps(2,jump-none) infinite',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: 0,
          color: 'var(--cloud)',
          width: '22px',
          height: '22px',
          background: 'currentColor',
          boxShadow:
            '22px 0 0 currentColor,44px 0 0 currentColor,22px -22px 0 currentColor,-22px 0 0 currentColor',
          animation: 'kn-drift1 72s steps(64) infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: 0,
          color: 'var(--cloud)',
          width: '16px',
          height: '16px',
          background: 'currentColor',
          boxShadow:
            '16px 0 0 currentColor,32px 0 0 currentColor,16px -16px 0 currentColor,-16px 0 0 currentColor',
          opacity: 0.85,
          animation: 'kn-drift2 98s steps(80) infinite',
          animationDelay: '-34s',
        }}
      />
    </div>
  )
}
