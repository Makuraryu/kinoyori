// Phrase tables + tier logic for the "today vs. yesterday" readout. Single
// source for the copy: classify a raw (decimal) delta into a signed tier
// (-3..3), then pick one phrase at random from that tier's list.

// Ascending |delta| cut points → tier magnitude 0..3.
const TEMP_BANDS = [2, 4, 7] // a<2→0, a<4→1, a<7→2, else 3
const DEW_BANDS = [1.5, 3, 5] // a<1.5→0, a<3→1, a<5→2, else 3
const WARM_TEMP_THRESHOLD = 20 // today's temp ≥ this → muggy phrasing, else dry/cold

// Signed tier in [-3, 3]; 0 carries no sign.
function classifyTier(delta, bands) {
  const a = Math.abs(delta)
  let mag = 0
  for (const cut of bands) {
    if (a < cut) break
    mag++
  }
  return delta < 0 ? -mag : mag
}

function pickPhrase(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const TEMP_PHRASES = {
  '3': ['グッと暑い', '一気に暑くなった'],
  '2': ['かなり暑い', 'だいぶ暑い'],
  '1': ['ちょっと暑い', '少しだけ暑め'],
  '0': ['ほぼ変わらず', 'だいたい同じくらい', '大して変わらない'],
  '-1': ['ちょっと涼しい', '少しだけひんやり'],
  '-2': ['かなり涼しい', 'だいぶ寒め'],
  '-3': ['グッと寒い', '一気に冷え込んだ'],
}

const DEW_PHRASES_WARM = {
  '3': ['湿気が一気に増して、かなり蒸し暑い', 'じめじめ感が格段に強い'],
  '2': ['だいぶ蒸し暑い', '湿度が上がってじめじめする'],
  '1': ['少し蒸す', 'やや湿っぽい'],
  '0': ['蒸し暑さはほぼ変わらない', '快適さは昨日と同じくらい'],
  '-1': ['少しさっぱりしている', 'やや乾いてきた'],
  '-2': ['だいぶ過ごしやすい', 'かなりさっぱりしている'],
  '-3': ['湿気が大きく和らいで、からっとしている', '格段に爽やか'],
}

const DEW_PHRASES_COLD = {
  '3': ['湿気が一気に増して、じめじめと底冷えする', '肌にまとわりつく寒さ'],
  '2': ['湿っぽくて、いっそう肌寒い', 'じめじめする'],
  '1': ['少し湿っぽい', 'やや空気が重い'],
  '0': ['湿り具合は昨日とほぼ変わらない'],
  '-1': ['少し空気が乾いてきた', 'ややカラッとしている'],
  '-2': ['だいぶ乾燥してきた', '空気がカラッと冷たい'],
  '-3': ['湿気が大きく抜けて、すっかり乾燥している', 'カラッと冷え込む'],
}

// Temperature phrase: how today compares to yesterday.
export function pickTempPhrase(rawTempDelta) {
  return pickPhrase(TEMP_PHRASES[classifyTier(rawTempDelta, TEMP_BANDS)])
}

// Dew-point phrase: warm-day (muggy) vs. cold-day (clammy/dry) wording is
// selected by today's actual temperature.
export function pickDewPhrase(rawDewDelta, todayTemp) {
  const table = todayTemp >= WARM_TEMP_THRESHOLD ? DEW_PHRASES_WARM : DEW_PHRASES_COLD
  return pickPhrase(table[classifyTier(rawDewDelta, DEW_BANDS)])
}
