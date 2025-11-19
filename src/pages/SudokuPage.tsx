import { useEffect, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Cell = {
  row: number;
  col: number;
};

type DifficultyKey =
  | "beginner"
  | "easy"
  | "normal"
  | "advanced"
  | "expert"
  | "extreme";

const DIFFICULTY_LABELS: Record<DifficultyKey, string> = {
  beginner: "초보",
  easy: "쉬움",
  normal: "보통",
  advanced: "숙련",
  expert: "고수",
  extreme: "극한",
};

// 난이도별 남겨둘 숫자 개수(대략적인 난이도 감만 조절)
const CLUES_BY_DIFF: Record<DifficultyKey, number> = {
  beginner: 42,
  easy: 38,
  normal: 34,
  advanced: 30,
  expert: 26,
  extreme: 22,
};

// 기준 정답 1개 (여기서 랜덤 변형해서 새로운 정답을 만듦)
const BASE_SOLUTION: number[][] = [
  [4, 3, 5, 2, 6, 9, 7, 8, 1],
  [6, 8, 2, 5, 7, 1, 4, 9, 3],
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9],
];

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 숫자(1~9) 매핑 섞기
function permuteNumbers(grid: number[][]): number[][] {
  const mapping = new Map<number, number>();
  const digits = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let d = 1; d <= 9; d++) {
    mapping.set(d, digits[d - 1]);
  }
  const out = cloneGrid(grid);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = out[r][c];
      out[r][c] = mapping.get(v)!;
    }
  }
  return out;
}

function swapRows(grid: number[][], r1: number, r2: number): void {
  const tmp = grid[r1];
  grid[r1] = grid[r2];
  grid[r2] = tmp;
}

function swapCols(grid: number[][], c1: number, c2: number): void {
  for (let r = 0; r < 9; r++) {
    const tmp = grid[r][c1];
    grid[r][c1] = grid[r][c2];
    grid[r][c2] = tmp;
  }
}

// 같은 밴드(3행 묶음) 내에서 임의의 두 행을 교환
function randomRowSwapInBand(grid: number[][]) {
  const band = Math.floor(Math.random() * 3); // 0,1,2
  const base = band * 3;
  const rows = shuffleArray([0, 1, 2]);
  swapRows(grid, base + rows[0], base + rows[1]);
}

// 같은 스택(3열 묶음) 내에서 임의의 두 열을 교환
function randomColSwapInStack(grid: number[][]) {
  const stack = Math.floor(Math.random() * 3);
  const base = stack * 3;
  const cols = shuffleArray([0, 1, 2]);
  swapCols(grid, base + cols[0], base + cols[1]);
}

// 밴드(3행 묶음)끼리 교환
function randomRowBandSwap(grid: number[][]) {
  const bands = shuffleArray([0, 1, 2]);
  const b1 = bands[0];
  const b2 = bands[1];
  for (let i = 0; i < 3; i++) {
    swapRows(grid, b1 * 3 + i, b2 * 3 + i);
  }
}

// 스택(3열 묶음)끼리 교환
function randomColStackSwap(grid: number[][]) {
  const stacks = shuffleArray([0, 1, 2]);
  const s1 = stacks[0];
  const s2 = stacks[1];
  for (let i = 0; i < 3; i++) {
    swapCols(grid, s1 * 3 + i, s2 * 3 + i);
  }
}

// 기준 해답을 여러 번 랜덤 변형해서 새로운 해답 생성
function generateRandomSolution(): number[][] {
  let grid = cloneGrid(BASE_SOLUTION);
  grid = permuteNumbers(grid);

  const rowSwaps = 6;
  const colSwaps = 6;
  const bandSwaps = 2;
  const stackSwaps = 2;

  for (let i = 0; i < rowSwaps; i++) randomRowSwapInBand(grid);
  for (let i = 0; i < colSwaps; i++) randomColSwapInStack(grid);
  for (let i = 0; i < bandSwaps; i++) randomRowBandSwap(grid);
  for (let i = 0; i < stackSwaps; i++) randomColStackSwap(grid);

  return grid;
}

