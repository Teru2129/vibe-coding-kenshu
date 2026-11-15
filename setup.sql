-- 自分のSupabaseに「PBLの口コミを貯める場所」を作るSQL
-- Supabase の SQL Editor に貼り付けて Run してください。

create table if not exists public.vc_pbl (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  author text not null default '名無し' check (char_length(author) between 1 and 20),
  project text not null check (project in ('輪島','沖縄','文房具','芦屋校舎','大津町','その他')),
  grade text not null check (grade in ('高1','高2','高3')),
  campus text not null check (campus in ('明石校','芦屋校')),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 300),
  sentiment text check (sentiment in ('良い','悪い','どちらでも')),
  topic text check (topic in ('地域の人','チーム','発表','AI活用','時間・準備','学び','その他')),
  judged_by text check (judged_by in ('ai','keyword')),
  source text not null default 'participant' check (source in ('participant','dummy','demo')),
  hidden boolean not null default false
);

-- RLS：基本は全部禁止、必要なものだけ許可する
alter table public.vc_pbl enable row level security;

-- 読む：誰でも（非表示は除く）
create policy vc_pbl_select on public.vc_pbl
  for select to anon, authenticated using (hidden = false);

-- 書く：誰でも。ただし上の制限（文字数・★1〜5・選択肢）つき
create policy vc_pbl_insert on public.vc_pbl
  for insert to anon, authenticated
  with check (source = 'participant' and hidden = false and (judged_by is null or judged_by = 'keyword'));

-- 直す・消す：ポリシーを作らない＝管理者だけ

grant select, insert on public.vc_pbl to anon, authenticated;

-- このあと：Project Settings → API Keys の URL と publishable key を config.js に書く。
-- AI判定を使わない場合は config.js の USE_AI_FUNCTIONS を false にする。
