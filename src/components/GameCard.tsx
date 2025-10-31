type Game = {
  id: string;
  name: string;
  path: string;
};

export default function GameCard({ game }: { game: Game }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl shadow-sm py-4">
      <div className="w-12 h-12 rounded-lg bg-slate-200" />
      <span className="text-xs text-slate-700 text-center">{game.name}</span>
    </div>
  );
}