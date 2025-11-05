import { useState, useRef } from "react";
import GameLayout from "../layouts/GameLayout";
import { QUOTES } from "../data/quotes";

export default function WisesayPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [copied, setCopied] = useState(false);
  
  const startX = useRef(0);
  const isDragging = useRef(false);

  const currentQuote = QUOTES[currentIndex];

  // 다음 명언
  const handleNext = () => {
    if (currentIndex < QUOTES.length - 1) {
      setSwipeDirection("left");
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 300);
    }
  };

  // 이전 명언
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSwipeDirection("right");
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setSwipeDirection(null);
      }, 300);
    }
  };

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX.current;
    
    const THRESHOLD = 50;
    if (diff < -THRESHOLD) {
      handleNext(); // 왼쪽 스와이프
    } else if (diff > THRESHOLD) {
      handlePrev(); // 오른쪽 스와이프
    }
  };

  // 마우스 이벤트 (데스크톱용)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = e.clientX - startX.current;
    
    const THRESHOLD = 50;
    if (diff < -THRESHOLD) {
      handleNext();
    } else if (diff > THRESHOLD) {
      handlePrev();
    }
  };

  // 복사하기
  const handleCopy = async () => {
    const text = `"${currentQuote.text}"\n- ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  // 공유하기
//   const handleShare = async () => {
//     const text = `"${currentQuote.text}"\n- ${currentQuote.author}`;
    
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: "오늘의 명언",
//           text: text,
//         });
//       } catch (err) {
//         console.error("공유 실패:", err);
//       }
//     } else {
//       // Web Share API 미지원 시 복사
//       handleCopy();
//     }
//   };

  return (
    <GameLayout title="명언 모음">
      <div className="flex flex-col h-full gap-4 py-4">
        
        {/* 카운터 */}
        <div className="text-center text-sm text-slate-400">
          {currentIndex + 1} / {QUOTES.length}
        </div>

        {/* 명언 카드 */}
        <div
          className="flex-1 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            className={`
              relative w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 
              rounded-2xl shadow-2xl p-8 border border-slate-700
              transition-all duration-300
              ${swipeDirection === "left" ? "-translate-x-full opacity-0" : ""}
              ${swipeDirection === "right" ? "translate-x-full opacity-0" : ""}
              ${!swipeDirection ? "translate-x-0 opacity-100" : ""}
            `}
          >
            {/* 카테고리 태그 */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                {currentQuote.category}
              </span>
            </div>

            {/* 명언 텍스트 */}
            <div className="mt-6 mb-8 text-center">
              <p className="text-white text-lg leading-relaxed font-medium">
                "{currentQuote.text}"
              </p>
            </div>

            {/* 저자 */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                - {currentQuote.author}
              </p>
            </div>

            {/* 스와이프 힌트 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <p className="text-slate-500 text-xs">
                ← 스와이프하여 다음 →
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 px-4 pb-4">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            📋 {copied ? "복사됨!" : "복사"}
          </button>
          {/* <button
            onClick={handleShare}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            🔗 공유
          </button> */}
        </div>
      </div>
    </GameLayout>
  );
}