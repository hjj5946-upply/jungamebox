import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";
import { PHRASES } from "../data/phrases";
import type { Difficulty, Phrase } from "../data/phrases";

export default function ReadingPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);

  // 난이도별 문장 가져오기
  const getPhrasesByDifficulty = (diff: Difficulty) => {
    return PHRASES.filter((p) => p.difficulty === diff);
  };

  // 랜덤 문장 선택
  const getRandomPhrase = (diff: Difficulty) => {
    const phrases = getPhrasesByDifficulty(diff);
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  };

  // 초기 문장 설정
  useEffect(() => {
    setCurrentPhrase(getRandomPhrase(difficulty));
  }, []);

  // 타이머 애니메이션
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = (currentTime - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying]);

  // 난이도 변경
  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    setCurrentPhrase(getRandomPhrase(diff));
    setIsPlaying(false);
    setResult(null);
    setElapsedTime(0);
  };

  // 시작
  const handleStart = () => {
    setIsPlaying(true);
    setResult(null);
    setElapsedTime(0);
  };

  // 성공
  const handleSuccess = () => {
    if (!isPlaying) return;
    setIsPlaying(false);
    setResult(elapsedTime);
  };

  // 다른 문장
  const handleNewPhrase = () => {
    setCurrentPhrase(getRandomPhrase(difficulty));
    setIsPlaying(false);
    setResult(null);
    setElapsedTime(0);
  };

  // 평가 텍스트
  const getEvaluationText = (time: number) => {
    if (time < 3) return "⚡ 번개같이 빨라!";
    if (time < 5) return "🔥 엄청 빨라!";
    if (time < 7) return "👍 빠르네!";
    if (time < 10) return "😊 괜찮아!";
    return "🤔 천천히 해봐!";
  };

  // 난이도 버튼 스타일
  const getDifficultyButtonClass = (diff: Difficulty) => {
    const baseClass = "px-6 py-2 rounded-lg font-semibold transition-all";
    if (difficulty === diff) {
      return `${baseClass} bg-blue-600 text-white`;
    }
    return `${baseClass} bg-transparent text-slate-400 hover:text-strong`;
  };

  return (
    <GameLayout title="나도아나운서">
      <div className="flex flex-col items-center gap-6 p-4">
        {/* 난이도 선택 */}
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => handleDifficultyChange("easy")}
            className={getDifficultyButtonClass("easy")}
          >
            쉬움
          </button>
          <button
            onClick={() => handleDifficultyChange("normal")}
            className={getDifficultyButtonClass("normal")}
          >
            보통
          </button>
          <button
            onClick={() => handleDifficultyChange("hard")}
            className={getDifficultyButtonClass("hard")}
          >
            어려움
          </button>
        </div>

        {/* 게임 영역 */}
        <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 flex flex-col items-center gap-6">
          {/* 문장 */}
          {currentPhrase && (
            <div className="text-strong text-xl leading-relaxed text-center font-medium px-4">
              "{currentPhrase.text}"
            </div>
          )}

          {/* 타이머 */}
          <div className="text-center">
            {isPlaying ? (
              <div className="text-5xl font-bold text-blue-400 font-mono">
                ⏱️ {elapsedTime.toFixed(2)}초
              </div>
            ) : result !== null ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold text-yellow-400">
                  {result.toFixed(2)}초
                </div>
                <div className="text-xl text-strong">
                  {getEvaluationText(result)}
                </div>
              </div>
            ) : (
              <div className="text-2xl text-slate-400">
                준비되면 시작하세요!
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-3 w-full">
            {!isPlaying && result === null && (
              <button
                onClick={handleStart}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                시작
              </button>
            )}

            {isPlaying && (
              <button
                onClick={handleSuccess}
                className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 animate-pulse"
              >
                성공!
              </button>
            )}

            {result !== null && (
              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-strong rounded-lg font-semibold transition-colors"
                >
                  다시하기
                </button>
                <button
                  onClick={handleNewPhrase}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
                >
                  다른 문장
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div className="text-slate-400 text-xs text-center max-w-md">
          문장을 빠르고 정확하게 읽고 "성공!" 버튼을 누르세요!
        </div>
      </div>
    </GameLayout>
  );
}