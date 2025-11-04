import type { ReactNode } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
// import devMoneyImg from "/devMoney.png";
import coffeeImg from "/coffee.png";

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
        <div className="flex flex-row justify-end items-center gap-2 mb-2">
          {/* 국내용: 토스 */}
          {/* <a
            href="https://toss.me/hjj5946"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
          >
            <img src={devMoneyImg} alt="donate" className="w-4 h-4" />
            개발자 한번 도와주기 (Toss)
          </a> */}

          {/* 해외용: Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/hjj5946"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
          >
            <img src={coffeeImg} alt="donate" className="w-4 h-4" />
            개발자에게 음료한잔 사주기
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
