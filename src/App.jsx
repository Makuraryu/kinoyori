import { useMemo, useState } from 'react'
import { useWeather } from './hooks/useWeather.js'
import { useMouseParallax } from './hooks/useMouseParallax.js'
import { computeTheme } from './lib/theme.js'

import SkyLayer from './components/effects/SkyLayer.jsx'
import FogVignette from './components/effects/FogVignette.jsx'
import PrecipLayer from './components/effects/PrecipLayer.jsx'
import WindowGlass from './components/effects/WindowGlass.jsx'
import Droplets from './components/effects/Droplets.jsx'
import CityScape from './components/effects/CityScape.jsx'

import LocationHeader from './components/LocationHeader.jsx'
import MainReadout from './components/MainReadout.jsx'
import KeycapTray from './components/KeycapTray.jsx'
import Keycap from './components/Keycap.jsx'
import AboutSheet from './components/AboutSheet.jsx'
import DetailSheet from './components/DetailSheet.jsx'
import SearchSheet from './components/SearchSheet.jsx'
import PixelWindow from './components/PixelWindow.jsx'

const PIXEL_SCALE = 4
// Neutral model for the theme before any weather has loaded (calm warm sky).
const NEUTRAL = { t: 0, cold: 0, muggy: 0, rain: false }

const contentLayer = {
  position: 'relative',
  zIndex: 4,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: 'clamp(22px,4.5vw,56px)',
  paddingBottom: 'clamp(86px,12vw,104px)',
  color: 'var(--txt)',
}

function StatusCard({ status, error }) {
  const message =
    status === 'locating'
      ? '現在地を さがしています…'
      : status === 'error'
        ? (error ?? 'エラーが発生しました')
        : 'よみこみちゅう…'
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: 'min(420px, 90%)' }}>
        <PixelWindow title="kinoyori">
          <div
            style={{
              padding: 'clamp(24px,6vw,40px)',
              fontFamily: "'DotGothic16',monospace",
              fontSize: 'clamp(16px,3.4vw,20px)',
              color: 'var(--txtDim)',
              letterSpacing: '.04em',
              lineHeight: 1.8,
            }}
          >
            <div>{message}</div>
            {status === 'error' && (
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '18px',
                  fontFamily: "'DotGothic16',monospace",
                  fontSize: 'clamp(14px,3vw,18px)',
                  padding: '10px 16px',
                  color: 'var(--txt)',
                  background: 'var(--titleBar)',
                  border: '2px solid var(--btnEdge)',
                  cursor: 'pointer',
                }}
              >
                再読み込み
              </button>
            )}
          </div>
        </PixelWindow>
      </div>
    </div>
  )
}

export default function App() {
  const { status, model, location, error, selectPlace } = useWeather()
  const [sheet, setSheet] = useState(null)
  const parallaxRef = useMouseParallax({ strength: 3 })

  const hasModel = !!model
  const theme = useMemo(() => computeTheme(hasModel ? model : NEUTRAL), [hasModel, model])

  const toggle = (name) => setSheet((s) => (s === name ? null : name))
  const handleSelect = (place) => {
    selectPlace(place)
    setSheet(null)
  }

  return (
    <div style={theme.root}>
      {hasModel ? (
        <>
          <SkyLayer isSunny={model.isSunny} />
          <FogVignette />
          <PrecipLayer model={model} pixelScale={PIXEL_SCALE} />
          <WindowGlass pixelScale={PIXEL_SCALE} />
          <Droplets model={model} pixelScale={PIXEL_SCALE} />
          <CityScape model={model} pixelScale={PIXEL_SCALE} />

          <div ref={parallaxRef} style={contentLayer}>
            <LocationHeader
              location={location}
              dateStr={model.dateStr}
              onSearch={() => toggle('search')}
            />
            <MainReadout model={model} />
          </div>

          <div onClick={() => setSheet(null)} style={theme.scrim(sheet !== null)} />

          <KeycapTray theme={theme}>
            <Keycap label="アバウト" on={sheet === 'about'} onClick={() => toggle('about')} theme={theme} />
            <Keycap label="くわしく" on={sheet === 'detail'} onClick={() => toggle('detail')} theme={theme} />
            <Keycap label="さがす" on={sheet === 'search'} onClick={() => toggle('search')} theme={theme} />
          </KeycapTray>

          <AboutSheet open={sheet === 'about'} theme={theme} />
          <DetailSheet open={sheet === 'detail'} theme={theme} model={model} location={location} />
          <SearchSheet open={sheet === 'search'} theme={theme} onSelect={handleSelect} />
        </>
      ) : (
        <StatusCard status={status} error={error} />
      )}
    </div>
  )
}