// 난이도별 퍼즐 생성 (유일해 보장은 안 하지만 캐주얼용으로는 충분)
function generateSudoku(diff: DifficultyKey): {
  puzzle: number[][];
  solution: number[][];
} {
  const solution = generateRandomSolution();
  const puzzle = cloneGrid(solution);

  const targetClues = CLUES_BY_DIFF[diff];
  const indices = shuffleArray(Array.from({ length: 81 }, (_, i) => i));
  let filled = 81;

  for (const idx of indices) {
    if (filled <= targetClues) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      filled--;
    }
  }

  return { puzzle, solution };
}

// 현재 상태에서 규칙 위반 여부 체크
function getInvalidMap(board: number[][]): boolean[][] {
  const invalid: boolean[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(false)
  );

  // 행
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (!v) continue;
      const arr = seen.get(v) ?? [];
      arr.push(c);
      seen.set(v, arr);
    }
    for (const [, cols] of seen) {
      if (cols.length > 1) {
        cols.forEach((c) => (invalid[r][c] = true));
      }
    }
  }

  // 열
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const v = board[r][c];
      if (!v) continue;
      const arr = seen.get(v) ?? [];
      arr.push(r);
      seen.set(v, arr);
    }
    for (const [, rows] of seen) {
      if (rows.length > 1) {
        rows.forEach((r) => (invalid[r][c] = true));
      }
    }
  }

  // 3x3 박스
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Map<number, Cell[]>();
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          const v = board[r][c];
          if (!v) continue;
          const arr = seen.get(v) ?? [];
          arr.push({ row: r, col: c });
          seen.set(v, arr);
        }
      }
      for (const [, cells] of seen) {
        if (cells.length > 1) {
          cells.forEach(({ row, col }) => {
            invalid[row][col] = true;
          });
        }
      }
    }
  }

  return invalid;
}

