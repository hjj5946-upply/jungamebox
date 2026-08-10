import { supabase } from "./supabase";

export type SpeedRank = {
  id: number;
  elapsed_ms: number;
  nickname: string;
  created_at: string;
};

// 기록 저장: 상위 10개 관리 + 값 검증을 DB 함수 쪽에서 한다
export async function recordSpeedScore(elapsedMs: number, nickname: string) {
  const { error } = await supabase.rpc("submit_speed_score", {
    p_elapsed: elapsedMs,
    p_nickname: nickname,
  });
  if (error) {
    console.error("[Speed] submit_speed_score error", error);
  }
}

// 랭킹 조회: 가장 빠른 10개
export async function fetchSpeedLeaderboard(): Promise<SpeedRank[]> {
  const { data, error } = await supabase
    .from("speed_scores")
    .select("id, elapsed_ms, nickname, created_at")
    .order("elapsed_ms", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("[Speed] fetchSpeedLeaderboard error", error);
    return [];
  }
  return data ?? [];
}
