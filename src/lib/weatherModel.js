import { describeWeather } from './weatherCodes.js'

// Japanese weekday from a calendar date (tz-independent for the date portion).
function weekdayChar(year, month, day) {
  return '日月火水木金土'[new Date(year, month - 1, day).getDay()]
}

// Parse Open-Meteo local ISO ("2026-06-21T14:00") into a display date string.
function formatDate(iso) {
  const [datePart] = iso.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  return `${m}月${d}日(${weekdayChar(y, m, d)})`
}

// Temperature phrase: how today compares to yesterday (ported from the design).
function tempPhrase(d) {
  const a = Math.abs(d)
  if (a < 1) return '昨日とほぼ同じ'
  const hot = d > 0
  if (a < 3) return hot ? '少し暑い' : '少し涼しい'
  if (a < 5) return hot ? 'かなり暑い' : 'かなり寒い'
  return hot ? '猛烈に暑い' : '猛烈に寒い'
}

// Mugginess phrase, driven by the dew-point delta (ported from the design).
function dewPhrase(d) {
  const a = Math.abs(d)
  if (a < 1) return '昨日とほぼ同じ'
  const muggy = d > 0
  if (a < 3) return muggy ? '少し蒸す' : 'さわやか'
  if (a < 5) return muggy ? 'かなり蒸す' : 'かなりさわやか'
  return muggy ? '猛烈に蒸す' : 'とてもさわやか'
}

const signed = (v) => (v > 0 ? '＋' : v < 0 ? '−' : '±') + Math.abs(v)

// Locate the hourly index matching the "current" timestamp, falling back to the
// last past_days entry that is not in the future.
function currentHourIndex(hourly, currentTime) {
  const exact = hourly.time.indexOf(currentTime)
  if (exact !== -1) return exact
  const target = currentTime.slice(0, 13) // up to the hour
  const byHour = hourly.time.findIndex((t) => t.slice(0, 13) === target)
  if (byHour !== -1) return byHour
  return -1
}

/**
 * Turn a raw Open-Meteo forecast response into the pure domain model the UI and
 * theme read from. Compares *now* against the same clock hour 24h ago.
 * Returns null if the data is insufficient to compute a comparison.
 */
export function buildModel(forecast) {
  const { current, hourly } = forecast
  if (!current || !hourly?.time?.length) return null

  const idx = currentHourIndex(hourly, current.time)
  const prevIdx = idx - 24
  if (idx < 0 || prevIdx < 0) return null

  const todayTempRaw = current.temperature_2m ?? hourly.temperature_2m[idx]
  const todayDewRaw = hourly.dew_point_2m[idx]
  const yTempRaw = hourly.temperature_2m[prevIdx]
  const yDewRaw = hourly.dew_point_2m[prevIdx]
  if ([todayTempRaw, todayDewRaw, yTempRaw, yDewRaw].some((v) => v == null)) return null

  // Round for display, then derive deltas from the displayed integers so the
  // shown numbers and the "（＋N°C）" annotations stay internally consistent.
  const tTemp = Math.round(todayTempRaw)
  const yTemp = Math.round(yTempRaw)
  const tDew = Math.round(todayDewRaw)
  const yDew = Math.round(yDewRaw)
  const tempDelta = tTemp - yTemp
  const dewDelta = tDew - yDew

  const weather = describeWeather(current.weather_code)
  const rain = weather.isRain

  // Effect / theme intensities — identical mapping to the design's params().
  const t = Math.max(-1, Math.min(1, tempDelta / 6))
  const cold = Math.max(0, -t)
  const muggy = Math.max(0, Math.min(1, dewDelta / 6))

  const tp = tempPhrase(tempDelta)
  const dw = dewPhrase(dewDelta)

  const detailRows = [
    { label: '天気', value: weather.label },
    { label: '気温', value: `${tTemp}°C` },
    { label: '昨日の気温', value: `${yTemp}°C （${signed(tempDelta)}°C）` },
    { label: '露点', value: `${tDew}°C` },
    { label: '昨日の露点', value: `${yDew}°C （${signed(dewDelta)}°C）` },
    { label: '温度の体感', value: tp },
    { label: '湿りの体感', value: dw },
  ]

  return {
    // raw deltas + intensities
    tempDelta,
    dewDelta,
    rain,
    isSunny: !rain,
    t,
    cold,
    muggy,
    // display values
    tTemp,
    yTemp,
    tDew,
    yDew,
    tempPhrase: tp,
    dewPhrase: dw,
    dewLine: '蒸し具合は' + dw,
    weatherLabel: weather.label,
    dateStr: formatDate(current.time),
    detailRows,
  }
}
