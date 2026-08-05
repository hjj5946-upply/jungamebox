import { useCallback, useEffect, useState } from "react";

/**
 * 라이트/다크 테마 상태.
 *
 * - 기본값은 다크. 저장된 값이 없으면 시스템 설정과 무관하게 다크로 시작한다.
 * - html 요소의 .dark 클래스로 전환하고(tailwind darkMode: "class"),
 *   실제 색은 src/index.css 의 CSS 변수가 담당한다.
 * - 첫 페인트 전에 index.html 의 인라인 스크립트가 같은 로직으로 클래스를 미리 붙여
 *   새로고침 시 흰 화면이 번쩍이는 현상을 막는다. (STORAGE_KEY 를 바꾸면 그쪽도 같이 수정)
 */

export type Theme = "light" | "dark";

export const STORAGE_KEY = "jgb-theme";

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    // 시크릿 모드 등에서 localStorage 접근이 막힐 수 있다.
    return null;
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");

  // 모바일 브라우저 상단 UI 색도 함께 맞춘다.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0f101c" : "#f7f8fc");
}

export function useTheme() {
  // 인라인 스크립트가 이미 클래스를 붙여둔 상태이므로 DOM 을 기준으로 초기화한다.
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // 저장 실패는 무시 — 이번 세션에만 적용된다.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}

// 초기 테마 결정 로직(인라인 스크립트와 동일). 필요 시 재사용.
export function resolveInitialTheme(): Theme {
  return readStored() ?? "dark";
}
