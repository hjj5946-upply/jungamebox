import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LadderGame – 네이버 사다리타기 스타일 단일 파일 컴포넌트
 * - 참가자 이름과 결과 라벨을 입력 → 사다리 자동 생성 → 애니메이션으로 결과 확인
 * - Tailwind만 사용 (외부 UI 라이브러리 없음)
 */
export default function LadderGame() {
  // ---------- 상태 ----------
  const [names, setNames] = useState<string[]>(["A", "B", "C", "D"]);
  const [results, setResults] = useState<string[]>(["1", "2", "3", "4"]);
  const [rungDensity, setRungDensity] = useState<number>(8); // 전체 가로발 개수(대략)
  const [seed, setSeed] = useState<number>(Date.now()); // 재생성 시드
  const [playingIndex, setPlayingIndex] = useState<number | null>(null); // 현재 애니메이션 중인 시작 인덱스
  const [pathsVisible, setPathsVisible] = useState<boolean>(false); // 전체 경로 보기

  // ---------- 레이아웃 ----------
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 960, height: 520 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.max(640, Math.floor(e.contentRect.width));
        const h = Math.max(420, Math.floor((e.contentRect.width * 9) / 16));
        setSize({ width: w, height: h });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---------- 사다리 데이터 생성 ----------
  type Rung = { left: number; y: number }; // left 컬럼과 left+1 컬럼을 y에서 연결

  const cols = names.length;
  useEffect(() => {
    // names/results 길이 동기화(간단 규칙: 결과를 참가자 수에 맞춰 자르거나 채움)
    setResults((prev) => {
      const copy = [...prev];
      if (copy.length > cols) return copy.slice(0, cols);
      if (copy.length < cols) {
        const extra = Array.from({ length: cols - copy.length }, (_, i) => `${copy.length + i + 1}`);
        return copy.concat(extra);
      }
      return copy;
    });
  }, [cols]);

  const rng = useMemo(() => mulberry32(seed), [seed]);

  const rungs: Rung[] = useMemo(() => {
    // 규칙: 인접한 가로발끼리 너무 가까이 배치하지 않음, 겹침 금지
    const list: Rung[] = [];
    if (cols <= 1) return list;

    const minGap = 0.05; // 세로 최소 간격(비율)
    const target = Math.max(0, Math.round(rungDensity));

    let attempts = 0;
    while (list.length < target && attempts < target * 20) {
      attempts++;
      const left = Math.floor(rng() * (cols - 1));
      const y = clamp(rng(), 0.05, 0.95); // 위/아래 마진 확보

      // 인접/겹침 체크
      let ok = true;
      for (const r of list) {
        if (r.left === left && Math.abs(r.y - y) < minGap) {
          ok = false; break;
        }
        // 좌우 바로 옆 가로발이 너무 가까운 것도 제한(겹치는 듯한 느낌 방지)
        if (Math.abs(r.left - left) === 1 && Math.abs(r.y - y) < minGap * 0.6) {
          ok = false; break;
        }
      }
      if (ok) list.push({ left, y });
    }

    return list.sort((a, b) => a.y - b.y);
  }, [cols, rungDensity, rng]);

  // ---------- 경로 계산 ----------
  type Point = { x: number; y: number };
  type PathInfo = { startIdx: number; endIdx: number; points: Point[] };

  const { pathInfos, mapping } = useMemo(() => {
    const W = size.width;
    const H = size.height;

    const padding = { top: 64, bottom: 96, left: 32, right: 32 };
    const ladderTop = padding.top;
    const ladderBottom = H - padding.bottom;
    const ladderHeight = ladderBottom - ladderTop;

    const xOf = (c: number) => {
      if (cols === 1) return W / 2;
      const left = padding.left;
      const right = W - padding.right;
      return left + (c * (right - left)) / (cols - 1);
    };
    const yOf = (t: number) => ladderTop + t * ladderHeight; // t∈[0,1]

    const byY = [...rungs];
    // 컬럼마다 세로선의 경로를 생성하도록, 각 시작점에 대해 스윕
    const paths: PathInfo[] = [];

    for (let s = 0; s < cols; s++) {
      let cur = s;
      let lastT = 0;
      const pts: Point[] = [{ x: xOf(cur), y: yOf(0) }];

      for (const r of byY) {
        // 현재 세로선에서 다음 가로발까지 수직 이동
        const ny = yOf(r.y);
        pts.push({ x: xOf(cur), y: ny });

        if (r.left === cur) {
          // 오른쪽으로 이동
          cur = cur + 1;
          pts.push({ x: xOf(cur), y: ny });
        } else if (r.left + 1 === cur) {
          // 왼쪽으로 이동
          cur = cur - 1;
          pts.push({ x: xOf(cur), y: ny });
        }
        lastT = r.y;
      }
      // 바닥까지
      pts.push({ x: xOf(cur), y: yOf(1) });

      paths.push({ startIdx: s, endIdx: cur, points: compressPolyline(pts) });
    }

    // 시작 → 도착 인덱스 매핑
    const m = new Map<number, number>();
    for (const p of paths) m.set(p.startIdx, p.endIdx);

    return { pathInfos: paths, mapping: m };
  }, [cols, rungs, size]);

  // ---------- 애니메이션 제어 ----------
  const [dash, setDash] = useState(0);
  const animReq = useRef<number | null>(null);
  const totalLenRef = useRef<number>(0);

  const startPlay = (idx: number) => {
    setPathsVisible(false);
    setPlayingIndex(idx);
    setDash(0);
  };

  useEffect(() => {
    if (playingIndex == null) return;

    // 선택 경로 길이 계산
    const p = pathInfos.find((v) => v.startIdx === playingIndex);
    if (!p) return;

    totalLenRef.current = polylineLength(p.points);

    const duration = 1200 + totalLenRef.current * 0.4; // px 비례 시간
    const t0 = performance.now();

    const step = (t: number) => {
      const u = clamp((t - t0) / duration, 0, 1);
      setDash(u);
      if (u < 1) {
        animReq.current = requestAnimationFrame(step);
      } else {
        animReq.current = null;
      }
    };

    animReq.current = requestAnimationFrame(step);
    return () => {
      if (animReq.current) cancelAnimationFrame(animReq.current);
      animReq.current = null;
    };
  }, [playingIndex, pathInfos]);

  const stopPlay = () => {
    if (animReq.current) cancelAnimationFrame(animReq.current);
    animReq.current = null;
    setPlayingIndex(null);
    setDash(0);
  };

  // ---------- 유틸 렌더 ----------
  const W = size.width;
  const H = size.height;
  const padding = { top: 64, bottom: 96, left: 32, right: 32 };
  const ladderTop = padding.top;
  const ladderBottom = H - padding.bottom;
  const xOf = (c: number) => {
    if (cols === 1) return W / 2;
    const left = padding.left;
    const right = W - padding.right;
    return left + (c * (right - left)) / (cols - 1);
  };
  const yOf = (t: number) => ladderTop + (H - padding.top - padding.bottom) * t;

  // path d 변환
  const toPath = (pts: Point[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");

  // ---------- 상단/하단 입력 ----------
  const updateName = (i: number, val: string) => setNames((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  const updateResult = (i: number, val: string) => setResults((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const addColumn = () => {
    setNames((p) => [...p, `P${p.length + 1}`]);
    setResults((p) => [...p, `${p.length + 1}`]);
  };
  const removeColumn = () => {
    if (names.length <= 2) return;
    setNames((p) => p.slice(0, -1));
    setResults((p) => p.slice(0, -1));
  };

  const shuffleResults = () => {
    setResults((prev) => shuffle(prev, mulberry32(Date.now())));
  };

  const regenerate = () => setSeed(Date.now());

  const revealAll = () => {
    setPathsVisible(true);
    setPlayingIndex(null);
    setDash(1);
  };

  const clearAll = () => {
    stopPlay();
    setNames(["A", "B", "C", "D"]);
    setResults(["1", "2", "3", "4"]);
    setRungDensity(8);
    setSeed(Date.now());
    setPathsVisible(false);
  };

  const mappingList = useMemo(() => {
    return names.map((n, i) => ({ from: n.trim() || `P${i + 1}`, to: results[mapping.get(i) ?? i] ?? "" }));
  }, [names, results, mapping]);

  return (
    <div ref={wrapRef} className="w-full">
      {/* 헤더 / 컨트롤 */}
      <div className="mx-auto max-w-[1200px] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="text-2xl font-bold">사다리타기</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-2xl px-4 py-2 shadow hover:shadow-md border" onClick={addColumn}>참가자 +</button>
            <button className="rounded-2xl px-4 py-2 shadow hover:shadow-md border" onClick={removeColumn} disabled={names.length<=2}>참가자 -</button>
            <button className="rounded-2xl px-4 py-2 shadow hover:shadow-md border" onClick={shuffleResults}>결과 섞기</button>
            <button className="rounded-2xl px-4 py-2 shadow hover:shadow-md border" onClick={regenerate}>사다리 재생성</button>
            <button className="rounded-2xl px-4 py-2 shadow hover:shadow-md border" onClick={revealAll}>전체 경로</button>
            <button className="rounded-2xl px-4 py-2 shadow hover:shadow-md border" onClick={clearAll}>초기화</button>
          </div>
        </div>

        {/* 옵션 */}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">가로발 개수</label>
            <input
              type="range"
              min={0}
              max={24}
              value={rungDensity}
              onChange={(e) => setRungDensity(Number(e.target.value))}
            />
            <span className="w-8 text-center text-sm">{rungDensity}</span>
          </div>
        </div>

        {/* 사다리 */}
        <div className="mt-4 rounded-2xl border bg-white p-3 shadow">
          <svg width={W} height={H} className="block mx-auto">
            {/* 상단 라벨 */}
            {names.map((n, i) => (
              <foreignObject key={`top-${i}`} x={xOf(i) - 60} y={8} width={120} height={40}>
                <div className="flex items-center justify-center">
                  <input
                    className="w-[110px] rounded-xl border px-2 py-1 text-center text-sm"
                    value={n}
                    onChange={(e) => updateName(i, e.target.value)}
                  />
                </div>
              </foreignObject>
            ))}

            {/* 세로줄 */}
            {names.map((_, i) => (
              <line key={`v-${i}`} x1={xOf(i)} x2={xOf(i)} y1={ladderTop} y2={ladderBottom} stroke="#e5e7eb" strokeWidth={4} />
            ))}

            {/* 가로발 */}
            {rungs.map((r, idx) => (
              <line
                key={`h-${idx}`}
                x1={xOf(r.left)}
                x2={xOf(r.left + 1)}
                y1={yOf(r.y)}
                y2={yOf(r.y)}
                stroke="#9ca3af"
                strokeWidth={6}
                strokeLinecap="round"
              />
            ))}

            {/* 경로(전체 보기) */}
            {pathsVisible && pathInfos.map((p, i) => (
              <path
                key={`path-${i}`}
                d={toPath(p.points)}
                fill="none"
                stroke="#111827"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.2}
              />
            ))}

            {/* 진행 중인 경로 */}
            {playingIndex != null && (() => {
              const p = pathInfos.find((v) => v.startIdx === playingIndex);
              if (!p) return null;
              const d = toPath(p.points);
              const L = polylineLength(p.points);
              const dashLen = Math.max(16, L / 40);
              return (
                <>
                  <path
                    d={d}
                    fill="none"
                    stroke="#111827"
                    strokeWidth={4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray={`${dashLen} ${dashLen}`}
                    strokeDashoffset={(1 - dash) * (dashLen * Math.ceil(L / dashLen))}
                  />
                </>
              );
            })()}

            {/* 하단 결과 입력 + 실행 버튼 */}
            {results.map((r, i) => (
              <foreignObject key={`bot-${i}`} x={xOf(i) - 60} y={H - 76} width={120} height={68}>
                <div className="flex flex-col items-center gap-2">
                  <input
                    className="w-[110px] rounded-xl border px-2 py-1 text-center text-sm"
                    value={r}
                    onChange={(e) => updateResult(i, e.target.value)}
                  />
                  <button
                    className="w-[110px] rounded-xl border px-3 py-1 text-sm shadow hover:shadow-md"
                    onClick={() => startPlay(i)}
                  >
                    {names[i] ?? `P${i + 1}`} 시작
                  </button>
                </div>
              </foreignObject>
            ))}
          </svg>
        </div>

        {/* 결과 테이블 */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[400px] w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">참가자</th>
                <th className="px-3 py-2 text-left">결과</th>
                <th className="px-3 py-2 text-left">액션</th>
              </tr>
            </thead>
            <tbody>
              {mappingList.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{row.from}</td>
                  <td className="px-3 py-2 font-semibold">{row.to}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="rounded-lg border px-3 py-1" onClick={() => startPlay(i)}>재생</button>
                      <button className="rounded-lg border px-3 py-1" onClick={stopPlay}>정지</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------- 유틸 함수 --------------------
function clamp(v: number, a: number, b: number) { return Math.min(Math.max(v, a), b); }

function mulberry32(a: number) {
  let t = a >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function polylineLength(pts: { x: number; y: number }[]) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    L += Math.hypot(dx, dy);
  }
  return L;
}

// 인접 중복 포인트 제거
function compressPolyline(pts: { x: number; y: number }[], eps = 0.5) {
  const out: { x: number; y: number }[] = [];
  for (const p of pts) {
    if (!out.length) { out.push(p); continue; }
    const q = out[out.length - 1];
    if (Math.hypot(p.x - q.x, p.y - q.y) > eps) out.push(p);
  }
  return out;
}
