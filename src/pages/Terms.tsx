import MainLayout from "../layouts/MainLayout";

export default function Terms() {
  return (
    <MainLayout>
      <section className="space-y-3 text-slate-100 text-sm leading-7">
        <h1 className="text-lg font-semibold">이용약관</h1>

        <p>본 서비스는 오락/교육 목적의 <strong>비배팅·비금전성</strong> 미니게임을 제공합니다.</p>

        <h2 className="mt-2 font-semibold">책임의 한계</h2>
        <p>서비스 이용 중 발생한 손해에 대해 법령이 허용하는 범위 내에서 책임을 부담하지 않습니다.</p>

        <h2 className="mt-2 font-semibold">지식재산권</h2>
        <p>사이트의 로고·UI·코드는 저작권법 보호를 받습니다.</p>

        <h2 className="mt-2 font-semibold">연락처</h2>
        <p>contact@jun-gamebox.com</p>

        <p className="mt-2 text-xs text-slate-400">시행일: 2025-11-06</p>
      </section>
    </MainLayout>
  );
}
