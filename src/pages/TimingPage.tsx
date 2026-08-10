import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  type SyntheticEvent,
} from "react";
import GameLayout from "../layouts/GameLayout";
import { gsap } from "gsap";
import { eventTime } from "../lib/eventTime";

type Mode = "bar" | "number";

const TARGET_SECONDS = 10;

/* 막대 왕복 주기(ms).
 * 이전에는 프레임당 2.5% 씩 더하는 방식이라 화면 주사율이 곧 게임 속도였다.
 * 60Hz 에서는 왕복 80프레임(1333ms)이지만 120Hz 에서는 667ms — 두 배 어려웠다.
 * 60Hz 기준 체감을 그대로 시간 기준으로 옮겨 주사율과 무관하게 만든다. */
const BAR_PERIOD_MS = 1333;

/** 경과 시간에서 막대 위치(0~100)를 구한다 — 0↔100 을 왕복하는 삼각파 */
function barPositionAt(elapsedMs: number, phase0: number) {
  const phase = (elapsedMs / BAR_PERIOD_MS + phase0) % 1;
  return phase < 0.5 ? phase * 200 : (1 - phase) * 200;
}

export default function TimingPage() {
  // 기본 모드는 "10.00초 도전"
  const [mode, setMode] = useState<Mode>("number");
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // 화면 표시용 값 — 채점에는 쓰지 않는다 (아래 handleStop 주석 참고)
  const [barPosition, setBarPosition] = useState(50);
  const [numberValue, setNumberValue] = useState(0);

  const startAtRef = useRef(0);
  const phase0Ref = useRef(0); // 막대 시작 위치 랜덤화 (난이도)
  const animationRef = useRef<number | undefined>(undefined);

  // 모드 변경 시 초기화 애니메이션
  useLayoutEffect(() => {
    gsap.fromTo(
      ".game-card",
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
    );
  }, [mode]);

  // 막대 애니메이션 — 시간 기준이므로 주사율이 달라도 속도가 같다
  useEffect(() => {
    if (mode !== "bar" || !isPlaying) return;
    const animate = (now: number) => {
      setBarPosition(barPositionAt(now - startAtRef.current, phase0Ref.current));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mode, isPlaying]);

  // 숫자 애니메이션
  useEffect(() => {
    if (mode !== "number" || !isPlaying) return;
    const animate = (now: number) => {
      setNumberValue((now - startAtRef.current) / 1000);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mode, isPlaying]);

  const handleStart = () => {
    setResult(null);
    phase0Ref.current = Math.random();
    startAtRef.current = performance.now();
    if (mode === "bar") {
      setBarPosition(barPositionAt(0, phase0Ref.current));
    } else {
      setNumberValue(0);
    }
    setIsPlaying(true);
  };

  const handleStop = (e: SyntheticEvent) => {
    if (!isPlaying) return;

    /* 채점은 state 가 아니라 "버튼을 누른 시각"으로 한다.
     * barPosition·numberValue 는 rAF 가 갱신하는 값이라 마지막으로 커밋된
     * 프레임의 값이고, 항상 실제보다 이른 쪽으로 최대 한 프레임 치우친다.
     * 숫자 모드는 0.02초 단위를 표기하는데 그 오차가 16.7ms 라 같은 크기였고,
     * 막대 모드는 프레임당 2.5%p 라 최대 7.5점까지 틀어졌다. */
    const elapsed = eventTime(e) - startAtRef.current;
    setIsPlaying(false);

    let score = 0;
    if (mode === "bar") {
      const pos = barPositionAt(elapsed, phase0Ref.current);
      setBarPosition(pos); // 화면도 실제로 멈춘 위치에 맞춘다
      const distance = Math.abs(pos - 50);
      score = Math.max(0, 100 - Math.round(distance * 3));
      // 충돌 연출
      gsap.to(".bar-container", { x: 5, yoyo: true, repeat: 5, duration: 0.05 });
    } else {
      const seconds = elapsed / 1000;
      setNumberValue(seconds); // 표시도 실제로 멈춘 값에 맞춘다
      const distance = Math.abs(seconds - TARGET_SECONDS);
      score = Math.max(0, 100 - Math.round(distance * 50)); // 숫자 모드는 더 정밀하게
    }

    setResult(score);

    // 점수 등장 애니메이션
    setTimeout(() => {
      gsap.fromTo(
        ".result-score",
        { scale: 0, rotation: -20 },
        { scale: 1.2, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }
      );
    }, 50);
  };

  const getResultText = (score: number) => {
    if (score >= 99) return "🎯 신의 경지!";
    if (score >= 95) return "🔥 대단해요!";
    if (score >= 80) return "👍 훌륭합니다!";
    return "😅 조금만 더!";
  };

  return (
    <GameLayout title="타이밍캐치">
      <div className="flex flex-col items-center gap-8 p-6">
        {/* 모드 선택 탭 */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-veil/10 backdrop-blur-md">
          {(["number", "bar"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setIsPlaying(false);
                setResult(null);
              }}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-strong"
              }`}
            >
              {m === "bar" ? "막대 타이밍" : "10.00초 도전"}
            </button>
          ))}
        </div>

        {/* 메인 게임 카드 */}
        <div className="game-card w-full max-w-md bg-slate-800 rounded-[2rem] p-10 flex flex-col items-center gap-8 border border-veil/5 shadow-2xl shadow-black/50 relative overflow-hidden">
          {mode === "bar" ? (
            <div className="w-full flex flex-col gap-6">
              <div className="text-center text-slate-300 font-medium">
                중앙 라인에 맞춰 멈추세요!
              </div>
              <div className="bar-container w-full h-24 bg-slate-950 rounded-2xl relative overflow-hidden border-4 border-slate-700 shadow-inner">
                {/* 배경 가이드 라인 */}
                <div className="absolute inset-y-0 left-1/4 w-px bg-veil/5"></div>
                <div className="absolute inset-y-0 left-3/4 w-px bg-veil/5"></div>

                {/* 중앙 타겟 라인 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-yellow-400 z-10 -translate-x-1/2 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />

                {/* 움직이는 막대 */}
                <div
                  className={`absolute top-0 bottom-0 w-3 shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-colors ${
                    isPlaying ? "bg-blue-500" : "bg-red-500"
                  }`}
                  style={{
                    left: `${barPosition}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-slate-300 font-medium">
                목표: {TARGET_SECONDS.toFixed(2)}초
              </div>
              <div
                className={`text-8xl font-black font-mono transition-colors duration-300 ${
                  numberValue > 9 ? "text-red-500" : "text-blue-400"
                }`}
              >
                {numberValue.toFixed(2)}
              </div>
              <div className="w-full max-w-[200px] h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-75"
                  style={{
                    width: `${Math.min(
                      100,
                      (numberValue / TARGET_SECONDS) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result !== null && (
            <div className="result-score text-center">
              <div className="text-6xl font-black text-yellow-400 mb-2 drop-shadow-lg">
                {result}점
              </div>
              <div className="text-xl text-strong font-bold">
                {getResultText(result)}
              </div>
            </div>
          )}

          {/* 실행 버튼 */}
          <button
            onClick={isPlaying ? handleStop : handleStart}
            className={`w-full py-5 rounded-2xl text-2xl font-black transition-all transform active:scale-95 shadow-xl text-white ${
              isPlaying
                ? "bg-gradient-to-r from-red-500 to-pink-600 animate-pulse"
                : "bg-gradient-to-r from-emerald-500 to-teal-600"
            }`}
          >
            {isPlaying ? "멈춰!!!" : result !== null ? "다시 도전" : "시작하기"}
          </button>
        </div>

        <div className="text-slate-500 text-sm font-medium bg-slate-900/30 px-4 py-2 rounded-full">
          {mode === "bar"
            ? "정밀도: 0.01% 단위 체크"
            : "정밀도: 0.02초 단위 체크"}
        </div>
      </div>
    </GameLayout>
  );
}
