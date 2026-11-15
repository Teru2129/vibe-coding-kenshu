// 共通の小道具：キーワード判定、裏側ログ、トースト

export function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// AIを使わない「キーワード判定」。AI判定と見比べるための仮の判定です
export function keywordJudge(text, rating) {
  const t = text;
  const topics = [
    ["交通", /バス|電車|駅|車|道|渋滞|アクセス|移動|駐車|タクシー|本数/],
    ["食事", /食|ご飯|ごはん|ランチ|料理|美味|おいし|まず|ラーメン|カフェ|店/],
    ["宿泊", /宿|ホテル|旅館|部屋|泊/],
    ["温泉", /温泉|湯|露天/],
    ["景色", /景色|眺め|絶景|湖|霧|青|紅葉|星|雪|山|写真/],
  ];
  const topic = (topics.find(([, re]) => re.test(t)) || ["その他"])[0];
  const neg = /残念|不便|少な|高い|寒すぎ|混|汚|悪|最悪|がっかり|大変|遠い|ない|不満/.test(t);
  const pos = /最高|感動|きれい|綺麗|美し|良か|よか|おすすめ|楽し|満足|美味|おいし|また来/.test(t);
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
