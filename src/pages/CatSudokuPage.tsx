//src/pages/CatSudokuPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Cat, Lightbulb, RotateCcw, Shuffle, X } from "lucide-react";
import GameLayout from "../layouts/GameLayout";
import Confetti from "../components/Confetti";

/* ────────────────────────────────────────────────────────────
   색상 스도쿠 (고양이 찾기)

   규칙
   - 판은 크기 N 만큼의 색 구역으로 나뉘고, 각 색에 고양이는 딱 한 마리.
   - 가로줄·세로줄에도 고양이는 각각 한 마리만.
   - 고양이끼리는 대각선을 포함한 8방향으로 붙을 수 없다.
   → 색 개수 = 행 개수 = 열 개수 = N 이라 고양이는 항상 N 마리.

   조작
   - X 는 전부 이용자가 직접 찍는다(자동 표시 없음).
   - 빈 칸을 한 번 탭 → X, X 를 다시 탭 → 해제(빈 칸).
   - 빈 칸에서 연속으로 두 번 탭 → 고양이. 고양이를 탭하면 지워진다.
   - 고양이를 틀린 칸에 놓으면 기회가 1 줄고, 3번 다 쓰면 판이 초기화된다.
   ──────────────────────────────────────────────────────────── */

type BoardSize = 7 | 8 | 10;

// 0 = 빈칸, 1 = X, 2 = 고양이
type Mark = 0 | 1 | 2;

type Puzzle = {
  size: number;
  /** 칸 인덱스 → 색 구역 번호(0 ~ size-1) */
  region: number[];
  /** solution[r] = 행 r 의 고양이가 있는 열 */
  solution: number[];
};

const SIZE_OPTIONS: BoardSize[] = [7, 8, 10];

const SIZE_LABELS: Record<BoardSize, string> = {
  7: "쉬움",
  8: "보통",
  10: "어려움",
};

// 동적 클래스는 Tailwind 가 스캔하지 못하므로 완성된 클래스명으로 매핑해 둔다.
const GRID_COLS: Record<BoardSize, string> = {
  7: "grid-cols-7",
  8: "grid-cols-8",
  10: "grid-cols-10",
};

// 행도 함께 고정한다. 행 트랙을 auto 로 두면 아이콘이 놓인 줄만 콘텐츠 높이만큼
// 더 커져서 칸이 늘어나 보인다(gap 만 뺀 뒤 1fr 로 균등 분배해야 정사각형이 유지됨).
const GRID_ROWS: Record<BoardSize, string> = {
  7: "grid-rows-[repeat(7,minmax(0,1fr))]",
  8: "grid-rows-[repeat(8,minmax(0,1fr))]",
  10: "grid-rows-[repeat(10,minmax(0,1fr))]",
};

/** 고양이를 잘못 짚을 수 있는 횟수. 다 쓰면 판이 새 문제로 바뀐다. */
const MAX_MISTAKES = 3;

/** 판마다 쓸 수 있는 힌트 횟수 */
const MAX_HINTS = 1;

/** 이 시간 안에 같은 칸을 다시 탭하면 "두 번 탭"으로 본다(ms). */
const DOUBLE_TAP_MS = 400;

/** 틀린 자리를 빨갛게 보여 주는 시간(ms). */
const WRONG_FLASH_MS = 700;

/** 기회를 다 쓴 뒤 새 판으로 넘어가기까지 두는 시간(ms). 무슨 일이 났는지 보여 줄 틈. */
const FAIL_DELAY_MS = 1300;

/** 고양이가 놓이는 순간 짧게 진동. 지원하지 않는 기기(iOS 사파리 등)에서는 무시된다. */
function buzz(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // 사용자 제스처 없이 호출되면 막는 브라우저가 있다 → 무시
  }
}

/** 마지막 탭 기록 (두 번 탭 판정용) */
type TapMemo = { idx: number; at: number; wasEmpty: boolean };

type TapAction = "toggleX" | "clearCat" | "tryCat";

