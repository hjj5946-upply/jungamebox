import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

type Choice = "rock" | "paper" | "scissors";

export default function RockPaperScissorsPage() {
  const [currentChoice, setCurrentChoice] = useState<Choice>("rock");
  const [result, setResult] = useState<Choice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cycleIntervalRef = useRef<number | null>(null);

  const choices = {
    rock: { emoji: "✊", name: "묵" },
    paper: { emoji: "✋", name: "빠" },
    scissors: { emoji: "✌️", name: "찌" },
  };

  // 자동 순환 효과 (결과 없을 때)
  useEffect(() => {
    if (!result && !isPlaying) {
      const options: Choice[] = ["rock", "paper", "scissors"];
      let index = 0;
      
      cycleIntervalRef.current = window.setInterval(() => {
        setCurrentChoice(options[index]);
        index = (index + 1) % 3;
      }, 200);
    }

    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    };
  }, [result, isPlaying]);

  const getRandomChoice = (): Choice => {
    const options: Choice[] = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * 3);
    return options[randomIndex];
  };

  const handlePlay = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    // 순환 멈추기
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
    }

    // 빠르게 순환하는 효과
    const options: Choice[] = ["rock", "paper", "scissors"];
    let index = 0;
    let count = 0;
    
    const fastCycle = setInterval(() => {
      setCurrentChoice(options[index]);
      index = (index + 1) % 3;
      count++;
      
      if (count > 15) {
        clearInterval(fastCycle);
        
        // 최종 결과 확정
        const finalChoice = getRandomChoice();
        setCurrentChoice(finalChoice);
        setResult(finalChoice);
        setIsPlaying(false);
      }
    }, 100);
  };

  const reset = () => {
    setResult(null);
    setCurrentChoice("rock");
    setIsPlaying(false);
  };

  return (
    <GameLayout title="가위바위보">
      <div className="flex flex-col h-full">
        
        {/* 메인 화면 - 클릭 영역 */}
        <div 
          className="relative flex-1 bg-gradient-to-b from-slate-800 to-slate-900 cursor-pointer flex items-center justify-center"
          onClick={result ? reset : handlePlay}
        >
          {/* 손모양 */}
          <div className={`text-center transition-all ${
            isPlaying ? "scale-110" : result ? "scale-125" : ""
          }`}>
            <div className={`text-[12rem] leading-none ${
              !result && !isPlaying ? "animate-pulse" : ""
            }`}>
              {choices[currentChoice].emoji}
            </div>
            
            {result && (
              <div className="text-white text-5xl font-bold mt-8 animate-bounce">
                {choices[result].name}
              </div>
            )}
          </div>

          {/* 안내 텍스트 */}
          {!result && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 text-slate-500 text-xl">
                화면을 클릭하세요
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 text-slate-400 text-xl pointer-events-none">
              선택 중...
            </div>
          )}

          {result && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-sm pointer-events-none">
              화면을 클릭하여 다시하기
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}