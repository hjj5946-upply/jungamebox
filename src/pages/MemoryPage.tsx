import { useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Phase = "idle" | "showing" | "input" | "fail" | "clear";

type Pad = 0 | 1 | 2 | 3; // TL, TR, BL, BR
const PADS: Pad[] = [0, 1, 2, 3];

const BASE_SHOW_MS = 700;  // 시퀀스 표시 기본 속도
const BASE_PAUSE_MS = 200; // 패드 사이 간격
const MIN_SHOW_MS = 350;   // 최저 표시 속도
const SPEEDUP_PER_ROUND = 18; // 라운드 올라갈수록 표시속도 단축(ms)

const padColors = [
  { base: "bg-emerald-600", glow: "bg-emerald-400" }, // 0
  { base: "bg-rose-600",    glow: "bg-rose-400"    }, // 1
  { base: "bg-indigo-600",  glow: "bg-indigo-400"  }, // 2
  { base: "bg-amber-600",   glow: "bg-amber-400"   }, // 3
];

export default function MemoryPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [best, setBest] = useState<number>(() => {
    const v = localStorage.getItem("memory_best");
    return v ? Number(v) : 0;
  });

  const [seq, setSeq] = useState<Pad[]>([]);
  const [flash, setFlash] = useState<Pad | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const lockRef = useRef(false); // 중복 입력/클릭 방지

  // 효과음(원하면 src 설정)
  const toneRefs = useRef<HTMLAudioElement[]>([]);
  useEffect(() => {
    toneRefs.current = [new Audio(), new Audio(), new Audio(), new Audio()];
    // toneRefs.current[0].src = "/sounds/tone0.mp3";
    // toneRefs.current[1].src = "/sounds/tone1.mp3";
    // toneRefs.current[2].src = "/sounds/tone2.mp3";
    // toneRefs.current[3].src = "/sounds/tone3.mp3";
  }, []);

  const playTone = (p: Pad) => {
    const a = toneRefs.current[p];
    if (a && a.src) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  };

  const nextPad = (): Pad => (Math.floor(Math.random() * 4) as Pad);

  const startGame = async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setRound(1);
    const first = [nextPad()];
    setSeq(first);
    await showSequence(first, 1);
    setPhase("input");
    setInputIndex(0);
    lockRef.current = false;
  };

  const advanceRound = async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    const n = [...seq, nextPad()];
    setSeq(n);
    setRound(n.length);
    await showSequence(n, n.length);
    setPhase("input");
    setInputIndex(0);
    lockRef.current = false;
  };

  const showSequence = async (s: Pad[], len: number) => {
    setPhase("showing");
    // 라운드가 커질수록 재생 속도 빨라짐
    const showMs = Math.max(MIN_SHOW_MS, BASE_SHOW_MS - (len - 1) * SPEEDUP_PER_ROUND);
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
    // 즉시 피드백
    setFlash(p);
    playTone(p);
    await sleep(140);
    setFlash(null);

    // 검증
    const expect = seq[inputIndex];
    if (p !== expect) {
      // 실패
      setPhase("fail");
      if (round > best) {
        setBest(round);
        localStorage.setItem("memory_best", String(round));
      }
      return;
    }
    const nextIdx = inputIndex + 1;
    if (nextIdx >= seq.length) {
      // 라운드 성공 → 다음 라운드
      setPhase("clear");
      setInputIndex(0);
      setTimeout(() => {
        advanceRound();
      }, 600);
    } else {
      setInputIndex(nextIdx);
    }
  };

  const resetGame = () => {
    setSeq([]);
    setRound(0);
    setInputIndex(0);
    setPhase("idle");
    setFlash(null);
  };

  return (
    <GameLayout title="기억력 게임">
      <div className="flex flex-col gap-3 p-3 items-center">
        {/* 보드 */}
        <div className="w-full max-w-md aspect-square rounded-3xl bg-slate-900 border border-slate-700 shadow-xl p-4">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full">
            {PADS.map((p) => {
              const active = flash === p;
              const color = active ? padColors[p].glow : padColors[p].base;
              return (
                <button
                  key={p}
                  onClick={() => onPadPress(p)}
                  className={[
                    "rounded-2xl transition-all duration-150",
                    color,
                    active ? "scale-[1.02] ring-4 ring-white/30" : "ring-2 ring-black/20",
                    phase === "input" ? "cursor-pointer" : "cursor-default opacity-90",
                    "shadow-inner"
                  ].join(" ")}
                />
              );
            })}
          </div>
        </div>

        {/* 상태/컨트롤 */}
        <div className="w-full max-w-md flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full text-sm text-slate-300">
            <span>라운드: <b className="text-slate-100">{round}</b></span>
            <span>최고: <b className="text-amber-300">{best}</b></span>
          </div>

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
            4개의 패드가 번갈아 빛납니다. 같은 순서로 눌러 라운드를 올려보세요.
          </p>
        </div>
      </div>
    </GameLayout>
  );
}

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}
