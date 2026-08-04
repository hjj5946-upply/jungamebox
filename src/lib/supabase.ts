import { createClient } from "@supabase/supabase-js";

// 환경변수에서 프로젝트 주소와 anon 키를 불러옴
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Missing env. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
}

// secret 키를 넣는 실수를 시작 시점에 잡는다.
// 이 값은 빌드 시 클라이언트 번들에 평문으로 박히므로 secret 키는 절대 들어가면 안 되고,
// Supabase 도 브라우저에서의 secret 키 사용을 401 로 차단한다.
// (그대로 두면 랭킹 조회 시점에야 "Forbidden use of secret API key in browser" 로 드러난다)
if (supabaseAnonKey?.startsWith("sb_secret_")) {
  console.error(
    "[Supabase] VITE_SUPABASE_ANON_KEY 에 secret 키(sb_secret_...)가 설정되어 있습니다.\n" +
      "  → 브라우저에서는 사용할 수 없어 모든 요청이 401 로 실패합니다.\n" +
      "  → Supabase 대시보드에서 이 키를 즉시 폐기(revoke)하고, publishable 키(sb_publishable_...)로 교체하세요.\n" +
      "  → .env 수정 후 개발 서버를 완전히 재시작해야 반영됩니다."
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
