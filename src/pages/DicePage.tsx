//src/pages/DicePage.tsx
import { useState } from "react";
import GameLayout from "../layouts/GameLayout";

export default function DicePage() {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setResult(null);

    // 애니메이션 효과 (빠르게 숫자 변경)
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 6) + 1;
        setResult(final);
        setIsRolling(false);
      }
    }, 100);
  };

  const getDiceEmoji = (num: number | null) => {
    const diceMap: { [key: number]: string } = {
      1: "⚀",
      2: "⚁",
      3: "⚂",
      4: "⚃",
      5: "⚄",
      6: "⚅",
    };
    return num ? diceMap[num] : "🎲";
  };

  return (
    <GameLayout title="주사위">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {/* 주사위 영역 */}
        <div 
          onClick={rollDice}
          className={`cursor-pointer hover:scale-105 transition-transform ${
            isRolling ? "animate-bounce" : ""
          }`}
        >
          <div className="text-[16rem] leading-none text-white">
            {getDiceEmoji(result)}
          </div>
        </div>

        {/* 결과 텍스트 */}
        {result && !isRolling && (
          <div className="text-3xl font-bold text-white animate-bounce">
            {result}
          </div>
        )}

        {/* 안내 텍스트 */}
        <div className="text-slate-400 text-sm">
          {isRolling ? "굴리는 중..." : "주사위를 클릭하세요"}
        </div>
      </div>
    </GameLayout>
  );
}