/**
 * 랭킹용 닉네임 검증 — 반사신경·1 to 48 이 함께 쓴다.
 *
 * 이 검증은 브라우저에서만 돌기 때문에 콘솔에서 RPC 를 직접 호출하면 우회된다.
 * 그래서 DB 쪽 저장 함수(submit_reflex_score / submit_speed_score)에도
 * 같은 규칙이 들어가 있어야 한다. 규칙을 바꾸면 양쪽을 함께 고칠 것.
 */

export const NICKNAME_MAX = 10;

// 한글/영문/숫자/_ 만 허용
const VALID_PATTERN = /^[ㄱ-ㅎ가-힣a-zA-Z0-9_]+$/;

// 욕설/비속어 필터용 리스트 (원하는 대로 계속 추가해도 됨)
const BAD_WORDS = [
  "시발",
  "씨발",
  "병신",
  "느금",
  "ㅅㅂ",
  "ㅂㅅ",
  "fuck",
  "shit",
  "보지",
  "자지",
  "새끼",
  "잠지",
  "오랄",
  "사까",
  "꼬추",
  "꼬추년",
  "창녀",
  "개새끼",
  "씨빨",
  "씹쌔끼",
];

/** 문제가 없으면 null, 있으면 사용자에게 보여줄 메시지를 반환한다. */
export function validateNickname(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) return "닉네임을 입력하세요.";
  if (trimmed.length > NICKNAME_MAX) return `닉네임은 ${NICKNAME_MAX}자 이하`;

  if (!VALID_PATTERN.test(trimmed)) {
    return "한글/영문/숫자만 사용";
  }

  // 욕설 필터 (부분 포함도 막음)
  const lower = trimmed.toLowerCase();
  for (const bad of BAD_WORDS) {
    if (!bad) continue;
    if (lower.includes(bad.toLowerCase())) {
      return "사용할 수 없는 단어";
    }
  }

  return null;
}
