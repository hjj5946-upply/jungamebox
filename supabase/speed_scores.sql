-- ============================================================
-- 1 to 48 (/games/speed) 랭킹 — Supabase SQL Editor 에서 통째로 실행
--
-- 코드 쪽 대응: src/lib/speedrun.ts
--   저장 → rpc("submit_speed_score", { p_elapsed, p_nickname })
--   조회 → from("speed_scores").select(...).order(elapsed_ms).limit(10)
--
-- 설계 원칙 (반사신경에서 2ms 위조 기록이 들어온 경험 반영):
--   anon 키는 클라이언트 번들에 평문으로 박히므로 누구나 RPC 를 직접 호출할 수 있다.
--   따라서 값 검증을 브라우저에 두면 의미가 없고, 반드시 이 함수 안에 있어야 한다.
-- ============================================================

-- ── 1) 테이블 ────────────────────────────────────────────────
create table if not exists public.speed_scores (
  id         bigint generated always as identity primary key,
  elapsed_ms integer     not null,
  nickname   text        not null,
  created_at timestamptz not null default now(),

  -- 48칸을 사람이 7초 안에 누르는 것은 불가능하다 (초당 7탭 + 시각 탐색).
  -- 상한 10분은 방치 기록을 걸러낸다.
  constraint speed_scores_elapsed_range
    check (elapsed_ms between 7000 and 600000),
  constraint speed_scores_nickname_len
    check (char_length(nickname) between 1 and 10)
);

-- 랭킹 조회 정렬(빠른 기록 우선)용 인덱스
create index if not exists speed_scores_rank_idx
  on public.speed_scores (elapsed_ms asc, created_at asc);

-- ── 2) RLS ──────────────────────────────────────────────────
alter table public.speed_scores enable row level security;

-- 조회는 누구나 허용
drop policy if exists speed_scores_select_anon on public.speed_scores;
create policy speed_scores_select_anon
  on public.speed_scores
  for select
  to anon, authenticated
  using (true);

-- insert / update / delete 정책은 만들지 않는다.
-- RLS 가 켜져 있고 정책이 없으면 기본 거부이므로, 직접 쓰기는 전부 막힌다.
-- 저장은 아래 security definer 함수를 통해서만 가능하다.

-- ── 3) 저장 함수 (상위 10개만 유지) ──────────────────────────
create or replace function public.submit_speed_score(
  p_elapsed  integer,
  p_nickname text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_nick text;
begin
  -- 사람이 낼 수 없는 기록은 조용히 무시한다.
  -- 예외를 던지지 않는 이유: DB 실패가 게임 진행을 막아서는 안 된다.
  if p_elapsed is null or p_elapsed < 7000 or p_elapsed > 600000 then
    return;
  end if;

  v_nick := btrim(coalesce(p_nickname, ''));
  if v_nick = '' then
    v_nick := 'NONAME';
  end if;
  v_nick := left(v_nick, 10);

  -- 한글/영문/숫자/_ 만 허용 (src/lib/nickname.ts 의 정규식과 동일 규칙)
  if v_nick !~ '^[가-힣ㄱ-ㅎa-zA-Z0-9_]+$' then
    return;
  end if;

  insert into public.speed_scores (elapsed_ms, nickname)
  values (p_elapsed, v_nick);

  -- 11위 이하는 즉시 정리 → 테이블에 항상 10행만 남는다
  delete from public.speed_scores
  where id in (
    select id
    from public.speed_scores
    order by elapsed_ms asc, created_at asc
    offset 10
  );
end;
$$;

-- 브라우저(anon)에서 호출할 수 있게 실행 권한만 부여
revoke all on function public.submit_speed_score(integer, text) from public;
grant execute on function public.submit_speed_score(integer, text) to anon, authenticated;
