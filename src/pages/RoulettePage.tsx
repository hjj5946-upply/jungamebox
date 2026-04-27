// import { useState, useRef } from "react";
// import GameLayout from "../layouts/GameLayout";

// type RouletteOption = {
//   id: number;
//   label: string;
//   color: string;
// };

// const defaultOptions: RouletteOption[] = [
//   { id: 1, label: "옵션 1", color: "#3B82F6" },
//   { id: 2, label: "옵션 2", color: "#10B981" }
// ];

// export default function RoulettePage() {
//   const [options, setOptions] = useState<RouletteOption[]>(defaultOptions);
//   const [customCount, setCustomCount] = useState(0);
//   const [result, setResult] = useState<RouletteOption | null>(null);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [rotation, setRotation] = useState(0);
//   const [inputValue, setInputValue] = useState("");
//   const [shouldAnimate, setShouldAnimate] = useState(false);

//   const spin = () => {
//     if (isSpinning || options.length === 0) return;
//     setIsSpinning(true);
//     setResult(null);
    
//     const selectedIndex = Math.floor(Math.random() * options.length);
//     const anglePerOption = 360 / options.length;
//     const selectedAngleCenter = -90 + selectedIndex * anglePerOption + anglePerOption / 2;
//     const currentNormalized = ((rotation % 360) + 360) % 360;
//     const minFullRotations = 2;
//     const randomFullRotations = Math.random() * 2;
//     const totalFullRotations = minFullRotations + randomFullRotations;
//     const normalizedSelectedAngle = ((selectedAngleCenter % 360) + 360) % 360;
//     const targetOffset = (360 - normalizedSelectedAngle) % 360;
//     let angleDiff = targetOffset - currentNormalized;
//     if (angleDiff < 0) angleDiff += 360;
//     const totalRotation = rotation + totalFullRotations * 360 + angleDiff;
    
//     setShouldAnimate(false);
//     setTimeout(() => {
//       setShouldAnimate(true);
//       setRotation(totalRotation);
//     }, 10);
    
//     const animationDuration = 3500;
//     setTimeout(() => {
//       const finalRotation = ((totalRotation % 360) + 360) % 360;
//       const arrowAngle = -90 - finalRotation;
//       const anglePerOption = 360 / options.length;
//       const normalizedArrowAngle = ((arrowAngle % 360) + 360) % 360;
      
//       let actualIndex = 0;
//       for (let i = 0; i < options.length; i++) {
//         const sectorStart = ((-90 + i * anglePerOption) % 360 + 360) % 360;
//         const sectorEnd = ((-90 + (i + 1) * anglePerOption) % 360 + 360) % 360;
        
//         if (sectorStart < sectorEnd) {
//           if (normalizedArrowAngle >= sectorStart && normalizedArrowAngle < sectorEnd) {
//             actualIndex = i;
//             break;
//           }
//         } else {
//           if (normalizedArrowAngle >= sectorStart || normalizedArrowAngle < sectorEnd) {
//             actualIndex = i;
//             break;
//           }
//         }
//       }
      
//       const actualOption = options[actualIndex];
//       setResult(actualOption);
//       setIsSpinning(false);
//       setTimeout(() => {
//         setShouldAnimate(false);
//       }, 100);
//     }, animationDuration);
//   };
  
//   const inputRef = useRef<HTMLInputElement>(null);

//   const addOption = () => {
//   if (!inputValue.trim() || options.length >= 12) return;
  
//   const colors = [
//     "#3B82F6", "#10B981", "#F59E0B", "#fa6161", "#8B5CF6", "#EC4899",
//     "#06B6D4", "#84CC16", "#F97316", "#ad1313", "#9333EA", "#DB2777"
//   ];
  
//   // 첫 3개까지는 기본 옵션 교체
//   if (customCount < 2) {
//     const updatedOptions = [...options];
//     updatedOptions[customCount] = {
//       ...updatedOptions[customCount],
//       label: inputValue.trim()
//     };
//     setOptions(updatedOptions);
//     setCustomCount(customCount + 1);
//   } else {
//     // 4번째부터는 새로 추가
//     const newOption: RouletteOption = {
//       id: Date.now(),
//       label: inputValue.trim(),
//       color: colors[options.length % colors.length],
//     };
//     setOptions([...options, newOption]);
//   }
  
