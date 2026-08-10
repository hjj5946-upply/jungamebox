import { useCallback, useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";
import Confetti from "../components/Confetti";

/** 진동 유틸 */
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
};

type Phase = "idle" | "showing" | "input" | "fail" | "clear";
type Pad = number; // 4/6/8 대응
type PadCount = 4 | 6 | 8;

// 최대 8패드 색 팔레트
const padColors: { base: string; glow: string }[] = [
  { base: "bg-emerald-600", glow: "bg-emerald-300" },
  { base: "bg-rose-600", glow: "bg-rose-300" },
  { base: "bg-indigo-600", glow: "bg-indigo-300" },
  { base: "bg-amber-600", glow: "bg-amber-300" },
  { base: "bg-cyan-600", glow: "bg-cyan-300" },
  { base: "bg-fuchsia-600", glow: "bg-fuchsia-300" },
  { base: "bg-lime-600", glow: "bg-lime-300" },
  { base: "bg-orange-600", glow: "bg-orange-300" },
];

/* ────────────── 난이도 곡선 ──────────────
 * 이전에는 450ms 에서 라운드당 20ms 씩 줄이다 250ms 에서 멈췄다.
 * 11라운드면 하한에 닿아 그 뒤로는 난이도가 전혀 안 올라갔다.
 * 지수 감쇠로 바꿔서 훨씬 낮은 하한까지 계속 조여든다. */
const SHOW_BASE = 400;
const SHOW_FLOOR = 130;
const SHOW_DECAY = 0.9;

const PAUSE_BASE = 110;
const PAUSE_FLOOR = 35;
const PAUSE_DECAY = 0.88;

// 입력 제한시간 — 탭 하나마다 다시 시작한다
const LIMIT_BASE = 2200;
const LIMIT_FLOOR = 800;
const LIMIT_DECAY = 0.94;

const READY_MS = 320; // 시퀀스 재생 직전 준비 시간
const FLASH_MS = 110; // 사용자가 누른 패드가 빛나는 시간 (입력을 막지 않는다)
const ADVANCE_MS = 380; // 라운드 클리어 후 다음 시퀀스까지
const GROWTH_STEP_ROUND = 12; // 이 라운드부터 시퀀스가 한 번에 2개씩 늘어난다
const MILESTONE = 5; // 컨페티를 띄우는 라운드 간격

function curve(base: number, floor: number, decay: number, round: number) {
  return Math.round(floor + (base - floor) * Math.pow(decay, round - 1));
}

// 라운드 r 을 클리어했을 때 시퀀스에 추가되는 개수
function growth(round: number) {
  return round >= GROWTH_STEP_ROUND ? 2 : 1;
}

const bestKey = (n: PadCount) => `jgb-memory-best-${n}`;

function readBest(n: PadCount): number {
  try {
    return Number(localStorage.getItem(bestKey(n))) || 0;
  } catch {
    // 시크릿 모드 등에서 localStorage 접근이 막힐 수 있다
    return 0;
  }
}

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

