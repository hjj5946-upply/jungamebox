import { useEffect, useMemo, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Ladder = boolean[][]; // [row][col] = true면 col <-> col+1 가로줄
type PathPoint = { x: number; y: number }; // x=세로줄 index, y=row index

const DEFAULT_NAMES = ["1번", "2번", "3번", "4번"];

// 가로줄 랜덤 생성
function generateLadder(numPlayers: number, rows: number): Ladder {
  const cols = numPlayers - 1;
  const ladder: Ladder = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 인접 가로줄 방지
      if (c > 0 && ladder[r][c - 1]) continue;

      const prob = 0.4; // 가로줄 밀도
      if (Math.random() < prob) {
        ladder[r][c] = true;
      }
    }
  }

  return ladder;
}

// 사다리 타기 (경로 + 최종 도착 컬럼 반환)
function runLadderWithPath(
  ladder: Ladder,
  startCol: number
): { endCol: number; path: PathPoint[] } {
  const rows = ladder.length;
  const cols = ladder[0]?.length ?? 0;

  let col = startCol;
  const path: PathPoint[] = [];

  for (let r = 0; r <= rows; r++) {
    path.push({ x: col, y: r });

    if (r === rows) break;

    if (col > 0 && ladder[r][col - 1]) {
      col = col - 1;
      path.push({ x: col, y: r });
    } else if (col < cols && ladder[r][col]) {
      col = col + 1;
      path.push({ x: col, y: r });
    }
  }

  return { endCol: col, path };
}

type LadderViewProps = {
  players: string[];
  ladder: Ladder;
  activeIndex: number | null;
  onFinish?: (endCol: number) => void;
};

