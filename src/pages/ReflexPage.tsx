import { useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Phase = "idle" | "waiting" | "ready" | "toosoon" | "result";

const MIN_DELAY = 1200;
const MAX_DELAY = 3500;
const WAITING_BG_POOL = [
  "bg-red-700","bg-blue-700","bg-purple-700","bg-pink-700",
  "bg-teal-700","bg-amber-700","bg-rose-700","bg-indigo-700","bg-cyan-700","bg-lime-700",
];

export default function ReflexPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [latency, setLatency] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [waitingBg, setWaitingBg] = useState<string>("bg-slate-800");

  const startAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const scheduleReady = () => {
    const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
    timeoutRef.current = window.setTimeout(() => {
      setPhase("ready");
      startAtRef.current = performance.now();
    }, delay);
  };

  const startWaiting = () => {
    const rnd = WAITING_BG_POOL[Math.floor(Math.random() * WAITING_BG_POOL.length)];
    setWaitingBg(rnd);
    setLatency(null);
    setPhase("waiting");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startAtRef.current = null;
    scheduleReady();
  };

  const onTapArea = () => {
    if (phase === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("toosoon");
      return;
    }
    if (phase === "ready") {
      const now = performance.now();
      const startAt = startAtRef.current ?? now;
      const ms = Math.max(0, Math.round(now - startAt));
      setLatency(ms);
      setPhase("result");
      setHistory(prev => [...prev, ms].slice(-5));
      return;
    }
  };

  const onStartClick = () => {
    startWaiting();
  };

  const onRetryClick = () => {
    startWaiting();
  };

  const areaBg =
    phase === "ready" ? "bg-[#47ed8a]"
    : phase === "waiting" ? waitingBg
    : phase === "toosoon" ? "bg-amber-700"
    : phase === "result" ? "bg-indigo-700"
    : "bg-slate-800";

  return (
    <GameLayout title="반사신경">
      {/* 히스토리 위까지 거의 전체화면: dvh 사용 */}
      <div className="flex flex-col">
        <div
          className={[
            "relative select-none",
            "flex items-center justify-center",
            "rounded-2xl shadow-lg border border-slate-700",
            "transition-colors duration-150",
            "min-h-[78dvh]", // 거의 전체 화면
            areaBg,
          ].join(" ")}
          onClick={onTapArea}
          onTouchStart={onTapArea}
          role="button"
          aria-label="반사신경 게임 터치 영역"
        >
          {/* 중앙 컨텐츠 */}
          <div className="text-center px-4">
            {phase === "idle" && (
              <>
                <h2 className="text-slate-100 text-xl font-semibold mb-2">시작하기</h2>
                <p className="text-slate-300 text-sm">버튼을 눌러 테스트를 시작하세요</p>
                <button
                  onClick={onStartClick}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-slate-100 font-semibold px-6 py-3 ring-1 ring-slate-600 transition"
                >
                  시작
                </button>
              </>
            )}

            {phase === "waiting" && (
              <>
                <h2 className="text-white text-2xl font-bold mb-2">기다려요…</h2>
                <p className="text-white/90 text-sm">화면이 초록(형광)색으로 바뀌면 즉시 탭!</p>
              </>
            )}

            {phase === "ready" && (
              <>
                <h2 className="text-white text-3xl font-extrabold mb-2">지금!</h2>
                <p className="text-white/90 text-sm">초록색일 때 탭하세요</p>
              </>
            )}

            {phase === "toosoon" && (
              <>
                <h2 className="text-white text-2xl font-bold mb-2">너무 성급했어요 😅</h2>
                <p className="text-white/90 text-sm">신호(초록)가 뜬 후에 눌러야 합니다.</p>
                <button
                  onClick={onRetryClick}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-slate-100 font-semibold px-6 py-3 ring-1 ring-slate-600 transition"
                >
                  다시 시도
                </button>
              </>
            )}

            {phase === "result" && (
              <>
                <h2 className="text-white text-4xl font-extrabold mb-2">{latency} ms</h2>
                <p className="text-white/90 text-sm">반응 속도</p>
                <button
                  onClick={onRetryClick}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-slate-100 font-semibold px-6 py-3 ring-1 ring-slate-600 transition"
                >
                  다시 시도
                </button>
              </>
            )}
          </div>
        </div>

        {/* 히스토리: 최근 5개 */}
        <div className="mt-3">
          <h3 className="text-slate-200 text-sm font-semibold mb-2">최근 기록 (5)</h3>
          {history.length === 0 ? (
            <p className="text-[12px] text-slate-400">아직 기록이 없습니다.</p>
          ) : (
            <ul className="grid grid-cols-5 gap-2">
              {history.map((v, i) => (
                <li
                  key={`${i}-${v}`}
                  className="rounded-lg bg-slate-800 text-slate-100 text-sm py-2 text-center border border-slate-700"
                  title={`${v}ms`}
                >
                  {v}ms
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
