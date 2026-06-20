import { useCallback, useEffect, useRef } from 'react'
import { usePixelCanvas } from '../../hooks/usePixelCanvas.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'

// Pixel-style window reflections (frame, glints, diagonal streaks, sparkles).
// The reflections drift with the mouse for parallax; the layer is CSS-blurred by
// rising mugginess via --winBlur. Ported from the design's drawWindowGlass.

const fullCanvasStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
  backdropFilter: 'blur(calc(var(--winBlur) * 1px))',
  WebkitBackdropFilter: 'blur(calc(var(--winBlur) * 1px))',
}

function drawWindowGlass(ctx, W, H, ox = 0, oy = 0) {
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, W, H)
  const fi = 0
  const frame = 'rgba(184,218,255,0.82)'
  const frameHi = 'rgba(255,255,255,0.5)'
  const glint = 'rgba(255,255,255,0.9)'
  const px2 = (x, y, w, h, c) => {
    ctx.fillStyle = c
    ctx.fillRect(Math.round(x), Math.round(y), w, h)
  }

  // frame
  px2(fi, fi, W - 2 * fi, 2, frame)
  px2(fi, H - fi - 2, W - 2 * fi, 2, frame)
  px2(fi, fi, 2, H - 2 * fi, frame)
  px2(W - fi - 2, fi, 2, H - 2 * fi, frame)
  // inner highlights
  px2(fi + 2, fi + 2, W - 2 * fi - 4, 1, frameHi)
  px2(fi + 2, fi + 2, 1, H - 2 * fi - 4, frameHi)
  px2(W - fi - 3, fi + 2, 1, H - 2 * fi - 4, frameHi)

  // corner glints
  for (const [cx, cy] of [
    [fi, fi],
    [W - fi - 2, fi],
    [fi, H - fi - 2],
    [W - fi - 2, H - fi - 2],
  ]) {
    px2(cx, cy, 2, 7, glint)
    px2(cx, cy, 7, 2, glint)
  }

  // diagonal reflection streaks (pixel staircase)
  const streak = (x0, y0, len, thick) => {
    for (let i = 0; i <= len; i++) {
      const px = x0 + i
      const py = y0 - i
      ctx.fillStyle = 'rgba(208,228,255,0.16)'
      for (let j = -thick; j <= thick; j++) ctx.fillRect(Math.round(px + j), Math.round(py + j), 1, 1)
      ctx.fillStyle = 'rgba(255,255,255,0.42)'
      ctx.fillRect(Math.round(px), Math.round(py), 1, 1)
      if (thick > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(Math.round(px + 1), Math.round(py + 1), 1, 1)
      }
    }
  }
  const L = Math.round(H * 0.34)
  streak(Math.round(W * 0.08 + ox), Math.round(H * 0.46 + oy), L, 3)
  streak(Math.round(W * 0.15 + ox), Math.round(H * 0.45 + oy), Math.round(L * 0.9), 1)
  streak(Math.round(W * 0.57 + ox), Math.round(H * 0.9 + oy), L, 3)
  streak(Math.round(W * 0.64 + ox), Math.round(H * 0.9 + oy), Math.round(L * 0.9), 1)

  // sparkles
  const spark = (x, y, s) => {
    ctx.fillStyle = glint
    ctx.fillRect(x, y - s, 1, 2 * s + 1)
    ctx.fillRect(x - s, y, 2 * s + 1, 1)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillRect(x - 1, y - 1, 1, 1)
    ctx.fillRect(x + 1, y + 1, 1, 1)
    ctx.fillRect(x - 1, y + 1, 1, 1)
    ctx.fillRect(x + 1, y - 1, 1, 1)
  }
  spark(Math.round(W * 0.13 + ox * 1.3), Math.round(H * 0.16 + oy * 1.3), 2)
  spark(Math.round(W * 0.79 + ox * 1.3), Math.round(H * 0.8 + oy * 1.3), 2)
  px2(Math.round(W * 0.1 + ox * 1.3), Math.round(H * 0.2 + oy * 1.3), 1, 1, glint)
  px2(Math.round(W * 0.82 + ox * 1.3), Math.round(H * 0.84 + oy * 1.3), 1, 1, glint)
}

export default function WindowGlass({ pixelScale }) {
  const mouseTarget = useRef({ x: 0, y: 0 })
  const winOff = useRef({ x: 0, y: 0 })

  const onResize = useCallback((ctx, W, H) => {
    drawWindowGlass(ctx, W, H)
  }, [])

  const { ref, sizeRef } = usePixelCanvas(pixelScale, onResize)

  useEffect(() => {
    const onMouse = (e) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useAnimationFrame(() => {
    const cv = ref.current
    if (!cv) return
    const off = winOff.current
    const tgt = mouseTarget.current
    off.x += (tgt.x - off.x) * 0.08
    off.y += (tgt.y - off.y) * 0.08
    const { W, H } = sizeRef.current
    drawWindowGlass(cv.getContext('2d'), W, H, off.x * 7, off.y * 5)
  })

  return <canvas ref={ref} style={fullCanvasStyle} />
}
