import type { ReactNode } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
// import bmcImg from "../assets/bmc-brand-icon.webp";
import kakaoImg from "../assets/btn_send_small.webp";
// import githubImg from "../assets/github.webp";

type Props = { children: ReactNode };

export default function MainLayout({ children }: Props) {
  return (
    // ... 상단 레이아웃 유지 ...
    <div className="relative flex min-h-dvh flex-col bg-slate-900">
      <TopBar />

      <main className="flex-1 overflow-auto flex justify-center px-4 pb-6 sm:pb-8">
        <div className="w-full max-w-md pt-4">
          {children}
        </div>
      </main>

      <section className="mx-auto w-full max-w-6xl px-4">
        {/* 도네이션 버튼 */}
        <div className="flex flex-col items-end gap-2 mb-2">
          {/* kakao (국내용) - 디자인 가이드 적용 */}
          {/* <div className="text-slate-100 text-sm font-semibold whitespace-nowrap mb-1">
            개발자 음료한잔 사주기 🙄
          </div> */}

          <div className="flex flex-row justify-end items-center gap-4"> 
          <div className="text-slate-100 text-sm font-semibold whitespace-nowrap">
              개발자 음료한잔 사주기 🙄
            </div>

            {/* GitHub Sponsors 버튼 */}            
            {/* <a
              href="https://github.com/sponsors/hjj5946-upply"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center
                bg-slate-600 hover:bg-slate-500
                rounded-[50px] shadow-md
                transition-colors
                px-8 py-3
              "
            >
              <div className="flex items-center gap-2">
                <img
                  src={githubImg}
                  alt="GitHub Sponsors"
                  className="w-6 h-6"
                />
                <span className="text-slate-100 text-xs font-semibold whitespace-nowrap">
                  Github 송금
                </span>
              </div>
            </a> */}
            
            {/* 카카오페이 버튼 */}
            <a
                href="https://link.kakaopay.com/__/kAMNmIW"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center transition-opacity hover:opacity-80 shadow-md rounded-lg"
            >
                <img 
                    src={kakaoImg} 
                    alt="카카오페이로 개발자 후원하기" 
                    className="rounded-lg max-h-12 w-auto" 
                /> 
                <span className="sr-only">카카오페이로 개발자 후원하기</span>
            </a>
          </div>

          {/* BMC (해외용) - 유지 */}
          {/* <a
            href="https://buymeacoffee.com/hjj5946"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-colors whitespace-nowrap min-w-[180px]"
          >
            <img src={bmcImg} alt="buy me a coffee" className="w-4 h-5" />
            개발자 버블티한잔 $
          </a> */}
        </div>
        
        {/* ... 하단 안내 문구 유지 ... */}
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