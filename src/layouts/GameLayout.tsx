//src/layouts/GameLayout.tsx
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import logo from '/favicon.png';

type Props = {
  children: ReactNode;
  title: string;
};

export default function GameLayout({ children, title }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col bg-slate-900">
      {/* 상단바 */}
      <header className="h-12 flex items-center px-4 bg-slate-800 border-b border-slate-700 shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={30} />
        </button>
        <div className="flex-1 flex items-center justify-center text-lg font-semibold text-white">
          <img src={logo} alt="logo" className="w-6 h-6 mr-2" />
          {title}
        </div>
        <div className="w-8"></div> {/* 중앙 정렬용 */}
      </header>

      {/* 게임 컨텐츠 */}
      <main className="flex-1 overflow-auto flex justify-center">
        <div className="w-full max-w-md p-4">
          {children}
        </div>
      </main>
    </div>
  );
}