//     setInputValue("");
//     setRotation(0);
//     setResult(null);

//     setTimeout(() => inputRef.current?.focus(), 50);
//   };

//   const removeOption = (id: number) => {
//     if (options.length <= 2) {
//       alert("최소 2개의 옵션이 필요합니다!");
//       return;
//     }
//     setOptions(options.filter((opt) => opt.id !== id));
//     setRotation(0);
//     if (result && result.id === id) {
//       setResult(null);
//     }
//   };

//   const resetOptions = () => {
//     setOptions(defaultOptions);
//     setCustomCount(0);
//     setResult(null);
//     setRotation(0);
//   };

//   const shuffleOptions = () => {
//     if (isSpinning || options.length === 0) return;
    
//     const shuffled = [...options];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
    
//     setOptions(shuffled);
//     setRotation(0);
//     setResult(null);
//   };

//   const getSectorPath = (index: number, total: number, radius: number) => {
//     const anglePerOption = 360 / total;
//     const startAngle = (index * anglePerOption - 90) * (Math.PI / 180);
//     const endAngle = ((index + 1) * anglePerOption - 90) * (Math.PI / 180);
    
//     const x1 = radius + radius * Math.cos(startAngle);
//     const y1 = radius + radius * Math.sin(startAngle);
//     const x2 = radius + radius * Math.cos(endAngle);
//     const y2 = radius + radius * Math.sin(endAngle);
    
//     const largeArcFlag = anglePerOption > 180 ? 1 : 0;
    
//     return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
//   };

//   const getTextPosition = (index: number, total: number, radius: number) => {
//     const anglePerOption = 360 / total;
//     const angle = (index * anglePerOption + anglePerOption / 2 - 90) * (Math.PI / 180);
//     const textRadius = radius * 0.7;
//     const x = radius + textRadius * Math.cos(angle);
//     const y = radius + textRadius * Math.sin(angle);
//     return { x, y, angle: (angle + Math.PI / 2) * (180 / Math.PI) };
//   };

//   const radius = 150;

//   return (
//     <GameLayout title="돌려돌림판">
//       <div className="flex flex-col h-full gap-4 pt-2 pb-4">
//         {/* 룰렛 영역 */} 
//         <div className="flex items-center justify-center pt-2">
//           <div className="relative w-80 h-80 max-w-[90vw] max-h-[90vw]">
//             {/* 포인터 (12시 방향) */}
//             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
//               <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[35px] border-t-red-500 drop-shadow-lg"></div>
//             </div>
//             {/* 룰렛 원판 */}
//             <div className="relative w-full h-full">
//               <svg
//                 width="100%"
//                 height="100%"
//                 viewBox="0 0 300 300"
//                 style={{
//                   transform: `rotate(${rotation}deg)`,
//                   transition: shouldAnimate ? `transform 3500ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
//                 }}
//               >
//                 {options.map((option, index) => (
//                   <g key={option.id}>
//                     <path
//                       d={getSectorPath(index, options.length, radius)}
//                       fill={option.color}
//                       stroke="#1E293B"
//                       strokeWidth="2"
//                     />
//                     <text
//                       x={getTextPosition(index, options.length, radius).x}
//                       y={getTextPosition(index, options.length, radius).y}
//                       transform={`rotate(${getTextPosition(index, options.length, radius).angle} ${getTextPosition(index, options.length, radius).x} ${getTextPosition(index, options.length, radius).y})`}
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       fill="white"
//                       fontWeight="bold"
//                       fontSize="14"
//                       className="select-none"
//                     >
//                       {option.label}
//                     </text>
//                   </g>
//                 ))}
//               </svg>
//               {/* 중심 원 - 돌리기 버튼 */}
//               <button
//                 onClick={spin}
//                 disabled={isSpinning || options.length === 0}
//                 className={`
//                   absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
//                   w-20 h-20 rounded-full z-20 shadow-lg
//                   flex flex-col items-center justify-center
//                   font-bold text-white text-sm
//                   transition-all duration-200
//                   ${isSpinning || options.length === 0
//                     ? 'bg-slate-700 border-4 border-slate-600 cursor-not-allowed opacity-70'
//                     : 'bg-gradient-to-br from-green-600 to-green-700 border-4 border-green-500 hover:from-green-500 hover:to-green-600 hover:scale-110 cursor-pointer active:scale-95'
//                   }
//                 `}
//               >
//                 {isSpinning ? (
//                   <>
//                     <span className="text-xs">...</span>
//                   </>
//                 ) : (
//                   <>
//                     <span className="text-xl">▶</span>
//                     <span className="text-xs mt-0.5">START</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* 결과 표시 */}
//         {result && !isSpinning && (
//           <div
//             className="mt-4 text-2xl font-bold text-center py-4 px-6 rounded-lg animate-bounce mx-4"
//             style={{ backgroundColor: result.color, color: "white" }}
//           >
//             🎉 {result.label} 🎉
//           </div>
//         )}

