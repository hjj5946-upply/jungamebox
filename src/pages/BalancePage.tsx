import { useState } from "react";
import GameLayout from "../layouts/GameLayout";
import { categories } from "../data/balanceGameData";
import type { Category, Item, TournamentRound } from "../data/balanceGameData";

type TournamentStage = "category" | "tournament-select" | "tournament" | "result";

export default function BalancePage() {
  const [stage, setStage] = useState<TournamentStage>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tournamentRound, setTournamentRound] = useState<TournamentRound | null>(null);
  const [currentRoundItems, setCurrentRoundItems] = useState<Item[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [finalWinner, setFinalWinner] = useState<Item | null>(null);

  // 카테고리 선택
  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setStage("tournament-select");
  };

  // 토너먼트 시작
  const startTournament = (round: TournamentRound) => {
    setTournamentRound(round);
    const itemCount = round === "32" ? 32 : 64;
    const items = selectedCategory?.items || [];

    // 항목 섞고 필요한 개수만큼 선택
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, Math.min(itemCount, items.length));

    setCurrentRoundItems(selectedItems);
    setCurrentMatchIndex(0);
    setCurrentRoundNumber(1);
    setFinalWinner(null);
    setStage("tournament");
  };

  // 승자 선택 로직
  const selectWinner = (winner: Item) => {
    // 승자 저장을 위한 임시 배열
    if (!sessionStorage.getItem('roundWinners')) {
      sessionStorage.setItem('roundWinners', JSON.stringify([]));
    }
    
    const savedWinners = JSON.parse(sessionStorage.getItem('roundWinners') || '[]');
    savedWinners.push(winner);
    sessionStorage.setItem('roundWinners', JSON.stringify(savedWinners));
    
    const nextMatchIndex = currentMatchIndex + 2;
    
    // 현재 라운드가 끝나지 않았으면
    if (nextMatchIndex < currentRoundItems.length) {
      setCurrentMatchIndex(nextMatchIndex);
      return;
    }
    
    // 현재 라운드 완료
    const winners = savedWinners as Item[];
    sessionStorage.removeItem('roundWinners');
    
    // 최종 우승자
    if (winners.length === 1) {
      setFinalWinner(winners[0]);
      setStage("result");
      return;
    }
    
    // 다음 라운드
    setCurrentRoundItems(winners);
    setCurrentMatchIndex(0);
    setCurrentRoundNumber(currentRoundNumber + 1);
  };

  // 리셋
  const reset = () => {
    setStage("category");
    setSelectedCategory(null);
    setTournamentRound(null);
    setCurrentRoundItems([]);
    setCurrentMatchIndex(0);
    setCurrentRoundNumber(1);
    setFinalWinner(null);
    sessionStorage.removeItem('roundWinners');
  };

  // 현재 매치 아이템
  const itemA = currentRoundItems[currentMatchIndex];
  const itemB = currentRoundItems[currentMatchIndex + 1];
  
  // 총 라운드 수
  const totalRounds = tournamentRound === "32" ? 5 : 6;
  const matchesInCurrentRound = Math.floor(currentRoundItems.length / 2);
  const currentMatchNumber = Math.floor(currentMatchIndex / 2) + 1;

  return (
    <GameLayout title="밸런스월드컵">
      <div className="flex flex-col h-full gap-6">
        {/* 카테고리 선택 */}
        {stage === "category" && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="text-white text-2xl font-bold text-center">
              카테고리를 선택하세요
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category)}
                  className="py-6 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-lg transition-colors shadow-lg"
                >
                  {category.name}
                  <div className="text-sm text-slate-400 mt-1">
                    {category.items.length}개 항목
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 토너먼트 라운드 선택 */}
        {stage === "tournament-select" && selectedCategory && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-white text-2xl font-bold text-center">
              {selectedCategory.name}
              <br />
              <span className="text-lg text-slate-400 font-normal">
                토너먼트 라운드를 선택하세요
              </span>
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => startTournament("32")}
                className="flex-1 py-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-xl transition-colors"
              >
                32강
              </button>
              <button
                onClick={() => startTournament("64")}
                className="flex-1 py-12 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition-colors"
              >
                64강
              </button>
            </div>
            <button
              onClick={reset}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              뒤로가기
            </button>
          </div>
        )}

        {/* 토너먼트 진행 */}
        {stage === "tournament" && itemA && itemB && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {/* 진행 상태 */}
            <div className="text-white text-center">
              <div className="text-lg font-semibold">
                {tournamentRound}강 토너먼트
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {currentRoundNumber}라운드 / {totalRounds}라운드
                <br />
                매치 {currentMatchNumber}/{matchesInCurrentRound}
              </div>
            </div>

            {/* 선택지 */}
            <div className="w-full flex gap-4">
              <button
                onClick={() => selectWinner(itemA)}
                className="flex-1 py-12 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl rounded-xl transition-all duration-300 shadow-lg hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                {itemA.image && (
                  <img
                    src={itemA.image}
                    alt={itemA.name}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span>{itemA.name}</span>
              </button>

              <div className="flex items-center text-white text-3xl font-bold">
                VS
              </div>

              <button
                onClick={() => selectWinner(itemB)}
                className="flex-1 py-12 px-6 bg-red-500 hover:bg-red-600 text-white font-bold text-2xl rounded-xl transition-all duration-300 shadow-lg hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                {itemB.image && (
                  <img
                    src={itemB.image}
                    alt={itemB.name}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span>{itemB.name}</span>
              </button>
            </div>

            <button
              onClick={reset}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              뒤로가기
            </button>
          </div>
        )}

        {/* 결과 */}
        {stage === "result" && finalWinner && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-yellow-400 text-3xl font-bold text-center animate-bounce">
              🏆 우승! 🏆
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-5xl font-bold py-16 px-20 rounded-xl shadow-2xl animate-bounce">
              {finalWinner.name}
            </div>
            <button
              onClick={reset}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-colors"
            >
              다시하기
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
