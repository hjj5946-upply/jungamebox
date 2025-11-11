import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

type Mode = "bar" | "number";

export default function TimingPage() {
  const [mode, setMode] = useState<Mode>("bar");
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // 막대 타이밍 상태
  const [barPosition, setBarPosition] = useState(50); // 0~100
  const barDirection = useRef(1); // 1: 오른쪽, -1: 왼쪽
  const barSpeed = 2.2; // 속도 증가!

  // 숫자 타이밍 상태
  const [numberValue, setNumberValue] = useState(0);
  const targetNumber = 10.0;
  const startTime = useRef<number>(0);

  const animationRef = useRef<number | undefined>(undefined);

  // 막대 애니메이션
  useEffect(() => {
    if (mode === "bar" && isPlaying) {
      const animate = () => {
        setBarPosition((prev) => {
          let next = prev + barSpeed * barDirection.current;
          if (next >= 100) {
            next = 100;
            barDirection.current = -1;
          } else if (next <= 0) {
            next = 0;
            barDirection.current = 1;
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [mode, isPlaying]);

  // 숫자 애니메이션 (실제 시간 기반)
  useEffect(() => {
    if (mode === "number" && isPlaying) {
      startTime.current = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = (currentTime - startTime.current) / 1000; // 초 단위
        
        if (elapsed >= targetNumber * 2) {
          // 20초 넘으면 리셋
          startTime.current = currentTime;
          setNumberValue(0);
        } else {
          setNumberValue(elapsed);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [mode, isPlaying]);

  const handleStart = () => {
    setIsPlaying(true);
    setResult(null);
    if (mode === "bar") {
      setBarPosition(50);
      barDirection.current = 1;
    } else {
      setNumberValue(0);
      startTime.current = performance.now();
    }
  };

  const handleStop = () => {
    if (!isPlaying) return;
    setIsPlaying(false);

    if (mode === "bar") {
      const pos = Math.round(barPosition * 100) / 100; // 위치값을 2자리로 고정
      if (pos === 50) {
        setResult(100); // 오직 50.00%에서만 100점
      } else {
        const distance = Math.abs(pos - 50); // 0.01% 단위 정밀도
        // 거리 0.5%면 99점, 1%면 98점… (원하면 가중치 조정 가능)
        const score = Math.max(0, 100 - Math.round(distance * 2));
        setResult(score);
      }
    }
  };

  const getResultText = (score: number) => {
    if (score === 100) return "🎯 완벽해!"; // 100점일 때만!
    if (score >= 95) return "👏 거의 완벽!";
    if (score >= 80) return "👍 훌륭해!";
    if (score >= 60) return "😊 괜찮아!";
    if (score >= 40) return "🤔 아쉬워!";
    return "😅 다시 도전!";
  };

  return (
    <GameLayout title="타이밍캐치">
      <div className="flex flex-col items-center gap-6 p-4">
        {/* 탭 */}
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => {
              setMode("bar");
              setIsPlaying(false);
              setResult(null);
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === "bar"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            막대 타이밍
          </button>
          <button
            onClick={() => {
              setMode("number");
              setIsPlaying(false);
              setResult(null);
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === "number"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            10.00 도전
          </button>
        </div>

        {/* 게임 영역 */}
        <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 flex flex-col items-center gap-6">
          {mode === "bar" ? (
            <>
              {/* 막대 타이밍 */}
              <div className="text-white text-lg font-semibold">
                막대를 정확히 가운데에 멈춰보세요!
              </div>
              <div className="w-full h-20 bg-slate-700 rounded-lg relative overflow-hidden">
                {/* 중앙 타겟 라인 (굵기 동일 + 중앙 정렬) */}
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-[8px] bg-yellow-400 z-10 transform -translate-x-1/2"
                />

                {/* 움직이는 막대 (굵기 동일) */}
                <div
                  className="absolute top-0 bottom-0 w-[8px] bg-blue-500"
                  style={{ left: `${barPosition}%`, transform: "translateX(-50%)" }}
                />
              </div>
            </>
          ) : (
            <>
              {/* 10.00 도전 */}
              <div className="text-white text-lg font-semibold">
                정확히 {targetNumber.toFixed(2)}초에 멈춰보세요!
              </div>
              <div className="text-6xl font-bold text-blue-400 font-mono">
                {numberValue.toFixed(2)}
              </div>
              <div className="text-slate-400 text-sm">
                목표: {targetNumber.toFixed(2)}초
              </div>
            </>
          )}

          {/* 결과 */}
          {result !== null && (
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {result}점
              </div>
              <div className="text-xl text-white">{getResultText(result)}</div>
            </div>
          )}

          {/* 버튼 */}
          {!isPlaying ? (
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              {result !== null ? "다시 시작" : "시작"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 animate-pulse"
            >
              멈춰!
            </button>
          )}
        </div>

        {/* 설명 */}
        <div className="text-slate-400 text-sm text-center">
          {mode === "bar"
            ? "막대가 중앙 노란색 라인에 가까울수록 높은 점수!"
            : "정확히 10.00초를 맞춰야 100점!"}
        </div>
      </div>
    </GameLayout>
  );
}