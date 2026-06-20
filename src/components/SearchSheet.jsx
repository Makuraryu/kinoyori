import { useEffect, useRef, useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import { searchPlaces } from '../api/geocode.js'

// City search: debounced forward geocoding via Open-Meteo, with a result list.
// Selecting a place hands it back to App, which refetches the forecast.

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(16px,3.4vw,20px)',
  padding: '12px 14px',
  color: 'var(--txt)',
  background: '#ffffff',
  border: '2px solid var(--btnEdge)',
  outline: 'none',
  letterSpacing: '.04em',
}
const hintStyle = {
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(13px,2.6vw,16px)',
  color: 'var(--txtDim)',
  letterSpacing: '.04em',
  padding: '14px 4px 2px',
}
const rowStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '11px 8px',
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(15px,3vw,19px)',
  color: 'var(--txt)',
  background: 'transparent',
  border: 'none',
  borderTop: '1px dashed var(--btnEdge)',
  cursor: 'pointer',
  letterSpacing: '.03em',
}

export default function SearchSheet({ open, theme, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const inputRef = useRef(null)
  const reqId = useRef(0)

  // Focus the field when the sheet opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 360)
      return () => clearTimeout(t)
    }
  }, [open])

  // Debounced search.
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setStatus('idle')
      return
    }
    setStatus('loading')
    const id = ++reqId.current
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(q)
        if (id !== reqId.current) return
        setResults(places)
        setStatus('done')
      } catch {
        if (id !== reqId.current) return
        setStatus('error')
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handlePick = (place) => {
    onSelect(place)
    setQuery('')
    setResults([])
    setStatus('idle')
  }

  return (
    <BottomSheet open={open} title="ばしょをさがす" theme={theme}>
      <div style={{ padding: 'clamp(18px,4vw,30px)' }}>
        <input
          ref={inputRef}
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="都市名（例：大阪、Sapporo）"
          aria-label="都市名"
        />
        {status === 'loading' && <div style={hintStyle}>さがしています…</div>}
        {status === 'error' && <div style={hintStyle}>けんさくに しっぱいしました</div>}
        {status === 'done' && results.length === 0 && (
          <div style={hintStyle}>みつかりませんでした</div>
        )}
        <div style={{ marginTop: '10px' }}>
          {results.map((place) => (
            <button key={place.id} style={rowStyle} onClick={() => handlePick(place)}>
              {place.name}
              {place.admin && (
                <span style={{ color: 'var(--txtDim)', fontSize: '.8em', marginLeft: '8px' }}>
                  {place.admin}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
