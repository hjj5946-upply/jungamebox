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
      className="flex flex-col items-center justify-center gap-2 bg-slate-800 rounded-xl shadow-lg py-4 hover:bg-slate-700 transition-colors cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden ${getPadding()}`}>
        {game.image ? (
          <img src={game.image} alt={game.name} className="w-full h-full object-contain" />
        ) : game.emoji ? (
          <span className="text-3xl">{game.emoji}</span>
        ) : (
          <div className="w-full h-full bg-slate-700" />
        )}
      </div>
      <span className="text-xs text-slate-200 text-center">{game.name}</span>
    </div>
  );
}