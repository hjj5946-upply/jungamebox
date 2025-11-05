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
  // const createDummyQuestions = (prefix: string, count: number): QuizItem[] =>
  //   Array.from({ length: count }, (_, i) => ({
  //     id: i + 1,
  //     question: `${prefix} 더미 문제 #${i + 1}의 정답은?`,
  //     options: ["선택지 A", "선택지 B (정답)", "선택지 C"],
  //     correctAnswerIndex: 1,
  //     explanation: `이것은 ${prefix} 더미 문제입니다. 답은 B입니다.`,
  //   }));
  
  // region 일반상식 (총 90문제)
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
  // endregion ----------------------------------------------

  // IT&프로그래밍 (총 90문제)
  const IT_QUIZ_EASY: QuizItem[] = [
    { 
      "id": 1, 
      "question": "컴퓨터의 모든 계산과 처리를 담당하는 핵심 부품으로, '컴퓨터의 두뇌'라고 불리는 것은 무엇일까요?", 
      "options": ["RAM", "키보드", "CPU", "모니터"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 2, 
      "question": "컴퓨터가 실행 중인 프로그램이나 데이터를 '임시로' 저장하는 공간으로, 전원이 꺼지면 내용이 사라지는 장치는 무엇일까요?", 
      "options": ["HDD", "RAM", "마우스", "CD-ROM"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 3, 
      "question": "파일이나 폴더를 영구적으로 저장하여 전원이 꺼져도 데이터가 유지되는 장치는 무엇일까요? (SSD나 HDD)", 
      "options": ["CPU", "프린터", "웹캠", "저장 장치"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 4, 
      "question": "컴퓨터를 켜자마자 실행되어 하드웨어와 소프트웨어를 관리하고 사용자에게 환경을 제공하는 가장 기본적인 소프트웨어는 무엇일까요? (Windows, macOS 등)", 
      "options": ["응용 프로그램", "운영 체제", "게임", "드라이버"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 5, 
      "question": "사용자로부터 명령이나 데이터를 컴퓨터에 전달하는 장치를 통틀어 무엇이라고 할까요? (예: 키보드, 마우스)", 
      "options": ["처리 장치", "출력 장치", "기억 장치", "입력 장치"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 6, 
      "question": "컴퓨터가 처리한 결과를 사용자에게 보여주거나 인쇄하는 장치를 통틀어 무엇이라고 할까요? (예: 모니터, 프린터)", 
      "options": ["입력 장치", "출력 장치", "저장 장치", "연결 장치"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 7, 
      "question": "컴퓨터를 구성하는 것 중, 모니터, 본체, 키보드 등 손으로 '만질 수 있는' 물리적인 부분을 통틀어 무엇이라고 할까요?", 
      "options": ["펌웨어", "소프트웨어", "미들웨어", "하드웨어"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 8, 
      "question": "컴퓨터를 구성하는 것 중, 운영 체제, 응용 프로그램 등 손으로 '만질 수 없는' 프로그램 부분을 통틀어 무엇이라고 할까요?", 
      "options": ["회로", "소프트웨어", "하드웨어", "모듈"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 9, 
      "question": "인터넷에 접속하여 웹페이지를 볼 때 사용하는 프로그램은 무엇일까요? (예: Chrome, Edge, Safari)", 
      "options": ["메모장", "파일 탐색기", "웹 브라우저", "계산기"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 10, 
      "question": "인터넷에서 웹페이지의 주소를 나타내는 고유한 식별자를 무엇이라고 할까요? (http://로 시작)", 
      "options": ["IP 주소", "도메인 이름", "URL", "쿠키"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 11, 
      "question": "이메일 주소에서 사용자 이름과 도메인 이름(예: naver.com)을 구분하는 데 사용하는 특수 기호는 무엇일까요?", 
      "options": ["#", "&", "@", "%"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 12, 
      "question": "선택한 내용을 '복사'할 때 사용하는 대부분의 프로그램에서 공통된 단축키는 무엇일까요?", 
      "options": ["Ctrl + V", "Ctrl + C", "Ctrl + S", "Ctrl + Z"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 13, 
      "question": "복사하거나 잘라낸 내용을 원하는 위치에 '붙여넣기'할 때 사용하는 단축키는 무엇일까요?", 
      "options": ["Ctrl + P", "Ctrl + X", "Ctrl + A", "Ctrl + V"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 14, 
      "question": "방금 한 작업을 '실행 취소(되돌리기)'할 때 사용하는 단축키는 무엇일까요?", 
      "options": ["Ctrl + Y", "Ctrl + Z", "Ctrl + C", "Ctrl + R"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 15, 
      "question": "컴퓨터가 이해할 수 있도록 사람이 작성하는 명령어들의 집합을 만드는 행위를 무엇이라고 할까요?", 
      "options": ["디자인", "프로그래밍", "타이핑", "편집"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 16, 
      "question": "프로그래밍에서 값을 '저장'해 두었다가 필요할 때마다 꺼내 쓸 수 있도록 하는 저장 공간의 이름을 무엇이라고 할까요?", 
      "options": ["상수", "함수", "클래스", "변수"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 17, 
      "question": "프로그래밍에서 'Hello', '이름'과 같은 **문자들의 나열**을 표현하는 기본적인 데이터 타입은 무엇일까요?", 
      "options": ["숫자 (Number)", "문자열 (String)", "논리 (Boolean)", "배열 (Array)"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 18, 
      "question": "프로그래밍에서 '참(True)' 또는 '거짓(False)' 두 가지 상태만 가지는 데이터 타입은 무엇일까요?", 
      "options": ["정수", "문자", "논리 (Boolean)", "실수"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 19, 
      "question": "프로그래밍 코드를 작성할 때 발생하는 문법적/논리적 오류를 통틀어 무엇이라고 부르나요?", 
      "options": ["에러", "패치", "버그", "업데이트"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 20, 
      "question": "파일 이름의 맨 끝에 붙어 파일의 종류나 형식을 나타내는 것은 무엇일까요? (예: .txt, .jpg, .exe)", 
      "options": ["바탕화면", "경로", "폴더", "확장자"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 21, 
      "question": "컴퓨터나 웹사이트 사용을 시작하기 위해 아이디와 비밀번호를 입력하여 신분을 확인하는 절차를 무엇이라고 할까요?", 
      "options": ["로그아웃", "등록", "로그인", "탈퇴"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 22, 
      "question": "컴퓨터나 인터넷에 연결된 모든 장치에 할당되는 고유한 숫자 주소를 무엇이라고 할까요? (예: 192.168.0.1)", 
      "options": ["URL", "MAC 주소", "전화번호", "IP 주소"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 23, 
      "question": "여러 컴퓨터를 서로 연결하여 정보를 공유하고 통신할 수 있게 해주는 시스템을 무엇이라고 할까요?", 
      "options": ["데이터", "프로그램", "네트워크", "모뎀"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 24, 
      "question": "인터넷을 통해 사진, 문서 등의 데이터를 내 컴퓨터가 아닌 원격 서버에 저장하고 사용하는 서비스를 무엇이라고 할까요? (예: Google Drive)", 
      "options": ["USB 저장", "클라우드 서비스", "백신 프로그램", "HDD 저장"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 25, 
      "question": "파일을 정리하고 분류하며, 여러 파일을 한 곳에 묶어 관리하는 데 사용하는 가상의 공간을 무엇이라고 할까요?", 
      "options": ["바탕화면", "파일", "폴더", "휴지통"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 26, 
      "question": "컴퓨터에서 문서를 화면에 보여주는 출력 장치는 모니터이며, 문서를 종이에 인쇄하는 출력 장치는 무엇일까요?", 
      "options": ["스캐너", "프로젝터", "프린터", "태블릿"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 27, 
      "question": "컴퓨터의 저장 용량을 나타내는 단위 중 가장 작은 기본 단위는 무엇일까요?", 
      "options": ["기가바이트 (GB)", "킬로바이트 (KB)", "메가바이트 (MB)", "테라바이트 (TB)"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 28, 
      "question": "프로그래밍에서 특정 '조건'을 만족할 때만 코드를 실행하도록 흐름을 제어하는 문법을 무엇이라고 할까요?", 
      "options": ["반복문", "조건문", "대입문", "선언문"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 29, 
      "question": "컴퓨터가 처음 켜지면서 운영체제(OS)를 메모리에 불러와 사용할 수 있는 상태로 만드는 과정을 무엇이라고 할까요?", 
      "options": ["종료", "부팅", "재시작", "절전"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 30, 
      "question": "컴퓨터의 속도가 갑자기 느려지거나 파일을 손상시키는 등 악영향을 미치는 악성 프로그램을 통틀어 무엇이라고 할까요?", 
      "options": ["백신", "방화벽", "컴퓨터 바이러스", "드라이버"], 
      "correctAnswerIndex": 2 
    }
  ];

  const IT_QUIZ_NORMAL: QuizItem[] = [
    { 
      "id": 1, 
      "question": "컴퓨터가 0과 1만을 사용하여 데이터를 표현하고 처리하는 방식을 무엇이라고 할까요?", 
      "options": ["십진법", "이진법", "삼진법", "사진법"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 2, 
      "question": "CPU와 RAM 사이에 위치하며, CPU가 자주 사용하는 데이터를 임시로 저장하여 처리 속도를 높이는 아주 빠른 기억 장치는 무엇일까요?", 
      "options": ["레지스터", "HDD", "캐시 메모리", "ROM"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 3, 
      "question": "웹페이지의 구조와 내용을 작성하는 데 사용되는 마크업 언어로, 웹의 기본 뼈대를 만드는 언어는 무엇일까요?", 
      "options": ["CSS", "JavaScript", "Python", "HTML"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 4, 
      "question": "웹페이지에 스타일(색상, 레이아웃 등)을 적용하여 디자인을 꾸미는 데 사용하는 언어는 무엇일까요?", 
      "options": ["HTML", "JavaScript", "CSS", "SQL"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 5, 
      "question": "웹 브라우저에서 동적인 요소(클릭 이벤트, 애니메이션 등)를 처리하여 웹페이지를 상호작용 가능하게 만드는 스크립트 언어는 무엇일까요?", 
      "options": ["Java", "Python", "C#", "JavaScript"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 6, 
      "question": "프로그램에서 특정 작업을 수행하도록 설계된 재사용 가능한 코드 블록을 무엇이라고 할까요? (입력을 받아 출력을 내는 역할)", 
      "options": ["클래스", "변수", "함수", "객체"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 7, 
      "question": "프로그래밍에서 동일한 코드를 여러 번 반복해서 실행하도록 흐름을 제어하는 문법을 무엇이라고 할까요? (예: for, while)", 
      "options": ["조건문", "반복문", "순차문", "대입문"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 8, 
      "question": "프로그램 실행에 필요한 명령어들이 차례대로 담겨 있는 주 기억 장치(RAM)의 영역을 무엇이라고 할까요?", 
      "options": ["데이터 영역", "스택 영역", "힙 영역", "코드 영역"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 9, 
      "question": "유선 또는 무선으로 데이터를 주고받을 때, 장치 간에 통신 규약으로 약속된 규칙의 집합을 무엇이라고 할까요?", 
      "options": ["드라이버", "프로토콜", "인터페이스", "라우터"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 10, 
      "question": "사용자의 컴퓨터에 설치되어 서비스를 요청하는 프로그램을 무엇이라고 할까요? (예: 웹 브라우저)", 
      "options": ["서버", "모뎀", "클라이언트", "라우터"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 11, 
      "question": "네트워크를 통해 서비스를 제공하는 컴퓨터를 무엇이라고 할까요? (데이터를 저장하고, 웹사이트를 호스팅하는 컴퓨터)", 
      "options": ["클라이언트", "서버", "워크스테이션", "노드"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 12, 
      "question": "데이터베이스 관리 시스템(DBMS)에서 데이터를 검색, 삽입, 수정, 삭제하는 데 사용하는 언어는 무엇일까요?", 
      "options": ["HTML", "C++", "Python", "SQL"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 13, 
      "question": "데이터를 순서대로 저장하고 관리하며, 배열과 같이 인덱스(순서 번호)를 사용하여 접근하는 데이터 구조를 무엇이라고 할까요?", 
      "options": ["스택", "큐", "리스트 (배열)", "트리"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 14, 
      "question": "운영 체제가 메모리를 관리하는 기법 중 하나로, 주 기억 장치(RAM)보다 큰 용량을 사용할 수 있도록 보조 기억 장치(HDD/SSD)를 활용하는 기술은 무엇일까요?", 
      "options": ["멀티태스킹", "가상 메모리", "스케줄링", "캐시 메모리"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 15, 
      "question": "컴퓨터의 IP 주소를 사람이 읽기 쉬운 문자 주소(예: google.com)로 변환해주는 시스템을 무엇이라고 할까요?", 
      "options": ["TCP/IP", "FTP", "HTTP", "DNS (Domain Name System)"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 16, 
      "question": "컴퓨터에서 문자를 표현하기 위한 국제적인 표준 인코딩 방식 중 하나로, 전 세계의 대부분의 문자를 표현할 수 있는 것은 무엇일까요?", 
      "options": ["ASCII", "EUC-KR", "Shift-JIS", "Unicode (UTF-8)"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 17, 
      "question": "프로그래밍에서 값을 '할당'하는 연산자 기호는 무엇일까요?", 
      "options": ["==", "===", "=", "!="], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 18, 
      "question": "프로그래밍에서 두 값이 '같은지' 비교할 때 사용하는 연산자 기호는 무엇일까요?", 
      "options": ["=", "!=", ">=", "=="], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 19, 
      "question": "프로그래밍에서 한 번 선언하면 값을 변경할 수 없는 저장 공간을 무엇이라고 할까요?", 
      "options": ["변수", "함수", "상수", "배열"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 20, 
      "question": "소스 코드를 컴퓨터가 직접 이해할 수 있는 기계어로 미리 전부 다 번역해 놓는 방식을 사용하는 언어 유형은 무엇일까요?", 
      "options": ["스크립트 언어", "인터프리터 언어", "컴파일러 언어", "마크업 언어"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 21, 
      "question": "소스 코드를 실행할 때마다 한 줄씩 번역하여 실행하는 방식을 사용하는 언어 유형은 무엇일까요?", 
      "options": ["컴파일러 언어", "기계어", "인터프리터 언어", "어셈블리어"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 22, 
      "question": "외부에서 무단 침입을 막기 위해 네트워크의 경계에서 접근을 통제하는 시스템을 무엇이라고 할까요?", 
      "options": ["백신 프로그램", "파밍", "라우터", "방화벽"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 23, 
      "question": "데이터나 정보를 다른 사람이 알아볼 수 없도록 암호화하고, 필요한 사람만 해독하여 사용할 수 있게 하는 기술을 무엇이라고 할까요?", 
      "options": ["압축", "인코딩", "디코딩", "보안 (암호화)"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 24, 
      "question": "인터넷에서 파일을 송수신(업로드/다운로드)하는 데 사용되는 표준 프로토콜은 무엇일까요?", 
      "options": ["HTTP", "SMTP", "FTP", "POP3"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 25, 
      "question": "컴퓨터나 네트워크 장치에 부여된 물리적인 고유 식별 주소로, 제조업체와 제품에 따라 정해지는 주소는 무엇일까요?", 
      "options": ["IP 주소", "URL", "도메인 이름", "MAC 주소"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 26, 
      "question": "데이터 통신에서 정보의 손실이나 오류가 없도록 보장하며, 데이터 패킷의 전송을 관리하는 핵심 프로토콜은 무엇일까요?", 
      "options": ["UDP", "ICMP", "TCP", "ARP"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 27, 
      "question": "프로그래밍에서 데이터와 해당 데이터를 처리하는 함수(기능)를 하나로 묶어 관리하는 방식을 무엇이라고 할까요?", 
      "options": ["절차 지향", "함수형 프로그래밍", "객체 지향 프로그래밍", "선언형 프로그래밍"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 28, 
      "question": "프로그램이 실행될 때 동적으로 생성되었다가 사용이 끝나면 해제되는, 크기가 유동적인 데이터 저장 영역을 무엇이라고 할까요?", 
      "options": ["코드 영역", "데이터 영역", "힙 영역", "스택 영역"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 29, 
      "question": "컴퓨터가 여러 개의 프로그램을 동시에 실행하는 것처럼 보이게 하는 운영 체제의 기능을 무엇이라고 할까요?", 
      "options": ["멀티부팅", "멀티태스킹", "병렬 처리", "클러스터링"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 30, 
      "question": "하나의 웹페이지에서 클릭 한 번으로 다른 웹페이지나 파일로 이동할 수 있도록 연결된 요소를 무엇이라고 할까요?", 
      "options": ["URL", "링크 (하이퍼링크)", "아이콘", "북마크"], 
      "correctAnswerIndex": 1 
    }
  ];

  const IT_QUIZ_HARD: QuizItem[] = [
    { 
      "id": 1, 
      "question": "OSI 7계층 모델 중 데이터 링크 계층(Layer 2)의 핵심 기능으로, 물리적 주소(MAC 주소)를 기반으로 인접한 두 장치 간의 데이터 전송을 담당하는 장비는 무엇일까요?", 
      "options": ["라우터 (Router)", "게이트웨이 (Gateway)", "스위치 (Switch)", "리피터 (Repeater)"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 2, 
      "question": "프로세스 관리에서, CPU의 효율적인 사용을 위해 현재 실행 중인 프로세스의 상태를 저장하고 다음 프로세스의 상태를 복원하는 작업을 무엇이라고 할까요?", 
      "options": ["페이지 폴트 (Page Fault)", "세그멘테이션 (Segmentation)", "컨텍스트 스위칭 (Context Switching)", "데드락 (Deadlock)"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 3, 
      "question": "데이터베이스 트랜잭션의 4가지 주요 특성(원자성, 일관성, 고립성, 지속성)을 일컫는 약어는 무엇일까요?", 
      "options": ["CRUD", "BASE", "ACID", "SQL"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 4, 
      "question": "암호화 방식 중, 암호화 키와 복호화 키가 서로 다른 **비대칭 키 (공개 키) 방식**의 대표적인 알고리즘은 무엇일까요?", 
      "options": ["AES", "RSA", "DES", "SEED"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 5, 
      "question": "컴퓨터가 보조 기억 장치(HDD/SSD)에 접근할 때, 이전에 접근했던 데이터가 재사용될 가능성이 높은 현상을 무엇이라고 부르나요?", 
      "options": ["데드락", "지역성 (Locality)", "스래싱 (Thrashing)", "경합 조건 (Race Condition)"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 6, 
      "question": "네트워크 통신에서 전송 계층(Layer 4) 프로토콜 중, 신뢰성 있는 연결을 제공하지만 오버헤드가 큰 프로토콜은 무엇일까요?", 
      "options": ["UDP", "ICMP", "TCP", "ARP"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 7, 
      "question": "데이터베이스의 정규화(Normalization) 과정에서 '부분 함수 종속'을 제거하여 중복을 줄이는 단계는 몇 차 정규화일까요?", 
      "options": ["1차 정규화", "2차 정규화", "3차 정규화", "BCNF"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 8, 
      "question": "프로그래밍 언어에서 메모리 할당 및 해제를 자동적으로 관리해주는 기능으로, 메모리 누수를 방지하는 기술은 무엇일까요? (Java, Python 등의 특징)", 
      "options": ["포인터", "오버로딩", "가비지 컬렉션 (Garbage Collection)", "쓰레드"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 9, 
      "question": "운영 체제에서 여러 프로세스가 공유 자원에 동시에 접근하려고 할 때 발생하는 문제로, 접근 순서에 따라 결과가 달라지는 현상은 무엇일까요?", 
      "options": ["동기화", "경합 조건 (Race Condition)", "뮤텍스", "세마포어"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 10, 
      "question": "웹 서버에 비정상적으로 많은 트래픽을 유발하여 서버의 자원을 고갈시키고 정상적인 서비스 제공을 방해하는 사이버 공격 방식은 무엇일까요?", 
      "options": ["피싱 (Phishing)", "랜섬웨어 (Ransomware)", "SQL 인젝션 (Injection)", "DoS/DDoS 공격"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 11, 
      "question": "소프트웨어 개발 방법론 중, 계획보다는 반복적인 개발과 즉각적인 피드백을 중시하며, 변화에 유연하게 대응하는 방법론의 총칭은 무엇일까요?", 
      "options": ["폭포수 모델 (Waterfall Model)", "나선형 모델 (Spiral Model)", "애자일 (Agile) 방법론", "V-모델"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 12, 
      "question": "데이터베이스 설계 시, 엔터티와 엔터티 간의 관계를 시각적으로 표현하기 위해 사용하는 다이어그램을 무엇이라고 할까요?", 
      "options": ["UML 다이어그램", "순서도 (Flowchart)", "상태 전이도", "E-R 다이어그램 (개체-관계 모델)"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 13, 
      "question": "프로그래밍에서 클래스를 정의할 때, 상위 클래스의 속성이나 메서드를 하위 클래스가 물려받아 재사용할 수 있게 하는 개념은 무엇일까요?", 
      "options": ["캡슐화", "다형성", "추상화", "상속"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 14, 
      "question": "네트워크 장비 중, 서로 다른 네트워크(서브넷) 간에 데이터를 전달하여 네트워크를 연결하는 역할을 수행하는 장비는 무엇일까요?", 
      "options": ["스위치", "허브", "라우터 (Router)", "브리지"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 15, 
      "question": "운영 체제에서 메모리의 연속된 공간을 할당하지 않고, 고정된 크기의 블록(페이지) 단위로 관리하는 메모리 관리 기법은 무엇일까요?", 
      "options": ["세그멘테이션", "페이징 (Paging)", "블록킹", "스와핑"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 16, 
      "question": "소프트웨어 테스트 기법 중, 프로그램의 내부 구조나 소스 코드를 보면서 테스트 케이스를 설계하는 방식은 무엇일까요?", 
      "options": ["블랙박스 테스트", "알파 테스트", "화이트박스 테스트", "베타 테스트"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 17, 
      "question": "데이터베이스 시스템에서 인덱스를 사용하는 가장 주된 목적은 무엇일까요?", 
      "options": ["데이터의 중복 제거", "트랜잭션의 ACID 보장", "데이터 검색 속도 향상", "데이터 무결성 유지"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 18, 
      "question": "웹 통신에서 데이터를 암호화하여 보안을 강화한 프로토콜로, 주소가 'https://'로 시작하는 것은 무엇일까요?", 
      "options": ["FTP", "SMTP", "HTTP", "HTTPS"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 19, 
      "question": "프로그래밍에서 클래스 내부의 데이터(변수)를 외부에서 직접 접근하지 못하도록 숨기고, 메서드를 통해서만 접근하게 하는 객체 지향 특성은 무엇일까요?", 
      "options": ["다형성", "추상화", "상속", "캡슐화"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 20, 
      "question": "네트워크 보안 장비 중, 인가된 사용자만 네트워크 자원에 접근할 수 있도록 사용자 인증, 권한 부여, 계정 관리를 수행하는 서버는 무엇일까요?", 
      "options": ["IDS", "NAC (Network Access Control)", "IPS", "VPN"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 21, 
      "question": "프로세스가 자원을 요청했는데 해당 자원이 다른 프로세스에 의해 점유되어 있어 영원히 대기 상태에 빠지는 현상은 무엇일까요?", 
      "options": ["기아 현상 (Starvation)", "뮤텍스", "스래싱", "교착 상태 (Deadlock)"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 22, 
      "question": "운영 체제가 메모리를 관리할 때, 외부 단편화(External Fragmentation) 문제를 해결하기 위해 고안된 메모리 관리 기법은 무엇일까요?", 
      "options": ["세그멘테이션", "압축 (Compaction)", "고정 분할 할당", "가변 분할 할당"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 23, 
      "question": "네트워크에서 패킷 필터링(Packet Filtering) 기능을 수행하여, 미리 정의된 규칙에 따라 트래픽을 허용하거나 차단하는 보안 시스템은 무엇일까요?", 
      "options": ["VPN", "IDS", "방화벽 (Firewall)", "IPS"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 24, 
      "question": "프로그래밍에서 함수가 자기 자신을 다시 호출하여 문제를 해결하는 방식을 무엇이라고 할까요?", 
      "options": ["반복 (Iteration)", "오버로딩 (Overloading)", "재귀 (Recursion)", "매크로 (Macro)"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 25, 
      "question": "프로그램의 소스 코드를 컴파일하기 전에, 전처리 단계에서 특정 코드를 다른 코드로 치환하거나 삽입하는 역할을 하는 것은 무엇일까요? (C/C++ 언어의 특징)", 
      "options": ["링크 (Linker)", "라이브러리 (Library)", "컴파일러 (Compiler)", "전처리기 (Preprocessor)"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 26, 
      "question": "데이터베이스에서 여러 개의 트랜잭션이 동시에 실행될 때, 그 결과를 순차적으로 실행했을 때와 동일하게 보장하는 트랜잭션의 특성은 무엇일까요?", 
      "options": ["원자성 (Atomicity)", "고립성 (Isolation)", "일관성 (Consistency)", "지속성 (Durability)"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 27, 
      "question": "운영 체제에서 I/O 요청을 처리하는 동안 CPU가 다른 작업을 수행할 수 있도록 해주는 핵심 기술은 무엇일까요?", 
      "options": ["폴링 (Polling)", "인터럽트 (Interrupt)", "바쁜 대기 (Busy Waiting)", "세마포어"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 28, 
      "question": "네트워크 공격 중, 세션 하이재킹(Session Hijacking)을 위해 사용자의 정상적인 세션 토큰을 탈취하여 사용자 권한을 도용하는 공격 기법은 무엇일까요?", 
      "options": ["XSS (Cross-Site Scripting)", "SQL 인젝션", "CSRF", "쿠키 탈취"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 29, 
      "question": "객체 지향 프로그래밍에서 하나의 메서드 이름이 입력 매개변수의 타입이나 개수에 따라 다른 기능으로 동작하게 하는 특성은 무엇일까요?", 
      "options": ["상속", "추상화", "오버로딩 (Overloading)", "오버라이딩 (Overriding)"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 30, 
      "question": "컴퓨터 구조에서 명령어의 실행 속도를 높이기 위해, 하나의 명령어를 여러 단계로 나누어 동시에 처리하는 기법을 무엇이라고 할까요?", 
      "options": ["멀티 프로세싱", "파이프라이닝 (Pipelining)", "멀티 플렉싱", "인터리빙"], 
      "correctAnswerIndex": 1 
    }
  ];  
  // endregion ----------------------------------------------

  // 관용어(고사성어, 사자성어, 속담 )
  const IDIOM_QUIZ_EASY: QuizItem[] = [
    { 
      "id": 1, 
      "question": "도량이 좁고 융통성이 없음을 뜻하며, '발을 재는 자'가 신발 크기와 맞지 않아 발을 잘랐다는 고사에서 유래된 사자성어는 무엇일까요?", 
      "options": ["각주구검", "주마간산", "수주대토", "교각살우"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 2, 
      "question": "마치 그림 속의 떡처럼, 실제로 사용할 수 없거나 그림의 떡만 보고 만족하는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["화룡점정", "화중지병", "호가호위", "구상유취"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 3, 
      "question": "아무런 까닭 없이 도리어 남에게 화를 내거나 잘못을 돌려씌우는 것을 뜻하는 사자성어로, '도둑이 오히려 매를 든다'는 의미와 같은 것은 무엇일까요?", 
      "options": ["적반하장", "남가일몽", "과유불급", "읍참마속"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 4, 
      "question": "자신이 처한 어려움을 알고 있으면서도 외면하고, 오히려 다른 사람에게 하소연한다는 뜻의 속담은 무엇일까요?", 
      "options": ["누워서 침 뱉기.", "누울 자리 보고 발 뻗는다.", "자기 발등의 불은 꺼야 한다.", "제 코는 못 닦고 남의 코 풀어준다."], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 5, 
      "question": "이치에 맞지 않는 헛된 이야기를 꾸며대어 남을 속이는 것을 비유하며, '주머니 속에 칼을 감춘다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["양두구육", "계명구도", "구밀복검", "토사구팽"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 6, 
      "question": "어떤 일을 하는 데 주관이 없이 그저 남이 하자는 대로 따라 하는 것을 비유하는 사자성어로, '바람에 나부끼는 갈대'라는 뜻을 가진 것은 무엇일까요?", 
      "options": ["동병상련", "수구초심", "풍림화산", "풍전세류"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 7, 
      "question": "배우자가 죽은 뒤에 다시 결혼하지 않고 수절한다는 뜻으로, '열녀가 두 남편을 섬기지 않는다'는 의미의 사자성어는 무엇일까요?", 
      "options": ["백년해로", "절차탁마", "일편단심", "불사이군"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 8, 
      "question": "어떤 문제의 근본은 해결하지 않고 임시방편으로 눈앞의 현상만을 해결하는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["설상가상", "미봉책", "감탄고토", "견문발검"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 9, 
      "question": "자기의 처지나 형편을 생각하지 않고 남의 흉내를 내다가 망치는 것을 비유하는 속담은 무엇일까요?", 
      "options": ["하늘의 별 따기", "수박 겉핥기", "뱁새가 황새 따라가려다 가랑이 찢어진다.", "개구리 올챙이 적 생각 못 한다."], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 10, 
      "question": "다른 사람의 말이나 행동에 대하여 깊이 생각하지 않고 겉으로 드러난 부분만 보고 헐뜯는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["표리부동", "수구초심", "침소봉대", "격화소양"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 11, 
      "question": "세상을 버리고 홀로 깨끗한 생활을 한다는 뜻으로, 속세를 떠나 자연 속에 묻혀 사는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["건곤일척", "강호한정", "수성취모", "오리무중"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 12, 
      "question": "같은 밥을 먹으면서 다른 생각을 한다는 뜻으로, 겉으로는 함께 행동하지만 속으로는 배반할 마음을 품고 있는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["오월동주", "동상이몽", "화광동진", "동상이식"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 13, 
      "question": "이미 죽은 사람에게 약을 주는 것처럼, 때가 늦어 아무리 애를 써도 소용이 없음을 비유하는 사자성어는 무엇일까요?", 
      "options": ["사후청소", "주경야독", "사후약방문", "권토중래"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 14, 
      "question": "한 번 정한 것은 죽어도 변하지 않는다는 뜻으로, 초지일관하는 굳은 의지를 비유하는 사자성어는 무엇일까요?", 
      "options": ["와신상담", "절차탁마", "백절불굴", "지경직필"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 15, 
      "question": "서로의 이해관계가 걸려 있을 때, 겉으로는 화합하지만 속으로는 적의를 품고 있는 경우를 비유하는 사자성어는 무엇일까요?", 
      "options": ["이심전심", "막역지우", "오월동주", "일편단심"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 16, 
      "question": "아무리 뛰어난 재능을 가졌더라도 때를 만나지 못해 불우하게 지내는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["재능출중", "군계일학", "명재경각", "와룡선생"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 17, 
      "question": "일을 그르치거나 망친 후에야 뉘우쳐도 이미 늦었음을 비유하며, '도둑맞고 사립문을 고친다'는 의미와 같은 속담은 무엇일까요?", 
      "options": ["자라 보고 놀란 가슴 솥뚜껑 보고 놀란다.", "소 잃고 외양간 고친다.", "누워서 떡 먹기", "고슴도치도 제 새끼 함함하다고 한다."], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 18, 
      "question": "지혜로운 사람은 물을 좋아하고, 어진 사람은 산을 좋아한다는 뜻으로, '즐거움의 종류가 사람마다 다름'을 비유하는 사자성어는 무엇일까요?", 
      "options": ["춘하추동", "수구초심", "지자요수 인자요산", "동상이몽"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 19, 
      "question": "아무런 말도 하지 않고 마음과 마음으로 뜻이 통하는 것을 비유하며, '마음에서 마음으로 전한다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["언중유골", "이심전심", "아전인수", "권토중래"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 20, 
      "question": "남의 일에 대하여 쓸데없이 걱정만 하고 직접 나서서 해결하려고 하지 않는 것을 비유하는 속담은 무엇일까요?", 
      "options": ["남의 집 잔치에 감 놓아라 배 놓아라 한다.", "남의 밥에 든 콩 세어 본다.", "배보다 배꼽이 더 크다.", "찬물도 위아래가 있다."], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 21, 
      "question": "세월의 흐름에 따라 강물과 밭이 변하여 세상이 몰라보게 바뀌었음을 이르는 사자성어는 무엇일까요?", 
      "options": ["격세지감", "상전벽해", "세한송백", "토사구팽"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 22, 
      "question": "아무리 큰 것이라도 보잘것없는 작은 것에서부터 시작됨을 비유하는 사자성어는 무엇일까요?", 
      "options": ["대기만성", "호사다마", "일일삼추", "합종연횡"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 23, 
      "question": "겉과 속이 같지 않아 겉으로는 착한 체하면서 속으로는 엉큼하게 나쁜 마음을 먹는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["구밀복검", "표리부동", "동상이몽", "침소봉대"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 24, 
      "question": "실력이 없거나 경험이 부족한 사람이 큰 일을 맡았을 때, 실수를 하여 오히려 큰 해를 입히는 것을 비유하는 속담은 무엇일까요?", 
      "options": ["선무당이 사람 잡는다.", "뛰는 놈 위에 나는 놈 있다.", "개구리 올챙이 적 생각 못 한다.", "열 길 물속은 알아도 한 길 사람 속은 모른다."], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 25, 
      "question": "뜻이 같고 마음이 맞아 함께 어려움을 이겨냄을 비유하는 사자성어는 무엇일까요?", 
      "options": ["난형난제", "막상막하", "호가호위", "일심동체"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 26, 
      "question": "지나치면 오히려 부족함만 못하다는 뜻으로, '정도가 넘치지 않도록 주의하라'는 의미를 가진 사자성어는 무엇일까요?", 
      "options": ["전광석화", "과유불급", "천의무봉", "다다익선"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 27, 
      "question": "아는 것이 적은 사람이 오히려 아는 체하며 우쭐대고 잘난 척하는 것을 비유하는 속담은 무엇일까요?", 
      "options": ["빈 수레가 요란하다.", "자라 보고 놀란 가슴 솥뚜껑 보고 놀란다.", "우물 안 개구리", "가난 구제는 나라님도 못 한다."], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 28, 
      "question": "모든 것을 포기하고 마지막으로 승부를 걸어, '이판사판으로 결판을 낸다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["오리무중", "일희일비", "건곤일척", "수수방관"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 29, 
      "question": "세월이 흐르는 동안 세상의 온갖 풍파를 다 겪어 세상일에 익숙해졌음을 이르는 사자성어는 무엇일까요?", 
      "options": ["설상가상", "풍월주인", "풍파만파", "풍찬노숙"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 30, 
      "question": "잘못을 저지른 사람이 도리어 성을 내거나 큰소리를 치는 파렴치한 경우를 비유하는 속담은 무엇일까요?", 
      "options": ["남의 밥에 든 콩 세어 본다.", "적반하장 격.", "도둑이 제 발 저리다.", "똥 묻은 개가 겨 묻은 개 나무란다."], 
      "correctAnswerIndex": 1 
    }
  ];

  const IDIOM_QUIZ_NORMAL: QuizItem[] = [
    { 
      "id": 1, 
      "question": "뜻이 맞지 않아 함께 살거나 일하기 어려운 사이를 비유하며, '같은 배를 탔으나 서로 미워한다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["막상막하", "오월동주", "막역지우", "불가사의"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 2, 
      "question": "겉과 속이 다르다는 뜻으로, 겉으로는 친한 체하나 속으로는 딴생각을 품고 있는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["동고동락", "일희일비", "표리부동", "수수방관"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 3, 
      "question": "아무리 어려움을 겪고 힘든 상황에 처해도 끝까지 굴하지 않고 이겨낸다는 뜻으로, '백 번 꺾여도 굴하지 않는다'는 의미의 사자성어는 무엇일까요?", 
      "options": ["백년해로", "백절불굴", "일취월장", "군계일학"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 4, 
      "question": "세상의 모든 일이 끊임없이 변화하여 덧없음을 비유하는 고사성어로, '덧없는 꿈'이라는 뜻을 가진 것은 무엇일까요?", 
      "options": ["망양지탄", "남가일몽", "와신상담", "수구초심"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 5, 
      "question": "일이 순조롭게 진행되어 매우 빨리 성공하거나 발전하는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["자승자박", "주마가편", "일취월장", "각골난망"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 6, 
      "question": "매우 위급하거나 절박한 상황에 놓여서 조금도 시간을 지체할 수 없음을 비유하는 사자성어는 무엇일까요?", 
      "options": ["결초보은", "풍전등화", "토사구팽", "일장춘몽"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 7, 
      "question": "남의 일에 대해 겉으로만 건성으로 보고 깊이 생각하지 않음을 비유하며, '달리는 말 위에서 산을 본다'는 뜻을 가진 사자성어는 무엇일까요?", 
      "options": ["주경야독", "수주대토", "주마간산", "절차탁마"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 8, 
      "question": "남의 일에 쓸데없이 간섭하거나 나서서 방해하는 사람을 비유하는 속담은 무엇일까요?", 
      "options": ["등잔 밑이 어둡다.", "방귀 뀐 놈이 성낸다.", "찬물도 위아래가 있다.", "남의 잔치에 감 놓아라 배 놓아라 한다."], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 9, 
      "question": "사람의 심성이나 태도가 매우 굳건하여 아무리 어려운 환경 속에서도 변치 않는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["오매불망", "세한송백", "자화자찬", "호가호위"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 10, 
      "question": "서로 비슷한 두 사물이나 사람의 우열을 가리기 어려울 정도로 대등하다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["이심전심", "난형난제", "다다익선", "우이독경"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 11, 
      "question": "자기가 할 일은 제쳐두고 남의 일에만 쓸데없이 참견하는 것을 비유하는 속담은 무엇일까요?", 
      "options": ["빈 수레가 요란하다.", "남의 밥에 든 콩 세어 본다.", "뛰는 놈 위에 나는 놈 있다.", "개구리 올챙이 적 생각 못 한다."], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 12, 
      "question": "남을 위하는 것이 도리어 자기를 해롭게 하는 결과를 낳는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["자승자박", "역지사지", "오비이락", "일석이조"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 13, 
      "question": "어려운 일이 닥쳤을 때 다른 사람의 도움 없이 혼자 힘으로 문제를 해결하려고 노력한다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["고진감래", "고군분투", "감언이설", "화룡점정"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 14, 
      "question": "어떤 일을 할 때, 수단을 가리지 않고 억지로 자기에게 유리하도록 끌어다 붙이는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["결자해지", "오매불망", "아전인수", "권토중래"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 15, 
      "question": "마치 옷을 깁지 않은 것처럼 흠잡을 데 없이 완벽하게 잘 된 문장이나 솜씨를 비유하는 사자성어는 무엇일까요?", 
      "options": ["각골난망", "침소봉대", "천의무봉", "다다익선"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 16, 
      "question": "일이 한창 잘되어 가다가 갑자기 뜻밖의 사고나 방해가 생기는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["금상첨화", "토사구팽", "호사다마", "권선징악"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 17, 
      "question": "이미 지난 일에 대해 아무리 뉘우치고 후회해도 소용이 없다는 뜻으로, '엎질러진 물'을 비유하는 속담은 무엇일까요?", 
      "options": ["가는 말이 고와야 오는 말이 곱다.", "이미 엎질러진 물.", "물은 맑으나 달은 잡히지 않는다.", "강물에 돌 던지기."], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 18, 
      "question": "사물이나 상황을 정확하게 판단하지 못하고 엉뚱한 결론을 내리거나 오해하는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["이심전심", "이목구비", "어불성설", "견문발검"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 19, 
      "question": "실속 없이 겉모습만 번지르르한 경우를 비유하며, '수레는 크지만 실은 것이 없다'는 의미의 사자성어는 무엇일까요?", 
      "options": ["호가호위", "허장성세", "구상유취", "수수방관"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 20, 
      "question": "작은 일이라도 성의를 다하면 성공할 수 있음을 비유하며, '티끌 모아 태산'과 같은 의미의 속담은 무엇일까요?", 
      "options": ["열 번 찍어 안 넘어가는 나무 없다.", "백지장도 맞들면 낫다.", "하나를 보고 열을 안다.", "가랑비에 옷 젖는 줄 모른다."], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 21, 
      "question": "매우 좁은 곳에 앉아 하늘을 본다는 뜻으로, 견문이 좁음을 비유하는 사자성어는 무엇일까요?", 
      "options": ["좌불안석", "좌정관천", "좌우명", "좌지우지"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 22, 
      "question": "힘 있는 사람에게 아첨하여 그의 권세를 빌려 위세를 부리는 것을 비유하며, '여우가 호랑이의 위세를 빌린다'는 고사성어는 무엇일까요?", 
      "options": ["와신상담", "호가호위", "토사구팽", "일장춘몽"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 23, 
      "question": "힘들고 어려운 일이라도 참고 견디면 마침내 즐겁고 좋은 일이 온다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["고진감래", "다사다난", "각주구검", "주경야독"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 24, 
      "question": "어떤 일을 시작했을 때의 초심을 잃지 않고 끝까지 해낸다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["일편단심", "수구초심", "파죽지세", "이심전심"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 25, 
      "question": "이미 알고 있는 사실이라도 다시 한번 확인하고 점검하여 실수를 줄인다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["권토중래", "유비무환", "온고지신", "복습지재"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 26, 
      "question": "자신의 잘못을 뉘우치지 않고 남을 탓하며 오히려 화를 내는 경우를 비유하는 속담은 무엇일까요?", 
      "options": ["말 한마디에 천 냥 빚 갚는다.", "방귀 뀐 놈이 성낸다.", "누워서 침 뱉기.", "하늘의 별 따기."], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 27, 
      "question": "어떤 대상을 그리워하거나 잊지 못하여 잠 못 이루는 것을 비유하며, '자나 깨나 잊지 못한다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["각골난망", "오매불망", "사필귀정", "풍월주인"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 28, 
      "question": "일을 그르쳐 놓고도 그 까닭을 엉뚱한 데 돌리는 경우를 비유하며, '말을 강물에 빠뜨리고서는 칼로 배를 그어 표시해 두었다'는 고사성어는 무엇일까요?", 
      "options": ["오비이락", "각주구검", "수주대토", "구밀복검"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 29, 
      "question": "한 가지 일로 두 가지 이득을 얻는다는 뜻으로, '돌 하나로 새 두 마리를 잡는다'는 의미의 사자성어는 무엇일까요?", 
      "options": ["일장춘몽", "일취월장", "일석이조", "일희일비"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 30, 
      "question": "여러 사람이 한마음 한뜻으로 뭉쳐 단결함을 비유하는 사자성어는 무엇일까요?", 
      "options": ["유유상종", "다다익선", "일심동체", "오리무중"], 
      "correctAnswerIndex": 2 
    }
  ];

  const IDIOM_QUIZ_HARD: QuizItem[] = [
    { 
      "id": 1, 
      "question": "권력을 잡거나 세력을 얻은 뒤에 한 번 실패했던 일에 다시 도전하여 성공하는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["권토중래", "절치부심", "와신상담", "주마가편"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 2, 
      "question": "서로 이해관계는 다르지만, 한 배에 탄 것처럼 운명을 같이하게 된 상황을 비유하는 사자성어는 무엇일까요?", 
      "options": ["동병상련", "동상이몽", "오월동주", "동가홍상"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 3, 
      "question": "작은 실수나 허물까지도 덮어두지 않고 캐내어 밝히는 지나치게 꼼꼼한 행동을 비유하며, '털에서 흠을 고른다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["수성취모", "노심초사", "침소봉대", "주마간산"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 4, 
      "question": "자기의 아첨을 받아줄 사람 앞에서 으스대거나 권세를 함부로 부리는 것을 비유하는 속담은 무엇일까요?", 
      "options": ["등잔 밑이 어둡다.", "바늘 도둑이 소 도둑 된다.", "소경 잔치에 눈 먼 이가 큰손이다.", "얌전한 고양이 부뚜막에 먼저 오른다."], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 5, 
      "question": "남의 훌륭한 언행을 본받아 자신의 인격과 학문을 닦는 데 도움을 얻는다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["타산지석", "자승자박", "이심전심", "일자천금"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 6, 
      "question": "어리석고 고지식하여 융통성이 없는 태도를 비유하는 것으로, '말뚝이 움직일까 봐 끈을 잡아맨다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["수주대토", "각주구검", "교각살우", "고정관념"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 7, 
      "question": "자기 몸을 버려가면서까지 충성을 다한다는 뜻으로, '쓸모없는 뼈를 산다'는 의미의 고사성어는 무엇일까요?", 
      "options": ["읍참마속", "백골난망", "천고마비", "매골천금"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 8, 
      "question": "서로 돕기는커녕, 도리어 방해하거나 손해를 입히는 행위를 비유하며, '호미로 막을 것을 가래로 막는다'는 의미와 가까운 속담은 무엇일까요?", 
      "options": ["언 발에 오줌 누기.", "누워서 침 뱉기.", "고양이 보고 쥐 잡으라 한다.", "사돈 남 말 한다."], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 9, 
      "question": "뼈에 새겨 잊지 못할 만큼 고마운 은혜를 뜻하는 사자성어는 무엇일까요?", 
      "options": ["각주구검", "백년해로", "각골난망", "와신상담"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 10, 
      "question": "'손으로 직접 피가 나오도록 뼈를 만진다'는 뜻으로, 고통을 무릅쓰고 매우 간절히 노력함을 비유하는 사자성어는 무엇일까요?", 
      "options": ["만강홍주", "절차탁마", "착수성과", "도탄지고"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 11, 
      "question": "말이나 행동이 앞뒤가 맞지 않고 모순됨을 뜻하는 사자성어는 무엇일까요?", 
      "options": ["표리부동", "이율배반", "설상가상", "감언이설"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 12, 
      "question": "몹시 초조하거나 불안하여 마음을 놓지 못하는 상황을 비유하며, '좌석이 편안하지 않다'는 뜻을 가진 사자성어는 무엇일까요?", 
      "options": ["좌우명", "좌정관천", "좌불안석", "좌지우지"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 13, 
      "question": "겉만 보고 그럴듯하게 여겼는데 속은 아무것도 아님을 비유하며, '달무리가 지니 비가 오려나'라는 고사에서 유래된 사자성어는 무엇일까요?", 
      "options": ["난형난제", "오비이락", "월하노인", "구상유취"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 14, 
      "question": "자기의 이익을 위해서는 부모와 형제까지도 해칠 수 있음을 비유하는 사자성어는 무엇일까요?", 
      "options": ["대의멸친", "망양지탄", "골육상잔", "혈육지정"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 15, 
      "question": "매우 짧은 말이지만 핵심을 찔러 강한 감동이나 교훈을 주는 말을 비유하는 사자성어는 무엇일까요?", 
      "options": ["구밀복검", "언중유골", "촌철살인", "침소봉대"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 16, 
      "question": "간사한 꾀로 남을 농락하여 권력을 잡은 것을 비유하며, '사슴을 가리켜 말이라고 한다'는 뜻을 가진 고사성어는 무엇일까요?", 
      "options": ["지록위마", "조삼모사", "토사구팽", "교언영색"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 17, 
      "question": "이미 죽은 다음에 아무리 애를 써도 소용이 없음을 비유하며, '죽은 뒤에 약방문을 찾는다'는 뜻의 사자성어와 같은 의미를 가진 속담은 무엇일까요?", 
      "options": ["소 잃고 외양간 고친다.", "사후약방문.", "호랑이에게 물려가도 정신만 차리면 산다.", "급한 불 끄고 도둑 잡는다."], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 18, 
      "question": "어떤 일이 일어날 가능성이 전혀 없음을 비유하며, '나막신이 닳도록 돌아다닌다'는 뜻의 사자성어는 무엇일까요?", 
      "options": ["난하생초", "마이동풍", "계명구도", "일모도원"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 19, 
      "question": "일을 시작하는 과정은 거창하나 끝은 미약함을 비유하는 사자성어는 무엇일까요?", 
      "options": ["용두사미", "화룡점정", "이현령비현령", "권토중래"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 20, 
      "question": "이미 그릇된 일을 변명하려다가 도리어 잘못을 더욱 깊게 만드는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["설상가상", "미봉책", "교각살우", "호가호위"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 21, 
      "question": "자기의 단점은 모르고 남의 단점만 비웃는 경우를 비유하는 속담은 무엇일까요?", 
      "options": ["똥 묻은 개가 겨 묻은 개 나무란다.", "남의 밥에 든 콩 세어 본다.", "배보다 배꼽이 더 크다.", "제 버릇 개 못 준다."], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 22, 
      "question": "비록 하찮은 재능이라도 그것이 결국 큰 이익을 가져오는 경우를 비유하는 사자성어는 무엇일까요?", 
      "options": ["일석이조", "침소봉대", "노마지기", "반포지효"], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 23, 
      "question": "나쁜 일은 겹치고 엎친 데 덮친 격으로 더욱더 나쁜 일이 일어나는 것을 비유하는 사자성어는 무엇일까요?", 
      "options": ["금상첨화", "설상가상", "오비이락", "동고동락"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 24, 
      "question": "아무리 좋은 것이라도 지나치면 오히려 모자람만 못하다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["다다익선", "과유불급", "유비무환", "일석이조"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 25, 
      "question": "학문을 닦는 데 부지런히 힘쓴다는 뜻으로, '반딧불과 눈빛으로 공부한다'는 고사성어는 무엇일까요?", 
      "options": ["주경야독", "형설지공", "독서삼매", "절차탁마"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 26, 
      "question": "재물은 넉넉하게 쓰고, 사람은 아껴 사랑한다는 뜻의 사자성어는 무엇일까요?", 
      "options": ["근검절약", "애인여물", "애지중지", "애물이용"], 
      "correctAnswerIndex": 3 
    },
    { 
      "id": 27, 
      "question": "상대방의 말을 이치에 맞게 받아들이지 않고, 이랬다저랬다 하며 자신의 주장을 억지로 관철시키려는 태도를 비유하는 사자성어는 무엇일까요?", 
      "options": ["어불성설", "이현령비현령", "적반하장", "견강부회"], 
      "correctAnswerIndex": 1 
    },
    { 
      "id": 28, 
      "question": "아주 작은 일이나 하찮은 부분 때문에 큰일을 망치게 됨을 비유하는 사자성어는 무엇일까요?", 
      "options": ["지엽말단", "사상누각", "대기만성", "조족지혈"], 
      "correctAnswerIndex": 0 
    },
    { 
      "id": 29, 
      "question": "불가능한 일이나, 너무나 어려운 일을 억지로 하려다가 도리어 해를 입는 경우를 비유하는 속담은 무엇일까요?", 
      "options": ["바늘 가는 데 실 간다.", "가랑잎으로 덮을 것을 멍석으로 덮는다.", "달걀로 바위 치기.", "콩 심은 데 콩 나고 팥 심은 데 팥 난다."], 
      "correctAnswerIndex": 2 
    },
    { 
      "id": 30, 
      "question": "어리석은 사람이 상황 변화를 깨닫지 못하고 헛된 노력을 반복하는 것을 비유하며, '나무 그루터기 옆에서 토끼를 기다린다'는 고사성어는 무엇일까요?", 
      "options": ["망양보뢰", "수주대토", "각주구검", "조삼모사"], 
      "correctAnswerIndex": 1 
    }
  ];
  // endregion ----------------------------------------------

  // const IDION_QUIZ_EASY: QuizItem[] = [

  // ];

  // const IDION_QUIZ_NORMAL: QuizItem[] = [

  // ];

  // const IDION_QUIZ_HARD: QuizItem[] = [

  // ];


  // const IDION_QUIZ_EASY: QuizItem[] = [

  // ];

  // const IDION_QUIZ_NORMAL: QuizItem[] = [

  // ];

  // const IDION_QUIZ_HARD: QuizItem[] = [

  // ];


  export const ALL_QUIZ_DATA: QuizTopic[] = [
    {
      id: "GENERAL",
      name: "일반 상식",
      difficulties: {
        "하": GENERAL_QUIZ_EASY, 
        "중": GENERAL_QUIZ_NORMAL,
        "상": GENERAL_QUIZ_HARD,
      },
    },
    {
      id: "IT",
      name: "IT & 프로그래밍",
      difficulties: {
        "하": IT_QUIZ_EASY, 
        "중": IT_QUIZ_NORMAL, 
        "상": IT_QUIZ_HARD, 
      },
    },
    {
      id: "IDIOM",
      name: "관용어",
      difficulties: {
        "하": IDIOM_QUIZ_EASY, 
        "중": IDIOM_QUIZ_NORMAL, 
        "상": IDIOM_QUIZ_HARD, 
      },
    }, 
  ];
  
  export const DIFFICULTY_LABELS = ["하", "중", "상"];