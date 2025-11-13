import { useEffect, useState } from "react";
import { fetchReflexLeaderboard, type ReflexRank } from "../lib/reflex";

// 기록(ms) 색상 한 번에 바꾸고 싶으면 여기만 변경
const LATENCY_COLOR = "#f97316"; // 주황색 계열 예시 (원하는 HEX로 변경)

export default function ReflexLeaderboardPanel() {
  const [rows, setRows] = useState<ReflexRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchReflexLeaderboard();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mt-3 w-full rounded-xl bg-slate-900/80 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">🏆 반사신경 상위 10위</h3>
        <span className="text-[11px] text-slate-400">
          값이 작을수록 빠른 기록입니다
        </span>
      </div>

      {loading && (
        <p className="text-[12px] text-slate-400">불러오는 중…</p>
      )}

      {!loading && rows.length === 0 && (
        <p className="text-[12px] text-slate-400">아직 기록이 없습니다.</p>
      )}

      {!loading && rows.length > 0 && (
        <ul className="space-y-1">
          {rows.map((row, idx) => {
            const rank = idx + 1;

            const badge =
              rank === 1
                ? "👑"
                : rank === 2
                ? "🥈"
                : rank === 3
                ? "🥉"
                : "";

            // 1·2·3위 배경/테두리 차별화
            const rowClass =
              rank === 1
                ? "bg-yellow-500/15 border-yellow-400/60"
                : rank === 2
                ? "bg-sky-500/15 border-sky-400/60"
                : rank === 3
                ? "bg-rose-500/15 border-rose-400/60"
                : "bg-slate-800/80 border-slate-700/70";

            return (
              <li
                key={row.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${rowClass}`}
              >
                <div className="w-8 text-xs font-semibold text-right">
                  {rank}위{badge && <span className="ml-0.5">{badge}</span>}
                </div>

                <div className="flex-1 flex items-center justify-between text-[13px]">
                  <div className="flex flex-col">
                    <span className="font-semibold">{row.nickname}</span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: LATENCY_COLOR }}
                    >
                      {row.latency_ms} ms
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
