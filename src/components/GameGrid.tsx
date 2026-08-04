import GameCard from "./GameCard";
import type { GameMeta } from "../data/games";

/**
 * 게임 목록 그리드.
 * 페이징 없이 전체를 4열로 나열한다.
 * 세로 스크롤은 부모(MainLayout 의 콘텐츠 영역)가 담당한다.
 */
export default function GameGrid({ games }: { games: GameMeta[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  );
}
