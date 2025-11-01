import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoinFlipPage from "./pages/CoinFlipPage";
import DicePage from "./pages/DicePage";

import "./index.css";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/flip" element={<CoinFlipPage />} />
        <Route path="/games/dice" element={<DicePage />} />
      </Routes>
    </HashRouter>
  );
}