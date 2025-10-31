import { useState, useRef } from "react";
import GameCard from "./GameCard";
import type { GameMeta } from "../data/games";

const PAGE_SIZE = 20;

export default function GameGrid({ games }: { games: GameMeta[] }) {
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const maxPage = Math.floor((games.length - 1) / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const current = games.slice(start, start + PAGE_SIZE);

  // 드래그/스와이프 관련
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

const handleTouchMove = () => {
  if (!isDragging.current) return;
  // 나중에 실시간 슬라이드 효과 줄 때 다시 쓸 수 있음
};

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX.current;

    const THRESHOLD = 50; // 이 이상이면 페이지 넘김
    if (diff < -THRESHOLD) {
      // 왼쪽으로 밀었으니까 다음 페이지
      setPage((p) => Math.min(maxPage, p + 1));
    } else if (diff > THRESHOLD) {
      // 오른쪽으로 밀었으니까 이전 페이지
      setPage((p) => Math.max(0, p - 1));
    }
  };

  // 마우스 드래그 (PC용)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = e.clientX - startX.current;
    const THRESHOLD = 80;
    if (diff < -THRESHOLD) {
      setPage((p) => Math.min(maxPage, p + 1));
    } else if (diff > THRESHOLD) {
      setPage((p) => Math.max(0, p - 1));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* 실제 그리드 */}
      <div className="grid grid-cols-4 gap-4">
        {current.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>

      {/* 페이지 표시 (아래 점) */}
      {maxPage > 0 && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: maxPage + 1 }).map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === page ? "bg-slate-500" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* 우측 가운데 화살표 (마지막 페이지에서는 안 보이게) */}
      {page < maxPage && (
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none select-none">
          ▶
        </div>
      )}
    </div>
  );
}
