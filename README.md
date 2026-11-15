# バイブコーディング研修 練習サイト

青楓館高等学院のバイブコーディング研修（教員向け）で使う練習サイトです。
弟子屈町の観光口コミを題材に「作って、貯めて、分析する」を体験します。
弟子屈町の公式サイトではありません。データはすべて練習用のダミーです。

## 中身
- `index.html` / `app.js`：① つくる ② 貯める ③ 分析する ④ 持ち帰る
- `lp.html`：見本の観光LP（天気はキー不要の Open-Meteo API）
- `config.js`：つなぐSupabaseの URL と publishable key（公開キー）
- `setup.sql`：自分のSupabaseに口コミテーブルとRLSを作るSQL

## 自分のコピーを作る
1. このリポジトリの **Use this template** で自分のGitHubにコピー
2. Vercel で **Add New → Project** → コピーしたリポジトリを Import → Deploy
3. 自分のSupabaseで `setup.sql` を実行し、`config.js` を自分の URL と publishable key に書き換える

`config.js` に secret key（秘密キー）は絶対に書かないでください。
