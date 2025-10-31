import MainLayout from "../layouts/MainLayout";
import GameGrid from "../components/GameGrid";
import { GAME_LIST } from "../data/games";

export default function HomePage() {
  return (
    <MainLayout>
      <GameGrid games={GAME_LIST} />
    </MainLayout>
  );
}
