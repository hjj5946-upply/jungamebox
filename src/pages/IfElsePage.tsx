import { useState } from "react";
import GameLayout from "../layouts/GameLayout";
import { IFELSE_QUESTIONS } from "../data/ifelseQuestions";

export default function IfElsePage() {
  const [current, setCurrent] = useState(
    IFELSE_QUESTIONS[Math.floor(Math.random() * IFELSE_QUESTIONS.length)]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (option: string) => {
    if (isAnimating) return; // 중복 클릭 방지
    setSelected(option);
    setIsAnimating(true);

    // 짧은 애니메이션 후 다음 질문으로
    setTimeout(() => {
      const next =
        IFELSE_QUESTIONS[Math.floor(Math.random() * IFELSE_QUESTIONS.length)];
      setCurrent(next);
      setSelected(null);
      setIsAnimating(false);
    }, 700);
  };

  return (
    <GameLayout title="만약에?">
      <div className="flex flex-col items-center justify-center gap-6 mt-6 select-none">
        {/* 질문 */}
        <h2 className="text-lg font-semibold text-center text-slate-100 px-2 leading-snug">
          {current.question}
        </h2>

        {/* 옵션 목록 */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 transition-all duration-500 ease-in-out"
          style={{
            opacity: isAnimating ? 0.4 : 1,
            transform: isAnimating ? "scale(0.97)" : "scale(1)",
          }}
        >
          {current.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={isAnimating}
              className={`rounded-full px-4 py-3 text-sm font-medium text-slate-100 bg-slate-700 hover:bg-slate-600 transition-all duration-300 active:scale-95 ${
                selected === option ? "ring-2 ring-amber-400 scale-105" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-slate-400 mt-4 text-center px-4">
          옵션을 선택하면 다음 문항이 무작위로 나타납니다.
        </p>
      </div>
    </GameLayout>
  );
}
