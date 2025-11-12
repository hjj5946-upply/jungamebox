import { supabase } from "./supabase";

/**
 * ✅ 우승 데이터 저장 함수
 * @param category - 예: "아이스크림"
 * @param item - 우승한 항목 이름
 */
export async function recordWinner(category: string, item: string) {
  const { error } = await supabase.from("wins").insert({ category, item });
  if (error) {
    console.error("recordWinner error", error);
  }
}

/**
 * ✅ 순위 데이터 가져오기 함수
 * @param category - 특정 카테고리별 순위 조회
 * @returns [{ item: "메로나", wins: 15 }, ...]
 */
export async function fetchLeaderboard(category: string) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("item,wins")
    .eq("category", category)
    .order("wins", { ascending: false })
    .limit(50);

  if (error) {
    console.error("fetchLeaderboard error", error);
    return [];
  }

  return data as { item: string; wins: number }[];
}
