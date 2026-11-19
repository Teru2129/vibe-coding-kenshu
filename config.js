// ここだけ書き換えれば、自分のSupabaseにつながります。
// Supabase の「Connect」でコピーした2行を、下の ` と ` の間に貼り付けてください（いまの2行は消して上書き）。
// publishable key（公開キー）はブラウザに置いてよいキーです。データはRLSで守ります。
// secret key（秘密キー）は、絶対にここに書かないでください。
const VC_ENV = `
NEXT_PUBLIC_SUPABASE_URL=https://jlcvrwamtsjzdvpnczii.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_4qOIxoIVb2NTaGTdWt2DpQ_iqdmzq62
`;

// ↓ ここから下は触らなくて大丈夫です
const vcPick = (re) => (VC_ENV.match(re) || [])[1] || "";
window.VC_CONFIG = {
  SUPABASE_URL: vcPick(/(https:\/\/[a-z0-9]+\.supabase\.co)/i),
  SUPABASE_PUBLISHABLE_KEY: vcPick(/(sb_publishable_[A-Za-z0-9_\-]+)/) || vcPick(/ANON_KEY=\s*([A-Za-z0-9_.\-]+)/),
  // 自分のコピーを作るときに使う元のリポジトリ
  REPO_URL: "https://github.com/Teru2129/vibe-coding-kenshu",
  // AI判定・分析（Edge Function）。研修用の共有データベース以外では自動でOFFになります
  USE_AI_FUNCTIONS: true,
};
