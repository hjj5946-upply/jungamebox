import MainLayout from "../layouts/MainLayout";

export default function Policy() {
  return (
    <MainLayout>
      <section className="space-y-3 text-slate-100 text-sm leading-7">
        <h1 className="text-lg font-semibold">개인정보처리방침</h1>

        <p>J GameBox(‘사이트’)는 서비스 제공에 필요한 최소한의 개인정보만 처리합니다.</p>

        <h2 className="mt-2 font-semibold">수집 항목 및 목적</h2>
        <ul className="list-disc pl-5">
          <li>필수: 접속 로그/브라우저 정보(보안·품질)</li>
          <li>선택: 문의 시 이메일 주소(답변)</li>
        </ul>

        <h2 className="mt-2 font-semibold">쿠키 및 광고</h2>
        <p>향후 Google AdSense 도입 시 Google/파트너가 쿠키·광고 식별자를 사용할 수 있습니다.</p>

        <h2 className="mt-2 font-semibold">보유기간/파기</h2>
        <p>법정 보관기간 또는 목적 달성 시 지체 없이 파기합니다.</p>

        <h2 className="mt-2 font-semibold">EEA/UK/CH 이용자</h2>
        <p>해당 지역에 광고 제공 시 Google 인증 CMP를 통해 동의를 수집합니다.</p>

        <h2 className="mt-2 font-semibold">문의</h2>
        <p>hjj5946@gmail.com</p>

        <p className="mt-2 text-xs text-slate-400">시행일: 2025-11-06</p>
      </section>
    </MainLayout>
  );
}
