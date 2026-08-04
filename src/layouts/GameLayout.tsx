//src/layouts/GameLayout.tsx
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import LogoMark from "../components/LogoMark";

type Props = {
  children: ReactNode;
  title: string;
};

export default function GameLayout({ children, title }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* 상단바 */}
      <header className="h-12 flex items-center px-4 bg-slate-800 border-b border-slate-700 shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-strong transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={30} />
        </button>
        {/* 파비콘 마크 하나 + 게임 제목만.
            LogoMark 는 currentColor 라서 text-strong 으로 테마에 맞춰 색이 바뀐다.
            (래스터 favicon 은 흰색 실루엣이라 라이트 모드 헤더에서 보이지 않았음) */}
        <div className="flex-1 flex min-w-0 items-center justify-center gap-2 text-lg font-semibold text-strong">
          <LogoMark className="h-6 w-auto shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        <div className="w-8"></div> {/* 중앙 정렬용 */}
      </header>

      {/* 게임 컨텐츠
          min-w-0: 자식이 컨테이너보다 넓어지려 할 때 flex 부모가 늘어나지 않도록 한다.
          (앱 셸이 overflow-hidden 이라 넘치면 스크롤이 아니라 잘려 보인다) */}
      <main className="flex min-w-0 flex-1 justify-center overflow-auto">
        <div className="w-full max-w-md p-4">
          {children}
        </div>
      </main>
    </div>
  );
}