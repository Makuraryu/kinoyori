// WMO weather interpretation codes -> { isRain, label }.
// The design only distinguishes 晴れ / 雨 visually (rain canvas on/off), but we
// keep a richer Japanese label for the detail table. `isRain` is true for any
// precipitation (drizzle, rain, snow, showers, thunderstorm) so the rain layer
// renders; cold/snow accents are driven separately by the temperature delta.
const TABLE = {
  0: { label: '快晴', isRain: false },
  1: { label: '晴れ', isRain: false },
  2: { label: '晴れときどき曇り', isRain: false },
  3: { label: '曇り', isRain: false },
  45: { label: '霧', isRain: false },
  48: { label: '霧氷', isRain: false },
  51: { label: '霧雨（弱）', isRain: true },
  53: { label: '霧雨', isRain: true },
  55: { label: '霧雨（強）', isRain: true },
  56: { label: '着氷性霧雨', isRain: true },
  57: { label: '着氷性霧雨（強）', isRain: true },
  61: { label: '小雨', isRain: true },
  63: { label: '雨', isRain: true },
  65: { label: '大雨', isRain: true },
  66: { label: '着氷性の雨', isRain: true },
  67: { label: '着氷性の雨（強）', isRain: true },
  71: { label: '小雪', isRain: true },
  73: { label: '雪', isRain: true },
  75: { label: '大雪', isRain: true },
  77: { label: '霧雪', isRain: true },
  80: { label: 'にわか雨', isRain: true },
  81: { label: 'にわか雨（強）', isRain: true },
  82: { label: '激しいにわか雨', isRain: true },
  85: { label: 'にわか雪', isRain: true },
  86: { label: 'にわか雪（強）', isRain: true },
  95: { label: '雷雨', isRain: true },
  96: { label: '雷雨（ひょう）', isRain: true },
  99: { label: '激しい雷雨', isRain: true },
}

export function describeWeather(code) {
  return TABLE[code] ?? { label: '—', isRain: false }
}
