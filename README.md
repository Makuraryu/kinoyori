# kinoyori ・ ピクセル天気

きのうと きょうの **気温・露点の差**から、今日が「昨日より」暑いか／寒いか、
蒸すか／さわやかかを ひとことで伝える、ピクセル風の天気アプリ。

- **データ**: [Open-Meteo](https://open-meteo.com/)（天気予報 + 都市検索）
- **位置情報**: ブラウザの Geolocation で *先に現在地を取得*、その後 都市検索も可能
- **逆ジオコーディング**: [BigDataCloud](https://www.bigdatacloud.com/)（GPS → 日本語地名のみに使用）
- 比較基準: **現在 vs 昨日の同時刻**（`past_days=1` の hourly データ）

## 開発

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルドのプレビュー
```

## 設計（モジュール構成）

```
src/
  api/        openMeteo.js (予報 + 検索) / reverseGeocode.js (BigDataCloud)
  lib/        weatherModel.js (純粋なドメインモデル) / theme.js (配色の単一の真実)
              weatherCodes.js (WMOコード) / rng.js
  hooks/      useWeather (司令塔) / useGeolocation / usePixelCanvas / useAnimationFrame
  components/
    effects/  SkyLayer / CityScape / PrecipLayer / Droplets / WindowGlass / FogVignette
    PixelWindow / BottomSheet / Keycap / KeycapTray
    LocationHeader / MainReadout / AboutSheet / DetailSheet / SearchSheet
  App.jsx     全レイヤーを合成、シート状態を管理
```

データ層・ドメインロジック・描画エフェクト・UI を分離。`theme.js` が配色の単一の
真実で、気温差・蒸し具合に応じて画面全体が暖色／寒色へ変化する。各キャンバス
エフェクトは `usePixelCanvas` を共有し、シートは `BottomSheet` / `PixelWindow`
を再利用する。