/**
 * 탭 한 번이 어떤 동작인지 결정한다.
 * - 고양이가 있는 칸 → 지우기
 * - 빈 칸에서 시작한 연속 탭(DOUBLE_TAP_MS 이내) → 고양이 놓기 시도
 * - 그 밖 → X 켜기/끄기
 *
 * "빈 칸에서 시작"을 따지는 이유: X 를 지우려고 두 번 누른 걸 고양이 시도로
 * 착각하면 기회가 그냥 날아간다.
 */
function resolveTap(
  current: Mark,
  idx: number,
  now: number,
  last: TapMemo | null
): TapAction {
  if (current === 2) return "clearCat";
  if (
    last !== null &&
    last.idx === idx &&
    last.wasEmpty &&
    now - last.at < DOUBLE_TAP_MS
  ) {
    return "tryCat";
  }
  return "toggleX";
}

// 구역 색. slate 는 표면 토큰이라 테마에 따라 뒤집히므로 장식용으로 쓰지 않는다.
// 아이콘을 검정으로 얹기 때문에 라이트/다크 어느 쪽에서도 그대로 읽힌다.
const REGION_COLORS = [
  "bg-rose-400",
  "bg-orange-400",
  "bg-amber-300",
  "bg-lime-300",
  "bg-emerald-400",
  "bg-teal-300",
  "bg-sky-400",
  "bg-indigo-300",
  "bg-violet-400",
  "bg-fuchsia-300",
];

/* ── 문제 생성 ───────────────────────────────────────────────
   1) 규칙을 만족하는 정답 배치를 랜덤으로 하나 만든다.
   2) 고양이 칸을 씨앗으로 삼아 색 구역을 균등하게 키운다.
   3) 이 상태로는 해가 수십~수백 개라, 경계 칸을 옆 구역으로 옮기는
      국소 탐색으로 해의 개수를 1개까지 줄인다.
   4) 마지막으로 "찍지 않고 논리로만" 풀리는지 검사한다.
   n=10 기준 중간값 0.3초, 최악 1.6초 정도라 중간중간 제어를 넘겨준다.
   ──────────────────────────────────────────────────────────── */

const SOLUTION_CAP = 400; // 해 세기 상한(그 이상은 셀 필요가 없다)
const REFINE_STEPS = 3000; // 한 판당 국소 탐색 횟수
const YIELD_INTERVAL = 250; // 몇 스텝마다 브라우저에 제어를 넘길지

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 행/열 유일 + 8방향 인접 금지를 만족하는 배치. 인접 행끼리 열 차이가 2 이상이면 된다. */
function randomSolution(size: number): number[] | null {
  const cols = new Array<number>(size).fill(-1);
  const used = new Array<boolean>(size).fill(false);

  const go = (row: number): boolean => {
    if (row === size) return true;
    for (const c of shuffled([...Array(size).keys()])) {
      if (used[c]) continue;
      if (row > 0 && Math.abs(c - cols[row - 1]) < 2) continue;
      cols[row] = c;
      used[c] = true;
      if (go(row + 1)) return true;
      used[c] = false;
      cols[row] = -1;
    }
    return false;
  };

  return go(0) ? cols : null;
}

/** 고양이 칸에서 시작해 크기가 비슷하게 자라도록 구역을 넓힌다. */
function growRegions(size: number, solution: number[]): number[] | null {
  const total = size * size;
  const region = new Array<number>(total).fill(-1);
  const frontier: number[][] = [];
  const grown = new Array<number>(size).fill(1);

  for (let r = 0; r < size; r += 1) {
    const idx = r * size + solution[r];
    region[idx] = r;
    frontier.push([idx]);
  }

  let assigned = size;
  while (assigned < total) {
    // 가장 작은 구역부터 키운다(동률이면 랜덤)
    let candidates: number[] = [];
    let smallest = Infinity;
    for (let g = 0; g < size; g += 1) {
      if (!frontier[g].length) continue;
      if (grown[g] < smallest) {
        smallest = grown[g];
        candidates = [g];
      } else if (grown[g] === smallest) {
        candidates.push(g);
      }
    }
    if (!candidates.length) break;

    const g = candidates[Math.floor(Math.random() * candidates.length)];
    const edge = frontier[g];
    let grew = false;
    while (edge.length && !grew) {
      const pick = Math.floor(Math.random() * edge.length);
      const idx = edge[pick];
      const r = Math.floor(idx / size);
      const c = idx % size;
      for (const [nr, nc] of shuffled([
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ])) {
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const ni = nr * size + nc;
        if (region[ni] !== -1) continue;
        region[ni] = g;
        grown[g] += 1;
        assigned += 1;
        edge.push(ni);
        grew = true;
        break;
      }
      if (!grew) edge.splice(pick, 1); // 더 자랄 곳이 없는 칸은 경계에서 빼준다
    }
    if (!grew) frontier[g] = [];
  }

  return assigned < total ? null : region;
}

