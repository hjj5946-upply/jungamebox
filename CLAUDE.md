# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 따라야 할 지침입니다.
프로젝트 전체 설명은 `README.md`를 참고하세요. 이 문서는 **작업 규칙**만 다룹니다.

---

## 프로젝트 한 줄 요약

**J GameBox** — React 19 + TypeScript + Vite 기반 한국형 미니게임 SPA. 23종 게임을 GitHub Pages(`jun-gamebox.com`)에 정적 배포. 인증 없음. Supabase는 랭킹 2종에만 사용.

---

## 🔒 보안 규칙 (최우선)

1. **`.env` 파일을 읽지 마세요.** `.claude/settings.json`에서 차단되어 있습니다. 환경변수 값이 필요해 보이는 상황이라도 파일을 열지 말고, 어떤 변수가 필요한지 **이름만** 안내하세요.
2. **API 키·토큰 값을 출력하거나 파일에 쓰지 마세요.** 로그·커밋 메시지·README·주석 어디에도 실제 값을 넣지 않습니다.
3. `VITE_` 접두사가 붙은 변수는 **빌드 시 클라이언트 번들에 평문으로 인라인**됩니다. 새 환경변수를 추가할 때 비밀값이라면 `VITE_` 접두사를 쓰면 안 되며, 애초에 이 프로젝트 구조(정적 SPA)에서는 비밀값을 클라이언트에 둘 수 없습니다. 필요하면 Supabase RPC/Edge Function 쪽으로 옮기는 것을 제안하세요.
4. Supabase 키는 **publishable(anon) 키만** 사용합니다. `service_role` / `sb_secret_...` 키가 코드나 설정에 보이면 즉시 사용자에게 알리고 회수를 권고하세요.

---

## 명령어

```bash
npm run dev      # 개발 서버 (localhost:5173)
npm run build    # tsc -b(타입검사) → vite build → dist/
npm run lint     # ESLint 전체
npm run preview  # 빌드 결과 로컬 서빙
```

**테스트 프레임워크가 없습니다.** 변경 검증은 `npm run build`(타입 검사 포함)와 `npm run lint`로 합니다. 코드를 수정했으면 최소 `npm run build`를 돌려 통과를 확인하세요.

개발 환경은 **Windows / PowerShell**입니다. 셸 명령은 그에 맞게 작성하세요.

---

## 아키텍처 필수 지식

### 레이아웃은 2종뿐

새 페이지는 반드시 둘 중 하나로 감쌉니다. 새 레이아웃을 만들지 마세요.

| 레이아웃 | 용도 | 특징 |
|---|---|---|
| `layouts/MainLayout.tsx` | 홈, 약관, 정책, 문의 | `min-h-dvh`, TopBar + 후원영역 + BottomBar |
| `layouts/GameLayout.tsx` | 모든 게임 페이지 | `h-screen` 고정, 뒤로가기 + `title` prop |

```tsx
import GameLayout from "../layouts/GameLayout";

export default function FooPage() {
  return <GameLayout title="게임명">{/* 본문 */}</GameLayout>;
}
```

### 라우팅

- **`HashRouter`** 사용 (`src/App.tsx`). 실제 URL은 `/#/games/foo`. GitHub Pages의 SPA 404 문제 회피용이므로 **`BrowserRouter`로 바꾸지 마세요** — 별도 요청 없이 바꾸면 배포가 깨집니다.
- 모든 라우트는 `src/App.tsx` 한 곳에 정적 import + `<Route>`로 등록됩니다. 라우트 정의를 다른 파일로 분산시키지 마세요.
- `vite.config.ts`의 `base: '/'`는 **커스텀 도메인 전용** 설정입니다. 건드리지 마세요.

### 상태 관리

전역 스토어(Redux/Zustand/Jotai)와 데이터 페칭 라이브러리(React Query/SWR)를 **의도적으로 쓰지 않습니다.** 각 페이지가 `useState`/`useRef`로 자기 상태를 소유합니다. 새로 도입하자고 제안하기 전에 사용자에게 확인하세요.

페이지 간 유일한 공유 상태는 밸런스월드컵 라운드 승자(`sessionStorage`의 `roundWinners`)입니다.

