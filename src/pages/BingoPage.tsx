//src/pages/BingoPage.tsx
import { useState, useEffect } from "react";
import GameLayout from "../layouts/GameLayout";

type Cell = {
  number: number | null;
  text: string;
  checked: boolean;
};

type Mode = "number" | "custom-input" | "custom-play";

export default function BingoPage() {
  const [mode, setMode] = useState<Mode>("number");
  const [board, setBoard] = useState<Cell[][]>([]);
  const [bingoCount, setBingoCount] = useState(0);
  const [completedLines, setCompletedLines] = useState<number[][]>([]);

  useEffect(() => {
    initializeNumberBoard();
  }, []);

  useEffect(() => {
    if (mode !== "custom-input") {
      checkBingo();
    }
  }, [board, mode]);

  const initializeNumberBoard = () => {
    // 1~25 숫자 빙고
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);

    const newBoard: Cell[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 5; j++) {
        const index = i * 5 + j;
        row.push({
          number: shuffled[index],
          text: String(shuffled[index]),
          checked: false,
        });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setBingoCount(0);
    setCompletedLines([]);
    setMode("number");
  };

  const initializeCustomBoard = () => {
    // 빈 커스텀 빙고판
    const newBoard: Cell[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 5; j++) {
        row.push({
          number: null,
          text: "",
          checked: false,
        });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setBingoCount(0);
    setCompletedLines([]);
    setMode("custom-input");
  };

  const handleCustomTextChange = (row: number, col: number, value: string) => {
    if (value.length > 8) return; // 최대 8글자
    
    // 특수문자 제거 (한글, 영문, 숫자, 공백만 허용)
    const filtered = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "");
    
    // 중복 체크 (현재 칸 제외)
    const isDuplicate = board.some((r, rIdx) => 
      r.some((c, cIdx) => {
        if (rIdx === row && cIdx === col) return false; // 현재 칸은 제외
        return c.text.trim().toLowerCase() === filtered.trim().toLowerCase();
      })
    );
    
    if (isDuplicate && filtered.trim() !== "") {
      alert("이미 입력된 단어입니다!");
      return;
    }
    
    const newBoard = [...board];
    newBoard[row][col] = {
      ...newBoard[row][col],
      text: filtered,
    };
    setBoard(newBoard);
  };

  const startCustomGame = () => {
    // 모든 칸이 채워졌는지 확인
    const allFilled = board.every(row => row.every(cell => cell.text.trim() !== ""));
    if (!allFilled) {
      alert("모든 칸을 채워주세요!");
      return;
    }
    setMode("custom-play");
  };

  const handleCellClick = (row: number, col: number) => {
    if (mode === "custom-input") return;
    
    const newBoard = [...board];
    newBoard[row][col] = {
      ...newBoard[row][col],
      checked: !newBoard[row][col].checked,
    };
    setBoard(newBoard);
  };

  const checkBingo = () => {
    if (board.length === 0) return;
    
    const lines: number[][] = [];

    // 가로 체크
    for (let i = 0; i < 5; i++) {
      if (board[i].every((cell) => cell.checked)) {
        lines.push([i, 0, i, 1, i, 2, i, 3, i, 4]);
      }
    }

    // 세로 체크
    for (let j = 0; j < 5; j++) {
      if (board.every((row) => row[j].checked)) {
        lines.push([0, j, 1, j, 2, j, 3, j, 4, j]);
      }
    }

    // 대각선 체크 (왼→오)
    if (board.every((row, i) => row[i].checked)) {
      lines.push([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
    }

    // 대각선 체크 (오→왼)
    if (board.every((row, i) => row[4 - i].checked)) {
      lines.push([0, 4, 1, 3, 2, 2, 3, 1, 4, 0]);
    }

    setCompletedLines(lines);
    setBingoCount(lines.length);
  };

  const isInCompletedLine = (row: number, col: number) => {
    return completedLines.some((line) => {
      for (let i = 0; i < line.length; i += 2) {
        if (line[i] === row && line[i + 1] === col) return true;
      }
      return false;
    });
  };

  return (
    <GameLayout title="빙고">
      <div className="flex flex-col h-full gap-6 py-4">
        {/* 빙고 카운트 (입력 모드가 아닐 때만) */}
        {mode !== "custom-input" && (
          <div className="text-center">
            <div className="text-white text-5xl font-bold mb-2">
              {bingoCount > 0 && (
                <span className="animate-bounce inline-block">🎉 </span>
              )}
              {bingoCount} BINGO
              {bingoCount > 0 && (
                <span className="animate-bounce inline-block"> 🎉</span>
              )}
            </div>
            {bingoCount >= 5 && (
              <div className="text-yellow-400 text-xl font-bold animate-pulse">
                🏆 5빙고 달성! 🏆
              </div>
            )}
          </div>
        )}

        {/* 커스텀 입력 모드 안내 */}
        {mode === "custom-input" && (
          <div className="text-center">
            <div className="text-white text-xl font-bold">
              각 칸에 단어를 입력하세요
            </div>
            <div className="text-slate-400 text-sm mt-1">
              (최대 8글자)
            </div>
          </div>
        )}

        {/* 빙고판 */}
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <div className="grid grid-cols-5 gap-2 w-full max-w-md px-4">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isCompleted = isInCompletedLine(rowIndex, colIndex);
              
              // 커스텀 입력 모드
              if (mode === "custom-input") {
                return (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="text"
                    value={cell.text}
                    onChange={(e) => handleCustomTextChange(rowIndex, colIndex, e.target.value)}
                    className="aspect-square rounded-lg text-xs font-bold bg-slate-800 text-white text-center border-2 border-slate-600 focus:border-blue-500 focus:outline-none p-1"
                    placeholder={`${rowIndex * 5 + colIndex + 1}`}
                  />
                );
              }

              // 게임 플레이 모드
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`aspect-square rounded-lg font-bold transition-all flex items-center justify-center ${
                    cell.checked
                      ? isCompleted
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-95"
                        : "bg-blue-600 text-white scale-95"
                      : "bg-slate-700 text-white hover:bg-slate-600 hover:scale-105"
                  } ${mode === "number" ? "text-xl" : "text-[10px]"}`}
                >
                  {cell.checked ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="line-through px-1">{cell.text}</div>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        ✓
                      </div>
                    </div>
                  ) : (
                    <div className="break-words p-1 leading-tight">{cell.text}</div>
                  )}
                </button>
              );
            })
          )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-2 px-4">
          {mode === "custom-input" ? (
            // 커스텀 입력 모드 버튼
            <div className="flex gap-2">
              <button
                onClick={initializeNumberBoard}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={startCustomGame}
                className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
              >
                시작하기
              </button>
            </div>
          ) : (
            // 일반/커스텀 플레이 모드 버튼
            <>
              <div className="text-center text-slate-400 text-sm">
                {mode === "number" ? "숫자를 클릭하여 체크하세요" : "단어를 클릭하여 체크하세요"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={initializeNumberBoard}
                  className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                >
                  새 게임
                </button>
                <button
                  onClick={initializeCustomBoard}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                >
                  커스텀
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </GameLayout>
  );
}