//src/pages/BalancePage.tsx
import { useState } from "react";
import GameLayout from "../layouts/GameLayout";

type BalanceQuestion = {
  id: number;
  optionA: string;
  optionB: string;
  imageA?: string; // 옵션 A 이미지 경로
  imageB?: string; // 옵션 B 이미지 경로
};

type Category = {
  id: number;
  name: string;
  questions: BalanceQuestion[];
};

const categories: Category[] = [
  {
    id: 1,
    name: "아이스크림",
    questions: [
      { id: 1, optionA: "바닐라", optionB: "초콜릿", imageA: "/vanilla.png", imageB: "/chocolate.png" },
      { id: 2, optionA: "딸기", optionB: "민트초코" },
      { id: 3, optionA: "초콜릿칩", optionB: "쿠키앤크림" },
      { id: 4, optionA: "스트로베리", optionB: "초콜릿무스" },
      { id: 5, optionA: "카라멜", optionB: "초콜릿" },
      { id: 6, optionA: "요거트", optionB: "바닐라" },
      { id: 7, optionA: "초코바", optionB: "딸기바" },
      { id: 8, optionA: "피스타치오", optionB: "아몬드" },
      { id: 9, optionA: "녹차", optionB: "밀크티" },
      { id: 10, optionA: "라즈베리", optionB: "블루베리" },
      { id: 11, optionA: "초콜릿", optionB: "바닐라" },
      { id: 12, optionA: "민트초코", optionB: "바닐라" },
      { id: 13, optionA: "쿠키앤크림", optionB: "초콜릿칩" },
      { id: 14, optionA: "초콜릿무스", optionB: "스트로베리" },
      { id: 15, optionA: "초콜릿", optionB: "카라멜" },
      { id: 16, optionA: "바닐라", optionB: "요거트" },
      { id: 17, optionA: "딸기바", optionB: "초코바" },
      { id: 18, optionA: "아몬드", optionB: "피스타치오" },
      { id: 19, optionA: "밀크티", optionB: "녹차" },
      { id: 20, optionA: "블루베리", optionB: "라즈베리" },
      { id: 21, optionA: "체리", optionB: "오렌지" },
      { id: 22, optionA: "망고", optionB: "파인애플" },
      { id: 23, optionA: "코코넛", optionB: "바닐라" },
      { id: 24, optionA: "헤이즐넛", optionB: "아몬드" },
      { id: 25, optionA: "초콜릿바닐라", optionB: "스트로베리바닐라" },
      { id: 26, optionA: "초콜릿칩쿠키", optionB: "쿠키앤크림" },
      { id: 27, optionA: "민트", optionB: "초콜릿" },
      { id: 28, optionA: "바닐라빈", optionB: "초콜릿" },
      { id: 29, optionA: "딸기치즈케이크", optionB: "초콜릿무스" },
      { id: 30, optionA: "초콜릿브라우니", optionB: "쿠키앤크림" },
      { id: 31, optionA: "초콜릿", optionB: "딸기" },
      { id: 32, optionA: "바닐라", optionB: "민트초코" },
      { id: 33, optionA: "초콜릿칩", optionB: "바닐라" },
      { id: 34, optionA: "스트로베리", optionB: "초콜릿" },
      { id: 35, optionA: "카라멜", optionB: "바닐라" },
      { id: 36, optionA: "요거트", optionB: "초콜릿" },
      { id: 37, optionA: "초코바", optionB: "바닐라" },
      { id: 38, optionA: "피스타치오", optionB: "초콜릿" },
      { id: 39, optionA: "녹차", optionB: "초콜릿" },
      { id: 40, optionA: "라즈베리", optionB: "초콜릿" },
      { id: 41, optionA: "블루베리", optionB: "초콜릿" },
      { id: 42, optionA: "체리", optionB: "초콜릿" },
      { id: 43, optionA: "오렌지", optionB: "초콜릿" },
      { id: 44, optionA: "망고", optionB: "초콜릿" },
      { id: 45, optionA: "파인애플", optionB: "초콜릿" },
      { id: 46, optionA: "코코넛", optionB: "초콜릿" },
      { id: 47, optionA: "헤이즐넛", optionB: "초콜릿" },
      { id: 48, optionA: "초콜릿바닐라", optionB: "초콜릿" },
      { id: 49, optionA: "스트로베리바닐라", optionB: "초콜릿" },
      { id: 50, optionA: "초콜릿칩쿠키", optionB: "초콜릿" },
      { id: 51, optionA: "민트", optionB: "바닐라" },
      { id: 52, optionA: "바닐라빈", optionB: "딸기" },
      { id: 53, optionA: "딸기치즈케이크", optionB: "바닐라" },
      { id: 54, optionA: "초콜릿브라우니", optionB: "바닐라" },
      { id: 55, optionA: "초콜릿", optionB: "쿠키앤크림" },
      { id: 56, optionA: "바닐라", optionB: "초콜릿무스" },
      { id: 57, optionA: "초콜릿칩", optionB: "스트로베리" },
      { id: 58, optionA: "스트로베리", optionB: "카라멜" },
      { id: 59, optionA: "카라멜", optionB: "요거트" },
      { id: 60, optionA: "요거트", optionB: "초코바" },
      { id: 61, optionA: "초코바", optionB: "피스타치오" },
      { id: 62, optionA: "피스타치오", optionB: "녹차" },
      { id: 63, optionA: "녹차", optionB: "라즈베리" },
      { id: 64, optionA: "라즈베리", optionB: "블루베리" },
    ],
  },
  {
    id: 2,
    name: "영화",
    questions: [
      { id: 65, optionA: "액션", optionB: "코미디" },
      { id: 66, optionA: "로맨스", optionB: "스릴러" },
      { id: 67, optionA: "SF", optionB: "판타지" },
      { id: 68, optionA: "공포", optionB: "드라마" },
      { id: 69, optionA: "로맨틱코미디", optionB: "액션코미디" },
      { id: 70, optionA: "범죄", optionB: "미스터리" },
      { id: 71, optionA: "전쟁", optionB: "평화" },
      { id: 72, optionA: "음악영화", optionB: "뮤지컬" },
      { id: 73, optionA: "애니메이션", optionB: "실사" },
      { id: 74, optionA: "다큐멘터리", optionB: "영화" },
      { id: 75, optionA: "스파이", optionB: "탐정" },
      { id: 76, optionA: "좀비", optionB: "뱀파이어" },
      { id: 77, optionA: "슈퍼히어로", optionB: "반영웅" },
      { id: 78, optionA: "우주", optionB: "바다" },
      { id: 79, optionA: "시대극", optionB: "현대극" },
      { id: 80, optionA: "코미디", optionB: "액션" },
      { id: 81, optionA: "스릴러", optionB: "로맨스" },
      { id: 82, optionA: "판타지", optionB: "SF" },
      { id: 83, optionA: "드라마", optionB: "공포" },
      { id: 84, optionA: "액션코미디", optionB: "로맨틱코미디" },
      { id: 85, optionA: "미스터리", optionB: "범죄" },
      { id: 86, optionA: "평화", optionB: "전쟁" },
      { id: 87, optionA: "뮤지컬", optionB: "음악영화" },
      { id: 88, optionA: "실사", optionB: "애니메이션" },
      { id: 89, optionA: "영화", optionB: "다큐멘터리" },
      { id: 90, optionA: "탐정", optionB: "스파이" },
      { id: 91, optionA: "뱀파이어", optionB: "좀비" },
      { id: 92, optionA: "반영웅", optionB: "슈퍼히어로" },
      { id: 93, optionA: "바다", optionB: "우주" },
      { id: 94, optionA: "현대극", optionB: "시대극" },
      { id: 95, optionA: "액션", optionB: "SF" },
      { id: 96, optionA: "코미디", optionB: "로맨스" },
      { id: 97, optionA: "스릴러", optionB: "공포" },
      { id: 98, optionA: "판타지", optionB: "드라마" },
      { id: 99, optionA: "범죄", optionB: "액션" },
      { id: 100, optionA: "미스터리", optionB: "스릴러" },
      { id: 101, optionA: "전쟁", optionB: "SF" },
      { id: 102, optionA: "음악영화", optionB: "애니메이션" },
      { id: 103, optionA: "뮤지컬", optionB: "실사" },
      { id: 104, optionA: "다큐멘터리", optionB: "코미디" },
      { id: 105, optionA: "스파이", optionB: "범죄" },
      { id: 106, optionA: "탐정", optionB: "미스터리" },
      { id: 107, optionA: "좀비", optionB: "공포" },
      { id: 108, optionA: "뱀파이어", optionB: "판타지" },
      { id: 109, optionA: "슈퍼히어로", optionB: "액션" },
      { id: 110, optionA: "반영웅", optionB: "스릴러" },
      { id: 111, optionA: "우주", optionB: "SF" },
      { id: 112, optionA: "바다", optionB: "어드벤처" },
      { id: 113, optionA: "시대극", optionB: "역사" },
      { id: 114, optionA: "현대극", optionB: "현대" },
      { id: 115, optionA: "액션", optionB: "어드벤처" },
      { id: 116, optionA: "코미디", optionB: "로맨틱" },
      { id: 117, optionA: "스릴러", optionB: "호러" },
      { id: 118, optionA: "SF", optionB: "판타지" },
      { id: 119, optionA: "공포", optionB: "스릴러" },
      { id: 120, optionA: "드라마", optionB: "멜로" },
      { id: 121, optionA: "로맨스", optionB: "코미디" },
      { id: 122, optionA: "범죄", optionB: "액션" },
      { id: 123, optionA: "미스터리", optionB: "스릴러" },
      { id: 124, optionA: "전쟁", optionB: "평화" },
      { id: 125, optionA: "음악영화", optionB: "뮤지컬" },
      { id: 126, optionA: "애니메이션", optionB: "실사" },
      { id: 127, optionA: "다큐멘터리", optionB: "영화" },
      { id: 128, optionA: "스파이", optionB: "탐정" },
    ],
  },
];

