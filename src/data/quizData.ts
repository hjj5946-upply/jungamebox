// src/data/quizData.ts

export type QuizItem = {
    id: number;
    question: string;
    options: string[];
    correctAnswerIndex: number; // 0부터 시작
    explanation?: string;
  };
  
  export type DifficultySet = {
    [key: string]: QuizItem[];
  };
  
  export type QuizTopic = {
    id: string; 
    name: string; 
    difficulties: DifficultySet;
  };
  
  // 헬퍼 함수: 더미 문제 생성 (IT 주제용)
  const createDummyQuestions = (prefix: string, count: number): QuizItem[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      question: `${prefix} 더미 문제 #${i + 1}의 정답은?`,
      options: ["선택지 A", "선택지 B (정답)", "선택지 C"],
      correctAnswerIndex: 1,
      explanation: `이것은 ${prefix} 더미 문제입니다. 답은 B입니다.`,
    }));
  
  // ----------------------------------------------------
  // 실제 일반 상식 퀴즈 데이터 (총 90문제)
  // ----------------------------------------------------
  
  const GENERAL_QUIZ_EASY: QuizItem[] = [
      // 30 문제 (하 난이도)
      { id: 1, question: "태양계의 중심에 있는 항성은 무엇인가요?", options: ["지구", "달", "태양", "화성"], correctAnswerIndex: 2 },
      { id: 2, question: "대한민국의 수도는 어디인가요?", options: ["부산", "서울", "인천", "대전"], correctAnswerIndex: 1 },
      { id: 3, question: "사람의 피가 붉은색인 주된 이유는 무엇 때문인가요?", options: ["산소", "헤모글로빈", "단백질", "물"], correctAnswerIndex: 1 },
      { id: 4, question: "세상에서 가장 큰 포유류는 무엇인가요?", options: ["코끼리", "기린", "흰긴수염고래", "하마"], correctAnswerIndex: 2 },
      { id: 5, question: "물의 화학 기호는 무엇인가요?", options: ["CO2", "O2", "H2O", "NaCl"], correctAnswerIndex: 2 },
      { id: 6, question: "세계에서 가장 높은 산은 무엇인가요?", options: ["K2", "킬리만자로", "에베레스트", "후지산"], correctAnswerIndex: 2 },
      { id: 7, question: "피카소가 주로 활동했던 예술 사조는 무엇인가요?", options: ["인상주의", "초현실주의", "입체파", "낭만주의"], correctAnswerIndex: 2 },
      { id: 8, question: "한국의 독립 기념일은 몇 월 며칠인가요?", options: ["3월 1일", "6월 6일", "8월 15일", "10월 3일"], correctAnswerIndex: 2 },
      { id: 9, question: "100도에서 끓는 액체는 무엇인가요? (표준 기압 기준)", options: ["알코올", "기름", "물", "식초"], correctAnswerIndex: 2 },
      { id: 10, question: "지구상에서 가장 빠른 육상 동물은 무엇인가요?", options: ["사자", "치타", "표범", "영양"], correctAnswerIndex: 1 },
      { id: 11, question: "프랑스의 상징적인 탑은 무엇인가요?", options: ["빅벤", "피사의 사탑", "에펠탑", "콜로세움"], correctAnswerIndex: 2 },
      { id: 12, question: "미국 달러 지폐에 등장하는 인물이 아닌 사람은?", options: ["조지 워싱턴", "벤저민 프랭클린", "에이브러햄 링컨", "토머스 제퍼슨"], correctAnswerIndex: 3 },
      { id: 13, question: "지구의 위성은 무엇인가요?", options: ["화성", "태양", "달", "금성"], correctAnswerIndex: 2 },
      { id: 14, question: "컴퓨터의 중앙 처리 장치를 뜻하는 약자는?", options: ["RAM", "ROM", "CPU", "USB"], correctAnswerIndex: 2 },
      { id: 15, question: "사계절 중 가장 추운 계절은 무엇인가요?", options: ["봄", "여름", "가을", "겨울"], correctAnswerIndex: 3 },
      { id: 16, question: "토끼가 좋아하는 먹이로 유명한 것은?", options: ["고기", "당근", "생선", "빵"], correctAnswerIndex: 1 },
      { id: 17, question: "올림픽을 4년마다 개최하는 이유는 무엇인가요?", options: ["휴식 기간", "고대 올림픽 전통", "경기장 건설 시간", "경제적 이유"], correctAnswerIndex: 1 },
      { id: 18, question: "대한민국 국기인 태극기에 흰색 바탕이 의미하는 것은?", options: ["평화", "순결", "자유", "희망"], correctAnswerIndex: 0 },
      { id: 19, question: "사람의 뼈는 대략 몇 개인가요?", options: ["100개", "206개", "300개", "404개"], correctAnswerIndex: 1 },
      { id: 20, question: "바이올린을 연주할 때 사용하는 막대는 무엇인가요?", options: ["채", "활", "스틱", "피크"], correctAnswerIndex: 1 },
      { id: 21, question: "색의 삼원색은 빨강, 파랑, 그리고 무엇인가요?", options: ["보라", "검정", "노랑", "흰색"], correctAnswerIndex: 2 },
      { id: 22, question: "축구에서 페널티킥을 하는 지점은 골라인으로부터 몇 미터 떨어진 곳인가요?", options: ["9.15m", "11m", "12m", "16.5m"], correctAnswerIndex: 1 },
      { id: 23, question: "시계의 시침이 1시간에 도는 각도는 몇 도인가요?", options: ["15도", "30도", "45도", "60도"], correctAnswerIndex: 1 },
      { id: 24, question: "지구의 대기 중 가장 많은 비중을 차지하는 기체는?", options: ["산소", "이산화탄소", "질소", "아르곤"], correctAnswerIndex: 2 },
      { id: 25, question: "유럽과 아시아를 가르는 산맥은 무엇인가요?", options: ["알프스", "로키", "우랄", "히말라야"], correctAnswerIndex: 2 },
      { id: 26, question: "소금의 화학명은?", options: ["수산화나트륨", "염화칼륨", "염화나트륨", "황산"], correctAnswerIndex: 2 },
      { id: 27, question: "셰익스피어의 4대 비극에 포함되지 않는 작품은?", options: ["햄릿", "로미오와 줄리엣", "리어왕", "오셀로"], correctAnswerIndex: 1 },
      { id: 28, question: "미국의 초대 대통령은?", options: ["토머스 제퍼슨", "존 F. 케네디", "프랭클린 D. 루스벨트", "조지 워싱턴"], correctAnswerIndex: 3 },
      { id: 29, question: "사람의 몸에서 가장 큰 장기는?", options: ["심장", "간", "뇌", "폐"], correctAnswerIndex: 1 },
      { id: 30, question: "화폐를 만드는 기관은 무엇인가요?", options: ["증권거래소", "한국은행", "국세청", "금융감독원"], correctAnswerIndex: 1 },
  ];
  
  const GENERAL_QUIZ_NORMAL: QuizItem[] = [
      // 30 문제 (중 난이도)
      { id: 1, question: "우리나라 역사상 최초의 통일 왕국은?", options: ["고구려", "백제", "신라", "발해"], correctAnswerIndex: 2 },
      { id: 2, question: "이집트의 상징적인 고대 건축물은 무엇인가요?", options: ["파르테논 신전", "피라미드", "콜로세움", "만리장성"], correctAnswerIndex: 1 },
      { id: 3, question: "영국의 자연과학자로 '종의 기원'을 저술한 사람은?", options: ["아이작 뉴턴", "알베르트 아인슈타인", "찰스 다윈", "갈릴레오 갈릴레이"], correctAnswerIndex: 2 },
      { id: 4, question: "빛의 속도는 초당 약 몇 km인가요?", options: ["약 30만 km", "약 15만 km", "약 50만 km", "약 10만 km"], correctAnswerIndex: 0 },
      { id: 5, question: "독일의 수도는 어디인가요?", options: ["파리", "베를린", "런던", "로마"], correctAnswerIndex: 1 },
      { id: 6, question: "양파를 깎을 때 눈물이 나는 화학 물질은?", options: ["캡사이신", "알리신", "프로판티알 S-옥사이드", "타닌"], correctAnswerIndex: 2 },
      { id: 7, question: "제2차 세계대전의 주요 연합군에 속하지 않는 나라는?", options: ["미국", "영국", "독일", "소련"], correctAnswerIndex: 2 },
      { id: 8, question: "물체의 움직임을 기술하는 세 가지 법칙을 정립한 과학자는?", options: ["아이작 뉴턴", "알베르트 아인슈타인", "니콜라 테슬라", "토머스 에디슨"], correctAnswerIndex: 0 },
      { id: 9, question: "음식의 맛을 느끼는 혀의 기관은 무엇인가요?", options: ["점액선", "침샘", "미뢰", "인후"], correctAnswerIndex: 2 },
      { id: 10, question: "유네스코 본부가 위치한 도시는?", options: ["뉴욕", "제네바", "파리", "런던"], correctAnswerIndex: 2 },
      { id: 11, question: "지구의 자전 주기는 약 얼마인가요?", options: ["1년", "24시간", "12시간", "30일"], correctAnswerIndex: 1 },
      { id: 12, question: "원자핵을 구성하는 입자가 아닌 것은?", options: ["양성자", "중성자", "전자", "쿼크"], correctAnswerIndex: 2 },
      { id: 13, question: "한국에서 가장 긴 강은 무엇인가요?", options: ["낙동강", "한강", "금강", "압록강"], correctAnswerIndex: 3 },
      { id: 14, question: "고전 음악의 '악성'으로 불리며 교향곡 '운명'을 작곡한 사람은?", options: ["모차르트", "바흐", "베토벤", "쇼팽"], correctAnswerIndex: 2 },
      { id: 15, question: "금(Gold)의 원소 기호는 무엇인가요?", options: ["Ag", "Fe", "Au", "Cu"], correctAnswerIndex: 2 },
      { id: 16, question: "인터넷 주소에서 국가 도메인이 '.jp'인 나라는?", options: ["중국", "일본", "인도", "필리핀"], correctAnswerIndex: 1 },
      { id: 17, question: "조선시대 임진왜란 당시 활약했던 명나라 장수는?", options: ["진린", "이여송", "도요토미 히데요시", "고니시 유키나가"], correctAnswerIndex: 1 },
      { id: 18, question: "사람의 뇌 중 시각 정보를 처리하는 부분은?", options: ["전두엽", "두정엽", "측두엽", "후두엽"], correctAnswerIndex: 3 },
      { id: 19, question: "세계 최초로 달에 착륙한 우주선은?", options: ["소유즈", "아폴로 11호", "보스토크 1호", "스카이랩"], correctAnswerIndex: 1 },
      { id: 20, question: "유럽 연합(EU)의 본부가 있는 도시는?", options: ["파리", "로마", "브뤼셀", "베를린"], correctAnswerIndex: 2 },
      { id: 21, question: "식물에서 물을 뿌리부터 잎까지 운반하는 조직은?", options: ["체관", "물관", "형성층", "표피"], correctAnswerIndex: 1 },
      { id: 22, question: "경제학의 아버지로 불리며 '국부론'을 저술한 사람은?", options: ["존 메이너드 케인스", "아담 스미스", "카를 마르크스", "밀턴 프리드먼"], correctAnswerIndex: 1 },
      { id: 23, question: "우리나라에서 가장 면적이 넓은 행정구역은?", options: ["경기도", "경상북도", "강원도", "제주도"], correctAnswerIndex: 1 },
      { id: 24, question: "러시아의 수도는?", options: ["상트페테르부르크", "키예프", "모스크바", "카잔"], correctAnswerIndex: 2 },
      { id: 25, question: "미술 작품 '모나리자'를 그린 화가는?", options: ["빈센트 반 고흐", "클로드 모네", "레오나르도 다빈치", "파블로 피카소"], correctAnswerIndex: 2 },
      { id: 26, question: "해발고도 0m인 지점의 기압을 나타내는 단위는?", options: ["파스칼", "헤르츠", "1기압", "볼트"], correctAnswerIndex: 2 },
      { id: 27, question: "우리나라의 국가 지정 국보 1호는 무엇인가요?", options: ["숭례문", "흥인지문", "남대문", "동대문"], correctAnswerIndex: 0 },
      { id: 28, question: "소설 '어린 왕자'의 작가는?", options: ["알베르 카뮈", "생텍쥐페리", "빅토르 위고", "헤르만 헤세"], correctAnswerIndex: 1 },
      { id: 29, question: "지진의 규모를 나타내는 척도는?", options: ["데시벨", "리히터", "켈빈", "화씨"], correctAnswerIndex: 1 },
      { id: 30, question: "세계에서 가장 인구가 많은 나라는?", options: ["미국", "인도", "중국", "러시아"], correctAnswerIndex: 1 },
  ];
  
  const GENERAL_QUIZ_HARD: QuizItem[] = [
      // 30 문제 (상 난이도)
      { id: 1, question: "로마 공화정 시대의 '3두 정치'에 참여하지 않은 인물은?", options: ["카이사르", "폼페이우스", "크라수스", "옥타비아누스"], correctAnswerIndex: 3 },
      { id: 2, question: "물리학에서 '불확정성의 원리'를 제시한 과학자는?", options: ["닐스 보어", "베르너 하이젠베르크", "에르빈 슈뢰딩거", "막스 플랑크"], correctAnswerIndex: 1 },
      { id: 3, question: "경제학 용어로, 수요나 공급의 변화에 대한 가격의 민감도를 나타내는 지표는?", options: ["인플레이션", "GDP", "탄력성", "필립스 곡선"], correctAnswerIndex: 2 },
      { id: 4, question: "단군이 고조선을 건국한 해는 기원전 몇 년인가요?", options: ["2333년", "108년", "37년", "57년"], correctAnswerIndex: 0 },
      { id: 5, question: "철학자 칸트가 제시한 '정언 명령(定言命令)'의 개념이 속한 분야는?", options: ["형이상학", "윤리학", "미학", "논리학"], correctAnswerIndex: 1 },
      { id: 6, question: "천문학에서 별의 밝기를 나타내는 등급 체계에서, 숫자가 낮을수록 밝기가 어떤가요?", options: ["어둡다", "밝다", "변함없다", "알 수 없다"], correctAnswerIndex: 1 },
      { id: 7, question: "양자역학에서 두 개 이상의 입자가 서로 연결되어 있어, 한 입자의 상태를 알면 즉시 다른 입자의 상태를 알 수 있는 현상은?", options: ["터널링 효과", "양자 도약", "양자 얽힘", "파동-입자 이중성"], correctAnswerIndex: 2 },
      { id: 8, question: "조선시대 세종대왕 때 편찬된 농서로, 농민의 경험을 바탕으로 기술한 것은?", options: ["동의보감", "경국대전", "농사직설", "훈민정음"], correctAnswerIndex: 2 },
      { id: 9, question: "화학에서 모든 원소의 원자 번호 8번을 차지하는 것은?", options: ["탄소", "수소", "산소", "질소"], correctAnswerIndex: 2 },
      { id: 10, question: "영국의 식민 지배를 받았던 인도의 독립 운동을 이끈 사상가이자 정치 지도자는?", options: ["네루", "타고르", "간디", "마오쩌둥"], correctAnswerIndex: 2 },
      { id: 11, question: "생물학에서 유전 정보를 담고 있는 이중 나선 구조 물질은?", options: ["RNA", "단백질", "DNA", "리보솜"], correctAnswerIndex: 2 },
      { id: 12, question: "르네상스의 3대 거장(레오나르도 다빈치, 미켈란젤로, 라파엘로) 중, '천지창조'를 그린 사람은?", options: ["레오나르도 다빈치", "미켈란젤로", "라파엘로", "도나텔로"], correctAnswerIndex: 1 },
      { id: 13, question: "국제법상, 한 국가의 영해는 해안선으로부터 몇 해리까지 인정되나요?", options: ["3해리", "6해리", "12해리", "200해리"], correctAnswerIndex: 2 },
      { id: 14, question: "제임스 조이스의 대표작으로, 의식의 흐름 기법이 사용된 소설은?", options: ["백년의 고독", "율리시스", "잃어버린 시간을 찾아서", "노인과 바다"], correctAnswerIndex: 1 },
      { id: 15, question: "정치학에서 권력 분립의 원칙을 주장한 사상가는?", options: ["루소", "홉스", "몽테스키외", "로크"], correctAnswerIndex: 2 },
      { id: 16, question: "금융 용어로, 시장에 돈이 너무 많이 풀려 물가가 지속적으로 상승하는 현상은?", options: ["디플레이션", "스테그플레이션", "인플레이션", "디스인플레이션"], correctAnswerIndex: 2 },
      { id: 17, question: "고대 그리스 철학자 플라톤이 설립한 학문의 전당은?", options: ["리케이온", "아카데미아", "스토아", "에피쿠로스 학파"], correctAnswerIndex: 1 },
      { id: 18, question: "생물의 분류 단계 중, '속'과 '과' 사이에 위치하는 단계는?", options: ["종", "목", "강", "문"], correctAnswerIndex: 1 },
      { id: 19, question: "세계 최초로 상업 운행을 시작한 지하철이 개통된 도시는?", options: ["뉴욕", "파리", "베를린", "런던"], correctAnswerIndex: 3 },
      { id: 20, question: "한국에서 가장 오래된 금속활자 인쇄물로 알려진 것은?", options: ["무구정광대다라니경", "팔만대장경", "직지심체요절", "삼국사기"], correctAnswerIndex: 2 },
      { id: 21, question: "광합성에 필요한 주요 기체는?", options: ["산소", "질소", "수소", "이산화탄소"], correctAnswerIndex: 3 },
      { id: 22, question: "전기 저항의 단위를 나타내는 기호는?", options: ["V", "A", "Ω", "W"], correctAnswerIndex: 2 },
      { id: 23, question: "현대 올림픽을 부활시킨 사람은?", options: ["피에르 드 쿠베르탱", "제임스 E. 설리반", "디오니시오스 비켈라스", "에반젤로스 자파스"], correctAnswerIndex: 0 },
      { id: 24, question: "태양계 행성 중 '고리'가 가장 뚜렷하게 보이는 행성은?", options: ["목성", "천왕성", "토성", "해왕성"], correctAnswerIndex: 2 },
      { id: 25, question: "조선시대, 왕이 거처하고 정무를 보던 공식적인 궁궐은?", options: ["창덕궁", "덕수궁", "경복궁", "창경궁"], correctAnswerIndex: 2 },
      { id: 26, question: "고대 7대 불가사의에 포함되지 않는 것은?", options: ["이집트 기자의 대피라미드", "바벨탑", "올림피아 제우스 신상", "로도스의 거상"], correctAnswerIndex: 1 },
      { id: 27, question: "미술에서 명암의 대비를 극대화하여 드라마틱한 효과를 연출하는 기법은?", options: ["스푸마토", "키아로스쿠로", "원근법", "데생"], correctAnswerIndex: 1 },
      { id: 28, question: "지정학적으로 남반구에 위치하며, 수도가 캔버라인 나라는?", options: ["브라질", "뉴질랜드", "남아프리카공화국", "호주"], correctAnswerIndex: 3 },
      { id: 29, question: "생물체의 체내에서 화학 반응의 속도를 높여주는 단백질은?", options: ["호르몬", "항체", "효소", "비타민"], correctAnswerIndex: 2 },
      { id: 30, question: "법률 용어로, 범죄 행위에 대한 처벌이 그 행위 시점에 비해 가벼워진 경우, 이를 소급하여 적용하는 원칙은?", options: ["죄형법정주의", "일사부재리의 원칙", "유리한 법률 소급의 원칙", "무죄 추정의 원칙"], correctAnswerIndex: 2 },
  ];
  
  export const ALL_QUIZ_DATA: QuizTopic[] = [
    {
      id: "IT",
      name: "IT & 프로그래밍 (더미)",
      difficulties: {
        "하": createDummyQuestions("IT-하", 30), // 30문제로 확장
        "중": createDummyQuestions("IT-중", 30), // 30문제로 확장
        "상": createDummyQuestions("IT-상", 30), // 30문제로 확장
      },
    },
    {
      id: "GENERAL",
      name: "일반 상식",
      difficulties: {
        "하": GENERAL_QUIZ_EASY, // 30문제
        "중": GENERAL_QUIZ_NORMAL, // 30문제
        "상": GENERAL_QUIZ_HARD, // 30문제
      },
    },
  ];
  
  export const DIFFICULTY_LABELS = ["하", "중", "상"];