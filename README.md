# 🎮 J GameBox

> **설치 없이 브라우저에서 바로 즐기는 한국형 미니게임 모음 웹앱**
>
> 음료내기, 로또번호생성, 밸런스월드컵, 라이어게임, 제비뽑기, 무기강화 등
> 일상 속 가벼운 게임 23종을 무료로 제공합니다.

🔗 **서비스:** [https://jun-gamebox.com](https://jun-gamebox.com)

![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222222?logo=github)

---

## 📑 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [빠른 시작](#-빠른-시작)
4. [환경변수 설정](#-환경변수-설정)
5. [Supabase 백엔드 스키마](#-supabase-백엔드-스키마)
6. [프로젝트 구조](#-프로젝트-구조)
7. [아키텍처](#-아키텍처)
8. [라우팅 맵](#-라우팅-맵)
9. [게임 목록](#-게임-목록)
10. [데이터 레이어](#-데이터-레이어)
11. [빌드 & 배포](#-빌드--배포)
12. [SEO / PWA](#-seo--pwa)
13. [개발 컨벤션](#-개발-컨벤션)
14. [알려진 제약 및 개선 여지](#-알려진-제약-및-개선-여지)
15. [라이선스](#-라이선스)

---

## 🚀 프로젝트 개요

**J GameBox**는 회원가입·로그인 없이 즉시 실행되는 SPA(Single Page Application) 미니게임 플랫폼입니다.

| 항목 | 내용 |
|------|------|
| 서비스 형태 | 정적 SPA (클라이언트 렌더링) |
| 대상 기기 | 모바일 우선 / 데스크탑 대응 (반응형) |
| 인증 | **없음** — `persistSession: false`, 익명 사용 |
| 게임 수 | 홈 그리드 노출 23종 + 비노출 라우트 2종(핀볼·사다리) |
| 서버 의존성 | 대부분 100% 클라이언트 연산. Supabase는 **랭킹 2종에만** 사용 |
| 언어 / 인코딩 | 한국어 / UTF-8 |
| 배포 | GitHub Actions → GitHub Pages (커스텀 도메인) |

**설계 원칙**

- **서버리스 우선** — 게임 로직·난수·물리는 전부 브라우저에서 처리. Supabase가 죽어도 랭킹 표시를 제외한 모든 게임이 정상 동작합니다.
- **레이아웃 2종으로 통일** — 모든 페이지가 `MainLayout` 또는 `GameLayout` 중 하나를 사용해 일관된 셸을 유지합니다.
- **데이터와 렌더의 분리** — 문항·항목·명언 등 정적 콘텐츠는 전부 `src/data/*.ts`에 상수로 분리되어 있어, 게임 로직 수정 없이 콘텐츠만 추가할 수 있습니다.

---

## 🛠 기술 스택

### 런타임 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `react` / `react-dom` | ^19.1.1 | UI 렌더링 (React 19) |
| `react-router-dom` | ^7.9.5 | 클라이언트 라우팅 (**BrowserRouter**) |
| `@supabase/supabase-js` | ^2.86.2 | 랭킹 저장/조회 (BaaS) |
| `gsap` | ^3.15.0 | 타임라인 기반 애니메이션 (강화·카드·빙고·레이스·타이밍) |
| `planck-js` | ^1.3.0 | 2D 물리 엔진 (주사위, 핀볼) |
| `lucide-react` | ^0.552.0 | 아이콘 |
| `pretendard` | ^1.3.9 | 본문 폰트 (가변폰트 + 동적 서브셋, 자체 호스팅) |

### 개발 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `vite` | ^7.1.7 | 번들러 / 개발 서버 |
| `@vitejs/plugin-react-swc` | ^4.1.0 | SWC 기반 React 트랜스폼 (Babel 대비 고속) |
| `typescript` | ~5.9.3 | 타입 시스템 (strict 모드) |
| `tailwindcss` | ^3.4.18 | 유틸리티 CSS |
| `postcss` / `autoprefixer` | ^8.5.6 / ^10.4.21 | CSS 후처리 |
| `eslint` + `typescript-eslint` | ^9.36.0 / ^8.45.0 | 린팅 (Flat Config) |
| `eslint-plugin-react-hooks` | ^5.2.0 | Hooks 규칙 검사 |
| `eslint-plugin-react-refresh` | ^0.4.22 | HMR 안전성 검사 |

### 사용하지 않는 것

상태관리 라이브러리(Redux/Zustand/Jotai), 데이터 페칭 라이브러리(React Query/SWR), 테스트 프레임워크, UI 컴포넌트 라이브러리는 **도입하지 않았습니다.** 상태는 각 페이지의 `useState`/`useRef`로 로컬 관리하며, 전역 상태가 없습니다.

---

## ⚡ 빠른 시작

### 요구 사항

- **Node.js 20 이상** (CI가 Node 20 기준)
- npm

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 파일 생성 (아래 "환경변수 설정" 참고)
#    프로젝트 루트에 .env 생성

# 3. 개발 서버 실행 (http://localhost:5173)
npm run dev
```

### npm 스크립트

| 명령 | 동작 |
|------|------|
| `npm run dev` | Vite 개발 서버 실행 (HMR) |
| `npm run build` | `tsc -b`로 타입 검사 후 `vite build` → `dist/` 생성 |
| `npm run preview` | 빌드 결과물을 로컬에서 정적 서빙 |
| `npm run lint` | ESLint 전체 검사 |

> ⚠️ `npm run build`는 타입 오류가 하나라도 있으면 **빌드가 중단됩니다.** (`tsc -b`가 선행) 또한 `noUnusedLocals` / `noUnusedParameters`가 켜져 있어 미사용 변수도 빌드 실패 사유입니다.

---

## 🔑 환경변수 설정

`.env`는 `.gitignore`에 포함되어 있어 커밋되지 않습니다. 로컬 실행 시 루트에 직접 생성하세요.

```bash
# .env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
```

**값을 가져오는 곳:** Supabase 대시보드 → **Project Settings → API (API Keys)**

| 변수 | 대시보드 항목 | 비고 |
|------|--------------|------|
| `VITE_SUPABASE_URL` | Project URL | 끝에 슬래시(`/`) 붙이지 말 것 |
| `VITE_SUPABASE_ANON_KEY` | `anon` / `public` 키 (신규 형식: `sb_publishable_...`) | **`service_role`(`sb_secret_...`) 키 절대 금지** |

### 🚨 주의사항

- **secret 키를 넣으면 안 됩니다.** `VITE_` 접두사가 붙은 변수는 Vite가 빌드 시 클라이언트 번들에 **평문으로 인라인**합니다. `service_role` / `sb_secret_` 키를 넣으면 RLS를 우회하는 권한이 전 세계에 공개됩니다.
- 값에 따옴표를 붙이지 마세요. (`VITE_SUPABASE_URL="https://..."` ❌)
- **`.env` 수정 후에는 개발 서버를 완전히 재시작해야 합니다.** Vite는 환경변수를 프로세스 시작 시점에만 읽으므로 HMR로는 반영되지 않습니다.

### 환경변수 누락 시 증상

`src/lib/supabase.ts`가 시작 시점에 값을 검사하고 콘솔에 경고를 남긴 뒤, `createClient`가 예외를 던집니다.

```
[Supabase] Missing env. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
Uncaught Error: supabaseUrl is required.
```

---

## 🗄 Supabase 백엔드 스키마

Supabase는 **밸런스월드컵 우승 통계**와 **반사신경 랭킹** 두 기능에만 사용됩니다. 코드가 기대하는 객체는 다음과 같습니다.

### 1) 밸런스월드컵 — `src/lib/leaderboard.ts`

| 객체 | 종류 | 코드가 요구하는 형태 |
|------|------|---------------------|
| `wins` | 테이블 | `insert({ category: text, item: text })` — 우승 1건마다 행 추가 |
| `leaderboard` | 뷰(권장) | `select("item, wins")` + `.eq("category", …)` + `.order("wins", desc)` + `.limit(50)` |

`leaderboard`는 `wins`를 `category, item`으로 집계한 뷰로 만드는 것이 자연스럽습니다.

```sql
create table if not exists public.wins (
  id         bigint generated always as identity primary key,
  category   text not null,
  item       text not null,
  created_at timestamptz not null default now()
);

create or replace view public.leaderboard as
  select category, item, count(*)::int as wins
  from public.wins
  group by category, item;
```

- **호출 지점:** `BalancePage`가 결승 종료 시 `recordWinner(category, item)` 호출 → `LeaderboardPanel`이 카테고리 변경 시마다 `fetchLeaderboard(category)` 호출.
- **에러 처리:** 두 함수 모두 실패 시 `console.error`만 남기고 조회는 빈 배열을 반환합니다. 즉 **DB 장애가 게임 진행을 막지 않습니다.**

### 2) 반사신경 랭킹 — `src/lib/reflex.ts`

| 객체 | 종류 | 코드가 요구하는 형태 |
|------|------|---------------------|
| `reflex_scores` | 테이블 | 컬럼 `id`, `latency_ms`, `nickname`, `created_at` |
| `submit_reflex_score` | RPC 함수 | 인자 `p_latency` (숫자), `p_nickname` (텍스트) |

조회는 `latency_ms` 오름차순 → `created_at` 오름차순으로 **상위 10건**만 가져옵니다. 저장은 테이블 직접 insert가 아니라 **RPC를 경유**하므로, 상위 10개만 유지하는 정리 로직을 함수 안에 둘 수 있습니다.

```sql
create table if not exists public.reflex_scores (
  id         bigint generated always as identity primary key,
  latency_ms integer not null,
  nickname   text not null,
  created_at timestamptz not null default now()
);
```

### 3) 1 to 48 랭킹 — `src/lib/speedrun.ts`

| 객체 | 종류 | 코드가 요구하는 형태 |
|------|------|---------------------|
| `speed_scores` | 테이블 | 컬럼 `id`, `elapsed_ms`, `nickname`, `created_at` |
| `submit_speed_score` | RPC 함수 | 인자 `p_elapsed` (숫자), `p_nickname` (텍스트) |

조회는 `elapsed_ms` 오름차순 → `created_at` 오름차순으로 **상위 10건**만 가져옵니다. 저장 RPC 는 삽입 후 11위 이하를 삭제하므로 테이블에는 항상 10행만 남습니다.

**전체 스키마·정책·함수는 `supabase/speed_scores.sql` 에 있습니다** (Supabase SQL Editor 에 통째로 붙여 실행). 이 함수는 `elapsed_ms` 를 7,000~600,000ms 로 제한하고 닉네임 문자셋을 검사합니다 — anon 키가 번들에 노출되어 있어 브라우저 검증만으로는 위조 기록을 막을 수 없기 때문입니다.

### RLS 정책

브라우저에 노출되는 **publishable(anon) 키만** 사용하므로 RLS는 필수입니다. 최소 구성:

- `wins` — anon **insert 허용**, select는 뷰를 통해서만
- `leaderboard` 뷰 — anon **select 허용**
- `reflex_scores` — anon **select 허용**, 직접 insert는 **차단** (저장은 `security definer` RPC로만)
- `speed_scores` — 위와 동일 (select 허용 / 직접 insert 차단 / `submit_speed_score` RPC 로만 저장)

---

## 📁 프로젝트 구조

```
jungamebox/
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages 자동 배포 워크플로
├── public/                     # 정적 자산 (빌드 시 그대로 복사, 해시 없음)
│   ├── balanceGameData/        # 밸런스월드컵 항목 이미지 44개 WebP (런타임 문자열 경로로 참조)
│   ├── manifest.json           # PWA 매니페스트
│   ├── robots.txt / sitemap.xml
│   ├── favicon.ico / favicon.png    # index.html·manifest.json 이 참조 → PNG 유지 필수
│   ├── ogImage.png            # OG 이미지 (1200×630)
│   └── google*.html, naver*.html    # 검색엔진 소유권 확인 파일
├── src/
│   ├── main.tsx                # 진입점: 콘솔 배너 + createRoot 부트스트랩
│   ├── App.tsx                 # 앱 셸 + BrowserRouter 라우트 테이블 (단일 소스)
│   ├── index.css               # Tailwind 지시자 + bounceIn 커스텀 키프레임
│   ├── assets/                 # 코드에서 import하는 이미지 69개 (전부 WebP, Vite 번들·해시 대상)
│   │   ├── sword0~20.webp      # 무기강화 단계별 이미지 (21단계)
│   │   ├── stamp1~10.webp      # 1빠정하기 레이스 스탬프
│   │   ├── favicon.webp        # 앱 내부 로고 (TopBar / GameLayout)
│   │   └── *.webp              # 게임 타일 아이콘 (dice, lotto, slot, …)
│   ├── layouts/
│   │   ├── MainLayout.tsx      # 홈/정책 페이지용 셸 (TopBar + 후원 + BottomBar)
│   │   └── GameLayout.tsx      # 게임 페이지용 셸 (뒤로가기 + 타이틀)
│   ├── components/
│   │   ├── TopBar.tsx          # 상단바 (클릭 시 홈 이동)
│   │   ├── BottomBar.tsx       # 하단바 (버전, 약관/정책/문의 링크)
│   │   ├── GameGrid.tsx        # 4열 그리드 + 스와이프 페이지네이션
│   │   ├── GameCard.tsx        # 게임 타일 1개
│   │   ├── Confetti.tsx        # Canvas 축포 이펙트
│   │   ├── LeaderboardPanel.tsx        # 밸런스월드컵 우승 통계 패널
│   │   ├── ReflexLeaderboardPanel.tsx  # 반사신경 TOP 10 패널
│   │   └── pinball/
│   │       └── PinballCanvas.tsx       # planck-js 물리 렌더 캔버스
│   ├── pages/                  # 게임 1종 = 파일 1개 (총 32개)
│   ├── data/                   # 정적 콘텐츠 상수
│   │   ├── games.ts            # 홈 그리드 게임 메타 목록
│   │   ├── balanceGameData.ts  # 밸런스월드컵 카테고리·항목 (696줄)
│   │   ├── quizData.ts         # 퀴즈 문항 (1,292줄)
│   │   ├── quotes.ts           # 명언 (443줄)
│   │   ├── phrases.ts          # 발음 연습 문장 (난이도 3단계)
│   │   ├── liarData.ts         # 라이어게임 카테고리·제시어 (20종)
│   │   └── ifelseQuestions.ts  # "만약에" 질문
│   └── lib/
│       ├── supabase.ts         # Supabase 클라이언트 싱글톤
│       ├── leaderboard.ts      # 밸런스월드컵 우승 저장/조회
│       └── reflex.ts           # 반사신경 기록 저장/조회
├── index.html                  # SEO 메타 · OG · JSON-LD · 파비콘 전량
├── vite.config.ts
├── tailwind.config.js / postcss.config.js
├── eslint.config.js            # Flat Config
└── tsconfig.json / tsconfig.app.json / tsconfig.node.json
```

---

## 🏗 아키텍처

### 전체 흐름

```
                    ┌──────────────────────────────┐
  브라우저 요청  →   │  index.html (SEO/OG/JSON-LD) │
                    │   └ <div id="root"> 폴백 문구  │
                    └──────────────┬───────────────┘
                                   ↓
                          src/main.tsx (부트스트랩)
                            · 콘솔 ASCII 배너 1회
                            · createRoot + StrictMode
                                   ↓
                          src/App.tsx (BrowserRouter)
                                   ↓
              ┌────────────────────┴────────────────────┐
              ↓                                         ↓
       MainLayout                                 GameLayout
    (홈 · 약관 · 정책 · 문의)                     (게임 28개 라우트)
       └ TopBar                                    └ 뒤로가기 + 타이틀
       └ GameGrid ← data/games.ts                  └ 게임 본문
       └ 후원 버튼 (카카오페이)                          ↓
       └ BottomBar                          ┌─────────┴─────────┐
                                            ↓                   ↓
                                    순수 클라이언트 게임    Supabase 연동 게임
                                    (23종 — 난수/물리/타이머)  (밸런스, 반사신경)
                                                                ↓
                                                     src/lib/{leaderboard,reflex}.ts
                                                                ↓
                                                     src/lib/supabase.ts (싱글톤)
                                                                ↓
                                                       Supabase (PostgREST / RPC)
```

### 레이아웃 2종

| | `MainLayout` | `GameLayout` |
|---|---|---|
| 사용처 | `HomePage`, `Terms` | 게임 페이지 전체 |
| 높이 | `min-h-dvh` (내용 따라 늘어남) | `h-screen` (고정, 내부 스크롤) |
| 상단 | `TopBar` (로고 + 홈 이동) | 뒤로가기 버튼 + 게임 타이틀 |
| 하단 | 후원 버튼 + 고지 문구 + `BottomBar` | 없음 |
| 본문 폭 | `max-w-md` 중앙 정렬 | `max-w-md` 중앙 정렬 |

`GameLayout`의 `title` prop이 화면 헤더 텍스트가 되며, 일부 페이지는 SEO를 의식해 `"랜덤 카드 뽑기 | J GameBox"`처럼 서비스명을 덧붙여 사용합니다.

### 상태 관리

전역 스토어가 없습니다. 각 게임 페이지가 자신의 상태를 `useState`로 소유하고, 애니메이션 핸들·타이머 ID·물리 월드처럼 렌더와 무관한 값은 `useRef`에 보관합니다. 페이지 간 공유가 필요한 유일한 케이스인 밸런스월드컵 라운드 승자는 `sessionStorage`(`roundWinners`)를 사용합니다.

### 홈 그리드 (`GameGrid`)

- `PAGE_SIZE = 16` — 4×4 그리드. 현재 23개 게임이므로 **2페이지**(16 + 7).
- 터치(`onTouchStart`/`onTouchEnd`)와 마우스 드래그(`onMouseDown`/`onMouseUp`) 양쪽 지원. 좌우 이동 임계값 **50px**.
- 전환은 `translate-x-full` + `opacity` Tailwind 트랜지션(300ms)에 `setTimeout(200ms)` 페이지 교체를 맞춘 방식.
- 하단에 화살표 + 도트 인디케이터.

### 애니메이션·물리 전략

| 방식 | 사용 페이지 |
|------|------------|
| **GSAP** | `StrengthPage`(강화 연출), `CardPage`, `BingoPage`, `RacePage`, `TimingPage` |
| **planck-js** (2D 물리) | `DicePage`(주사위 낙하), `PinballCanvas`(중력 7.5, 1m=50px 스케일, 월드 높이 = 가시 영역의 2.6배) |
| **Canvas + rAF** | `Confetti`, `PinballCanvas` |
| **CSS 키프레임** | `index.css`의 `bounceIn` → `.animate-bounce-in` |
| **Web Audio / Audio** | `ReadingPage`, `TimerPage`, `TimingPage` 등 효과음 |

### Supabase 클라이언트

```ts
// src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },   // 익명 서비스 — 세션 저장 안 함
});
```

모듈 최상단에서 즉시 생성되는 싱글톤이며, `src/lib/leaderboard.ts`와 `src/lib/reflex.ts`만 이 인스턴스를 import합니다. **페이지 컴포넌트는 Supabase를 직접 호출하지 않습니다** — 항상 `lib/` 함수를 경유합니다.

---

## 🗺 라우팅 맵

**BrowserRouter**를 사용하므로 URL에 `#`이 없습니다 — `https://jun-gamebox.com/games/dice`.

GitHub Pages는 정적 서버라 `/games/dice` 경로에 해당하는 파일이 없으면 404를 내는데, 배포 워크플로가 **`dist/index.html`을 `dist/404.html`로 복사**해 이를 해결합니다. Pages가 없는 경로에 `404.html`을 돌려주므로 어떤 경로로 직접 진입하거나 새로고침해도 앱이 로드되고, 이후 React Router가 클라이언트에서 경로를 처리합니다.

### 게임 라우트

| 경로 | 페이지 | 홈 노출 |
|------|--------|:---:|
| `/` | `HomePage` | — |
| `/games/dice` | `DicePage` (planck-js) | ✅ |
| `/games/namepick` | `NamePickerPage` | ✅ |
| `/games/rock` | `RockPaperScissorsPage` | ✅ |
| `/games/roulette` | `RoulettePage` | ✅ |
| `/games/order` | `RacePage` (GSAP) | ✅ |
| `/games/liar` | `LiarPage` | ✅ |
| `/games/balance` | `BalancePage` (Supabase) | ✅ |
| `/games/ifelse` | `IfElsePage` | ✅ |
| `/games/quiz` | `QuizPage` | ✅ |
| `/games/sudoku` | `SudokuPage` | ✅ |
| `/games/card` | `CardPage` (GSAP) | ✅ |
| `/games/lotto` | `LottoPage` | ✅ |
| `/games/timer` | `TimerPage` | ✅ |
| `/games/reflexes` | `ReflexPage` (Supabase) | ✅ |
| `/games/speed` | `NumberGamePage` (1 to 48) | ✅ |
| `/games/color` | `ColorPage` (스트룹 테스트) | ✅ |
| `/games/timing` | `TimingPage` (GSAP) | ✅ |
| `/games/math` | `MathPage` | ✅ |
| `/games/memory` | `MemoryPage` (Confetti) | ✅ |
| `/games/reading` | `ReadingPage` | ✅ |
| `/games/str` | `StrengthPage` (GSAP) | ✅ |
| `/games/bingo` | `BingoPage` (GSAP) | ✅ |
| `/games/wisesay` | `WisesayPage` | ✅ |
| `/games/pinball` | `PinballPage` (설정) | ❌ 비노출 |
| `/games/pinball/play` | `PinballPlayPage` (플레이) | ❌ 비노출 |
| `/games/ladder` | `LadderPage` (사다리타기) | ❌ 비노출 |

> **비노출 라우트:** `pinball`, `ladder`는 라우트와 구현이 존재하지만 `src/data/games.ts`에서 타일이 주석 처리되어 홈에 나타나지 않습니다. 노출하려면 해당 주석만 해제하면 됩니다. (`telepathy`, `mole`, `puzzle`, `versus`는 이미지 자산만 있고 구현은 없습니다.)

### 정적 페이지

| 경로 | 페이지 |
|------|--------|
| `/terms` | 이용약관 (서비스 성격 고지·책임 한계·지식재산권·문의 이메일) |

---

## 🎯 게임 목록

### 뽑기 · 결정

| 게임 | 경로 | 설명 |
|------|------|------|
| 🎲 주사위굴리기 | `/games/dice` | planck-js 물리 기반 실제 낙하 시뮬레이션 |
| 🐦 제비뽑기 | `/games/namepick` | 참가자 입력 → 공정 추첨 |
| ✂️ 안내면진거 | `/games/rock` | 가위바위보 단판 |
| 🎯 돌려돌림판 | `/games/roulette` | 커스텀 항목 룰렛 |
| 🏃 1빠정하기 | `/games/order` | GSAP 레이스 애니메이션으로 순서 결정 |
| 🃏 카드뽑기 | `/games/card` | GSAP 카드 셔플·오픈 연출 |
| 🍀 로또번호생성 | `/games/lotto` | 1~45 중 6개 무작위 생성 |
| 🪜 사다리타기 | `/games/ladder` | *(홈 비노출)* |
| 🪩 핀볼룰렛 | `/games/pinball` | planck-js 물리 낙하 경주 *(홈 비노출)* |

### 여럿이 함께

| 게임 | 경로 | 설명 |
|------|------|------|
| 🎭 라이어게임 | `/games/liar` | 20개 카테고리 제시어, 라이어 지목 심리게임 |
| ⚖️ 밸런스월드컵 | `/games/balance` | 2~64강 토너먼트 + **전체 우승 통계 랭킹** |
| ❓ 만약에.. | `/games/ifelse` | 가정 질문 + 선택지 |
| 🧠 퀴즈퀴즈 | `/games/quiz` | 3개 주제(일반/IT/사자성어) × 난이도 3단계 |
| 🔢 빙고 | `/games/bingo` | GSAP 연출 빙고판 |

### 혼자서 · 기록 경쟁

| 게임 | 경로 | 설명 |
|------|------|------|
| ⚡ 반사신경 | `/games/reflexes` | 대기 1200~3500ms 랜덤 → 반응속도 측정, **전체 TOP 10 랭킹** |
| 🔢 1 to 48 | `/games/speed` | 1부터 48까지 순서대로 터치 |
| 🎨 스투룹테스트 | `/games/color` | 색상-단어 불일치 인지 테스트 |
| ⏱️ 타이밍캐치 | `/games/timing` | GSAP 게이지 정확도 게임 |
| ➕ 암산의 달인 | `/games/math` | 사칙연산 속산 |
| 🧩 기억력테스트 | `/games/memory` | 카드 매칭 (클리어 시 Confetti) |
| 🔢 스도쿠 | `/games/sudoku` | 9×9 스도쿠 |
| 🎤 나도아나운서 | `/games/reading` | 난이도별 발음 문장 낭독 |

### 재미 · 유틸

| 게임 | 경로 | 설명 |
|------|------|------|
| ⚔️ 무기강화하기 | `/games/str` | 21단계 강화(주방 식칼 → 태극기), 골드 10만 시작, 파괴 방지권 4만, GSAP 연출 |
| 💬 명언 모음집 | `/games/wisesay` | 카테고리별 명언 |
| ⏲️ 타이머 | `/games/timer` | 타이머 / 알람 |

> 💡 모든 게임은 **오락·교육 목적**이며 실제 금전 거래나 배팅 기능을 제공하지 않습니다.

---

## 📚 데이터 레이어

### 정적 콘텐츠 (`src/data/`)

| 파일 | 규모 | export | 형태 |
|------|:----:|--------|------|
| `games.ts` | 81줄 | `GAME_LIST`, `GameMeta` | `{ id, name, path, image?, emoji?, imageSize? }` |
| `balanceGameData.ts` | 696줄 | `categories`, `Category`, `Item`, `TournamentRound` | 4개 카테고리(아이스크림/과자/게임/라면) × 항목 배열 |
| `quizData.ts` | 1,292줄 | `ALL_QUIZ_DATA`, `DIFFICULTY_LABELS`, `QuizItem`, `QuizTopic` | 주제 3종 × 난이도별 문항. `DIFFICULTY_LABELS = ["하","중","상"]` |
| `quotes.ts` | 443줄 | `QUOTES`, `Quote` | `{ id, text, author, category }` |
| `phrases.ts` | 214줄 | `PHRASES`, `Phrase`, `Difficulty` | `easy` / `normal` / `hard` |
| `liarData.ts` | 120줄 | `CATEGORIES`, `WORDS`, `getMeta` | 20개 카테고리 × 제시어 20개 |
| `ifelseQuestions.ts` | 116줄 | `IFELSE_QUESTIONS` | `{ id, question, options[] }` |

### 게임 추가하는 법

1. `src/pages/NewGamePage.tsx` 생성 — `GameLayout`으로 감싸기

   ```tsx
   import GameLayout from "../layouts/GameLayout";

   export default function NewGamePage() {
     return <GameLayout title="새 게임">{/* 게임 본문 */}</GameLayout>;
   }
   ```

2. `src/App.tsx`에 라우트 등록 — `<Route path="/games/new" element={<NewGamePage />} />`
3. `src/assets/new.webp`에 64×64 이상 타일 아이콘 배치 (**WebP 포맷**)
4. `src/data/games.ts`에 `import newImg from "../assets/new.webp"` 추가 후 `GAME_LIST`에 항목 등록 — 배열 순서가 곧 **홈 그리드 표시 순서**이며 16개마다 페이지가 넘어갑니다
5. 필요 시 `public/sitemap.xml`에 URL 추가

### 콘텐츠만 추가하는 법

문항·항목만 늘리려면 해당 `src/data/*.ts` 배열에 항목을 추가하면 됩니다. 게임 로직 수정은 필요 없습니다. 밸런스월드컵 항목 이미지는 **WebP로 변환해** `public/balanceGameData/`에 넣고 `Item.image`에 `/balanceGameData/....webp` 절대 경로로 지정합니다. 이 경로는 런타임 문자열이라 **오타를 빌드가 잡아주지 않으므로** 파일명을 대조해 확인하세요.

---

## 🚢 빌드 & 배포

### 파이프라인

`main` 브랜치 push 또는 수동 실행(`workflow_dispatch`) 시 `.github/workflows/deploy.yml`이 동작합니다.

```
push to main
   ↓
[build 잡] ubuntu-latest
   1. actions/checkout@v4
   2. actions/setup-node@v4 (Node 20)
   3. npm install
   4. 환경변수 확인 (URL 출력 + 키 "길이"만 출력 — 값 노출 방지)
   5. npm run build          ← tsc -b + vite build, VITE_* 주입
   6. actions/upload-pages-artifact@v3 (./dist)
   ↓
[deploy 잡] needs: build
   7. actions/deploy-pages@v4 → github-pages 환경
```

### CI 환경변수 등록

빌드 시점에 값이 번들에 인라인되므로, GitHub 저장소에 **반드시** 등록해야 합니다.

| 저장 위치 | 이름 | 값 |
|-----------|------|-----|
| Settings → Secrets and variables → Actions → **Variables** | `VITE_SUPABASE_URL` | Supabase Project URL |
| Settings → Secrets and variables → Actions → **Secrets** | `VITE_SUPABASE_ANON_KEY` | publishable(anon) 키 |

> 값이 없으면 빌드는 성공하지만 **배포된 사이트에서 랭킹 기능이 런타임 예외로 죽습니다.** 워크플로의 "Print env (safe)" 스텝에서 URL과 키 길이를 확인할 수 있습니다.
>
> ℹ️ anon 키는 클라이언트 공개 전제이므로 Secrets에 넣어도 최종 번들에는 평문으로 들어갑니다. Secrets 사용은 워크플로 로그 노출을 줄이는 효과일 뿐, 키를 숨겨주지는 않습니다.

### 빌드 설정 (`vite.config.ts`)

```ts
{
  plugins: [react()],          // @vitejs/plugin-react-swc
  base: '/',                   // 커스텀 도메인(jun-gamebox.com) 루트 기준
  build: { sourcemap: false },  // 소스맵 미생성 (코드 노출 방지 + 용량 감소)
}
```

`base: '/'`는 **커스텀 도메인 전용 설정**입니다. `<user>.github.io/jungamebox/` 형태의 기본 Pages URL로 되돌린다면 `base: '/jungamebox/'`로 바꿔야 자산 경로가 깨지지 않습니다.

---

## 🌐 SEO / PWA

### `index.html`에 적용된 항목

- `<title>`, `description`, `keywords`, `author`, `publisher`, `robots`
- `canonical` + `hreflang="ko"` → `https://jun-gamebox.com/`
- **Open Graph** — `og:type/locale/site_name/title/description/url/image` (1200×630 `ogImage.png`)
- **Twitter Card** — `summary_large_image`
- **JSON-LD 구조화 데이터** — `SoftwareApplication` / `GameApplication`, 가격 0 KRW
- **검색엔진 소유권 확인** — `naver-site-verification`, `google-site-verification` 메타 + `public/`의 확인용 HTML 파일
- **파비콘 세트** — `.ico` / `.png`(48×48) / `.svg` / `apple-touch-icon`(180×180)
- **`#root` 폴백 마크업** — JS 실행 전 크롤러가 읽을 `<h1>` + 설명 문단. React 마운트 시 대체됩니다.

### PWA

`public/manifest.json`으로 홈 화면 추가를 지원합니다.

| 필드 | 값 |
|------|-----|
| `name` / `short_name` | J GameBox / GameBox |
| `display` | `standalone` |
| `theme_color` / `background_color` | `#0f172a` (slate-900) |
| `start_url` | `/` |
| `icons` | `/favicon.png` (192, 512) |

iOS 대응으로 `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`를 함께 지정했습니다. `BottomBar`는 `env(safe-area-inset-bottom)`으로 홈 인디케이터 여백을 확보합니다.

> ⚠️ **Service Worker는 등록되어 있지 않습니다.** 매니페스트만 있는 "설치 가능한 웹앱" 수준이며, 오프라인 캐싱은 동작하지 않습니다.

---

## 📐 개발 컨벤션

### TypeScript

`tsconfig.app.json`이 상당히 엄격합니다.

| 옵션 | 값 | 영향 |
|------|-----|------|
| `strict` | `true` | 전체 엄격 모드 |
| `noUnusedLocals` / `noUnusedParameters` | `true` | 미사용 변수 = **빌드 실패** |
| `verbatimModuleSyntax` | `true` | 타입 전용 import는 `import type { … }` **필수** |
| `erasableSyntaxOnly` | `true` | `enum`, 파라미터 프로퍼티 등 런타임 생성 문법 금지 |
| `noFallthroughCasesInSwitch` | `true` | switch fallthrough 금지 |
| `moduleResolution` | `bundler` | Vite 해석 방식 |
| `target` / `lib` | ES2022 / DOM | — |

### 스타일링

- Tailwind 유틸리티 클래스를 JSX에 직접 작성. **CSS 모듈이나 styled-components를 쓰지 않습니다.**
- **폰트: Pretendard 가변폰트 (자체 호스팅)** — `tailwind.config.js`의 `fontFamily.sans`에서 지정하고 Tailwind preflight가 `html`에 적용합니다. 동적 서브셋(92조각)이라 화면에 보이는 글자에 해당하는 조각만 내려받으며, 가변 축(`font-weight: 45 920`)이 모든 굵기를 커버합니다. `font-mono`는 자리폭 정렬용 3곳(퀴즈 선택지·타이머·타이밍 숫자)을 위해 등폭 기본값을 유지합니다.
- **라이트/다크 테마 지원.** 기본값은 라이트(흰색), 다크는 `#121314`(본체) + `#191a1b`(카드) 조합. `html.dark` 클래스로 전환하고 실제 색은 `src/index.css` 의 CSS 변수가 담당합니다. `slate-*` 는 CSS 변수로 매핑된 **표면 단계 토큰**이라 기존 클래스가 테마에 자동 반응하며, 램프 방향이 테마마다 뒤집힙니다. 글자색은 중립 표면 위 `text-strong`, 유채색 배경 위 `text-white` 고정으로 구분합니다 — 자세한 규칙은 `CLAUDE.md` 참조.
- 본문 최대 폭 `max-w-md` — 모바일 우선 설계.
- 커스텀 애니메이션은 `src/index.css`에 키프레임으로 추가 (현재 `bounceIn` 1종).

### 코드 관례

- 게임 1종 = 페이지 파일 1개. 페이지 내부에서 상태·로직·렌더를 모두 처리합니다.
- **이미지 포맷은 WebP.** 코드에서 import하는 이미지는 `src/assets/`에 두고 `import img from "../assets/name.webp"`로 참조합니다 (Vite가 해시를 붙여 번들, 4KB 미만은 base64 인라인). 런타임 문자열 경로로 참조되는 것과 `index.html`·`manifest.json`이 참조하는 것만 `public/`에 둡니다 — 자세한 예외는 `CLAUDE.md` 참조.
- 주석은 한국어로 작성합니다.
- Supabase 호출은 반드시 `src/lib/`를 경유하고, 실패해도 게임 진행을 막지 않도록 `console.error` + 빈 값 반환으로 처리합니다.
- ESLint는 Flat Config(`eslint.config.js`), `dist`는 검사 제외.

---

## ⚠️ 알려진 제약 및 개선 여지

현 상태에서 인지하고 있는 항목입니다.

| 항목 | 내용 |
|------|------|
| **참조되나 없는 파일** | `index.html`이 `apple-touch-icon.png`(180×180)와 `favicon.svg`를 참조하지만 **두 파일 모두 존재하지 않습니다.** iOS 홈화면 추가 시 아이콘이 깨집니다. `apple-touch-icon`은 iOS가 WebP를 지원하지 않으므로 **PNG로** 추가해야 합니다. |
| **404.html 방식의 한계** | 게임 페이지에 직접 진입하면 서버가 먼저 **HTTP 404 상태코드**를 준 뒤 앱이 로드됩니다. 브라우저에서는 정상 동작하지만, 크롤러가 이를 어떻게 취급할지는 보장되지 않습니다. 개별 페이지 색인을 확실히 하려면 SSG(사전 렌더링) 전환이 필요합니다. |
| **페이지별 메타태그 동일** | `index.html` 하나를 공유하므로 모든 라우트의 `title`·`description`·OG 태그가 홈과 같습니다. 게임별 메타가 필요하면 런타임 주입 또는 SSG가 필요합니다. |
| **코드 스플리팅 없음** | 모든 페이지를 `App.tsx`에서 정적 import하므로 GSAP·planck-js를 포함한 전체 번들이 첫 방문에 로드됩니다. `React.lazy` + `Suspense` 적용 여지가 있습니다. |
| **버전 표기 이원화** | `package.json`은 `0.0.0`, `BottomBar`는 `v1.0.9`로 하드코딩되어 있습니다. |
| **Service Worker 부재** | PWA 매니페스트만 있고 오프라인 캐싱은 없습니다. |
| **테스트 없음** | 자동화 테스트가 없습니다. 검증은 `npm run build`(타입 검사)와 `npm run lint`에 의존합니다. |
| **비속어 필터** | 반사신경 닉네임 필터가 `ReflexPage.tsx` 내 하드코딩 배열입니다. 우회가 쉬우므로 서버 측(RPC) 검증 병행이 바람직합니다. |

---

## ☕ 후원

- 💳 [카카오페이로 후원하기](https://link.kakaopay.com/__/kAMNmIW)
- 🧋 [Buy Me a Coffee](https://buymeacoffee.com/hjj5946)

---

## 🧑‍💻 Author

**Jun (Hong JeongJun)**
📧 hjj5946@gmail.com
🌐 [https://jun-gamebox.com](https://jun-gamebox.com)

---

## 📜 라이선스

**© 2025 Jun. All Rights Reserved.**

본 프로젝트의 코드, UI, 게임 구성 및 콘텐츠에 대한 권리는 저작자에게 있습니다.

- 비상업적 연구·학습 목적의 참고는 허용됩니다.
- 무단 복제, 배포, 상업적 이용은 금지됩니다.
- 'J GameBox' 명칭, 로고, 디자인, 게임 구성요소는 저작권법에 의해 보호됩니다.
- 일부 아이콘 및 이미지 리소스의 저작권은 **Flaticon**, **Freepik** 제작자에게 있습니다.

### 저작권 등록 정보 (예정)

| 항목 | 내용 |
|------|------|
| 저작물명 | J GameBox (웹 미니게임 플랫폼) |
| 저작자 | Jun (개발자) |
| 창작연도 | 2025 |
| 최초 공개일 | 2025-11-06 |
| 형태 | 컴퓨터프로그램 / 웹 서비스 |

---

## 🔍 검색 키워드

**서비스 키워드** — 음료내기, 로또번호, 로또번호생성, 밸런스월드컵, 밸런스게임, 라이어게임, 제비뽑기, 무기강화하기, 강화하기, 돌려돌림판, 룰렛, 주사위, 가위바위보, 반사신경, 타이밍캐치, 핀볼, 스도쿠, 빙고, 스투룹테스트

**기술 키워드** — React Game, Mini Game WebApp, J GameBox, Korean Gamebox, Free Web Games, React Tailwind Project, PWA Game, Vite SPA, Supabase Leaderboard

---

### 💬 "지루한 순간을, 잠깐의 게임으로 리부트하세요."
