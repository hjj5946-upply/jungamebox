import { useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Phase = "playing" | "result";

type ColorOption = {
  name: string;
  hex: string;
};

type Question = {
  textName: string;   // 글자 내용
  colorName: string;  // 실제 색 이름
  colorHex: string;   // 실제 색 값
  isMatch: boolean;   // 글자 == 색상 ?
};

const COLORS: ColorOption[] = [
  { name: "빨강", hex: "#ef4444" },
  { name: "파랑", hex: "#3b82f6" },
  { name: "초록", hex: "#22c55e" },
  { name: "노랑", hex: "#eab308" },
  { name: "보라", hex: "#a855f7" },
  { name: "검정", hex: "#0d0d0d" },
  { name: "하양", hex: "#e5e7eb" },
];

export default function ColorPage() {
  const [phase, setPhase] = useState<Phase>("playing");
  const [question, setQuestion] = useState<Question | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);

  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const nextTimeoutRef = useRef<number | null>(null);

  // 문제 생성
  const makeQuestion = () => {
    const all = COLORS;
  
    // 글자 후보 선택
    const textObj = all[Math.floor(Math.random() * all.length)];
  
    // 정답(O) 확률: 40% ~ 45% 사이 랜덤
    const matchRate = 0.40 + Math.random() * 0.05;
    const forceMatch = Math.random() < matchRate;
  
    let colorObj;
    if (forceMatch) {
      // 글자 컬러와 동일한 경우 (정답)
      colorObj = textObj;
    } else {
      // 글자와 다른 색상 중 랜덤 선택 (오답)
      const others = all.filter(c => c.name !== textObj.name);
      colorObj = others[Math.floor(Math.random() * others.length)];
    }
  
    const q: Question = {
      textName: textObj.name,
      colorName: colorObj.name,
      colorHex: colorObj.hex,
      isMatch: forceMatch,
    };
  
    setQuestion(q);
    setLastResult(null);
    setPhase("playing");
  };

  useEffect(() => {
    makeQuestion();
    return () => {
      if (nextTimeoutRef.current) window.clearTimeout(nextTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (answerIsMatch: boolean) => {
    if (!question || lastResult !== null) return;

    const isCorrect = answerIsMatch === question.isMatch;

    setTotal((prev) => prev + 1);
    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setLastResult("correct");
    } else {
      setStreak(0);
      setLastResult("wrong");
    }
    setPhase("result");

    // 잠깐 결과 보여주고 다음 문제
    if (nextTimeoutRef.current) window.clearTimeout(nextTimeoutRef.current);
    nextTimeoutRef.current = window.setTimeout(() => {
      makeQuestion();
    }, 800);
  };

  const accuracy =
    total > 0 ? Math.round((correct / total) * 100) : 0;

  const canAnswer = phase === "playing" && question !== null && lastResult === null;

  return (
    <GameLayout title="색깔맞추기">
      <div className="flex flex-col gap-3">
        {/* 상단 통계 */}
        <div className="flex items-center justify-between text-[12px] text-slate-300">
          <div className="flex gap-3">
            <span>문제 수: <b>{total}</b></span>
            <span>정답: <b>{correct}</b></span>
          </div>
          <div className="flex gap-3">
            <span>정답률: <b>{accuracy}%</b></span>
            <span>연속 정답: <b>{streak}</b> (최고 {bestStreak})</span>
          </div>
        </div>

        {/* 메인 카드 */}
        <div
          className={[
            "relative flex-1",
            "min-h-[65dvh]",
            "flex flex-col items-center justify-center",
            "rounded-2xl border border-slate-700 bg-slate-900/80",
            "shadow-lg px-4 py-6",
          ].join(" ")}
        >
          {/* 규칙 안내 */}
          <div className="absolute top-4 left-0 right-0 flex flex-col items-center text-center px-4">
            <p className="text-[13px] text-slate-200 font-semibold">
              글자의 <span className="text-sky-400">내용</span>과{" "}
              <span className="text-emerald-400">실제 색상</span>이
              <br />
              <span className="font-bold">일치하면 O, 다르면 X</span>를 누르세요.
            </p>
          </div>

          {/* 문제 영역 */}
          {question && (
            <div className="flex flex-col items-center gap-6">
              <div className="mt-8 mb-4 text-[13px] text-slate-300">
                지금 보이는 글자:
              </div>

              <div className="px-12 py-4 rounded-2xl bg-slate-950/70 border border-slate-700/80 shadow-inner">
                <span
                  className="text-5xl md:text-6xl font-extrabold tracking-wide drop-shadow"
                  style={{
                    color: question.colorHex,
                    textShadow:
                      "0 0 8px rgba(27, 37, 61,0.6), 0 0 18px rgba(27, 37, 61, 0.9)",
                  }}
                >
                  {question.textName}
                </span>
              </div>

              {/* 결과 상태 표시 */}
              <div className="h-6 text-sm font-semibold">
                {lastResult === "correct" && (
                  <span className="text-emerald-400">정답! 👍</span>
                )}
                {lastResult === "wrong" && (
                  <span className="text-rose-400">
                    오답입니다 😅 다시 도전!
                  </span>
                )}
              </div>

              {/* 버튼 영역 */}
              <div className="mt-4 flex gap-6 w-full max-w-xs">
                <button
                  type="button"
                  disabled={!canAnswer}
                  onClick={() => handleAnswer(true)}
                  className={[
                    "flex-1 py-4 rounded-xl text-lg font-bold",
                    "border border-emerald-500/70",
                    "bg-emerald-600 hover:bg-emerald-500",
                    "text-white shadow-md transition",
                    !canAnswer && "opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  O
                </button>
                <button
                  type="button"
                  disabled={!canAnswer}
                  onClick={() => handleAnswer(false)}
                  className={[
                    "flex-1 py-4 rounded-xl text-lg font-bold",
                    "border border-rose-500/70",
                    "bg-rose-600 hover:bg-rose-500",
                    "text-white shadow-md transition",
                    !canAnswer && "opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 간단 히스토리/설명 등은 필요하면 여기 추가 가능 */}
      </div>
    </GameLayout>
  );
}
