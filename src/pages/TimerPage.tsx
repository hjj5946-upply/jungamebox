//src/pages/TimerPage.tsx
import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

type Tab = "stopwatch" | "timer";
type LapTime = { id: number; time: number; lap: number };
type TimerField = "hours" | "minutes" | "seconds" | null;

export default function TimerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("stopwatch");

  // 스톱워치 상태
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const [lapCounter, setLapCounter] = useState(0);
  const stopwatchIntervalRef = useRef<number | null>(null);

  // 타이머 상태
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");
  const [selectedField, setSelectedField] = useState<TimerField>(null);
  const [timerLeft, setTimerLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // 비프음 재생 함수
  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // 주파수 (Hz)
    oscillator.type = "sine"; // 파형 종류 (부드러운 소리)
    gainNode.gain.value = 0.3; // 볼륨

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2); // 0.2초 동안 재생
  };

  // 3번 연속 비프음
  const playTripleBeep = () => {
    playBeep();
    setTimeout(() => playBeep(), 200);
    setTimeout(() => playBeep(), 400);
  };

  // 스톱워치 효과
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = window.setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // 타이머 효과
  useEffect(() => {
    if (isTimerRunning && timerLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // 비프음 재생
            playTripleBeep();
            alert("⏰ 시간이 종료되었습니다!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerLeft]);

  // 스톱워치 포맷 (MM:SS.MS)
  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`;
  };

  // 타이머 포맷 (HH:MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // 스톱워치 함수
  const startStopwatch = () => setIsStopwatchRunning(true);
  const stopStopwatch = () => setIsStopwatchRunning(false);
  const resetStopwatch = () => {
    setStopwatchTime(0);
    setLaps([]);
    setLapCounter(0);
  };
  const recordLap = () => {
    const newLapCounter = lapCounter + 1;
    setLaps([{ id: Date.now(), time: stopwatchTime, lap: newLapCounter }, ...laps]);
    setLapCounter(newLapCounter);
    playBeep(); // 구간기록 시 한번 삐
  };

  // 타이머 함수
  const handleFieldClick = (field: TimerField) => {
    if (isTimerRunning || timerLeft > 0) return;
    setSelectedField(field);
  };

  const addDigitToField = (digit: string) => {
    if (!selectedField) return;

    if (selectedField === "hours") {
      const newValue = (timerHours + digit).slice(-2);
      setTimerHours(newValue);
    } else if (selectedField === "minutes") {
      const newValue = (timerMinutes + digit).slice(-2);
      const numValue = parseInt(newValue);
      if (numValue <= 59) setTimerMinutes(newValue);
    } else if (selectedField === "seconds") {
      const newValue = (timerSeconds + digit).slice(-2);
      const numValue = parseInt(newValue);
      if (numValue <= 59) setTimerSeconds(newValue);
    }
  };

  const deleteDigitFromField = () => {
    if (!selectedField) return;

    if (selectedField === "hours") {
      setTimerHours("0" + timerHours.slice(0, -1));
    } else if (selectedField === "minutes") {
      setTimerMinutes("0" + timerMinutes.slice(0, -1));
    } else if (selectedField === "seconds") {
      setTimerSeconds("0" + timerSeconds.slice(0, -1));
    }
  };

  const startTimer = () => {
    const hours = parseInt(timerHours);
    const minutes = parseInt(timerMinutes);
    const seconds = parseInt(timerSeconds);
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total > 0) {
      setTimerLeft(total);
      setIsTimerRunning(true);
      setSelectedField(null);
    }
  };

  const pauseTimer = () => setIsTimerRunning(false);
  const resumeTimer = () => setIsTimerRunning(true);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerLeft(0);
    setTimerHours("00");
    setTimerMinutes("00");
    setTimerSeconds("00");
    setSelectedField(null);
  };

  return (
    <GameLayout title="타이머">
      <div className="flex flex-col h-full">
        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("stopwatch")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "stopwatch"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            스톱워치
          </button>
          <button
            onClick={() => setActiveTab("timer")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "timer"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            타이머
          </button>
        </div>

        {/* 스톱워치 */}
        {activeTab === "stopwatch" && (
          <div className="flex-1 flex flex-col items-center justify-between">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-6xl font-bold text-white">
                {formatStopwatch(stopwatchTime)}
              </div>
            </div>

            {/* 구간 기록 목록 */}
            {laps.length > 0 && (
              <div className="w-full max-h-40 overflow-y-auto mb-4 bg-slate-800 rounded-lg p-3">
                {laps.map((lap) => (
                  <div key={lap.id} className="flex justify-between text-slate-300 py-1">
                    <span>구간 {lap.lap}</span>
                    <span>{formatStopwatch(lap.time)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-4 w-full">
              {!isStopwatchRunning && stopwatchTime === 0 ? (
                <button
                  onClick={startStopwatch}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                >
                  시작
                </button>
              ) : isStopwatchRunning ? (
                <>
                  <button
                    onClick={recordLap}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                  >
                    구간기록
                  </button>
                  <button
                    onClick={stopStopwatch}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                  >
                    중지
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={resetStopwatch}
                    className="flex-1 py-4 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl"
                  >
                    초기화
                  </button>
                  <button
                    onClick={startStopwatch}
                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                  >
                    계속
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 타이머 */}
        {activeTab === "timer" && (
          <div className="flex-1 flex flex-col items-center justify-between">
            {/* 시간 표시 */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              {timerLeft > 0 ? (
                <div className="text-6xl font-bold text-white">
                  {formatTimer(timerLeft)}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                    <span>시간</span>
                    <span className="mx-8">분</span>
                    <span className="ml-2">초</span>
                  </div>
                  <div className="flex items-center gap-2 text-6xl font-bold">
                    <button
                      onClick={() => handleFieldClick("hours")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedField === "hours"
                          ? "bg-blue-600 text-white"
                          : "text-white hover:bg-slate-800"
                      }`}
                    >
                      {timerHours}
                    </button>
                    <span className="text-white">:</span>
                    <button
                      onClick={() => handleFieldClick("minutes")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedField === "minutes"
                          ? "bg-blue-600 text-white"
                          : "text-white hover:bg-slate-800"
                      }`}
                    >
                      {timerMinutes}
                    </button>
                    <span className="text-white">:</span>
                    <button
                      onClick={() => handleFieldClick("seconds")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedField === "seconds"
                          ? "bg-blue-600 text-white"
                          : "text-white hover:bg-slate-800"
                      }`}
                    >
                      {timerSeconds}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 숫자 패드 (필드 선택 시에만 표시) */}
            {selectedField && timerLeft === 0 && !isTimerRunning && (
              <div className="grid grid-cols-3 gap-3 mb-4 w-full max-w-xs">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => addDigitToField(String(num))}
                    className="py-4 bg-slate-800 hover:bg-slate-700 text-white text-2xl font-bold rounded-xl"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={deleteDigitFromField}
                  className="py-4 bg-slate-800 hover:bg-slate-700 text-white text-2xl font-bold rounded-xl"
                >
                  ⌫
                </button>
                <button
                  onClick={() => addDigitToField("0")}
                  className="py-4 bg-slate-800 hover:bg-slate-700 text-white text-2xl font-bold rounded-xl"
                >
                  0
                </button>
                <button
                  onClick={() => setSelectedField(null)}
                  className="py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl"
                >
                  ✓
                </button>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-4 w-full">
              {timerLeft === 0 && !isTimerRunning ? (
                <button
                  onClick={startTimer}
                  disabled={timerHours === "00" && timerMinutes === "00" && timerSeconds === "00"}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold rounded-xl"
                >
                  시작
                </button>
              ) : isTimerRunning ? (
                <>
                  <button
                    onClick={resetTimer}
                    className="flex-1 py-4 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl"
                  >
                    취소
                  </button>
                  <button
                    onClick={pauseTimer}
                    className="flex-1 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl"
                  >
                    일시정지
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={resetTimer}
                    className="flex-1 py-4 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl"
                  >
                    초기화
                  </button>
                  <button
                    onClick={resumeTimer}
                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                  >
                    계속
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}