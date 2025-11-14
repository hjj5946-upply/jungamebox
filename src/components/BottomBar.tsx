import { Link } from "react-router-dom";

export default function BottomBar() {
  return (
    <footer className="w-full border-t border-slate-700 bg-slate-800 text-xs text-slate-400">
      {/* 콘텐츠 래퍼: 높이 고정 + 수직 중앙 정렬 */}
      <div className="mx-auto flex max-w-6xl min-h-12 items-center justify-between gap-2 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span>© 2025 Jun　</span>
          <span>v1.0.8</span>
        </div>
        {/* 좁은 화면 줄바꿈 대응 */}
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link to="/contact" className="rounded-sm transition-colors hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500">
            Contact
          </Link>
          <Link to="/terms" className="rounded-sm transition-colors hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500">
            이용약관
          </Link>
          <Link to="/policy" className="rounded-sm transition-colors hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500">
            개인정보처리방침
          </Link>
        </nav>
      </div>
      {/* iOS 하단 홈바 안전여백: 콘텐츠 밖으로 분리해 시각적 중앙 유지 */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </footer>
  );
}
