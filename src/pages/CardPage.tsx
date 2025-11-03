//src/pages/CardPage.tsx
import { useState } from "react";
import GameLayout from "../layouts/GameLayout";

type CardSuit = "♠" | "♥" | "♦" | "♣";
type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

type Card = {
  id: number;
  suit: CardSuit;
  value: CardValue;
  color: "black" | "red";
  
};

const suits: CardSuit[] = ["♠", "♥", "♦", "♣"];
const values: CardValue[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// 전체 카드 덱 생성
const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let id = 0;
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({
        id: id++,
        suit,
        value,
        color: suit === "♥" || suit === "♦" ? "red" : "black",
      });
    });
  });
  return deck;
};

export default function CardPage() {
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const drawCard = () => {
    if (isDrawing || deck.length === 0) return;

    setIsDrawing(true);
    setCurrentCard(null);

    // 애니메이션을 위한 딜레이
    setTimeout(() => {
      // 랜덤 인덱스로 카드 선택
      const randomIndex = Math.floor(Math.random() * deck.length);
      const drawn = deck[randomIndex];

      setCurrentCard(drawn);
      // 뽑은 카드를 덱에서 제거
      setDeck(deck.filter((card) => card.id !== drawn.id));
      setDrawnCards([...drawnCards, drawn]);
      setIsDrawing(false);
    }, 500);
  };

  const reset = () => {
    setDeck(createDeck());
    setDrawnCards([]);
    setCurrentCard(null);
    setIsDrawing(false);
  };

  const getCardDisplay = (card: Card) => {
    return (
      <div className="flex items-center gap-2">
        <span className={card.color === "red" ? "text-red-500" : "text-white"}>
          {card.suit}
        </span>
        <span className="text-white font-bold">{card.value}</span>
      </div>
    );
  };

  return (
    <GameLayout title="카드뽑기">
      <div className="flex flex-col h-full gap-6">
        {/* 카드 표시 영역 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-64 h-96">
            {/* 카드 뒤면 */}
            {!currentCard && (
              <div
                className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border-4 border-slate-300 shadow-2xl flex items-center justify-center transition-transform duration-300 ${
                  isDrawing ? "animate-pulse scale-95" : "hover:scale-105 cursor-pointer"
                }`}
                onClick={isDrawing ? undefined : drawCard}
              >
                <div className="text-white text-6xl font-bold opacity-20">
                  🎴
                </div>
              </div>
            )}

            {/* 뽑은 카드 */}
            {currentCard && (
              <div className="absolute inset-0 bg-white rounded-xl border-4 border-slate-800 shadow-2xl p-6 animate-bounce-in">
                <div className="h-full flex flex-col">
                  {/* 상단 */}
                  <div className="flex flex-col items-start">
                    <div
                      className={`text-5xl font-bold ${
                        currentCard.color === "red" ? "text-red-600" : "text-black"
                      }`}
                    >
                      {currentCard.value}
                    </div>
                    <div
                      className={`text-4xl ${
                        currentCard.color === "red" ? "text-red-600" : "text-black"
                      }`}
                    >
                      {currentCard.suit}
                    </div>
                  </div>

                  {/* 중앙 */}
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      className={`text-9xl ${
                        currentCard.color === "red" ? "text-red-600" : "text-black"
                      }`}
                    >
                      {currentCard.suit}
                    </div>
                  </div>

                  {/* 하단 (뒤집힌) */}
                  <div className="flex flex-col items-end transform rotate-180">
                    <div
                      className={`text-5xl font-bold ${
                        currentCard.color === "red" ? "text-red-600" : "text-black"
                      }`}
                    >
                      {currentCard.value}
                    </div>
                    <div
                      className={`text-4xl ${
                        currentCard.color === "red" ? "text-red-600" : "text-black"
                      }`}
                    >
                      {currentCard.suit}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 남은 카드 수 및 결과 표시 */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-white text-lg">
              남은 카드: <span className="font-bold text-blue-400">{deck.length}</span>장
            </div>
            {currentCard && !isDrawing && (
              <div className="mt-2 text-xl font-bold text-yellow-400">
                {currentCard.suit} {currentCard.value}
              </div>
            )}
          </div>

          {/* 뽑은 카드 목록 */}
          {drawnCards.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-2">
              <div className="text-white text-sm font-semibold">뽑은 카드:</div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {drawnCards.slice(-12).map((card) => (
                  <div
                    key={card.id}
                    className="bg-slate-700 rounded p-2 text-center text-xs"
                  >
                    {getCardDisplay(card)}
                  </div>
                ))}
              </div>
              {drawnCards.length > 12 && (
                <div className="text-slate-400 text-xs text-center">
                  외 {drawnCards.length - 12}장 더...
                </div>
              )}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={drawCard}
              disabled={isDrawing || deck.length === 0}
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDrawing ? "뽑는 중..." : deck.length === 0 ? "카드 없음" : "카드 뽑기"}
            </button>
            {drawnCards.length > 0 && (
              <button
                onClick={reset}
                disabled={isDrawing}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                리셋
              </button>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}

