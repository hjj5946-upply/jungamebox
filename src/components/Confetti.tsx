import { useEffect, useRef, useState } from "react";

type Props = {
  run: boolean;
  duration?: number;    // 파티클 뿌리는 시간
  fadeOutMs?: number;   // 끝난 뒤 페이드아웃
  onEnd?: () => void;   // 완전 종료 콜백
  cooldownMs?: number;  // 같은 run=true 재요청 쿨다운(중복 방지)
};

export default function Confetti({
  run,
  duration = 1000,
  fadeOutMs = 200,
  onEnd,
  cooldownMs = 600,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  // ✅ 내부 실행 가드
  const runningRef = useRef(false);
  const lastEndAtRef = useRef<number>(0);

  useEffect(() => {
    const now = performance.now();
    if (!run) return;                               // run=false면 무시
    if (runningRef.current) return;                 // 이미 실행 중이면 무시
    if (now - lastEndAtRef.current < cooldownMs) {  // 최근 종료 직후 쿨다운
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    runningRef.current = true;
    setVisible(true);

    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    const N = 120;
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * w,
      y: -20,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2 + 2,
      g: 0.06 + Math.random() * 0.04,
      s: 3 + Math.random() * 3,
      a: 0.9,
      c: `hsl(${Math.floor(Math.random() * 360)},90%,60%)`,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
    }));

    let start = performance.now();

    const loop = (t: number) => {
      const dt = t - start;
      ctx.clearRect(0, 0, w, h);

      if (dt <= duration) {
        parts.forEach((p) => {
          p.vy += p.g;
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.fillStyle = p.c;
          ctx.globalAlpha = p.a;
          ctx.fillRect(-p.s, -p.s, p.s * 2, p.s * 2);
          ctx.restore();
        });
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // 종료: 페이드아웃 → 클린업
        if (fadeOutMs > 0) {
          setTimeout(cleanup, fadeOutMs);
        } else {
          cleanup();
        }
      }
    };

    const cleanup = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ctx.clearRect(0, 0, w, h);
      setVisible(false);
      runningRef.current = false;
      lastEndAtRef.current = performance.now();
      onEnd?.();
      window.removeEventListener("resize", onResize);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ctx.clearRect(0, 0, w, h);
      setVisible(false);
      runningRef.current = false;
      window.removeEventListener("resize", onResize);
    };
  // run만 의존 (duration 등은 보통 고정 값)
  }, [run]);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${Math.max(0, fadeOutMs)}ms ease-out`,
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
