import { useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";
import Confetti from "../components/Confetti";

/** 진동 유틸 */
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    // @ts-ignore
    navigator.vibrate(pattern);
  }
};

type Phase = "idle" | "showing" | "input" | "fail" | "clear";
type Pad = number; // 4/6/8 대응

// 최대 8패드 색 팔레트
const padColors: { base: string; glow: string }[] = [
  { base: "bg-emerald-600", glow: "bg-emerald-400" },
  { base: "bg-rose-600",    glow: "bg-rose-400"    },
  { base: "bg-indigo-600",  glow: "bg-indigo-400"  },
  { base: "bg-amber-600",   glow: "bg-amber-400"   },
  { base: "bg-cyan-600",    glow: "bg-cyan-400"    },
  { base: "bg-fuchsia-600", glow: "bg-fuchsia-400" },
  { base: "bg-lime-600",    glow: "bg-lime-400"    },
  { base: "bg-orange-600",  glow: "bg-orange-400"  },
];

// 속도 파라미터
const BASE_SHOW_MS = 700;
const BASE_PAUSE_MS = 200;
const MIN_SHOW_MS  = 350;
const SPEEDUP_PER_ROUND = 18;

export default function MemoryPage() {
  // 패드 개수: 4/6/8
  const [padCount, setPadCount] = useState<4 | 6 | 8>(4);
  const pads = Array.from({ length: padCount }, (_, i) => i as Pad);

  // 상태
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState<Pad[]>([]);
  const [flash, setFlash] = useState<Pad | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [, setMessage] = useState("시작하기를 눌러주세요"); // 값은 미사용, setter만 사용
  const lockRef = useRef(false);

  // 컨페티/다음 라운드 대기
  const [confetti, setConfetti] = useState(false);
  const [pendingAdvanceNext, setPendingAdvanceNext] = useState(false);

  // 톤(옵션)
  const toneRefs = useRef<HTMLAudioElement[]>([]);
  useEffect(() => {
    toneRefs.current = new Array(8).fill(0).map(() => new Audio());
    // toneRefs.current[0].src = "/sounds/tone0.mp3";
  }, []);
  const playTone = (p: Pad) => {
    const a = toneRefs.current[p];
    if (a && a.src) { a.currentTime = 0; a.play().catch(() => {}); }
  };

  // 패드 수 변경 시 초기화
  useEffect(() => { resetGame(); }, [padCount]);

  const nextPad = (): Pad => Math.floor(Math.random() * padCount) as Pad;

  const startGame = async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setMessage("시퀀스를 외우세요…");
    vibrate(20);

    const first = [nextPad()];
    setSeq(first);
    setRound(1);
    await showSequence(first, 1);
    setPhase("input");
    setInputIndex(0);
    setMessage("그대로 눌러보세요!");
    lockRef.current = false;
  };

  const advanceRound = async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    const n = [...seq, nextPad()];
    setSeq(n);
    setRound(n.length);
    setMessage("시퀀스를 외우세요…");
    await showSequence(n, n.length);
    setPhase("input");
    setInputIndex(0);
    setMessage("그대로 눌러보세요!");
    lockRef.current = false;
  };

  /** 패드수가 많을수록 시작 속도 약간 느리게 */
  const computeShowMs = (len: number) => {
    const padOffset = padCount === 4 ? 0 : padCount === 6 ? 80 : 140;
    return Math.max(MIN_SHOW_MS, BASE_SHOW_MS + padOffset - (len - 1) * SPEEDUP_PER_ROUND);
  };

  const showSequence = async (s: Pad[], len: number) => {
    setPhase("showing");
    const showMs = computeShowMs(len);
    for (let i = 0; i < s.length; i++) {
      const p = s[i];
      setFlash(p);
      playTone(p);
      await sleep(showMs);
      setFlash(null);
      await sleep(BASE_PAUSE_MS);
    }
  };

  const onPadPress = async (p: Pad) => {
    if (phase !== "input" || lockRef.current) return;

    setFlash(p); playTone(p); vibrate(16);
    await sleep(140);
    setFlash(null);

    const expect = seq[inputIndex];
    if (p !== expect) {
      setPhase("fail");
      setMessage("실패! 다시 도전해보세요.");
      vibrate([60, 30, 60]);
      return;
    }

    const nextIdx = inputIndex + 1;
    if (nextIdx >= seq.length) {
      // 라운드 성공 → 컨페티 끝난 뒤 다음 라운드
      setPhase("clear");
      setMessage("잘했어요! 다음 라운드…");
      vibrate(40);
      setPendingAdvanceNext(true);
      setConfetti(true);
      setInputIndex(0);
    } else {
      setInputIndex(nextIdx);
    }
  };

  const resetGame = () => {
    setSeq([]); setRound(0); setInputIndex(0);
    setPhase("idle"); setFlash(null);
    setMessage("시작하기를 눌러주세요");
    setPendingAdvanceNext(false);
    setConfetti(false);
  };

  // ✅ 패드 수에 따른 간격/스케일(셀 크기 조절)
  const gridGapClass =
    padCount === 4 ? "gap-4" :
    padCount === 6 ? "gap-3" :
                     "gap-2"; // 8패드

  const boardScaleClass =
    padCount === 4 ? "scale-100" :
    padCount === 6 ? "scale-[0.92]" :
                     "scale-[0.85]";

  return (
    <GameLayout title="기억력 게임">
      <div className="flex flex-col gap-3 p-3 items-center">
        {/* 상단 바: 라운드만 표시, 우측 패드 선택 */}
        <div className="w-full max-w-md flex items-center justify-between">
          <div className="text-sm text-slate-300">
            라운드: <b className="text-slate-100">{round}</b>
          </div>
          <div className="flex gap-2">
            {[4,6,8].map((n) => (
              <button
                key={n}
                onClick={() => { if (padCount !== n) setPadCount(n as 4|6|8); }}
                className={`px-3 py-1 rounded-lg text-xs bg-slate-700 transition ${padCount === n ? "text-white" : "text-slate-200 hover:bg-slate-600"} ${
                  n === 4 ? (padCount === 4 ? "bg-emerald-600" : "") :
                  n === 6 ? (padCount === 6 ? "bg-indigo-600" : "") :
                             (padCount === 8 ? "bg-amber-600" : "")
                }`}
                aria-label={`${n}`}
                title={`${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 보드: 행 증가로 세로 확장 + 스케일로 셀 크기 보정 */}
        <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-xl p-4">
          <div className={`grid grid-cols-2 ${gridGapClass} w-full origin-top ${boardScaleClass}`}>
            {pads.map((p) => {
              const active = flash === p;
              const color = (padColors[p] ?? padColors[p % padColors.length]);
              const bgClass = active ? color.glow : color.base;
              return (
                <button
                  key={p}
                  onClick={() => onPadPress(p)}
                  className={[
                    "w-full aspect-square rounded-2xl transition-all duration-150",
                    bgClass,
                    active ? "scale-[1.02] ring-4 ring-white/30" : "ring-2 ring-black/20",
                    phase === "input" ? "cursor-pointer" : "cursor-default opacity-90",
                    "shadow-inner"
                  ].join(" ")}
                />
              );
            })}
          </div>

          {/* 컨페티: 끝난 뒤에만 다음 라운드 진행 */}
          <Confetti
            run={confetti}
            duration={1000}
            fadeOutMs={220}
            onEnd={() => {
              setConfetti(false);
              if (pendingAdvanceNext) {
                setPendingAdvanceNext(false);
                advanceRound();
              }
            }}
          />
        </div>

        {/* 컨트롤/메시지: phase별 텍스트만 사용 */}
        <div className="w-full max-w-md flex flex-col items-center gap-2">
          {phase === "idle" && (
            <button
              onClick={startGame}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold py-3 hover:from-emerald-700 hover:to-cyan-700 transition"
            >
              시작하기
            </button>
          )}

          {phase === "showing" && (
            <div className="w-full text-center text-slate-400 text-sm">
              시퀀스를 외우세요…
            </div>
          )}

          {phase === "input" && (
            <div className="w-full text-center text-slate-200 text-sm">
              그대로 눌러보세요!
            </div>
          )}

          {phase === "fail" && (
            <div className="w-full flex gap-2">
              <button
                onClick={startGame}
                className="flex-1 rounded-xl bg-rose-600 text-white font-bold py-3 hover:bg-rose-700 transition"
              >
                다시 도전
              </button>
              <button
                onClick={resetGame}
                className="px-4 rounded-xl bg-slate-700 text-slate-100 font-semibold hover:bg-slate-600 transition"
              >
                초기화
              </button>
            </div>
          )}

          {phase === "clear" && (
            <div className="w-full text-center text-emerald-300 text-sm">
              잘했어요! 다음 라운드…
            </div>
          )}

          <p className="mt-1 text-[12px] text-slate-400 text-center">
            패드 수를 바꾸면 보드가 세로로 확장되고, 6/8패드에서는 셀 크기가 살짝 줄어 한 화면 가독성을 유지합니다.
          </p>
        </div>
      </div>
    </GameLayout>
  );
}

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}
