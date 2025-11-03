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
      </Routes>
    </HashRouter>
  );
}