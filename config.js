// ここだけ書き換えれば、自分のSupabaseにつながります。
// publishable key（公開キー）はブラウザに置いてよいキーです。データはRLSで守ります。
// secret key（秘密キー）は、絶対にここに書かないでください。
window.VC_CONFIG = {
  SUPABASE_URL: "https://jlcvrwamtsjzdvpnczii.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_4qOIxoIVb2NTaGTdWt2DpQ_iqdmzq62",
  // 自分のコピーを作るときに使う元のリポジトリ
  REPO_URL: "https://github.com/Teru2129/vibe-coding-kenshu",
  // AI判定・分析（Edge Function）を使うか。研修用の共有データベース以外では自動でOFFになります（書き換え不要）
  USE_AI_FUNCTIONS: true,
};
