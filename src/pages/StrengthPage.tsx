import { useState, useRef } from "react";
import GameLayout from "../layouts/GameLayout";
import { gsap } from "gsap";

// 이미지 임포트 (기존 경로 유지)
import sword0 from "/sword0.png";
import sword1 from "/sword1.png";
import sword2 from "/sword2.png";
import sword3 from "/sword3.png";
import sword4 from "/sword4.png";
import sword5 from "/sword5.png";
import sword6 from "/sword6.png";
import sword7 from "/sword7.png";
import sword8 from "/sword8.png";
import sword9 from "/sword9.png";
import sword10 from "/sword10.png";
import sword11 from "/sword11.png";
import sword12 from "/sword12.png";
import sword13 from "/sword13.png";
import sword14 from "/sword14.png";
import sword15 from "/sword15.png";
import sword16 from "/sword16.png";
import sword17 from "/sword17.png";
import sword18 from "/sword18.png";
import sword19 from "/sword19.png";
import sword20 from "/sword20.png";
import WeaponImage from '/weapon_w.png';

// 데이터 설정
const SWORD_IMAGES = [
  sword0, sword1, sword2, sword3, sword4, sword5, sword6, sword7, sword8, sword9,
  sword10, sword11, sword12, sword13, sword14, sword15, sword16, sword17, sword18, sword19, sword20,
];

const SWORD_NAMES = [
  "주방 식칼", "삼각자마다르", "닌자도", "한아비", "텐겐 일륜도", "미츠리 일륜도", "귀검사의 검",
  "그륜힐", "광선검", "전기 검", "나스쥬로 검", "염화 카타나", "렌고쿠 일륜도", "토르의 망치",
  "수절포정", "쿠사나기", "엑스칼리버", "무한의대검", "황제드라몬 소드", "K2 소총", "태극기",
];

const PROTECTION_COST = 40000;
type EnhanceResult = "success" | "fail" | "destroy";

