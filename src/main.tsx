import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * 개발자도구 콘솔 ASCII 아트 출력 (1회)
 * - StrictMode(dev)에서 중복 실행 방지
 */
const CONSOLE_BANNER_FLAG = "__JGAMEBOX_CONSOLE_BANNER_SHOWN__";

function printRainbowGameBannerOnce() {
  // 브라우저/환경 안전장치
  if (typeof window === "undefined") return;

  const w = window as unknown as Record<string, any>;
  if (w[CONSOLE_BANNER_FLAG]) return;
  w[CONSOLE_BANNER_FLAG] = true;

  const lines = [
    "   ██████   █████  ███    ███ ███████ ",
    "  ██       ██   ██ ████  ████ ██      ",
    "  ██   ███ ███████ ██ ████ ██ █████   ",
    "  ██    ██ ██   ██ ██  ██  ██ ██      ",
    "   ██████  ██   ██ ██      ██ ███████ ",
  ];

  // 무지개 그라데이션 스타일(라인별로 색 다르게)
  const colors = ["#ff004c", "#ff7a00", "#ffd400", "#00d084", "#00aaff", "#7a3cff"];

  // 헤더/안내 문구
  console.log(
    "%cJ GameBox Console",
    "font-weight:800; font-size:14px; color:#0f172a; background:#e2e8f0; padding:6px 10px; border-radius:8px;"
  );

  // ASCII 아트(라인별 색 적용)
  lines.forEach((line, i) => {
    const c = colors[i % colors.length];
    console.log(
      "%c" + line,
      [
        "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        "font-size: 14px",
        "font-weight: 800",
        `color: ${c}`,
        "line-height: 1.1",
      ].join("; ")
    );
  });

  // 하단 포인트 문구 (레인보우 느낌으로 강조)
  console.log(
    "%cⓒ Hong JeongJun 🎮",
    "font-weight:700; font-size:12px; background:linear-gradient(90deg,#ff004c,#ff7a00,#ffd400,#00d084,#00aaff,#7a3cff); -webkit-background-clip:text; color:transparent;"
  );
}

function bootstrap() {
  printRainbowGameBannerOnce();

  const rootEl = document.getElementById("root");
  if (!rootEl) {
    // root가 없으면 렌더 불가. 원인 파악용 로그만 남김.
    console.error("[J GameBox] #root element not found.");
    return;
  }

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
