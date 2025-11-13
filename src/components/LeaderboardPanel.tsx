import { useEffect, useMemo, useState } from "react";
import { fetchLeaderboard } from "../lib/leaderboard";
import { categories } from "../data/balanceGameData";

type Rank = { item: string; wins: number };

// 카테고리 이름 → 이모지 (이미지 없을 때 플레이스홀더)
const categoryEmoji: Record<string, string> = {
  "아이스크림": "🍦",
  "과자": "🍪",
  "게임": "🎮",
  "라면": "🍜",
};

export default function LeaderboardPanel({ initialCategory }: { initialCategory?: string }) {  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? categories[0].name);
  const [data, setData] = useState<Rank[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 선택된 카테고리의 item → image 매핑 생성
  const imageMap = useMemo(() => {
    const cat = categories.find(c => c.name === selectedCategory);
    const map = new Map<string, string | undefined>();
    cat?.items.forEach(i => map.set(i.name, i.image));
    return map;
  }, [selectedCategory]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const rows = await fetchLeaderboard(selectedCategory);
      setData(rows);
      setTotal(rows.reduce((acc, cur) => acc + cur.wins, 0));
      setLoading(false);
    })();
  }, [selectedCategory]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/80 rounded-xl p-5 text-white shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold">🏆 {selectedCategory} 우승 순위</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1 text-sm text-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-slate-400 text-sm">불러오는 중…</div>}
      {!loading && data.length === 0 && (
        <div className="text-slate-500 text-sm">아직 데이터가 없습니다.</div>
      )}

      {!loading && data.map((r, i) => {
        const wins = r.wins;
        const percentNum = total ? (wins / total) * 100 : 0;
        const percent = percentNum.toFixed(1);
        const barWidth = `${percentNum}%`;
        const isTop3 = i < 3;

        const color =
          i === 0 ? "bg-yellow-500"
          : i === 1 ? "bg-blue-500"
          : i === 2 ? "bg-rose-500"
          : "bg-slate-600";

        // 썸네일 결정: 이미지가 있으면 img, 없으면 이모지 플레이스홀더
        const imgSrc = imageMap.get(r.item);
        const emoji = categoryEmoji[selectedCategory] ?? "⭐";

        return (
          <div key={r.item} className="relative flex items-center gap-3 mb-2 py-1">
            {/* 순위 번호 */}
            <div className="w-10 text-right text-sm font-semibold">
              {i + 1}위{isTop3 ? "👑" : ""}
            </div>

            {/* 썸네일 */}
            <div className="w-9 h-9 rounded-md overflow-hidden ring-1 ring-white/10 flex items-center justify-center bg-slate-800 shrink-0">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={r.item}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span className="text-base">{emoji}</span>
              )}
            </div>

            {/* 막대 + 텍스트 */}
            <div className="flex-1 relative">
              <div
                className={`absolute left-0 top-0 h-full rounded-md ${color} transition-all duration-500`}
                style={{ width: barWidth }}
              />
              <div className="relative flex items-center justify-between px-3 py-1">
                <span className="font-medium text-sm z-10 truncate">{r.item}</span>
                <span className="text-xs text-slate-200 z-10 tabular-nums">
                  {wins.toLocaleString()}회 ({percent}%)
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