function LadderView({ players, ladder, activeIndex, onFinish }: LadderViewProps) {
  const rows = ladder.length;
  const cols = players.length;

  const viewWidth = 320;
  const viewHeight = 420;

  const colSpacing = cols > 1 ? viewWidth / (cols - 1) : viewWidth;
  const rowSpacing = rows > 0 ? viewHeight / (rows + 1) : viewHeight;

  const [animPath, setAnimPath] = useState<PathPoint[] | null>(null);
  const [animPos, setAnimPos] = useState<PathPoint | null>(null);

  // activeIndex가 바뀔 때마다 경로 계산 + 애니메이션
  useEffect(() => {
    if (activeIndex == null || cols === 0 || rows === 0) {
      setAnimPath(null);
      setAnimPos(null);
      return;
    }

    const { path, endCol } = runLadderWithPath(ladder, activeIndex);
    setAnimPath(path);
    setAnimPos(path[0]);

    let i = 1;
    const interval = window.setInterval(() => {
      setAnimPos(path[i]);
      i++;
      if (i >= path.length) {
        window.clearInterval(interval);
        if (onFinish) {
          onFinish(endCol);
        }
      }
    }, 80); // 한 칸당 80ms 정도

    return () => {
      window.clearInterval(interval);
    };
  }, [activeIndex, cols, rows, ladder, onFinish]);

  const polylinePoints = useMemo(() => {
    if (!animPath) return null;
    return animPath
      .map((p) => `${p.x * colSpacing},${p.y * rowSpacing}`)
      .join(" ");
  }, [animPath, colSpacing, rowSpacing]);

  const animatedCircle = animPos
    ? {
        cx: animPos.x * colSpacing,
        cy: animPos.y * rowSpacing,
      }
    : null;

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`-20 -20 ${viewWidth + 40} ${viewHeight + 60}`}
        className="w-full max-w-md"
      >
        {/* 배경 */}
        <rect
          x={-20}
          y={-20}
          width={viewWidth + 40}
          height={viewHeight + 60}
          rx={16}
          className="fill-slate-900"
        />

        {/* 세로줄 */}
        {players.map((_, i) => {
          const x = i * colSpacing;
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={viewHeight}
              stroke="#e5e7eb"
              strokeWidth={3}
            />
          );
        })}

        {/* 가로줄 */}
        {ladder.map((row, r) =>
          row.map((has, c) => {
            if (!has) return null;
            const x1 = c * colSpacing;
            const x2 = (c + 1) * colSpacing;
            const y = (r + 1) * rowSpacing;
            return (
              <line
                key={`h-${r}-${c}`}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#38bdf8"
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })
        )}

        {/* 경로 전체 라인 (옅은 색) */}
        {polylinePoints && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
        )}

        {/* 움직이는 말(동그라미) */}
        {animatedCircle && (
          <g>
            <circle
              cx={animatedCircle.cx}
              cy={animatedCircle.cy}
              r={8}
              fill="#f97316"
              stroke="#fee2e2"
              strokeWidth={2}
            />
            <circle
              cx={animatedCircle.cx}
              cy={animatedCircle.cy}
              r={12}
              fill="none"
              stroke="#f97316"
              strokeWidth={2}
              opacity={0.4}
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export default function LadderPage() {
  const [nameInput, setNameInput] = useState(DEFAULT_NAMES.join("\n"));
  const [players, setPlayers] = useState<string[]>(DEFAULT_NAMES);
  const [ladder, setLadder] = useState<Ladder>(() =>
    generateLadder(DEFAULT_NAMES.length, 20)
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [lastStartIndex, setLastStartIndex] = useState<number | null>(null);
  const [lastEndIndex, setLastEndIndex] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!ladder || players.length < 2) return [];
    return players.map((_, idx) => {
      const { endCol } = runLadderWithPath(ladder, idx);
      return endCol;
    });
  }, [ladder, players]);

  const handleGenerate = () => {
    const rawNames = nameInput
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (rawNames.length < 2) {
      alert("최소 2명 이상 입력해 주세요.");
      return;
    }
    if (rawNames.length > 8) {
      alert("최대 8명까지만 지원합니다.");
      return;
    }

    setPlayers(rawNames);
    setLadder(generateLadder(rawNames.length, 20));
    setActiveIndex(null);
    setLastStartIndex(null);
    setLastEndIndex(null);
  };

  const handlePlayerClick = (index: number) => {
    setLastStartIndex(index);
    setLastEndIndex(null);
    setActiveIndex(index);
  };

  const handleFinish = (endCol: number) => {
    setLastEndIndex(endCol);
  };

  const mappingText =
    lastStartIndex != null && lastEndIndex != null
      ? `${players[lastStartIndex]} ▶ ${players[lastEndIndex]}`
      : null;

  return (
    <GameLayout title="사다리타기">
      <div className="flex flex-col gap-4 text-slate-100 text-sm">
        {/* 인원 입력 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          <h2 className="mb-1 text-xs font-semibold text-slate-200">
            인원 설정
          </h2>
          <p className="mb-2 text-[11px] text-slate-300">
            한 줄에 한 명씩 입력하세요. (최소 2명, 최대 8명)
          </p>
          <textarea
            className="w-full rounded-md bg-slate-900 px-2 py-2 text-xs text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-emerald-400 min-h-[80px]"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-emerald-400"
            >
              사다리 새로 생성
            </button>
          </div>
        </section>

        {/* 사다리 뷰 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          {players.length < 2 ? (
            <p className="text-[11px] text-slate-300">
              2명 이상 입력 후 사다리를 생성해 주세요.
            </p>
          ) : (
            <>
              {/* 상단 이름들 (출발점) */}
              <div className="mb-2 flex justify-between text-[11px] text-slate-200 gap-1">
                {players.map((name, i) => {
                  const isActive = activeIndex === i;
                  return (
                    <button
                      key={`top-${i}`}
                      type="button"
                      onClick={() => handlePlayerClick(i)}
                      className={`flex-1 truncate rounded-md px-1 py-1 ${
                        isActive
                          ? "bg-emerald-500 text-slate-900 font-semibold"
                          : "bg-slate-900 text-slate-100 hover:bg-slate-700"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              <LadderView
                players={players}
                ladder={ladder}
                activeIndex={activeIndex}
                onFinish={handleFinish}
              />

              {/* 하단 결과 (도착 인덱스 기준) */}
              <div className="mt-3 flex justify-between text-[11px] text-slate-300 gap-1">
                {players.map((_, i) => {
                  const targetIndex = results[i] ?? i;
                  const label = `${targetIndex + 1}번`;
                  const isLastEnd =
                    lastEndIndex != null && targetIndex === lastEndIndex;
                  return (
                    <div
                      key={`bottom-${i}`}
                      className={`flex-1 truncate rounded-md px-1 py-1 text-center ${
                        isLastEnd
                          ? "bg-orange-500 text-slate-900 font-semibold"
                          : "bg-slate-900 text-slate-100"
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>

              {mappingText && (
                <p className="mt-2 text-[11px] text-amber-300 font-semibold text-center">
                  {mappingText}
                </p>
              )}

              <p className="mt-1 text-[10px] text-slate-400 text-center">
                위 참가자 이름을 누르면, 해당 사람이 어느 위치로 내려가는지
                애니메이션으로 보여줍니다.
              </p>
            </>
          )}
        </section>
      </div>
    </GameLayout>
  );
}
