export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // html 요소의 .dark 클래스로 테마를 전환한다 (src/lib/theme.ts 가 토글)
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // slate 를 CSS 변수로 재정의 → 기존 slate-* 클래스가 테마에 자동 반응한다.
        // 실제 색 값과 램프 방향은 src/index.css 의 :root / .dark 참고.
        slate: {
          50: "rgb(var(--s-50) / <alpha-value>)",
          100: "rgb(var(--s-100) / <alpha-value>)",
          200: "rgb(var(--s-200) / <alpha-value>)",
          300: "rgb(var(--s-300) / <alpha-value>)",
          400: "rgb(var(--s-400) / <alpha-value>)",
          500: "rgb(var(--s-500) / <alpha-value>)",
          600: "rgb(var(--s-600) / <alpha-value>)",
          700: "rgb(var(--s-700) / <alpha-value>)",
          800: "rgb(var(--s-800) / <alpha-value>)",
          900: "rgb(var(--s-900) / <alpha-value>)",
          950: "rgb(var(--s-950) / <alpha-value>)",
        },
        // 최대 대비 글자색. 기존 text-white 중 "중립 배경 위" 용도를 이걸로 대체.
        // (유채색 버튼 위의 text-white 는 흰색이어야 하므로 그대로 둔다)
        strong: "rgb(var(--text-strong) / <alpha-value>)",
        // 반투명 오버레이용. 다크=흰색, 라이트=검정 → border-veil/10 처럼 사용.
        veil: "rgb(var(--veil) / <alpha-value>)",
      },
      fontFamily: {
        // 기본 sans 스택을 Pretendard 로 교체.
        // Tailwind preflight 가 html 요소에 theme.fontFamily.sans 를 적용하므로
        // 이 한 곳만 바꾸면 프로젝트 전체 텍스트에 반영된다.
        // font-mono(퀴즈 선택지·타이머 숫자 등 자리폭 정렬용)는 건드리지 않으므로 등폭 유지.
        sans: [
          '"Pretendard Variable"',
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