export default function StrengthPage() {
  const [level, setLevel] = useState(0);
  const [gold, setGold] = useState(100000);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<EnhanceResult | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [stats, setStats] = useState({ success: 0, fail: 0, destroy: 0, sold: 0, protected: 0 });

  // Refs for Animation
  const weaponRef = useRef(null);
  const flashRef = useRef(null);

  // 밸런스 함수들
  const getCost = (lv: number) => {
    if (lv <= 3) return 500;
    if (lv <= 5) return 700;
    if (lv <= 7) return 2000;
    if (lv <= 8) return 3000;
    if (lv <= 10) return 5000;
    if (lv <= 12) return 7000;
    if (lv <= 13) return 10000;
    if (lv <= 14) return 15000;
    if (lv <= 15) return 25000;
    if (lv <= 18) return 50000;
    return 70000;
  };

  const getSellPrice = (lv: number) => {
    const prices = [0, 500, 1000, 2500, 4000, 6000, 10000, 15000, 20000, 25000, 30000, 50000, 70000, 100000, 140000, 170000, 250000, 500000, 800000, 1300000, 3000000];
    return prices[lv] || 0;
  };

  const getProbability = (lv: number) => {
    if (lv <= 5) return { success: 100, fail: 0, destroy: 0 };
    if (lv <= 10) return { success: 85, fail: 15, destroy: 0 };
    if (lv <= 13) return { success: 75, fail: 25, destroy: 0 };
    if (lv <= 15) return { success: 65, fail: 30, destroy: 5 };
    if (lv === 16) return { success: 50, fail: 35, destroy: 15 };
    if (lv === 17) return { success: 40, fail: 40, destroy: 20 };
    if (lv === 18) return { success: 30, fail: 40, destroy: 30 };
    if (lv === 19) return { success: 15, fail: 45, destroy: 40 };
    return { success: 10, fail: 30, destroy: 60 };
  };

  const getZoneColor = (lv: number) => {
    if (lv >= 16) return "border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]";
    if (lv >= 11) return "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]";
    return "border-slate-600";
  };

  const handleEnhance = () => {
    const cost = getCost(level);
    if (gold < cost || level >= 20 || isEnhancing) return;

    setIsEnhancing(true);
    setResult(null);
    setGold(prev => prev - cost);
    setTotalSpent(prev => prev + cost);

    // 1. 강화 애니메이션 시작 (GSAP 타임라인 생성)
    const tl = gsap.timeline();
    
    // 처음엔 살짝 커지면서 한 바퀴 돌고, 그 뒤부턴 무한 회전!
    tl.to(weaponRef.current, { 
      scale: 1.2, 
      rotation: 360, 
      duration: 0.4, 
      ease: "power2.inOut" 
    })
    .to(weaponRef.current, { 
      rotation: "+=360", 
      repeat: -1, // 무한 반복
      duration: 0.2, 
      ease: "none" 
    });

    // 화면(카드)도 미세하게 떨리게 해서 긴장감 추가
    gsap.to(".game-card-root", { x: 2, yoyo: true, repeat: 20, duration: 0.05 });

    setTimeout(() => {
      // 애니메이션 종료 처리: 무한 회전 중지 및 원래 상태로 복구
      tl.kill(); 
      gsap.to(weaponRef.current, { 
        rotation: 0, 
        scale: 1, 
        duration: 0.3, 
        ease: "back.out(1.7)" 
      });

      const prob = getProbability(level);
      const rand = Math.random() * 100;
      const currentLevel = level;

      // 결과 판정
      if (rand < prob.success) {
        // [성공]
        setResult("success");
        setLevel(prev => prev + 1);
        setStats(prev => ({ ...prev, success: prev.success + 1 }));
        
        gsap.fromTo(flashRef.current, 
          { opacity: 0, scale: 0.5 }, 
          { opacity: 0.6, scale: 2, duration: 0.4, onComplete: () => gsap.to(flashRef.current, { opacity: 0 }) }
        );
      } else if (rand < prob.success + prob.fail) {
        // [실패]
        setResult("fail");
        if (level > 10) setLevel(prev => Math.max(0, prev - 1));
        setStats(prev => ({ ...prev, fail: prev.fail + 1 }));
        
        // 아래로 툭 떨어지는 느낌
        gsap.to(weaponRef.current, { y: 15, duration: 0.2, yoyo: true, repeat: 1 });
      } else {
        // [파괴]
        setResult("destroy");
        setStats(prev => ({ ...prev, destroy: prev.destroy + 1 }));
        
        // 화면 흔들림 크게!
        gsap.to(".game-card-root", { x: 10, yoyo: true, repeat: 8, duration: 0.05 });
        
        // 파괴 보호권 로직
        setTimeout(() => {
          if (gold >= PROTECTION_COST) {
            if (confirm(`💥 무기가 파괴되었습니다!\n🛡️ 보호권을 사용하여 +${currentLevel}을 유지하시겠습니까?\n(비용: ${PROTECTION_COST.toLocaleString()}G)`)) {
              setGold(prev => prev - PROTECTION_COST);
              setTotalSpent(prev => prev + PROTECTION_COST);
              setStats(prev => ({ ...prev, protected: prev.protected + 1 }));
              setLevel(currentLevel);
              setResult(null);
              alert("보호권으로 무기를 지켰습니다!");
            } else { setLevel(0); }
          } else { alert("골드가 부족해 무기가 소멸되었습니다."); setLevel(0); }
        }, 500);
      }
      
      setIsEnhancing(false);
    }, 1200);
  };

  const handleSell = () => {
    if (level === 0) return;
    const price = getSellPrice(level);
    if (confirm(`+${level} 무기를 ${price.toLocaleString()}G에 판매하시겠습니까?`)) {
      setGold(prev => prev + price);
      setTotalEarned(prev => prev + price);
      setStats(prev => ({ ...prev, sold: prev.sold + 1 }));
      setLevel(0);
      setResult(null);
    }
  };

  return (
    <GameLayout title="무기 강화하기">
      <div className="flex flex-col items-center gap-6 p-4 max-w-md mx-auto">
        
        {/* 골드 정보 리뉴얼 */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-slate-800 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase">My Assets</p>
            <p className="text-lg font-black text-yellow-400">{gold.toLocaleString()} G</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Cost</p>
            <p className="text-lg font-black text-orange-500">{getCost(level).toLocaleString()} G</p>
          </div>
        </div>

        {/* 메인 강화 카드 */}
        <div className={`game-card-root w-full bg-slate-800 rounded-[2rem] p-6 flex flex-col items-center gap-5 border-2 transition-all duration-500 ${getZoneColor(level)}`}>
          
          <div className="relative w-40 h-40 flex items-center justify-center bg-slate-900/50 rounded-2xl overflow-hidden shadow-inner">
            <div ref={flashRef} className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-0" />
            <div ref={weaponRef} className="z-10 w-32 h-32">
              <img src={isEnhancing ? WeaponImage : SWORD_IMAGES[level]} className={`w-full h-full object-contain ${isEnhancing ? 'animate-pulse' : ''}`} alt="sword" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-blue-500 font-black text-lg">+{level}</p>
            <h2 className="text-2xl font-bold text-white mt-1">{SWORD_NAMES[level]}</h2>
          </div>

          {/* 판매가 및 확률 정보 */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs px-1">
              <span className="text-slate-500">판매 가치</span>
              <span className="text-emerald-400 font-bold">{getSellPrice(level).toLocaleString()} G</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full" style={{ width: `${getProbability(level).success}%` }} />
              <div className="bg-orange-500 h-full" style={{ width: `${getProbability(level).fail}%` }} />
              <div className="bg-red-600 h-full" style={{ width: `${getProbability(level).destroy}%` }} />
            </div>
          </div>

          {/* 결과 메시지 */}
          <div className="h-6">
            {result === "success" && <p className="text-green-400 font-bold animate-bounce">✨ 강화 성공!</p>}
            {result === "fail" && <p className="text-orange-400 font-bold">😢 수치 하락...</p>}
            {result === "destroy" && <p className="text-red-500 font-bold uppercase">💥 Destroyed</p>}
          </div>

          {/* 버튼 세트 */}
          <div className="w-full flex gap-2">
            <button
              onClick={handleEnhance}
              disabled={isEnhancing || level >= 20 || gold < getCost(level)}
              className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
            >
              {isEnhancing ? "강화 중..." : "강화하기"}
            </button>
            <button
              onClick={handleSell}
              disabled={level === 0 || isEnhancing}
              className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
            >
              판매
            </button>
          </div>
        </div>

        {/* 보호권 안내 카드 */}
        <div className="w-full bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <div>
              <p className="text-white text-xs font-bold">파괴 보호권 자동 대기</p>
              <p className="text-[10px] text-slate-400">파괴 시 {PROTECTION_COST.toLocaleString()}G 소모</p>
            </div>
          </div>
          <span className={`text-xs font-bold ${gold >= PROTECTION_COST ? 'text-green-400' : 'text-red-400'}`}>
            {gold >= PROTECTION_COST ? "구매 가능" : "잔액 부족"}
          </span>
        </div>

        {/* 통계 섹션 (접이식 느낌으로 슬림하게) */}
        <div className="w-full bg-slate-900/50 rounded-2xl p-4 text-[11px]">
          <h3 className="text-slate-500 font-bold mb-2 tracking-widest uppercase">Performance Stats</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
            <div className="flex justify-between"><span>성공</span><span className="text-green-500">{stats.success}</span></div>
            <div className="flex justify-between"><span>실패</span><span className="text-orange-500">{stats.fail}</span></div>
            <div className="flex justify-between"><span>파괴</span><span className="text-red-500">{stats.destroy}</span></div>
            <div className="flex justify-between"><span>보호</span><span className="text-blue-400">{stats.protected}</span></div>
            <div className="col-span-2 border-t border-white/5 my-1 pt-1 flex justify-between">
              <span className="text-slate-400">순수익</span>
              <span className={`font-bold ${totalEarned - totalSpent >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {(totalEarned - totalSpent).toLocaleString()} G
              </span>
            </div>
          </div>
        </div>

        <button onClick={() => confirm("초기화하시겠습니까?") && window.location.reload()} className="text-slate-600 text-[10px] underline">RESET DATA</button>
      </div>
    </GameLayout>
  );
}











// import { useState } from "react";
// import GameLayout from "../layouts/GameLayout";

// import sword0 from "/sword0.png";
// import sword1 from "/sword1.png";
// import sword2 from "/sword2.png";
// import sword3 from "/sword3.png";
// import sword4 from "/sword4.png";
// import sword5 from "/sword5.png";
// import sword6 from "/sword6.png";
// import sword7 from "/sword7.png";
// import sword8 from "/sword8.png";
// import sword9 from "/sword9.png";
// import sword10 from "/sword10.png";
// import sword11 from "/sword11.png";
// import sword12 from "/sword12.png";
// import sword13 from "/sword13.png";
// import sword14 from "/sword14.png";
// import sword15 from "/sword15.png";
// import sword16 from "/sword16.png";
// import sword17 from "/sword17.png";
// import sword18 from "/sword18.png";
// import sword19 from "/sword19.png";
// import sword20 from "/sword20.png";
// import WeaponImage from '/weapon_w.png';

// // ============================================
// // 🎨 이미지 & 이름 설정 (여기만 수정하면 됨!)
// // ============================================

// // 검 이미지 경로 (나중에 실제 이미지로 교체!)
// const SWORD_IMAGES = [
//   sword0,   // +0
//   sword1,   // +1
//   sword2,   // +2
//   sword3,   // +3
//   sword4,   // +4
//   sword5,   // +5
//   sword6,   // +6
//   sword7,   // +7
//   sword8,   // +8
//   sword9,   // +9
//   sword10,  // +10
//   sword11,  // +11
//   sword12,  // +12
//   sword13,  // +13
//   sword14,  // +14
//   sword15,  // +15
//   sword16,  // +16
//   sword17,  // +17
//   sword18,  // +18
//   sword19,  // +19
//   sword20,  // +20
// ];

// // 검 이름 (나중에 실제 이름으로 교체!)
// const SWORD_NAMES = [
//   "주방 식칼",         // +0
//   "삼각자마다르",      // +1
//   "닌자도",            // +2
//   "한아비",            // +3
//   "텐겐 일륜도",       // +4
//   "미츠리 일륜도",     // +5
//   "귀검사의 검",       // +6
//   "그륜힐",            // +7
//   "광선검",            // +8
//   "전기 검",           // +9
//   "나스쥬로 검",       // +10
//   "염화 카타나",       // +11
//   "렌고쿠 일륜도",     // +12
//   "토르의 망치",       // +13
//   "수절포정",          // +14
//   "쿠사나기",          // +15
//   "엑스칼리버",        // +16
//   "무한의대검",        // +17
//   "황제드라몬 소드",   // +18
//   "K2 소총",          // +19
//   "태극기",           // +20
// ];

// // ============================================

// type EnhanceResult = "success" | "fail" | "destroy";

// const PROTECTION_COST = 40000; // 파괴 보호권 가격

// export default function StrengthPage() {
//   const [level, setLevel] = useState(0); // 현재 강화 단계
//   const [gold, setGold] = useState(100000); // 보유 골드
//   const [isEnhancing, setIsEnhancing] = useState(false);
//   const [result, setResult] = useState<EnhanceResult | null>(null);
//   const [totalSpent, setTotalSpent] = useState(0); // 총 소모 골드
//   const [totalEarned, setTotalEarned] = useState(0); // 총 획득 골드
  
//   // 통계
//   const [stats, setStats] = useState({
//     success: 0,
//     fail: 0,
//     destroy: 0,
//     sold: 0, // 판매 횟수
//     protected: 0, // 보호권 사용 횟수
//   });

//   // 단계별 강화 비용 (밸런스 조정!)
//   const getCost = (lv: number): number => {
//     if (lv <= 3) return 500;
//     if (lv <= 5) return 700;
//     if (lv <= 7) return 2000;
//     if (lv <= 8) return 3000;
//     if (lv <= 10) return 5000;
//     if (lv <= 12) return 7000;
//     if (lv <= 13) return 10000;
//     if (lv <= 14) return 15000;
//     if (lv <= 15) return 25000;
//     if (lv <= 18) return 50000;
//     return 70000;
//   };

//   // 단계별 판매 가격
//   const getSellPrice = (lv: number): number => {
//     const prices = [
//       0,        // +0
//       500,     // +1
//       1000,     // +2
//       2500,     // +3
//       4000,     // +4
//       6000,     // +5
//       10000,    // +6
//       15000,    // +7
//       20000,    // +8
//       25000,    // +9
//       30000,    // +10
//       50000,    // +11
//       70000,    // +12
//       100000,   // +13
//       140000,   // +14
//       170000,   // +15
//       250000,   // +16
//       500000,   // +17
//       800000,   // +18
//       1300000,  // +19
//       3000000,  // +20
//     ];
//     return prices[lv] || 0;
//   };

//   // 단계별 확률 (성공, 실패, 파괴)
//   const getProbability = (lv: number): { success: number; fail: number; destroy: number } => {
//     if (lv <= 5) return { success: 100, fail: 0, destroy: 0 };
//     if (lv <= 10) return { success: 85, fail: 15, destroy: 0 };
//     if (lv <= 13) return { success: 75, fail: 25, destroy: 0 };
//     if (lv <= 15) return { success: 65, fail: 30, destroy: 5 };
//     if (lv === 16) return { success: 50, fail: 35, destroy: 15 };
//     if (lv === 17) return { success: 40, fail: 40, destroy: 20 };
//     if (lv === 18) return { success: 30, fail: 40, destroy: 30 };
//     if (lv === 19) return { success: 15, fail: 45, destroy: 40 };
//     return { success: 10, fail: 30, destroy: 60 };
//   };

//   const getZoneName = (lv: number): string => {
//     if (lv <= 10) return "🟢";
//     if (lv <= 15) return "🟡";
//     return "🔴";
//   };

//   // const getZoneColor = (lv: number): string => {
//   //   if (lv <= 10) return "text-green-400";
//   //   if (lv <= 15) return "text-yellow-400";
//   //   return "text-red-400";
//   // };

//   const handleEnhance = () => {
//     const cost = getCost(level);
    
//     if (gold < cost) {
//       alert("골드가 부족합니다!");
//       return;
//     }

//     if (level >= 20) {
//       alert("최대 강화 단계입니다!");
//       return;
//     }

//     setIsEnhancing(true);
//     setResult(null);
    
//     // 골드 차감
//     setGold((prev) => prev - cost);
//     setTotalSpent((prev) => prev + cost);

//     // 1초 후 결과 표시
//     setTimeout(() => {
//       const prob = getProbability(level);
//       const rand = Math.random() * 100;

//       let enhanceResult: EnhanceResult;
//       const currentLevel = level; // 현재 레벨 저장
      
//       if (rand < prob.success) {
//         // 성공
//         enhanceResult = "success";
//         setLevel((prev) => prev + 1);
//         setStats((prev) => ({ ...prev, success: prev.success + 1 }));
//         setResult(enhanceResult);
//         setIsEnhancing(false);
//       } else if (rand < prob.success + prob.fail) {
//         // 실패 (하락 또는 유지)
//         enhanceResult = "fail";
//         if (level > 10) {
//           setLevel((prev) => Math.max(0, prev - 1));
//         }
//         setStats((prev) => ({ ...prev, fail: prev.fail + 1 }));
//         setResult(enhanceResult);
//         setIsEnhancing(false);
//       } else {
//         // 파괴! - 파괴 보호권 선택지 제공
//         enhanceResult = "destroy";
//         setStats((prev) => ({ ...prev, destroy: prev.destroy + 1 }));
//         setResult(enhanceResult);
//         setIsEnhancing(false);

//         // 파괴 보호권 선택 (0.5초 후)
//         setTimeout(() => {
//           if (gold >= PROTECTION_COST) {
//             const useProtection = confirm(
//               `💥 무기가 파괴되었습니다!\n\n🛡️ 파괴 보호권을 사용하시겠습니까?\n(${PROTECTION_COST.toLocaleString()}G를 지불하고 +${currentLevel} 유지)\n\n취소 시 무기가 완전히 파괴됩니다.`
//             );
            
//             if (useProtection) {
//               // 보호권 사용 - 현재 레벨 그대로 유지!
//               setGold((prev) => prev - PROTECTION_COST);
//               setTotalSpent((prev) => prev + PROTECTION_COST);
//               setStats((prev) => ({ ...prev, protected: prev.protected + 1 }));
//               setLevel(currentLevel); // 파괴 전 레벨 유지
//               setResult(null); // 결과 초기화
//               alert(`🛡️ 파괴 보호권을 사용했습니다!\n무기가 +${currentLevel}로 유지되었습니다.`);
//             } else {
//               // 보호권 사용 안함
//               setLevel(0);
//             }
//           } else {
//             // 골드 부족
//             alert(`💥 무기가 파괴되었습니다!\n\n골드가 부족하여 파괴 보호권을 사용할 수 없습니다.\n(필요: ${PROTECTION_COST.toLocaleString()}G / 보유: ${gold.toLocaleString()}G)`);
//             setLevel(0);
//           }
//         }, 500);
//       }
//     }, 1000);
//   };

//   const handleSell = () => {
//     if (level === 0) {
//       alert("판매할 수 없습니다!");
//       return;
//     }

//     const sellPrice = getSellPrice(level);
    
//     if (confirm(`+${level} 무기를 ${sellPrice.toLocaleString()}G에 판매하시겠습니까?`)) {
//       setGold((prev) => prev + sellPrice);
//       setTotalEarned((prev) => prev + sellPrice);
//       setStats((prev) => ({ ...prev, sold: prev.sold + 1 }));
//       setLevel(0);
//       setResult(null);
//     }
//   };

//   const handleReset = () => {
//     if (confirm("정말 초기화하시겠습니까?")) {
//       setLevel(0);
//       setGold(100000);
//       setTotalSpent(0);
//       setTotalEarned(0);
//       setStats({ success: 0, fail: 0, destroy: 0, sold: 0, protected: 0 });
//       setResult(null);
//     }
//   };

//   const currentCost = getCost(level);
//   const sellPrice = getSellPrice(level);
//   const prob = getProbability(level);
//   const canEnhance = gold >= currentCost && level < 20 && !isEnhancing;
//   const canSell = level > 0 && !isEnhancing;

//   return (
//     <GameLayout title="무기강화하기">
//       <div className="flex flex-col items-center gap-6 p-4">
//         {/* 골드 정보 */}
//         <div className="w-full max-w-md bg-slate-800 rounded-xl px-4 py-3">
//           <div className="flex justify-between items-center text-white">
//             <div>
//               <div className="text-sm text-slate-400">보유 골드</div>
//               <div className="text-xl font-bold text-yellow-400">
//                 {gold.toLocaleString()} G
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-slate-400">강화 비용</div>
//               <div className="text-xl font-bold text-orange-400">
//                 {currentCost.toLocaleString()} G
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 검 이미지 (임시) */}
//         <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 flex flex-col items-center gap-4">
//           {/* 검 이미지 영역 */}
//           <div className="w-44 h-44 bg-slate-700 rounded-lg flex items-center justify-center border-4 border-slate-600 relative overflow-hidden">
//             {isEnhancing ? (
//               <img 
//               src={WeaponImage} 
//               alt="강화 중"
//               className="w-24 h-24 animate-spin" 
//             />
//             ) : (
//               <>
//                 {/* ============================================ */}
//                 {/* 🎨 여기에 실제 이미지를 넣으세요! */}
//                 <img 
//                      src={SWORD_IMAGES[level]} 
//                      alt={SWORD_NAMES[level]} 
//                      className="w-full h-full object-contain"
//                    />
               
//                 {/* 임시: 이모지 사용 (실제 이미지로 교체 시 위 주석 해제) */}
//                 {/* ============================================ */}
//                 {/* <div className="text-7xl">⚔️</div> */}
//               </>
//             )}
            
//             {/* 결과 애니메이션 */}
//             {result === "success" && (
//               <div className="absolute inset-0 bg-yellow-400 animate-ping opacity-50"></div>
//             )}
//             {result === "destroy" && (
//               <div className="absolute inset-0 bg-red-600 animate-pulse opacity-50"></div>
//             )}
//           </div>

//           {/* 검 이름 & 강화 단계 */}
//           <div className="flex justify-center items-center">.
//               <div className="text-2xl font-bold text-blue-400 mr-2">
//               {getZoneName(level)} 
//                   +{level} 
//               </div>
//               <div className="text-2xl font-bold text-white">
//                   {SWORD_NAMES[level]}
//               </div>
//           </div>

//           {/* 판매 가격 표시 */}
//           {level > 0 && (
//             <div className="bg-slate-700 rounded-lg px-4 py-2">
//               <div className="text-green-400 text-sm">💰 판매 가격</div>
//               <div className="text-yellow-400 text-xl font-bold">
//                 {sellPrice.toLocaleString()} G
//               </div>
//             </div>
//           )}

//           {/* 결과 메시지 */}
//           {result && (
//             <div className="text-center animate-bounce">
//               {result === "success" && (
//                 <div className="text-xl font-bold text-green-400">
//                   ✨ 강화 성공! +{level} 달성!
//                 </div>
//               )}
//               {result === "fail" && (
//                 <div className="text-xl font-bold text-orange-400">
//                   😢 강화 실패... {level > 10 ? "1단계 하락" : "수치 유지"}
//                 </div>
//               )}
//               {result === "destroy" && (
//                 <div className="text-xl font-bold text-red-400">
//                   💥 무기가 파괴되었습니다!
//                 </div>
//               )}
//             </div>
//           )}

//           {/* 확률 정보 */}
//           {level < 20 && (
//             <div className="w-full bg-slate-700 rounded-lg p-4">
//               <div className="text-white text-sm space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-green-400">✅ 성공 확률:</span>
//                   <span className="font-bold">{prob.success}%</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-orange-400">⚠️ 실패 확률:</span>
//                   <span className="font-bold">{prob.fail}%</span>
//                 </div>
//                 {prob.destroy > 0 && (
//                   <div className="flex justify-between">
//                     <span className="text-red-400">💥 파괴 확률:</span>
//                     <span className="font-bold">{prob.destroy}%</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* 20강 달성 */}
//           {level === 20 && (
//             <div className="text-center">
//               <div className="text-4xl font-bold text-yellow-400 animate-pulse">
//                 🎉 최대 강화 달성! 🎉
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 버튼 */}
//         <div className="flex gap-4">
//           <button
//             onClick={handleEnhance}
//             disabled={!canEnhance}
//             className={`px-6 py-4 text-sm font-bold rounded-xl transition-all transform ${
//               canEnhance
//                 ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105"
//                 : "bg-slate-600 text-slate-400 cursor-not-allowed"
//             }`}
//           >
//             {isEnhancing ? "강화 중..." : "강화하기"}
//           </button>
          
//           <button
//             onClick={handleSell}
//             disabled={!canSell}
//             className={`px-6 py-4 text-sm font-bold rounded-xl transition-all transform ${
//               canSell
//                 ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105"
//                 : "bg-slate-600 text-slate-400 cursor-not-allowed"
//             }`}
//           >
//             판매하기
//           </button>

//           <button
//             onClick={handleReset}
//             className="px-6 py-4 bg-slate-700 text-white text-sm font-bold rounded-xl hover:bg-slate-600 transition-all"
//           >
//             리셋
//           </button>
//         </div>

//         {/* 파괴 보호권 안내 */}
//         <div className="w-full max-w-md bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg px-3 py-2 border border-blue-500">
//           <div className="flex items-center justify-between text-white text-sm">
//             <div className="flex items-center gap-2">
//               <span className="text-xl">🛡️</span>
//               <span className="font-semibold">파괴 보호권</span>
//             </div>
//             <div className="text-yellow-400 font-bold">
//               {PROTECTION_COST.toLocaleString()} G
//             </div>
//           </div>
//           <div className="text-slate-300 text-xs mt-1">
//             파괴 시 선택 가능 (현재 강화 단계 유지)
//           </div>
//         </div>

//         {/* 통계 */}
//         <div className="w-full max-w-md bg-slate-800 rounded-xl p-4">
//           <div className="text-white text-sm space-y-2">
//             <div className="text-lg font-bold text-slate-300 mb-3">📊 통계</div>
//             <div className="flex justify-between">
//               <span className="text-green-400">성공:</span>
//               <span className="font-bold">{stats.success}회</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-orange-400">실패:</span>
//               <span className="font-bold">{stats.fail}회</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-red-400">파괴:</span>
//               <span className="font-bold">{stats.destroy}회</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-blue-400">🛡️ 보호권 사용:</span>
//               <span className="font-bold">{stats.protected}회</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-emerald-400">판매:</span>
//               <span className="font-bold">{stats.sold}회</span>
//             </div>
//             <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
//               <span className="text-red-300">총 소모 골드:</span>
//               <span className="font-bold text-red-300">
//                 {totalSpent.toLocaleString()} G
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-green-300">총 획득 골드:</span>
//               <span className="font-bold text-green-300">
//                 {totalEarned.toLocaleString()} G
//               </span>
//             </div>
//             <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
//               <span className="text-yellow-400">순이익:</span>
//               <span className={`font-bold ${totalEarned - totalSpent >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
//                 {(totalEarned - totalSpent >= 0 ? '+' : '')}{(totalEarned - totalSpent).toLocaleString()} G
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </GameLayout>
//   );
// }