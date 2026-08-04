import { useEffect, useState, type RefObject } from "react";
import { ChevronDown } from "lucide-react";

/**
 * 스크롤 영역 하단 중앙에 "더 내려보세요" 표시를 띄운다.
 *
 * - 아래에 더 볼 내용이 있을 때만 나타난다. (내용이 짧아 스크롤이 없으면 표시 안 함)
 * - 시간이 지나 사라지지 않고 계속 표시된다.
 * - 맨 아래에 닿으면 사라진다. 더 내려갈 곳이 없는데 내리라고 하면 오히려 혼란스럽기 때문.
 * - pointer-events-none 이라 스크롤·클릭을 가로막지 않는다.
 */

// 맨 아래 판정 여유값(px). 소수점 스크롤 오차와 관성 스크롤을 감안.
const BOTTOM_EPSILON = 8;

export default function ScrollHint({
  scrollRef,
}: {
  scrollRef: RefObject<HTMLElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop;
      setVisible(remaining > BOTTOM_EPSILON);
    };

    update();

    el.addEventListener("scroll", update, { passive: true });

    // 내용이 늘거나(게임 추가) 창 크기가 바뀔 때도 다시 판정해야 한다.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollRef]);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center
                  transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      aria-hidden="true"
    >
      {/* 내용이 잘린 느낌을 주는 하단 페이드 */}
      <div className="h-10 w-full bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

      {/* 안내 배지 */}
      <div className="-mt-1 flex items-center gap-1 pb-1">
        <span className="animate-scroll-nudge flex items-center gap-1 rounded-full bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-veil/10">
          스크롤
          <ChevronDown size={13} strokeWidth={2.5} />
        </span>
      </div>
    </div>
  );
}
