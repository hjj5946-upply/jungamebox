import { useCallback, useEffect, useRef, useState } from "react";
import planck from "planck-js";
import GameLayout from "../layouts/GameLayout";

/*
 * 주사위 굴리기 — 테이블을 위에서 내려다보는 탑다운 시점.
 *
 * planck-js 는 2D 전용이라 "옆에서 본 주사위"를 물리로 굴릴 수 없다.
 * 그래서 시점을 탑다운으로 두면 2D 물리가 실제로 맞는 모델이 된다:
 *   - 중력 없음(테이블을 내려다보므로) + damping 으로 테이블 마찰을 표현
 *   - 벽 = 실제 트레이 경계 (DOM 크기에서 측정)
 *   - 3D 텀블은 "이동 거리 / 한 변 = 1/4 회전" 이라는 구름 관계에서 유도
 *
 * 결과값은 미리 뽑지 않는다. 실제 주사위처럼 모서리를 하나씩 넘어가게 두면
 * 멈췄을 때 항상 어떤 면이 정확히 위를 향하므로, 그 면을 읽어 결과로 쓴다.
 * 마지막에 자세를 억지로 맞추는 보정이 없어서 튀는 느낌이 나지 않는다.
 */

/* ────────────── 물리 · 렌더 상수 ────────────── */
const PPM = 72; // 1m = 72px → 주사위 한 변이 정확히 1m
const DIE_PX = 72;
const HALF_M = 0.5; // 주사위 half-extent (m)
const MAX_DICE = 5;
const STEP = 1 / 60;
const WALL_T = 1; // 벽 두께 (m)

const THROW_MIN = 11; // 던지는 속도 (m/s)
const THROW_MAX = 17;
const SPIN_MAX = 22; // 초기 각속도 (rad/s)
const LINEAR_DAMPING = 2.8; // 테이블 마찰 — 크면 빨리 멈춘다
const ANGULAR_DAMPING = 3.4;
// 순수 구름은 "한 변 이동 = 1/4 회전"이지만, 실제로 던진 주사위는
// 튀면서 그보다 빠르게 뒤집힌다. 그 체감을 살리는 배수.
// 2.5 면 굴림 한 번에 2.5~3.8 회전, 최고 61도/프레임 —
// 90도/프레임을 넘으면 회전 방향이 뒤집혀 보이므로 그 아래로 둔다.
const ROLL_GAIN = 2.5;

const PERSPECTIVE = 1000; // 카메라 거리 (px) — 트레이의 perspective 와 같은 값
// 모서리를 넘을 때 중심이 최대로 들리는 높이: (변/2)(√2 − 1) ≈ 14.9px
const MAX_LIFT = (DIE_PX / 2) * (Math.SQRT2 - 1);
/* 큐브를 테이블 위로 올려놓으면 카메라에 그만큼 가까워져서 커 보인다.
 * 벽 위치를 이 배율만큼 안쪽으로 당기지 않으면 트레이 가장자리에서
 * 주사위가 overflow-hidden 에 잘린다. */
const Z_MAG = PERSPECTIVE / (PERSPECTIVE - (DIE_PX / 2 + MAX_LIFT));

const STOP_SPEED = 0.25; // 이 아래면 멈춘 것으로 본다 (m/s)
const STOP_OMEGA = 0.4; // rad/s
const STOP_FRAMES = 8; // 위 조건이 연속으로 유지돼야 하는 프레임 수
const MAX_ROLL_MS = 3000; // 어떤 이유로든 안 멈출 때의 안전장치

/* ────────────── 쿼터니언 유틸 ──────────────
 * 오일러각으로 누적하면 짐벌락과 축 순서 문제로 회전이 뒤틀린다.
 * 자세는 쿼터니언으로만 다룬다. (x, y, z, w) 순서.
 */
type Quat = [number, number, number, number];

function qAxisAngle(x: number, y: number, z: number, angle: number): Quat {
  const h = angle / 2;
  const s = Math.sin(h);
  return [x * s, y * s, z * s, Math.cos(h)];
}

