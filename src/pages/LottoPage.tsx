// src/pages/LottoPage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import planck from "planck-js";
import GameLayout from "../layouts/GameLayout";

/*
 * 로또번호생성 — 실제 추첨기 연출.
 *
 * 45개 공이 통 안에서 송풍기에 떠밀려 섞이고, 배출관을 통해 하나씩 트레이에 앉는다.
 * 공의 움직임은 planck-js 물리(원형 체임버 + 45개 원)로 돌리고, 캔버스에 직접 그린다.
 *
 * 결과값은 물리로 뽑지 않는다. 어떤 공이 관 앞에 오느냐로 정하면 분포를 보장할 수
 * 없으므로, Fisher-Yates 로 공정하게 미리 뽑아두고 그 공을 관으로 빨아들인다.
 * (실제 추첨기도 공이 기류에 빨려 들어가므로 움직임은 같아 보인다)
 */

/* ────────────── 게임 규칙 ────────────── */
const MAX_GAMES = 5;
const GAME_LABELS = ["A", "B", "C", "D", "E"];
const POOL = 45; // 1 ~ 45
const PICK = 6; // 본번호 6개 + 보너스 1개

/* ────────────── 물리 (m 단위) ────────────── */
const CHAMBER_R = 1.5; // 체임버 반지름
const BALL_R = 0.13; // 공 반지름 — 45개가 활발히 섞이도록 통 면적의 34% 정도
const GRAVITY = 11;
const STEP = 1 / 60;
const MAX_SPEED = 11; // 이 이상 빨라지면 벽을 뚫을 수 있어 눌러준다 (m/s)

/* 송풍기. 힘을 절대값으로 주면 공 질량(0.05kg)에 비해 과해서 천장에 박힌다.
 * 전부 중력의 배수로 두고 질량을 곱해 "가속도"로 넣는다.
 *   부력  — 평균 1.15g 정도로 살짝 떠오르게
 *   와류  — 중심 기준 접선 방향. 실제 추첨기처럼 한 방향으로 돌게 만든다
 *   난류  — 무작위 흔들림 */
const BLOW_UP_MIN = 0.6;
const BLOW_UP_MAX = 1.7;
const BLOW_SWIRL = 0.75;
const BLOW_NOISE = 0.5;

/* ────────────── 연출 타이밍 (ms) ────────────── */
const REFILL_MS = 240; // 공이 통에 채워지는 시간
const MIX_MS = 550; // 섞는 시간
const EJECT_EVERY = 200; // 공이 배출되는 간격
const EJECT_FLY_MS = 320; // 공 하나가 관을 통과해 자리에 앉는 시간
const GAME_GAP_MS = 180; // 게임 사이 간격

/* 공식 로또 공 색. 표면 토큰(slate)이 아닌 고정 장식색이라 테마와 무관하다.
 * 다섯 색 모두 밝아서 글자는 전부 진한 회색으로 통일한다.
 * 캔버스용 hex 와 DOM 용 Tailwind 클래스를 함께 둔다 —
 * Tailwind 는 소스에 적힌 문자열만 훑으므로 클래스는 리터럴로 적어야 한다. */
const BALL_HEX = ["#fbc400", "#69c8f2", "#ff7272", "#aaaaaa", "#b0d840"];
const BALL_BG = [
  "bg-[#fbc400]",
  "bg-[#69c8f2]",
  "bg-[#ff7272]",
  "bg-[#aaaaaa]",
  "bg-[#b0d840]",
];
const BALL_INK = "#262626";

// 1~10 / 11~20 / 21~30 / 31~40 / 41~45
function colorIndex(n: number) {
  return Math.min(4, Math.floor((n - 1) / 10));
}

/* ────────────── 한 게임 ────────────── */
type Game = {
  order: number[]; // 뽑힌 순서 (연출용) — 본번호 6 + 보너스 1
  main: number[]; // 정렬된 본번호 6개 (용지 표기용)
  bonus: number;
};

