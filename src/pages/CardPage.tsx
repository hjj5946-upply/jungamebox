import { useState, useRef, useLayoutEffect } from "react";
import GameLayout from "../layouts/GameLayout";
import { gsap } from "gsap";

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
  
  const cardRef = useRef<HTMLDivElement>(null);
  const scope = useRef(null);

  // 카드 뽑기 애니메이션
  const drawCard = () => {
    if (isDrawing || deck.length === 0) return;

    setIsDrawing(true);
    
    // 1. 기존 카드가 있다면 먼저 날려보내기
    const tl = gsap.timeline();
    
    if (currentCard) {
      tl.to(cardRef.current, {
        x: 200,
        opacity: 0,
        rotation: 20,
        duration: 0.3,
        onComplete: () => setCurrentCard(null)
      });
    }

    // 2. 새 카드 뽑기 로직
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const drawn = deck[randomIndex];

      setCurrentCard(drawn);
      setDeck(prev => prev.filter((c) => c.id !== drawn.id));
      setDrawnCards(prev => [...prev, drawn]);

      // 3. 새 카드 등장 애니메이션 (뒤집기 효과)
      tl.fromTo(cardRef.current, 
        { x: -200, opacity: 0, rotationY: 180, rotation: -20 },
        { 
          x: 0, 
          opacity: 1, 
          rotationY: 0, 
          rotation: 0, 
          duration: 0.6, 
          ease: "back.out(1.2)",
          onComplete: () => setIsDrawing(false)
        }
      );
    }, currentCard ? 350 : 0);
  };

  const reset = () => {
    setDeck(createDeck());
    setDrawnCards([]);
    setCurrentCard(null);
    setIsDrawing(false);
  };

  return (
    <GameLayout title="랜덤 카드 뽑기 | J GameBox">
      <div ref={scope} className="flex flex-col h-full gap-6 py-4 px-4 overflow-hidden">
        
        {/* 카드 표시 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center perspective-1000">
          <div className="relative w-64 h-96 min-h-[384px]">
            {/* 카드 뒷면 (덱 쌓여있는 연출) */}
            {!currentCard && !isDrawing && (
              <div
                onClick={drawCard}
                className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-900 rounded-2xl border-4 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform group"
              >
                <div className="w-full h-full border-2 border-white/10 m-2 rounded-xl flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-125 transition-transform">🃏</span>
                </div>
                <div className="absolute bottom-6 text-blue-200 font-bold tracking-widest text-sm uppercase">Tap to Draw</div>
              </div>
            )}

            {/* 뽑힌 카드 (앞면) */}
            {currentCard && (
              <div 
                ref={cardRef}
                className="absolute inset-0 bg-white rounded-2xl border-[6px] border-slate-900 shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-6 backface-hidden"
              >
                <div className="h-full flex flex-col justify-between border-2 border-slate-100 rounded-lg p-2">
                  <div className={`flex flex-col items-start leading-none ${currentCard.color === "red" ? "text-red-600" : "text-black"}`}>
                    <span className="text-5xl font-black">{currentCard.value}</span>
                    <span className="text-3xl ml-1">{currentCard.suit}</span>
                  </div>

                  <div className={`text-center text-9xl ${currentCard.color === "red" ? "text-red-600" : "text-black"}`}>
                    {currentCard.suit}
                  </div>

                  <div className={`flex flex-col items-end leading-none rotate-180 ${currentCard.color === "red" ? "text-red-600" : "text-black"}`}>
                    <span className="text-5xl font-black">{currentCard.value}</span>
                    <span className="text-3xl ml-1">{currentCard.suit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 및 컨트롤 */}
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="text-slate-400 font-medium">
              Remaining: <span className="text-blue-400 font-bold text-xl ml-1">{deck.length}</span>
            </div>
            {currentCard && (
              <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                <span className="text-blue-400 font-bold">Last: {currentCard.suit}{currentCard.value}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={drawCard}
              disabled={isDrawing || deck.length === 0}
              className="flex-[2] py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-black text-xl rounded-2xl shadow-lg disabled:opacity-30 transition-all active:scale-95"
            >
              {isDrawing ? "DRAWING..." : "다음 카드 뽑기"}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all"
            >
              리셋
            </button>
          </div>

          {/* 히스토리 */}
          {drawnCards.length > 0 && (
            <div className="mt-4">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 px-1">History</div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {drawnCards.slice().reverse().map((card, idx) => (
                  <div 
                    key={card.id} 
                    className={`flex-shrink-0 w-10 h-14 rounded-md border flex flex-col items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-slate-900 border-slate-700 text-white'}`}
                  >
                    <span className={card.color === "red" && idx !== 0 ? "text-red-500" : ""}>{card.suit}</span>
                    <span>{card.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}