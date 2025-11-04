import { useState } from "react";
import GameLayout from "../layouts/GameLayout";
import coinImage from "/coin_flip.png";

export default function CoinFlipPage() {
  const [result, setResult] = useState<"앞면" | "뒷면" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipCoin = () => {
    if (isFlipping) return; // 던지는 중이면 무시
    
    setIsFlipping(true);
    setResult(null);

    // 애니메이션 시간
    setTimeout(() => {
      const random = Math.random() < 0.5 ? "앞면" : "뒷면";
      setResult(random);
      setIsFlipping(false);
    }, 1000);
  };

  return (
    <GameLayout title="앞?뒤?">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {/* 코인 영역 */}
        <div 
          onClick={flipCoin}
          className={`relative w-48 h-48 cursor-pointer hover:scale-105 transition-transform ${
            isFlipping ? "animate-spin" : ""
          }`}
        >
          <img
            src={coinImage}
            alt="coin"
            className={`w-full h-full object-contain transition-transform duration-500 ${
              result === "뒷면" ? "scale-x-[-1]" : ""
            }`}
          />
          {!result && (
            <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white drop-shadow-lg pointer-events-none">
              ?
            </div>
          )}
        </div>

        {/* 결과 텍스트 */}
        {result && !isFlipping && (
          <div className="text-2xl font-bold text-white animate-bounce">
            {result}!
          </div>
        )}

        {/* 안내 텍스트 */}
        <div className="text-slate-400 text-sm">
          {isFlipping ? "던지는 중..." : "코인을 클릭하세요"}
        </div>
      </div>
    </GameLayout>
  );
}