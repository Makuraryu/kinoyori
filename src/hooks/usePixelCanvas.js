import { useEffect, useRef } from 'react'

/**
 * Reusable pixel-canvas sizer. Sizes the <canvas> backing store to its CSS box
 * divided by `pixelScale` (so `image-rendering: pixelated` upscales each logical
 * pixel into a chunky block), and calls `onResize(ctx, W, H)` whenever the size
 * or any value in `deps` changes — the hook where each effect (re)initializes.
 *
 * Returns { ref } to attach to the canvas and { sizeRef } holding the current
 * logical { W, H } for animation loops to read.
 */
export function usePixelCanvas(pixelScale, onResize, deps = []) {
  const ref = useRef(null)
  const sizeRef = useRef({ W: 0, H: 0 })
  const cbRef = useRef(onResize)
  cbRef.current = onResize

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const resize = () => {
      const rect = cv.getBoundingClientRect()
      const W = Math.max(1, Math.ceil(rect.width / pixelScale))
      const H = Math.max(1, Math.ceil(rect.height / pixelScale))
      cv.width = W
      cv.height = H
      sizeRef.current = { W, H }
      const ctx = cv.getContext('2d')
      ctx.imageSmoothingEnabled = false
      cbRef.current?.(ctx, W, H)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelScale, ...deps])

  return { ref, sizeRef }
}
