import { useEffect, useState } from "react";
import { fetchSpeedLeaderboard, type SpeedRank } from "../lib/speedrun";

// 기록(초) 색상 한 번에 바꾸고 싶으면 여기만 변경
const TIME_COLOR = "#38bdf8";

function formatMs(ms: number) {
  return `${(ms / 1000).toFixed(2)}초`;
}

export default function SpeedLeaderboardPanel() {
  const [rows, setRows] = useState<SpeedRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchSpeedLeaderboard();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mt-3 w-full rounded-xl bg-slate-900/80 p-4 text-strong shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">🏆 1 to 48 상위 10위</h3>
        <span className="text-[11px] text-slate-400">
          값이 작을수록 빠른 기록입니다
        </span>
      </div>

      {loading && <p className="text-[12px] text-slate-400">불러오는 중…</p>}

      {!loading && rows.length === 0 && (
        <p className="text-[12px] text-slate-400">아직 기록이 없습니다.</p>
      )}

      {!loading && rows.length > 0 && (
        <ul className="space-y-1">
          {rows.map((row, idx) => {
            const rank = idx + 1;

            const badge =
              rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

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
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${rowClass}`}
              >
                <div className="w-8 text-right text-xs font-semibold">
                  {rank}위{badge && <span className="ml-0.5">{badge}</span>}
                </div>

                <div className="flex flex-1 items-center justify-between text-[13px]">
                  <div className="flex flex-col">
                    <span className="font-semibold">{row.nickname}</span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: TIME_COLOR }}
                    >
                      {formatMs(row.elapsed_ms)}
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
