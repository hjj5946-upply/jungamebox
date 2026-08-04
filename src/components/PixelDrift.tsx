import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

/**
 * PC 화면에서 중앙 모바일 열 양옆 여백을 채우는 장식 효과.
 * 픽셀아트 로고와 톤을 맞춘 사각 부록들이 천천히 떠오르며 회전한다.
 *
 * - 여백 폭은 calc(50% - 14rem) = (화면폭 - max-w-md 448px) / 2.
 *   화면이 좁으면 0 이 되어 모바일에서는 아무것도 보이지 않는다.
 * - pointer-events-none 이므로 클릭을 절대 가로막지 않는다.
 * - prefers-reduced-motion 이면 애니메이션 없이 정적으로만 표시한다.
 */

const PIXELS_PER_SIDE = 16;

// 중립색은 테마 변수를 참조해 라이트/다크 양쪽에서 여백과 자연스럽게 어울리게 한다.
// 포인트 색은 두 테마 모두에서 잘 보이므로 고정.
const COLORS = [
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

type Pixel = {
  left: number;   // 여백 안에서의 가로 위치 (%)
  size: number;   // px
  color: string;
  duration: number;
  spin: number;
  peak: number;   // 최대 불투명도
};

function makePixels(count: number): Pixel[] {
  return Array.from({ length: count }, () => ({
    left: gsap.utils.random(4, 92),
    size: Math.round(gsap.utils.random(6, 20)),
    color: COLORS[Math.floor(gsap.utils.random(0, COLORS.length))],
    duration: gsap.utils.random(11, 24),
    spin: gsap.utils.random(-200, 200),
    peak: gsap.utils.random(0.18, 0.5),
  }));
}

function Gutter({ side, pixels }: { side: "left" | "right"; pixels: Pixel[] }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${side}-0 w-[calc(50%-14rem)] overflow-hidden`}
      aria-hidden="true"
    >
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

export default function PixelDrift() {
  const rootRef = useRef<HTMLDivElement>(null);

  // 마운트 시 한 번만 생성 (리렌더로 위치가 튀지 않게)
  const left = useMemo(() => makePixels(PIXELS_PER_SIDE), []);
  const right = useMemo(() => makePixels(PIXELS_PER_SIDE), []);
  const all = useMemo(() => [...left, ...right], [left, right]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-pixel]");

      if (reduced) {
        // 움직임을 원하지 않는 사용자: 흩뿌려진 정적 상태로만 표시
        nodes.forEach((el, i) => {
          gsap.set(el, { y: `${gsap.utils.random(5, 95)}%`, opacity: all[i].peak * 0.6 });
        });
        return;
      }

      nodes.forEach((el, i) => {
        const p = all[i];
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
  }, [all]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <Gutter side="left" pixels={left} />
      <Gutter side="right" pixels={right} />
    </div>
  );
}