// Fisher-Yates 로 1~45 중 7개를 균등하게 뽑는다
function drawGame(): Game {
  const pool = Array.from({ length: POOL }, (_, i) => i + 1);
  for (let i = 0; i < PICK + 1; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const order = pool.slice(0, PICK + 1);
  return {
    order,
    main: order.slice(0, PICK).sort((a, b) => a - b),
    bonus: order[PICK],
  };
}

/* ────────────── 캔버스 레이아웃 ────────────── */
type Layout = {
  w: number;
  h: number;
  cx: number;
  cy: number; // 체임버 중심
  r: number; // 체임버 반지름 (px)
  ppm: number; // m → px
  ballR: number;
  trayR: number;
  portY: number; // 배출구 y
  trayY: number; // 트레이 중심 y
  slotX: number[]; // 본번호 6 + 보너스 1
  plusX: number;
};

const TUBE_H = 24;
const TRAY_H = 50; // 공 지름(최대 36px)이 여유롭게 들어가는 높이

function computeLayout(w: number, h: number): Layout {
  // 17.85 = 슬롯 7개 + 간격 + "+" 를 합친 trayR 배수 (아래 계산과 짝)
  const trayR = Math.min(18, Math.max(8, (w - 16) / 17.85));
  const r = Math.max(
    40,
    Math.min(w / 2 - 12, (h - TRAY_H - TUBE_H - 24) / 2)
  );
  const cx = w / 2;
  const cy = r + 12;
  const ppm = r / CHAMBER_R;

  // 트레이 슬롯: 본번호 6개 + "+" + 보너스 1개
  const gap = trayR * 0.55;
  const plusW = trayR * 1.1;
  const w6 = 6 * 2 * trayR + 5 * gap;
  const startX = (w - (w6 + plusW + 2 * trayR)) / 2;
  const slotX: number[] = [];
  for (let i = 0; i < 6; i++) slotX.push(startX + trayR + i * (2 * trayR + gap));
  const plusX = startX + w6 + plusW / 2;
  slotX.push(startX + w6 + plusW + trayR);

  return {
    w,
    h,
    cx,
    cy,
    r,
    ppm,
    ballR: BALL_R * ppm,
    trayR,
    portY: cy + r,
    trayY: h - TRAY_H / 2 - 4,
    slotX,
    plusX,
  };
}

/* ────────────── 진행 상태 ────────────── */
type Phase = "idle" | "drawing" | "done";
type Stage = "refill" | "mix" | "eject" | "gap";

type ChamberBall = { n: number; body: planck.Body };
type FlyingBall = { n: number; slot: number; t: number; fx: number; fy: number };

type Session = {
  plan: Game[];
  gameIndex: number;
  stage: Stage;
  stageT: number; // 현재 stage 경과 (ms)
  ejectedCount: number; // 이번 게임에서 배출을 시작한 공 수
  landed: number[]; // 트레이에 앉은 번호 (순서대로)
  flying: FlyingBall[];
};

/* planck 의 destroyBody 는 body 가 이 world 소속인지 검사하지 않는다.
 * 다른 world 의 body 를 넘기면 broadphase 가 깨지므로 직접 확인한다. */
function safeDestroy(world: planck.World | null, body: planck.Body | null) {
  if (!world || !body) return;
  if (body.getWorld() !== world) return;
  world.destroyBody(body);
}

export default function LottoPage() {
  const [gameCount, setGameCount] = useState(1);
  const [games, setGames] = useState<Game[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<planck.World | null>(null);
  const wallRef = useRef<planck.Body | null>(null);
  const ballsRef = useRef<ChamberBall[]>([]);
  const layoutRef = useRef<Layout>(computeLayout(360, 320));
  const rafRef = useRef<number | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const gameCountRef = useRef(1);
  /* 리사이즈하면 캔버스가 지워지므로 다시 그려야 한다. render 는 아래에서
   * 정의되므로 ref 로 우회한다 (첫 measure 때는 no-op 이고, 직후의
   * 초기 렌더 effect 가 그려준다). */
  const renderRef = useRef<() => void>(() => {});

  // 캔버스 크롬 색은 테마 변수에서 읽는다 (다크/라이트 모두 대응)
  const themeRef = useRef({
    s900: "#0f101c",
    s800: "#161724",
    s700: "#212333",
    s600: "#2e3145",
    s500: "#484d60",
    s400: "#878e9d",
  });

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string) => `rgb(${cs.getPropertyValue(name).trim()})`;
      themeRef.current = {
        s900: v("--s-900"),
        s800: v("--s-800"),
        s700: v("--s-700"),
        s600: v("--s-600"),
        s500: v("--s-500"),
        s400: v("--s-400"),
      };
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => mo.disconnect();
  }, []);

  /* ────────────── 물리 세계 ────────────── */
  const clearBalls = useCallback(() => {
    const world = worldRef.current;
    ballsRef.current.forEach((b) => safeDestroy(world, b.body));
    ballsRef.current = [];
  }, []);

  const fillBalls = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    clearBalls();

    /* 45개를 겹치지 않게 놓는다. 무작위로 뿌리면 초기 관통이 생겨
     * 물리가 폭발하므로 격자 위에 올린 뒤 살짝 흔들어준다. */
    const spacing = BALL_R * 2.15;
    const cells: { x: number; y: number }[] = [];
    const lim = CHAMBER_R - BALL_R * 1.4;
    for (let y = -lim; y <= lim; y += spacing) {
      for (let x = -lim; x <= lim; x += spacing) {
        if (Math.hypot(x, y) <= lim) cells.push({ x, y });
      }
    }
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    for (let n = 1; n <= POOL; n++) {
      const c = cells[n - 1] ?? { x: 0, y: 0 };
      const body = world.createDynamicBody({
        position: planck.Vec2(
          c.x + (Math.random() - 0.5) * BALL_R * 0.3,
          c.y + (Math.random() - 0.5) * BALL_R * 0.3
        ),
        linearVelocity: planck.Vec2(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        ),
        angularVelocity: (Math.random() - 0.5) * 8,
        linearDamping: 0.25,
        angularDamping: 0.4,
      });
      body.createFixture(planck.Circle(BALL_R), {
        density: 1,
        friction: 0.05,
        restitution: 0.55,
      });
      ballsRef.current.push({ n, body });
    }
  }, [clearBalls]);

  useEffect(() => {
    const world = planck.World({ gravity: planck.Vec2(0, GRAVITY) });
    worldRef.current = world;

    // 체임버 벽: 원을 다각형 체인으로 근사한다
    const SEGMENTS = 56;
    const verts: planck.Vec2[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const a = (i / SEGMENTS) * Math.PI * 2;
      verts.push(
        planck.Vec2(Math.cos(a) * CHAMBER_R, Math.sin(a) * CHAMBER_R)
      );
    }
    const wall = world.createBody({ position: planck.Vec2(0, 0) });
    wall.createFixture(planck.Chain(verts, true), {
      friction: 0.1,
      restitution: 0.45,
    });
    wallRef.current = wall;

    const el = stageRef.current;
    const canvas = canvasRef.current;

    const measure = () => {
      if (!el || !canvas) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 8 || h < 8) return;
      layoutRef.current = computeLayout(w, h);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      renderRef.current();
    };

    measure();
    const ro = el ? new ResizeObserver(measure) : null;
    if (el && ro) ro.observe(el);

    return () => {
      ro?.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // body 는 world 와 함께 사라진다 — 참조를 남기면 다음 world 에서 터진다
      ballsRef.current = [];
      wallRef.current = null;
      worldRef.current = null;
      sessionRef.current = null;
      phaseRef.current = "idle";
    };
  }, []);

  /* ────────────── 그리기 ────────────── */
  const drawBall = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      n: number,
      x: number,
      y: number,
      r: number
    ) => {
      if (r <= 0.5) return;
      const hex = BALL_HEX[colorIndex(n)];
      // 위쪽에서 빛이 오는 구체감
      const g = ctx.createRadialGradient(
        x - r * 0.35,
        y - r * 0.4,
        r * 0.1,
        x,
        y,
        r
      );
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, hex);
      g.addColorStop(1, hex);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = BALL_INK;
      ctx.font = `700 ${Math.max(8, Math.round(r * 1.05))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(n), x, y + r * 0.04);
    },
    []
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const L = layoutRef.current;
    const T = themeRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, L.w, L.h);

    // 배출관 (체임버 뒤에 깔린다)
    ctx.fillStyle = T.s800;
    ctx.strokeStyle = T.s600;
    ctx.lineWidth = 2;
    const tubeW = L.trayR * 2.1;
    ctx.beginPath();
    ctx.roundRect(L.cx - tubeW / 2, L.portY - 6, tubeW, TUBE_H + 12, 6);
    ctx.fill();
    ctx.stroke();

    // 체임버
    const cg = ctx.createRadialGradient(
      L.cx - L.r * 0.3,
      L.cy - L.r * 0.35,
      L.r * 0.1,
      L.cx,
      L.cy,
      L.r
    );
    cg.addColorStop(0, T.s800);
    cg.addColorStop(1, T.s900);
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    // 통 안의 공 — 벽을 넘어 보이지 않도록 잘라낸다
    ctx.save();
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, L.r - 1, 0, Math.PI * 2);
    ctx.clip();
    const s = sessionRef.current;
    const appearAll =
      !s || s.stage !== "refill" ? 1 : Math.min(1, s.stageT / REFILL_MS);
    ballsRef.current.forEach((b, i) => {
      const p = b.body.getPosition();
      // 채워지는 동안 순서대로 커지며 나타난다
      const a =
        appearAll >= 1
          ? 1
          : Math.max(0, Math.min(1, appearAll * POOL * 1.6 - i));
      drawBall(
        ctx,
        b.n,
        L.cx + p.x * L.ppm,
        L.cy + p.y * L.ppm,
        L.ballR * a
      );
    });
    ctx.restore();

    ctx.beginPath();
    ctx.arc(L.cx, L.cy, L.r, 0, Math.PI * 2);
    ctx.strokeStyle = T.s600;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 트레이
    ctx.fillStyle = T.s800;
    ctx.strokeStyle = T.s700;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(6, L.trayY - TRAY_H / 2, L.w - 12, TRAY_H, 10);
    ctx.fill();
    ctx.stroke();

    // 빈 슬롯
    ctx.strokeStyle = T.s700;
    ctx.lineWidth = 1.5;
    L.slotX.forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, L.trayY, L.trayR, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = T.s500;
    ctx.font = `700 ${Math.round(L.trayR * 0.95)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", L.plusX, L.trayY);

    // 트레이에 앉은 공
    if (s) {
      s.landed.forEach((n, i) => {
        drawBall(ctx, n, L.slotX[i], L.trayY, L.trayR);
      });
      // 관을 통과하는 중인 공
      s.flying.forEach((f) => {
        const t = Math.min(1, f.t / EJECT_FLY_MS);
        const tx = L.slotX[f.slot];
        const ty = L.trayY;
        let x: number;
        let y: number;
        if (t < 0.4) {
          // 기류에 빨려 배출구로
          const k = t / 0.4;
          x = f.fx + (L.cx - f.fx) * k;
          y = f.fy + (L.portY - f.fy) * k;
        } else {
          // 관을 지나 자리로 — 감속하며 안착
          const k = (t - 0.4) / 0.6;
          const e = 1 - Math.pow(1 - k, 2);
          x = L.cx + (tx - L.cx) * e;
          y = L.portY + (ty - L.portY) * e;
        }
        drawBall(ctx, f.n, x, y, L.ballR + (L.trayR - L.ballR) * t);
      });
    }
  }, [drawBall]);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  // 정지 상태에서도 테마 변경·개수 변경이 반영되도록 한 번 그려준다
  useEffect(() => {
    if (phase !== "drawing") render();
  }, [phase, games, render]);

  /* ────────────── 추첨 진행 ────────────── */
  const finishAll = useCallback(() => {
    const s = sessionRef.current;
    if (s) setGames(s.plan);
    clearBalls();
    sessionRef.current = null;
    phaseRef.current = "done";
    setPhase("done");
    setActiveLabel(null);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    render();
  }, [clearBalls, render]);

  const startDraw = useCallback(() => {
    const world = worldRef.current;
    if (!world || phaseRef.current === "drawing") return;

    const count = gameCountRef.current;
    sessionRef.current = {
      plan: Array.from({ length: count }, () => drawGame()),
      gameIndex: 0,
      stage: "refill",
      stageT: 0,
      ejectedCount: 0,
      landed: [],
      flying: [],
    };
    setGames([]);
    setActiveLabel(GAME_LABELS[0]);
    phaseRef.current = "drawing";
    setPhase("drawing");
    fillBalls();

    let last = performance.now();
    let acc = 0;

    // 물리 좌표 → 캔버스 좌표 (배출 시작점 기록용)
    const toCanvasX = (x: number) =>
      layoutRef.current.cx + x * layoutRef.current.ppm;
    const toCanvasY = (y: number) =>
      layoutRef.current.cy + y * layoutRef.current.ppm;

    const frame = (now: number) => {
      const w = worldRef.current;
      const s = sessionRef.current;
      if (!w || !s) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // 고정 타임스텝 + 송풍
      acc += dt;
      let guard = 0;
      while (acc >= STEP && guard < 5) {
        ballsRef.current.forEach((b) => {
          const body = b.body;
          const p = body.getPosition();
          const m = body.getMass();
          const d = Math.hypot(p.x, p.y) || 1;
          // 중심 기준 접선 방향 (와류)
          const tx = -p.y / d;
          const ty = p.x / d;
          const up = BLOW_UP_MIN + Math.random() * (BLOW_UP_MAX - BLOW_UP_MIN);
          body.applyForceToCenter(
            planck.Vec2(
              (tx * BLOW_SWIRL + (Math.random() - 0.5) * 2 * BLOW_NOISE) *
                GRAVITY *
                m,
              (ty * BLOW_SWIRL + (Math.random() - 0.5) * 2 * BLOW_NOISE - up) *
                GRAVITY *
                m
            ),
            true
          );

          // 안전장치: 너무 빠르면 체인 벽을 뚫을 수 있다
          const v = body.getLinearVelocity();
          const sp = Math.hypot(v.x, v.y);
          if (sp > MAX_SPEED) {
            const k = MAX_SPEED / sp;
            body.setLinearVelocity(planck.Vec2(v.x * k, v.y * k));
          }
          // 그래도 빠져나갔다면 통 안으로 되돌린다
          const lim = CHAMBER_R - BALL_R;
          if (d > lim) {
            body.setPosition(planck.Vec2((p.x / d) * lim, (p.y / d) * lim));
            body.setLinearVelocity(planck.Vec2(0, 0));
          }
        });
        w.step(STEP);
        acc -= STEP;
        guard++;
      }

      const ms = dt * 1000;
      s.stageT += ms;
      s.flying.forEach((f) => (f.t += ms));

      // 자리에 앉은 공은 트레이로 넘긴다
      const arrived = s.flying.filter((f) => f.t >= EJECT_FLY_MS);
      if (arrived.length) {
        arrived
          .sort((a, b) => a.slot - b.slot)
          .forEach((f) => s.landed.push(f.n));
        s.flying = s.flying.filter((f) => f.t < EJECT_FLY_MS);
      }

      const game = s.plan[s.gameIndex];

      if (s.stage === "refill") {
        if (s.stageT >= REFILL_MS) {
          s.stage = "mix";
          s.stageT = 0;
        }
      } else if (s.stage === "mix") {
        if (s.stageT >= MIX_MS) {
          s.stage = "eject";
          s.stageT = EJECT_EVERY; // 첫 공은 바로 배출
        }
      } else if (s.stage === "eject") {
        if (s.ejectedCount < game.order.length && s.stageT >= EJECT_EVERY) {
          s.stageT = 0;
          const n = game.order[s.ejectedCount];
          const idx = ballsRef.current.findIndex((b) => b.n === n);
          if (idx >= 0) {
            const b = ballsRef.current[idx];
            const p = b.body.getPosition();
            s.flying.push({
              n,
              slot: s.ejectedCount,
              t: 0,
              fx: toCanvasX(p.x),
              fy: toCanvasY(p.y),
            });
            safeDestroy(w, b.body);
            ballsRef.current.splice(idx, 1);
          }
          s.ejectedCount++;
        }
        // 7개가 모두 자리에 앉으면 이 게임 종료
        if (
          s.ejectedCount >= game.order.length &&
          s.flying.length === 0 &&
          s.landed.length >= game.order.length
        ) {
          setGames((prev) => [...prev, game]);
          s.stage = "gap";
          s.stageT = 0;
        }
      } else if (s.stage === "gap") {
        if (s.stageT >= GAME_GAP_MS) {
          const next = s.gameIndex + 1;
          if (next >= s.plan.length) {
            clearBalls();
            sessionRef.current = null;
            phaseRef.current = "done";
            setPhase("done");
            setActiveLabel(null);
            render();
            rafRef.current = null;
            return;
          }
          s.gameIndex = next;
          s.stage = "refill";
          s.stageT = 0;
          s.ejectedCount = 0;
          s.landed = [];
          s.flying = [];
          setActiveLabel(GAME_LABELS[next]);
          fillBalls();
        }
      }

      render();
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [clearBalls, fillBalls, render]);

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    clearBalls();
    sessionRef.current = null;
    phaseRef.current = "idle";
    setPhase("idle");
    setGames([]);
    setActiveLabel(null);
    render();
  }, [clearBalls, render]);

  const changeCount = (c: number) => {
    if (phase === "drawing") return;
    gameCountRef.current = c;
    setGameCount(c);
    setGames([]);
    phaseRef.current = "idle";
    setPhase("idle");
  };

  return (
    <GameLayout title="로또번호생성">
      <div className="flex flex-col h-full gap-2.5">
        {/* 게임 수 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 shrink-0">게임 수</span>
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_GAMES }, (_, i) => i + 1).map((c) => (
              <button
                key={c}
                onClick={() => changeCount(c)}
                disabled={phase === "drawing"}
                className={`w-8 h-8 rounded-md text-sm font-bold transition-colors disabled:opacity-40 ${
                  gameCount === c
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-strong hover:bg-slate-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {activeLabel && (
            <span className="ml-auto text-[11px] font-bold text-emerald-500">
              {activeLabel} 게임 추첨 중
            </span>
          )}
        </div>

        {/* 추첨기 */}
        <div ref={stageRef} className="relative flex-1 min-h-0">
          <canvas ref={canvasRef} className="block" />
          {phase === "idle" && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-slate-400 text-sm pointer-events-none">
              아래 버튼을 눌러 추첨을 시작하세요
            </div>
          )}
          {phase === "drawing" && (
            <button
              onClick={finishAll}
              className="absolute top-0 right-0 text-[11px] px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-strong border border-slate-600 transition-colors"
            >
              건너뛰기
            </button>
          )}
        </div>

        {/* 결과 */}
        {games.length > 0 && (
          <div className="shrink-0 max-h-[34%] overflow-y-auto space-y-1.5 pr-1">
            {games.map((g, i) => (
              <div
                key={i}
                // 공이 38px 에서 멈추므로 넓은 화면에서는 그룹째 가운데로 모은다
                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-2 py-1.5"
              >
                <span className="w-3.5 shrink-0 text-[11px] font-bold text-slate-400">
                  {GAME_LABELS[i]}
                </span>
                {g.main.map((n) => (
                  <ResultBall key={n} n={n} />
                ))}
                <span className="px-0.5 text-xs text-slate-400">+</span>
                <ResultBall n={g.bonus} />
              </div>
            ))}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={startDraw}
            disabled={phase === "drawing"}
            className="flex-1 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {phase === "drawing"
              ? "추첨 중…"
              : phase === "done"
              ? "다시 뽑기"
              : `번호 뽑기 (${gameCount}게임)`}
          </button>
          {phase === "done" && (
            <button
              onClick={reset}
              className="px-5 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-strong font-bold border border-slate-600 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>
    </GameLayout>
  );
}

/* 결과 목록의 공 — 배경이 고정 장식색이므로 글자색도 고정한다.
 * 고정 px 로 두면 좁은 화면(320px)에서 한 줄이 넘치므로 flex-1 로 폭을 나눠
 * 갖고 aspect-square 로 원을 유지한다. 좁으면 29px 까지 줄고, 넓으면 38px 에서
 * 멈춘다 (캔버스 트레이 공 36px 과 비슷하게). */
function ResultBall({ n }: { n: number }) {
  return (
    <span
      className={`grid aspect-square min-w-0 max-w-[38px] flex-1 place-items-center rounded-full text-[13px] font-bold text-[#262626] ring-1 ring-black/15 ${
        BALL_BG[colorIndex(n)]
      }`}
    >
      {n}
    </span>
  );
}
