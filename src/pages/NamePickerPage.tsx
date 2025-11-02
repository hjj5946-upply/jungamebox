//src/pages/NamePickerPage.tsx
import { useState } from "react";
import GameLayout from "../layouts/GameLayout";

export default function NamePickerPage() {
  const [names, setNames] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [pickedMessage, setPickedMessage] = useState<string>("");
  const [isPicking, setIsPicking] = useState(false);

  const winMessages = [
    "당첨! 축하합니다!",
    "걸렸넼ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
    "에~~~너가 걸림 ㅋㅋㅋ",
    "축! 당! 첨!",
    "너가 사야겠다ㅋㅋㅋ",
    "잘먹을게~~~ ㅋㅋㅋ",
    "운이 없으시네요 ㅠㅠ",
  ];

  const addName = () => {
    const trimmed = inputName.trim();
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed]);
      setInputName("");
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const pickRandomName = () => {
    if (names.length === 0 || isPicking) return;

    setIsPicking(true);
    setPickedName(null);

    // 애니메이션 효과 (빠르게 이름 변경)
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * names.length);
      setPickedName(names[randomIndex]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        // 랜덤 메시지 선택
        const randomMessageIndex = Math.floor(Math.random() * winMessages.length);
        setPickedMessage(winMessages[randomMessageIndex]);
        setIsPicking(false);
      }
    }, 100);
  };

  const reset = () => {
    setPickedName(null);
    setPickedMessage("");
  };

  const clearAll = () => {
    setNames([]);
    setPickedName(null);
    setPickedMessage("");
  };

  return (
    <GameLayout title="제비뽑기">
      <div className="flex flex-col h-full gap-4">
        {/* 입력 영역 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addName()}
            placeholder="이름 입력"
            className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg placeholder-slate-500"
          />
          <button
            onClick={addName}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
          >
            추가
          </button>
        </div>

        {/* 이름 목록 */}
        <div className="flex-1 bg-slate-800 rounded-lg p-4 overflow-y-auto">
          {names.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              이름을 추가해주세요
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {names.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg"
                >
                  <span className="text-white">{name}</span>
                  <button
                    onClick={() => removeName(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 뽑힌 이름 표시 */}
        {pickedName && (
          <div className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-center ${
            !isPicking ? "animate-bounce" : ""
          }`}>
            <div className="text-slate-200 text-sm mb-2">{isPicking ? "뽑는 중..." : pickedMessage}</div>
            <div className="text-white text-4xl font-bold">{pickedName}</div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          {names.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              전체삭제
            </button>
          )}
          {pickedName && !isPicking && (
            <button
              onClick={reset}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              다시뽑기
            </button>
          )}
          <button
            onClick={pickRandomName}
            disabled={names.length === 0 || isPicking}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold rounded-lg"
          >
            {isPicking ? "뽑는 중..." : "제비 뽑기"}
          </button>
        </div>
      </div>
    </GameLayout>
  );
}