function isBoardComplete(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

export default function SudokuPage() {
  const [difficulty, setDifficulty] = useState<DifficultyKey | null>(null);
  const [basePuzzle, setBasePuzzle] = useState<number[][] | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [board, setBoard] = useState<number[][] | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [invalidMap, setInvalidMap] = useState<boolean[][]>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(false))
  );
  const [isCorrectSolution, setIsCorrectSolution] = useState<boolean | null>(
    null
  );

  // 🔥 숫자 변경(기존 값 있는 칸 수정/삭제) 횟수
  const [changeCount, setChangeCount] = useState(0);
  const MAX_CHANGES = 3;

  const isReady = difficulty !== null && basePuzzle && solution && board;

  const isCellFixed = (row: number, col: number): boolean => {
    if (!basePuzzle) return false;
    return basePuzzle[row][col] !== 0;
  };

  const startNewGame = (diff: DifficultyKey) => {
    const { puzzle, solution } = generateSudoku(diff);
    setDifficulty(diff);
    setBasePuzzle(puzzle);
    setSolution(solution);
    setBoard(cloneGrid(puzzle));
    setSelected(null);
    setInvalidMap(getInvalidMap(puzzle));
    setIsCorrectSolution(null);
    setChangeCount(0); // 변경 기회 초기화
  };

  const failAndRestartIfNeeded = () => {
    if (!difficulty) return;
    alert("입력한 숫자를 변경할 수 있는 기회(3회)를 모두 사용했습니다.\n새로운 판으로 다시 시작합니다.");
    startNewGame(difficulty);
  };

  // 키보드 입력
  useEffect(() => {
    if (!isReady || !board || !basePuzzle) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected) return;
      const { row, col } = selected;
      if (isCellFixed(row, col)) return;

      // 현재 값
      const current = board[row][col];

      // 숫자 입력
      if (e.key >= "1" && e.key <= "9") {
        const num = Number(e.key);
        if (current === num) return;

        const isChange = current !== 0; // 기존 숫자에서 바꾸는 경우만 카운트
        if (isChange) {
          if (changeCount >= MAX_CHANGES) {
            failAndRestartIfNeeded();
            return;
          }
          setChangeCount((prev) => prev + 1);
        }

        setBoard((prev) => {
          if (!prev) return prev;
          const next = cloneGrid(prev);
          next[row][col] = num;
          return next;
        });
      }
      // 삭제
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        if (current === 0) return;

        const isChange = current !== 0; // 숫자 지우는 것도 변경으로 취급
        if (isChange) {
          if (changeCount >= MAX_CHANGES) {
            failAndRestartIfNeeded();
            return;
          }
          setChangeCount((prev) => prev + 1);
        }

        setBoard((prev) => {
          if (!prev) return prev;
          const next = cloneGrid(prev);
          next[row][col] = 0;
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, isReady, board, basePuzzle, changeCount, difficulty]);

  // 보드 변경 시마다 규칙 위반 / 클리어 상태 체크
  useEffect(() => {
    if (!board || !solution) return;

    const invalid = getInvalidMap(board);
    setInvalidMap(invalid);

    if (isBoardComplete(board)) {
      let correct = true;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] !== solution[r][c]) {
            correct = false;
            break;
          }
        }
        if (!correct) break;
      }
      setIsCorrectSolution(correct);
    } else {
      setIsCorrectSolution(null);
    }
  }, [board, solution]);

  const handleCellClick = (row: number, col: number) => {
    if (!board) return;
    setSelected({ row, col });
  };

  const handleNumberClick = (num: number) => {
    if (!selected || !board) return;
    const { row, col } = selected;
    if (isCellFixed(row, col)) return;

    const current = board[row][col];
    if (current === num) return;

    const isChange = current !== 0;
    if (isChange) {
      if (changeCount >= MAX_CHANGES) {
        failAndRestartIfNeeded();
        return;
      }
      setChangeCount((prev) => prev + 1);
    }

    setBoard((prev) => {
      if (!prev) return prev;
      const next = cloneGrid(prev);
      next[row][col] = num;
      return next;
    });
  };

  const handleErase = () => {
    if (!selected || !board) return;
    const { row, col } = selected;
    if (isCellFixed(row, col)) return;

    const current = board[row][col];
    if (current === 0) return;

    const isChange = current !== 0;
    if (isChange) {
      if (changeCount >= MAX_CHANGES) {
        failAndRestartIfNeeded();
        return;
      }
      setChangeCount((prev) => prev + 1);
    }

    setBoard((prev) => {
      if (!prev) return prev;
      const next = cloneGrid(prev);
      next[row][col] = 0;
      return next;
    });
  };

  const handleReset = () => {
    if (!basePuzzle) return;
    const newPuzzle = cloneGrid(basePuzzle);
    setBoard(newPuzzle);
    setSelected(null);
    setInvalidMap(getInvalidMap(newPuzzle));
    setIsCorrectSolution(null);
    setChangeCount(0); // 현재 판 다시 시작 → 변경 기회 초기화
  };

  const handleChangeDifficulty = () => {
    setDifficulty(null);
    setBasePuzzle(null);
    setSolution(null);
    setBoard(null);
    setSelected(null);
    setInvalidMap(Array.from({ length: 9 }, () => Array(9).fill(false)));
    setIsCorrectSolution(null);
    setChangeCount(0);
  };

  // 1) 난이도 선택 화면
  if (!isReady) {
    return (
      <GameLayout title="스도쿠">
        <div className="flex flex-col gap-4 text-slate-100 text-sm">
          <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
            <h2 className="mb-1 text-xs font-semibold text-slate-200">
              난이도 선택
            </h2>
            <p className="mb-2 text-[11px] text-slate-300">
              플레이할 난이도를 선택하면 무작위 스도쿠 판이 생성됩니다.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  "beginner",
                  "easy",
                  "normal",
                  "advanced",
                  "expert",
                  "extreme",
                ] as DifficultyKey[]
              ).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => startNewGame(diff)}
                  className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-600"
                >
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-[11px] text-slate-300 leading-relaxed">
            <p>
              9×9 스도쿠 보드에서 가로줄, 세로줄, 3×3 박스마다 1~9가 한 번씩만
              들어가도록 숫자를 채워 넣으세요.
            </p>
          </section>
        </div>
      </GameLayout>
    );
  }

  // 2) 실제 스도쿠 화면
  return (
    <GameLayout title="스도쿠">
      <div className="flex flex-col gap-4 text-slate-100 text-sm">
        {/* 상단: 난이도 / 상태 메시지 / 난이도 변경 버튼 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-[11px]">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-300">
                난이도: {difficulty ? DIFFICULTY_LABELS[difficulty] : "-"}
              </div>
              <div className="mt-1 text-[10px] text-slate-300">
                남은 숫자 변경 기회:{" "}
                <span className="font-semibold">
                  {Math.max(0, MAX_CHANGES - changeCount)}회
                </span>
                {" / "}
                총 {MAX_CHANGES}회
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangeDifficulty}
              className="rounded-md bg-slate-700 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-600"
            >
              난이도 다시 선택
            </button>
          </div>

          {isCorrectSolution === null && (
            <p className="text-slate-300">
              스도쿠 규칙에 맞게 숫자를 채워 넣어 보세요.
            </p>
          )}
          {isCorrectSolution === false && (
            <p className="text-rose-400">
              모든 칸이 채워졌지만 정답이 아닙니다. 빨간 칸을 중심으로 다시
              확인해 보세요.
            </p>
          )}
          {isCorrectSolution === true && (
            <p className="text-emerald-400">
              🎉 정답입니다! 스도쿠를 모두 완성했어요.
            </p>
          )}
        </section>

        {/* 스도쿠 보드 (정사각형, 양옆 꽉 차게) */}
        <section className="flex justify-center">
          <div className="w-full max-w-sm">
            <div className="aspect-square w-full rounded-lg bg-slate-900 shadow-lg">
              <div className="grid h-full w-full grid-cols-9">
                {board!.map((row, r) =>
                  row.map((value, c) => {
                    const fixed = isCellFixed(r, c);
                    const selectedCell =
                      selected?.row === r && selected?.col === c;
                    const invalid = invalidMap[r][c];

                    const sameRowOrCol =
                      selected && (selected.row === r || selected.col === c);
                    const rowColHighlightClasses = sameRowOrCol
                      ? "bg-slate-500/70"
                      : "";

                    const baseClasses =
                      "flex items-center justify-center border border-slate-700 cursor-pointer select-none text-base sm:text-lg";
                    const fixedClasses = fixed
                      ? "bg-slate-800 text-slate-100 font-semibold"
                      : "bg-slate-950 text-slate-100";
                    const selectedClasses = selectedCell
                      ? "ring-2 ring-emerald-400 z-10"
                      : "";
                    const invalidClasses = invalid ? "bg-rose-900/60" : "";

                    const thickBorderClasses = [
                      r % 3 === 0 ? "border-t-2 border-t-slate-300" : "",
                      c % 3 === 0 ? "border-l-2 border-l-slate-300" : "",
                      r === 8 ? "border-b-2 border-b-slate-300" : "",
                      c === 8 ? "border-r-2 border-r-slate-300" : "",
                    ].join(" ");

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleCellClick(r, c)}
                        className={`${baseClasses} ${fixedClasses} ${rowColHighlightClasses} ${selectedClasses} ${invalidClasses} ${thickBorderClasses}`}
                      >
                        {value !== 0 ? value : ""}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 숫자 패드 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          <div className="mb-2 text-xs font-semibold text-slate-200">
            숫자 입력
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleErase}
              className="col-span-2 rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-600"
            >
              지우기
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="col-span-3 rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 shadow-sm transition hover:bg-slate-600"
            >
              현재 판 다시 시작
            </button>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            키보드 숫자(1~9), Backspace/Delete로도 입력/삭제할 수 있습니다.
          </p>
        </section>
      </div>
    </GameLayout>
  );
}
