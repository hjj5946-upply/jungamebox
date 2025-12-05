// src/pages/ReflexPage.tsx
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import GameLayout from "../layouts/GameLayout";
import ReflexLeaderboardPanel from "../components/ReflexLeaderboardPanel";
import { recordReflexScore } from "../lib/reflex";

type Phase = "idle" | "waiting" | "ready" | "toosoon" | "result";

const MIN_DELAY = 1200;
const MAX_DELAY = 3500;
const WAITING_BG_POOL = [
  "bg-red-700",
  "bg-blue-700",
  "bg-purple-700",
  "bg-pink-700",
  "bg-teal-700",
  "bg-amber-700",
  "bg-rose-700",
  "bg-indigo-700",
  "bg-cyan-700",
  "bg-lime-700",
];

// 욕설/비속어 필터용 리스트 (원하는 대로 계속 추가해도 됨)
const BAD_WORDS = [
  "시발",
  "씨발",
  "병신",
  "느금",
  "ㅅㅂ",
  "ㅂㅅ",
  "fuck",
  "shit",
  "보지",
  "자지",
  "새끼",
  "잠지",
  "오랄",
  "사까",
  "꼬추",
  "꼬추년",
  "창녀",
  "개새끼",
  "씨빨",
  "씹쌔끼",
  "오랄"
];

