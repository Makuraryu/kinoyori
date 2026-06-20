// Frosted-glass humidity vignette: a center-clear, edge-fogged blur whose
// strength rises with mugginess (--fogA / --fogBlur / --fogClearStop).
// Ported from the design.

const MASK = 'radial-gradient(128% 120% at 50% 42%, transparent var(--fogClearStop), #000 100%)'

export default function FogVignette() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: 'rgba(255,255,255,var(--fogA))',
        backdropFilter: 'blur(calc(var(--fogBlur) * 1px))',
        WebkitBackdropFilter: 'blur(calc(var(--fogBlur) * 1px))',
        maskImage: MASK,
        WebkitMaskImage: MASK,
      }}
    />
  )
}
