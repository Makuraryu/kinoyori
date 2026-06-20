# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

There is no test runner, linter, or type checker configured. The build (`npm run build`) is the only automated correctness gate — run it after changes.

## Origin

This is a React/Vite re-implementation of a pixel-art weather UI that originally lived as a single Claude Design `DCLogic` component (`kinoyori.dc.html`). The proprietary framework was dropped and all of its logic was ported into the modular structure below. When matching the original visual behavior, the design's drawing/styling math is the reference.

## Architecture

The whole UI is a pure function of one **model object** plus a derived **theme**. Data and presentation are decoupled into four layers: `api/` → `lib/` (pure logic) → `hooks/` (orchestration + canvas plumbing) → `components/` (effects + UI).

### The data spine: `model` and `theme`

- `hooks/useWeather.js` is the brain: it runs **geolocate → reverse geocode → fetch forecast → build model**, and exposes `{ status, model, location, selectPlace }`. On geolocation denial it falls back to Tokyo so the screen is never empty. A `reqId` ref guards against stale async responses (also covers StrictMode double-invocation).
- `lib/weatherModel.js#buildModel(forecast)` turns a raw Open-Meteo response into the model. **Comparison basis: "now" vs. the same clock hour 24h ago** (`past_days=1` hourly data). The model carries both the raw intensities (`t`, `cold`, `muggy`, `rain`) and the display values (`tTemp`, `dewLine`, `detailRows`, …). Everything downstream reads from this — change the readout/phrases here.
- `lib/theme.js#computeTheme(model)` is the **single source of styling truth**. From `model.t/cold/muggy/rain` it derives `baseHue` (warm `30` when hotter than yesterday, cold `250` when cooler) and produces: the root CSS custom properties (`--txt`, `--fogBlur`, `--titleBar`, …), the keycap/tray/sheet style builders, and the pixel-corner clip paths. Components and effects consume the CSS vars (`var(--txt)`) rather than recomputing color.

So: **edit `weatherModel.js` to change what is shown; edit `theme.js` to change how it looks.** The whole screen shifts warm/cold together because both effects and chrome read the same intensities/hue.

### Canvas effects pattern

`components/effects/` holds the layered visuals. The shared plumbing is two hooks:

- `hooks/usePixelCanvas.js` sizes a `<canvas>` backing store to its CSS box ÷ `pixelScale` (so `image-rendering: pixelated` upscales each logical pixel into a chunky block) and calls `onResize(ctx, W, H)` whenever the size **or any value in its `deps` array** changes — this is where each effect (re)initializes. Pass `[model.rain, model.cold]` etc. as deps so the effect rebuilds when the weather changes.
- `hooks/useAnimationFrame.js` drives a rAF loop for animated layers.

Two flavors:
- **Static** (e.g. `Droplets`): draw once in `onResize`, no rAF.
- **Animated** (e.g. `CityScape`, `PrecipLayer`, `WindowGlass`): init in `onResize`, store generated geometry in a ref, redraw each frame from `useAnimationFrame`, reading current size from the hook's `sizeRef`.

`CityScape` is the most involved port (seeded skyline via `lib/rng.js` `mulberry32`, palette from temp/rain, viaduct + moving tram). `WindowGlass` adds mouse-parallax by lerping a mouse offset each frame; `useMouseParallax.js` applies the same center-distance parallax to the text content layer by mutating `transform` directly (no re-render).

### Geocoding (search vs. naming)

Weather is **strictly Open-Meteo**. Place naming is not, because Open-Meteo can't do it:
- `api/geocode.js#searchPlaces(q)` routes the city-search box: **non-ASCII (kanji/kana) → OSM Nominatim**, **ASCII/romaji → Open-Meteo geocoding** (Open-Meteo only matches romanized names; its `language` param just localizes labels).
- `api/reverseGeocode.js` uses **BigDataCloud** (no key) to turn GPS coordinates into a Japanese place name.

### UI composition

`App.jsx` composes the layers over the themed root and owns the single sheet state (`'about' | 'detail' | 'search' | null`). It keeps rendering the **previous** model during a refetch (the `hasModel` gate) so switching cities doesn't flash the loading card. Sheets reuse `BottomSheet` → `PixelWindow`; the chunky pixel borders come from `theme.pixelClip(a, b)`. `pixelScale` is a constant in `App.jsx`.

### Styling conventions

- All component styling is inline style objects; cross-cutting values flow through CSS custom properties set on the root by `theme.js`. Colors are authored in **oklch** (alpha via `oklch(L C H / a)`).
- Global resets and the cloud/sun keyframes live in `src/index.css`; fonts are DotGothic16 (Google Fonts, in `index.html`) and the bundled `public/fonts/misaki_mincho.ttf` (`@font-face` in `index.css`).
