import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw" | null;

export default function RockPaperScissorsPage() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>("rock");
  const [result, setResult] = useState<Result>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cycleIntervalRef = useRef<number | null>(null);

  const choices = {
    rock: { emoji: "✊", name: "묵" },
    paper: { emoji: "✋", name: "빠" },
    scissors: { emoji: "✌️", name: "찌" },
  };

  // 컴퓨터 선택 순환 효과
  useEffect(() => {
    if (!playerChoice) {
      const options: Choice[] = ["rock", "paper", "scissors"];
      let index = 0;
      
      cycleIntervalRef.current = window.setInterval(() => {
        setComputerChoice(options[index]);
        index = (index + 1) % 3;
      }, 100);
    }

    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    };
  }, [playerChoice]);

  const getRandomChoice = (): Choice => {
    const options: Choice[] = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * 3);
    return options[randomIndex];
  };

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return "draw";
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win";
    }
    return "lose";
  };

  const handleChoice = (choice: Choice) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setPlayerChoice(choice);
    
    // 순환 멈추고 즉시 컴퓨터 선택 확정
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
    }
    
    const finalComputerChoice = getRandomChoice();
    setComputerChoice(finalComputerChoice);
    
    // 결과 판정
    setTimeout(() => {
      const gameResult = determineWinner(choice, finalComputerChoice);
      setResult(gameResult);
      setIsPlaying(false);
    }, 500);
  };

  const reset = () => {
    setPlayerChoice(null);
    setComputerChoice("rock");
    setResult(null);
    setIsPlaying(false);
  };

  const getResultText = () => {
    if (!result) return "";
    if (result === "win") return "🎉 당신이 이겼습니다!";
    if (result === "lose") return "😢 컴퓨터가 이겼습니다!";
    return "🤝 비겼습니다!";
  };

  const getResultColor = () => {
    if (!result) return "text-white";
    if (result === "win") return "text-green-400";
    if (result === "lose") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <GameLayout title="안내면진거">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {/* 컴퓨터 선택 */}
        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">컴퓨터</div>
          <div className={`w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center text-7xl transition-all ${
            !playerChoice ? "animate-pulse" : ""
          }`}>
            {choices[computerChoice].emoji}
          </div>
          {playerChoice && (
            <div className="text-white text-lg mt-2">
              {choices[computerChoice].name}
            </div>
          )}
        </div>

        {/* 결과 */}
        {result && (
          <div className={`text-2xl font-bold ${getResultColor()} animate-bounce`}>
            {getResultText()}
          </div>
        )}

        {/* 플레이어 선택 */}
        <div className="text-center">
          <div className="text-slate-400 text-sm mb-2">나</div>
          <div className="w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center text-7xl">
            {playerChoice ? choices[playerChoice].emoji : "❓"}
          </div>
          {playerChoice && (
            <div className="text-white text-lg mt-2">
              {choices[playerChoice].name}
            </div>
          )}
        </div>

        {/* 선택 버튼 */}
        {!playerChoice ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleChoice("rock")}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-xl text-4xl flex items-center justify-center transition-colors"
            >
              ✊
            </button>
            <button
              onClick={() => handleChoice("paper")}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-xl text-4xl flex items-center justify-center transition-colors"
            >
              ✋
            </button>
            <button
              onClick={() => handleChoice("scissors")}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-xl text-4xl flex items-center justify-center transition-colors"
            >
              ✌️
            </button>
          </div>
        ) : (
          <button
            onClick={reset}
            disabled={isPlaying}
            className="px-8 py-4 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 text-white font-bold rounded-xl"
          >
            다시하기
          </button>
        )}
      </div>
    </GameLayout>
  );
}