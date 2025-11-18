import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GameLayout from "../layouts/GameLayout";
import PinballCanvas from "../components/pinball/PinballCanvas";
import type { BallSpec } from "../components/pinball/PinballCanvas";
import type { Entry } from "./PinballPage";

type LocationState = {
  entries: Entry[];
};

const COLOR_PALETTE = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f97316", // orange
  "#e11d48", // rose
  "#a855f7", // purple
  "#facc15", // yellow
  "#06b6d4", // cyan
  "#f472b6", // pink
];

export default function PinballPlayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !state.entries || state.entries.length === 0) {
      navigate("/games/pinball", { replace: true });
    }
  }, [state, navigate]);

  const ballSpecs: BallSpec[] = useMemo(() => {
    if (!state?.entries) return [];

    const specs: BallSpec[] = [];

    state.entries.forEach((entry, idx) => {
      const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
      const count = entry.weight;

      // weight 수만큼 공 생성
      for (let i = 0; i < count; i++) {
        specs.push({
          name: entry.name,
          color,
        });
      }
    });

    return specs;
  }, [state]);

  if (!state || !state.entries || state.entries.length === 0) {
    return null;
  }

  const totalBalls = ballSpecs.length;

  return (
    <GameLayout title="핀볼룰렛">
      <div className="flex h-full flex-col gap-2 text-slate-100">
        {/* 상단 정보 / 결과 */}
        <div className="mb-1 rounded-md bg-slate-800/80 px-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              총 공 개수: {totalBalls}
            </div>
            <button
              onClick={() => navigate("/games/pinball")}
              className="rounded bg-slate-700 px-2 py-1 text-[11px] text-slate-100 hover:bg-slate-600"
            >
              설정으로 돌아가기
            </button>
          </div>

          <div className="mt-2">
            {winnerName ? (
              <>
                <div className="text-[11px] text-slate-400">
                  이번 라운드 당첨자
                </div>
                <div className="text-base font-bold text-emerald-400">
                  🎉 {winnerName} 🎉
                </div>
              </>
            ) : (
              <div className="text-[11px] text-slate-400">
                공들이 아래 골 지점에 도착하면, 가장 먼저 도착한 이름이
                당첨자로 표시됩니다.
              </div>
            )}
          </div>
        </div>

        {/* 전체 화면 핀볼판 */}
        <div className="flex-1">
          <PinballCanvas
            balls={ballSpecs}
            onWinner={(name) => {
              // 최초 1회만 세팅
              setWinnerName((prev) => prev ?? name);
            }}
          />
        </div>
      </div>
    </GameLayout>
  );
}
