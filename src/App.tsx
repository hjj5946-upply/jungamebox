import { BrowserRouter, Routes, Route } from "react-router-dom";
import PixelDrift, { PixelDriftBackdrop } from "./components/PixelDrift";
import HomePage from "./pages/HomePage";
import DicePage from "./pages/DicePage";
import TimerPage from "./pages/TimerPage";
import RockPaperScissorsPage from "./pages/RockPaperScissorsPage";
import NamePickerPage from "./pages/NamePickerPage";
import RacePage from "./pages/RacePage";
import RoulettePage from "./pages/RoulettePage";
import CardPage from "./pages/CardPage";
import LottoPage from "./pages/LottoPage";
import BalancePage from "./pages/BalancePage";
import NumberGamePage from "./pages/NumberGamePage";
import BingoPage from "./pages/BingoPage";
import TimingPage from "./pages/TimingPage";
import StrengthPage from "./pages/StrengthPage";
import QuizPage from "./pages/QuizPage";
import WisesayPage from "./pages/WisesayPage";
import ReadingPage from "./pages/ReadingPage";
import Terms from "./pages/Terms";
import IfElsePage from "./pages/IfElsePage";
import LiarPage from "./pages/LiarPage";
import ReflexPage from "./pages/ReflexPage";
import MemoryPage from "./pages/MemoryPage";
import ColorPage from "./pages/ColorPage";
import MathPage from "./pages/MathPage";
import PinballPage from "./pages/PinballPage";
import PinballPlayPage from "./pages/PinballPlayPage";
import SudokuPage from "./pages/SudokuPage";
import LadderPage from "./pages/LadderPage";
import CatSudokuPage from "./pages/CatSudokuPage";

import "./index.css";

export default function App() {
  return (
    // 앱 셸: 화면 전체는 더 어두운 배경, 앱 본체는 모바일 폭(max-w-md)으로 중앙 고정.
    // 양옆 여백은 PixelDrift 장식이 채우고, 본체는 그림자+엣지 링으로 경계를 만든다.
    <div className="relative flex h-dvh justify-center overflow-hidden bg-slate-950">
      <PixelDrift />

      {/* id: 뷰포트 기준(position:fixed) 오버레이가 이 열의 크기에 맞춰지도록 참조용
          (예: BalancePage 의 이미지 확대) */}
      <div
        id="app-shell"
        className="relative z-10 h-full w-full max-w-md bg-slate-900 shadow-2xl shadow-black/20 ring-1 ring-veil/10 dark:shadow-black/70"
      >
        {/* 본체 배경 장식. 여기(z-0)에 깔고 레이아웃들이 배경을 비워 두어 콘텐츠 뒤로 비쳐 보인다.
            본체 바탕색은 위 bg-slate-900 이 담당한다. */}
        <PixelDriftBackdrop />

        {/* BrowserRouter 사용 → URL 에 # 이 붙지 않는다.
            GitHub Pages 는 정적 서버라 /games/dice 로 직접 진입하면 파일을 못 찾아 404 가 되는데,
            배포 워크플로에서 index.html 을 404.html 로 복사해 두어 어떤 경로든 앱이 로드된다.
            (.github/workflows/deploy.yml 의 "SPA fallback" 스텝) */}
        {/* relative z-10: 위 배경 장식보다 항상 앞에 오도록 */}
        <div className="relative z-10 h-full">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games/dice" element={<DicePage />} />
              <Route path="/games/timer" element={<TimerPage />} />
              <Route path="/games/rock" element={<RockPaperScissorsPage />} />
              <Route path="/games/namepick" element={<NamePickerPage />} />
              <Route path="/games/order" element={<RacePage />} />
              <Route path="/games/roulette" element={<RoulettePage />} />
              <Route path="/games/card" element={<CardPage />} />
              <Route path="/games/lotto" element={<LottoPage />} />
              <Route path="/games/balance" element={<BalancePage />} />
              <Route path="/games/speed" element={<NumberGamePage />} />
              <Route path="/games/bingo" element={<BingoPage />} />
              <Route path="/games/timing" element={<TimingPage />} />
              <Route path="/games/str" element={<StrengthPage />} />
              <Route path="/games/quiz" element={<QuizPage />} />
              <Route path="/games/wisesay" element={<WisesayPage />} />
              <Route path="/games/reading" element={<ReadingPage />} />
              <Route path="/games/ifelse" element={<IfElsePage />} />
              <Route path="/games/liar" element={<LiarPage />} />
              <Route path="/games/reflexes" element={<ReflexPage />} />
              <Route path="/games/memory" element={<MemoryPage />} />
              <Route path="/games/color" element={<ColorPage />} />
              <Route path="/games/math" element={<MathPage />} />
              <Route path="/games/pinball" element={<PinballPage />} />
              <Route path="/games/pinball/play" element={<PinballPlayPage />} />
              <Route path="/games/sudoku" element={<SudokuPage />} />
              <Route path="/games/ladder" element={<LadderPage />} />
              <Route path="/games/catsudoku" element={<CatSudokuPage />} />

              <Route path="/terms" element={<Terms />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </div>
  );
}
