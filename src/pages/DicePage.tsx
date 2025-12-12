import { useState, useEffect, useRef } from "react";
import planck from "planck-js";
import GameLayout from "../layouts/GameLayout";

interface Dice {
  id: number;
  value: number;
  x: number;
  y: number;
  rotation: number;
  finalRotation?: { x: number; y: number; z: number };
  body?: planck.Body;
}

export default function DicePage() {
  const [diceList, setDiceList] = useState<Dice[]>([
    { id: 1, value: 1, x: 0, y: 0, rotation: 0 }
  ]);
  const [isRolling, setIsRolling] = useState(false);
  const worldRef = useRef<planck.World | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Planck.js 물리 세계 초기화
  useEffect(() => {
    const world = planck.World({
      gravity: planck.Vec2(0, 20)
    });

    // 바닥
    const ground = world.createBody({
      position: planck.Vec2(0, 6)
    });
    ground.createFixture(planck.Edge(planck.Vec2(-10, 0), planck.Vec2(10, 0)), {
      friction: 0.5,
      restitution: 0.3
    });

    // 왼쪽 벽
    const leftWall = world.createBody({
      position: planck.Vec2(-10, 0)
    });
    leftWall.createFixture(planck.Edge(planck.Vec2(0, -6), planck.Vec2(0, 6)), {
      friction: 0.4,
      restitution: 0.4
    });

    // 오른쪽 벽
    const rightWall = world.createBody({
      position: planck.Vec2(10, 0)
    });
    rightWall.createFixture(planck.Edge(planck.Vec2(0, -6), planck.Vec2(0, 6)), {
      friction: 0.4,
      restitution: 0.4
    });

    // 천장
    const ceiling = world.createBody({
      position: planck.Vec2(0, -6)
    });
    ceiling.createFixture(planck.Edge(planck.Vec2(-10, 0), planck.Vec2(10, 0)), {
      friction: 0.4,
      restitution: 0.2
    });

    worldRef.current = world;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 주사위 값에 따른 최종 회전 (정면에 결과값이 보이도록)
  const getFinalRotation = (value: number) => {
    const rotations: { [key: number]: { x: number; y: number; z: number } } = {
      1: { x: 0, y: 0, z: 0 },
      2: { x: 0, y: 180, z: 0 },
      3: { x: 0, y: -90, z: 0 },
      4: { x: 0, y: 90, z: 0 },
      5: { x: -90, y: 0, z: 0 },
      6: { x: 90, y: 0, z: 0 }
    };
    return rotations[value];
  };

  // 주사위 개수 추가
  const addDice = () => {
    if (diceList.length >= 5) {
      setDiceList([{ id: 1, value: 1, x: 0, y: 0, rotation: 0 }]);
      return;
    }
    const newDice: Dice = {
      id: Date.now(),
      value: 1,
      x: 0,
      y: 0,
      rotation: 0
    };
    setDiceList([...diceList, newDice]);
  };

  // 주사위 개수 제거
  const removeDice = () => {
    if (diceList.length > 1) {
      setDiceList(diceList.slice(0, -1));
    }
  };

  // 주사위 굴리기
  const rollDice = () => {
    if (isRolling || !worldRef.current) return;
    
    setIsRolling(true);

    // 기존 주사위 body 제거
    diceList.forEach(dice => {
      if (dice.body) {
        worldRef.current?.destroyBody(dice.body);
      }
    });

    // 새로운 주사위 생성
    const newDice = diceList.map((dice, index) => {
      const spacing = 1.5;
      const startX = (index - (diceList.length - 1) / 2) * spacing;
      
      const body = worldRef.current!.createDynamicBody({
        position: planck.Vec2(startX, -5),
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 18,
        linearVelocity: planck.Vec2(
          (Math.random() - 0.5) * 6,
          Math.random() * -3
        )
      });

      body.createFixture(planck.Box(0.35, 0.35), {
        density: 1.5,
        friction: 0.5,
        restitution: 0.4
      });

      const finalValue = Math.floor(Math.random() * 6) + 1;

      return {
        ...dice,
        body,
        value: finalValue,
        finalRotation: undefined
      };
    });

    setDiceList(newDice);

    // 물리 시뮬레이션 시작
    let inactiveFrames = 0;

    const simulate = () => {
      if (!worldRef.current) return;

      worldRef.current.step(1 / 60);

      let allStopped = true;
      
      setDiceList(prev => prev.map(dice => {
        if (!dice.body) return dice;
        
        const pos = dice.body.getPosition();
        const angle = dice.body.getAngle();
        const vel = dice.body.getLinearVelocity();
        const angVel = dice.body.getAngularVelocity();
        
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        if (speed > 0.01 || Math.abs(angVel) > 0.01) {
          allStopped = false;
        }
        
        return {
          ...dice,
          x: pos.x * 45,
          y: pos.y * 45,
          rotation: angle * (180 / Math.PI)
        };
      }));

      if (allStopped) {
        inactiveFrames++;
        if (inactiveFrames > 60) {
          setDiceList(prev => prev.map(dice => ({
            ...dice,
            finalRotation: getFinalRotation(dice.value)
          })));
          setIsRolling(false);
          return;
        }
      } else {
        inactiveFrames = 0;
      }

      animationRef.current = requestAnimationFrame(simulate);
    };

    simulate();
  };

  // 모바일 흔들기 감지
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = Date.now();

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const currentTime = Date.now();
      if (currentTime - lastTime < 100) return;

      const deltaX = Math.abs((acc.x || 0) - lastX);
      const deltaY = Math.abs((acc.y || 0) - lastY);
      const deltaZ = Math.abs((acc.z || 0) - lastZ);

      if (deltaX + deltaY + deltaZ > 30) {
        rollDice();
      }

      lastX = acc.x || 0;
      lastY = acc.y || 0;
      lastZ = acc.z || 0;
      lastTime = currentTime;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isRolling]);

  return (
    <GameLayout title="주사위">
      <div className="flex flex-col h-full">
        
        {/* 주사위 개수 조절 */}
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={removeDice}
            className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold transition-colors disabled:opacity-50"
            disabled={diceList.length <= 1}
          >
            -
          </button>
          <span className="text-white text-xl font-bold min-w-[80px] text-center">
            {diceList.length}개
          </span>
          <button
            onClick={addDice}
            className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold transition-colors"
          >
            +
          </button>
        </div>

        {/* 주사위 캔버스 영역 - 화면 전체 */}
        <div 
          ref={canvasRef}
          className="relative flex-1 bg-gradient-to-b from-slate-800 to-slate-900 cursor-pointer overflow-hidden"
          onClick={rollDice}
        >
          {diceList.map((dice) => {
            const rotationStyle = dice.finalRotation
              ? `rotateX(${dice.finalRotation.x}deg) rotateY(${dice.finalRotation.y}deg) rotateZ(${dice.finalRotation.z}deg)`
              : `rotateX(${dice.rotation * 2}deg) rotateY(${dice.rotation * 3}deg) rotateZ(${dice.rotation}deg)`;

            return (
              <div
                key={dice.id}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(calc(-50% + ${dice.x}px), calc(-50% + ${dice.y}px))`,
                  transition: dice.finalRotation ? 'transform 0.5s ease-out' : 'transform 0.016s linear'
                }}
              >
                <div 
                  className="relative w-20 h-20"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: rotationStyle,
                    transition: dice.finalRotation ? 'transform 0.5s ease-out' : 'none'
                  }}
                >
                  <DiceFace value={1} position="front" />
                  <DiceFace value={2} position="back" />
                  <DiceFace value={3} position="right" />
                  <DiceFace value={4} position="left" />
                  <DiceFace value={5} position="top" />
                  <DiceFace value={6} position="bottom" />
                </div>
              </div>
            );
          })}

          {isRolling && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-slate-400 text-lg pointer-events-none">
              굴리는 중...
            </div>
          )}

          {/* 합계 표시 - 화면 하단 */}
          {!isRolling && diceList.some(d => d.x !== 0 || d.y !== 0) && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-4xl font-bold animate-bounce pointer-events-none">
              {diceList.length > 1 && `합계: `}
              {diceList.reduce((sum, dice) => sum + dice.value, 0)}
            </div>
          )}
        </div>

        {/* 안내 텍스트 */}
        <div className="text-slate-400 text-sm text-center py-4">
          화면 클릭 또는 터치로 주사위를 굴리세요
        </div>
      </div>
    </GameLayout>
  );
}

// 주사위 한 면 컴포넌트
function DiceFace({ value, position }: { value: number; position: string }) {
  const transforms: { [key: string]: string } = {
    front: 'translateZ(40px)',
    back: 'rotateY(180deg) translateZ(40px)',
    right: 'rotateY(90deg) translateZ(40px)',
    left: 'rotateY(-90deg) translateZ(40px)',
    top: 'rotateX(90deg) translateZ(40px)',
    bottom: 'rotateX(-90deg) translateZ(40px)'
  };

  return (
    <div
      className="absolute w-20 h-20 bg-gradient-to-br from-white to-gray-200 border-2 border-gray-800 rounded-xl shadow-2xl flex items-center justify-center"
      style={{
        transform: transforms[position],
        backfaceVisibility: 'hidden'
      }}
    >
      <DiceDots value={value} />
    </div>
  );
}

// 주사위 점 렌더링
function DiceDots({ value }: { value: number }) {
  const renderDot = (key: number, isOne: boolean = false) => (
    <div
      key={key}
      className={`w-3 h-3 rounded-full shadow-inner ${
        isOne ? 'bg-red-600' : 'bg-gray-800'
      }`}
    />
  );

  const layouts: { [key: number]: React.ReactElement } = {
    1: (
      <div className="grid place-items-center w-full h-full">
        {renderDot(0, true)}
      </div>
    ),
    2: (
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full p-2.5">
        <div className="col-start-1 row-start-1">{renderDot(0)}</div>
        <div className="col-start-3 row-start-3">{renderDot(1)}</div>
      </div>
    ),
    3: (
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full p-2.5">
        <div className="col-start-1 row-start-1">{renderDot(0)}</div>
        <div className="col-start-2 row-start-2">{renderDot(1)}</div>
        <div className="col-start-3 row-start-3">{renderDot(2)}</div>
      </div>
    ),
    4: (
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full p-2.5">
        <div className="col-start-1 row-start-1">{renderDot(0)}</div>
        <div className="col-start-3 row-start-1">{renderDot(1)}</div>
        <div className="col-start-1 row-start-3">{renderDot(2)}</div>
        <div className="col-start-3 row-start-3">{renderDot(3)}</div>
      </div>
    ),
    5: (
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full p-2.5">
        <div className="col-start-1 row-start-1">{renderDot(0)}</div>
        <div className="col-start-3 row-start-1">{renderDot(1)}</div>
        <div className="col-start-2 row-start-2">{renderDot(2)}</div>
        <div className="col-start-1 row-start-3">{renderDot(3)}</div>
        <div className="col-start-3 row-start-3">{renderDot(4)}</div>
      </div>
    ),
    6: (
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full p-2.5">
        <div className="col-start-1 row-start-1">{renderDot(0)}</div>
        <div className="col-start-3 row-start-1">{renderDot(1)}</div>
        <div className="col-start-1 row-start-2">{renderDot(2)}</div>
        <div className="col-start-3 row-start-2">{renderDot(3)}</div>
        <div className="col-start-1 row-start-3">{renderDot(4)}</div>
        <div className="col-start-3 row-start-3">{renderDot(5)}</div>
      </div>
    )
  };

  return layouts[value] || layouts[1];
}