function qMul(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

function qNorm(q: Quat): Quat {
  const n = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

// 쿼터니언으로 벡터 회전: v + 2w(u×v) + 2u×(u×v)
function rotateVec(
  q: Quat,
  v: [number, number, number]
): [number, number, number] {
  const [ux, uy, uz, w] = q;
  const cx = uy * v[2] - uz * v[1];
  const cy = uz * v[0] - ux * v[2];
  const cz = ux * v[1] - uy * v[0];
  return [
    v[0] + 2 * (w * cx + uy * cz - uz * cy),
    v[1] + 2 * (w * cy + uz * cx - ux * cz),
    v[2] + 2 * (w * cz + ux * cy - uy * cx),
  ];
}

// CSS matrix3d 는 열 우선(column-major) 순서다
function qToMatrix3d(q: Quat): string {
  const [x, y, z, w] = q;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const r11 = 1 - 2 * (yy + zz);
  const r12 = 2 * (x * y - z * w);
  const r13 = 2 * (x * z + y * w);
  const r21 = 2 * (x * y + z * w);
  const r22 = 1 - 2 * (xx + zz);
  const r23 = 2 * (y * z - x * w);
  const r31 = 2 * (x * z - y * w);
  const r32 = 2 * (y * z + x * w);
  const r33 = 1 - 2 * (xx + yy);
  return `matrix3d(${r11},${r21},${r31},0,${r12},${r22},${r32},0,${r13},${r23},${r33},0,0,0,0,1)`;
}

// 아무 방향으로나 기울어진 자세 (평평하지 않아 여러 면이 함께 보인다)
function randomQuat(): Quat {
  return qNorm([
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  ]);
}

/* 겹치지 않게 흩어놓기 — 후보를 여러 번 뽑아 가장 멀리 떨어진 곳을 고른다.
 * 좁은 트레이에서도 최선의 간격이 나오도록 실패하지 않는 방식으로 둔다. */
function scatter(n: number, hw: number, hh: number) {
  const pts: { x: number; y: number }[] = [];
  const margin = 0.15;
  const rx = Math.max(0, hw - margin);
  const ry = Math.max(0, hh - margin);
  for (let i = 0; i < n; i++) {
    let best = { x: 0, y: 0 };
    let bestGap = -1;
    for (let t = 0; t < 40; t++) {
      const c = {
        x: (Math.random() * 2 - 1) * rx,
        y: (Math.random() * 2 - 1) * ry,
      };
      let gap = Infinity;
      for (const p of pts) gap = Math.min(gap, Math.hypot(p.x - c.x, p.y - c.y));
      if (gap > bestGap) {
        bestGap = gap;
        best = c;
      }
      if (gap >= 1.2) break; // 충분히 떨어졌으면 더 볼 필요 없다
    }
    pts.push(best);
  }
  return pts;
}

/* 각 눈이 위(+Z, 화면 쪽)를 향하게 만드는 자세.
 * 기본 전개도는 위=1 / 아래=6 / 앞=2 / 뒤=5 / 오른=3 / 왼=4 (마주보는 합 = 7). */
const FACE_UP: Record<number, Quat> = {
  1: [0, 0, 0, 1],
  2: qAxisAngle(1, 0, 0, Math.PI / 2),
  3: qAxisAngle(0, 1, 0, -Math.PI / 2),
  4: qAxisAngle(0, 1, 0, Math.PI / 2),
  5: qAxisAngle(1, 0, 0, -Math.PI / 2),
  6: qAxisAngle(1, 0, 0, Math.PI),
};

// 각 눈의 로컬 법선 (위 전개도와 짝을 이룬다)
const FACE_NORMAL: Record<number, [number, number, number]> = {
  1: [0, 0, 1],
  6: [0, 0, -1],
  2: [0, 1, 0],
  5: [0, -1, 0],
  3: [1, 0, 0],
  4: [-1, 0, 0],
};

/* 정육면체를 자기 자신으로 보내는 회전은 24가지뿐이다(면 6 × yaw 4).
 * 그중 하나를 균등하게 뽑는다. 이후 붙는 텀블은 모두 이 군(群) 안의
 * 고정 회전이므로 균등성이 유지된다 → 결과 눈이 1~6 균등. */
function randomGroupQuat(): Quat {
  const v = 1 + Math.floor(Math.random() * 6);
  const k = Math.floor(Math.random() * 4);
  return qNorm(qMul(qAxisAngle(0, 0, 1, (k * Math.PI) / 2), FACE_UP[v]));
}

// 정자세에서 위(+Z)를 향한 눈을 읽는다. yaw 는 위 면을 바꾸지 않으므로 무시한다.
function readUpFace(base: Quat): number {
  let best = 1;
  let bestZ = -Infinity;
  for (let v = 1; v <= 6; v++) {
    const z = rotateVec(base, FACE_NORMAL[v])[2];
    if (z > bestZ) {
      bestZ = z;
      best = v;
    }
  }
  return best;
}

/* planck 의 destroyBody 는 body 가 이 world 소속인지 검사하지 않는다.
 * 다른 world 의 body 를 넘기면 없는 proxy 를 지우려 하다가
 * removeLeaf(undefined) 로 터지므로 소속을 직접 확인한다. */
function safeDestroy(world: planck.World | null, body: planck.Body | null) {
  if (!world || !body) return;
  if (body.getWorld() !== world) return;
  world.destroyBody(body);
}

/* ────────────── 주사위 런타임 상태 ──────────────
 * 프레임마다 setState 하면 React 가 매 프레임 리렌더된다.
 * 물리 결과는 ref 에 두고 transform 만 DOM 에 직접 써서 렌더 루프를 분리한다. */
type DieRuntime = {
  body: planck.Body | null;
  quat: Quat; // 화면에 실제로 그리는 자세 (합성 결과)

  /* 실제 주사위는 한 번에 모서리 하나를 넘어간다. 그 구조를 그대로 둔다:
   *   base      — 24가지 정자세 중 하나. 항상 어떤 면이 정확히 위를 향한다.
   *   tipAxis   — 지금 넘고 있는 모서리의 축 (base 이전 프레임의 카디널 축)
   *   tipAngle  — 그 모서리를 넘은 정도, 0 ~ 90도
   * 90도에 도달하면 base 에 흡수하고 새 모서리를 잡는다.
   * 표시 자세 = yaw(물리각) · tip · base 이므로, tipAngle 이 0 이나 90도면
   * 반드시 어떤 면이 정확히 위를 향한다 → 마지막에 억지로 돌릴 필요가 없다. */
  base: Quat;
  tipAxis: [number, number, number];
  tipAngle: number;

  prevX: number;
  prevY: number;
  lift: number; // 현재 들린 높이 (px)

  // 멈출 때 남은 모서리를 넘거나 되돌리는 마지막 동작
  finishFrom: number;
  finishTo: number;
  finishT: number; // 0 → 1
  finishMs: number;
};

function makeRuntime(): DieRuntime {
  return {
    body: null,
    quat: [0, 0, 0, 1],
    base: [0, 0, 0, 1],
    tipAxis: [0, 1, 0],
    tipAngle: 0,
    prevX: 0,
    prevY: 0,
    lift: 0,
    finishFrom: 0,
    finishTo: 0,
    finishT: 1,
    finishMs: 1,
  };
}

/* 표시 자세 = yaw(물리각) · tip · base.
 * tip 을 yaw 안쪽에 두면 눈에 보이는 회전축이 yaw·tipAxis 가 되므로,
 * tipAxis 는 "진행 방향에 수직인 월드축을 yaw 만큼 되돌린 것"으로 잡는다. */
function composeQuat(rt: DieRuntime, yaw: number): Quat {
  const tip = qAxisAngle(
    rt.tipAxis[0],
    rt.tipAxis[1],
    rt.tipAxis[2],
    rt.tipAngle
  );
  return qNorm(qMul(qAxisAngle(0, 0, 1, yaw), qMul(tip, rt.base)));
}

/* 지금 넘어야 할 모서리의 축. 진행 방향에 수직인 월드축 (-dy, dx, 0) 를
 * yaw 만큼 되돌린 뒤, 정육면체 모서리에 맞게 카디널 축으로 양자화한다. */
function pickTipAxis(
  dx: number,
  dy: number,
  dist: number,
  yaw: number
): [number, number, number] {
  const wx = -dy / dist;
  const wy = dx / dist;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const ax = wx * c + wy * s; // yaw 만큼 역회전
  const ay = -wx * s + wy * c;
  return Math.abs(ax) >= Math.abs(ay)
    ? [Math.sign(ax) || 1, 0, 0]
    : [0, Math.sign(ay) || 1, 0];
}

// 모서리를 넘는 동안 중심이 오르내리는 실제 높이 (평평할 때 0)
function tipRise(tipAngle: number) {
  return Math.SQRT2 * Math.sin(Math.PI / 4 + tipAngle) - 1; // 0 ~ 0.414
}

type Phase = "idle" | "rolling" | "done";

export default function DicePage() {
  const [values, setValues] = useState<number[]>([1]);
  const [phase, setPhase] = useState<Phase>("idle");

  const worldRef = useRef<planck.World | null>(null);
  const boundsRef = useRef({ hw: 2.5, hh: 3 }); // half-extent (m)
  const trayRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const runtimeRef = useRef<DieRuntime[]>([makeRuntime()]);
  const valuesRef = useRef<number[]>([1]);
  const phaseRef = useRef<Phase>("idle");

  const dieElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cubeElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const shadowElsRef = useRef<(HTMLDivElement | null)[]>([]);

  /* 한 주사위의 현재 상태를 DOM 에 반영 */
  const paint = useCallback((i: number, x: number, y: number) => {
    const rt = runtimeRef.current[i];
    if (!rt) return;

    const px = x * PPM;
    const py = y * PPM;
    const lift = rt.lift;

    const el = dieElsRef.current[i];
    if (el) el.style.transform = `translate3d(${px}px, ${py}px, 0)`;

    const cube = cubeElsRef.current[i];
    if (cube) {
      /* 주사위는 테이블(z=0) 위에 "올라가" 있어야 한다. 중심을 z=0 에 두면
       * 큐브 아래 절반이 테이블 아래로 잠기고, 같은 3D 문맥에 있는 그림자
       * 평면과 실제로 교차해서 검은 띠가 모서리에 비친다.
       * 모서리를 축으로 기울 때의 중심 높이가 정확히 (변/2 + lift) 라
       * 이렇게 두면 큐브 최저점이 테이블에 닿기만 하고 뚫지 않는다. */
      cube.style.transform = `translateZ(${DIE_PX / 2 + lift}px) ${qToMatrix3d(
        rt.quat
      )}`;
    }

    // 그림자: 주사위가 들릴수록 작아지고·흐려지고·옅어진다
    const shadow = shadowElsRef.current[i];
    if (shadow) {
      const k = lift / DIE_PX; // 0 ~ 0.2 정도
      /* 빠를 때는 상하 진동 진폭을 줄이므로(떨림으로 보여서) 큐브가 기하학적
       * 높이보다 낮아진다. 그때도 그림자 평면과 겹치지 않게 살짝 아래에 둔다.
       * -18px 이면 perspective 1000 에서 시차는 2% 미만이라 눈에 안 띈다. */
      shadow.style.transform = `translate3d(${px + lift * 0.35}px, ${
        py + lift * 0.7
      }px, -18px) scale(${(1 - k * 0.9).toFixed(3)})`;
      shadow.style.filter = `blur(${(5 + lift * 0.7).toFixed(1)}px)`;
      shadow.style.opacity = `${Math.max(0.12, 0.5 - k * 1.4).toFixed(3)}`;
    }
  }, []);

  /* 굴리기 전 대기 상태: 불규칙한 위치에 제각기 기울어진 채로 놓는다.
   * 면이 정확히 위를 향하면 정사각형으로만 보여서 평면처럼 읽히므로,
   * 축에 정렬되지 않은 자세를 줘서 인접한 면까지 함께 보이게 한다. */
  const layoutIdle = useCallback(() => {
    const n = valuesRef.current.length;
    const { hw, hh } = boundsRef.current;
    const spots = scatter(n, hw, hh);
    spots.forEach((p, i) => {
      const rt = runtimeRef.current[i];
      if (!rt) return;
      rt.quat = randomQuat();
      rt.lift = 7 + Math.random() * 8; // 살짝 떠 있게 → 그림자로 입체감이 살아난다
      paint(i, p.x, p.y);
    });
  }, [paint]);

  /* 물리 세계 + 트레이 크기에 맞는 벽 */
  useEffect(() => {
    const world = planck.World({ gravity: planck.Vec2(0, 0) });
    worldRef.current = world;

    /* 벽은 이 world 의 지역 변수로 둔다.
     * ref 에 두면 StrictMode 재마운트(dev) 때 이전 world 의 body 를
     * 새 world 에 destroy 하려 하고, planck 의 destroyBody 는 world 소속을
     * 검사하지 않아서 broadphase 트리가 깨진다(removeLeaf(undefined)). */
    let walls: planck.Body[] = [];

    const buildWalls = (hw: number, hh: number) => {
      walls.forEach((b) => world.destroyBody(b));
      const mk = (cx: number, cy: number, hx: number, hy: number) => {
        const b = world.createBody({ position: planck.Vec2(cx, cy) });
        b.createFixture(planck.Box(hx, hy), {
          friction: 0.2,
          restitution: 0.45,
        });
        return b;
      };
      walls = [
        mk(0, -hh - WALL_T, hw + WALL_T, WALL_T), // 위
        mk(0, hh + WALL_T, hw + WALL_T, WALL_T), // 아래
        mk(-hw - WALL_T, 0, WALL_T, hh + WALL_T), // 왼쪽
        mk(hw + WALL_T, 0, WALL_T, hh + WALL_T), // 오른쪽
      ];
    };

    const tray = trayRef.current;
    const measure = () => {
      if (!tray) return;
      // 주사위 반 칸 + perspective 배율만큼 안쪽으로 경계를 잡는다
      const hw = Math.max(1, tray.clientWidth / 2 / Z_MAG / PPM - HALF_M);
      const hh = Math.max(1, tray.clientHeight / 2 / Z_MAG / PPM - HALF_M);
      boundsRef.current = { hw, hh };
      buildWalls(hw, hh);

      if (phaseRef.current === "idle") {
        layoutIdle();
      } else if (phaseRef.current === "done") {
        // 결과가 나온 뒤 트레이가 줄어들면(모바일 주소창 등) 주사위가
        // 잘려 보이므로 새 경계 안으로 끌어당긴다. 결과값은 건드리지 않는다.
        runtimeRef.current.forEach((rt, i) => {
          if (!rt.body) return;
          const p = rt.body.getPosition();
          const x = Math.min(hw, Math.max(-hw, p.x));
          const y = Math.min(hh, Math.max(-hh, p.y));
          if (x !== p.x || y !== p.y) rt.body.setPosition(planck.Vec2(x, y));
          paint(i, x, y);
        });
      }
    };

    measure();
    const ro = tray ? new ResizeObserver(measure) : null;
    if (tray && ro) ro.observe(tray);

    return () => {
      ro?.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // body 는 world 와 함께 사라진다. 참조를 남기면 다음 world 에서
      // destroy 를 시도해 broadphase 가 깨지므로 여기서 끊는다.
      runtimeRef.current.forEach((rt) => {
        rt.body = null;
      });
      worldRef.current = null;
      phaseRef.current = "idle";
      setPhase("idle");
    };
  }, [layoutIdle, paint]);

  /* 주사위 굴리기 */
  const rollDice = useCallback(() => {
    const world = worldRef.current;
    if (!world || phaseRef.current === "rolling") return;

    const n = valuesRef.current.length;
    const { hw, hh } = boundsRef.current;

    // 이전 body 정리
    runtimeRef.current.forEach((rt) => {
      safeDestroy(world, rt.body);
      rt.body = null;
    });

    /* 결과값을 미리 뽑지 않는다. 시작 자세를 24가지 정자세 중 하나로
     * 균등하게 뽑아두면, 굴러간 뒤 위를 향한 면이 그대로 결과가 되고
     * 그 분포도 1~6 균등이 보장된다. */

    // 트레이 아래쪽(사용자 쪽)에서 위로 던져 넣는다
    const spacing = Math.min(1.2, Math.max(0.05, (2 * hw - 1.2) / Math.max(1, n - 1)));
    const spawnY = hh - 0.55;

    runtimeRef.current.forEach((rt, i) => {
      const x = (i - (n - 1) / 2) * spacing;
      const speed = THROW_MIN + Math.random() * (THROW_MAX - THROW_MIN);
      const body = world.createDynamicBody({
        position: planck.Vec2(x, spawnY),
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 2 * SPIN_MAX,
        linearVelocity: planck.Vec2((Math.random() - 0.5) * 5, -speed),
        linearDamping: LINEAR_DAMPING, // 테이블 마찰
        angularDamping: ANGULAR_DAMPING,
        bullet: true, // 빠를 때 벽을 통과하지 않도록 CCD
      });
      body.createFixture(planck.Box(HALF_M, HALF_M), {
        density: 1.2,
        friction: 0.25,
        restitution: 0.3,
      });

      rt.body = body;
      rt.prevX = x;
      rt.prevY = spawnY;
      rt.lift = 0;
      rt.base = randomGroupQuat();
      rt.tipAxis = [0, 1, 0];
      rt.tipAngle = 0;
      rt.finishT = 1;
      rt.quat = composeQuat(rt, body.getAngle());
    });

    phaseRef.current = "rolling";
    setPhase("rolling");

    let last = performance.now();
    const startedAt = last;
    let acc = 0;
    let quietFrames = 0;
    let finishing = false;

    /* 멈출 때: 넘던 모서리를 끝까지 넘기거나(절반 넘었으면) 되돌린다.
     * 실제 주사위가 마지막에 "톡 넘어가거나 제자리로 주저앉는" 그 동작이고,
     * 남은 각도가 최대 45도뿐이라 튀는 느낌 없이 이어진다. */
    const beginFinish = () => {
      finishing = true;
      runtimeRef.current.forEach((rt) => {
        const half = Math.PI / 4;
        rt.finishFrom = rt.tipAngle;
        rt.finishTo = rt.tipAngle > half ? Math.PI / 2 : 0;
        rt.finishT = 0;
        // 남은 각도에 비례한 시간 — 조금 남았으면 짧게 끝낸다
        const remain = Math.abs(rt.finishTo - rt.finishFrom) / (Math.PI / 2);
        rt.finishMs = 70 + remain * 190;
      });
    };

    const frame = (now: number) => {
      const w = worldRef.current;
      if (!w) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!finishing) {
        // 고정 타임스텝: 프레임레이트가 흔들려도 물리 결과가 같다
        acc += dt;
        let guard = 0;
        while (acc >= STEP && guard < 5) {
          w.step(STEP);
          acc -= STEP;
          guard++;
        }
      }

      let allQuiet = true;

      runtimeRef.current.forEach((rt, i) => {
        const body = rt.body;
        if (!body) return;

        const pos = body.getPosition();
        const yaw = body.getAngle();

        if (finishing) {
          rt.finishT = Math.min(1, rt.finishT + (dt * 1000) / rt.finishMs);
          const e = 1 - Math.pow(1 - rt.finishT, 3); // easeOutCubic
          rt.tipAngle = rt.finishFrom + (rt.finishTo - rt.finishFrom) * e;
          rt.lift = (DIE_PX / 2) * tipRise(rt.tipAngle);
          rt.quat = composeQuat(rt, yaw);
          paint(i, pos.x, pos.y);
          if (rt.finishT < 1) allQuiet = false;
          return;
        }

        const vel = body.getLinearVelocity();
        const omega = body.getAngularVelocity();
        const speed = Math.hypot(vel.x, vel.y);

        const dx = pos.x - rt.prevX;
        const dy = pos.y - rt.prevY;
        const dist = Math.hypot(dx, dy);

        /* 구름: 한 변(1m) 이동 = 1/4 회전.
         * 90도를 채우면 base 에 흡수하고 다음 모서리를 새로 잡는다. */
        if (dist > 1e-6) {
          if (rt.tipAngle <= 0) rt.tipAxis = pickTipAxis(dx, dy, dist, yaw);
          rt.tipAngle += dist * (Math.PI / 2) * ROLL_GAIN;
          let guard = 0;
          while (rt.tipAngle >= Math.PI / 2 && guard < 8) {
            rt.base = qNorm(
              qMul(
                qAxisAngle(rt.tipAxis[0], rt.tipAxis[1], rt.tipAxis[2], Math.PI / 2),
                rt.base
              )
            );
            rt.tipAngle -= Math.PI / 2;
            rt.tipAxis = pickTipAxis(dx, dy, dist, yaw);
            guard++;
          }
        }

        rt.quat = composeQuat(rt, yaw);

        /* 모서리를 넘는 동안 중심 높이는 (변/2) → (변/√2) → (변/2) 로 오르내린다.
         * 아주 빠를 때는 그 진동이 떨림으로만 보이므로 진폭을 줄인다. */
        const activity =
          Math.min(1, speed / 1.5) * Math.min(1, 4 / Math.max(speed, 0.01));
        rt.lift = (DIE_PX / 2) * tipRise(rt.tipAngle) * activity;

        rt.prevX = pos.x;
        rt.prevY = pos.y;

        paint(i, pos.x, pos.y);

        if (speed > STOP_SPEED || Math.abs(omega) > STOP_OMEGA) allQuiet = false;
      });

      if (finishing) {
        if (allQuiet) {
          // 마지막 모서리를 넘긴 결과를 base 에 확정하고, 위를 향한 눈을 읽는다
          const result = runtimeRef.current.map((rt) => {
            if (rt.tipAngle >= Math.PI / 4) {
              rt.base = qNorm(
                qMul(
                  qAxisAngle(rt.tipAxis[0], rt.tipAxis[1], rt.tipAxis[2], Math.PI / 2),
                  rt.base
                )
              );
            }
            rt.tipAngle = 0;
            rt.lift = 0;
            return readUpFace(rt.base);
          });
          valuesRef.current = result;
          setValues(result);
          phaseRef.current = "done";
          setPhase("done");
          rafRef.current = null;
          return;
        }
      } else {
        if (allQuiet) quietFrames++;
        else quietFrames = 0;
        if (quietFrames > STOP_FRAMES || now - startedAt > MAX_ROLL_MS) {
          beginFinish();
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [paint]);

  /* 개수 조절 — 굴리는 중에는 막는다 */
  const addDice = () => {
    if (phase === "rolling") return;
    const next =
      values.length >= MAX_DICE ? [1] : [...values.map(() => 1), 1];
    applyCount(next);
  };

  const removeDice = () => {
    if (phase === "rolling" || values.length <= 1) return;
    applyCount(values.slice(0, -1).map(() => 1));
  };

  const applyCount = (next: number[]) => {
    const world = worldRef.current;
    runtimeRef.current.forEach((rt) => {
      safeDestroy(world, rt.body);
      rt.body = null;
    });
    runtimeRef.current = next.map(() => makeRuntime());
    dieElsRef.current.length = next.length;
    cubeElsRef.current.length = next.length;
    shadowElsRef.current.length = next.length;
    valuesRef.current = next;
    setValues(next);
    phaseRef.current = "idle";
    setPhase("idle");
  };

  // 개수가 바뀌면 새로 붙은 DOM 에 정지 배치를 다시 그린다
  useEffect(() => {
    if (phaseRef.current === "idle") layoutIdle();
  }, [values.length, layoutIdle]);

  /* 모바일 흔들기 — 최신 rollDice 를 ref 로 잡아 stale closure 를 피한다 */
  const rollRef = useRef(rollDice);
  useEffect(() => {
    rollRef.current = rollDice;
  }, [rollDice]);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const t = e.timeStamp;
      if (t - lastTime < 500) return;

      const dx = Math.abs((acc.x || 0) - lastX);
      const dy = Math.abs((acc.y || 0) - lastY);
      const dz = Math.abs((acc.z || 0) - lastZ);

      lastX = acc.x || 0;
      lastY = acc.y || 0;
      lastZ = acc.z || 0;

      if (lastTime > 0 && dx + dy + dz > 30) rollRef.current();
      lastTime = t;
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

  const total = values.reduce((s, v) => s + v, 0);

  return (
    <GameLayout title="주사위">
      <div className="flex flex-col h-full">
        {/* 주사위 개수 조절 */}
        <div className="flex items-center justify-center gap-4 py-3">
          <button
            onClick={removeDice}
            className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-strong text-2xl font-bold transition-colors disabled:opacity-40"
            disabled={values.length <= 1 || phase === "rolling"}
            aria-label="주사위 줄이기"
          >
            -
          </button>
          <span className="text-strong text-xl font-bold min-w-[80px] text-center">
            {values.length}개
          </span>
          <button
            onClick={addDice}
            className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-strong text-2xl font-bold transition-colors disabled:opacity-40"
            disabled={phase === "rolling"}
            aria-label="주사위 늘리기"
          >
            +
          </button>
        </div>

        {/* 트레이 — 물리 벽이 이 요소의 실제 크기와 일치한다.
            배경 없이 페이지 표면을 그대로 쓰고, 경계만 얇게 표시한다. */}
        <div
          ref={trayRef}
          onClick={rollDice}
          className="relative flex-1 overflow-hidden rounded-2xl cursor-pointer ring-1 ring-veil/10"
          style={{
            perspective: `${PERSPECTIVE}px`,
            perspectiveOrigin: "50% 50%",
          }}
          role="button"
          aria-label="주사위 굴리기"
        >
          {/* 그림자 레이어: 3D 스택과 섞이지 않도록 주사위와 분리해 둔다 */}
          {values.map((_, i) => (
            <div
              key={`sh-${i}`}
              ref={(el) => {
                shadowElsRef.current[i] = el;
              }}
              className="absolute top-1/2 left-1/2 rounded-[18px] bg-black pointer-events-none will-change-transform"
              style={{
                width: DIE_PX,
                height: DIE_PX,
                marginLeft: -DIE_PX / 2,
                marginTop: -DIE_PX / 2,
                opacity: 0.5,
                filter: "blur(5px)",
              }}
            />
          ))}

          {values.map((_, i) => (
            <div
              key={`die-${i}`}
              ref={(el) => {
                dieElsRef.current[i] = el;
              }}
              className="absolute top-1/2 left-1/2 pointer-events-none will-change-transform"
              style={{
                width: DIE_PX,
                height: DIE_PX,
                marginLeft: -DIE_PX / 2,
                marginTop: -DIE_PX / 2,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                ref={(el) => {
                  cubeElsRef.current[i] = el;
                }}
                className="relative w-full h-full will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 마주보는 면의 합이 7인 실제 주사위 전개도 */}
                <DiceFace value={1} face="top" />
                <DiceFace value={6} face="bottom" />
                <DiceFace value={2} face="front" />
                <DiceFace value={5} face="back" />
                <DiceFace value={3} face="right" />
                <DiceFace value={4} face="left" />
              </div>
            </div>
          ))}

          {phase === "done" && (
            /* bounceIn 키프레임이 transform 을 덮으므로 중앙 정렬은 바깥 div 가 맡는다 */
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
              {/* 중립 표면 위이므로 text-white 가 아니라 text-strong */}
              <div className="animate-bounce-in text-strong text-4xl font-bold">
                {values.length > 1 && "합계 "}
                {total}
              </div>
            </div>
          )}
        </div>

        {/* 안내 텍스트 */}
        <div className="text-slate-400 text-sm text-center py-3">
          {phase === "rolling"
            ? "굴리는 중…"
            : "화면을 터치하거나 흔들어서 굴리세요"}
        </div>
      </div>
    </GameLayout>
  );
}

/* 주사위 한 면 — 바깥을 향하는 법선 방향으로 배치 */
const FACE_TRANSFORM: Record<string, string> = {
  top: "translateZ(36px)",
  bottom: "rotateX(180deg) translateZ(36px)",
  front: "rotateX(-90deg) translateZ(36px)",
  back: "rotateX(90deg) translateZ(36px)",
  right: "rotateY(90deg) translateZ(36px)",
  left: "rotateY(-90deg) translateZ(36px)",
};

/* 면을 6장의 평면으로 만든 큐브라서 모서리를 둥글게 할 수 없다.
 * border-radius 를 주면 잘려나간 자리마다 큐브 내부가 뚫려서 그 틈으로
 * 뒤쪽(그림자 등)이 검게 비친다. 각을 살리면 6면이 정확히 맞물려 빈틈이 없다.
 * 대신 테두리는 검은 실선(ring) 대신 안쪽 그림자로만 잡아 부드럽게 만든다. */
function DiceFace({ value, face }: { value: number; face: string }) {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-white via-zinc-100 to-zinc-200 shadow-[inset_0_0_0_1px_rgba(63,63,70,0.13),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-9px_14px_-8px_rgba(63,63,70,0.3)]"
      style={{ transform: FACE_TRANSFORM[face], backfaceVisibility: "hidden" }}
    >
      <DiceDots value={value} />
    </div>
  );
}

/* 주사위 눈 */
function DiceDots({ value }: { value: number }) {
  const dot = (key: number, isOne = false) => (
    <div
      key={key}
      className={`w-2.5 h-2.5 rounded-full shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.55)] ${
        isOne ? "bg-red-600" : "bg-zinc-800"
      }`}
    />
  );

  if (value === 1) {
    return (
      <div className="grid place-items-center w-full h-full">{dot(0, true)}</div>
    );
  }

  // 3×3 격자 위 위치로 각 눈 배치
  const cells: Record<number, string[]> = {
    2: ["1/1", "3/3"],
    3: ["1/1", "2/2", "3/3"],
    4: ["1/1", "3/1", "1/3", "3/3"],
    5: ["1/1", "3/1", "2/2", "1/3", "3/3"],
    6: ["1/1", "3/1", "1/2", "3/2", "1/3", "3/3"],
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2.5 place-items-center">
      {(cells[value] ?? cells[6]).map((cell, i) => {
        const [col, row] = cell.split("/");
        return (
          <div key={i} style={{ gridColumn: col, gridRow: row }}>
            {dot(i)}
          </div>
        );
      })}
    </div>
  );
}
