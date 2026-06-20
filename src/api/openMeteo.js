// Open-Meteo: weather forecast + forward geocoding (city search).
// Docs: https://open-meteo.com/en/docs , https://open-meteo.com/en/docs/geocoding-api

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.reason || 'Open-Meteo error')
  return json
}

/**
 * Fetch the forecast needed to compare now vs. the same hour yesterday.
 * `past_days=1` gives us yesterday's hourly temperature & dew point.
 */
export async function fetchForecast({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,weather_code,is_day',
    hourly: 'temperature_2m,dew_point_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    past_days: '1',
    forecast_days: '1',
    timezone: 'auto',
  })
  return getJson(`${FORECAST_URL}?${params}`)
}

/**
 * Forward geocoding for the search box. Returns a normalized list of places.
 */
export async function geocodeSearch(name, { count = 8 } = {}) {
  const query = name.trim()
  if (!query) return []
  const params = new URLSearchParams({
    name: query,
    count: String(count),
    language: 'ja',
    format: 'json',
  })
  const json = await getJson(`${GEOCODE_URL}?${params}`)
  return (json.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    lat: r.latitude,
    lon: r.longitude,
    admin: [r.admin1, r.country].filter(Boolean).join(' ・ '),
    country: r.country,
  }))
}
