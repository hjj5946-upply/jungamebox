import { useEffect, useLayoutEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";

/**
 * 돌려돌림판.
 *
 * 원판 바깥을 칸칸이 나뉜 띠가 감싸고, 위쪽 화살표가 그 칸턱을 하나씩 타넘으며
 * 다다다 걸리다가 서서히 멈춘다.
 *
 * 물리는 고정 시간간격(1/120초) 루프다. 프레임 간격에 따라 결과가 달라지지 않고,
 * 화살표 스프링도 폭주하지 않는다.
 *
 * 회전각/화살표 각도는 state 가 아니라 ref + DOM transform 이다.
 * 프레임마다 리렌더하면 SVG 를 매번 다시 그리게 되므로.
 * 리렌더가 끼어들어도 useLayoutEffect 가 현재 ref 값을 다시 발라 어긋나지 않는다.
 */

type RouletteOption = {
  id: number;
  label: string;
  color: string;
};

const defaultOptions: RouletteOption[] = [
  { id: 1, label: "옵션 1", color: "#3B82F6" },
  { id: 2, label: "옵션 2", color: "#10B981" },
];

const PALETTE = [
  "#ad1313", "#10B981", "#F59E0B", "#fa6161", "#8B5CF6", "#EC4899",
  "#06B6D4", "#84CC16", "#F97316", "#3B82F6", "#9333EA", "#DB2777",
];

const MAX_OPTIONS = 12;

/* ── 도형 (viewBox "0 0 300 300" 기준) ────────────────────────── */
const CENTER = 150;
const BAND_OUTER = 150; // 띠 바깥 반지름
const BAND_INNER = 138; // 띠 안쪽 반지름 — 폭 12(지름의 4%)로 얇게
const SECTOR_RADIUS = 136; // 색칸 반지름. 띠와 사이의 2 만큼이 검은 테로 남는다
const CELL_GAP = 1.6; // 칸 사이 홈(도). 화살표가 걸리는 턱이 된다
const MIN_CELLS = 24; // 띠 칸 최소 개수

// 띠는 검정 계열. 두 톤을 번갈아 칠해 얇아도 회전이 읽히게 한다.
const BAND_GROOVE = "#000000"; // 칸 사이 홈 + 띠 안쪽 테
const BAND_LIGHT = "#272c3a";
const BAND_DARK = "#0c0f18";

/* ── 회전 물리 (단위: 도, 초) ─────────────────────────────────── */
const FIXED_DT = 1 / 120; // 물리 스텝. 화면 주사율과 무관하게 고정
const MAX_FRAME = 0.1; // 탭 복귀 등으로 프레임이 벌어져도 여기까지만 따라잡는다

const START_VEL_MIN = 1700; // 초기 각속도 ≈ 5바퀴/초
const START_VEL_MAX = 2600;
const AIR_DECAY = 0.68; // 1초 뒤 남는 속도 비율 — 공기저항
const AXLE_KINETIC = 55; // 돌고 있을 때의 축 마찰 (deg/s²)
const AXLE_STATIC = 420; // 멎어 있을 때 버티는 힘 (deg/s²). 턱이 미는 힘이 이보다 작으면 그대로 걸려 선다
const CREST_LOSS = 0.985; // 턱을 넘을 때마다 부딪히며 잃는 비율 (곱셈이라 속도와 무관하게 항상 손해)
const CATCH_VEL = 90; // 이 아래로 떨어지면 턱에 걸리는 손실이 커진다
const CATCH_LOSS = 0.9;
const REST_VEL = 3; // 이 아래면 정지마찰 판정에 들어간다

/* ── 턱 모양 ──────────────────────────────────────────────────
   칸 하나를 [평평한 홈] → [완만한 오르막] → [가파른 낙차] 로 본다.
   이 높이차가 그대로 위치에너지라서, 오르막에서는 원판을 뒤로 밀고
   낙차에서는 앞으로 민다. 보존력이므로 여기서 에너지가 생기지 않는다
   (손실은 공기저항·축마찰·CREST_LOSS 뿐 → 반드시 멈춘다). */
const RIDGE_START = 0.75; // 칸의 앞 3/4 은 평평한 홈 — 여기서 힘없이 멎으면 화살표는 반듯하다
const RIDGE_DROP = 0.08; // 턱을 넘어 다음 홈으로 떨어지는 구간
const RIDGE_ACCEL = 100; // 턱 경사가 만드는 접선 가속 계수
const RIDGE_PRELOAD = 0.25; // 화살표가 평소에도 띠를 누르고 있는 정도

/* ── 화살표(플래퍼) 스프링 ────────────────────────────────────── */
const FLAP_MAX = 15; // 턱 꼭대기에서의 각도
const FLAP_STIFF = 1800; // 스프링 강성 (고유진동수 ≈ 6.7Hz)
const FLAP_DAMP = 30; // 감쇠. 임계(≈85)보다 낮게 둬서 되튕기는 맛을 남긴다
const FLAP_SETTLED = 0.2; // 턱 높이와 이만큼 가까워지면 떨림이 멎은 것으로 본다
const FLAP_SETTLED_VEL = 2;

/** 칸 안 위치(0~1)에서의 턱 높이 h(0~1)와 기울기 dh/dphase. */
function ridgeAt(phase: number) {
  if (phase < RIDGE_START) return { h: 0, slope: 0 };
  const crest = 1 - RIDGE_DROP;
  if (phase < crest) {
    const w = crest - RIDGE_START;
    return { h: (phase - RIDGE_START) / w, slope: 1 / w };
  }
  return { h: 1 - (phase - crest) / RIDGE_DROP, slope: -1 / RIDGE_DROP };
}

/** 칸 안에서의 위치(0~1) */
function phaseOf(rotation: number, cell: number) {
  return (((rotation % cell) + cell) % cell) / cell;
}

/* ── 진동 ─────────────────────────────────────────────────────── */
// 초반에는 초당 100번 넘게 턱을 지나므로 그대로 울리면 모터가 못 따라오고 호출만 쌓인다.
// 최소 간격을 둬서 빠를 때는 붕― 하고 이어지고, 느려지면 딱, 딱 하고 끊기게 만든다.
const VIBE_GAP = 55; // ms — 이보다 자주 울리지 않는다
const VIBE_FAST = 7; // ms — 빠를 때 (붕― 하는 결)
const VIBE_MID = 11;
const VIBE_SLOW = 16; // ms — 느릴 때 (한 칸씩 또렷하게)
const VIBE_RESULT = [30, 90, 30]; // 결과 확정: 울림-쉼-울림 두 번

/** 기기 진동. iOS Safari 는 Vibration API 자체가 없어 조용히 무시된다. */
function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // 사용자 제스처 없이 호출하면 예외를 던지는 브라우저가 있다 — 진동은 부가 효과이므로 무시
  }
}

