import { useState, useEffect, useLayoutEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";
import { gsap } from "gsap";

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
  
  const scope = useRef(null); // GSAP 애니메이션 범위를 지정하기 위한 참조

  // 1. 페이지 진입 시 빙고판 등장 애니메이션 (GSAP)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bingo-cell", {
        duration: 0.5,
        scale: 0,
        opacity: 0,
        stagger: 0.02,
        ease: "back.out(1.7)",
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  // 2. 빙고 카운트 상승 시 텍스트 통통 튀는 효과 (GSAP)
  useEffect(() => {
    if (bingoCount > 0) {
      gsap.fromTo(".bingo-count-display", 
        { scale: 0.5, rotation: -5 }, 
        { scale: 1, rotation: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    }
  }, [bingoCount]);

  useEffect(() => {
    initializeNumberBoard();
  }, []);

  useEffect(() => {
    if (mode !== "custom-input") {
      checkBingo();
    }
  }, [board, mode]);

  const initializeNumberBoard = () => {
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
    if (value.length > 8) return;
    const filtered = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "");
    
    const newBoard = [...board];
    newBoard[row][col] = {
      ...newBoard[row][col],
      text: filtered,
    };
    setBoard(newBoard);
  };

  const startCustomGame = () => {
    const allFilled = board.every(row => row.every(cell => cell.text.trim() !== ""));
    if (!allFilled) {
      alert("모든 칸을 채워주세요!");
      return;
    }
    // 중복 체크는 시작할 때 한 번에 수행 (UX 개선)
    const allTexts = board.flat().map(c => c.text.trim());
    const uniqueTexts = new Set(allTexts);
    if (allTexts.length !== uniqueTexts.size) {
      alert("중복된 단어가 있습니다!");
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

    // 클릭 시 해당 셀만 살짝 커지는 효과 추가 (GSAP)
    gsap.fromTo(`#cell-${row}-${col}`, 
      { scale: 0.9 }, 
      { scale: 0.95, duration: 0.2, ease: "power1.out" }
    );
  };

  const checkBingo = () => {
    if (board.length === 0) return;
    const lines: number[][] = [];

    for (let i = 0; i < 5; i++) {
      if (board[i].every((cell) => cell.checked)) {
        lines.push([i, 0, i, 1, i, 2, i, 3, i, 4]);
      }
    }
    for (let j = 0; j < 5; j++) {
      if (board.every((row) => row[j].checked)) {
        lines.push([0, j, 1, j, 2, j, 3, j, 4, j]);
      }
    }
    if (board.every((row, i) => row[i].checked)) {
      lines.push([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
    }
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
    <GameLayout title="무료 온라인 빙고판 | J GameBox">
      <div ref={scope} className="flex flex-col h-full gap-6 py-4">
        {/* 빙고 카운트 */}
        {mode !== "custom-input" && (
          <div className="text-center">
            <div className="bingo-count-display text-white text-5xl font-bold mb-2">
              {bingoCount > 0 && <span className="inline-block mr-2">🎉</span>}
              {bingoCount} BINGO
              {bingoCount > 0 && <span className="inline-block ml-2">🎉</span>}
            </div>
            {bingoCount >= 5 && (
              <div className="text-yellow-400 text-xl font-bold animate-pulse">
                🏆 5빙고 달성! 🏆
              </div>
            )}
          </div>
        )}

        {/* 커스텀 모드 설명 */}
        {mode === "custom-input" && (
          <div className="text-center">
            <h2 className="text-white text-xl font-bold">나만의 단어 빙고 만들기</h2>
            <p className="text-slate-400 text-sm mt-1">(최대 8글자, 중복 없이 입력하세요)</p>
          </div>
        )}

        {/* 빙고판 구역 */}
        <div className="flex-1 flex items-center justify-center overflow-auto px-4">
          <div className="grid grid-cols-5 gap-2 w-full max-w-md">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isCompleted = isInCompletedLine(rowIndex, colIndex);
                const cellId = `cell-${rowIndex}-${colIndex}`;
                
                if (mode === "custom-input") {
                  return (
                    <input
                      key={cellId}
                      type="text"
                      value={cell.text}
                      onChange={(e) => handleCustomTextChange(rowIndex, colIndex, e.target.value)}
                      className="bingo-cell aspect-square rounded-lg text-xs font-bold bg-slate-800 text-white text-center border-2 border-slate-600 focus:border-blue-500 focus:outline-none p-1"
                      placeholder={`${rowIndex * 5 + colIndex + 1}`}
                    />
                  );
                }

                return (
                  <button
                    key={cellId}
                    id={cellId}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`bingo-cell aspect-square rounded-lg font-bold transition-all flex items-center justify-center ${
                      cell.checked
                        ? isCompleted
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-95 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                          : "bg-blue-600 text-white scale-95"
                        : "bg-slate-700 text-white hover:bg-slate-600 hover:scale-105"
                    } ${mode === "number" ? "text-xl" : "text-[10px]"}`}
                  >
                    {cell.checked ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="line-through opacity-50">{cell.text}</div>
                        <div className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-md">✓</div>
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

        {/* 하단 컨트롤 영역 */}
        <div className="space-y-4 px-4 pb-4">
          <div className="text-center text-slate-400 text-xs">
            {mode === "custom-input" ? "모든 칸을 채우고 시작하기를 누르세요" : "클릭하여 빙고를 완성하세요!"}
          </div>
          <div className="flex gap-2">
            {mode === "custom-input" ? (
              <>
                <button onClick={initializeNumberBoard} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">취소</button>
                <button onClick={startCustomGame} className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg">시작하기</button>
              </>
            ) : (
              <>
                <button onClick={initializeNumberBoard} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">숫자 빙고</button>
                <button onClick={initializeCustomBoard} className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg">커스텀 빙고</button>
              </>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}