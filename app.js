import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { keywordJudge, peek, toast, esc } from "./common.js";

const C = window.VC_CONFIG;
// 研修用の共有データベース以外（＝自分のSupabase）では、AI関数（有料のAPI）を自動でOFFにする
const SHARED = "jlcvrwamtsjzdvpnczii";
C.USE_AI_FUNCTIONS = C.USE_AI_FUNCTIONS && C.SUPABASE_URL.includes(SHARED);
if (!C.USE_AI_FUNCTIONS) document.documentElement.classList.add("own-db");
const sb = createClient(C.SUPABASE_URL, C.SUPABASE_PUBLISHABLE_KEY, { global: { fetch: peek.fetch } });

// タブ
document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll("main section").forEach(s => s.classList.toggle("on", s.id === b.dataset.t));
  if (b.dataset.t === "analyze") loadStats();
  history.replaceState(null, "", "#" + b.dataset.t);
});
document.querySelectorAll("[data-go]").forEach(a => a.onclick = e => { e.preventDefault(); document.querySelector(`#tabs button[data-t="${a.dataset.go}"]`)?.click(); scrollTo(0,0); });
const h = location.hash.slice(1); if (h) document.querySelector(`#tabs button[data-t="${h}"]`)?.click();

// コピー
document.querySelectorAll("[data-copy]").forEach(b => b.onclick = async () => {
  await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).innerText); toast("コピーしました");
});

// ★
let rating = 4;
const stars = document.getElementById("f_stars");
for (let i = 1; i <= 5; i++) { const s = document.createElement("button"); s.textContent = "★"; s.onclick = () => { rating = i; paint(); }; stars.append(s); }
const paint = () => [...stars.children].forEach((s, i) => s.classList.toggle("on", i < rating)); paint();

// 投稿
document.getElementById("f_send").onclick = async () => {
  const body = document.getElementById("f_body").value.trim();
  if (!body) return toast("口コミを書いてください");
  const btn = document.getElementById("f_send"); btn.disabled = true;
  const msg = document.getElementById("f_msg"); msg.textContent = "保存しています…";
  const kj = keywordJudge(body, rating);
  const row = {
    author: document.getElementById("f_author").value.trim() || "名無し",
    project: document.getElementById("f_project").value, grade: document.getElementById("f_grade").value,
    campus: document.getElementById("f_campus").value, rating, body,
    sentiment: kj.sentiment, topic: kj.topic, judged_by: "keyword",
  };
  const { data, error } = await sb.from("vc_pbl").insert(row).select("id").single();
  if (error) { msg.textContent = "保存できませんでした：" + error.message; btn.disabled = false; return; }
  document.getElementById("f_body").value = "";
  const res = document.getElementById("f_result");
  res.innerHTML = `<p class="note">保存しました（キーワードで仮判定：${kj.sentiment}／${kj.topic}）。AIが判定しています…</p>`;
  msg.textContent = "";
  if (C.USE_AI_FUNCTIONS) {
    try {
      const r = await peek.fetch(`${C.SUPABASE_URL}/functions/v1/vc-classify`, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: C.SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ id: data.id }) });
      const j = await r.json();
      res.innerHTML = j.judged_by === "ai"
        ? `<p><span class="tag ai">AI判定</span><span class="tag ${j.sentiment === "良い" ? "good" : j.sentiment === "悪い" ? "bad" : ""}">${esc(j.sentiment)}</span><span class="tag">${esc(j.topic)}</span> ${esc(j.reason || "")}</p>`
        : `<p class="note">キーワード判定のまま保存しました（${esc(j.note || "")}）</p>`;
    } catch { res.innerHTML = `<p class="note">AI判定は使えませんでした。キーワード判定のまま保存しています。</p>`; }
  } else res.innerHTML = `<p class="note">キーワード判定で保存しました。</p>`;
  btn.disabled = false; loadList();
};