//         {/* 옵션 관리 */}
//         <div className="space-y-4 px-4 mt-4">
//           {/* 옵션 추가 */}
//           <div className="flex gap-2">
//             <input
//               type="text"
//               ref={inputRef}
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && addOption()}
//               placeholder="옵션 추가 (최대 12개)"
//               maxLength={20}
//               disabled={isSpinning || options.length >= 12}
//               className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg placeholder-slate-500 disabled:opacity-50 text-base"
//             />
//             <button
//               onClick={addOption}
//               disabled={isSpinning || options.length >= 12 || !inputValue.trim()}
//               className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
//             >
//               추가
//             </button>
//           </div>

//           {/* 버튼 그룹 */}
//           <div className="flex gap-2">
//             <button
//               onClick={shuffleOptions}
//               disabled={isSpinning || options.length < 2}
//               className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
//             >
//               🔀 섞기
//             </button>
//             <button
//               onClick={resetOptions}
//               disabled={isSpinning}
//               className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
//             >
//               리셋
//             </button>
//           </div>

//           {/* 옵션 리스트 */}
//           <div className="max-h-48 overflow-y-auto space-y-1.5">
//             {options.map((option) => (
//               <div
//                 key={option.id}
//                 className="flex items-center gap-2 px-3 py-2 rounded-lg"
//                 style={{ backgroundColor: option.color + "40" }}
//               >
//                 <div
//                   className="w-4 h-4 rounded-full flex-shrink-0"
//                   style={{ backgroundColor: option.color }}
//                 ></div>
//                 <span className="flex-1 text-white text-sm font-medium">{option.label}</span>
//                 <button
//                   onClick={() => removeOption(option.id)}
//                   disabled={isSpinning || options.length <= 2}
//                   className="text-red-400 hover:text-red-300 text-base font-bold disabled:opacity-50 transition-colors w-7 h-7 flex items-center justify-center"
//                 >
//                   ✕
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </GameLayout>
//   );
// }

