import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

import "./index.css"; // 반드시 있어야 Tailwind 적용됨

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/games/roulette" element={<RoulettePage />} />
        <Route path="/games/balance" element={<BalanceGamePage />} />
        <Route path="/games/random-question" element={<RandomQuestionPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}