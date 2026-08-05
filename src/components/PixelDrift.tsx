import { useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap } from "gsap";

/**
 * 픽셀아트 로고와 톤을 맞춘 사각 부록들이 천천히 떠오르며 회전하는 장식 효과.
 * 두 가지로 쓰인다.
 *
 *  - PixelDrift(기본)         : PC 화면에서 중앙 모바일 열 "양옆 여백"을 채운다.
 *                               여백 폭은 calc(50% - 14rem) = (화면폭 - max-w-md 448px) / 2.
 *                               화면이 좁으면 0 이 되어 모바일에서는 보이지 않는다.
 *  - PixelDriftBackdrop       : 앱 본체(max-w-md 열) "안쪽" 배경. 모바일에서도 보인다.
 *                               UI 가위에 얹히므로 양옆 여백보다 훨씬 옅게 깐다.
 *
 * - pointer-events-none 이므로 클릭을 절대 가로막지 않는다.
 * - 환경(OS 동작 줄이기 설정 등)에 상관없이 항상 같게 움직인다. 조건 분기를 넣지 말 것.
 */

const PIXELS_PER_SIDE = 16;
const PIXELS_CENTER = 35;

// 불투명도 범위 — 여백은 장식이 주인공이라 진하게, 본체 배경은 UI 를 방해하지 않게 옅게.
const PEAK_GUTTER: [number, number] = [0.18, 0.5];

// 본체 배경은 테마마다 세기가 다르다. 밝은 바탕에서는 같은 값이 더 묽어 보여서 라이트를 더 진하게 준다.
// GSAP 이 실제로 애니메이션하는 값은 "라이트 기준"이고, 다크에서는 감싸는 레이어의
// opacity(--drift-scale = 0.75)로 눌러 [0.15, 0.32] 가 되게 한다.
// CSS 변수로 처리하므로 테마를 토글해도 픽셀 위치가 리셋되지 않는다.
const PEAK_CENTER: [number, number] = [0.2, 0.43];

// 여백(양옆)용. 바탕이 가장 어두운 --s-950 이라 표면 토큰으로도 충분히 떠오른다.
const COLORS_GUTTER = [
  "rgb(var(--s-600))",
  "rgb(var(--s-600))",
  "rgb(var(--s-500))",
  "rgb(var(--s-500))",
  "rgb(var(--s-400))",
  "#f59e0b",
  "#3b82f6",
  "#f43f5e",
  "#10b981",
];

// 본체 배경용. 여기 바탕은 --s-900 이고 --s-600/500 은 다크에서 그 바로 옆 단계라,
// 여백용 색을 그대로 쓰면 0.15~0.32 불투명도에서 배경에 묻혀 안 보인다.
// (다크 기준 --s-600 #2E3145 를 #0F101C 위에 0.32 로 얹으면 채널당 차이가 10 남짓)
// 그래서 배경과 확실히 떨어지는 --s-400 과, 테마와 무관하게 선명한 포인트 색으로만 채운다.
const COLORS_CENTER = [
  "rgb(var(--s-400))",
  "rgb(var(--s-400))",
  "#f59e0b",
  "#3b82f6",
  "#f43f5e",
  "#10b981",
];

type Pixel = {
  left: number;   // 여백 안에서의 가로 위치 (%)
  size: number;   // px
  color: string;
  duration: number;
  spin: number;
  peak: number;   // 최대 불투명도
};

function makePixels(count: number, peak: [number, number], colors: string[]): Pixel[] {
  return Array.from({ length: count }, () => ({
    left: gsap.utils.random(4, 92),
    size: Math.round(gsap.utils.random(6, 20)),
    color: colors[Math.floor(gsap.utils.random(0, colors.length))],
    duration: gsap.utils.random(11, 24),
    spin: gsap.utils.random(-200, 200),
    peak: gsap.utils.random(peak[0], peak[1]),
  }));
}

/** 픽셀 한 무리를 담는 영역. className 으로 위치·폭만 바꿔 재사용한다. */
function PixelField({ className, pixels }: { className: string; pixels: Pixel[] }) {
  return (
    <div className={`pointer-events-none absolute overflow-hidden ${className}`} aria-hidden="true">
      {pixels.map((p, i) => (
        <span
          key={i}
          data-pixel
          className="absolute top-0 block rounded-[2px] will-change-transform"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/**
 * root 안의 [data-pixel] 을 아래에서 위로 흘려보낸다.
 * gsap.context 로 root 스코프를 잡으므로 여백용/본체용이 서로 간섭하지 않는다.
 */
function useDriftAnimation(rootRef: RefObject<HTMLDivElement | null>, pixels: Pixel[]) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-pixel]");

      nodes.forEach((el, i) => {
        const p = pixels[i];
        const tl = gsap.timeline({ repeat: -1 });

        // 아래에서 위로 등속 상승 + 회전
        tl.fromTo(
          el,
          { yPercent: 0, y: "108vh", rotate: 0 },
          { y: "-16vh", rotate: p.spin, duration: p.duration, ease: "none" },
          0
        )
          // 등장/퇴장 페이드 (딱 끊기지 않게)
          .to(el, { opacity: p.peak, duration: p.duration * 0.22, ease: "power1.out" }, 0)
          .to(el, { opacity: 0, duration: p.duration * 0.28, ease: "power1.in" }, p.duration * 0.72);

        // 시작 시점을 흩어 놓아 동시에 올라오지 않게
        tl.progress(gsap.utils.random(0, 1));
      });
    }, root);

    return () => ctx.revert();
  }, [rootRef, pixels]);
}

export default function PixelDrift() {
  const rootRef = useRef<HTMLDivElement>(null);

  // 마운트 시 한 번만 생성 (리렌더로 위치가 튀지 않게)
  const left = useMemo(() => makePixels(PIXELS_PER_SIDE, PEAK_GUTTER, COLORS_GUTTER), []);
  const right = useMemo(() => makePixels(PIXELS_PER_SIDE, PEAK_GUTTER, COLORS_GUTTER), []);
  const all = useMemo(() => [...left, ...right], [left, right]);

  useDriftAnimation(rootRef, all);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <PixelField className="inset-y-0 left-0 w-[calc(50%-14rem)]" pixels={left} />
      <PixelField className="inset-y-0 right-0 w-[calc(50%-14rem)]" pixels={right} />
    </div>
  );
}

/**
 * 앱 본체(max-w-md 열) 배경으로 깔리는 버전.
 * App.tsx 의 #app-shell 안에 z-0 으로 들어가고, 레이아웃들이 배경을 비워 두어 비쳐 보인다.
 */
export function PixelDriftBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pixels = useMemo(() => makePixels(PIXELS_CENTER, PEAK_CENTER, COLORS_CENTER), []);

  useDriftAnimation(rootRef, pixels);

  return (
    <div
      // opacity-[var(--drift-scale)]: 테마별 세기 조절 (index.css). 라이트=1, 다크=0.75.
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[var(--drift-scale)]"
      aria-hidden="true"
    >
      <div ref={rootRef} className="absolute inset-0">
        <PixelField className="inset-0" pixels={pixels} />
      </div>
    </div>
  );
}
