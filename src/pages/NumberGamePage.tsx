import { useState, useEffect, useRef, type ChangeEvent } from "react";
import GameLayout from "../layouts/GameLayout";
import SpeedLeaderboardPanel from "../components/SpeedLeaderboardPanel";
import { recordSpeedScore } from "../lib/speedrun";
import { validateNickname, NICKNAME_MAX } from "../lib/nickname";

const FLASH_MS = 220; // 정답을 눌렀을 때 효과가 유지되는 시간
const GRID_SIZE = 16;
const MAX_NUMBER = 48;

export default function NumberGamePage() {
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  // 방금 정답으로 누른 칸 (여기에만 색·효과를 준다)
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  // 한 판에 기록이 두 번 올라가는 것을 막는 가드
  const savedRef = useRef(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    []
  );

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
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlashIndex(null);
    savedRef.current = false;
  };

  const onChangeNickname = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setNicknameError(validateNickname(value));
  };

  // 닉네임이 유효해야 시작할 수 있다 (반사신경과 같은 방식)
  const locked = !!validateNickname(nickname) && !isPlaying && !endTime;

  const handleNumberClick = (index: number, value: number | null) => {
    if (value !== currentNumber) return;
    if (locked) return;

    // 정답을 눌렀을 때만 그 칸에 색과 효과를 낸다
    setFlashIndex(index);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(
      () => setFlashIndex(null),
      FLASH_MS
    );

    // 첫 클릭 시 타이머 시작
    let begunAt = startTime;
    if (currentNumber === 1) {
      begunAt = Date.now();
      setIsPlaying(true);
      setStartTime(begunAt);
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
      const finished = Date.now();
      const ms = finished - (begunAt ?? finished);
      setIsPlaying(false);
      setEndTime(finished);
      // 헤더 타이머도 최종값으로 맞춘다 (결과 카드와 어긋나지 않게)
      setElapsedTime(ms);

      if (!savedRef.current) {
        savedRef.current = true;
        recordSpeedScore(ms, nickname.trim() || "NONAME").catch((err) =>
          console.error("[Speed] failed to save score", err)
        );
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${String(milliseconds).padStart(2, "0")}초`;
  };

  /* 찾아야 할 번호를 미리 칠하면 눈으로 찾을 필요가 없어져서 게임이 안 된다.
   * 그래서 남은 칸은 전부 같은 색으로 두고, 방금 정답으로 누른 칸에만
   * 색과 효과(확대 + 링)를 준다. */
  const getButtonColor = (value: number | null, index: number) => {
    if (index === flashIndex) {
      return "bg-emerald-500 scale-110 ring-4 ring-emerald-300/50 z-10";
    }
    if (value === null) return "bg-slate-800";
    return "bg-blue-600";
  };

  if (showRanking) {
    return (
      <GameLayout title="1 to 48">
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              🏆 1 to 48 랭킹 (상위 10개)
            </h2>
            <button
              onClick={() => setShowRanking(false)}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-[12px] text-slate-100 transition hover:bg-slate-700"
            >
              닫기
            </button>
          </div>
          <SpeedLeaderboardPanel />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="1 to 48">
      <div className="flex h-full flex-col gap-3 py-2">
        {/* 닉네임 + 랭킹 버튼 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="min-w-0 text-[11px] text-slate-300">
              닉네임 (한글/영문 {NICKNAME_MAX}자 이하)
            </label>
            {nicknameError && (
              <span className="ml-2 whitespace-nowrap text-[11px] text-red-400">
                {nicknameError}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nickname}
              onChange={onChangeNickname}
              disabled={isPlaying}
              // min-w-0: 없으면 input 의 기본 min-content 폭 때문에 좁은 화면에서 행이 넘친다
              className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
              maxLength={NICKNAME_MAX}
              placeholder="닉네임을 입력하세요"
            />
            <button
              onClick={() => setShowRanking(true)}
              className="shrink-0 whitespace-nowrap rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-600"
            >
              🏆 랭킹 보기
            </button>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-strong">
            {endTime ? "완료!" : `다음: ${currentNumber}`}
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* 그리드 */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className={`grid w-full max-w-md grid-cols-4 gap-3 transition-opacity ${
              locked ? "pointer-events-none opacity-40" : ""
            }`}
          >
            {grid.map((value, index) => (
              <button
                key={index}
                onClick={() => handleNumberClick(index, value)}
                disabled={value === null || locked}
                // relative: 확대된 칸이 옆 칸에 가리지 않도록 z-10 이 먹게 한다
                className={`relative aspect-square rounded-xl text-2xl font-bold transition-all ${getButtonColor(
                  value,
                  index
                )} text-white ${
                  value === null
                    ? "cursor-default"
                    : "cursor-pointer hover:scale-105"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 또는 안내 */}
        {endTime ? (
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-5">
            {/* 유채색 배경 위이므로 흰 글자 고정 */}
            <div className="text-center text-white">
              <div className="mb-1 text-2xl font-bold">🎉 클리어!</div>
              <div className="mb-1 text-4xl font-bold">
                {formatTime(endTime - (startTime || 0))}
              </div>
              <div className="text-xs text-white/80">
                {nickname.trim() || "NONAME"} · 기록이 랭킹에 반영되었습니다
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-slate-400">
            {locked
              ? "닉네임을 입력하면 시작할 수 있어요"
              : isPlaying
              ? "1부터 순서대로 누르세요!"
              : "1번을 눌러서 시작하세요"}
          </div>
        )}

        {/* 다시하기 버튼 */}
        <button
          onClick={initializeGame}
          className="rounded-xl bg-slate-700 py-4 font-bold text-strong transition-colors hover:bg-slate-600"
        >
          다시하기
        </button>
      </div>
    </GameLayout>
  );
}
