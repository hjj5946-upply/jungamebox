// src/components/pinball/PinballCanvas.tsx
import { useEffect, useRef } from "react";
import planck, { Vec2, World, Body } from "planck-js";

export type BallSpec = {
  name: string;
  color: string;
};

type PinballCanvasProps = {
  balls: BallSpec[];
  onWinner: (name: string) => void;
};

const SCALE = 50; // 1m -> 50px

export default function PinballCanvas({ balls, onWinner }: PinballCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 보이는 화면 크기
    const width = 360;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const world: World = new planck.World({
      gravity: Vec2(0, 7.5), // 약간 줄여서 너무 빨리 안 떨어지게
    });

    const visibleH = height / SCALE;   // 화면에 보이는 월드 높이
    const worldH = visibleH * 2.6;     // 실제 월드 높이(꽤 길게)
    const w = width / SCALE;

    const wallThickness = 0.2;

    // 바닥 (골 레인 아래)
    {
      const body = world.createBody();
      body.createFixture(planck.Box(w / 2, wallThickness), {
        friction: 0.3,
        restitution: 0.2,
      });
      body.setPosition(Vec2(w / 2, worldH + wallThickness));
    }

    // 왼쪽 전체 벽
    {
      const body = world.createBody();
      body.createFixture(planck.Box(wallThickness, worldH), {
        friction: 0.3,
      });
      body.setPosition(Vec2(-wallThickness, worldH / 2));
    }

    // 오른쪽 전체 벽
    {
      const body = world.createBody();
      body.createFixture(planck.Box(wallThickness, worldH), {
        friction: 0.3,
      });
      body.setPosition(Vec2(w + wallThickness, worldH / 2));
    }

    // 핀(peg) 삼각형 배열
    const rows = 18;
    const cols = 10;
    const pegRadius = 0.08;
    const topOffsetY = 0.8;
    const bottomOffsetY = 2.0; // 골인 레인 위까지 확보
    const spacingX = w / (cols + 1);
    const spacingY =
      (worldH - topOffsetY - bottomOffsetY) / (rows > 1 ? rows - 1 : 1);

    for (let row = 0; row < rows; row++) {
      const y = topOffsetY + row * spacingY;
      for (let col = 0; col < cols; col++) {
        const xOffset = row % 2 === 0 ? 0 : spacingX / 2;
        const x = spacingX + col * spacingX + xOffset;

        const pegBody = world.createBody({
          position: Vec2(x, y),
        });
        pegBody.createFixture(planck.Circle(pegRadius), {
          density: 0,
          friction: 0,
          restitution: 0.35,
        });
      }
    }

    // 🔽 골 레인 (좁은 길) 만들기
    const laneWidth = w * 0.25;
    const laneCenterX = w / 2;
    const laneHeight = 1.2;       // 골 레인 높이
    const laneTopY = worldH - laneHeight - 0.4; // 살짝 위에서 시작
    const goalY = laneTopY + laneHeight * 0.9;  // 골판정 line (아래쪽)

    // 좌우 가이드 벽 (깔때기형 느낌)
    {
      const guideThickness = 0.15;

      // 위쪽에서 내려오는 경사 가이드
      const leftGuide = world.createBody();
      leftGuide.createFixture(planck.Box(guideThickness, laneHeight / 1.5));
      leftGuide.setPosition(
        Vec2(laneCenterX - laneWidth, laneTopY - laneHeight / 2)
      );
      leftGuide.setAngle(0.25); // 약간 기울여서 안쪽으로

      const rightGuide = world.createBody();
      rightGuide.createFixture(planck.Box(guideThickness, laneHeight / 1.5));
      rightGuide.setPosition(
        Vec2(laneCenterX + laneWidth, laneTopY - laneHeight / 2)
      );
      rightGuide.setAngle(-0.25);
    }

    // 골 레인 좌우 수직 벽
    {
      const laneWallThickness = 0.1;

      const leftLaneWall = world.createBody();
      leftLaneWall.createFixture(
        planck.Box(laneWallThickness, laneHeight / 2),
        { friction: 0.3 }
      );
      leftLaneWall.setPosition(
        Vec2(laneCenterX - laneWidth / 2, laneTopY + laneHeight / 2)
      );

      const rightLaneWall = world.createBody();
      rightLaneWall.createFixture(
        planck.Box(laneWallThickness, laneHeight / 2),
        { friction: 0.3 }
      );
      rightLaneWall.setPosition(
        Vec2(laneCenterX + laneWidth / 2, laneTopY + laneHeight / 2)
      );
    }

    // 🔽 공 스폰
    const dynamicBalls: Body[] = [];
    let spawnIndex = 0;
    let spawnIntervalId: number | null = null;

    const spawnNextBall = () => {
      if (spawnIndex >= balls.length) return;

      const spec = balls[spawnIndex];
      spawnIndex += 1;

      const startX = w * 0.5 + (Math.random() - 0.5) * (w * 0.5);
      const startY = 0.3;

      const body: Body = world.createDynamicBody({
        position: Vec2(startX, startY),
        bullet: true,
      });

      const radius = 0.18;

      body.createFixture(planck.Circle(radius), {
        density: 0.9,
        friction: 0.25,
        restitution: 0.4,
      });

      body.setUserData({
        name: spec.name,
        color: spec.color,
        radius,
      });

      dynamicBalls.push(body);
    };

    if (balls.length > 0) {
      spawnIntervalId = window.setInterval(() => {
        if (spawnIndex >= balls.length) {
          if (spawnIntervalId !== null) {
            clearInterval(spawnIntervalId);
            spawnIntervalId = null;
          }
          return;
        }
        spawnNextBall();
      }, 150); // 공 생성 간격
    }

    // 🔽 카메라: 리더 공 따라가기
    let cameraY = 0;
    const cameraMaxY = Math.max(0, worldH - visibleH);
    const cameraFollowOffset = visibleH * 0.35; // 리더를 화면 위쪽 35% 근처에
    const cameraLerp = 0.12;                    // 부드러운 따라가기 정도

    let winnerDecided = false;

    const step = () => {
      const timeStep = 1 / 60;
      world.step(timeStep);

      // 리더 공 Y 찾기 (가장 아래로 많이 간 공)
      let leaderY = 0;
      if (dynamicBalls.length > 0) {
        for (const b of dynamicBalls) {
          const pos = b.getPosition();
          if (pos.y > leaderY) leaderY = pos.y;
        }
      }

      // 카메라 목표 Y = 리더Y - offset
      if (leaderY > 0) {
        let targetCameraY = leaderY - cameraFollowOffset;
        if (targetCameraY < 0) targetCameraY = 0;
        if (targetCameraY > cameraMaxY) targetCameraY = cameraMaxY;

        // lerp
        cameraY += (targetCameraY - cameraY) * cameraLerp;
      }

      // 배경
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      // 골 레인 영역 시각화 (살짝 강조)
      (function drawLane() {
        const laneScreenTop = (laneTopY - cameraY) * SCALE;
        const laneScreenBottom = (laneTopY + laneHeight - cameraY) * SCALE;
        const laneScreenLeft = (laneCenterX - laneWidth / 2) * SCALE;
        const laneScreenRight = (laneCenterX + laneWidth / 2) * SCALE;

        ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
        ctx.fillRect(
          laneScreenLeft,
          laneScreenTop,
          laneScreenRight - laneScreenLeft,
          laneScreenBottom - laneScreenTop
        );

        // 골 라인
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const goalScreenY = (goalY - cameraY) * SCALE;
        ctx.moveTo(laneScreenLeft, goalScreenY);
        ctx.lineTo(laneScreenRight, goalScreenY);
        ctx.stroke();
      })();

      // 모든 body 그리기
      for (let body = world.getBodyList(); body; body = body.getNext()) {
        const isDynamic = body.isDynamic();
        const userData = body.getUserData() as
          | { name?: string; color?: string; radius?: number }
          | null;

        for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
          const shape = fixture.getShape() as any;
          if (shape.m_type !== "circle") continue;

          const worldPos = body.getPosition();
          const radius = (userData?.radius ?? shape.m_radius) as number;

          const screenX = worldPos.x * SCALE;
          const screenY = (worldPos.y - cameraY) * SCALE;

          if (
            screenX + radius * SCALE < -40 ||
            screenX - radius * SCALE > width + 40 ||
            screenY + radius * SCALE < -40 ||
            screenY - radius * SCALE > height + 40
          ) {
            continue;
          }

          if (!isDynamic) {
            // 핀
            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            ctx.arc(screenX, screenY, pegRadius * SCALE, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 공
            const color = userData?.color ?? "#22c55e";
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius * SCALE, 0, Math.PI * 2);
            ctx.fill();

            // 이름 라벨 (3글자만)
            if (userData?.name) {
              const label =
                userData.name.length > 3
                  ? userData.name.slice(0, 3)
                  : userData.name;
              ctx.fillStyle = "#0f172a";
              ctx.font = "10px system-ui";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(label, screenX, screenY);
            }

            // 골 지점 도달 판정
            if (!winnerDecided && worldPos.y >= goalY) {
              if (userData?.name) {
                winnerDecided = true;
                onWinner(userData.name);
              }
            }

            // 너무 아래로 떨어진 공 정리
            if (worldPos.y > worldH + 2) {
              world.destroyBody(body);
              break;
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(step);
    };

    step();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (spawnIntervalId !== null) {
        clearInterval(spawnIntervalId);
      }
    };
  }, [balls, onWinner]);

  return (
    <div className="flex h-full items-center justify-center">
      <canvas
        ref={canvasRef}
        className="h-full max-h-[calc(100vh-5rem)] w-auto max-w-full rounded-lg border border-slate-700 bg-slate-900"
      />
    </div>
  );
}
