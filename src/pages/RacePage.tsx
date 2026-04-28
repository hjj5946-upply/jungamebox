import { useState, useEffect, useRef, useLayoutEffect } from "react";
import GameLayout from "../layouts/GameLayout";
import { gsap } from "gsap";

// 이미지 import (경로는 기존과 동일하게 유지)
import stamp1 from "/stamp1.png";
import stamp2 from "/stamp2.png";
import stamp3 from "/stamp3.png";
import stamp4 from "/stamp4.png";
import stamp5 from "/stamp5.png";
import stamp6 from "/stamp6.png";
import stamp7 from "/stamp7.png";
import stamp8 from "/stamp8.png";
import stamp9 from "/stamp9.png";
import stamp10 from "/stamp10.png";

type Step = "select-count" | "input-names" | "countdown" | "racing" | "result";

type Racer = {
  id: number;
  name: string;
  position: number;
  speed: number;
  image: string;
  finishOrder: number | null;
};

const racerImages = [stamp1, stamp2, stamp3, stamp4, stamp5, stamp6, stamp7, stamp8, stamp9, stamp10];

export default function RacePage() {
  const [step, setStep] = useState<Step>("select-count");
  const [playerCount, setPlayerCount] = useState(0);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [countdown, setCountdown] = useState(3);
  const raceIntervalRef = useRef<number | null>(null);
  const scope = useRef(null);

  // 1. 단계 전환 시 애니메이션
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-in-element", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1
      });
    }, scope);
    return () => ctx.revert();
  }, [step]);

  // 2. 카운트다운 효과 보강
  useEffect(() => {
    if (step === "countdown") {
      if (countdown > 0) {
        gsap.fromTo(".countdown-text", 
          { scale: 2, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
        );
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => {
          setStep("racing");
          startRace();
        }, 500);
      }
    }
  }, [step, countdown]);

  const handleCountSelect = (count: number) => {
    setPlayerCount(count);
    const shuffledImages = [...racerImages].sort(() => Math.random() - 0.5);
    const newRacers = Array.from({ length: count }, (_, i) => ({
      id: i,
      name: "",
      position: 0,
      speed: 0,
      image: shuffledImages[i],
      finishOrder: null,
    }));
    setRacers(newRacers);
    setStep("input-names");
  };

  const handleNameChange = (id: number, name: string) => {
    if (name.length <= 4) {
      setRacers(racers.map((r) => (r.id === id ? { ...r, name } : r)));
    }
  };

  const startCountdown = () => {
    if (racers.some((r) => r.name.trim() === "")) {
      alert("모든 참가자의 이름을 입력해주세요!");
      return;
    }
    const withSpeed = racers.map((r) => ({
      ...r,
      speed: 0.5 + Math.random() * 1.8, // 속도 편차 약간 증가
    }));
    setRacers(withSpeed);
    setCountdown(3);
    setStep("countdown");
  };

  const startRace = () => {
    raceIntervalRef.current = window.setInterval(() => {
      setRacers((prev) => {
        let updated = prev.map((racer) => {
          if (racer.finishOrder !== null) return racer;
          // 매 프레임 속도에 약간의 노이즈를 줘서 역전이 빈번하게 발생하도록 함
          const jitter = (Math.random() - 0.5) * 0.5;
          return { ...racer, position: racer.position + racer.speed + jitter };
        });

        const newFinishers = updated
          .filter((r) => r.position >= 100 && r.finishOrder === null)
          .sort((a, b) => b.position - a.position);

        const maxOrder = Math.max(0, ...updated.map((r) => r.finishOrder || 0));

        newFinishers.forEach((finisher, index) => {
          const racerIndex = updated.findIndex((r) => r.id === finisher.id);
          if (racerIndex !== -1) {
            updated[racerIndex] = {
              ...updated[racerIndex],
              position: 100,
              finishOrder: maxOrder + index + 1,
            };
            // 1등 진입 시 쾌감 연출
            if (maxOrder + index + 1 === 1) {
              gsap.to(".race-track-container", { x: 5, yoyo: true, repeat: 5, duration: 0.05 });
            }
          }
        });

        if (updated.every((r) => r.finishOrder !== null)) {
          if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
          setTimeout(() => setStep("result"), 1200);
        }
        return updated;
      });
    }, 50);
  };

  const reset = () => {
    setStep("select-count");
    setPlayerCount(0);
    setRacers([]);
    setCountdown(3);
    if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
  };

  return (
    <GameLayout title="1빠 정하기 레이스 | J GameBox">
      <div ref={scope} className="flex flex-col h-full overflow-hidden">
        
        {/* 1단계: 인원수 선택 */}
        {step === "select-count" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 fade-in-element">
            <h2 className="text-white text-2xl font-bold">참가 인원을 선택하세요</h2>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => handleCountSelect(count)}
                  className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-xl shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  {count}명
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2단계: 이름 입력 */}
        {step === "input-names" && (
          <div className="flex-1 flex flex-col gap-4 p-4 fade-in-element">
            <h2 className="text-white text-xl font-bold text-center">참가자 이름을 입력하세요</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {racers.map((racer, index) => (
                <div key={racer.id} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
                  <img src={racer.image} alt="racer icon" className="w-12 h-12 object-contain" />
                  <input
                    type="text"
                    value={racer.name}
                    onChange={(e) => handleNameChange(racer.id, e.target.value)}
                    placeholder={`${index + 1}번 참가자`}
                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    maxLength={4}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("select-count")} className="px-6 py-4 bg-slate-700 text-white rounded-xl font-bold">뒤로</button>
              <button onClick={startCountdown} className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl shadow-[0_4px_0_rgb(22,101,52)] active:translate-y-1 active:shadow-none transition-all">레이스 시작!</button>
            </div>
          </div>
        )}

        {/* 3단계: 카운트다운 */}
        {step === "countdown" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="countdown-text text-white text-9xl font-black italic">
              {countdown > 0 ? countdown : "GO!"}
            </div>
          </div>
        )}

        {/* 4단계: 레이싱 */}
        {step === "racing" && (
          <div className="flex-1 flex flex-col justify-center gap-2 py-4 px-2 race-track-container">
            {racers.map((racer) => (
              <div key={racer.id} className="relative group">
                <div className="h-14 bg-slate-900/80 rounded-full relative border border-slate-700 shadow-inner">
                  {/* 피니시 라인 */}
                  <div className="absolute right-8 top-0 bottom-0 w-4 bg-[repeating-linear-gradient(45deg,#000,#000_5px,#fff_5px,#fff_10px)] opacity-30"></div>
                  
                  {/* 캐릭터 */}
                  <div
                    className="absolute top-0 bottom-0 flex items-center transition-all duration-75"
                    style={{ left: `${Math.min(racer.position, 88)}%` }}
                  >
                    <div className="relative">
                      <img src={racer.image} alt={racer.name} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">
                        {racer.name}
                      </div>
                    </div>
                  </div>
                </div>
                {racer.finishOrder && (
                  <div className="absolute -right-1 -top-1 bg-yellow-400 text-black font-black w-8 h-8 flex items-center justify-center rounded-full border-2 border-white rotate-12 text-xs shadow-lg">
                    {racer.finishOrder}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 5단계: 결과 */}
        {step === "result" && (
          <div className="flex-1 flex flex-col gap-4 p-4 fade-in-element">
            <h2 className="text-white text-3xl font-black text-center mb-2 italic">RANKING</h2>
            <div className="flex-1 overflow-y-auto space-y-3">
              {[...racers]
                .sort((a, b) => (a.finishOrder || 0) - (b.finishOrder || 0))
                .map((racer) => {
                  const isFirst = racer.finishOrder === 1;
                  const isLast = racer.finishOrder === playerCount;
                  
                  let medalColor = "bg-slate-700";
                  if (isFirst) medalColor = "bg-gradient-to-r from-yellow-300 to-yellow-600 shadow-[0_0_15px_rgba(251,191,36,0.4)]";
                  else if (racer.finishOrder === 2) medalColor = "bg-gradient-to-r from-slate-300 to-slate-500";
                  else if (racer.finishOrder === 3) medalColor = "bg-gradient-to-r from-orange-400 to-orange-700";

                  return (
                    <div key={racer.id} className={`flex items-center gap-4 px-4 py-4 rounded-2xl ${medalColor} transition-transform hover:scale-[1.02]`}>
                      <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center text-white font-black text-xl border border-white/20">
                        {racer.finishOrder}
                      </div>
                      <img src={racer.image} alt="winner" className="w-12 h-12 object-contain" />
                      <div className="flex-1">
                        <div className="text-white text-xl font-bold drop-shadow-sm">{racer.name}</div>
                        {isLast && <div className="text-black/60 text-xs font-bold mt-0.5 animate-pulse">응 너 꼴찌 ㅋㅋ</div>}
                      </div>
                      {isFirst && <span className="text-2xl">👑</span>}
                    </div>
                  );
                })}
            </div>
            <button onClick={reset} className="py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95">다시 하기</button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}