import type { ReactNode } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import coffeeImg from "/coffee.png";

type Props = { children: ReactNode };

export default function MainLayout({ children }: Props) {
  return (
    // h-screen 대신 min-h-dvh: 모바일 뷰포트 안정성
    <div className="relative flex min-h-dvh flex-col bg-slate-900">
      <TopBar />

      {/* 메인 영역에 하단 여백 확보: 푸터/안내와 겹침 방지 */}
      <main className="flex-1 overflow-auto flex justify-center px-4 pb-6 sm:pb-8">
        <div className="w-full max-w-md pt-4">
          {children}
        </div>
      </main>

      {/* ✅ absolute 삭제 → 일반 흐름으로 배치 */}
      <section className="mx-auto w-full max-w-6xl px-4">
        {/* 도네이션 버튼 */}
        <div className="flex flex-row justify-end items-center gap-2 mb-2">
          <a
            href="https://buymeacoffee.com/hjj5946"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-colors whitespace-nowrap"
          >
            <img src={coffeeImg} alt="donate" className="w-4 h-4" />
            개발자 버블티한잔 사주기
          </a>
        </div>

        {/* 안내 문구 */}
        <div className="max-w-md ml-auto mb-1">
          <p className="text-[11px] sm:text-xs text-slate-200/90 leading-relaxed text-left">
            본 서비스는 오락/교육 목적이며, 어떤 용도로든 자유롭게 사용 가능합니다. 실제 금전 거래 및 배팅을 제공하지 않습니다.
          </p>
        </div>
      </section>

      <BottomBar />
    </div>
  );
}
