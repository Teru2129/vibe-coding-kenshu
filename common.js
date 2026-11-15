// 共通の小道具：キーワード判定、裏側ログ、トースト

export function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// AIを使わない「キーワード判定」。AI判定と見比べるための仮の判定です
export function keywordJudge(text, rating) {
  const t = text;
  const topics = [
    ["時間・準備", /時間|準備|締め切り|間に合|バタバタ|期間|忙し/],
    ["AI活用", /AI|ＡＩ|生成|チャット|分析|集計/],
    ["発表", /発表|プレゼン|緊張|質問|本番/],
    ["地域の人", /地域|住民|町の|現地|大人|輪島|企業/],
    ["チーム", /チーム|仲間|役割|分担|意見/],
    ["学び", /学び|学ん|気づ|成長|興味|社会/],
  ];
  const topic = (topics.find(([, re]) => re.test(t)) || ["その他"])[0];
  const neg = /足りな|大変|難し|不安|疲れ|偏|バタバタ|言えな|うまくいかな|残念|つらい|分からな/.test(t);
  const pos = /楽し|うれし|嬉し|よかった|良かった|自信|達成感|最高|おもしろ|面白|効果的|成長|すごい/.test(t);
  const sentiment = rating >= 4 && !neg ? "良い" : rating <= 2 || (neg && !pos) ? "悪い" : pos && !neg ? "良い" : "どちらでも";
  return { sentiment, topic };
}

// fetch をのぞき見して「裏側を見る」パネルに出す
const log = [];
function render() {
  const el = document.getElementById("peekLog"); if (!el) return;
  el.innerHTML = log.map(e => `<div class="ent"><span class="k">${esc(e.method)}</span> ${esc(e.url)} → <b>${e.status}</b> (${e.ms}ms)
  ${e.body ? `<pre>送ったもの：${esc(e.body)}</pre>` : ""}<pre>返ってきたもの：${esc(e.res)}</pre></div>`).join("");
}
export const peek = {
  async fetch(input, init = {}) {
    const url = typeof input === "string" ? input : input.url;
    const t0 = performance.now();
    const res = await fetch(input, init);
    try {
      const txt = await res.clone().text();
      const u = new URL(url);
      log.unshift({ method: init.method || "GET", url: u.pathname + (u.search.length > 120 ? u.search.slice(0, 120) + "…" : u.search),
        status: res.status, ms: Math.round(performance.now() - t0),
        body: typeof init.body === "string" ? init.body.slice(0, 400) : "", res: txt.slice(0, 500) + (txt.length > 500 ? "…" : "") });
      log.length = Math.min(log.length, 20); render();
    } catch { /* ignore */ }
    return res;
  },
};

export function toast(m) { const t = document.getElementById("toast"); if (!t) return; t.textContent = m; t.style.display = "block"; clearTimeout(t._h); t._h = setTimeout(() => t.style.display = "none", 1800); }
