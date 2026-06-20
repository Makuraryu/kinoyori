import { geocodeSearch } from './openMeteo.js'

// Unified place search.
//
// Open-Meteo's geocoding only *matches* romanized/native ASCII names — its
// `language` option just localizes the response labels, so a kanji/kana query
// (大阪, おおさか) returns nothing. For non-ASCII queries we fall back to OSM
// Nominatim, which matches Japanese place names directly. ASCII queries keep
// using Open-Meteo.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Any non-ASCII character (kanji, kana, full-width, accented Latin) -> Nominatim.
const isNonAscii = (s) => /[^\x00-\x7f]/.test(s)

async function nominatimSearch(query, { count = 8 } = {}) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: String(count),
    'accept-language': 'ja',
    addressdetails: '1',
  })
  const res = await fetch(`${NOMINATIM_URL}?${params}`)
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)
  const list = await res.json()
  return (Array.isArray(list) ? list : []).map((r) => {
    const addr = r.address ?? {}
    const region = addr.state || addr.province || addr.region || ''
    return {
      id: `osm-${r.place_id}`,
      name: r.name || r.display_name.split(',')[0].trim(),
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      admin: [region, addr.country].filter(Boolean).join(' ・ '),
      country: addr.country,
    }
  })
}

export async function searchPlaces(query) {
  const q = query.trim()
  if (!q) return []
  return isNonAscii(q) ? nominatimSearch(q) : geocodeSearch(q)
}