### Supabase 경계

- 페이지 컴포넌트는 **Supabase를 직접 호출하지 않습니다.** 반드시 `src/lib/leaderboard.ts` 또는 `src/lib/reflex.ts`를 경유합니다.
- `src/lib/supabase.ts`는 모듈 최상단에서 클라이언트를 생성하는 싱글톤입니다.
- **DB 실패가 게임 진행을 막아서는 안 됩니다.** 기존 패턴을 따라 `console.error` + 빈 값 반환으로 처리하고, 예외를 throw하거나 UI를 블로킹하지 마세요.

| 사용처 | DB 객체 |
|---|---|
| 밸런스월드컵 | `wins` 테이블(insert), `leaderboard` 뷰(select) |
| 반사신경 | `reflex_scores` 테이블(select), `submit_reflex_score` RPC(insert) |

---

## 코딩 컨벤션

### TypeScript — 엄격 설정에 걸리는 것들

`tsconfig.app.json`이 매우 엄격합니다. 다음은 **빌드 실패** 사유입니다.

- **미사용 변수/파라미터** (`noUnusedLocals`, `noUnusedParameters`) — 임시로 남긴 변수도 실패합니다.
- **타입 전용 import에 `type` 키워드 누락** (`verbatimModuleSyntax`)
  ```tsx
  import type { GameMeta } from "../data/games";  // ✅
  import { GameMeta } from "../data/games";        // ❌ 빌드 실패
  ```
- **`enum`, 파라미터 프로퍼티 등 런타임 코드를 생성하는 문법** (`erasableSyntaxOnly`) — `enum` 대신 `as const` 객체나 유니온 타입을 쓰세요.
- **switch fallthrough** (`noFallthroughCasesInSwitch`)

### 스타일링

- **Tailwind CSS v3**입니다. v4 문법(`@import "tailwindcss"` 등)을 쓰지 마세요. 설정은 `tailwind.config.js`의 `content` 배열 방식입니다.
- CSS 모듈 / styled-components / 인라인 style 객체를 쓰지 않습니다. **Tailwind 유틸리티 클래스를 JSX에 직접** 작성합니다.
- 색상은 **`slate` 계열 다크 테마 고정**입니다 (`bg-slate-900` 배경, `bg-slate-800` 카드/바, `text-slate-200` 본문, `border-slate-700`). 라이트 모드가 없으므로 `dark:` 변형을 추가하지 마세요.
- 본문 최대 폭은 `max-w-md` (모바일 우선). 새 게임도 이 폭 안에서 동작해야 합니다.
- 커스텀 애니메이션이 필요하면 `src/index.css`에 키프레임을 추가합니다 (현재 `bounceIn` 1종).
- **폰트는 Pretendard 가변폰트**입니다. `tailwind.config.js`의 `fontFamily.sans` 한 곳에서 지정하고, Tailwind preflight가 `html` 요소에 적용해 전체에 반영됩니다. 개별 컴포넌트에 `font-family`를 직접 쓰지 마세요.
  - `font-bold`, `font-semibold` 같은 **굵기 유틸리티는 그대로 사용**합니다. 가변폰트가 45~920 범위를 커버하므로 모든 굵기가 실제 굵기로 렌더됩니다.
  - `font-mono`는 **건드리지 않았습니다.** 퀴즈 선택지(`A. B. C.`), 나도아나운서 타이머, 타이밍캐치 숫자가 자리폭 정렬을 위해 등폭을 쓰므로 유지해야 합니다.
  - `main.tsx`의 monospace 스타일은 **개발자도구 콘솔 배너용**이라 페이지 폰트와 무관합니다.

### 애니메이션 / 물리

기존 선택을 따르세요. 새 라이브러리를 추가하지 마세요.

| 용도 | 도구 | 사용 예 |
|---|---|---|
| 타임라인 애니메이션 | **GSAP** | `StrengthPage`, `CardPage`, `BingoPage`, `RacePage`, `TimingPage` |
| 2D 물리 | **planck-js** | `DicePage`, `components/pinball/PinballCanvas` |
| 파티클 / 캔버스 | Canvas + `requestAnimationFrame` | `Confetti`, `PinballCanvas` |
| 단순 전환 | Tailwind `transition-*` | `GameGrid`, `GameCard` |
| 아이콘 | `lucide-react` | `GameLayout`, `LiarPage` |

