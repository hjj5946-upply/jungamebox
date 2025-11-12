import { createClient } from "@supabase/supabase-js";

// 환경변수에서 프로젝트 주소와 anon 키를 불러옴
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Missing env. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
