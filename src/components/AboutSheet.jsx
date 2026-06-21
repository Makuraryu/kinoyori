import BottomSheet from './BottomSheet.jsx'

// Static "about" content. Copy ported verbatim from the design.

const para = {
  margin: '0 0 20px',
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(16px,3.4vw,22px)',
  lineHeight: 1.9,
  color: 'var(--txtDim)',
  letterSpacing: '.03em',
}

const noteHeading = {
  fontFamily: "'Misaki Mincho','DotGothic16',monospace",
  fontSize: 'clamp(14px,2.8vw,17px)',
  color: 'var(--txt)',
  letterSpacing: '.06em',
  marginTop: '4px',
  marginBottom: '8px',
}
const note = {
  margin: '0 0 18px',
  fontFamily: "'DotGothic16',monospace",
  fontSize: 'clamp(14px,3vw,18px)',
  lineHeight: 1.8,
  color: 'var(--txtDim)',
  letterSpacing: '.03em',
}

export default function AboutSheet({ open, theme }) {
  const link = { color: theme.link, textDecoration: 'none' }
  return (
    <BottomSheet open={open} title="アバウト" theme={theme}>
      <div style={{ padding: 'clamp(24px,5vw,40px)' }}>
        <div
          style={{
            fontSize: 'clamp(26px,5.5vw,40px)',
            letterSpacing: '.04em',
            color: 'var(--txt)',
            marginBottom: '22px',
          }}
        >
          kinoyori とは
        </div>
        <p style={para}>
          きのうと きょうの 気温・露点の差から、今日が「昨日より」暑いか 寒いか、蒸すか
          さわやかかを ひとことで おしえる お天気アプリです。
        </p>
        <p style={para}>
          背景のアニメーション＝天気、色あい＝暑さ・寒さ、画面のくもりと水滴＝蒸し具合。窓ガラスごしに
          今日の空気を 感じてください。
        </p>

        <div style={noteHeading}>クレジット・フォント・データ</div>
        <p style={note}>
          本文は{' '}
          <a href="https://fonts.google.com/specimen/DotGothic16" target="_blank" rel="noreferrer" style={link}>
            DotGothic16
          </a>
          （Google Fonts）、見出しは{' '}
          <a href="https://littlelimit.net/misaki.htm" target="_blank" rel="noreferrer" style={link}>
            美咲フォント
          </a>
          。
        </p>

        <p style={note}>
          天気は{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" style={link}>
            Open-Meteo
          </a>
          、都市検索は{' '}
          <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer" style={link}>
            Nominatim（OpenStreetMap）
          </a>
          、現在地の地名は{' '}
          <a href="https://www.bigdatacloud.com/" target="_blank" rel="noreferrer" style={link}>
            BigDataCloud
          </a>
          。
        </p>
      </div>
    </BottomSheet>
  )
}