### 이미지 / 정적 자산

**포맷은 WebP입니다.** 새 이미지를 추가할 때도 WebP로 변환해서 넣으세요 (PNG는 아래 예외만 남아 있습니다).

자산의 위치는 **누가 참조하는지**로 결정됩니다.

| 위치 | 참조 방식 | 대상 |
|---|---|---|
| `src/assets/` | `import x from "../assets/x.webp"` | 코드에서 import하는 모든 이미지 (게임 타일, 강화 무기, 스탬프, 로고 등) |
| `public/` | 문자열 경로 `"/foo/bar.webp"` | 런타임 문자열로 참조되는 것 + 정적 파일(`index.html`, `manifest.json`)이 참조하는 것 |

```tsx
import diceImg from "../assets/dice.webp";                      // ✅ 코드 import
{ name: "메로나", image: "/balanceGameData/iceCream_24.webp" }  // ✅ 데이터 내 런타임 문자열 → public 유지
```

- `src/assets/`로 넣으면 Vite가 **해시를 붙여 번들**하므로 캐시 무효화가 자동 처리됩니다. 4KB 미만은 base64로 인라인됩니다.
- 이미지를 import하는 파일은 모두 `src/` 한 단계 아래(`pages/`, `layouts/`, `components/`, `data/`)에 있으므로 경로는 항상 **`../assets/`** 입니다.
- `public/balanceGameData/`(**44개 전부 WebP**)는 데이터 파일이 **런타임 문자열 경로**로 참조하므로 public에 남겨둡니다. 여기에 항목을 추가할 때도 WebP로 변환해 public에 넣고 문자열로 지정하세요. 런타임 문자열이라 **경로 오타를 빌드가 잡아주지 않습니다** — 파일명을 반드시 대조하세요.

**PNG로 남아야 하는 예외 (WebP로 바꾸지 마세요):**

| 파일 | 이유 |
|---|---|
| `public/favicon.png` | `index.html`(절대 URL)과 `manifest.json`이 참조하는 정적 파일이라 `src/assets`에서 import할 수 없습니다. 앱 내부 로고용으로는 `src/assets/favicon.webp` 사본을 씁니다(`TopBar`, `GameLayout`). |
| `public/favicon.ico` | `.ico` 포맷 필수 |
| `apple-touch-icon.png` | iOS가 WebP 미지원. 현재 `index.html`이 참조하지만 **파일이 없는 상태** — 별도 이슈 |
| `public/ogImage.png` | OG 이미지. 카카오톡·페이스북 등 SNS 크롤러의 `og:image` WebP 지원이 불안정하므로 **JPG 유지** |

### 주석 / 언어

- 주석과 UI 문자열은 **한국어**로 작성합니다.
- 기존 코드의 주석 밀도와 스타일을 따르세요.

---

## 자주 하는 작업

### 게임 추가

4곳을 모두 손대야 합니다. 하나라도 빠지면 접근 불가하거나 홈에 안 뜹니다.

1. `src/pages/NewGamePage.tsx` — `GameLayout`으로 감싼 컴포넌트
2. `src/App.tsx` — `<Route path="/games/new" element={<NewGamePage />} />`
3. `src/assets/new.webp` — 타일 아이콘 (WebP)
4. `src/data/games.ts`의 `GAME_LIST` — 항목 추가 + `import newImg from "../assets/new.webp"`

`GAME_LIST` **배열 순서가 곧 홈 화면 표시 순서**이고, `GameGrid`의 `PAGE_SIZE = 16` 기준으로 페이지가 나뉩니다. 현재 23개 → 2페이지(16 + 7). 항목을 추가/삭제하면 페이지 경계가 밀리므로, 순서를 바꿀 때는 4개 단위 행 정렬을 의식하세요 (`src/data/games.ts`에 이미 `// Page 1` / `// Page 2` 주석으로 구분되어 있습니다).

