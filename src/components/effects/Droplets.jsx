import { useCallback } from 'react'
import { usePixelCanvas } from '../../hooks/usePixelCanvas.js'

// Static condensation droplets on the glass — density scales with mugginess.
// Ported from the design; drawn once per size/mugginess change (no animation).

const fullCanvasStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
}

export default function Droplets({ model, pixelScale }) {
  const muggy = model.muggy

  const onResize = useCallback(
    (ctx, W, H) => {
      ctx.clearRect(0, 0, W, H)
      const count = Math.floor((muggy * W * H) / 1300)
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * W)
        const y = Math.floor(Math.random() * H)
        const r = 1 + Math.floor(Math.random() * (muggy > 0.55 ? 3 : 2))
        ctx.fillStyle = 'rgba(140,170,190,0.40)'
        ctx.fillRect(x, y + r, r, 1)
        ctx.fillStyle = 'rgba(255,255,255,0.52)'
        ctx.fillRect(x, y, r, r)
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.fillRect(x, y, 1, 1)
      }
    },
    [muggy],
  )

  const { ref } = usePixelCanvas(pixelScale, onResize, [muggy])

  return <canvas ref={ref} style={fullCanvasStyle} />
}
