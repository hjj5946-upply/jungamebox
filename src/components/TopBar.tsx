import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";
import Logo from "./Logo";

export default function TopBar() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    // relative: 로고는 가운데 정렬을 유지하고 버튼만 우측에 겹쳐 배치하기 위함
    <header
      onClick={() => navigate("/")}
      className="relative h-14 flex items-center justify-center px-4 bg-slate-800 border-b border-slate-700 shadow-sm cursor-pointer select-none hover:bg-slate-700 transition-colors"
    >
      {/* 로고에 워드마크가 포함되어 있어 별도 텍스트를 두지 않음.
          인라인 SVG + currentColor 라서 text-strong 으로 테마에 맞춰 색이 바뀐다.
          (라이트=거의 검정, 다크=흰색) */}
      <Logo className="h-7 w-auto text-strong" />

      {/* 라이트/다크 모드 전환.
          헤더 전체가 홈 이동 클릭 영역이므로 stopPropagation 으로 전파를 막는다. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        aria-pressed={isDark}
        title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-lg
                   text-slate-400 transition-colors
                   hover:bg-slate-700/70 hover:text-strong
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
      >
        {/* lucide 아이콘은 기본이 선(stroke) 형태 — 채움 없는 빈 아이콘 */}
        {isDark ? <Sun size={24} strokeWidth={1.75} /> : <Moon size={24} strokeWidth={1.75} />}
      </button>
    </header>
  );
}
