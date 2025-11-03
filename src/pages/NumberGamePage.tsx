import { useState, useEffect } from "react";
import GameLayout from "../layouts/GameLayout";

export default function NumberGamePage() {
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const GRID_SIZE = 16;
  const MAX_NUMBER = 48;

  useEffect(() => {
    initializeGame();
  }, []);

  // 타이머
  useEffect(() => {
    if (!isPlaying || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 10);

    return () => clearInterval(interval);
  }, [isPlaying, startTime]);

  const initializeGame = () => {
    // 1~16 랜덤 배치
    const numbers = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    setGrid(shuffled);
    setCurrentNumber(1);
    setIsPlaying(false);
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
  };

  const handleNumberClick = (index: number, value: number | null) => {
    if (value !== currentNumber) return;

    // 첫 클릭 시 타이머 시작
    if (currentNumber === 1) {
      setIsPlaying(true);
      setStartTime(Date.now());
    }

    const newGrid = [...grid];
    const nextNumber = currentNumber + GRID_SIZE;

    if (nextNumber <= MAX_NUMBER) {
      // 다음 번호로 교체
      newGrid[index] = nextNumber;
    } else {
      // 33~48은 사라짐
      newGrid[index] = null;
    }

    setGrid(newGrid);
    setCurrentNumber(currentNumber + 1);

    // 게임 종료 (48까지 완료)
    if (currentNumber === MAX_NUMBER) {
      setIsPlaying(false);
      setEndTime(Date.now());
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${String(milliseconds).padStart(2, "0")}초`;
  };

  const getButtonColor = (value: number | null) => {
    if (value === null) return "bg-slate-800";
    if (value === currentNumber) return "bg-blue-700 shadow-lg";
    return "bg-blue-600";
  };

  return (
    <GameLayout title="1 to 48">
      <div className="flex flex-col h-full gap-6 py-4">
        {/* 상태 표시 */}
        <div className="flex justify-between items-center px-4">
          <div className="text-white text-2xl font-bold">
            {endTime ? "완료!" : `다음: ${currentNumber}`}
          </div>
          <div className="text-yellow-400 text-2xl font-bold">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* 그리드 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-3 w-full max-w-md px-4">
            {grid.map((value, index) => (
              <button
                key={index}
                onClick={() => handleNumberClick(index, value)}
                disabled={value === null}
                className={`aspect-square rounded-xl text-2xl font-bold transition-all ${getButtonColor(
                    value
                )} text-white ${
                    value === null ? "cursor-default" : "cursor-pointer hover:scale-105"
                }`}
                >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 또는 다시하기 */}
        {endTime ? (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mx-4">
            <div className="text-white text-center">
              <div className="text-3xl font-bold mb-2">🎉 클리어!</div>
              <div className="text-5xl font-bold mb-2">
                {formatTime(endTime - (startTime || 0))}
              </div>
              <div className="text-sm text-slate-200">기록 달성!</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm px-4">
            {isPlaying ? "1부터 순서대로 누르세요!" : "1번을 눌러서 시작하세요"}
          </div>
        )}

        {/* 다시하기 버튼 */}
        <button
          onClick={initializeGame}
          className="mx-4 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
        >
          다시하기
        </button>
      </div>
    </GameLayout>
  );
}