import { useState, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

type RouletteOption = {
  id: number;
  label: string;
  color: string;
};

const defaultOptions: RouletteOption[] = [
  { id: 1, label: "옵션 1", color: "#3B82F6" },
  { id: 2, label: "옵션 2", color: "#10B981" }
];

// ✅ crypto 기반 랜덤 (Math.random()보다 균등 분포)
const getRandomIndex = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

export default function RoulettePage() {
  const [options, setOptions] = useState<RouletteOption[]>(defaultOptions);
  const [customCount, setCustomCount] = useState(0);
  const [result, setResult] = useState<RouletteOption | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // ✅ 키보드 유지용

  const spin = () => {
    if (isSpinning || options.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    // ✅ selectedIndex 여기서 한 번만 결정
    const selectedIndex = getRandomIndex(options.length);
    const selectedOption = options[selectedIndex];
    const anglePerOption = 360 / options.length;
    const selectedAngleCenter = -90 + selectedIndex * anglePerOption + anglePerOption / 2;
    const currentNormalized = ((rotation % 360) + 360) % 360;
    const totalFullRotations = 2 + Math.random() * 2;
    const normalizedSelectedAngle = ((selectedAngleCenter % 360) + 360) % 360;
    const targetOffset = (360 - normalizedSelectedAngle) % 360;
    let angleDiff = targetOffset - currentNormalized;
    if (angleDiff < 0) angleDiff += 360;
    const totalRotation = rotation + totalFullRotations * 360 + angleDiff;

    setShouldAnimate(false);
    setTimeout(() => {
      setShouldAnimate(true);
      setRotation(totalRotation);
    }, 10);

    const animationDuration = 3500;
    setTimeout(() => {
      setResult(selectedOption);
      setIsSpinning(false);
      setTimeout(() => setShouldAnimate(false), 100);
    }, animationDuration);
  };

  const addOption = () => {
    if (isSpinning) return;
    if (!inputValue.trim() || options.length >= 12) return;

    const colors = [
      "#ad1313", "#10B981", "#F59E0B", "#fa6161", "#8B5CF6", "#EC4899",
      "#06B6D4", "#84CC16", "#F97316", "#3B82F6", "#9333EA", "#DB2777"
    ];

    if (customCount < 2) {
      const updatedOptions = [...options];
      updatedOptions[customCount] = {
        ...updatedOptions[customCount],
        label: inputValue.trim()
      };
      setOptions(updatedOptions);
      setCustomCount(customCount + 1);
    } else {
      const newOption: RouletteOption = {
        id: Date.now(),
        label: inputValue.trim(),
        color: colors[options.length % colors.length],
      };
      setOptions([...options, newOption]);
    }

    setInputValue("");
    setRotation(0);
    setResult(null);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      alert("최소 2개의 옵션이 필요합니다!");
      return;
    }

    const removedOption = options.find(opt => opt.id === id);
    if (removedOption && (removedOption.id === 1 || removedOption.id === 2)) {
      setCustomCount(prev => Math.max(0, prev - 1));
    }

    setOptions(options.filter((opt) => opt.id !== id));
    setRotation(0);
    if (result && result.id === id) setResult(null);
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
    setCustomCount(0);
    setResult(null);
    setRotation(0);
  };

  const shuffleOptions = () => {
    if (isSpinning || options.length === 0) return;
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = getRandomIndex(i + 1); // ✅ crypto 랜덤 사용
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOptions(shuffled);
    setRotation(0);
    setResult(null);
  };

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
        <div className="flex items-center justify-center pt-2">
          <div className="relative w-80 h-80 max-w-[90vw] max-h-[90vw]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[35px] border-t-red-500 drop-shadow-lg"></div>
            </div>
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
              <button
                onClick={spin}
                disabled={isSpinning || options.length === 0}
                className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-20 h-20 rounded-full z-20 shadow-lg
                  flex flex-col items-center justify-center
                  font-bold text-white text-sm
                  transition-all duration-200
                  ${isSpinning || options.length === 0
                    ? 'bg-slate-700 border-4 border-slate-600 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-br from-green-600 to-green-700 border-4 border-green-500 hover:from-green-500 hover:to-green-600 hover:scale-110 cursor-pointer active:scale-95'
                  }
                `}
              >
                {isSpinning ? <span className="text-xs">...</span> : (
                  <>
                    <span className="text-xl">▶</span>
                    <span className="text-xs mt-0.5">START</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {result && !isSpinning && (
          <div
            className="mt-4 text-2xl font-bold text-center py-4 px-6 rounded-lg animate-bounce mx-4"
            style={{ backgroundColor: result.color, color: "white" }}
          >
            🎉 {result.label} 🎉
          </div>
        )}

        <div className="space-y-4 px-4 mt-4">
          <div className="flex gap-2">
            <input
              ref={inputRef} // ✅ ref 연결
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
              onMouseDown={(e) => e.preventDefault()} // ✅ 키보드 유지
              onClick={addOption}
              disabled={isSpinning || options.length >= 12 || !inputValue.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold"
            >
              추가
            </button>
          </div>

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

          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: option.color + "40" }}
              >
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }}></div>
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
      </div>
    </GameLayout>
  );
}