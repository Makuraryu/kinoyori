// Single source of styling truth. Ported from the design's renderVals(): all
// colors, CSS variables, and chrome (keycaps / tray / sheets) are derived from
// the same temperature/mugginess intensities so the whole screen shifts warm or
// cold together.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// Stair-stepped pixel corner used by keycaps, sheets, and badges.
// `a` = outer corner offset, `b` = inner step.
export function pixelClip(a, b) {
  return (
    `polygon(${a}px 0, calc(100% - ${a}px) 0, calc(100% - ${a}px) ${b}px, ` +
    `calc(100% - ${b}px) ${b}px, calc(100% - ${b}px) ${a}px, 100% ${a}px, ` +
    `100% calc(100% - ${a}px), calc(100% - ${b}px) calc(100% - ${a}px), ` +
    `calc(100% - ${b}px) calc(100% - ${b}px), calc(100% - ${a}px) calc(100% - ${b}px), ` +
    `calc(100% - ${a}px) 100%, ${a}px 100%, ${a}px calc(100% - ${b}px), ` +
    `${b}px calc(100% - ${b}px), ${b}px calc(100% - ${a}px), 0 calc(100% - ${a}px), ` +
    `0 ${a}px, ${b}px ${a}px, ${b}px ${b}px, ${a}px ${b}px)`
  )
}

export const CLIP_4 = pixelClip(4, 2)
export const CLIP_6 = pixelClip(6, 3)
export const CLIP_8 = pixelClip(8, 4)

