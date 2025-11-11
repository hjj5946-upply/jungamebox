import { useEffect, useMemo, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";

// ===== 기본 설정 =====
const REELS = 3;
const VISIBLE_ROWS = 3;
const ROW_H = 80;              // px (한 칸 높이)
const STRIP_LEN = 18;          // 심볼 개수(반복 스크롤용)

// 회전/감속 파라미터 (회전감 향상)
// const BASE_DECEL = 0.00025;    // 감속 계수(작을수록 오래 돈다) ↓
const MIN_VELOCITY = 0.12;     // 이하면 정지 시도 ↓
const EXTRA_SPINS = 22;        // 멈출 때 추가로 굴리는 칸 수 ↑
const MIN_SPIN_MS = 1200;      // 최소 회전 시간(ms) 보장 ↑
const MAX_SPIN_MS = 3800;
const MAX_PULL = 160;          // 레버 당김 최대 픽셀
const GLOBAL_HARD_STOP_MS = 5500;

// 심볼(임시 이모지) — 필요시 이미지로 교체
const SYMBOLS = [
  "🍒","🍋","🔔","⭐","🍀","7️⃣","🍇","💎","🍉",
  "🍎","🍊","🥝","BAR","🍓","🍌","🍍","⭐","7️⃣"
];

type ReelState = {
  offset: number;              // px 단위 오프셋(아래로 증가)
  velocity: number;   
  baseVel: number;         
  spinning: boolean;
  targetOffset: number | null; // 스냅 목표(정지 준비되면 px)
};

type Phase = "idle" | "spinning" | "stopping" | "settled";

export default function SlotPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string>("레버를 당겼다가 떼세요!");
  const [history, setHistory] = useState<string[]>([]); // 최근 결과 표시
  const [pay, setPay] = useState<string | null>(null);

  // 릴 상태
  const [reels, setReels] = useState<ReelState[]>(
    Array.from({ length: REELS }, () => ({
      offset: 0,
      velocity: 0,
      baseVel: 0,
      spinning: false,
      targetOffset: null,
    }))
  );

  // 애니메이션 루프
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // 레버 제스처
  const leverRef = useRef<HTMLDivElement | null>(null);
  const [pull, setPull] = useState(0); // 0~MAX_PULL
  const pullingRef = useRef(false);

  // 각 릴 회전 시작시간(최소 회전 보장용)
  const spinStartAtRef = useRef<number | null>(null);

  // 사운드 훅(원하면 파일 경로 지정)
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    tickAudioRef.current = new Audio();
    winAudioRef.current = new Audio();
    // tickAudioRef.current.src = "/sounds/tick.mp3";
    // winAudioRef.current.src = "/sounds/win.mp3";
  }, []);

  // 무한 스트립 높이
  const stripHeight = useMemo(() => STRIP_LEN * ROW_H, []);

  // 애니메이션 루프
  useEffect(() => {
    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // s
      lastTsRef.current = ts;

      setReels(prev => {
        let allStopped = true;
        const elapsed = spinStartAtRef.current ? (ts - spinStartAtRef.current) : 0;
      
        const next = prev.map((r, i) => {
          if (!r.spinning) return r;
      
          // ① 속도 계산: 스핀/스톱 분리
          let v = r.velocity;
          if (phase === "spinning") {
            v = r.baseVel; // 크루즈 유지
          } else {
            const decay = 0.985 - i * 0.003;
            v = Math.max(r.baseVel * 0.06, v * decay); // 하한 조금 더 낮춤
          }
      
          // ② 오프셋 업데이트
          let o = r.offset + v * dt;
          if (o >= stripHeight) o -= stripHeight;
          if (o < 0) o += stripHeight;
      
          // ③ 틱 사운드
          const prevRow = Math.floor((r.offset % stripHeight) / ROW_H);
          const nextRow = Math.floor((o % stripHeight) / ROW_H);
          if (prevRow !== nextRow && tickAudioRef.current && tickAudioRef.current.src) {
            tickAudioRef.current.currentTime = 0;
            tickAudioRef.current.play().catch(() => {});
          }
      
          // ④ 정지 로직 (최소/최대 시간)
          let targetOffset = r.targetOffset;
          let spinning: boolean = r.spinning;
      
          const reelMinTime = MIN_SPIN_MS + i * 220;   // 릴별 최소 유지
          const reelMaxTime = MAX_SPIN_MS + i * 280;   // ✅ 릴별 최대 한계
      
          // (A) 최소 시간 전에는 너무 느려지면 바닥 유지
          if (elapsed < reelMinTime && v < r.baseVel * 0.25) {
            v = r.baseVel * 0.25;
          }
      
          // (B) 스톱 단계 + 최소 시간 이후 + 충분히 느릴 때 → 목표 생성
          if (phase !== "spinning" && targetOffset == null && elapsed >= reelMinTime && v <= r.baseVel * 0.20) {
            const currIndex = Math.round(o / ROW_H) % STRIP_LEN;
            const stopIndex = (currIndex + EXTRA_SPINS + i * 2) % STRIP_LEN;
            targetOffset = stopIndex * ROW_H;
          }
      
          // (C) 최대 시간 초과 시 강제 목표 생성 ✅
          if (targetOffset == null && elapsed >= reelMaxTime) {
            const currIndex = Math.round(o / ROW_H) % STRIP_LEN;
            const stopIndex = (currIndex + (EXTRA_SPINS >> 1)) % STRIP_LEN; // 덜 굴리고 바로 스냅
            targetOffset = stopIndex * ROW_H;
          }
      
          // (D) 목표가 있으면 목표로 수렴(더 강하게 감속) ✅
          if (targetOffset != null) {
            const diff = normalizeDiff(o, targetOffset, stripHeight);
            if (Math.abs(diff) < 0.8) {
              o = targetOffset;
              v = 0;
              spinning = false;
            } else {
              v = Math.max(MIN_VELOCITY * 0.5, v * 0.972); // 스냅 접근 시 감속 더 강하게
            }
          }
      
          if (spinning) allStopped = false;
          return { offset: o, velocity: v, baseVel: r.baseVel, spinning, targetOffset };
        });
      
        // (E) 전역 하드 타임아웃: 어떤 이유로든 너무 오래 돌면 강제 종료 ✅
        if ((ts - (spinStartAtRef.current ?? ts)) >= GLOBAL_HARD_STOP_MS) {
          const forced = prev.map((r, i) => {
            if (!r.spinning) return r;
            const currIndex = Math.round((r.offset % stripHeight) / ROW_H) % STRIP_LEN;
            const stopIndex = (currIndex + 3 + i) % STRIP_LEN;
            return {
              ...r,
              offset: stopIndex * ROW_H,
              velocity: 0,
              spinning: false,
              targetOffset: stopIndex * ROW_H,
            };
          });
          setPhase("settled");
          handleSettle(forced);
          return forced;
        }
      
        if (allStopped && (phase === "stopping" || phase === "spinning")) {
          setPhase("settled");
          handleSettle(next);
        }
      
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [phase, stripHeight]);

  // 레버 제스처 핸들러
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!pullingRef.current || !leverRef.current) return;
      const rect = leverRef.current.getBoundingClientRect();
      const y = Math.max(0, Math.min(MAX_PULL, e.clientY - rect.top)); // 레버 상단 기준
      setPull(y);
    };
    const onPointerUp = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      // 당긴 정도 → 초기 속도
      const power = pull / MAX_PULL; // 0~1
      startSpin(power);
      // 레버 복귀
      setPull(0);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [pull]);

  // 스페이스/엔터로도 시동
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (phase === "idle" || phase === "settled") startSpin(0.6);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // 스핀 시작
  const startSpin = (power: number) => {
    if (phase === "spinning") return;
    setMessage("돌아간다… 따다닥…");
    setPay(null);

    const baseMin = 2400;           // ← 더 빠르게
    const baseMax = 4200;
    const baseVel = lerp(baseMin, baseMax, clamp(power, 0.25, 1));

    setReels(rs =>
        rs.map((_, i) => {
          const bv = baseVel * (1 - i * 0.06); // 릴별 약간 차이
          return {
            offset: Math.random() * stripHeight,
            velocity: bv,         // 현재 속도
            baseVel: bv,          // 크루즈 속도(유지)
            spinning: true,
            targetOffset: null,
          };
        })
      );
    spinStartAtRef.current = performance.now();
    setPhase("spinning");

    // 일정 시간 후 감속-정지 모드로
    setTimeout(() => setPhase("stopping"), 650 + Math.random() * 400);
  };

  // 결과 판정
  const handleSettle = (rs: ReelState[]) => {
    const idxs = rs.map(r => Math.round((r.offset % stripHeight) / ROW_H) % STRIP_LEN);
    // 중앙 행 기준 심볼 추출
    const symbols = idxs.map(i => SYMBOLS[i % SYMBOLS.length]);

    setMessage(`결과: ${symbols.join(" | ")}`);

    // 간단 페이라인: 3개 일치면 승리
    const win = symbols.every(s => s === symbols[0]);
    if (win) {
      setPay("🎉 JACKPOT! 3 in a row!");
      if (winAudioRef.current && winAudioRef.current.src) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => {});
      }
    } else {
      setPay(null);
    }

    // 히스토리 (최근 5개)
    setHistory(h => [symbols.join(" "), ...h].slice(0, 5));
  };

  // 유틸
  function clamp(x: number, a: number, b: number) { return Math.max(a, Math.min(b, x)); }
  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
  function normalizeDiff(current: number, target: number, period: number) {
    // 원형(0~period) 상에서 target까지의 최단 차이
    let d = (target - current) % period;
    if (d > period / 2) d -= period;
    if (d < -period / 2) d += period;
    return d;
  }

  // 렌더
  return (
    <GameLayout title="슬롯머신">
      <div className="flex flex-col items-center gap-3 p-3">
        {/* 머신 프레임 */}
        <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-2xl relative overflow-visible">
          {/* 상단 마키/라이트 */}
          <div className="h-10 rounded-t-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 flex items-center justify-center text-slate-900 font-extrabold tracking-wider">
            SLOT • MACHINE
          </div>

          {/* 릴 창 */}
          <div className="mx-4 my-4 rounded-2xl bg-slate-950/80 border border-slate-700 p-3">
            <div className="relative grid grid-cols-3 gap-3 rounded-xl bg-slate-900 p-3 ring-1 ring-slate-700 will-change-transform">
              {Array.from({ length: REELS }).map((_, col) => (
                <ReelView
                  key={col}
                  height={ROW_H * VISIBLE_ROWS}
                  rowH={ROW_H}
                  stripLen={STRIP_LEN}
                  symbols={SYMBOLS}
                  offset={reels[col].offset}
                />
              ))}

              {/* 중앙 페이라인 */}
              <div className="pointer-events-none absolute left-3 right-3 top-1/2 h-[2px] -translate-y-1/2 bg-amber-400/70 shadow-[0_0_8px_rgba(255,200,0,0.8)]" />
            </div>
          </div>

          {/* 하단 패널 */}
          <div className="px-4 pb-4">
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3 text-center text-slate-200 text-sm">
              {message}
              {pay && <div className="mt-1 text-amber-400 font-bold">{pay}</div>}
            </div>
          </div>

          {/* 데스크탑용 레버 (md 이상) */}
          <Lever
            refEl={leverRef}
            pull={pull}
            onPointerDown={() => {
              if (phase === "idle" || phase === "settled") {
                pullingRef.current = true;
                setMessage("더 당겼다가 떼세요!");
              }
            }}
            onClickKick={() => {
              if (phase === "idle" || phase === "settled") startSpin(0.6);
            }}
          />
        </div>

        {/* 모바일용 플로팅 레버 버튼 */}
        <MobileLeverButton
          onPress={() => {
            if (phase === "idle" || phase === "settled") startSpin(0.75);
          }}
        />

        {/* 히스토리 */}
        <div className="w-full max-w-md">
          <h3 className="text-slate-200 text-sm font-semibold mb-2">최근 결과</h3>
          {history.length === 0 ? (
            <p className="text-[12px] text-slate-400">아직 기록이 없습니다.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2">
              {history.map((h, i) => (
                <li key={i} className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 text-sm">
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </GameLayout>
  );
}

// ===== 하위 컴포넌트 =====

function ReelView({
  height,
  rowH,
  stripLen,
  symbols,
  offset,
}: {
  height: number;
  rowH: number;
  stripLen: number;
  symbols: string[];
  offset: number;
}) {
  const totalH = stripLen * rowH;
  const translateY = - (offset % totalH);

  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-950 ring-1 ring-slate-800" style={{ height }}>
      <div className="absolute inset-0 will-change-transform" style={{ transform: `translateY(${translateY}px)` }}>
        <ReelStrip rowH={rowH} symbols={symbols} />
        <ReelStrip rowH={rowH} symbols={symbols} />
      </div>
      {/* top/bottom 그라데이션 마스크 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-slate-950 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}

function ReelStrip({ rowH, symbols }: { rowH: number; symbols: string[] }) {
  return (
    <div>
      {symbols.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-center text-3xl select-none"
          style={{ height: rowH }}
        >
          <span className="drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">{s}</span>
        </div>
      ))}
    </div>
  );
}

// 데스크탑 레버 (md 이상에서만 보이게)
function Lever({
  refEl,
  pull,
  onPointerDown,
  onClickKick,
}: {
  refEl: React.MutableRefObject<HTMLDivElement | null>;
  pull: number;
  onPointerDown: () => void;
  onClickKick: () => void;
}) {
  return (
    <div className="absolute -right-16 top-10 hidden md:block">
      <div
        ref={refEl}
        className="relative w-10 h-[220px] bg-slate-800/90 border border-slate-700 rounded-full flex items-start justify-center cursor-pointer select-none"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          onPointerDown();
        }}
        onDoubleClick={onClickKick}
      >
        {/* 손잡이 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg ring-2 ring-white/20"
          style={{ top: `${pull}px`, transition: "top .25s ease-out" }}
        />
        {/* 가이드 텍스트 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 text-[10px] text-slate-400">PULL</div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[10px] text-slate-400">MAX</div>
      </div>
    </div>
  );
}

// 모바일 플로팅 버튼 (sm 미만도 노출)
function MobileLeverButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="fixed bottom-5 right-5 md:hidden z-50 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 font-extrabold shadow-[0_10px_30px_rgba(255,200,0,0.35)] ring-2 ring-amber-200 active:translate-y-0.5"
      aria-label="레버 당기기"
      title="레버 당기기"
    >
      PULL
    </button>
  );
}
