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
  { id: 3, label: "옵션 3", color: "#F59E0B" }
];

export default function RoulettePage() {
  const [options, setOptions] = useState<RouletteOption[]>(defaultOptions);
  const [result, setResult] = useState<RouletteOption | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const spin = () => {
    if (isSpinning || options.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    // 랜덤으로 선택된 옵션 인덱스
    const selectedIndex = Math.floor(Math.random() * options.length);
    
    // 각 옵션의 각도
    const anglePerOption = 360 / options.length;
    
    // 선택된 옵션의 중심 각도 (SVG 좌표계: -90도가 12시 방향)
    // 각 섹터의 중심: -90 + index * anglePerOption + anglePerOption/2
    const selectedAngleCenter = -90 + selectedIndex * anglePerOption + anglePerOption / 2;
    
    // 현재 회전을 0~360도 범위로 정규화
    const currentNormalized = ((rotation % 360) + 360) % 360;
    
    // 최소 회전 (2바퀴 이상)
    const minFullRotations = 2;
    // 추가 랜덤 회전 (0~2바퀴)
    const randomFullRotations = Math.random() * 2;
    const totalFullRotations = minFullRotations + randomFullRotations;
    
    // 목표: 선택된 옵션의 중심이 12시 방향(0도)에 오도록
    // selectedAngleCenter가 0도(12시)에 오려면 -selectedAngleCenter만큼 회전 필요
    // 하지만 회전은 양수로만 증가하므로, selectedAngleCenter를 0~360 범위로 정규화
    const normalizedSelectedAngle = ((selectedAngleCenter % 360) + 360) % 360;
    // 목표 오프셋: 선택된 각도를 0도로 만들기 위해 필요한 회전
    const targetOffset = (360 - normalizedSelectedAngle) % 360;
    
    // 현재 정규화된 각도에서 목표 오프셋까지의 차이
    let angleDiff = targetOffset - currentNormalized;
    if (angleDiff < 0) angleDiff += 360;
    
    // 전체 회전 = 현재 회전 + 전체 바퀴 수 + 목표 각도 조정
    const totalRotation = rotation + totalFullRotations * 360 + angleDiff;
    
    // transition을 리셋하고 애니메이션 시작
    setShouldAnimate(false);
    // 다음 프레임에서 애니메이션 시작 (transition이 제대로 적용되도록)
    setTimeout(() => {
      setShouldAnimate(true);
      setRotation(totalRotation);
    }, 10);
    
    // 애니메이션 시간 (3.5초)
    const animationDuration = 3500;
    setTimeout(() => {
      // 회전 후 최종 각도에서 실제로 화살표가 가리키는 옵션 계산
      // 룰렛이 totalRotation만큼 회전했으므로, 화살표는 상대적으로 -totalRotation만큼 이동한 것처럼 보임
      // 화살표는 12시 방향(-90도)을 가리키므로, 룰렛이 회전한 후 화살표가 가리키는 각도는:
      // 원래 화살표 위치(-90도)에서 룰렛의 회전을 빼면 됨
      const finalRotation = ((totalRotation % 360) + 360) % 360;
      
      // 화살표가 가리키는 각도 (SVG 좌표계, -90도가 12시 방향)
      // 룰렛이 시계방향으로 회전하면, 화살표는 반시계방향으로 상대적으로 이동
      const arrowAngle = -90 - finalRotation;
      
      // 각 섹터의 각도
      const anglePerOption = 360 / options.length;
      
      // 화살표 각도를 0~360 범위로 정규화
      const normalizedArrowAngle = ((arrowAngle % 360) + 360) % 360;
      
      // 각 섹터의 시작 각도는 -90 + index * anglePerOption
      // 이를 0~360 범위로 정규화하면: ((-90 + index * anglePerOption) % 360 + 360) % 360
      // 화살표가 가리키는 각도가 어느 섹터에 속하는지 계산
      let actualIndex = 0;
      for (let i = 0; i < options.length; i++) {
        const sectorStart = ((-90 + i * anglePerOption) % 360 + 360) % 360;
        const sectorEnd = ((-90 + (i + 1) * anglePerOption) % 360 + 360) % 360;
        
        // 각도가 섹터 범위에 속하는지 확인
        if (sectorStart < sectorEnd) {
          // 일반적인 경우
          if (normalizedArrowAngle >= sectorStart && normalizedArrowAngle < sectorEnd) {
            actualIndex = i;
            break;
          }
        } else {
          // 섹터가 360도를 넘어가는 경우 (예: 350도 ~ 30도)
          if (normalizedArrowAngle >= sectorStart || normalizedArrowAngle < sectorEnd) {
            actualIndex = i;
            break;
          }
        }
      }
      
      // 실제로 화살표가 가리키는 옵션
      const actualOption = options[actualIndex];
      
      setResult(actualOption);
      setIsSpinning(false);
      // 애니메이션 완료 후 약간의 지연을 두고 transition 비활성화
      setTimeout(() => {
        setShouldAnimate(false);
      }, 100);
    }, animationDuration);
  };

  
  const addOption = () => {
    if (!inputValue.trim() || options.length >= 12) return;
    
    const colors = [
      "#3B82F6", "#10B981", "#F59E0B", "#fa6161", "#8B5CF6", "#EC4899",
      "#06B6D4", "#84CC16", "#F97316", "#ad1313", "#9333EA", "#DB2777"
    ];
    
    const newOption: RouletteOption = {
      id: Date.now(),
      label: inputValue.trim(),
      color: colors[options.length % colors.length],
    };
    
    setOptions([...options, newOption]);
    setInputValue("");
    // 옵션이 변경되면 회전 상태 리셋
    setRotation(0);
    setResult(null);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      alert("최소 2개의 옵션이 필요합니다!");
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
    // 옵션이 변경되면 회전 상태 리셋
    setRotation(0);
    if (result && result.id === id) {
      setResult(null);
    }
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
    setResult(null);
    setRotation(0);
  };

  const shuffleOptions = () => {
    if (isSpinning || options.length === 0) return;
    
    // Fisher-Yates 알고리즘으로 옵션 섞기
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setOptions(shuffled);
    // 옵션이 변경되면 회전 상태 리셋
    setRotation(0);
    setResult(null);
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
      <div className="flex flex-col h-full gap-4 pt-2 pb-4">
        {/* 룰렛 영역 */} 
        <div className="flex items-center justify-center pt-2">
          <div className="relative w-80 h-80 max-w-[90vw] max-h-[90vw]">
            {/* 포인터 (12시 방향) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[35px] border-t-red-500 drop-shadow-lg"></div>
            </div>

            {/* 룰렛 원판 */}
            <div className="relative w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 300"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: shouldAnimate ? `transform 3500ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
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
            className="mt-4 text-2xl font-bold text-center py-4 px-6 rounded-lg animate-bounce mx-4"
            style={{ backgroundColor: result.color, color: "white" }}
          >
            🎉 {result.label} 🎉
          </div>
        )}

        {/* 옵션 관리 */}
        <div className="space-y-4 px-4 mt-4">
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
              className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg placeholder-slate-500 disabled:opacity-50 text-base"
            />
            <button
              onClick={addOption}
              disabled={isSpinning || options.length >= 12 || !inputValue.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
            >
              추가
            </button>
          </div>

          {/* 버튼 그룹 */}
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
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
            >
              리셋
            </button>
          </div>

          {/* 옵션 리스트 */}
          <div className="max-h-48 overflow-y-auto space-y-1.5">
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
                <span className="flex-1 text-white text-sm font-medium">{option.label}</span>
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

        {/* 회전 버튼 */}
        <div className="px-4 mt-auto">
          <button
            onClick={spin}
            disabled={isSpinning || options.length === 0}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSpinning ? "돌리는 중..." : "룰렛 돌리기"}
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