/** 띠 칸은 항상 색칸 경계에 맞도록 칸 수의 배수로 잡는다. (2칸→24, 5칸→25, 12칸→24) */
function cellCountFor(optionCount: number) {
  if (optionCount <= 0) return MIN_CELLS;
  return optionCount * Math.ceil(MIN_CELLS / optionCount);
}

/**
 * 회전각이 rotation 일 때 12시 방향 화살표 아래에 있는 칸.
 * 칸 i 는 회전 전 -90°+i*per 에서 시작하므로, 화살표가 가리키는 칸은 -rotation 을 칸 크기로 나눈 몫이다.
 */
function sectorAt(rotation: number, count: number) {
  const per = 360 / count;
  const normalized = (((-rotation % 360) + 360) % 360) / per;
  return Math.min(count - 1, Math.floor(normalized));
}

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function sectorPath(index: number, total: number) {
  const per = 360 / total;
  const a = polar(index * per, SECTOR_RADIUS);
  const b = polar((index + 1) * per, SECTOR_RADIUS);
  const large = per > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${a.x} ${a.y} A ${SECTOR_RADIUS} ${SECTOR_RADIUS} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

/** 띠의 칸 하나 (고리 조각). 양옆을 CELL_GAP 만큼 깎아 바탕색이 홈처럼 드러나게 한다. */
function cellPath(index: number, total: number) {
  const per = 360 / total;
  const start = index * per + CELL_GAP / 2;
  const end = (index + 1) * per - CELL_GAP / 2;
  const large = end - start > 180 ? 1 : 0;

  const o0 = polar(start, BAND_OUTER);
  const o1 = polar(end, BAND_OUTER);
  const i1 = polar(end, BAND_INNER);
  const i0 = polar(start, BAND_INNER);

  return [
    `M ${o0.x} ${o0.y}`,
    `A ${BAND_OUTER} ${BAND_OUTER} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${BAND_INNER} ${BAND_INNER} 0 ${large} 0 ${i0.x} ${i0.y}`,
    "Z",
  ].join(" ");
}

function textPosition(index: number, total: number) {
  const per = 360 / total;
  const mid = index * per + per / 2;
  const p = polar(mid, SECTOR_RADIUS * 0.68);
  return { x: p.x, y: p.y, angle: mid };
}

export default function RoulettePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const wheelRef = useRef<SVGSVGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  const rotationRef = useRef(0); // 누적 회전각(도)
  const flapRef = useRef(0); // 화살표가 밀려난 각도(도)
  const rafRef = useRef<number | null>(null);

  const [options, setOptions] = useState<RouletteOption[]>(defaultOptions);
  const [customCount, setCustomCount] = useState(0);
  const [result, setResult] = useState<RouletteOption | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const cellCount = cellCountFor(options.length);

  // 리렌더 후에도 현재 각도를 다시 발라 준다 (React 가 style 을 되돌리지 않게)
  useLayoutEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
    if (pointerRef.current) {
      // 원판이 시계방향으로 돌면 12시 쪽 테두리는 오른쪽으로 흐른다.
      // 화살표는 위쪽을 축으로 매달려 있으므로 끝이 오른쪽으로 밀리려면 음의 회전이어야 한다.
      pointerRef.current.style.transform = `rotate(${-flapRef.current}deg)`;
    }
  });

  // 페이지를 벗어날 때 루프와 진동 정리 (돌아가는 중에 나가면 진동이 남는다)
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      vibrate(0);
    };
  }, []);

  const spin = () => {
    if (isSpinning || options.length === 0) return;

    const count = options.length;
    const cells = cellCountFor(count);
    const cell = 360 / cells;

    setResult(null);
    setIsSpinning(true);

    let vel = START_VEL_MIN + Math.random() * (START_VEL_MAX - START_VEL_MIN);
    let rot = rotationRef.current;
    let flap = flapRef.current;
    let flapVel = 0;
    let wheelDone = false;
    let acc = 0;
    let last = performance.now();
    let crossedInFrame = 0; // 이번 프레임에 넘은 턱 수 (진동 판정용)
    let lastVibeAt = 0;

    const tick = (dt: number) => {
      if (!wheelDone) {
        const { h, slope } = ridgeAt(phaseOf(rot, cell));

        // 턱 경사가 만드는 접선 가속. 눌린 만큼 세게 버티므로 (선하중 + 높이) 를 곱한다.
        // 오르막(slope>0)이면 뒤로, 낙차(slope<0)면 앞으로 민다.
        let accel = -RIDGE_ACCEL * (RIDGE_PRELOAD + h) * slope;

        vel *= Math.pow(AIR_DECAY, dt);

        if (Math.abs(vel) > REST_VEL) {
          // 돌고 있다 — 운동마찰이 진행 방향 반대로 걸린다
          accel -= Math.sign(vel) * AXLE_KINETIC;
        } else if (Math.abs(accel) <= AXLE_STATIC) {
          // 거의 멎었는데 턱이 미는 힘이 정지마찰을 못 이긴다 → 여기서 그대로 선다.
          // 오르막 중턱이면 화살표가 턱에 걸린 채로, 홈이면 반듯한 채로 멈춘다.
          vel = 0;
          accel = 0;
          wheelDone = true;
        } else {
          accel -= Math.sign(accel) * AXLE_STATIC;
        }

        if (!wheelDone) {
          vel += accel * dt;
          const prev = rot;
          rot += vel * dt;

          // 턱을 넘었으면 부딪히며 에너지를 잃는다 (뒤로 되넘어가는 경우는 세지 않는다)
          const crossed = Math.floor(rot / cell) - Math.floor(prev / cell);
          if (crossed > 0) {
            crossedInFrame += crossed;
            vel *= Math.pow(CREST_LOSS, crossed);
            if (vel < CATCH_VEL) vel *= CATCH_LOSS;
          }
        }
      }

      // ── 화살표 ──
      // 목표 각도는 지금 밟고 있는 턱의 높이 그 자체다.
      // 낙차 구간에서 목표가 뚝 떨어지면 스프링이 되튕기며 "다닥" 이 된다.
      // 원판이 오르막에 걸린 채 멈추면 목표가 0 이 아니므로 화살표도 기운 채로 남는다.
      const target = FLAP_MAX * ridgeAt(phaseOf(rot, cell)).h;
      flapVel += (target - flap) * FLAP_STIFF * dt - flapVel * FLAP_DAMP * dt;
      flap += flapVel * dt;
    };

    const step = (now: number) => {
      acc += Math.min((now - last) / 1000, MAX_FRAME);
      last = now;

      crossedInFrame = 0;
      while (acc >= FIXED_DT) {
        acc -= FIXED_DT;
        tick(FIXED_DT);
      }

      // 턱을 넘었으면 진동. 속도가 낮을수록 길게 울려 한 칸씩 또렷해진다.
      if (crossedInFrame > 0 && now - lastVibeAt >= VIBE_GAP) {
        lastVibeAt = now;
        vibrate(vel > 400 ? VIBE_FAST : vel > 150 ? VIBE_MID : VIBE_SLOW);
      }

      rotationRef.current = rot;
      flapRef.current = flap;
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${rot}deg)`;
      if (pointerRef.current) pointerRef.current.style.transform = `rotate(${-flap}deg)`;

      // 원판이 선 뒤에도 화살표가 마지막 떨림을 마칠 때까지 기다린다.
      // 걸린 채로 섰다면 0 이 아니라 그 턱 높이에서 멎으므로 target 기준으로 판정한다.
      const rest = FLAP_MAX * ridgeAt(phaseOf(rot, cell)).h;
      if (
        wheelDone &&
        Math.abs(flap - rest) < FLAP_SETTLED &&
        Math.abs(flapVel) < FLAP_SETTLED_VEL
      ) {
        rafRef.current = null;
        vibrate(VIBE_RESULT); // 결과 확정 — 두 번 울린다
        setResult(options[sectorAt(rot, count)]);
        setIsSpinning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const addOption = () => {
    const label = inputValue.trim();
    if (!label || options.length >= MAX_OPTIONS || isSpinning) return;

    if (customCount < defaultOptions.length) {
      // 기본 옵션 2개는 새로 추가하지 않고 이름만 덮어쓴다
      const updated = [...options];
      updated[customCount] = { ...updated[customCount], label };
      setOptions(updated);
      setCustomCount(customCount + 1);
    } else {
      setOptions([
        ...options,
        { id: Date.now(), label, color: PALETTE[options.length % PALETTE.length] },
      ]);
    }

    setInputValue("");
    rotationRef.current = 0;
    flapRef.current = 0;
    setResult(null);
    inputRef.current?.focus();
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      alert("최소 2개의 옵션이 필요합니다!");
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
    rotationRef.current = 0;
    flapRef.current = 0;
    if (result && result.id === id) setResult(null);
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
    setCustomCount(0);
    setResult(null);
    rotationRef.current = 0;
    flapRef.current = 0;
  };

  const shuffleOptions = () => {
    if (isSpinning || options.length === 0) return;

    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setOptions(shuffled);
    setResult(null);
    rotationRef.current = 0;
    flapRef.current = 0;
  };

  return (
    <GameLayout title="돌려돌림판">
      <div className="flex flex-col h-full gap-4 pt-2 pb-4">
        <div className="flex items-center justify-center">
          {/* 폭과 높이 양쪽에 걸린다.
              - w-full        : 좁은 화면에서는 열 폭을 따라간다
              - 26rem         : 넓은 화면 상한. 앱 열(28rem)에서 GameLayout 의 p-4 를 뺀 폭 전체를 쓴다
              - 100dvh-27rem  : 원판 말고 나머지(헤더·입력·버튼·목록·결과배너·여백)가 약 27rem 이라
                                남는 높이를 넘지 않게 해 세로 스크롤 없이 한 화면에 담는다.
                                결과배너를 얇게(py-2.5/text-xl) 줄여 그만큼 원판에 넘긴 값이다 */}
          <div className="relative aspect-square w-full max-w-[min(26rem,calc(100dvh_-_27rem))]">
            {/* 화살표(플래퍼). 축은 원판 위에 떠 있고, 끝만 얇은 띠에 걸친다.
                띠 폭이 지름의 4% 뿐이라 끝이 그보다 더 들어가면 색칸을 가린다.
                전체 높이 32px(축 10 − 겹침 4 + 촉 26), 24px 끌어올려 끝이 가장자리에서 8px 안쪽. */}
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-6">
              <div ref={pointerRef} className="origin-top will-change-transform">
                <div className="mx-auto h-2.5 w-2.5 rounded-full bg-red-600 shadow" />
                <div className="-mt-1 h-0 w-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[26px] border-t-red-500 drop-shadow-lg" />
              </div>
            </div>

            {/* overflow-hidden 필수:
                svg 는 정사각형 상자인데 rotate 를 걸면 회전한 상자의 외접 사각형이 √2 배(최대 +41%)로 커진다.
                transform 은 스크롤 오버플로에 그대로 잡히므로, 클리핑하지 않으면 돌리는 동안
                GameLayout 의 overflow-auto 가 이를 감지해 가로 스크롤바가 생긴다.
                원판은 정사각형에 내접한 원이라 잘려 나가는 네 귀퉁이는 모두 투명 영역이다.
                화살표는 이 div 바깥(형제)에 있으므로 위로 삐져나온 축이 잘리지 않는다. */}
            <div className="relative h-full w-full overflow-hidden">
              <svg
                ref={wheelRef}
                width="100%"
                height="100%"
                viewBox="0 0 300 300"
                className="will-change-transform"
              >
                {/* 띠 바탕. 칸 사이 홈과 띠~색칸 사이 테가 이 색으로 드러난다. */}
                <circle cx={CENTER} cy={CENTER} r={BAND_OUTER} fill={BAND_GROOVE} />

                {/* 칸칸이 띠 — 화살표가 여기 턱에 걸린다 */}
                {Array.from({ length: cellCount }, (_, k) => (
                  <path
                    key={`cell-${k}`}
                    d={cellPath(k, cellCount)}
                    fill={k % 2 === 0 ? BAND_LIGHT : BAND_DARK}
                  />
                ))}

                {/* 색칸. 칸 사이 구분선(stroke)은 두지 않는다. */}
                {options.map((option, index) => (
                  <g key={option.id}>
                    <path d={sectorPath(index, options.length)} fill={option.color} />
                    <text
                      x={textPosition(index, options.length).x}
                      y={textPosition(index, options.length).y}
                      transform={`rotate(${textPosition(index, options.length).angle} ${
                        textPosition(index, options.length).x
                      } ${textPosition(index, options.length).y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontWeight="bold"
                      fontSize="14"
                      className="select-none"
                    >
                      {option.label}
                    </text>
                  </g>
                ))}
              </svg>

              <button
                onClick={spin}
                disabled={isSpinning || options.length === 0}
                className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-20 h-20 rounded-full z-20 shadow-lg
                  flex flex-col items-center justify-center
                  font-bold text-white text-sm
                  transition-all duration-200
                  ${isSpinning || options.length === 0
                    ? "bg-slate-700 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 hover:scale-110 cursor-pointer active:scale-95"
                  }
                `}
              >
                {isSpinning ? (
                  <span className="text-xs">...</span>
                ) : (
                  <>
                    <span className="text-xl">▶</span>
                    <span className="text-xs mt-0.5">START</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 결과 배너 — 원판에 자리를 넘기려고 얇게 잡았다 (py-2.5 + text-xl) */}
        {result && !isSpinning && (
          <div
            className="text-xl font-bold text-center py-2.5 px-6 rounded-lg animate-bounce mx-4"
            style={{ backgroundColor: result.color, color: "white" }}
          >
            🎉 {result.label} 🎉
          </div>
        )}

        <div className="space-y-4 px-4">
          <div className="flex gap-2">
            <input
              type="text"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addOption()}
              placeholder={`옵션 추가 (최대 ${MAX_OPTIONS}개)`}
              maxLength={20}
              disabled={isSpinning || options.length >= MAX_OPTIONS}
              // min-w-0: input 은 기본 min-content 폭(size=20, 약 200px)을 가져
              // flex-1 만으로는 그 아래로 줄어들지 않는다. 없으면 좁은 화면에서 행이 넘친다.
              className="min-w-0 flex-1 px-4 py-3 bg-slate-800 text-strong rounded-lg placeholder-slate-500 disabled:opacity-50 text-base"
            />
            <button
              // onMouseDown preventDefault: 버튼을 눌러도 input 이 포커스를 잃지 않는다(모바일 키보드 유지)
              onMouseDown={(e) => e.preventDefault()}
              onClick={addOption}
              disabled={isSpinning || options.length >= MAX_OPTIONS || !inputValue.trim()}
              className="shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
            >
              추가
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shuffleOptions}
              disabled={isSpinning || options.length < 2}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
            >
              🔀 섞기
            </button>
            <button
              onClick={resetOptions}
              disabled={isSpinning}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-strong rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
            >
              리셋
            </button>
          </div>

          {/* 어차피 안에서 스크롤되므로 높이를 낮게 잡아 원판 쪽에 자리를 넘긴다 */}
          <div className="max-h-32 overflow-y-auto space-y-1.5">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: option.color + "40" }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: option.color }}
                ></div>
                <span className="flex-1 text-strong text-sm font-medium">{option.label}</span>
                <button
                  onClick={() => removeOption(option.id)}
                  disabled={isSpinning || options.length <= 2}
                  className="text-red-400 hover:text-red-300 text-base font-bold disabled:opacity-50 transition-colors w-7 h-7 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}

/* ────────────────────────────────────────────────────────────
   초기버전 구현 (개편 전 원본). 되돌릴 수 있도록 통째로 남겨 둔 죽은 코드다.
   활성 컴포넌트는 위 하나뿐이며, 이 아래는 참고용이다.
   JSX 주석이 섞여 있어 블록 주석으로는 감쌀 수 없으므로 줄 주석으로 둔다.
   ──────────────────────────────────────────────────────────── */

// import { useState, useRef } from "react";
// import GameLayout from "../layouts/GameLayout";
//
// type RouletteOption = {
//   id: number;
//   label: string;
//   color: string;
// };
//
// const defaultOptions: RouletteOption[] = [
//   { id: 1, label: "옵션 1", color: "#3B82F6" },
//   { id: 2, label: "옵션 2", color: "#10B981" }
// ];
//
// export default function RoulettePage() {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [options, setOptions] = useState<RouletteOption[]>(defaultOptions);
//   const [customCount, setCustomCount] = useState(0);
//   const [result, setResult] = useState<RouletteOption | null>(null);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [rotation, setRotation] = useState(0);
//   const [inputValue, setInputValue] = useState("");
//   const [shouldAnimate, setShouldAnimate] = useState(false);
//
//   const spin = () => {
//     if (isSpinning || options.length === 0) return;
//     setIsSpinning(true);
//     setResult(null);
//
//     const selectedIndex = Math.floor(Math.random() * options.length);
//     const anglePerOption = 360 / options.length;
//     const selectedAngleCenter = -90 + selectedIndex * anglePerOption + anglePerOption / 2;
//     const currentNormalized = ((rotation % 360) + 360) % 360;
//     const minFullRotations = 3;
//     const randomFullRotations = Math.random() * 5;
//     const totalFullRotations = minFullRotations + randomFullRotations;
//     const normalizedSelectedAngle = ((selectedAngleCenter % 360) + 360) % 360;
//     const targetOffset = (360 - normalizedSelectedAngle) % 360;
//     let angleDiff = targetOffset - currentNormalized;
//     if (angleDiff < 0) angleDiff += 360;
//     const totalRotation = rotation + totalFullRotations * 360 + angleDiff;
//
//     setShouldAnimate(false);
//     setTimeout(() => {
//       setShouldAnimate(true);
//       setRotation(totalRotation);
//     }, 10);
//
//     const animationDuration = 3500;
//     setTimeout(() => {
//       const finalRotation = ((totalRotation % 360) + 360) % 360;
//       const arrowAngle = -90 - finalRotation;
//       const anglePerOption = 360 / options.length;
//       const normalizedArrowAngle = ((arrowAngle % 360) + 360) % 360;
//
//       let actualIndex = 0;
//       for (let i = 0; i < options.length; i++) {
//         const sectorStart = ((-90 + i * anglePerOption) % 360 + 360) % 360;
//         const sectorEnd = ((-90 + (i + 1) * anglePerOption) % 360 + 360) % 360;
//
//         if (sectorStart < sectorEnd) {
//           if (normalizedArrowAngle >= sectorStart && normalizedArrowAngle < sectorEnd) {
//             actualIndex = i;
//             break;
//           }
//         } else {
//           if (normalizedArrowAngle >= sectorStart || normalizedArrowAngle < sectorEnd) {
//             actualIndex = i;
//             break;
//           }
//         }
//       }
//
//       const actualOption = options[actualIndex];
//       setResult(actualOption);
//       setIsSpinning(false);
//       setTimeout(() => {
//         setShouldAnimate(false);
//       }, 100);
//     }, animationDuration);
//   };
//
//   const addOption = () => {
//     if (!inputValue.trim() || options.length >= 12) return;
//
//     const colors = [
//       "#ad1313", "#10B981", "#F59E0B", "#fa6161", "#8B5CF6", "#EC4899",
//       "#06B6D4", "#84CC16", "#F97316", "#3B82F6", "#9333EA", "#DB2777"
//     ];
//
//     if (customCount < 2) {
//       const updatedOptions = [...options];
//       updatedOptions[customCount] = {
//         ...updatedOptions[customCount],
//         label: inputValue.trim()
//       };
//       setOptions(updatedOptions);
//       setCustomCount(customCount + 1);
//     } else {
//       const newOption: RouletteOption = {
//         id: Date.now(),
//         label: inputValue.trim(),
//         color: colors[options.length % colors.length],
//       };
//       setOptions([...options, newOption]);
//     }
//
//     setInputValue("");
//     setRotation(0);
//     setResult(null);
//   };
//
//   const removeOption = (id: number) => {
//     if (options.length <= 2) {
//       alert("최소 2개의 옵션이 필요합니다!");
//       return;
//     }
//     setOptions(options.filter((opt) => opt.id !== id));
//     setRotation(0);
//     if (result && result.id === id) {
//       setResult(null);
//     }
//   };
//
//   const resetOptions = () => {
//     setOptions(defaultOptions);
//     setCustomCount(0);
//     setResult(null);
//     setRotation(0);
//   };
//
//   const shuffleOptions = () => {
//     if (isSpinning || options.length === 0) return;
//
//     const shuffled = [...options];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//
//     setOptions(shuffled);
//     setRotation(0);
//     setResult(null);
//   };
//
//   const getSectorPath = (index: number, total: number, radius: number) => {
//     const anglePerOption = 360 / total;
//     const startAngle = (index * anglePerOption - 90) * (Math.PI / 180);
//     const endAngle = ((index + 1) * anglePerOption - 90) * (Math.PI / 180);
//
//     const x1 = radius + radius * Math.cos(startAngle);
//     const y1 = radius + radius * Math.sin(startAngle);
//     const x2 = radius + radius * Math.cos(endAngle);
//     const y2 = radius + radius * Math.sin(endAngle);
//
//     const largeArcFlag = anglePerOption > 180 ? 1 : 0;
//
//     return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
//   };
//
//   const getTextPosition = (index: number, total: number, radius: number) => {
//     const anglePerOption = 360 / total;
//     const angle = (index * anglePerOption + anglePerOption / 2 - 90) * (Math.PI / 180);
//     const textRadius = radius * 0.7;
//     const x = radius + textRadius * Math.cos(angle);
//     const y = radius + textRadius * Math.sin(angle);
//     return { x, y, angle: (angle + Math.PI / 2) * (180 / Math.PI) };
//   };
//
//   const radius = 150;
//
//   return (
//     <GameLayout title="돌려돌림판">
//       <div className="flex flex-col h-full gap-4 pt-2 pb-4">
//         <div className="flex items-center justify-center pt-2">
//           {/* 컨테이너 기준 크기. 이전의 max-w-[90vw] 는 뷰포트 기준이라
//               부모의 p-4 패딩을 고려하지 못해 좁은 화면에서 넘칠 수 있었다. */}
//           <div className="relative aspect-square w-full max-w-[20rem]">
//             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
//               <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[35px] border-t-red-500 drop-shadow-lg"></div>
//             </div>
//             <div className="relative w-full h-full">
//               <svg
//                 width="100%"
//                 height="100%"
//                 viewBox="0 0 300 300"
//                 style={{
//                   transform: `rotate(${rotation}deg)`,
//                   transition: shouldAnimate ? `transform 3500ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
//                 }}
//               >
//                 {options.map((option, index) => (
//                   <g key={option.id}>
//                     <path
//                       d={getSectorPath(index, options.length, radius)}
//                       fill={option.color}
//                       stroke="#1E293B"
//                       strokeWidth="2"
//                     />
//                     <text
//                       x={getTextPosition(index, options.length, radius).x}
//                       y={getTextPosition(index, options.length, radius).y}
//                       transform={`rotate(${getTextPosition(index, options.length, radius).angle} ${getTextPosition(index, options.length, radius).x} ${getTextPosition(index, options.length, radius).y})`}
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       fill="white"
//                       fontWeight="bold"
//                       fontSize="14"
//                       className="select-none"
//                     >
//                       {option.label}
//                     </text>
//                   </g>
//                 ))}
//               </svg>
//               <button
//                 onClick={spin}
//                 disabled={isSpinning || options.length === 0}
//                 className={`
//                   absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
//                   w-20 h-20 rounded-full z-20 shadow-lg
//                   flex flex-col items-center justify-center
//                   font-bold text-white text-sm
//                   transition-all duration-200
//                   ${isSpinning || options.length === 0
//                     ? 'bg-slate-700 border-4 border-slate-600 cursor-not-allowed opacity-70'
//                     : 'bg-gradient-to-br from-green-600 to-green-700 border-4 border-green-500 hover:from-green-500 hover:to-green-600 hover:scale-110 cursor-pointer active:scale-95'
//                   }
//                 `}
//               >
//                 {isSpinning ? (
//                   <span className="text-xs">...</span>
//                 ) : (
//                   <>
//                     <span className="text-xl">▶</span>
//                     <span className="text-xs mt-0.5">START</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//
//         {result && !isSpinning && (
//           <div
//             className="mt-4 text-2xl font-bold text-center py-4 px-6 rounded-lg animate-bounce mx-4"
//             style={{ backgroundColor: result.color, color: "white" }}
//           >
//             🎉 {result.label} 🎉
//           </div>
//         )}
//
//         <div className="space-y-4 px-4 mt-4">
//           <div className="flex gap-2">
//             <input
//               type="text"
//               ref={inputRef}
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && addOption()}
//               placeholder="옵션 추가 (최대 12개)"
//               maxLength={20}
//               disabled={isSpinning || options.length >= 12}
//               // min-w-0: input 은 기본 min-content 폭(size=20, 약 200px)을 가져
//               // flex-1 만으로는 그 아래로 줄어들지 않는다. 없으면 좁은 화면에서 행이 넘친다.
//               className="min-w-0 flex-1 px-4 py-3 bg-slate-800 text-strong rounded-lg placeholder-slate-500 disabled:opacity-50 text-base"
//             />
//             <button
//               onMouseDown={(e) => e.preventDefault()}
//               onClick={addOption}
//               disabled={isSpinning || options.length >= 12 || !inputValue.trim()}
//               className="shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
//             >
//               추가
//             </button>
//           </div>
//
//           <div className="flex gap-2">
//             <button
//               onClick={shuffleOptions}
//               disabled={isSpinning || options.length < 2}
//               className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
//             >
//               🔀 섞기
//             </button>
//             <button
//               onClick={resetOptions}
//               disabled={isSpinning}
//               className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-strong rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
//             >
//               리셋
//             </button>
//           </div>
//
//           <div className="max-h-48 overflow-y-auto space-y-1.5">
//             {options.map((option) => (
//               <div
//                 key={option.id}
//                 className="flex items-center gap-2 px-3 py-2 rounded-lg"
//                 style={{ backgroundColor: option.color + "40" }}
//               >
//                 <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }}></div>
//                 <span className="flex-1 text-strong text-sm font-medium">{option.label}</span>
//                 <button
//                   onClick={() => removeOption(option.id)}
//                   disabled={isSpinning || options.length <= 2}
//                   className="text-red-400 hover:text-red-300 text-base font-bold disabled:opacity-50 transition-colors w-7 h-7 flex items-center justify-center"
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </GameLayout>
//   );
// }
