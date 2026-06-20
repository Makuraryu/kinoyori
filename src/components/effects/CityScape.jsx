import { useCallback, useRef } from 'react'
import { usePixelCanvas } from '../../hooks/usePixelCanvas.js'
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js'
import { mulberry32 } from '../../lib/rng.js'

// Pixel skyline in the bottom-right, with a viaduct + passing tram. Ported from
// the design's buildCity / drawCity / cityPalette / drawViaductAndTram.

function cityPalette(t, rain) {
  const hue = t >= 0 ? 30 : 248
  const c = 0.014 + 0.04 * Math.abs(t)
  const dk = rain ? 0.05 : 0
  const ok = (l, cc) => `oklch(${(l - dk).toFixed(3)} ${cc.toFixed(3)} ${hue})`
  const refHue = t >= 0 ? 82 : 240
  return {
    far: ok(0.85, c * 0.45),
    farSide: ok(0.81, c * 0.45),
    mid: ok(0.77, c * 0.65),
    midSide: ok(0.71, c * 0.65),
    near: ok(0.69, c * 0.85),
    nearSide: ok(0.62, c * 0.85),
    cap: ok(0.9, c * 0.35),
    win: ok(0.6, c * 0.55),
    tank: ok(0.64, c * 0.75),
    antenna: ok(0.66, c * 0.4),
    litWarm: rain ? 'oklch(0.87 0.095 80)' : 'oklch(0.89 0.1 86)',
    litCool: 'oklch(0.85 0.07 225)',
    beaconOn: 'oklch(0.75 0.17 28)',
    beaconOff: ok(0.62, c * 0.5),
    warm: t >= 0,
    reflectBands: [0.4, 0.3, 0.21, 0.13, 0.07].map((a) => `oklch(0.97 0.05 ${refHue} / ${a})`),
    snow: 'oklch(0.97 0.004 240)',
    snowShade: 'oklch(0.86 0.012 240)',
    wet: rain,
    wetStreak: 'oklch(0.95 0.015 235 / 0.16)',
    viaduct: ok(0.66, c * 0.4),
    viaductDark: ok(0.56, c * 0.4),
    tramBody: ok(0.95, c * 0.12),
    tramRoof: ok(0.86, c * 0.12),
    tramLine: t >= 0 ? 'oklch(0.72 0.16 38)' : 'oklch(0.7 0.12 232)',
    tramWin: 'oklch(0.3635 0.0397 175.6706)',
    tramHead: 'oklch(0.94 0.11 96)',
    tramTail: 'oklch(0.66 0.18 28)',
  }
}

