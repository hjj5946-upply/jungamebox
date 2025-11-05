export type Quote = {
    id: number;
    text: string;
    author: string;
    category: string;
  };
  
  export const QUOTES: Quote[] = [
    // 💪 동기부여
    {
      id: 1,
      text: "행복은 습관이다. 그것을 몸에 지니라.",
      author: "허버드",
      category: "💪 동기부여"
    },
    {
      id: 2,
      text: "성공은 매일 반복한 작은 노력들의 합이다.",
      author: "로버트 콜리어",
      category: "💪 동기부여"
    },
    {
      id: 3,
      text: "당신이 할 수 있다고 믿든 할 수 없다고 믿든 믿는 대로 될 것이다.",
      author: "헨리 포드",
      category: "💪 동기부여"
    },
    {
      id: 4,
      text: "위대한 일을 하려면 행동하는 것뿐만 아니라 꿈을 꾸는 것도 필요하다.",
      author: "아나톨 프랑스",
      category: "💪 동기부여"
    },
    {
      id: 5,
      text: "노력 없이는 아무것도 얻을 수 없다.",
      author: "벤저민 프랭클린",
      category: "💪 동기부여"
    },
  
    // 🎯 성공/목표
    {
      id: 6,
      text: "목표를 세우는 것은 보이지 않는 것을 보이게 만드는 첫 단계이다.",
      author: "토니 로빈스",
      category: "🎯 성공/목표"
    },
    {
      id: 7,
      text: "성공의 비결은 단 한 가지, 잘할 수 있는 일에 광적으로 집중하는 것이다.",
      author: "톰 모나한",
      category: "🎯 성공/목표"
    },
    {
      id: 8,
      text: "계획 없는 목표는 한낱 꿈에 불과하다.",
      author: "생텍쥐페리",
      category: "🎯 성공/목표"
    },
    {
      id: 9,
      text: "성공은 종착역이 아니라 여행이다.",
      author: "로이드 존스",
      category: "🎯 성공/목표"
    },
    {
      id: 10,
      text: "실패는 성공의 어머니다.",
      author: "토마스 에디슨",
      category: "🎯 성공/목표"
    },
  
    // ❤️ 사랑/관계
    {
      id: 11,
      text: "사랑은 언제나 자신보다 남을 낫게 여기는 마음이다.",
      author: "톨스토이",
      category: "❤️ 사랑/관계"
    },
    {
      id: 12,
      text: "진정한 사랑은 서로를 쳐다보는 것이 아니라 같은 방향을 바라보는 것이다.",
      author: "생텍쥐페리",
      category: "❤️ 사랑/관계"
    },
    {
      id: 13,
      text: "사랑받고 싶다면 사랑하라. 그리고 사랑스럽게 행동하라.",
      author: "벤저민 프랭클린",
      category: "❤️ 사랑/관계"
    },
    {
      id: 14,
      text: "친구란 모든 것을 함께 나누는 사람이다.",
      author: "아리스토텔레스",
      category: "❤️ 사랑/관계"
    },
    {
      id: 15,
      text: "가족은 인생이라는 여행의 가장 소중한 동반자다.",
      author: "익명",
      category: "❤️ 사랑/관계"
    },
  
    // 😊 행복/긍정
    {
      id: 16,
      text: "행복의 문이 하나 닫히면 다른 문이 열린다. 그러나 우리는 닫힌 문만 보느라 열린 문을 보지 못한다.",
      author: "헬렌 켈러",
      category: "😊 행복/긍정"
    },
    {
      id: 17,
      text: "행복은 성취의 기쁨과 창조적 노력이 주는 쾌감 속에 있다.",
      author: "프랭클린 루즈벨트",
      category: "😊 행복/긍정"
    },
    {
      id: 18,
      text: "긍정적인 생각은 긍정적인 결과를 만든다.",
      author: "익명",
      category: "😊 행복/긍정"
    },
    {
      id: 19,
      text: "웃음은 마음의 조깅이다.",
      author: "노먼 커즌스",
      category: "😊 행복/긍정"
    },
    {
      id: 20,
      text: "감사하는 마음이 행복의 시작이다.",
      author: "익명",
      category: "😊 행복/긍정"
    },
  
    // 🚀 도전/용기
    {
      id: 21,
      text: "도전은 인생을 흥미롭게 만들며, 도전의 극복이 인생을 의미 있게 한다.",
      author: "조슈아 마린",
      category: "🚀 도전/용기"
    },
    {
      id: 22,
      text: "두려움을 극복하는 최고의 방법은 두려움과 마주하는 것이다.",
      author: "익명",
      category: "🚀 도전/용기"
    },
    {
      id: 23,
      text: "용기는 두려움이 없는 것이 아니라 두려움을 극복하는 것이다.",
      author: "넬슨 만델라",
      category: "🚀 도전/용기"
    },
    {
      id: 24,
      text: "시작이 반이다.",
      author: "한국 속담",
      category: "🚀 도전/용기"
    },
    {
      id: 25,
      text: "안전지대에서 벗어나라. 그곳에서는 꿈이 이루어질 수 없다.",
      author: "익명",
      category: "🚀 도전/용기"
    },
  
    // 🧠 지혜/철학
    {
      id: 26,
      text: "아는 것이 힘이다.",
      author: "프랜시스 베이컨",
      category: "🧠 지혜/철학"
    },
    {
      id: 27,
      text: "나는 생각한다. 고로 존재한다.",
      author: "데카르트",
      category: "🧠 지혜/철학"
    },
    {
      id: 28,
      text: "인생은 가까이서 보면 비극이지만 멀리서 보면 희극이다.",
      author: "찰리 채플린",
      category: "🧠 지혜/철학"
    },
    {
      id: 29,
      text: "진정한 지혜는 자신이 얼마나 모르는지 아는 것이다.",
      author: "소크라테스",
      category: "🧠 지혜/철학"
    },
    {
      id: 30,
      text: "흐르는 물은 썩지 않는다.",
      author: "한국 속담",
      category: "🧠 지혜/철학"
    },
  
    // 💭 인생/삶
    {
      id: 31,
      text: "인생은 자전거를 타는 것과 같다. 균형을 잡으려면 움직여야 한다.",
      author: "알베르트 아인슈타인",
      category: "💭 인생/삶"
    },
    {
      id: 32,
      text: "삶이 있는 한 희망은 있다.",
      author: "키케로",
      category: "💭 인생/삶"
    },
    {
      id: 33,
      text: "오늘이 당신 인생의 첫날이라고 생각하라.",
      author: "익명",
      category: "💭 인생/삶"
    },
    {
      id: 34,
      text: "중요한 것은 얼마나 오래 사느냐가 아니라 얼마나 잘 사느냐이다.",
      author: "마틴 루터 킹",
      category: "💭 인생/삶"
    },
    {
      id: 35,
      text: "인생은 짧고 예술은 길다.",
      author: "히포크라테스",
      category: "💭 인생/삶"
    },
  
    // 추가 명언들
    {
      id: 36,
      text: "천 리 길도 한 걸음부터.",
      author: "노자",
      category: "🚀 도전/용기"
    },
    {
      id: 37,
      text: "좋은 습관은 제2의 천성이다.",
      author: "익명",
      category: "💪 동기부여"
    },
    {
      id: 38,
      text: "시간은 가장 귀한 자산이다.",
      author: "벤저민 프랭클린",
      category: "🧠 지혜/철학"
    },
    {
      id: 39,
      text: "최선을 다하는 것이 성공이다.",
      author: "존 우든",
      category: "🎯 성공/목표"
    },
    {
      id: 40,
      text: "희망은 깨어 있는 자들의 꿈이다.",
      author: "아리스토텔레스",
      category: "😊 행복/긍정"
    },
    {
      id: 41,
      text: "과거는 바꿀 수 없지만 미래는 바꿀 수 있다.",
      author: "익명",
      category: "💭 인생/삶"
    },
    {
      id: 42,
      text: "열정 없이는 위대한 것을 이룰 수 없다.",
      author: "랄프 왈도 에머슨",
      category: "💪 동기부여"
    },
    {
      id: 43,
      text: "작은 일에 최선을 다하는 사람만이 큰 일을 맡을 수 있다.",
      author: "윌리엄 제임스",
      category: "🎯 성공/목표"
    },
    {
      id: 44,
      text: "매일 조금씩 나아지는 것이 위대함으로 가는 길이다.",
      author: "존 우든",
      category: "💪 동기부여"
    },
    {
      id: 45,
      text: "실패는 넘어지는 것이 아니라 넘어진 자리에 머무르는 것이다.",
      author: "익명",
      category: "🚀 도전/용기"
    },
    {
      id: 46,
      text: "기회는 준비된 자에게만 온다.",
      author: "루이 파스퇴르",
      category: "🎯 성공/목표"
    },
    {
      id: 47,
      text: "오늘 할 수 있는 일을 내일로 미루지 마라.",
      author: "벤저민 프랭클린",
      category: "💪 동기부여"
    },
    {
      id: 48,
      text: "인내는 쓰지만 그 열매는 달다.",
      author: "장 자크 루소",
      category: "🧠 지혜/철학"
    },
    {
      id: 49,
      text: "변화를 두려워하지 마라. 그것이 성장의 기회다.",
      author: "익명",
      category: "🚀 도전/용기"
    },
    {
      id: 50,
      text: "작은 것에서 기쁨을 찾는 사람이 진정한 행복을 아는 사람이다.",
      author: "익명",
      category: "😊 행복/긍정"
    }
  ];