export function computeTheme(model) {
  const { t, cold, muggy, rain } = model

  const baseHue = t >= 0 ? 30 : 250
  const hue = baseHue.toFixed(1)
  const cBase = (0.022 + 0.098 * Math.abs(t)) * (rain ? 0.55 : 1)

  const sky = [0.74, 0.8, 0.86, 0.92]
    .map((l) => clamp(l + (rain ? -0.05 : 0), 0, 1))
    .map((l) => `oklch(${l.toFixed(3)} ${cBase.toFixed(3)} ${hue})`)

  const txt = `oklch(0.34 ${Math.min(0.12, cBase * 1.3).toFixed(3)} ${hue})`
  const txtDim = `oklch(0.47 ${(cBase * 0.9).toFixed(3)} ${hue})`
  const shadow = `oklch(0.72 ${Math.min(0.12, cBase * 1.1).toFixed(3)} ${hue})`
  const sun = 'oklch(0.88 0.14 92)'
  const cloud = rain
    ? `oklch(0.80 0.02 ${hue})`
    : `oklch(0.985 0.012 ${hue})`
  const titleBar = `oklch(0.94 0.038 ${hue})`

  // Root container style: positioning + the CSS custom properties every layer
  // and effect reads from.
  const root = {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    fontFamily: "'DotGothic16',monospace",
    imageRendering: 'pixelated',
    color: txt,
    '--txt': txt,
    '--txtDim': txtDim,
    '--shadow': shadow,
    '--sun': sun,
    '--cloud': cloud,
    '--fogA': (muggy * 0.42).toFixed(3),
    '--fogBlur': (muggy * 9).toFixed(2),
    '--winBlur': (muggy * 8).toFixed(2),
    '--fogClearStop': (32 - muggy * 17).toFixed(1) + '%',
    '--glow': `oklch(0.86 0.17 ${hue})`,
    '--btnEdge': `oklch(0.84 0.035 ${hue})`,
    '--titleBar': titleBar,
    background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 34%, ${sky[2]} 67%, ${sky[3]} 100%)`,
  }

  // --- backlit pixel keycap (on = pressed / lit) ---
  const keyWall = `oklch(0.85 0.018 ${hue})`
  // Pressed glow, tinted to the temperature theme hue. Keeps the relationship
  // that sells "light is being emitted": a bright, low-chroma near-white core
  // bleeding out into a slightly darker, more saturated colored halo as the
  // blur radius grows (warm orange when hot, cold blue when cool).
  const litCore = `oklch(0.90 0.06 ${hue})`
  const litNear = `oklch(0.97 0.03 ${hue})`
  const litMid = `oklch(0.92 0.06 ${hue})`
  const litFar = `oklch(0.87 0.09 ${hue} / 0.55)`
  const mkKey = (on) => ({
    wrap: {
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      background: keyWall,
      paddingBottom: on ? '2px' : '7px',
      clipPath: CLIP_6,
      filter: on
        ? 'drop-shadow(2px 2px 0 rgba(40,56,72,.18))'
        : 'drop-shadow(3px 6px 0 rgba(40,56,72,.18))',
      transition: 'padding-bottom .09s steps(2), filter .09s steps(2)',
    },
    face: {
      position: 'relative',
      overflow: 'hidden',
      padding: '13px 21px',
      background: `radial-gradient(135% 130% at 50% 28%, #ffffff, oklch(0.965 0.012 ${hue}))`,
      clipPath: CLIP_6,
      boxShadow: on ? 'none' : 'inset 0 1px 0 rgba(255,255,255,.95)',
    },
    label: on
      ? {
          fontFamily: "'Misaki Mincho','DotGothic16',monospace",
          fontSize: 'clamp(12px,2.4vw,15px)',
          letterSpacing: '.07em',
          color: litCore,
          textShadow: `0 0 2px ${litNear}, 0 0 6px ${litMid}, 0 0 12px ${litFar}, 0 0 22px ${litFar}, 0 0 34px ${litFar}`,
        }
      : {
          fontFamily: "'Misaki Mincho','DotGothic16',monospace",
          fontSize: 'clamp(12px,2.4vw,15px)',
          letterSpacing: '.07em',
          color: 'oklch(0.94 0.004 250)',
          textShadow: '0 1px 0 rgba(255,255,255,.9), 0 -1px 1px rgba(38,50,64,.7), 0 -2px 3px rgba(38,50,64,.4)',
        },
  })

  // --- white keycap tray ---
  const trayOuter = {
    position: 'absolute',
    left: 'clamp(16px,3.5vw,32px)',
    bottom: 'clamp(16px,3.5vw,32px)',
    zIndex: 6,
    width: 'max-content',
    maxWidth: 'calc(100vw - clamp(32px,7vw,64px))',
    height: '84px',
    boxSizing: 'border-box',
    padding: '9px',
    background: `linear-gradient(180deg, #ffffff 0%, #ffffff 52%, oklch(0.93 0.013 ${hue}) 72%, oklch(0.86 0.02 ${hue}) 100%)`,
    clipPath: CLIP_8,
    filter: `drop-shadow(0 6px 0 oklch(0.78 0.025 ${hue})) drop-shadow(3px 10px 0 rgba(40,56,72,.20))`,
  }
  const trayInner = {
    height: '100%',
    boxSizing: 'border-box',
    padding: '0 8px',
    background: `linear-gradient(180deg, oklch(0.9 0.016 ${hue}) 0%, oklch(0.955 0.01 ${hue}) 30%)`,
    clipPath: CLIP_8,
    boxShadow: 'inset 0 3px 4px rgba(40,56,72,.16), inset 0 -2px 0 rgba(255,255,255,.9)',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  }

  // --- sheet scrim + rise-from-bottom panel ---
  const scrim = (anyOpen) => ({
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    background: 'rgba(20,34,46,0.28)',
    opacity: anyOpen ? 1 : 0,
    transition: 'opacity .3s steps(5)',
    pointerEvents: anyOpen ? 'auto' : 'none',
  })
  const mkSheet = (on) => ({
    position: 'absolute',
    left: '50%',
    bottom: 0,
    zIndex: 7,
    width: 'min(680px, 94%)',
    paddingBottom: 'clamp(120px,14vw,140px)',
    maxHeight: 'calc(100vh - 8px)',
    overflowY: 'auto',
    transform: on ? 'translate(-50%,0)' : 'translate(-50%,118%)',
    transition: 'transform .34s steps(7)',
    pointerEvents: on ? 'auto' : 'none',
  })

  return { baseHue, root, mkKey, trayOuter, trayInner, scrim, mkSheet, titleBar }
}