/** 구역마다 한 칸씩 고르는 배치가 몇 가지인지 센다(limit 에서 조기 종료). */
function countSolutions(size: number, region: number[], limit: number): number {
  const total = size * size;
  const cells: number[][] = Array.from({ length: size }, () => []);
  for (let i = 0; i < total; i += 1) cells[region[i]].push(i);
  // 후보가 적은 구역부터 → 가지치기가 빨라진다
  const order = [...Array(size).keys()].sort(
    (a, b) => cells[a].length - cells[b].length
  );

  const rowUsed = new Array<boolean>(size).fill(false);
  const colUsed = new Array<boolean>(size).fill(false);
  const rows: number[] = [];
  const cols: number[] = [];
  let count = 0;

  const go = (k: number) => {
    if (count >= limit) return;
    if (k === size) {
      count += 1;
      return;
    }
    for (const idx of cells[order[k]]) {
      const r = Math.floor(idx / size);
      const c = idx % size;
      if (rowUsed[r] || colUsed[c]) continue;
      let ok = true;
      for (let i = 0; i < rows.length; i += 1) {
        if (Math.abs(rows[i] - r) <= 1 && Math.abs(cols[i] - c) <= 1) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      rowUsed[r] = true;
      colUsed[c] = true;
      rows.push(r);
      cols.push(c);
      go(k + 1);
      rows.pop();
      cols.pop();
      rowUsed[r] = false;
      colUsed[c] = false;
      if (count >= limit) return;
    }
  };

  go(0);
  return count;
}

/** removed 칸을 뺀 뒤에도 구역 g 가 한 덩어리로 남는지 (구역은 항상 연결되어 있어야 한다) */
function staysConnected(
  size: number,
  region: number[],
  g: number,
  seed: number,
  removed: number
): boolean {
  const total = size * size;
  let expected = 0;
  for (let i = 0; i < total; i += 1) {
    if (region[i] === g && i !== removed) expected += 1;
  }

  const stack = [seed];
  const seen = new Set<number>([seed]);
  while (stack.length) {
    const idx = stack.pop() as number;
    const r = Math.floor(idx / size);
    const c = idx % size;
    for (const [nr, nc] of [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ]) {
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const ni = nr * size + nc;
      if (ni === removed || region[ni] !== g || seen.has(ni)) continue;
      seen.add(ni);
      stack.push(ni);
    }
  }
  return seen.size === expected;
}

/**
 * 사람이 쓰는 추론만으로 끝까지 풀리는지 검사한다.
 * 해가 하나뿐이어도 찍어야만 진행되는 판은 재미가 없으므로 걸러낸다.
 */
function solvableByLogic(size: number, region: number[]): boolean {
  const total = size * size;
  const cand = new Array<boolean>(total).fill(true);
  const isCat = new Array<boolean>(total).fill(false);
  const rowDone = new Array<boolean>(size).fill(false);
  const colDone = new Array<boolean>(size).fill(false);
  const regionDone = new Array<boolean>(size).fill(false);
  let placed = 0;

  const place = (idx: number) => {
    const r = Math.floor(idx / size);
    const c = idx % size;
    const g = region[idx];
    isCat[idx] = true;
    placed += 1;
    rowDone[r] = true;
    colDone[c] = true;
    regionDone[g] = true;
    for (let i = 0; i < total; i += 1) {
      if (!cand[i] || i === idx) continue;
      const ir = Math.floor(i / size);
      const ic = i % size;
      if (
        ir === r ||
        ic === c ||
        region[i] === g ||
        (Math.abs(ir - r) <= 1 && Math.abs(ic - c) <= 1)
      ) {
        cand[i] = false;
      }
    }
  };

  const collect = (pred: (i: number) => boolean): number[] => {
    const out: number[] = [];
    for (let i = 0; i < total; i += 1) {
      if (cand[i] && !isCat[i] && pred(i)) out.push(i);
    }
    return out;
  };
  const hasCand = (pred: (i: number) => boolean): boolean => {
    for (let i = 0; i < total; i += 1) {
      if (cand[i] && !isCat[i] && pred(i)) return true;
    }
    return false;
  };

  let guard = 0;
  while (placed < size && guard < 400) {
    guard += 1;
    let changed = false;

    // 규칙 1 — 색/행/열에 후보가 한 칸뿐이면 거기가 고양이
    for (let g = 0; g < size && !changed; g += 1) {
      if (regionDone[g]) continue;
      const cs = collect((i) => region[i] === g);
      if (!cs.length) return false;
      if (cs.length === 1) {
        place(cs[0]);
        changed = true;
      }
    }
    if (changed) continue;

    for (let r = 0; r < size && !changed; r += 1) {
      if (rowDone[r]) continue;
      const cs = collect((i) => Math.floor(i / size) === r);
      if (!cs.length) return false;
      if (cs.length === 1) {
        place(cs[0]);
        changed = true;
      }
    }
    if (changed) continue;

    for (let c = 0; c < size && !changed; c += 1) {
      if (colDone[c]) continue;
      const cs = collect((i) => i % size === c);
      if (!cs.length) return false;
      if (cs.length === 1) {
        place(cs[0]);
        changed = true;
      }
    }
    if (changed) continue;

    // 규칙 2 — 한 색의 후보가 모두 같은 행(열)에 있으면 그 행(열)의 다른 색은 탈락
    for (let g = 0; g < size; g += 1) {
      if (regionDone[g]) continue;
      const cs = collect((i) => region[i] === g);
      const rows = new Set(cs.map((i) => Math.floor(i / size)));
      const cols = new Set(cs.map((i) => i % size));
      if (rows.size === 1) {
        const r = [...rows][0];
        for (let c = 0; c < size; c += 1) {
          const i = r * size + c;
          if (cand[i] && region[i] !== g) {
            cand[i] = false;
            changed = true;
          }
        }
      }
      if (cols.size === 1) {
        const c = [...cols][0];
        for (let r = 0; r < size; r += 1) {
          const i = r * size + c;
          if (cand[i] && region[i] !== g) {
            cand[i] = false;
            changed = true;
          }
        }
      }
    }
    if (changed) continue;

    // 규칙 3 — 한 행(열)의 후보가 모두 같은 색이면 그 색의 다른 칸은 탈락
    for (let r = 0; r < size; r += 1) {
      if (rowDone[r]) continue;
      const gs = new Set(
        collect((i) => Math.floor(i / size) === r).map((i) => region[i])
      );
      if (gs.size === 1) {
        const g = [...gs][0];
        for (let i = 0; i < total; i += 1) {
          if (cand[i] && region[i] === g && Math.floor(i / size) !== r) {
            cand[i] = false;
            changed = true;
          }
        }
      }
    }
    for (let c = 0; c < size; c += 1) {
      if (colDone[c]) continue;
      const gs = new Set(collect((i) => i % size === c).map((i) => region[i]));
      if (gs.size === 1) {
        const g = [...gs][0];
        for (let i = 0; i < total; i += 1) {
          if (cand[i] && region[i] === g && i % size !== c) {
            cand[i] = false;
            changed = true;
          }
        }
      }
    }
    if (changed) continue;

    // 규칙 4 — "여기에 두면 어떤 색/행/열이 갈 곳을 잃는다" 한 수 앞보기
    for (let i = 0; i < total && !changed; i += 1) {
      if (!cand[i] || isCat[i]) continue;
      const r = Math.floor(i / size);
      const c = i % size;
      const g = region[i];
      const killed = new Array<boolean>(total).fill(false);
      for (let j = 0; j < total; j += 1) {
        if (!cand[j] || j === i) continue;
        const jr = Math.floor(j / size);
        const jc = j % size;
        if (
          jr === r ||
          jc === c ||
          region[j] === g ||
          (Math.abs(jr - r) <= 1 && Math.abs(jc - c) <= 1)
        ) {
          killed[j] = true;
        }
      }

      let broken = false;
      for (let g2 = 0; g2 < size && !broken; g2 += 1) {
        if (regionDone[g2] || g2 === g) continue;
        if (!hasCand((j) => region[j] === g2 && !killed[j])) broken = true;
      }
      for (let r2 = 0; r2 < size && !broken; r2 += 1) {
        if (rowDone[r2] || r2 === r) continue;
        if (!hasCand((j) => Math.floor(j / size) === r2 && !killed[j])) {
          broken = true;
        }
      }
      for (let c2 = 0; c2 < size && !broken; c2 += 1) {
        if (colDone[c2] || c2 === c) continue;
        if (!hasCand((j) => j % size === c2 && !killed[j])) broken = true;
      }

      if (broken) {
        cand[i] = false;
        changed = true;
      }
    }

    if (!changed) return false; // 더 이상 논리로 못 나감 → 찍어야 하는 판
  }

  return placed === size;
}

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

async function generatePuzzle(
  size: number,
  isCancelled: () => boolean
): Promise<Puzzle | null> {
  while (!isCancelled()) {
    const solution = randomSolution(size);
    if (!solution) return null;
    const region = growRegions(size, solution);
    if (!region) continue;

    const catCells = solution.map((c, r) => r * size + c);
    const grown = new Array<number>(size).fill(0);
    region.forEach((g) => {
      grown[g] += 1;
    });
    let score = countSolutions(size, region, SOLUTION_CAP);

    for (let step = 0; step < REFINE_STEPS; step += 1) {
      if (score === 1 && solvableByLogic(size, region)) {
        return { size, region, solution };
      }

      // 경계 칸 하나를 이웃 구역으로 넘겨 보고, 해가 줄거나 유지되면 채택
      const idx = Math.floor(Math.random() * size * size);
      const from = region[idx];
      if (catCells[from] === idx || grown[from] <= 1) continue;

      const r = Math.floor(idx / size);
      const c = idx % size;
      const options: number[] = [];
      for (const [nr, nc] of [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ]) {
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const g = region[nr * size + nc];
        if (g !== from && !options.includes(g)) options.push(g);
      }
      if (!options.length) continue;
      if (!staysConnected(size, region, from, catCells[from], idx)) continue;

      const to = options[Math.floor(Math.random() * options.length)];
      region[idx] = to;
      const next = countSolutions(size, region, SOLUTION_CAP);
      if (next <= score) {
        score = next;
        grown[from] -= 1;
        grown[to] += 1;
      } else {
        region[idx] = from;
      }

      if (step % YIELD_INTERVAL === YIELD_INTERVAL - 1) {
        await yieldToBrowser();
        if (isCancelled()) return null;
      }
    }

    await yieldToBrowser(); // 이 판은 실패 → 처음부터 다시
  }
  return null;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CatSudokuPage() {
  const [size, setSize] = useState<BoardSize | null>(null);
  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<{ idx: number; seq: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [hints, setHints] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [confetti, setConfetti] = useState(false);

  // 두 번 탭 판정용. 빈 칸을 누른 뒤 DOUBLE_TAP_MS 안에 같은 칸을 또 누르면 고양이 시도.
  const lastTapRef = useRef<TapMemo | null>(null);
  // 같은 칸을 연달아 틀려도 빨간 표시가 다시 뜨도록, 매번 새 객체를 만들기 위한 카운터
  const wrongSeqRef = useRef(0);

  // 판 생성. 생성 중에 난이도를 바꾸거나 새 문제를 누르면 이전 작업은 버린다.
  useEffect(() => {
    if (size === null) return;
    let cancelled = false;

    setPuzzle(null);
    setMarks([]);
    setMistakes(0);
    setWrong(null);
    setFailed(false);
    setHints(0);
    setElapsed(0);
    setConfetti(false);
    lastTapRef.current = null;

    (async () => {
      const next = await generatePuzzle(size, () => cancelled);
      if (cancelled || !next) return;
      setPuzzle(next);
      setMarks(new Array<Mark>(size * size).fill(0));
    })();

    return () => {
      cancelled = true;
    };
  }, [size, round]);

  // 판에 올라간 고양이는 전부 정답 자리다(틀린 시도는 즉시 지워지므로).
  const catCount = useMemo(
    () => marks.reduce<number>((acc, m) => (m === 2 ? acc + 1 : acc), 0),
    [marks]
  );

  const won = puzzle !== null && catCount === puzzle.size;

  // 타이머 (클리어하면 멈춘다)
  useEffect(() => {
    if (!puzzle || won) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [puzzle, won]);

  useEffect(() => {
    if (won) setConfetti(true);
  }, [won]);

  // 틀린 자리 빨간 표시는 잠깐만
  useEffect(() => {
    if (!wrong) return;
    const id = window.setTimeout(() => setWrong(null), WRONG_FLASH_MS);
    return () => window.clearTimeout(id);
  }, [wrong]);

  // 기회를 다 쓰면 잠깐 보여 준 뒤 아예 새 판으로 넘어간다.
  // (round 가 바뀌면 위 생성 useEffect 가 돌면서 failed 도 함께 풀린다)
  useEffect(() => {
    if (!failed) return;
    const id = window.setTimeout(() => setRound((v) => v + 1), FAIL_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [failed]);

  // "다시 풀기" — 같은 판을 처음부터. 힌트는 판 기준으로 1번이므로 여기서 복구하지 않는다
  // (되돌려 주면 다시 풀기를 눌러 가며 정답을 계속 열어볼 수 있다).
  const resetBoard = (total: number) => {
    setMarks(new Array<Mark>(total).fill(0));
    setMistakes(0);
    setElapsed(0);
    setConfetti(false);
    lastTapRef.current = null;
  };

  const tryPlaceCat = (idx: number) => {
    if (!puzzle) return;
    const n = puzzle.size;
    const isCorrect = puzzle.solution[Math.floor(idx / n)] === idx % n;

    if (isCorrect) {
      buzz(35); // 고양이로 바뀌는 순간 짧게
      setMarks((prev) => {
        const next = [...prev];
        next[idx] = 2;
        return next;
      });
      return;
    }

    // 틀렸으면 그 칸은 비워 두고 기회를 하나 쓴다
    setMarks((prev) => {
      const next = [...prev];
      next[idx] = 0;
      return next;
    });
    wrongSeqRef.current += 1;
    setWrong({ idx, seq: wrongSeqRef.current });

    const used = mistakes + 1;
    setMistakes(used);
    if (used >= MAX_MISTAKES) setFailed(true); // 잠시 뒤 새 판으로 교체된다
  };

  const handleCell = (idx: number) => {
    if (!puzzle || won || failed) return;
    const current = marks[idx] ?? 0;
    const now = performance.now();
    const action = resolveTap(current, idx, now, lastTapRef.current);

    // 고양이를 누르면 지운다
    if (action === "clearCat") {
      lastTapRef.current = null;
      setMarks((prev) => {
        const next = [...prev];
        next[idx] = 0;
        return next;
      });
      return;
    }

    if (action === "tryCat") {
      lastTapRef.current = null;
      tryPlaceCat(idx);
      return;
    }

    // 한 번 탭 = X 켜기/끄기
    lastTapRef.current = { idx, at: now, wasEmpty: current === 0 };
    setMarks((prev) => {
      const next = [...prev];
      next[idx] = current === 1 ? 0 : 1;
      return next;
    });
  };

  const handleHint = () => {
    if (!puzzle || won || failed || hints >= MAX_HINTS) return;
    const n = puzzle.size;
    const remaining = puzzle.solution
      .map((c, r) => r * n + c)
      .filter((i) => marks[i] !== 2);
    if (!remaining.length) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    buzz(35);
    setMarks((prev) => {
      const next = [...prev];
      next[pick] = 2;
      return next;
    });
    setHints((h) => h + 1);
  };

  // 1) 난이도 선택 화면
  if (size === null) {
    return (
      <GameLayout title="색상 스도쿠">
        <div className="flex flex-col gap-4 text-sm text-slate-100">
          <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
            <h2 className="mb-1 text-xs font-semibold text-slate-200">
              판 크기 선택
            </h2>
            <p className="mb-3 text-[11px] text-slate-300">
              고르면 그때마다 새로운 판이 만들어집니다. 모든 판은 답이 하나뿐이고
              찍지 않고 논리로만 풀 수 있습니다.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSize(n)}
                  className="rounded-md bg-slate-900 px-3 py-3 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
                >
                  <span className="block text-sm">{SIZE_LABELS[n]}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-400">
                    {n}×{n}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-[11px] leading-relaxed text-slate-300">
            <h3 className="mb-1 text-xs font-semibold text-slate-200">규칙</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>같은 색 안에 고양이는 딱 한 마리입니다.</li>
              <li>가로줄과 세로줄에도 고양이는 한 마리씩만 있습니다.</li>
              <li>
                고양이끼리는 대각선을 포함해 붙어 있을 수 없습니다(주변 8칸).
              </li>
              <li>모든 색에서 고양이를 찾으면 클리어입니다.</li>
            </ul>
            <h3 className="mb-1 mt-3 text-xs font-semibold text-slate-200">
              조작
            </h3>
            <ul className="list-inside list-disc space-y-1">
              <li>빈 칸을 한 번 탭하면 X, X 를 다시 탭하면 지워집니다.</li>
              <li>빈 칸을 연속으로 두 번 탭하면 고양이를 놓습니다.</li>
              <li>
                고양이가 없는 자리에 놓으면 기회가 줄고,{" "}
                <span className="font-semibold text-rose-400">
                  {MAX_MISTAKES}번
                </span>{" "}
                다 쓰면 아예 새 문제로 바뀝니다.
              </li>
              <li>힌트는 판마다 {MAX_HINTS}번만 쓸 수 있습니다.</li>
            </ul>
          </section>
        </div>
      </GameLayout>
    );
  }

  // 2) 판 생성 중
  if (!puzzle) {
    return (
      <GameLayout title="색상 스도쿠">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-300">
          <Cat size={40} className="animate-bounce text-slate-400" />
          <p>
            {size}×{size} 판을 만들고 있어요…
          </p>
          <p className="text-[11px] text-slate-400">
            답이 하나뿐인지 검사하는 중입니다.
          </p>
        </div>
      </GameLayout>
    );
  }

  const n = size; // 위 분기에서 null 이 걸러졌고 puzzle.size 와 항상 같다
  const chancesLeft = MAX_MISTAKES - mistakes;

  // 3) 게임 화면
  return (
    <GameLayout title="색상 스도쿠">
      <div className="flex flex-col gap-3 text-sm text-slate-100">
        {/* 진행 상황 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-[11px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-300">
                {SIZE_LABELS[n]} · {n}×{n}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] text-slate-300">
                <span>
                  찾은 고양이{" "}
                  <span className="font-semibold">
                    {catCount}/{n}
                  </span>
                </span>
                <span className="text-slate-500">·</span>
                <span>
                  시간{" "}
                  <span className="font-semibold">{formatTime(elapsed)}</span>
                </span>
                <span className="text-slate-500">·</span>
                <span className="flex items-center gap-1">
                  기회
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: MAX_MISTAKES }, (_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < chancesLeft ? "bg-rose-400" : "bg-slate-600"
                        }`}
                      />
                    ))}
                  </span>
                </span>
                {hints > 0 ? (
                  <>
                    <span className="text-slate-500">·</span>
                    <span>힌트 {hints}회</span>
                  </>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSize(null)}
              className="shrink-0 rounded-md bg-slate-700 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-600"
            >
              난이도 변경
            </button>
          </div>

          {won ? (
            <p className="mt-2 text-emerald-400">
              🎉 클리어! {formatTime(elapsed)} 만에 고양이 {n}마리를 모두
              찾았어요{hints > 0 ? ` (힌트 ${hints}회)` : ""}.
            </p>
          ) : failed ? (
            <p className="mt-2 text-rose-400">
              기회를 모두 썼어요. 새 문제로 바꿉니다…
            </p>
          ) : wrong ? (
            <p className="mt-2 text-rose-400">
              여긴 고양이가 없어요. 남은 기회 {chancesLeft}번.
            </p>
          ) : (
            <p className="mt-2 text-slate-300">
              색마다 고양이 한 마리. 같은 줄·열·대각선 이웃은 안 됩니다.
            </p>
          )}
        </section>

        {/* 판 — 테두리 없이 칸끼리 아주 좁은 간격만 두어 색으로 구역을 구분한다 */}
        <section className="flex justify-center">
          <div
            className={`grid aspect-square w-full gap-[2px] ${GRID_COLS[n]} ${GRID_ROWS[n]}`}
          >
            {puzzle.region.map((g, idx) => {
              const r = Math.floor(idx / n);
              const c = idx % n;
              const mark = marks[idx] ?? 0;
              const isWrong = wrong !== null && wrong.idx === idx;
              const cellClasses = [
                REGION_COLORS[g],
                isWrong ? "ring-2 ring-inset ring-red-700" : "",
              ].join(" ");

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCell(idx)}
                  aria-label={`${r + 1}행 ${c + 1}열`}
                  className={`flex h-full w-full min-h-0 min-w-0 touch-manipulation select-none items-center justify-center overflow-hidden rounded-[2px] p-0 transition active:brightness-90 ${cellClasses}`}
                >
                  {isWrong ? (
                    <Cat
                      strokeWidth={2.6}
                      className="h-[72%] w-[72%] animate-pulse text-red-700"
                    />
                  ) : mark === 2 ? (
                    <Cat
                      strokeWidth={2.2}
                      className="h-[72%] w-[72%] text-black"
                    />
                  ) : mark === 1 ? (
                    <X strokeWidth={3} className="h-[62%] w-[62%] text-black/70" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {/* 조작 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => resetBoard(n * n)}
              disabled={failed}
              className="flex items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-2 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 disabled:opacity-40"
            >
              <RotateCcw size={13} /> 다시 풀기
            </button>
            <button
              type="button"
              onClick={handleHint}
              disabled={won || failed || hints >= MAX_HINTS}
              className="flex items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-2 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 disabled:opacity-40"
            >
              <Lightbulb size={13} /> 힌트 {MAX_HINTS - hints}
            </button>
            <button
              type="button"
              onClick={() => setRound((v) => v + 1)}
              className="flex items-center justify-center gap-1 rounded-md bg-slate-900 px-2 py-2 text-[11px] font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
            >
              <Shuffle size={13} /> 새 문제
            </button>
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            한 번 탭 = X 표시/해제 · 빈 칸 연속 두 번 탭 = 고양이 · 고양이 탭 =
            지우기
            <br />
            X 는 자동으로 찍히지 않습니다. 힌트는 판마다 {MAX_HINTS}번, 고양이를
            틀릴 기회는 {MAX_MISTAKES}번(다 쓰면 새 문제로 바뀝니다).
          </p>
        </section>
      </div>

      <Confetti
        run={confetti}
        duration={1200}
        onEnd={() => setConfetti(false)}
      />
    </GameLayout>
  );
}
