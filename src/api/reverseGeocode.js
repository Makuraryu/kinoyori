// Reverse geocoding: GPS coordinates -> Japanese place name.
// Open-Meteo has no reverse geocoding, so we use BigDataCloud's free, no-key
// client endpoint (localityLanguage=ja). Used only to name the detected
// location; all weather data still comes from Open-Meteo.

const URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

/**
 * Returns { name, admin } for the given coordinates, or null on failure.
 * `name` prefers the most specific locality; `admin` is the broader region.
 */
export async function reverseGeocode({ lat, lon }) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      localityLanguage: 'ja',
    })
    const res = await fetch(`${URL}?${params}`)
    if (!res.ok) return null
    const d = await res.json()
    const region = d.principalSubdivision || ''
    const locality = d.locality || d.city || ''
    const name = [region, locality].filter(Boolean).join(' ') || d.countryName || null
    if (!name) return null
    return { name, admin: d.countryName || region }
  } catch {
    return null
  }
}
