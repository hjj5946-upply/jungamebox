//src/pages/TimerPage.tsx
import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

export default function TimerPage() {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // 타이머 종료 알림
            alert("⏰ 시간이 종료되었습니다!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;
    const totalSeconds = m * 60 + s;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setMinutes("");
    setSeconds("");
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <GameLayout title="타이머">
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {!isRunning && timeLeft === 0 ? (
          <>
            {/* 시간 설정 */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <div>
                <label className="block text-slate-300 mb-2">분</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg text-center text-2xl placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">초</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg text-center text-2xl placeholder-slate-600"
                />
              </div>
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={startTimer}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-lg"
            >
              시작
            </button>
          </>
        ) : (
          <>
            {/* 타이머 표시 */}
            <div className="text-8xl font-bold text-white">
              {formatTime(timeLeft)}
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex gap-4">
              {isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl text-lg shadow-lg"
                >
                  일시정지
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-lg"
                >
                  계속
                </button>
              )}
              <button
                onClick={resetTimer}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg shadow-lg"
              >
                리셋
              </button>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}