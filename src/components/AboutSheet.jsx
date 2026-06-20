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

export default function AboutSheet({ open, theme }) {
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
      </div>
    </BottomSheet>
  )
}
