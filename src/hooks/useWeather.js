import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchForecast } from '../api/openMeteo.js'
import { reverseGeocode } from '../api/reverseGeocode.js'
import { buildModel } from '../lib/weatherModel.js'
import { useGeolocation } from './useGeolocation.js'

// Fallback when geolocation is denied/unavailable, so the screen is never empty.
const FALLBACK = { name: '東京都', admin: '日本', lat: 35.6895, lon: 139.6917, source: 'fallback' }

/**
 * App brain: locate -> reverse geocode -> fetch -> build model. Exposes the
 * current location + model + status, and setLocation() for city search.
 * status: 'locating' | 'loading' | 'ready' | 'error'.
 */
export function useWeather() {
  const geo = useGeolocation()
  const [location, setLocation] = useState(null)
  const [model, setModel] = useState(null)
  const [status, setStatus] = useState('locating')
  const [error, setError] = useState(null)
  const reqId = useRef(0)

  const load = useCallback(async (loc) => {
    const id = ++reqId.current
    setLocation(loc)
    setStatus('loading')
    setError(null)
    try {
      const forecast = await fetchForecast(loc)
      if (id !== reqId.current) return
      const m = buildModel(forecast)
      if (!m) throw new Error('比較できるデータがありません')
      setModel(m)
      setStatus('ready')
    } catch (e) {
      if (id !== reqId.current) return
      setError(e.message || 'エラーが発生しました')
      setStatus('error')
    }
  }, [])

  // React to the geolocation result exactly once it resolves.
  useEffect(() => {
    if (geo.status === 'locating') return
    let cancelled = false
    if (geo.status === 'ready' && geo.coords) {
      ;(async () => {
        const rev = await reverseGeocode(geo.coords)
        if (cancelled) return
        load({
          name: rev?.name ?? `緯度 ${geo.coords.lat.toFixed(2)} / 経度 ${geo.coords.lon.toFixed(2)}`,
          admin: rev?.admin ?? '現在地',
          lat: geo.coords.lat,
          lon: geo.coords.lon,
          source: 'geo',
        })
      })()
    } else {
      load(FALLBACK)
    }
    return () => {
      cancelled = true
    }
  }, [geo.status, geo.coords, load])

  const selectPlace = useCallback(
    (place) => {
      load({
        name: place.name,
        admin: place.admin,
        lat: place.lat,
        lon: place.lon,
        source: 'search',
      })
    },
    [load],
  )

  return { status, model, location, error, selectPlace }
}
