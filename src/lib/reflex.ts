import { supabase } from "./supabase";

export type ReflexRank = {
  id: number;
  latency_ms: number;
  nickname: string;
  created_at: string;
};

// 기록 저장: 상위 10개 관리하는 DB 함수 호출
export async function recordReflexScore(latencyMs: number, nickname: string) {
    const { error } = await supabase.rpc("submit_reflex_score", {
      p_latency: latencyMs,
      p_nickname: nickname,
    });
    if (error) {
      console.error("[Reflex] submit_reflex_score error", error);
    }
}

// 랭킹 조회: 가장 빠른 10개
export async function fetchReflexLeaderboard(): Promise<ReflexRank[]> {
  const { data, error } = await supabase
    .from("reflex_scores")
    .select("id, latency_ms, nickname, created_at")
    .order("latency_ms", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("[Reflex] fetchReflexLeaderboard error", error);
    return [];
  }
  return data ?? [];
}
  