function buildCity(W, H) {
  const rnd = mulberry32(0x51ed270b)
  const buildings = []
  let x = W + 6
  let guard = 0
  while (x > -24 && guard++ < 120) {
    const frac = Math.max(0, Math.min(1, x / W))
    let depth = frac > 0.62 ? 2 : frac > 0.32 ? 1 : 0
    if (rnd() < 0.28) depth = Math.max(0, depth - 1)
    const w =
      depth === 2
        ? 14 + Math.floor(rnd() * 13)
        : depth === 1
          ? 11 + Math.floor(rnd() * 10)
          : 8 + Math.floor(rnd() * 9)
    const maxH = (depth === 2 ? 0.78 : depth === 1 ? 0.58 : 0.4) * H
    const minH = (depth === 2 ? 0.4 : depth === 1 ? 0.27 : 0.16) * H
    const h = Math.round(minH + rnd() * (maxH - minH))
    const bx = Math.round(x - w)
    const top = H - h
    const windows = []
    const m = depth === 0 ? 2 : 3
    const ww = depth === 0 ? 1 : 2
    const wh = depth === 2 ? 3 : 2
    const gx = 2
    const gy = depth === 2 ? 3 : 2
    for (let yy = top + m + 1; yy + wh <= H - 2; yy += wh + gy) {
      for (let xx = bx + m; xx + ww <= bx + w - m; xx += ww + gx) {
        windows.push({
          x: xx,
          y: yy,
          w: ww,
          h: wh,
          lit: rnd() < 0.4,
          warm: rnd() < 0.8,
          flicker: rnd() < 0.12,
          phase: rnd() * 6.28,
        })
      }
    }
    buildings.push({
      x: bx,
      w,
      h,
      top,
      depth,
      windows,
      tank: depth >= 1 && rnd() < 0.45,
      antenna: depth >= 1 && rnd() < 0.5,
      beacon: rnd() < 0.65,
      step: depth === 2 && rnd() < 0.4,
      seed: Math.floor(rnd() * 1e9),
    })
    const gap = Math.floor(rnd() * 7) - 4
    x = bx - gap
  }
  buildings.sort((a, b) => a.depth - b.depth || a.x - b.x)

  // foreground tower at the far-left edge — drawn last, occludes everything
  const fgW = Math.round(Math.max(26, Math.min(40, W * 0.2)))
  const fgH = Math.round(H * 0.58)
  const fgX = -3
  const fgTop = H - fgH
  const fwins = []
  {
    const m = 4
    const ww = 2
    const wh = 3
    const gx = 3
    const gy = 4
    for (let yy = fgTop + m + 2; yy + wh <= H - 3; yy += wh + gy)
      for (let xx = fgX + m + 3; xx + ww <= fgX + fgW - m; xx += ww + gx)
        fwins.push({
          x: xx,
          y: yy,
          w: ww,
          h: wh,
          lit: rnd() < 0.45,
          warm: rnd() < 0.82,
          flicker: rnd() < 0.1,
          phase: rnd() * 6.28,
        })
  }
  const fg = {
    x: fgX,
    w: fgW,
    h: fgH,
    top: fgTop,
    depth: 2,
    windows: fwins,
    tank: true,
    antenna: true,
    beacon: true,
    step: true,
    seed: 12345,
  }

  return { buildings, W, H, fg }
}

function drawViaductAndTram(R, p, W, H, time, snow) {
  const trackY = Math.floor(H * 0.6)
  for (let x = W % 30; x < W; x += 30) R(x, trackY + 2, 2, H - trackY - 2, p.viaductDark)
  R(0, trackY, W, 2, p.viaduct)
  if (snow) R(0, trackY - 1, W, 1, p.snow)
  const carW = 11
  const carH = 6
  const gap = 1
  const cars = 4
  const trainLen = cars * (carW + gap)
  const cycle = 12000
  const span = W + trainLen + 80
  const front = W + 30 - ((time % cycle) / cycle) * span
  for (let i = 0; i < cars; i++) {
    const cx = Math.round(front + i * (carW + gap))
    const cy = trackY - carH
    if (cx > W + 4 || cx + carW < -4) continue
    R(cx, cy, carW, carH, p.tramBody)
    R(cx, cy, carW, 1, p.tramRoof)
    R(cx, cy + 2, carW, 1, p.tramLine)
    for (let wx = cx + 1; wx + 2 <= cx + carW - 1; wx += 3) R(wx, cy + 3, 2, 2, p.tramWin)
    if (i === 0) R(cx, cy + carH - 2, 1, 2, p.tramHead)
    if (i === cars - 1) R(cx + carW - 1, cy + 1, 1, 1, p.tramTail)
  }
}

