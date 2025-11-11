import { useMemo, useState } from "react";
import GameLayout from "../layouts/GameLayout";
import { CATEGORIES, WORDS, getMeta } from "../data/liarData";
import { Shuffle, UsersRound, ChevronRight, Eye, CheckCircle2 } from "lucide-react";

type Stage = "players" | "category" | "view" | "reveal";

export default function LiarPage() {
  const [stage, setStage] = useState<Stage>("players");
  const [playerCount, setPlayerCount] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [liarIndex, setLiarIndex] = useState<number | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const canStart = useMemo(
    () => selectedCategory && WORDS[selectedCategory!]?.length > 0,
    [selectedCategory]
  );

  const startCategory = (cat: string) => {
    setSelectedCategory(cat);
  };

  const startGame = () => {
    if (!selectedCategory) return;
    const pool = WORDS[selectedCategory];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const liar = Math.floor(Math.random() * playerCount);

    setWord(pick);
    setLiarIndex(liar);
    setCurrentPlayer(1);
    setIsRevealed(false);
    setStage("view");
  };

  const nextPlayer = () => {
    if (currentPlayer < playerCount) {
      setCurrentPlayer(p => p + 1);
      setIsRevealed(false);
    } else {
      setStage("reveal");
    }
  };

  const resetAll = () => {
    setStage("players");
    setPlayerCount(4);
    setSelectedCategory(null);
    setCurrentPlayer(1);
    setLiarIndex(null);
    setWord(null);
    setIsRevealed(false);
  };

  // 상단 단계 표시(간단 스텝퍼)
  const Stepper = () => {
    const steps: { key: Stage; label: string }[] = [
      { key: "players", label: "참가자" },
      { key: "category", label: "카테고리" },
      { key: "view", label: "단어보기" },
      { key: "reveal", label: "정답" },
    ];
    const idx = steps.findIndex(s => s.key === stage);
    return (
      <ol className="flex items-center justify-center gap-3 text-xs text-slate-300 mb-4">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`w-6 h-6 grid place-items-center rounded-full 
              ${i <= idx ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-300"}`}>{i+1}</span>
            <span className={`${i <= idx ? "text-slate-100" : ""}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="opacity-50">›</span>}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <GameLayout title="라이어 게임">
      <div className="mt-4 flex flex-col items-center">
        <Stepper />

        {stage === "players" && (
          <div className="w-full">
            <header className="mb-4 text-center">
              <h2 className="text-lg font-semibold text-slate-100">참가 인원을 선택하세요</h2>
              <p className="text-xs text-slate-400 mt-1">3명 ~ 8명</p>
            </header>

            <div className="mx-auto grid grid-cols-3 gap-3 max-w-md">
              {[3,4,5,6,7,8].map(n => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`rounded-xl py-4 font-semibold shadow-md transition
                    ${playerCount===n
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-2 ring-amber-300"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <UsersRound size={18} />
                    {n}명
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setStage("category")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md"
              >
                <ChevronRight size={18} /> 다음
              </button>
            </div>
          </div>
        )}

        {stage === "category" && (
          <div className="w-full">
            <header className="mb-4 text-center">
              <h2 className="text-lg font-semibold text-slate-100">카테고리를 선택하세요</h2>
              <p className="text-xs text-slate-400 mt-1">원하는 주제로 플레이</p>
            </header>

            <div className="mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
              {CATEGORIES.map(cat => {
                const meta = getMeta(cat);
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => startCategory(cat)}
                    className={`group relative overflow-hidden rounded-2xl p-4 text-left shadow-md ring-1 transition
                      ${active ? `ring-2 ${meta.ring}` : "ring-slate-700"}
                      bg-slate-800 hover:bg-slate-700`}
                  >
                    <div className={`absolute inset-0 -z-10 opacity-25 blur-xl bg-gradient-to-r ${meta.bg}`} />
                    <div className="text-2xl mb-1">{meta.emoji}</div>
                    <div className="text-sm font-semibold text-slate-100">{cat}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {WORDS[cat]?.length ?? 0}개 제시어
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => {
                  // 랜덤 카테고리 선택
                  const rand = CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)];
                  startCategory(rand);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm"
              >
                <Shuffle size={16} /> 랜덤
              </button>

              <button
                onClick={startGame}
                disabled={!canStart}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md
                  ${canStart ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        {stage === "view" && (
          <div className="w-full">
            <header className="mb-3 text-center">
              <h2 className="text-base font-semibold text-slate-100">
                👤 {currentPlayer}/{playerCount}번째 참가자
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                버튼을 눌러 당신의 정체를 확인하세요
              </p>
            </header>

            {!isRevealed ? (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setIsRevealed(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-semibold shadow-lg"
                >
                  <Eye size={18} /> 단어 보기
                </button>
              </div>
            ) : (
              <div className="mx-auto mt-6 max-w-sm">
                <div className="rounded-2xl bg-slate-800 p-6 shadow-lg ring-1 ring-slate-700 text-center">
                  {liarIndex === currentPlayer - 1 ? (
                    <>
                      <div className="text-2xl mb-2">🤫</div>
                      <p className="text-amber-400 text-lg font-bold mb-1">당신은 라이어입니다!</p>
                      <p className="text-sm text-slate-300">다른 사람의 발언에서 제시어를 유추해보세요.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] text-slate-400 mb-1">제시어 ({selectedCategory})</p>
                      <p className="text-2xl font-extrabold tracking-wide text-slate-100">{word}</p>
                    </>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={nextPlayer}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold shadow-md"
                  >
                    <ChevronRight size={18} /> 다음 참가자
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === "reveal" && (
          <div className="w-full">
            <header className="mb-3 text-center">
              <h2 className="text-base font-semibold text-slate-100">모두 확인 완료!</h2>
              <p className="text-xs text-slate-400 mt-1">이제 라이어를 추리하고 토론하세요</p>
            </header>

            <div className="mx-auto max-w-sm">
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg ring-1 ring-slate-700 text-center">
                <div className="text-[12px] text-slate-400 mb-1">정답</div>
                <div className="text-2xl font-extrabold text-slate-100">{selectedCategory} · {word}</div>
                <div className="mt-4 text-xs text-slate-400">라운드 종료 후 “새 게임”으로 재시작</div>
              </div>

              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md"
                >
                  <CheckCircle2 size={18} /> 새 게임
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}