type TournamentRound = "32" | "64";
type TournamentStage = "category" | "tournament-select" | "tournament" | "result";

// 각 라운드의 승자 추적 (텍스트와 이미지 경로)
type RoundWinner = {
  text: string;
  image?: string;
};
type RoundWinners = RoundWinner[];

export default function BalancePage() {
  const [stage, setStage] = useState<TournamentStage>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tournamentRound, setTournamentRound] = useState<TournamentRound | null>(null);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<BalanceQuestion[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [roundWinners, setRoundWinners] = useState<RoundWinners>([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [finalWinner, setFinalWinner] = useState<string | null>(null);

  // 카테고리 선택
  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setStage("tournament-select");
  };

  // 토너먼트 라운드 선택
  const selectTournamentRound = (round: TournamentRound) => {
    setTournamentRound(round);
    
    const questionCount = round === "32" ? 32 : 64;
    const questions = selectedCategory?.questions || [];
    
    // 질문을 섞고 필요한 만큼 선택
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(questionCount, questions.length));
    
    // 첫 라운드 시작
    setCurrentRoundQuestions(selectedQuestions);
    setCurrentMatchIndex(0);
    setRoundWinners([]);
    setCurrentRoundNumber(1);
    setFinalWinner(null);
    setStage("tournament");
  };

  // 매치 승자 선택
  const selectMatchWinner = (choice: "A" | "B") => {
    const currentMatch = currentRoundQuestions[currentMatchIndex];
    if (!currentMatch) return;

    const winnerText = choice === "A" ? currentMatch.optionA : currentMatch.optionB;
    const winnerImage = choice === "A" ? currentMatch.imageA : currentMatch.imageB;
    
    // 현재 라운드의 승자 목록에 추가 (텍스트와 이미지 함께 저장)
    const winner: RoundWinner = {
      text: winnerText,
      image: winnerImage,
    };
    const newWinners = [...roundWinners, winner];
    setRoundWinners(newWinners);

    // 다음 매치로 이동
    const nextMatchIndex = currentMatchIndex + 1;
    
    if (nextMatchIndex < currentRoundQuestions.length) {
      // 같은 라운드의 다음 매치
      setCurrentMatchIndex(nextMatchIndex);
    } else {
      // 현재 라운드 완료 - 다음 라운드 준비
      const remainingCount = Math.floor(newWinners.length / 2);
      
      if (remainingCount === 0) {
        // 최종 우승자
        setFinalWinner(newWinners[0].text);
        setStage("result");
        return;
      }

      // 다음 라운드 질문 생성
      const nextRoundQuestions: BalanceQuestion[] = [];
      for (let i = 0; i < remainingCount; i++) {
        const winner1 = newWinners[i * 2];
        const winner2 = newWinners[i * 2 + 1];
        if (winner1 && winner2) {
          nextRoundQuestions.push({
            id: Date.now() + i,
            optionA: winner1.text,
            optionB: winner2.text,
            imageA: winner1.image,
            imageB: winner2.image,
          });
        }
      }

      // 다음 라운드 시작
      setCurrentRoundQuestions(nextRoundQuestions);
      setCurrentMatchIndex(0);
      setRoundWinners([]);
      setCurrentRoundNumber(currentRoundNumber + 1);
    }
  };

  // 리셋
  const reset = () => {
    setStage("category");
    setSelectedCategory(null);
    setTournamentRound(null);
    setCurrentRoundQuestions([]);
    setCurrentMatchIndex(0);
    setRoundWinners([]);
    setCurrentRoundNumber(1);
    setFinalWinner(null);
  };

  // 현재 매치 가져오기
  const currentMatch = currentRoundQuestions[currentMatchIndex];
  
  // 총 라운드 수 계산
  const totalRounds = tournamentRound === "32" ? 5 : 6; // 32강: 5라운드, 64강: 6라운드

  return (
    <GameLayout title="밸런스 게임">
      <div className="flex flex-col h-full gap-6">
        {/* 카테고리 선택 화면 */}
        {stage === "category" && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="text-white text-2xl font-bold text-center">
              카테고리를 선택하세요
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category)}
                  className="py-6 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-lg transition-colors shadow-lg"
                >
                  {category.name}
                  <div className="text-sm text-slate-400 mt-1">
                    {category.questions.length}개 질문
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 토너먼트 라운드 선택 화면 */}
        {stage === "tournament-select" && selectedCategory && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-white text-2xl font-bold text-center">
              {selectedCategory.name}
              <br />
              <span className="text-lg text-slate-400 font-normal">
                토너먼트 라운드를 선택하세요
              </span>
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => selectTournamentRound("32")}
                className="flex-1 py-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-xl transition-colors"
              >
                32강
              </button>
              <button
                onClick={() => selectTournamentRound("64")}
                className="flex-1 py-12 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition-colors"
              >
                64강
              </button>
            </div>
            <button
              onClick={reset}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              뒤로가기
            </button>
          </div>
        )}

        {/* 토너먼트 진행 화면 */}
        {stage === "tournament" && currentMatch && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {/* 진행 상태 */}
            <div className="text-white text-center">
              <div className="text-lg font-semibold">
                {tournamentRound}강 토너먼트
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {currentRoundNumber}라운드 / {totalRounds}라운드
                <br />
                매치 {currentMatchIndex + 1}/{currentRoundQuestions.length}
              </div>
            </div>

            {/* 선택지 */}
            <div className="w-full flex gap-4">
              <button
                onClick={() => selectMatchWinner("A")}
                className="flex-1 py-12 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl rounded-xl transition-all duration-300 shadow-lg hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                {currentMatch.imageA && (
                  <img 
                    src={currentMatch.imageA} 
                    alt={currentMatch.optionA}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      // 이미지 로드 실패 시 숨김
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span>{currentMatch.optionA}</span>
              </button>

              <div className="flex items-center text-white text-3xl font-bold">
                VS
              </div>

              <button
                onClick={() => selectMatchWinner("B")}
                className="flex-1 py-12 px-6 bg-red-500 hover:bg-red-600 text-white font-bold text-2xl rounded-xl transition-all duration-300 shadow-lg hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                {currentMatch.imageB && (
                  <img 
                    src={currentMatch.imageB} 
                    alt={currentMatch.optionB}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      // 이미지 로드 실패 시 숨김
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span>{currentMatch.optionB}</span>
              </button>
            </div>

            {/* 뒤로가기 버튼 */}
            <button
              onClick={reset}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              뒤로가기
            </button>
          </div>
        )}

        {/* 결과 화면 */}
        {stage === "result" && finalWinner && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-yellow-400 text-3xl font-bold text-center animate-bounce">
              🏆 우승! 🏆
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-5xl font-bold py-16 px-20 rounded-xl shadow-2xl animate-bounce">
              {finalWinner}
            </div>
            <div className="flex gap-4">
              <button
                onClick={reset}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-colors"
              >
                다시하기
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
