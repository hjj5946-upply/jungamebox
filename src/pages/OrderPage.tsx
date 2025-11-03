//src/pages/OrderPage.tsx
import { useState, useEffect, useRef } from "react";
import GameLayout from "../layouts/GameLayout";

// 이미지 import
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
  position: number; // 0~100 (%)
  speed: number;
  image: string; // emoji → image로 변경
  finishOrder: number | null;
};

const racerImages = [stamp1, stamp2, stamp3, stamp4, stamp5, stamp6, stamp7, stamp8, stamp9, stamp10];

export default function OrderPage() {
  const [step, setStep] = useState<Step>("select-count");
  const [playerCount, setPlayerCount] = useState(0);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [countdown, setCountdown] = useState(3);
  const raceIntervalRef = useRef<number | null>(null);

  // 메달 색상 정의
  const medalColors = {
    first: { from: '#FFD700', to: '#FFA500' },   // 금색
    second: { from: '#C0C0C0', to: '#A9A9A9' },  // 은색
    third: { from: '#CD7F32', to: '#B8860B' },   // 동색
  };

  // 카운트다운 효과
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === "countdown" && countdown === 0) {
      setTimeout(() => {
        setStep("racing");
        startRace();
      }, 500);
    }
  }, [step, countdown]);

  const handleCountSelect = (count: number) => {
    setPlayerCount(count);
    // 랜덤 이미지 배정
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
    const allNamed = racers.every((r) => r.name.trim() !== "");
    if (!allNamed) {
      alert("모든 참가자의 이름을 입력해주세요!");
      return;
    }
    // 랜덤 속도 배정
    const withSpeed = racers.map((r) => ({
      ...r,
      speed: 0.5 + Math.random() * 1.5, // 0.5~2.0 사이 랜덤 속도
    }));
    setRacers(withSpeed);
    setCountdown(3);
    setStep("countdown");
  };

  const startRace = () => {
    raceIntervalRef.current = window.setInterval(() => {
      setRacers((prev) => {
        // 1. 먼저 위치만 업데이트
        let updated = prev.map((racer) => {
          if (racer.finishOrder !== null) {
            return racer; // 이미 결승한 선수
          }
          return { ...racer, position: racer.position + racer.speed };
        });

        // 2. 이번 프레임에 새로 결승한 선수들 찾기
        const newFinishers = updated.filter(
          (r) => r.position >= 100 && r.finishOrder === null
        );

        // 3. 새로 결승한 선수들을 position 기준으로 정렬 (더 많이 간 사람이 먼저)
        newFinishers.sort((a, b) => b.position - a.position);

        // 4. 현재 최고 순위 찾기
        const maxOrder = Math.max(0, ...updated.map((r) => r.finishOrder || 0));

        // 5. 순위 부여
        newFinishers.forEach((finisher, index) => {
          const racerIndex = updated.findIndex((r) => r.id === finisher.id);
          if (racerIndex !== -1) {
            updated[racerIndex] = {
              ...updated[racerIndex],
              position: 100,
              finishOrder: maxOrder + index + 1,
            };
          }
        });

        // 6. 모두 결승 확인
        const allFinished = updated.every((r) => r.finishOrder !== null);
        if (allFinished) {
          if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
          setTimeout(() => setStep("result"), 1000);
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
    <GameLayout title="1빠정하기">
      <div className="flex flex-col h-full">
        {/* 1단계: 인원수 선택 */}
        {step === "select-count" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-white text-2xl font-bold">참가 인원을 선택하세요</div>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => handleCountSelect(count)}
                  className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-xl transition-colors"
                >
                  {count}명
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2단계: 이름 입력 */}
        {step === "input-names" && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-white text-xl font-bold text-center">
              참가자 이름을 입력하세요 (최대 4글자)
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {racers.map((racer, index) => (
                <div key={racer.id} className="flex items-center gap-3">
                  <img src={racer.image} alt={`racer-${index + 1}`} className="w-12 h-12 object-contain" />
                  <input
                    type="text"
                    value={racer.name}
                    onChange={(e) => handleNameChange(racer.id, e.target.value)}
                    placeholder={`${index + 1}번 참가자`}
                    maxLength={4}
                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg placeholder-slate-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("select-count")}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                뒤로
              </button>
              <button
                onClick={startCountdown}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        {/* 3단계: 카운트다운 */}
        {step === "countdown" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-9xl font-bold animate-bounce">
              {countdown > 0 ? countdown : "GO!"}
            </div>
          </div>
        )}

        {/* 4단계: 레이싱 */}
        {step === "racing" && (
          <div className="flex-1 flex flex-col justify-center gap-3 py-4">
            {racers.map((racer) => (
              <div key={racer.id} className="relative">
                {/* 트랙 */}
                <div className="h-12 bg-slate-800 rounded-lg relative overflow-hidden">
                  {/* 결승선 */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-400"></div>
                  
                  {/* 레이서 */}
                  <div
                    className="absolute top-0 bottom-0 flex items-center transition-all duration-100"
                    style={{ left: `${Math.min(racer.position, 95)}%` }}
                  >
                    <img src={racer.image} alt="racer" className="w-10 h-10 object-contain" />
                  </div>
                </div>
                
                {/* 이름 */}
                <div className="text-white text-sm mt-1">{racer.name}</div>
                
                {/* 순위 표시 */}
                {racer.finishOrder && (
                  <div className="absolute right-2 top-2 bg-yellow-400 text-slate-900 font-bold px-2 py-1 rounded-full text-sm">
                    {racer.finishOrder}위
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 5단계: 결과 */}
        {step === "result" && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-white text-2xl font-bold text-center">
              🏁 레이스 결과
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {[...racers]
                .sort((a, b) => (a.finishOrder || 0) - (b.finishOrder || 0))
                .map((racer) => {
                  const isLastPlace = racer.finishOrder === playerCount;
                  
                  // 순위별 스타일 결정
                  let bgStyle = {};
                  if (racer.finishOrder === 1) {
                    bgStyle = {
                      background: `linear-gradient(to right, ${medalColors.first.from}, ${medalColors.first.to})`
                    };
                  } else if (racer.finishOrder === 2) {
                    bgStyle = {
                      background: `linear-gradient(to right, ${medalColors.second.from}, ${medalColors.second.to})`
                    };
                  } else if (racer.finishOrder === 3) {
                    bgStyle = {
                      background: `linear-gradient(to right, ${medalColors.third.from}, ${medalColors.third.to})`
                    };
                  }

                  return (
                    <div
                      key={racer.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700"
                      style={racer.finishOrder && racer.finishOrder <= 3 ? bgStyle : {}}
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 font-bold text-lg">
                        {racer.finishOrder}
                      </div>
                      <img src={racer.image} alt="racer" className="w-10 h-10 object-contain" />
                      <div className="flex-1">
                        <div className="text-white text-lg font-semibold">
                          {racer.name}
                        </div>
                        {isLastPlace && (
                          <div className="text-red-300 text-sm mt-1">
                            응 너 꼴찌 ㅋㅋ
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={reset}
              className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
            >
              다시하기
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}