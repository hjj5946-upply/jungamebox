import { useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Phase = "ready" | "playing" | "ended";

type Op = "+" | "-" | "×";

type Question = {
  a: number;
  b: number;
  op: Op;
  answer: number;
};

const GAME_DURATION = 60; // 초

export default function MathPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);

  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState<string>("");

  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);

  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 난이도에 따라 문제 생성
  const generateQuestion = (currentCorrect: number): Question => {
    // 맞춘 개수에 따라 난이도 조정
    // 0~5: 쉬움 (덧셈/뺄셈, 1~20)
    // 6~15: 보통 (덧셈/뺄셈, 1~50, 곱셈 소량)
    // 16+: 어려움 (덧셈/뺄셈 1~100, 곱셈 자주)
    let max = 20;
    let useMultiplyChance = 0;

    if (currentCorrect >= 6 && currentCorrect < 16) {
      max = 50;
      useMultiplyChance = 0.2;
    } else if (currentCorrect >= 16) {
      max = 100;
      useMultiplyChance = 0.4;
    }

    const useMultiply = Math.random() < useMultiplyChance;
    let op: Op = "+";
    let a = 0;
    let b = 0;

    if (useMultiply) {
      op = "×";
      // 곱셈은 숫자 범위를 작게
      a = Math.floor(Math.random() * 9) + 2; // 2~10
      b = Math.floor(Math.random() * 9) + 2; // 2~10
    } else {
      op = Math.random() < 0.5 ? "+" : "-";
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * max) + 1;
      // 뺄셈은 음수 안 나오게 큰 쪽에서 작은 쪽 빼기
      if (op === "-" && b > a) {
        [a, b] = [b, a];
      }
    }

    let ans = 0;
    if (op === "+") ans = a + b;
    else if (op === "-") ans = a - b;
    else ans = a * b;

    return { a, b, op, answer: ans };
  };

  const startGame = () => {
    setPhase("playing");
    setTimeLeft(GAME_DURATION);
    setTotal(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setLastResult(null);
    const q = generateQuestion(0);
    setQuestion(q);
    setInput("");

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          timerRef.current = null;
          setPhase("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 입력창 포커스
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const endGameNow = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase("ended");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = () => {
    if (phase !== "playing" || !question) return;
    if (input.trim() === "") return;

    const userAns = Number(input.trim());
    const isCorrect = userAns === question.answer;

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

    const nextQ = generateQuestion(correct + (isCorrect ? 1 : 0));
    setQuestion(nextQ);
    setInput("");
    inputRef.current?.focus();
  };

  const accuracy =
    total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <GameLayout title="암산의달인">
      <div className="flex flex-col gap-3">
        {/* 상단 요약 / 컨트롤 */}
        <div className="flex items-center justify-between gap-3 text-[12px] text-slate-200">
          <div className="flex flex-col gap-1">
            <span>
              남은 시간:{" "}
              <b className={timeLeft <= 10 ? "text-red-400" : "text-emerald-400"}>
                {timeLeft}s
              </b>
            </span>
            <span>
              문제 수: <b>{total}</b> / 정답: <b>{correct}</b> / 정답률:{" "}
              <b>{accuracy}%</b>
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span>
              연속 정답: <b>{streak}</b> (최고 {bestStreak})
            </span>
            {phase !== "playing" ? (
              <button
                onClick={startGame}
                className="mt-1 inline-flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition"
              >
                {phase === "ready" ? "게임 시작" : "다시 하기"}
              </button>
            ) : (
              <button
                onClick={endGameNow}
                className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-[11px] font-normal text-slate-100 shadow-sm transition"
              >
                중단
              </button>
            )}
          </div>
        </div>

        {/* 메인 카드 */}
        <div
          className={[
            "relative flex-1",
            "min-h-[60dvh]",
            "flex flex-col items-center justify-center",
            "rounded-2xl border border-slate-700 bg-slate-900/80",
            "shadow-lg px-4 py-6",
          ].join(" ")}
        >
          {phase === "ready" && (
            <div className="text-center space-y-3">
              <h2 className="text-xl font-semibold text-slate-50 mb-1">
                암산의 달인에 도전해보세요
              </h2>
              <p className="text-[13px] text-slate-300 leading-relaxed">
                60초 동안 나오는 <b>사칙연산</b> 문제를
                <br />
                머릿속으로 빠르게 계산해서 답을 입력하세요.
                <br />
                시간이 끝나기 전에 <b>최대한 많이</b> 맞추는 것이 목표입니다.
              </p>
              <button
                onClick={startGame}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-50 font-semibold px-6 py-3 shadow-md transition"
              >
                지금 시작하기
              </button>
            </div>
          )}

          {phase !== "ready" && question && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              {/* 문제 표시 */}
              <div className="flex flex-col items-center gap-2 mb-2">
                <span className="text-[13px] text-slate-300">
                  다음 식을 계산해서 정답을 입력하세요.
                </span>
                <div className="px-6 py-4 rounded-2xl bg-slate-950/70 border border-slate-700/80 shadow-inner">
                  <span className="text-4xl md:text-5xl font-extrabold text-slate-50 tracking-wide">
                    {question.a} {question.op} {question.b} = ?
                  </span>
                </div>
              </div>

              {/* 입력 영역 */}
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex w-full gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="정답을 입력 후 엔터 또는 버튼을 누르세요"
                  />
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
                  >
                    정답!
                  </button>
                </div>

                {/* 결과 피드백 */}
                <div className="h-5 text-sm font-semibold text-center">
                  {phase === "ended" && (
                    <span className="text-sky-300">
                      시간 종료! 총 <b>{total}</b>문제 중 <b>{correct}</b>문제 정답
                      ({accuracy}%)
                    </span>
                  )}
                  {phase === "playing" && lastResult === "correct" && (
                    <span className="text-emerald-400">정답! 잘했어요 💯</span>
                  )}
                  {phase === "playing" && lastResult === "wrong" && (
                    <span className="text-rose-400">
                      아쉽네요 😅 다음 문제에 집중!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