export default function ReflexPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [latency, setLatency] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [waitingBg, setWaitingBg] = useState<string>("bg-slate-800");
  const [showRanking, setShowRanking] = useState(false);

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const startAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  // 닉네임 검증
  const validateNickname = (name: string): string | null => {
    const trimmed = name.trim();

    if (!trimmed) return "닉네임을 입력하세요.";
    if (trimmed.length > 10) return "닉네임은 10자 이하";

    // 한글/영문/숫자/_ 만 허용
    const validPattern = /^[ㄱ-ㅎ가-힣a-zA-Z0-9_]+$/;
    if (!validPattern.test(trimmed)) {
      return "한글/영문/숫자만 사용";
    }

    // 욕설 필터 (부분 포함도 막음)
    const lower = trimmed.toLowerCase();
    for (const bad of BAD_WORDS) {
      if (!bad) continue;
      if (lower.includes(bad.toLowerCase())) {
        return "사용할 수 없는 단어";
      }
    }

    return null;
  };

  const onChangeNickname = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setNicknameError(validateNickname(value));
  };

  const scheduleReady = () => {
    const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
    timeoutRef.current = window.setTimeout(() => {
      setPhase("ready");
      startAtRef.current = performance.now();
    }, delay);
  };

  const startWaiting = () => {
    const rnd =
      WAITING_BG_POOL[Math.floor(Math.random() * WAITING_BG_POOL.length)];
    setWaitingBg(rnd);
    setLatency(null);
    setPhase("waiting");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startAtRef.current = null;
    scheduleReady();
  };

  const onTapArea = () => {
    // 랭킹 화면일 때는 터치 무시 (안 렌더되지만 안전장치)
    if (showRanking) return;

    if (phase === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("toosoon");
      return;
    }
    if (phase === "ready") {
      const now = performance.now();
      const startAt = startAtRef.current ?? now;
      const ms = Math.max(0, Math.round(now - startAt));

      setLatency(ms);
      setPhase("result");
      setHistory((prev) => [...prev, ms].slice(-5));

      const safeNickname = nickname.trim() || "NONAME";
      recordReflexScore(ms, safeNickname).catch((err) =>
        console.error("[Reflex] failed to save score", err)
      );

      return;
    }
  };

  const onStartClick = () => {
    const err = validateNickname(nickname);
    if (err) {
      setNicknameError(err);
      return;
    }
    setNicknameError(null);
    startWaiting();
  };

  const onRetryClick = () => {
    startWaiting();
  };

  const areaBg =
    phase === "ready"
      ? "bg-[#47ed8a]"
      : phase === "waiting"
      ? waitingBg
      : phase === "toosoon"
      ? "bg-amber-700"
      : phase === "result"
      ? "bg-indigo-700"
      : "bg-slate-800";

  const startDisabled = !!nicknameError || !nickname.trim();

  return (
    <GameLayout title="반사신경">
      <div className="flex flex-col">
        {showRanking ? (
          <>
            {/* 세계에서 가장 빠른 반사신경 순위 */}
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/50">
              <h3 className="text-amber-200 text-sm font-bold mb-3 text-center">
                🌍 세계에서 가장 빠른 반사신경 순위
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-2xl">🥇</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">1위. 고양이</div>
                    <div className="text-amber-300/80 text-xs">20 ~ 60 ms (위협 회피, 착지 반사, 먹이 포획)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-2xl">🥈</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">2위. 사마귀</div>
                    <div className="text-amber-300/80 text-xs">15 ~ 70 ms (먹이 포획 - 사냥팔 발사)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-2xl">🥉</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">3위. 뱀 (독사류)</div>
                    <div className="text-amber-300/80 text-xs">44 ~ 70 ms (공격 및 물기 반사)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">4</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">4위. 집파리 / 모기</div>
                    <div className="text-amber-300/80 text-xs">30 ~ 50 ms (기류 감지 후 탈출 반사)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">5</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">5위. 개 (민첩한 품종)</div>
                    <div className="text-amber-300/80 text-xs">80 ~ 200 ms (던진 물체 포획, 위협 감지 및 반응)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">6</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">6위. 토끼</div>
                    <div className="text-amber-300/80 text-xs">약 100 ms (포식자 회피를 위한 도약 및 방향 전환)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">7</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">7위. 다람쥐</div>
                    <div className="text-amber-300/80 text-xs">약 100 ~ 150 ms (빠른 경계 및 움직임)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">8</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">8위. 인간 (최상급 선수)</div>
                    <div className="text-amber-300/80 text-xs">100 ~ 200 ms (시각/청각 반응 - e스포츠, F1 등)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">9</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">9위. 인간 (평균)</div>
                    <div className="text-amber-300/80 text-xs">250 ~ 500 ms (시각/청각 반응 - 일반적인 측정)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-800/20 border border-amber-700/30">
                  <div className="text-lg font-bold text-amber-200 w-6">10</div>
                  <div className="flex-1">
                    <div className="text-amber-100 font-semibold text-sm">10위. 거북이 (일부 종)</div>
                    <div className="text-amber-300/80 text-xs">500 ms 이상 (위협 시 목과 팔다리를 껍데기 안으로 움츠리는 반사)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-slate-100 text-sm font-semibold">
                🏆 반사신경 랭킹 (상위 10개)
              </h2>
              <button
                onClick={() => setShowRanking(false)}
                className="text-[12px] px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition"
              >
                닫기
              </button>
            </div>
            <ReflexLeaderboardPanel />
          </>
        ) : (
          <>
            {/* 상단: 닉네임 + 랭킹 버튼 */}
            <div className="mb-3 flex flex-col gap-1">
              {/* 상단: 라벨 + 에러문구 같은 줄 */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-300">
                  닉네임 (한글/영문 10자 이하)
                </label>

                {nicknameError && (
                  <span className="text-[11px] text-red-400 whitespace-nowrap ml-2">
                    {nicknameError}
                  </span>
                )}
              </div>

              {/* 하단: 입력창 + 랭킹보기 같은 줄 */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={onChangeNickname}
                  className="flex-1 rounded-md bg-slate-900/70 border border-slate-700 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  maxLength={12}
                  placeholder="닉네임을 입력하세요"
                />

                <button
                  onClick={() => setShowRanking(true)}
                  className="text-sm px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors whitespace-nowrap"
                >
                  🏆 랭킹 보기
                </button>
              </div>
            </div>

            {/* 메인 게임 영역 */}
            <div
              className={[
                "relative select-none",
                "flex items-center justify-center",
                "rounded-2xl shadow-lg border border-slate-700",
                "transition-colors duration-150",
                "min-h-[78dvh]",
                areaBg,
              ].join(" ")}
              onClick={onTapArea}
              onTouchStart={onTapArea}
              role="button"
              aria-label="반사신경 게임 터치 영역"
            >
              <div className="text-center px-4">
                {phase === "idle" && (
                  <>
                    <h2 className="text-slate-100 text-xl font-semibold mb-2">
                      시작하기
                    </h2>
                    <p className="text-slate-300 text-sm">
                      닉네임을 입력하고 테스트를 시작하세요
                    </p>
                    <button
                      onClick={onStartClick}
                      disabled={startDisabled}
                      className={[
                        "mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3",
                        "font-semibold ring-1 ring-slate-600 transition",
                        startDisabled
                          ? "bg-slate-700/60 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900/60 hover:bg-slate-900/80 text-slate-100",
                      ].join(" ")}
                    >
                      시작
                    </button>
                  </>
                )}

                {phase === "waiting" && (
                  <>
                    <h2 className="text-white text-2xl font-bold mb-2">
                      기다려요…
                    </h2>
                    <p className="text-white/90 text-sm">
                      화면이 초록(형광)색으로 바뀌면 즉시 탭!
                    </p>
                  </>
                )}

                {phase === "ready" && (
                  <>
                    <h2 className="text-white text-3xl font-extrabold mb-2">
                      지금!
                    </h2>
                    <p className="text-white/90 text-sm">
                      초록색일 때 탭하세요
                    </p>
                  </>
                )}

                {phase === "toosoon" && (
                  <>
                    <h2 className="text-white text-2xl font-bold mb-2">
                      너무 성급했어요 😅
                    </h2>
                    <p className="text-white/90 text-sm">
                      신호(초록)가 뜬 후에 눌러야 합니다.
                    </p>
                    <button
                      onClick={onRetryClick}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-slate-100 font-semibold px-6 py-3 ring-1 ring-slate-600 transition"
                    >
                      다시 시도
                    </button>
                  </>
                )}

                {phase === "result" && (
                  <>
                    <h2 className="text-white text-4xl font-extrabold mb-2">
                      {latency} ms
                    </h2>
                    <p className="text-white/90 text-sm">반응 속도</p>
                    <button
                      onClick={onRetryClick}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-slate-100 font-semibold px-6 py-3 ring-1 ring-slate-600 transition"
                    >
                      다시 시도
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 히스토리: 최근 5개 */}
            <div className="mt-3">
              <h3 className="text-slate-200 text-sm font-semibold mb-2">
                최근 기록 (5)
              </h3>
              {history.length === 0 ? (
                <p className="text-[12px] text-slate-400">
                  아직 기록이 없습니다.
                </p>
              ) : (
                <ul className="grid grid-cols-5 gap-2">
                  {history.map((v, i) => (
                    <li
                      key={`${i}-${v}`}
                      className="rounded-lg bg-slate-800 text-slate-100 text-sm py-2 text-center border border-slate-700"
                      title={`${v}ms`}
                    >
                      {v}ms
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}
