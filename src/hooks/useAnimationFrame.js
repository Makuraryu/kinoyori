import { useEffect, useRef } from 'react'

// Run `callback(time)` on every animation frame while `active`. The latest
// callback is always used without restarting the loop.
export function useAnimationFrame(callback, active = true) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!active) return
    let raf
    const loop = (time) => {
      cbRef.current(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
