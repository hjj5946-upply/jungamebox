import { useRef, type ReactNode } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import ScrollHint from "../components/ScrollHint";
// import bmcImg from "../assets/bmc-brand-icon.webp";
import kakaoImg from "../assets/btn_send_small.webp";
// import githubImg from "../assets/github.webp";

type Props = { children: ReactNode };

export default function MainLayout({ children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    // ... 상단 레이아웃 유지 ...
    // 배경색 없음: 바탕은 #app-shell 의 bg-slate-900 이 깔고,
    // 그 위 PixelDrift 장식이 이 레이아웃을 통해 비쳐 보인다.
    <div className="relative flex h-full flex-col overflow-hidden">
      <TopBar />

      {/* 콘텐츠 영역: 남은 높이를 모두 차지하고 이 안에서만 스크롤된다.
          min-h-0 이 없으면 flex 자식이 내용 높이만큼 늘어나 내부 스크롤이 생기지 않는다.
          relative: ScrollHint 를 이 영역 하단에 겹쳐 놓기 위한 기준. */}
      <main className="relative flex min-h-0 flex-1 justify-center px-4">
        {/* no-scrollbar: 스크롤바를 숨기되 스크롤 자체는 유지 (대신 ScrollHint 로 유도) */}
        <div
          ref={scrollRef}
          className="no-scrollbar w-full max-w-md overflow-y-auto overscroll-contain pt-4 pb-8"
        >
          {children}
        </div>

        <ScrollHint scrollRef={scrollRef} />
      </main>

      {/* shrink-0: 콘텐츠 영역만 늘고 이 영역은 고정 높이를 유지해야 한다 */}
      <section className="mx-auto w-full max-w-6xl shrink-0 px-4">
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
                    className="rounded-lg max-h-10 w-100 object-contain"
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
        {/* 오락/교육 목적 고지 문구는 이용약관(pages/Terms.tsx)의 "서비스의 성격"으로 이전.
            여기서 빠진 높이는 위 콘텐츠 영역이 흡수한다. */}
      </section>

      <BottomBar />
    </div>
  );
}