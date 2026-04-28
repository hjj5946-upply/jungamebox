import { useState, useEffect, useRef, useLayoutEffect } from "react";
import GameLayout from "../layouts/GameLayout";
import { gsap } from "gsap";

type Mode = "bar" | "number";

export default function TimingPage() {
  const [mode, setMode] = useState<Mode>("bar");
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // 막대 타이밍 상태
  const [barPosition, setBarPosition] = useState(50);
  const barDirection = useRef(1);
  const barSpeed = 2.5; // 약간 더 빠르게 조절

  // 숫자 타이밍 상태
  const [numberValue, setNumberValue] = useState(0);
  const targetNumber = 10.0;
  const startTime = useRef<number>(0);

  const animationRef = useRef<number | undefined>(undefined);
  const scope = useRef(null);

  // 모드 변경 시 초기화 애니메이션
  useLayoutEffect(() => {
    gsap.fromTo(".game-card", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" });
  }, [mode]);

  // 막대 애니메이션
  useEffect(() => {
    if (mode === "bar" && isPlaying) {
      const animate = () => {
        setBarPosition((prev) => {
          let next = prev + barSpeed * barDirection.current;
          if (next >= 100) { next = 100; barDirection.current = -1; }
          else if (next <= 0) { next = 0; barDirection.current = 1; }
          return next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }
  }, [mode, isPlaying]);

  // 숫자 애니메이션
  useEffect(() => {
    if (mode === "number" && isPlaying) {
      startTime.current = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = (currentTime - startTime.current) / 1000;
        setNumberValue(elapsed);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }
  }, [mode, isPlaying]);

  const handleStart = () => {
    setIsPlaying(true);
    setResult(null);
    if (mode === "bar") {
      setBarPosition(Math.random() * 100); // 시작 위치 랜덤화로 난이도 상승
    } else {
      setNumberValue(0);
    }
  };

  const handleStop = () => {
    if (!isPlaying) return;
    setIsPlaying(false);

    let score = 0;
    if (mode === "bar") {
      const distance = Math.abs(barPosition - 50);
      score = Math.max(0, 100 - Math.round(distance * 3));
      // 충돌 연출
      gsap.to(".bar-container", { x: 5, yoyo: true, repeat: 5, duration: 0.05 });
    } else {
      const distance = Math.abs(numberValue - targetNumber);
      score = Math.max(0, 100 - Math.round(distance * 50)); // 숫자 모드는 더 정밀하게
    }

    setResult(score);

    // 점수 등장 애니메이션
    setTimeout(() => {
      gsap.fromTo(".result-score", { scale: 0, rotation: -20 }, { scale: 1.2, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    }, 50);
  };

  const getResultText = (score: number) => {
    if (score >= 99) return "🎯 신의 경지!";
    if (score >= 95) return "🔥 대단해요!";
    if (score >= 80) return "👍 훌륭합니다!";
    return "😅 조금만 더!";
  };

  return (
    <GameLayout title="타이밍 캐치 | J GameBox">
      <div ref={scope} className="flex flex-col items-center gap-8 p-6">
        
        {/* 모드 선택 탭 */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {["bar", "number"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m as Mode); setIsPlaying(false); setResult(null); }}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
                mode === m ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              {m === "bar" ? "막대 타이밍" : "10.00초 도전"}
            </button>
          ))}
        </div>

        {/* 메인 게임 카드 */}
        <div className="game-card w-full max-w-md bg-slate-800 rounded-[2rem] p-10 flex flex-col items-center gap-8 border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden">
          
          {mode === "bar" ? (
            <div className="w-full flex flex-col gap-6">
              <div className="text-center text-slate-300 font-medium">중앙 라인에 맞춰 멈추세요!</div>
              <div className="bar-container w-full h-24 bg-slate-950 rounded-2xl relative overflow-hidden border-4 border-slate-700 shadow-inner">
                {/* 배경 가이드 라인 */}
                <div className="absolute inset-y-0 left-1/4 w-px bg-white/5"></div>
                <div className="absolute inset-y-0 left-3/4 w-px bg-white/5"></div>
                
                {/* 중앙 타겟 라인 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-yellow-400 z-10 -translate-x-1/2 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />

                {/* 움직이는 막대 */}
                <div
                  className={`absolute top-0 bottom-0 w-3 shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-colors ${isPlaying ? 'bg-blue-500' : 'bg-red-500'}`}
                  style={{ left: `${barPosition}%`, transform: "translateX(-50%)" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-slate-300 font-medium">목표: {targetNumber.toFixed(2)}초</div>
              <div className={`text-8xl font-black font-mono transition-colors duration-300 ${numberValue > 9 ? 'text-red-500' : 'text-blue-400'}`}>
                {numberValue.toFixed(2)}
              </div>
              <div className="w-full max-w-[200px] h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-75" 
                  style={{ width: `${(numberValue / targetNumber) * 100}%` }} 
                />
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result !== null && (
            <div className="result-score text-center">
              <div className="text-6xl font-black text-yellow-400 mb-2 drop-shadow-lg">{result}점</div>
              <div className="text-xl text-white font-bold">{getResultText(result)}</div>
            </div>
          )}

          {/* 실행 버튼 */}
          <button
            onClick={isPlaying ? handleStop : handleStart}
            className={`w-full py-5 rounded-2xl text-2xl font-black transition-all transform active:scale-95 shadow-xl ${
              isPlaying 
                ? "bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse" 
                : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            }`}
          >
            {isPlaying ? "멈춰!!!" : (result !== null ? "다시 도전" : "시작하기")}
          </button>
        </div>

        <div className="text-slate-500 text-sm font-medium bg-slate-900/30 px-4 py-2 rounded-full">
           {mode === "bar" ? "정밀도: 0.01% 단위 체크" : "정밀도: 0.02초 단위 체크"}
        </div>
      </div>
    </GameLayout>
  );
}