export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
