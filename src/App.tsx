import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoinFlipPage from "./pages/CoinFlipPage";
import DicePage from "./pages/DicePage";
import TimerPage from "./pages/TimerPage";
import RockPaperScissorsPage from "./pages/RockPaperScissorsPage";
import NamePickerPage from "./pages/NamePickerPage";
import OrderPage from "./pages/OrderPage";
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
import Policy from "./pages/Policy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import IfElsePage from "./pages/IfElsePage";
import LiarPage from "./pages/LiarPage";
import ReflexPage from "./pages/ReflexPage";
import SlotPage from "./pages/SlotPage";
import MemoryPage from "./pages/MemoryPage";
import ColorPage from "./pages/ColorPage";
import MathPage from "./pages/MathPage";

import "./index.css";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/flip" element={<CoinFlipPage />} />
        <Route path="/games/dice" element={<DicePage />} />
        <Route path="/games/timer" element={<TimerPage />} />
        <Route path="/games/rock" element={<RockPaperScissorsPage />} />
        <Route path="/games/namepick" element={<NamePickerPage />} />
        <Route path="/games/order" element={<OrderPage />} />
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
        <Route path="/games/slot" element={<SlotPage />} />
        <Route path="/games/memory" element={<MemoryPage />} />
        <Route path="/games/color" element={<ColorPage />} />
        <Route path="/games/math" element={<MathPage />} />

        <Route path="/policy" element={<Policy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  );
}