// 一覧
async function loadList() {
  const [{ count }, { data }] = await Promise.all([
    sb.from("vc_pbl").select("id", { count: "exact", head: true }),
    sb.from("vc_pbl").select("id,created_at,author,project,grade,campus,rating,body,sentiment,topic,judged_by,source").order("created_at", { ascending: false }).limit(60),
  ]);
  document.getElementById("cnt").textContent = count ?? "-";
  document.getElementById("list").innerHTML = (data || []).map(r => `
    <div class="rv"><div class="meta">${esc(r.author)}｜${esc(r.project)}｜${esc(r.grade)}｜${esc(r.campus)}｜${"★".repeat(r.rating)}${r.source === "dummy" ? '｜<span class="tag">ダミー</span>' : ""}</div>
    <div class="body">${esc(r.body)}</div>
    <div>${r.sentiment ? `<span class="tag ${r.sentiment === "良い" ? "good" : r.sentiment === "悪い" ? "bad" : ""}">${esc(r.sentiment)}</span>` : ""}${r.topic ? `<span class="tag">${esc(r.topic)}</span>` : ""}${r.judged_by === "ai" ? '<span class="tag ai">AI判定</span>' : r.judged_by === "keyword" ? '<span class="tag">キーワード判定</span>' : ""}</div></div>`).join("");
}
loadList(); setInterval(() => { if (document.getElementById("store").classList.contains("on")) loadList(); }, 5000);

// 集計
let allRows = [];
async function loadStats() {
  const { data } = await sb.from("vc_pbl").select("project,grade,campus,rating,sentiment,topic,body").limit(1000);
  allRows = data || [];
  const bar = (key, keys) => keys.map(k => {
    const rs = allRows.filter(r => r[key] === k), n = rs.length || 1;
    const g = rs.filter(r => r.sentiment === "良い").length, b = rs.filter(r => r.sentiment === "悪い").length, m = rs.length - g - b;
    return `<div class="b"><span>${k}</span><div class="track"><div class="fill" style="width:${g / n * 100}%"></div><div class="fill bad" style="width:${b / n * 100}%"></div><div class="fill mid" style="width:${m / n * 100}%"></div></div><span>${rs.length}件</span></div>`;
  }).join("");
  document.getElementById("byGrade").innerHTML = bar("grade", ["高1", "高2", "高3"]);
  document.getElementById("byTopic").innerHTML = bar("topic", ["地域の人", "チーム", "発表", "AI活用", "時間・準備", "学び", "その他"]);
  document.getElementById("byProject").innerHTML = ["輪島", "沖縄", "文房具", "芦屋校舎", "大津町", "その他"].map(p => {
    const rs = allRows.filter(r => r.project === p); const avg = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
    return `<div class="b"><span>${p}</span><div class="track"><div class="fill" style="width:${avg / 5 * 100}%"></div></div><span>★${avg.toFixed(1)}</span></div>`;
  }).join("");
}

// 質問の例
["高1の生徒が一番困っていることは何ですか？", "一番評価が高いプロジェクトと、その理由は？", "来年のPBLで、先生が改善すべきことは？", "全体の評価をひとことで報告して"].forEach(t => {
  const b = document.createElement("button"); b.className = "btn ghost"; b.style.margin = "0 6px 6px 0"; b.style.fontSize = "13px"; b.textContent = t;
  b.onclick = () => document.getElementById("q").value = t; document.getElementById("qs").append(b);
});

// 分析
document.getElementById("askBtn").onclick = async () => {
  const question = document.getElementById("q").value.trim(); if (!question) return;
  const btn = document.getElementById("askBtn"); btn.disabled = true;
  const ans = document.getElementById("ans"); ans.textContent = "AIが考えています…（10秒ほど）";
  try {
    const r = await peek.fetch(`${C.SUPABASE_URL}/functions/v1/vc-analyze`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: C.SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({ question, guard: document.getElementById("guard").checked }) });
    const j = await r.json();
    ans.textContent = j.error ? "エラー：" + j.error : j.answer;
    document.getElementById("askMsg").textContent = j.count ? `${j.count}件をもとに回答` : "";
  } catch (e) { ans.textContent = "AIを呼び出せませんでした"; }
  btn.disabled = false;
};

// データをコピー（チャットで分析）
document.getElementById("copyData").onclick = async () => {
  if (!allRows.length) await loadStats();
  const head = "プロジェクト,学年,校舎,評価,判定,話題,本文\n";
  const csv = allRows.map(r => [r.project, r.grade, r.campus, r.rating, r.sentiment ?? "", r.topic ?? "", `"${r.body.replace(/"/g, '""')}"`].join(",")).join("\n");
  await navigator.clipboard.writeText("次のPBLの口コミデータ（練習用ダミー）を分析してください。\n\n" + head + csv); toast(`${allRows.length}件をコピーしました`);
};

// ④
const repo = document.getElementById("repoBtn"); repo.href = C.REPO_URL;
document.getElementById("copySql").onclick = async () => { const t = await (await fetch("setup.sql")).text(); await navigator.clipboard.writeText(t); toast("SQLをコピーしました"); };

// 裏側を見る
document.getElementById("peek").onclick = () => document.getElementById("peekPanel").classList.toggle("on");
