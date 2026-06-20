import { useCallback, useRef } from 'react'
import { usePixelCanvas } from '../../hooks/usePixelCanvas.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'

// Full-screen pixel layer: animated rain streaks (when raining) + static frost
// needles along the edges (when colder than yesterday). Ported from the design.

const fullCanvasStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
}

function buildRain(W, H, rain) {
  const count = rain ? Math.floor((W * H) / 170) : 0
  const drops = []
  for (let i = 0; i < count; i++)
    drops.push({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 2 + Math.floor(Math.random() * 4),
      spd: 1.2 + Math.random() * 1.7,
    })
  return drops
}

function buildFrost(W, H, cold) {
  const frost = []
  if (cold > 0.02) {
    const step = 2
    const mk = (x, y, dir) => {
      if (Math.random() > cold * 1.15) return
      const len = 2 + Math.floor(Math.random() * cold * 17)
      frost.push({ x, y, dir, len })
    }
    for (let x = 0; x < W; x += step) {
      mk(x, 0, 'd')
      mk(x, H - 1, 'u')
    }
    for (let y = 0; y < H; y += step) {
      mk(0, y, 'r')
      mk(W - 1, y, 'l')
    }
  }
  return frost
}

export default function PrecipLayer({ model, pixelScale }) {
  const rainRef = useRef([])
  const frostRef = useRef([])

  const onResize = useCallback(
    (ctx, W, H) => {
      rainRef.current = buildRain(W, H, model.rain)
      frostRef.current = buildFrost(W, H, model.cold)
      ctx.clearRect(0, 0, W, H)
    },
    [model.rain, model.cold],
  )

  const { ref, sizeRef } = usePixelCanvas(pixelScale, onResize, [model.rain, model.cold])

  useAnimationFrame(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const { W, H } = sizeRef.current
    ctx.clearRect(0, 0, W, H)

    const rain = rainRef.current
    if (rain.length) {
      ctx.fillStyle = 'rgba(222,237,255,0.55)'
      for (const d of rain) {
        ctx.fillRect(Math.floor(d.x), Math.floor(d.y), 1, d.len)
        d.y += d.spd
        d.x += 0.16
        if (d.y > H) {
          d.y = -d.len
          d.x = Math.random() * W
        }
      }
    }

    const frost = frostRef.current
    if (frost.length) {
      ctx.fillStyle = 'rgba(244,251,255,0.9)'
      for (const f of frost) {
        for (let i = 0; i < f.len; i++) {
          let x = f.x
          let y = f.y
          if (f.dir === 'd') y = f.y + i
          else if (f.dir === 'u') y = f.y - i
          else if (f.dir === 'r') x = f.x + i
          else x = f.x - i
          ctx.fillRect(x, y, 1, 1)
          if (i > 1 && i % 3 === 0) {
            if (f.dir === 'd' || f.dir === 'u') {
              ctx.fillRect(x - 1, y, 1, 1)
              ctx.fillRect(x + 1, y, 1, 1)
            } else {
              ctx.fillRect(x, y - 1, 1, 1)
              ctx.fillRect(x, y + 1, 1, 1)
            }
          }
        }
      }
    }
  })

  return <canvas ref={ref} style={fullCanvasStyle} />
}