export default function MemoryPage() {
  const [padCount, setPadCount] = useState<PadCount>(4);
  const pads = Array.from({ length: padCount }, (_, i) => i as Pad);

  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState<Pad[]>([]);
  const [flash, setFlash] = useState<Pad | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [failReason, setFailReason] = useState("");
  const [best, setBest] = useState(0);
  const [confetti, setConfetti] = useState(false);

  /* 재생 중인 시퀀스를 취소하기 위한 토큰.
   * 이전 구현은 취소 수단이 없어서 패드 수를 바꾸거나 페이지를 떠나도
   * async 루프가 계속 돌며 setState 를 호출했다. */
  const runIdRef = useRef(0);
  const flashTimerRef = useRef<number | null>(null);
  const limitTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  const showMs = curve(SHOW_BASE, SHOW_FLOOR, SHOW_DECAY, Math.max(1, round));
  const limitMs = curve(LIMIT_BASE, LIMIT_FLOOR, LIMIT_DECAY, Math.max(1, round));

  const clearTimers = useCallback(() => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    flashTimerRef.current = null;
    limitTimerRef.current = null;
    advanceTimerRef.current = null;
  }, []);

  const resetGame = useCallback(() => {
    runIdRef.current++; // 진행 중인 시퀀스 무효화
    clearTimers();
    setSeq([]);
    setRound(0);
    setInputIndex(0);
    setPhase("idle");
    setFlash(null);
    setFailReason("");
    setConfetti(false);
  }, [clearTimers]);

  // 패드 수 변경 시 초기화 + 해당 패드 수의 최고 기록 불러오기
  useEffect(() => {
    resetGame();
    setBest(readBest(padCount));
  }, [padCount, resetGame]);

  useEffect(() => () => {
    runIdRef.current++;
    clearTimers();
  }, [clearTimers]);

  const nextPad = useCallback(
    (): Pad => Math.floor(Math.random() * padCount) as Pad,
    [padCount]
  );

  const failRound = useCallback(
    (reason: string) => {
      runIdRef.current++;
      clearTimers();
      setFailReason(reason);
      setPhase("fail");
      setFlash(null);
      vibrate([60, 30, 60]);
    },
    [clearTimers]
  );

  // 탭 하나마다 제한시간을 다시 건다
  const armLimit = useCallback(
    (r: number) => {
      if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
      const ms = curve(LIMIT_BASE, LIMIT_FLOOR, LIMIT_DECAY, r);
      limitTimerRef.current = window.setTimeout(
        () => failRound("시간 초과!"),
        ms
      );
    },
    [failRound]
  );

  const beginRound = useCallback(
    async (s: Pad[], r: number) => {
      const runId = ++runIdRef.current;
      setSeq(s);
      setRound(r);
      setInputIndex(0);
      setPhase("showing");
      setFlash(null);

      const stepShow = curve(SHOW_BASE, SHOW_FLOOR, SHOW_DECAY, r);
      const stepPause = curve(PAUSE_BASE, PAUSE_FLOOR, PAUSE_DECAY, r);

      await sleep(READY_MS);
      if (runId !== runIdRef.current) return;

      for (const p of s) {
        setFlash(p);
        await sleep(stepShow);
        if (runId !== runIdRef.current) return;
        setFlash(null);
        await sleep(stepPause);
        if (runId !== runIdRef.current) return;
      }

      setPhase("input");
      armLimit(r);
    },
    [armLimit]
  );

  const startGame = useCallback(() => {
    clearTimers();
    setFailReason("");
    setConfetti(false);
    vibrate(20);
    beginRound([Math.floor(Math.random() * padCount) as Pad], 1);
  }, [beginRound, clearTimers, padCount]);

  const onPadPress = (p: Pad) => {
    if (phase !== "input") return;

    /* 시각 피드백은 입력을 막지 않는다.
     * 이전에는 여기서 await sleep(140) 으로 정답 판정까지 늦춰서
     * 초당 7탭이 상한이었고 입력이 밀리는 느낌이 났다. */
    setFlash(p);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlash(null), FLASH_MS);
    vibrate(14);

    if (p !== seq[inputIndex]) {
      failRound("틀렸어요!");
      return;
    }

    const nextIdx = inputIndex + 1;
    if (nextIdx < seq.length) {
      setInputIndex(nextIdx);
      armLimit(round);
      return;
    }

    // 라운드 클리어
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
    setPhase("clear");
    vibrate(40);

    const cleared = round;
    if (cleared > best) {
      setBest(cleared);
      try {
        localStorage.setItem(bestKey(padCount), String(cleared));
      } catch {
        // 저장 실패는 무시 — 이번 세션에만 반영된다
      }
    }
    // 컨페티는 이제 진행을 막지 않는다. 5라운드마다 축하만 한다.
    if (cleared % MILESTONE === 0) setConfetti(true);

    const grown = [...seq];
    for (let i = 0; i < growth(cleared); i++) grown.push(nextPad());
    advanceTimerRef.current = window.setTimeout(
      () => beginRound(grown, cleared + 1),
      ADVANCE_MS
    );
  };

  // 패드 수에 따라 열을 바꿔 보드가 항상 2행(또는 2×2)으로 유지된다
  const gridCols =
    padCount === 4 ? "grid-cols-2" : padCount === 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <GameLayout title="기억력 테스트">
      <div className="flex flex-col items-center gap-3">
        {/* 상단: 라운드 · 길이 · 최고 기록 / 패드 수 */}
        <div className="flex w-full max-w-md items-center justify-between">
          <div className="flex items-baseline gap-2 text-sm text-slate-300">
            <span>
              라운드 <b className="text-strong">{round}</b>
            </span>
            <span className="text-[11px] text-slate-400">길이 {seq.length}</span>
            <span className="text-[11px] text-slate-400">최고 {best}</span>
          </div>
          <div className="flex gap-1.5">
            {([4, 6, 8] as PadCount[]).map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (padCount !== n) setPadCount(n);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  padCount === n
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
                title={`패드 ${n}개`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 보드 */}
        <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          <div className={`grid ${gridCols} gap-3`}>
            {pads.map((p) => {
              const active = flash === p;
              const color = padColors[p % padColors.length];
              return (
                <button
                  key={p}
                  onClick={() => onPadPress(p)}
                  className={[
                    "aspect-square w-full rounded-2xl shadow-inner transition-all duration-100",
                    active ? color.glow : color.base,
                    active
                      ? "scale-[1.03] ring-4 ring-veil/40"
                      : "ring-2 ring-black/20",
                    phase === "input"
                      ? "cursor-pointer"
                      : "cursor-default opacity-90",
                  ].join(" ")}
                  aria-label={`패드 ${p + 1}`}
                />
              );
            })}
          </div>

          {/* 컨페티는 축하 전용 — 라운드 진행을 기다리게 하지 않는다 */}
          <Confetti
            run={confetti}
            duration={900}
            fadeOutMs={200}
            onEnd={() => setConfetti(false)}
          />
        </div>

        {/* 입력 제한시간 바 */}
        <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-800">
          {phase === "input" && (
            <div
              // key: 탭마다 요소를 새로 만들어 애니메이션을 처음부터 다시 돌린다
              key={`${round}-${inputIndex}`}
              className="animate-time-bar h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ animationDuration: `${limitMs}ms` }}
            />
          )}
        </div>

        {/* 컨트롤 / 상태 */}
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          {phase === "idle" && (
            <button
              onClick={startGame}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3 font-bold text-white transition hover:from-emerald-700 hover:to-cyan-700"
            >
              시작하기
            </button>
          )}

          {phase === "showing" && (
            <div className="w-full text-center text-sm text-slate-400">
              시퀀스를 외우세요… ({showMs}ms)
            </div>
          )}

          {phase === "input" && (
            <div className="w-full text-center text-sm text-slate-200">
              그대로 눌러보세요! <b className="text-strong">{inputIndex}</b> /{" "}
              {seq.length}
            </div>
          )}

          {phase === "clear" && (
            <div className="w-full text-center text-sm text-emerald-400">
              잘했어요! 다음 라운드…
            </div>
          )}

          {phase === "fail" && (
            <>
              <div className="w-full text-center text-sm text-rose-400">
                {failReason} 라운드 {round} 에서 종료 · 최고 {best}
              </div>
              <div className="flex w-full gap-2">
                <button
                  onClick={startGame}
                  className="flex-1 rounded-xl bg-rose-600 py-3 font-bold text-white transition hover:bg-rose-700"
                >
                  다시 도전
                </button>
                <button
                  onClick={resetGame}
                  className="rounded-xl bg-slate-700 px-4 font-semibold text-slate-100 transition hover:bg-slate-600"
                >
                  초기화
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[12px] text-slate-400">
            라운드가 오를수록 재생이 빨라지고 입력 제한시간도 짧아집니다.
            {GROWTH_STEP_ROUND}라운드부터는 한 번에 두 개씩 늘어납니다.
          </p>
        </div>
      </div>
    </GameLayout>
  );
}
