import type { ReactNode } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="relative flex h-screen flex-col bg-slate-900">
      <TopBar />
      <main className="flex-1 overflow-auto flex justify-center">
        {/* 가운데 고정 폭 컨테이너 */}
        <div className="w-full max-w-md p-4">
          {children}
        </div>
      </main>
      {/* 바텀바 위쪽 안내 문구 */}
      <div className="absolute bottom-8 left-0 right-0 px-4 pb-2">
        {/* 도네이션 버튼 - 우측 정렬 */}
        <div className="flex justify-end mb-2">
          <a
            href="https://toss.me/jun"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-md"
          >
            😘 개발자 한번 도와주기
          </a>
        </div>
        {/* 안내 문구 */}
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-slate-100 leading-relaxed">
            해당 프로그램은 무료이며, 사용에 어떠한 제한도 없습니다. 방송이나 영상 등을 포함 어떤 용도로 자유롭게 사용하는 것을 허용합니다.
          </p>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
