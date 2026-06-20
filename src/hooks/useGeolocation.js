import { useEffect, useState } from 'react'

/**
 * Browser geolocation, requested once on mount.
 * status: 'locating' | 'ready' | 'error'; error: 'unsupported'|'denied'|'unavailable'.
 */
export function useGeolocation() {
  const [state, setState] = useState({ status: 'locating', coords: null, error: null })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', coords: null, error: 'unsupported' })
      return
    }
    let done = false
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (done) return
        done = true
        setState({
          status: 'ready',
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          error: null,
        })
      },
      (err) => {
        if (done) return
        done = true
        setState({
          status: 'error',
          coords: null,
          error: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
        })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
    return () => {
      done = true
    }
  }, [])

  return state
}
