import { useEffect, useRef } from 'react'
import { useAnimationFrame } from './useAnimationFrame.js'

/**
 * Subtle parallax: returns a ref whose element is translated by the cursor's
 * distance from the page center. The offset is normalized to -1..1 (mouse at an
 * edge = ±1) and eased toward each frame, then scaled by `strength` (px).
 * The element's transform is mutated directly (no re-render).
 */
export function useMouseParallax({ strength = 10, ease = 0.08 } = {}) {
  const ref = useRef(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      // distance from page center, normalized by half the viewport
      target.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useAnimationFrame(() => {
    const el = ref.current
    if (!el) return
    const c = current.current
    const t = target.current
    c.x += (t.x - c.x) * ease
    c.y += (t.y - c.y) * ease
    el.style.transform = `translate(${(c.x * strength).toFixed(2)}px, ${(c.y * strength).toFixed(2)}px)`
  })

  return ref
}