function drawCity(ctx, city, p, time, cold) {
  ctx.imageSmoothingEnabled = false
  const { W, H, buildings } = city
  ctx.clearRect(0, 0, W, H)
  const R = (x, y, w, h, c) => {
    ctx.fillStyle = c
    ctx.fillRect(x | 0, y | 0, w | 0, h | 0)
  }
  const snow = cold > 0.02

  const drawB = (b) => {
    const body = b.depth === 2 ? p.near : b.depth === 1 ? p.mid : p.far
    const side = b.depth === 2 ? p.nearSide : b.depth === 1 ? p.midSide : p.farSide
    R(b.x, b.top, b.w, b.h, body)
    R(b.x + b.w - 2, b.top, 2, b.h, side)
    R(b.x, b.top, b.w, 1, p.cap)
    for (const wd of b.windows) {
      let on = wd.lit
      if (wd.flicker) on = Math.sin(time / 600 + wd.phase) > -0.2
      R(wd.x, wd.y, wd.w, wd.h, on ? (wd.warm ? p.litWarm : p.litCool) : p.win)
    }
    if (b.step) {
      const sw = Math.max(4, Math.floor(b.w * 0.5))
      const sx = b.x + Math.floor((b.w - sw) / 2)
      const sh = 5
      R(sx, b.top - sh, sw, sh, body)
      R(sx, b.top - sh, sw, 1, p.cap)
      R(sx + sw - 1, b.top - sh, 1, sh, side)
      if (snow) R(sx, b.top - sh - 1, sw, 2, p.snow)
    }
    if (b.tank && b.top > 8) {
      const tw = Math.min(8, Math.max(4, Math.floor(b.w * 0.38)))
      const tx = b.x + b.w - tw - 2
      const ty = b.top - 5
      R(tx, ty, tw, 4, p.tank)
      R(tx, ty - 1, tw, 1, p.cap)
      R(tx + 1, ty + 4, 1, 1, p.tank)
      R(tx + tw - 2, ty + 4, 1, 1, p.tank)
      if (snow) R(tx, ty - 2, tw, 2, p.snow)
    }
    if (b.antenna && b.top > 10) {
      const ax = b.x + Math.floor(b.w / 2)
      const ah = 5 + (b.seed % 7)
      R(ax, b.top - ah, 1, ah, p.antenna)
      if (b.beacon)
        R(ax, b.top - ah - 1, 1, 1, Math.floor(time / 520) % 2 === 0 ? p.beaconOn : p.beaconOff)
    }
    if (snow) {
      R(b.x, b.top - 1, b.w, 2, p.snow)
      R(b.x, b.top + 1, b.w, 1, p.snowShade)
    } else if (p.warm) {
      const bands = p.reflectBands
      const gw = Math.max(bands.length, Math.floor(b.w * 0.55))
      const step = Math.max(1, Math.round(gw / bands.length))
      for (let k = 0; k < bands.length; k++) {
        R(b.x + k * step, b.top + 1, step + 1, b.h - 1, bands[k])
      }
    }
    if (p.wet && !snow) {
      const rx = b.x + Math.floor(b.w * 0.34)
      R(rx, b.top + 2, 1, b.h - 3, p.wetStreak)
    }
  }

  const back = []
  const near = []
  for (const b of buildings) (b.depth === 2 ? near : back).push(b)
  for (const b of back) drawB(b)
  drawViaductAndTram(R, p, W, H, time, snow)
  for (const b of near) drawB(b)
  if (city.fg) drawB(city.fg)
}

export default function CityScape({ model, pixelScale }) {
  const cityRef = useRef(null)

  const onResize = useCallback(
    (ctx, W, H) => {
      cityRef.current = buildCity(W, H)
      drawCity(ctx, cityRef.current, cityPalette(model.t, model.rain), 0, model.cold)
    },
    [model.t, model.rain, model.cold],
  )

  const { ref, sizeRef } = usePixelCanvas(pixelScale, onResize, [model.t, model.rain, model.cold])

  useAnimationFrame((time) => {
    const cv = ref.current
    const city = cityRef.current
    if (!cv || !city) return
    const ctx = cv.getContext('2d')
    drawCity(ctx, city, cityPalette(model.t, model.rain), time, model.cold)
  })

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 1,
        width: 'min(64%,780px)',
        height: 'min(50%,470px)',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={ref}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated' }}
      />
    </div>
  )
}
