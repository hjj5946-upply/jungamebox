//src/components/GameCard.tsx
import { useNavigate } from "react-router-dom";
import type { GameMeta } from "../data/games";

export default function GameCard({ game }: { game: GameMeta }) {
  const navigate = useNavigate();

  // 이미지 크기에 따른 padding 설정
  const getPadding = () => {
    if (!game.image) return "p-2";
    
    switch (game.imageSize) {
      case "small":
        return "p-3";
      case "medium":
        return "p-2";
      case "large":
        return "p-1";
      default:
        return "p-2";
    }
  };

  return (
    <div
      onClick={() => navigate(game.path)}
      className="flex flex-col items-center justify-center gap-2 py-2 cursor-pointer transition-transform active:scale-95 hover:-translate-y-0.5"
    >
      <div className={`w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center overflow-hidden ${getPadding()}`}>
        {game.image ? (
          <img src={game.image} alt={game.name} className="w-full h-full object-contain" />
        ) : game.emoji ? (
          <span className="text-3xl">{game.emoji}</span>
        ) : (
          <div className="w-full h-full bg-slate-700" />
        )}
      </div>
      {/* text-xs(12px) 보다 딱 1px 크게 — leading 은 text-xs 와 동일하게 고정 */}
      <span className="text-[13px] leading-4 text-slate-200 text-center">{game.name}</span>
    </div>
  );
}