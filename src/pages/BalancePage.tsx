import { useEffect, useRef, useState } from "react";
import GameLayout from "../layouts/GameLayout";
import { categories } from "../data/balanceGameData";
import type { Category, Item } from "../data/balanceGameData";
import { recordWinner } from "../lib/leaderboard";
import LeaderboardPanel from "../components/LeaderboardPanel";

type TournamentStage = "category" | "tournament-select" | "tournament" | "result";

type ZoomOverlayState = {
  item: Item | null;
  // 시작 시 카드의 실제 위치/크기
  from: { top: number; left: number; width: number; height: number; radius: number } | null;
  // 애니메이션 진행 중 여부
  active: boolean;
};

export default function BalancePage() {
  const [stage, setStage] = useState<TournamentStage>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentRoundItems, setCurrentRoundItems] = useState<Item[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [finalWinner, setFinalWinner] = useState<Item | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [tournamentSize, setTournamentSize] = useState<number | null>(null);
  const [initialBracketSize, setInitialBracketSize] = useState<number>(0);
  
  // 애니메이션 & 레퍼런스
  const [animating, setAnimating] = useState(false);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  // 전체확대 오버레이 상태
  const [overlay, setOverlay] = useState<ZoomOverlayState>({
    item: null,
    from: null,
    active: false,
  });

  // 카테고리 선택
  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setStage("tournament-select");
  };

  // 사용할 수 있는 대진(2,4,8,16,32,64 중에서 아이템 수 이하인 것들)
  const getAvailableBrackets = (count: number) => {
    const candidates = [2, 4, 8, 16, 32, 64];
    return candidates.filter((n) => n <= count);
  };

  // 토너먼트 시작
 const startTournament = (size: number) => {
  const items = selectedCategory?.items || [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  // 선택한 size(4/8/16/32/64)와 실제 개수 중 작은 쪽으로 확정
  const bracket = Math.min(size, items.length);
  const selectedItems = shuffled.slice(0, bracket);

  setTournamentSize(bracket);        // 몇 강인지
  setInitialBracketSize(bracket);    // 총 라운드 계산용
  setCurrentRoundItems(selectedItems);
  setCurrentMatchIndex(0);
  setCurrentRoundNumber(1);
  setFinalWinner(null);
  setStage("tournament");
}

  // 원래 승자 처리 로직 유지
  const selectWinner = (winner: Item) => {
    if (!sessionStorage.getItem("roundWinners")) {
      sessionStorage.setItem("roundWinners", JSON.stringify([]));
    }
    const savedWinners = JSON.parse(sessionStorage.getItem("roundWinners") || "[]");
    savedWinners.push(winner);
    sessionStorage.setItem("roundWinners", JSON.stringify(savedWinners));

    const nextMatchIndex = currentMatchIndex + 2;

    if (nextMatchIndex < currentRoundItems.length) {
      setCurrentMatchIndex(nextMatchIndex);
      return;
    }

    const winners = savedWinners as Item[];
    sessionStorage.removeItem("roundWinners");

    if (winners.length === 1) {
      setFinalWinner(winners[0]);
      setStage("result");
      recordWinner(selectedCategory?.name ?? "기타", winners[0].name);
      return;
    }

    if (winners.length === 1) {
      setFinalWinner(winners[0]);
      setStage("result");
      recordWinner(selectedCategory?.name ?? "기타", winners[0].name);
      return;
    }

    setCurrentRoundItems(winners);
    setCurrentMatchIndex(0);
    setCurrentRoundNumber(currentRoundNumber + 1);
  };

  // 리셋
  const reset = () => {
    setStage("category");
    setSelectedCategory(null);
    setCurrentRoundItems([]);
    setCurrentMatchIndex(0);
    setCurrentRoundNumber(1);
    setFinalWinner(null);
    sessionStorage.removeItem("roundWinners");
    setAnimating(false);
    setOverlay({ item: null, from: null, active: false });
  };

  // 현재 매치 아이템
  const itemA = currentRoundItems[currentMatchIndex];
  const itemB = currentRoundItems[currentMatchIndex + 1];

  // 표기
  const totalRounds = initialBracketSize ? Math.log2(initialBracketSize) : 0;
  const matchesInCurrentRound = Math.floor(currentRoundItems.length / 2);
  const currentMatchNumber = Math.floor(currentMatchIndex / 2) + 1;

  // 카드 렌더 공통
  const renderCard = (item?: Item, side?: "A" | "B") => {
    if (!item) return null;

    // 선택 시: 카드 실제 위치/크기 측정 → 풀스크린 오버레이로 확대
    const onPick = () => {
      if (animating) return;
      const el = side === "A" ? leftRef.current : rightRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      setAnimating(true);
      setOverlay({
        item,
        from: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          radius: parseFloat(getComputedStyle(el).borderRadius || "16"),
        },
        active: true,
      });
    };

    return (
      <div
            ref={side === "A" ? leftRef : rightRef}
            // 최상위 div에 기본적으로 배경색을 설정하여 이미지가 없거나 로딩 중일 때 빈 공간이 보이지 않게 합니다.
            className="relative flex-1 aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-veil/10 shadow-lg transition-transform duration-200 hover:scale-[1.02] cursor-pointer bg-slate-800" // 👈 배경색을 기본으로 설정
            onClick={onPick}
            role="button"
            aria-label={item.name}
        >
          {/* 이미지 */}
          {item.image ? (
              <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  // 🚨 onError 핸들러를 제거합니다.
                  // 경로가 올바르다면, 이 핸들러가 없어야 이미지가 로드됩니다.
                  // 만약 로딩에 실패하더라도, 대체 배경색(bg-slate-800)이 뒤에 남아있습니다.
              />
          ) : (
              // item.image 필드가 아예 비어있을 경우 (텍스트 전용)
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center" /> 
          )}

          {/* 이름 오버레이 (나머지 생략) */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-center">
              <span className="text-strong font-bold text-sm drop-shadow">
                  {item.name}
              </span>
          </div>
      </div>
    );
  };

  // 오버레이 애니메이션: 처음엔 카드 위치/크기에서 시작 → fixed full screen으로 스무스 확대
  useEffect(() => {
    if (!overlay.active || !overlay.from || !overlay.item) return;

    // 트랜지션 종료 후: 페이드아웃 120ms → 승자 적용 → 오버레이 닫기
    const handleEnd = () => {
      // 짧은 페이드아웃
      const fade = document.getElementById("zoom-fader");
      if (fade) {
        fade.classList.remove("opacity-0");
        fade.classList.add("opacity-100");
      }
      setTimeout(() => {
        selectWinner(overlay.item as Item);
        setAnimating(false);
        setOverlay({ item: null, from: null, active: false });
      }, 140);
    };

    // 다음 프레임에서 full-screen 스타일 적용
    requestAnimationFrame(() => {
      const box = document.getElementById("zoom-box");
      if (!box) return;

      // 트랜지션 리스너
      const onTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName === "transform" || e.propertyName === "width") {
          box.removeEventListener("transitionend", onTransitionEnd as any);
          handleEnd();
        }
      };
      box.addEventListener("transitionend", onTransitionEnd as any);

      // 앱 셸(모바일 폭 중앙 열) 크기로 확장.
      // box 는 position:fixed(뷰포트 기준)이므로 셸의 화면상 위치를 그대로 사용한다.
      // 모바일에서는 셸 == 뷰포트라 기존 풀스크린 동작과 동일하다.
      const shell = document.getElementById("app-shell");
      const r = shell?.getBoundingClientRect();

      box.style.top = `${r?.top ?? 0}px`;
      box.style.left = `${r?.left ?? 0}px`;
      box.style.width = r ? `${r.width}px` : "100vw";
      box.style.height = r ? `${r.height}px` : "100vh";
      box.style.borderRadius = "0px";
      box.style.transform = "translate3d(0,0,0) scale(1)";
    });
  }, [overlay.active]);

  return (
    <GameLayout title="밸런스월드컵">
      <div className="flex flex-col h-full gap-4">
        {stage === "category" && (
          showLeaderboard ? (
            // ✅ 결과 리스트 전용 뷰 (카테고리 버튼/그리드 감추기)
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-strong font-semibold">🏆 우승 결과</div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-sm px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-strong font-medium transition-colors"
                >
                  닫기
                </button>
              </div>

              {/* 선택된 카테고리가 있으면 기본값으로 전달 */}
              <LeaderboardPanel initialCategory={selectedCategory?.name} />
            </div>
          ) : (
            // ✅ 기존 카테고리 선택 뷰
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="text-sm px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors"
                >
                  🏆 랭킹 보기
                </button>
              </div>

              <div className="text-strong text-xl font-bold text-center">
                카테고리를 선택하세요
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => selectCategory(category)}
                    className="py-5 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-strong font-semibold text-base transition-colors shadow"
                  >
                    {category.name}
                    <div className="text-xs text-slate-400 mt-1">
                      {category.items.length}개 항목
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* 라운드 선택 */}
        {stage === "tournament-select" && selectedCategory && (() => {
          const count = selectedCategory.items.length;
          const brackets = getAvailableBrackets(count); // 2,4,8,16,32,64 중 가능한 것들

          return (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-strong text-xl font-bold text-center leading-tight">
                {selectedCategory.name}
                <br />
                <span className="text-sm text-slate-400 font-normal">
                  토너먼트 라운드를 선택하세요
                </span>
                <br />
                <span className="text-xs text-slate-500">
                  (총 항목: {count}개)
                </span>
              </div>

              <div className="flex flex-wrap gap-3 w-full">
                {brackets.map((size) => (
                  <button
                    key={size}
                    onClick={() => startTournament(size)}
                    className="flex-1 min-w-[80px] py-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-colors"
                  >
                    {size}강
                  </button>
                ))}
              </div>

              <button
                onClick={reset}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-strong rounded-md text-sm transition-colors"
              >
                뒤로가기
              </button>
            </div>
          );
        })()}

        {/* 토너먼트 진행 */}
        {stage === "tournament" && itemA && itemB && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* 진행 상태 (폰트 축소) */}
            <div className="text-strong text-center leading-tight">
              <div className="text-base font-semibold">
                {tournamentSize ?? "?"}강 토너먼트
              </div>
              <div className="text-xl text-slate-400 mt-1">
                {currentRoundNumber}라운드 / {totalRounds}라운드
                <br />
                매치 {currentMatchNumber}/{matchesInCurrentRound}
              </div>
            </div>

            {/* 상단 VS 배지 (폰트 축소) */}
            <div className="px-5 py-1.5 rounded-full bg-veil/10 text-strong text-lg font-extrabold tracking-wider">
              VS
            </div>

            {/* 좌우 카드: 거의 붙게 */}
            <div
              className={
                "w-full flex gap-2 " +
                (animating ? "pointer-events-none" : "pointer-events-auto")
              }
            >
              {renderCard(itemA, "A")}
              {renderCard(itemB, "B")}
            </div>

            <button
              onClick={reset}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-strong rounded-md text-sm transition-colors"
            >
              뒤로가기
            </button>
          </div>
        )}

        {/* 결과 (폰트 축소) */}
        {stage === "result" && finalWinner && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="text-yellow-400 text-2xl font-bold text-center animate-bounce">
              🏆 우승! 🏆
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-4xl font-bold py-12 px-16 rounded-xl shadow-2xl animate-bounce">
              {finalWinner.name}
            </div>
            <button
              onClick={reset}
              className="px-7 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-md transition-colors"
            >
              다시하기
            </button>
          </div>
        )}
      </div>

      {/* ====== 풀스크린 확대 오버레이 ====== */}
      {overlay.active && overlay.item && overlay.from && (
        <>
          {/* 배경 디밍 */}
          <div
            id="zoom-fader"
            className="fixed inset-0 bg-black/60 transition-opacity duration-150 ease-out pointer-events-none opacity-0"
          />
          {/* 확대 박스 */}
          <div
            id="zoom-box"
            className="fixed z-[60] overflow-hidden will-change-transform transition-all duration-[400ms] ease-out"
            style={{
              top: `${overlay.from.top}px`,
              left: `${overlay.from.left}px`,
              width: `${overlay.from.width}px`,
              height: `${overlay.from.height}px`,
              borderRadius: `${overlay.from.radius}px`,
              transform: "translate3d(0,0,0) scale(1.02)", // 살짝 키운 상태에서 시작
            }}
          >
            {/* 내용 (이미지/이름) */}
            {overlay.item.image ? (
              <img
                src={overlay.item.image}
                alt={overlay.item.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-center">
              <span className="text-strong font-extrabold text-2xl drop-shadow">
                {overlay.item.name}
              </span>
            </div>
          </div>
        </>
      )}
    </GameLayout>
  );
}
