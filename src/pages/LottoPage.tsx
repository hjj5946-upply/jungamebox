//src/pages/LottoPage.tsx
import { useState } from "react";
import GameLayout from "../layouts/GameLayout";

export default function LottoPage() {
  const [numbers, setNumbers] = useState<(number | null)[]>(Array(6).fill(null));
  const [gamblingNumbers, setGamblingNumbers] = useState<(number | null)[]>(Array(6).fill(null));
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState<number[][]>([]);

  const drawNumbers = () => {
    if (isDrawing) return;

    setIsDrawing(true);
    setNumbers(Array(6).fill(null));
    setGamblingNumbers(Array(6).fill(null));

    // 1~45 번호 배열 생성
    const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1);
    const drawn: number[] = [];

    // 6개 번호 뽑기
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      const selectedNumber = allNumbers[randomIndex];
      drawn.push(selectedNumber);
      allNumbers.splice(randomIndex, 1);
    }

    // 번호 정렬
    drawn.sort((a, b) => a - b);

    // 겜블 효과 - 모든 공이 빠르게 숫자 변경
    let gambleCount = 0;
    const maxGambleCount = 20; // 겜블 횟수
    const gamblingInterval = setInterval(() => {
      const tempNumbers = drawn.map(() => Math.floor(Math.random() * 45) + 1);
      setGamblingNumbers([...tempNumbers]);
      gambleCount++;

      if (gambleCount >= maxGambleCount) {
        clearInterval(gamblingInterval);
        
        // 겜블이 끝나면 모든 겜블 번호를 먼저 제거
        setGamblingNumbers(Array(6).fill(null));
        
        // 그 다음 실제 번호를 하나씩 표시
        let index = 0;
        const revealInterval = setInterval(() => {
          if (index < drawn.length) {
            const currentIndex = index;
            setNumbers(prev => {
              const newNumbers = [...prev];
              newNumbers[currentIndex] = drawn[currentIndex];
              return newNumbers;
            });
            index++;
          } else {
            clearInterval(revealInterval);
            setIsDrawing(false);
            setDrawHistory(prev => [drawn, ...prev.slice(0, 4)]); // 최근 5개만 저장
          }
        }, 400); // 각 번호 표시 간격
      }
    }, 80); // 겜블 속도 (빠르게 변경)
  };

  const reset = () => {
    setNumbers(Array(6).fill(null));
    setGamblingNumbers(Array(6).fill(null));
    setDrawHistory([]);
    setIsDrawing(false);
  };

  const getNumberColor = (num: number) => {
    if (num <= 10) return "bg-yellow-500";
    if (num <= 20) return "bg-blue-500";
    if (num <= 30) return "bg-red-500";
    if (num <= 40) return "bg-gray-500";
    return "bg-green-500";
  };

  return (
    <GameLayout title="로또번호생성">
      <div className="flex flex-col h-full gap-6">
        {/* 번호 표시 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {numbers.every(n => n === null) && !isDrawing && (
            <div className="text-slate-400 text-lg text-center">
              로또 번호를 뽑아보세요!
              <br />
              <span className="text-sm">1~45 중 6개 숫자</span>
            </div>
          )}

          {/* 번호 공들 - 위 아래 3개씩 배치 */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => {
              const number = numbers[index];
              const gamblingNumber = gamblingNumbers[index];
              const isGambling = gamblingNumber !== null;
              const isRevealed = number !== null;

              // 표시할 숫자 결정: 공개되었으면 항상 실제 번호, 아니면 겜블 번호 또는 null
              let displayNumber: number | null = null;
              if (isRevealed && number !== null) {
                displayNumber = number;
              } else if (isGambling && gamblingNumber !== null) {
                displayNumber = gamblingNumber;
              }

              return (
                <div
                  key={index}
                  // 배경이 getNumberColor()의 유채색 공이므로 테마와 무관하게 흰 글자 유지
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-200 shadow-lg ${
                    isRevealed
                      ? `${getNumberColor(number!)} scale-100 opacity-100 animate-bounce`
                      : isGambling
                      ? "bg-purple-600 scale-100 opacity-100 animate-pulse"
                      : "bg-slate-700 scale-50 opacity-0"
                  }`}
                >
                  {displayNumber !== null ? displayNumber : "?"}
                </div>
              );
            })}
          </div>

          {/* 뽑는 중 표시 */}
          {isDrawing && numbers.every(n => n === null) && (
            <div className="text-purple-400 text-lg animate-pulse font-bold">
              ⚡ 번호를 뽑는 중...
            </div>
          )}

          {/* 결과 표시 */}
          {numbers.every(n => n !== null) && !isDrawing && (
            <div className="text-yellow-400 text-xl font-bold animate-bounce">
              🎉 로또 번호 완성! 🎉
            </div>
          )}
        </div>

        {/* 뽑은 번호 상세 */}
        {numbers.every(n => n !== null) && !isDrawing && (
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-strong text-sm font-semibold mb-2">뽑은 번호:</div>
            <div className="flex gap-2 flex-wrap">
              {numbers.filter(n => n !== null).map((num, index) => (
                <div
                  key={index}
                  className={`${getNumberColor(num!)} text-white px-4 py-2 rounded-full font-bold`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 이전 뽑기 기록 */}
        {drawHistory.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-2">
            <div className="text-strong text-sm font-semibold">이전 뽑기:</div>
            <div className="space-y-2">
              {drawHistory.map((history, historyIndex) => (
                <div
                  key={historyIndex}
                  className="flex gap-2 flex-wrap bg-slate-800 rounded-lg p-3"
                >
                  {history.map((num, index) => (
                    <div
                      key={index}
                      className={`${getNumberColor(num)} text-white px-3 py-1 rounded-full text-sm font-bold`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={drawNumbers}
            disabled={isDrawing}
            className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDrawing ? "뽑는 중..." : "로또 번호 뽑기"}
          </button>
          {(numbers.some(n => n !== null) || drawHistory.length > 0) && (
            <button
              onClick={reset}
              disabled={isDrawing}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              리셋
            </button>
          )}
        </div>
      </div>
    </GameLayout>
  );
}

