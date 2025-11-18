// src/pages/SudokuPage.tsx
import { useEffect, useState } from "react";
import GameLayout from "../layouts/GameLayout";

type Cell = {
  row: number;
  col: number;
};

type DifficultyKey = "beginner" | "easy" | "normal" | "advanced" | "expert" | "extreme";

const DIFFICULTY_LABELS: Record<DifficultyKey, string> = {
  beginner: "초보",
  easy: "쉬움",
  normal: "보통",
  advanced: "숙련",
  expert: "고수",
  extreme: "극한",
};

// ★ 일단 샘플 퍼즐 1쌍을 모든 난이도에 공유 (나중에 개별 퍼즐로 교체 가능)
const BASE_PUZZLE: number[][] = [
  [0, 0, 0, 2, 6, 0, 7, 0, 1],
  [6, 8, 0, 0, 7, 0, 0, 9, 0],
  [1, 9, 0, 0, 0, 4, 5, 0, 0],
  [8, 2, 0, 1, 0, 0, 0, 4, 0],
  [0, 0, 4, 6, 0, 2, 9, 0, 0],
  [0, 5, 0, 0, 0, 3, 0, 2, 8],
  [0, 0, 9, 3, 0, 0, 0, 7, 4],
  [0, 4, 0, 0, 5, 0, 0, 3, 6],
  [7, 0, 3, 0, 1, 8, 0, 0, 0],
];

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

// 난이도별 퍼즐/정답 세트 (지금은 모두 같은 퍼즐을 쓰고, 나중에 난이도별로 갈라치기)
const SUDOKU_SETS: Record<
  DifficultyKey,
  { puzzle: number[][]; solution: number[][] }
> = {
  beginner: { puzzle: BASE_PUZZLE, solution: BASE_SOLUTION },
  easy: { puzzle: BASE_PUZZLE, solution: BASE_SOLUTION },
  normal: { puzzle: BASE_PUZZLE, solution: BASE_SOLUTION },
  advanced: { puzzle: BASE_PUZZLE, solution: BASE_SOLUTION },
  expert: { puzzle: BASE_PUZZLE, solution: BASE_SOLUTION },
  extreme: { puzzle: BASE_PUZZLE, solution: BASE_SOLUTION },
};

function clonePuzzle(puzzle: number[][]): number[][] {
  return puzzle.map((row) => [...row]);
}

// 현재 상태에서 규칙 위반 여부 체크
function getInvalidMap(board: number[][]): boolean[][] {
  const invalid: boolean[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(false)
  );

  // 행 검사
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

  // 열 검사
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

  // 3x3 박스 검사
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

  const isReady = difficulty !== null && basePuzzle && solution && board;

  const isCellFixed = (row: number, col: number): boolean => {
    if (!basePuzzle) return false;
    return basePuzzle[row][col] !== 0;
  };

  const startNewGame = (diff: DifficultyKey) => {
    const set = SUDOKU_SETS[diff];
    const newPuzzle = clonePuzzle(set.puzzle);
    const newSolution = clonePuzzle(set.solution);

    setDifficulty(diff);
    setBasePuzzle(newPuzzle);
    setSolution(newSolution);
    setBoard(newPuzzle);
    setSelected(null);
    setInvalidMap(getInvalidMap(newPuzzle));
    setIsCorrectSolution(null);
  };

  // 키보드 입력
  useEffect(() => {
    if (!isReady || !board || !basePuzzle) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected) return;
      const { row, col } = selected;
      if (isCellFixed(row, col)) return;

      if (e.key >= "1" && e.key <= "9") {
        const num = Number(e.key);
        setBoard((prev) => {
          if (!prev) return prev;
          const next = clonePuzzle(prev);
          next[row][col] = num;
          return next;
        });
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        setBoard((prev) => {
          if (!prev) return prev;
          const next = clonePuzzle(prev);
          next[row][col] = 0;
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, isReady, board, basePuzzle]);

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
    setBoard((prev) => {
      if (!prev) return prev;
      const next = clonePuzzle(prev);
      next[row][col] = num;
      return next;
    });
  };

  const handleErase = () => {
    if (!selected || !board) return;
    const { row, col } = selected;
    if (isCellFixed(row, col)) return;
    setBoard((prev) => {
      if (!prev) return prev;
      const next = clonePuzzle(prev);
      next[row][col] = 0;
      return next;
    });
  };

  const handleReset = () => {
    if (!basePuzzle) return;
    const newPuzzle = clonePuzzle(basePuzzle);
    setBoard(newPuzzle);
    setSelected(null);
    setInvalidMap(getInvalidMap(newPuzzle));
    setIsCorrectSolution(null);
  };

  const handleChangeDifficulty = () => {
    setDifficulty(null);
    setBasePuzzle(null);
    setSolution(null);
    setBoard(null);
    setSelected(null);
    setInvalidMap(Array.from({ length: 9 }, () => Array(9).fill(false)));
    setIsCorrectSolution(null);
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
              플레이할 난이도를 먼저 선택해 주세요.
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
            <div className="text-xs font-semibold text-emerald-300">
              난이도: {difficulty ? DIFFICULTY_LABELS[difficulty] : "-"}
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
            <div className="aspect-square w-full rounded-lg bg-slate-900 p-1 shadow-lg">
              <div className="grid h-full w-full grid-cols-9">
                {board!.map((row, r) =>
                  row.map((value, c) => {
                    const fixed = isCellFixed(r, c);
                    const selectedCell =
                      selected?.row === r && selected?.col === c;
                    const invalid = invalidMap[r][c];

                    const baseClasses =
                      "flex items-center justify-center border border-slate-700 cursor-pointer select-none text-base sm:text-lg";
                    const fixedClasses = fixed
                      ? "bg-slate-800 text-slate-100 font-semibold"
                      : "bg-slate-950 text-slate-100";
                    const selectedClasses = selectedCell
                      ? "ring-2 ring-emerald-400 z-10"
                      : "";
                    const invalidClasses = invalid ? "bg-rose-900/60" : "";

                    // 3x3 박스 경계 강조
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
                        className={`${baseClasses} ${fixedClasses} ${selectedClasses} ${invalidClasses} ${thickBorderClasses}`}
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
              처음으로
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
