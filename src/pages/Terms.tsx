import MainLayout from "../layouts/MainLayout";

const CONTACT_EMAIL = "hjj5946@gmail.com";

export default function Terms() {
  return (
    <MainLayout>
      <section className="space-y-3 text-slate-100 text-sm leading-7">
        <h1 className="text-lg font-semibold">이용약관</h1>

        <h2 className="mt-2 font-semibold">서비스의 성격</h2>
        <p>
          본 서비스는 오락/교육 목적의 <strong>비배팅·비금전성</strong> 미니게임을 제공하며,
          어떤 용도로든 자유롭게 사용할 수 있습니다.{" "}
          <strong>실제 금전 거래 및 배팅을 제공하지 않습니다.</strong>
        </p>
        <p>
          게임 화면에 표시되는 골드·포인트 등은 연출용 수치이며,
          현금이나 재화로 환전되거나 외부로 이전되지 않습니다.
        </p>

        <h2 className="mt-2 font-semibold">책임의 한계</h2>
        <p>서비스 이용 중 발생한 손해에 대해 법령이 허용하는 범위 내에서 책임을 부담하지 않습니다.</p>

        <h2 className="mt-2 font-semibold">지식재산권</h2>
        <p>사이트의 로고·UI·코드는 저작권법 보호를 받습니다.</p>

        <h2 className="mt-2 font-semibold">문의</h2>
        <p>
          오류 신고, 기능 제안, 콘텐츠·저작권 관련 문의는 아래 이메일로 보내주세요.
          별도의 문의 양식이나 게시판은 운영하지 않습니다.
        </p>
        <p>
          <a
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 font-medium
                       text-slate-100 underline decoration-slate-500 underline-offset-2
                       transition-colors hover:bg-slate-700 hover:decoration-slate-300
                       focus:outline-none focus:ring-2 focus:ring-slate-500"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("[J GameBox] 문의")}`}
          >
            ✉️ {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-xs text-slate-400">
          메일 앱이 열리지 않으면 위 주소를 복사해 사용해주세요.
        </p>

        <p className="mt-2 text-xs text-slate-400">시행일: 2025-11-06</p>
      </section>
    </MainLayout>
  );
}
