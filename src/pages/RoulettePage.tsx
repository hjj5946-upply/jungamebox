import { useState } from "react";
import GameLayout from "../layouts/GameLayout";

type RouletteOption = {
  id: number;
  label: string;
  color: string;
};

const defaultOptions: RouletteOption[] = [
  { id: 1, label: "옵션 1", color: "#3B82F6" },
  { id: 2, label: "옵션 2", color: "#10B981" },
  { id: 3, label: "옵션 3", color: "#F59E0B" },
  { id: 4, label: "옵션 4", color: "#EF4444" },
  { id: 5, label: "옵션 5", color: "#8B5CF6" },
  { id: 6, label: "옵션 6", color: "#EC4899" },
];

export default function RoulettePage() {
  const [options, setOptions] = useState<RouletteOption[]>(defaultOptions);
  const [result, setResult] = useState<RouletteOption | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const spin = () => {
    if (isSpinning || options.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    // 랜덤으로 선택된 옵션
    const selectedIndex = Math.floor(Math.random() * options.length);
    const selectedOption = options[selectedIndex];
    
    // 각 옵션의 각도
    const anglePerOption = 360 / options.length;
    // 선택된 옵션의 중심 각도 (12시 방향 기준)
    const selectedAngle = selectedIndex * anglePerOption + anglePerOption / 2;
    
    // 최소 회전 (2바퀴 이상)
    const minRotation = 720;
    // 추가 랜덤 회전
    const randomRotation = Math.random() * 720;
    // 전체 회전 = 현재 회전 + 최소 회전 + 랜덤 회전 - 선택된 각도 (12시 방향으로 맞추기)
    const totalRotation = rotation + minRotation + randomRotation + (360 - selectedAngle);
    
    setRotation(totalRotation);
    
    // 애니메이션 시간 (3.5초)
    setTimeout(() => {
      setResult(selectedOption);
      setIsSpinning(false);
    }, 3500);
  };

  const addOption = () => {
    if (!inputValue.trim() || options.length >= 12) return;
    
    const colors = [
      "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899",
      "#06B6D4", "#84CC16", "#F97316", "#DC2626", "#9333EA", "#DB2777"
    ];
    
    const newOption: RouletteOption = {
      id: Date.now(),
      label: inputValue.trim(),
      color: colors[options.length % colors.length],
    };
    
    setOptions([...options, newOption]);
    setInputValue("");
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      alert("최소 2개의 옵션이 필요합니다!");
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
    if (result && result.id === id) {
      setResult(null);
    }
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
    setResult(null);
    setRotation(0);
  };

  // SVG path 생성 (파이 조각)
  const getSectorPath = (index: number, total: number, radius: number) => {
    const anglePerOption = 360 / total;
    const startAngle = (index * anglePerOption - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerOption - 90) * (Math.PI / 180);
    
    const x1 = radius + radius * Math.cos(startAngle);
    const y1 = radius + radius * Math.sin(startAngle);
    const x2 = radius + radius * Math.cos(endAngle);
    const y2 = radius + radius * Math.sin(endAngle);
    
    const largeArcFlag = anglePerOption > 180 ? 1 : 0;
    
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // 텍스트 위치 계산
  const getTextPosition = (index: number, total: number, radius: number) => {
    const anglePerOption = 360 / total;
    const angle = (index * anglePerOption + anglePerOption / 2 - 90) * (Math.PI / 180);
    const textRadius = radius * 0.7;
    const x = radius + textRadius * Math.cos(angle);
    const y = radius + textRadius * Math.sin(angle);
    return { x, y, angle: (angle + Math.PI / 2) * (180 / Math.PI) };
  };

  const radius = 150;

  return (
    <GameLayout title="돌려돌림판">
      <div className="flex flex-col h-full gap-6">
        {/* 룰렛 영역 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* 포인터 (12시 방향) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[35px] border-t-yellow-400 drop-shadow-lg"></div>
            </div>

            {/* 룰렛 원판 */}
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 300"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: `transform 3500ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
                }}
              >
                {options.map((option, index) => (
                  <g key={option.id}>
                    <path
                      d={getSectorPath(index, options.length, radius)}
                      fill={option.color}
                      stroke="#1E293B"
                      strokeWidth="2"
                    />
                    <text
                      x={getTextPosition(index, options.length, radius).x}
                      y={getTextPosition(index, options.length, radius).y}
                      transform={`rotate(${getTextPosition(index, options.length, radius).angle} ${getTextPosition(index, options.length, radius).x} ${getTextPosition(index, options.length, radius).y})`}
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

              {/* 중심 원 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 border-4 border-slate-600 rounded-full z-20 shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* 결과 표시 */}
        {result && !isSpinning && (
          <div
            className="text-2xl font-bold text-center py-4 px-6 rounded-lg animate-bounce"
            style={{ backgroundColor: result.color, color: "white" }}
          >
            🎉 {result.label} 🎉
          </div>
        )}

        {/* 옵션 관리 */}
        <div className="space-y-3">
          {/* 옵션 추가 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addOption()}
              placeholder="옵션 추가 (최대 12개)"
              maxLength={20}
              disabled={isSpinning || options.length >= 12}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg placeholder-slate-500 disabled:opacity-50"
            />
            <button
              onClick={addOption}
              disabled={isSpinning || options.length >= 12 || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              추가
            </button>
            <button
              onClick={resetOptions}
              disabled={isSpinning}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              리셋
            </button>
          </div>

          {/* 옵션 리스트 */}
          <div className="max-h-32 overflow-y-auto space-y-2">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: option.color + "40" }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: option.color }}
                ></div>
                <span className="flex-1 text-white text-sm">{option.label}</span>
                <button
                  onClick={() => removeOption(option.id)}
                  disabled={isSpinning || options.length <= 2}
                  className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 회전 버튼 */}
        <button
          onClick={spin}
          disabled={isSpinning || options.length === 0}
          className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSpinning ? "돌리는 중..." : "룰렛 돌리기"}
        </button>
      </div>
    </GameLayout>
  );
}