필요 시 `public/sitemap.xml`에도 URL을 추가합니다.

### 콘텐츠(문항·항목)만 추가

`src/data/*.ts`의 해당 배열에 항목을 추가하면 됩니다. **게임 로직을 수정할 필요가 없습니다.** 데이터 파일이 크므로(예: `quizData.ts` 1,292줄) 전체를 읽지 말고 필요한 배열 구간만 확인해 Edit하세요.

| 대상 | 파일 |
|---|---|
| 퀴즈 문항 | `data/quizData.ts` (`ALL_QUIZ_DATA`) |
| 밸런스 항목 | `data/balanceGameData.ts` (`categories`) + `public/balanceGameData/` 이미지 |
| 명언 | `data/quotes.ts` (`QUOTES`) |
| 라이어 제시어 | `data/liarData.ts` (`WORDS`) |
| 발음 문장 | `data/phrases.ts` (`PHRASES`) |
| "만약에" 질문 | `data/ifelseQuestions.ts` (`IFELSE_QUESTIONS`) |

### 홈에 숨겨진 게임 노출

`pinball`, `ladder`는 라우트와 구현이 있지만 `src/data/games.ts`에서 타일이 주석 처리되어 있습니다. 노출하려면 해당 주석만 해제하면 됩니다.
`telepathy`, `mole`, `puzzle`, `versus`는 **이미지 자산만 있고 구현이 없습니다** — 주석을 풀면 깨집니다.

---

## 주의할 파일

| 파일 | 주의사항 |
|---|---|
| `src/pages/StrengthPage.tsx` | 824줄 중 **314줄 이후는 전부 주석 처리된 구버전 구현**입니다. 활성 컴포넌트는 ~299줄까지. 주석 블록을 되살리거나 참조하지 마세요. |
| `src/pages/SudokuPage.tsx` | `GameLayout` return이 2곳(로딩 상태·본 화면)입니다. 한쪽만 수정하지 않도록 주의. |
| `src/data/games.ts` | 주석 처리된 import와 타일이 섞여 있습니다. 미사용 import를 살리면 `noUnusedLocals`로 빌드가 깨질 수 있습니다. |
| `index.html` | SEO 메타·OG·JSON-LD·파비콘이 전부 여기 있습니다. 절대 URL(`https://jun-gamebox.com/...`)로 하드코딩되어 있으므로 도메인 변경 시 일괄 수정 필요. |
| `.github/workflows/deploy.yml` | `VITE_*`를 GitHub Variables/Secrets에서 주입합니다. 환경변수 이름을 바꾸면 이 파일도 함께 고쳐야 배포된 사이트의 랭킹이 죽지 않습니다. |
| `public/sitemap.xml` | 현재 URL이 구 GitHub Pages 주소(`hjj5946-upply.github.io`)를 가리켜 canonical과 불일치합니다. 알려진 이슈. |
| `src/components/BottomBar.tsx` | 버전 문자열(`v1.0.9`)이 하드코딩되어 있고 `package.json`(`0.0.0`)과 다릅니다. 버전 표기를 바꿀 땐 여기를 수정. |

---

## 배포

`main` 브랜치 push 시 `.github/workflows/deploy.yml`이 자동 실행 → `dist/`를 GitHub Pages에 배포합니다.

- 커밋/푸시는 **사용자가 명시적으로 요청할 때만** 하세요. `main`에 푸시하면 곧바로 프로덕션에 배포됩니다.
- 배포 전 `npm run build`가 로컬에서 통과하는지 확인하세요. CI에서 `tsc -b`가 먼저 돌기 때문에 타입 오류는 배포 실패로 직결됩니다.

---

## 하지 말 것

- `.env` 읽기, 키 값 출력
- `HashRouter` → `BrowserRouter` 변경, `vite.config.ts`의 `base` 변경
- 상태관리/데이터페칭/UI 컴포넌트 라이브러리 임의 도입
- Tailwind v4 문법 사용, 라이트 모드(`dark:` 변형) 추가
- 새 레이아웃 컴포넌트 생성
- `StrengthPage.tsx`의 주석 처리된 구버전 코드 부활
- 요청받지 않은 커밋/푸시
