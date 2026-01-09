import { useState, useEffect } from "react";
import GameLayout from "../layouts/GameLayout";
import { ALL_QUIZ_DATA, DIFFICULTY_LABELS } from "../data/quizData";
import type { QuizItem, QuizTopic } from "../data/quizData";

// 퀴즈의 3단계 진행 플로우 정의
type QuizStage = "SELECT" | "PLAY" | "RESULT";

// 난이도별 타이머 시간 설정 (초 단위)
const TIMER_DURATION: { [key: string]: number } = {
  "하": 10, 
  "중": 10,
  "상": 20,
};

const QUESTION_COUNT = 10;
const GAME_TITLE = "퀴즈 게임";

// 헬퍼 함수: 배열을 섞고 앞에서 N개 선택 (문제 랜덤 추출용)
const shuffleAndSelect = (arr: QuizItem[], count: number): QuizItem[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function QuizPage() {
  // 메인 상태
  const [stage, setStage] = useState<QuizStage>("SELECT");
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [quizSet, setQuizSet] = useState<QuizItem[]>([]); 

  // 퀴즈 진행 상태
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]); 

  // 타이머 상태
  const [timer, setTimer] = useState(0); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // ==================================================================
  // 🎯 핵심 로직 함수
  // ==================================================================

  // 퀴즈 시작 버튼 클릭 시 호출
  const handleStartQuiz = () => {
    if (!selectedTopic || !selectedDifficulty) return;

    const fullPool = selectedTopic.difficulties[selectedDifficulty] || [];
    if (fullPool.length < QUESTION_COUNT) {
      alert("문제가 부족합니다. 데이터 셋을 확인해주세요.");
      return;
    }

    // 상태 초기화 및 Stage 변경
    setQuizSet(shuffleAndSelect(fullPool, QUESTION_COUNT));
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    
    // 타이머 초기 설정 및 작동 시작
    const initialTime = TIMER_DURATION[selectedDifficulty];
    setTimer(initialTime);
    setIsTimerActive(true); 
    setStage("PLAY");
  };

  // 다음 문제로 넘어가거나 퀴즈를 종료하는 로직 (내부 재사용)
  const proceedToNextQuestion = (userAnswerIndex: number) => {
    const currentQuestion = quizSet[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // 1. 사용자 답변 저장
    setUserAnswers((prev) => [...prev, userAnswerIndex]);

    // 2. 점수 업데이트 (타임아웃은 점수 없음)
    if (userAnswerIndex !== -1 && userAnswerIndex === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }

    // 3. 다음 문제로 진행 또는 퀴즈 종료
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < QUESTION_COUNT) {
      setCurrentQuestionIndex(nextIndex);
      
      // 다음 문제의 타이머 시간으로 재설정 및 재시작
      const nextTime = TIMER_DURATION[selectedDifficulty!];
      setTimer(nextTime);
      setIsTimerActive(true); 
    } else {
      // 모든 문제를 다 풀었으면 결과 화면으로 전환
      setIsTimerActive(false);
      setStage("RESULT");
    }
  };

  // 답변 버튼 클릭 시 호출 (사용자 입력)
  const handleAnswerClick = (answerIndex: number) => {
    // 타이머 작동 중지
    setIsTimerActive(false); 
    proceedToNextQuestion(answerIndex);
  };

  // 타이머가 0이 되었을 때 호출 (자동 오답 처리)
  const handleTimeout = () => {
    // -1은 '선택 안 함' 또는 '시간 초과'를 의미 (오답 처리)
    proceedToNextQuestion(-1); 
  };

  // ==================================================================
  // ⏳ 타이머 useEffect
  // ==================================================================
  useEffect(() => {
    if (!isTimerActive || stage !== "PLAY") return;

    const interval = setInterval(() => {
        setTimer((prev) => {
            if (prev <= 1) {
                clearInterval(interval);
                handleTimeout(); // 시간이 0이 되면 타임아웃 처리
                return 0;
            }
            return prev - 1;
        });
    }, 1000); // 1초 간격

    // 클린업 함수: 컴포넌트 정리 시 인터벌 해제
    return () => clearInterval(interval);
  }, [isTimerActive, currentQuestionIndex, selectedDifficulty, stage]);

  // ==================================================================
  // 🖼️ 렌더링 함수
  // ==================================================================

  // 점수에 따른 설명 텍스트 반환
  const getScoreMessage = (score: number): string => {
    if (score === QUESTION_COUNT) {
      return "당신은 진정한 퀴즈 마스터입니다! 🏆 완벽한 실력으로 모든 문제를 정복하셨네요. 정말 대단합니다!";
    } else if (score >= 8) {
      return "훌륭한 실력이에요! 🎯 거의 만점에 가까운 점수네요. 조금만 더 노력하면 만점도 가능할 것 같아요!";
    } else if (score >= 6) {
      return "괜찮은 점수예요! 👍 평균 이상의 실력을 보여주셨네요. 조금만 더 집중하면 더 좋은 결과를 낼 수 있을 거예요.";
    } else if (score >= 4) {
      return "아쉽네요... 😅 좀 더 공부하고 다시 도전해보세요. 실력 향상의 여지가 충분히 있어요!";
    } else if (score >= 2) {
      return "음... 이 정도면 좀 심각한데요? 😂 혹시 운이 없었나요? 아니면 정말 모르는 건가요? 다시 한 번 도전해보세요!";
    } else {
      return "이건 좀... 😱 정말로 이렇게 낮은 점수가 나올 수 있나요? 혹시 눈을 감고 찍으신 건 아니죠? 다시 한 번 진지하게 도전해보세요!";
    }
  };

  // ------------------------------------------------------------------
  // Stage 1: 주제 및 난이도 선택 화면 
  // ------------------------------------------------------------------
  const renderSelectionStage = () => (
    <div className="flex flex-col space-y-8 p-4 text-white">
      <h2 className="text-2xl font-bold text-center">주제 선택</h2>
      {/* 주제 선택 UI */}
      <div className="grid grid-cols-2 gap-4">
        {ALL_QUIZ_DATA.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className={`p-4 rounded-lg font-semibold transition-all shadow-md ${
              selectedTopic?.id === topic.id
                ? "bg-blue-600 border-2 border-blue-400"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {topic.name}
          </button>
        ))}
      </div>

      {selectedTopic && (
        <>
          <h2 className="text-2xl font-bold text-center mt-4">난이도 선택</h2>
          {/* 난이도 선택 UI */}
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_LABELS.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`p-3 rounded-lg font-semibold transition-all shadow-md ${
                  selectedDifficulty === diff
                    ? "bg-green-600 border-2 border-green-400"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={!selectedTopic || !selectedDifficulty}
            className="mt-8 py-3 rounded-xl text-lg font-extrabold transition-colors shadow-xl disabled:opacity-50
                       bg-red-500 hover:bg-red-600 text-white"
          >
            퀴즈 시작! ({QUESTION_COUNT}문제)
          </button>
        </>
      )}
    </div>
  );
  
  // ------------------------------------------------------------------
  // Stage 2: 퀴즈 진행 화면 (PLAY)
  // ------------------------------------------------------------------
  const renderPlayStage = () => {
    if (!quizSet.length) return null; 
    
    const currentQuestion = quizSet[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <div className="flex flex-col h-full justify-between p-4 text-white">
        {/* 상단 진행 상태 및 타이머 */}
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-blue-300">
            {selectedTopic?.name} ({selectedDifficulty})
          </p>
          <p className="text-4xl font-extrabold mt-2">
            {currentQuestionIndex + 1} / {QUESTION_COUNT}
          </p>
          
          {/* 타이머 표시 */}
          <div className={`mt-4 text-6xl font-black ${timer <= 3 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
            {timer}
          </div>
        </div>

        {/* 문제 내용 */}
        <div className="flex-1 bg-slate-800 p-6 rounded-xl shadow-lg flex items-center justify-center mb-6">
          <p className="text-2xl font-semibold text-center leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* 선택지 버튼들 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              className="w-full py-4 px-4 text-lg text-left rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors shadow-md"
            >
              <span className="font-mono mr-2 text-yellow-300">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Stage 3: 결과 화면 (RESULT)
  // ------------------------------------------------------------------
  const renderResultStage = () => (
    <div className="text-white text-center p-8 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
            🎉 퀴즈 완료!
        </h2>
        <p className="text-xl text-slate-300 mb-6">
            {selectedTopic?.name} ({selectedDifficulty})
        </p>
        
        {/* 최종 점수 */}
        <div className="p-8 bg-slate-800 rounded-2xl shadow-xl w-full max-w-xs mb-8">
            <p className="text-2xl font-semibold mb-2">당신의 점수는?</p>
            <p className="text-6xl font-bold text-green-400">
                {score}
            </p>
            <p className="text-xl text-slate-400">
                / {QUESTION_COUNT}
            </p>
        </div>

        {/* 점수에 따른 설명 */}
        <div className="w-full max-w-md mb-6 p-6 bg-slate-800 rounded-xl shadow-lg">
            <p className="text-lg text-center leading-relaxed">
                {getScoreMessage(score)}
            </p>
        </div>

        {/* 결과 분석 섹션 */}
        <div className="w-full max-w-md text-left space-y-3">
            <h3 className="text-xl font-bold border-b border-slate-700 pb-2 mb-3">문제별 요약</h3>
            {quizSet.map((question, index) => {
                const userAnswerIndex = userAnswers[index]; 
                const isTimeout = userAnswerIndex === -1; 
                const isCorrect = !isTimeout && userAnswerIndex === question.correctAnswerIndex;
                
                const icon = isCorrect ? "✅" : (isTimeout ? "⏳" : "❌");
                const userChoice = isTimeout ? '시간 초과' : question.options[userAnswerIndex];
                const correctChoice = question.options[question.correctAnswerIndex];

                return (
                    <div key={question.id} className={`p-3 rounded-lg ${isCorrect ? 'bg-slate-700' : (isTimeout ? 'bg-orange-900/40' : 'bg-red-900/40')}`}>
                        <p className="font-semibold text-base">
                            {icon} {index + 1}. {question.question}
                        </p>
                        {!isCorrect && (
                            <div className="mt-1 text-sm text-slate-300">
                                <p className={isTimeout ? 'text-orange-300' : 'text-red-300'}>선택: {userChoice}</p>
                                <p className="text-green-300">정답: {correctChoice}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        <button 
            onClick={() => setStage("SELECT")} 
            className="mt-10 py-3 px-8 rounded-xl text-xl font-extrabold bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
        >
            다른 퀴즈 선택하기
        </button>
    </div>
  );

  // 최종 렌더링
  return (
    <GameLayout title={GAME_TITLE}>
      {stage === "SELECT" && renderSelectionStage()}
      {stage === "PLAY" && renderPlayStage()}
      {stage === "RESULT" && renderResultStage()}
    </GameLayout>
  );
}