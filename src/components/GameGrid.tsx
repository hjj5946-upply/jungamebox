import { useState, useRef } from "react";
import GameCard from "./GameCard";
import type { GameMeta } from "../data/games";

const PAGE_SIZE = 16;

export default function GameGrid({ games }: { games: GameMeta[] }) {
  const [page, setPage] = useState(0);
  const [animDirection, setAnimDirection] = useState<"left" | "right" | null>(null);
  const maxPage = Math.floor((games.length - 1) / PAGE_SIZE);

  const start = page * PAGE_SIZE;
  const current = games.slice(start, start + PAGE_SIZE);

  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleSwipeEnd = (diff: number) => {
    const THRESHOLD = 50;
    if (diff < -THRESHOLD && page < maxPage) {
      setAnimDirection("left");
      setTimeout(() => {
        setPage((p) => p + 1);
        setAnimDirection(null);
      }, 200);
    } else if (diff > THRESHOLD && page > 0) {
      setAnimDirection("right");
      setTimeout(() => {
        setPage((p) => p - 1);
        setAnimDirection(null);
      }, 200);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = e.changedTouches[0].clientX;
    handleSwipeEnd(endX - startX.current);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleSwipeEnd(e.clientX - startX.current);
  };

  const goToPrevPage = () => {
    if (page > 0) {
      setAnimDirection("right");
      setTimeout(() => {
        setPage((p) => p - 1);
        setAnimDirection(null);
      }, 200);
    }
  };

  const goToNextPage = () => {
    if (page < maxPage) {
      setAnimDirection("left");
      setTimeout(() => {
        setPage((p) => p + 1);
        setAnimDirection(null);
      }, 200);
    }
  };

  return (
    <div
      className="relative h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* 그리드 */}
      <div
        className={`grid grid-cols-4 sm:grid-cols-4 gap-4 transition-transform duration-300 ${
          animDirection === "left"
            ? "-translate-x-full opacity-0"
            : animDirection === "right"
            ? "translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        {current.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>

      {/* 페이지 네비게이션 (점 + 화살표) */}
      {maxPage > 0 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {/* 좌측 화살표 */}
          <button
            onClick={goToPrevPage}
            disabled={page === 0}
            className={`text-xl ${
              page === 0
                ? "text-slate-600 cursor-not-allowed"
                : "text-slate-400 hover:text-slate-200 cursor-pointer"
            } transition-colors`}
          >
            ❮
          </button>

          {/* 페이지 점들 */}
          <div className="flex gap-1">
            {Array.from({ length: maxPage + 1 }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === page ? "bg-slate-400" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* 우측 화살표 */}
          <button
            onClick={goToNextPage}
            disabled={page === maxPage}
            className={`text-xl ${
              page === maxPage
                ? "text-slate-600 cursor-not-allowed"
                : "text-slate-400 hover:text-slate-200 cursor-pointer"
            } transition-colors`}
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}