export type Difficulty = "easy" | "normal" | "hard";

export type Phrase = {
  id: number;
  text: string;
  difficulty: Difficulty;
};

export const PHRASES: Phrase[] = [
    // ========== 쉬움 (10개) ==========
    {
      id: 1,
      text: "간장 공장 공장장",
      difficulty: "easy"
    },
    {
      id: 2,
      text: "내가 그린 기린 그림",
      difficulty: "easy"
    },
    {
      id: 3,
      text: "앞집 뒷집 옆집",
      difficulty: "easy"
    },
    {
      id: 4,
      text: "저기 가기 싫어",
      difficulty: "easy"
    },
    {
      id: 5,
      text: "철수 책상 철책",
      difficulty: "easy"
    },
    {
      id: 6,
      text: "콩깍지 팥깍지",
      difficulty: "easy"
    },
    {
      id: 7,
      text: "임틀 뛰는 뛰돌이",
      difficulty: "easy"
    },
    {
      id: 8,
      text: "빨간 팥죽 검은 팥죽",
      difficulty: "easy"
    },
    {
      id: 9,
      text: "경찰청 철창살",
      difficulty: "easy"
    },
    {
      id: 10,
      text: "저기 저 콩깍지는",
      difficulty: "easy"
    },
    // ========== 보통 (15개) - 5개 추가됨 ==========
    {
      id: 11,
      text: "간장 공장 공장장은 강 공장장이고 된장 공장 공장장은 공 공장장이다",
      difficulty: "normal"
    },
    {
      id: 12,
      text: "내가 그린 기린 그림은 잘 그린 기린 그림이고 네가 그린 기린 그림은 잘못 그린 기린 그림이다",
      difficulty: "normal"
    },
    {
      id: 13,
      text: "철수가 철썩철썩 첨벙첨벙 헤엄친다",
      difficulty: "normal"
    },
    {
      id: 14,
      text: "저기 계신 저 분이 박 법학박사시고 여기 계신 이 분이 백 법학박사시다",
      difficulty: "normal"
    },
    {
      id: 15,
      text: "앞마당 뒷마당 옆마당에 박 밭 팥 밭 콩 밭",
      difficulty: "normal"
    },
    {
      id: 16,
      text: "상표 붙인 큰 깡통은 깐 깡통이고 상표 안 붙인 큰 깡통은 안 깐 깡통이다",
      difficulty: "normal"
    },
    {
      id: 17,
      text: "내가 콩콩 구른 콩은 콩콩 구른 콩이고 네가 콩콩 구른 콩은 콩콩 안 구른 콩이다",
      difficulty: "normal"
    },
    {
      id: 18,
      text: "경찰청 철창살은 외철창살이고 검찰청 철창살은 쌍철창살이다",
      difficulty: "normal"
    },
    {
      id: 19,
      text: "서울특별시 특허허가과 허가과장 허 과장",
      difficulty: "normal"
    },
    {
      id: 20,
      text: "들의 콩깍지는 깐 콩깍지인가 안 깐 콩깍지인가",
      difficulty: "normal"
    },
    // **보통 난이도 추가 (ID 31 ~ 35)**
    {
      id: 31,
      text: "칠월칠일은 평창친구 친정칠순 잔칫날",
      difficulty: "normal"
    },
    {
      id: 32,
      text: "작년에 온 솥장수는 새 솥 장수이고 금년에 온 솥장수는 헌 솥 장수이다",
      difficulty: "normal"
    },
    {
      id: 33,
      text: "고려고 교복은 고급 교복이고 고려고 교복은 고급원단을 사용했다",
      difficulty: "normal"
    },
    {
      id: 34,
      text: "멍멍이네 꿀꿀이는 멍멍해도 꿀꿀 거리고 꿀꿀이네 멍멍이는 꿀꿀해도 멍멍 거린다",
      difficulty: "normal"
    },
    {
      id: 35,
      text: "저 분은 백 법학박사이고 이 분은 박 법학박사이시다",
      difficulty: "normal"
    },
    // ========== 어려움 (15개) - 5개 추가됨 ==========
    {
      id: 21,
      text: "저기 계신 저 분이 박 법학박사이시고 여기 계신 이 분이 백 법학박사이시다. 박 법학박사 백 법학박사",
      difficulty: "hard"
    },
    {
      id: 22,
      text: "목동 콩깍지는 깐 콩깍지인가 안 깐 콩깍지인가. 깐 콩깍지면 어떻고 안 깐 콩깍지면 어떠냐",
      difficulty: "hard"
    },
    {
      id: 23,
      text: "저기 가기 싫거든 집에 가 자기 집에. 집에 가기 싫거든 저기 가 저기",
      difficulty: "hard"
    },
    {
      id: 24,
      text: "한양 양장점 옆 한영 양장점, 한영 양장점 옆 한양 양장점. 양 양장점 옆 영 양장점, 영 양장점 옆 양 양장점",
      difficulty: "hard"
    },
    {
      id: 25,
      text: "임틀 뛰어 넘는 뛰돌이와 날뛰는 뛰순이. 뛰돌이가 뛰면 뛰순이도 뛰고 뛰순이가 뛰면 뛰돌이도 뛴다",
      difficulty: "hard"
    },
    {
      id: 26,
      text: "상표 붙인 큰 깡통은 깐 깡통이고 상표 안 붙인 큰 깡통은 안 깐 깡통이다. 깐 깡통이냐 안 깐 깡통이냐",
      difficulty: "hard"
    },
    {
      id: 27,
      text: "내가 콩콩 구른 콩은 콩콩 잘 구른 콩이고 네가 콩콩 구른 콩은 콩콩 안 구른 콩이다. 콩콩 구른 콩 콩콩콩",
      difficulty: "hard"
    },
    {
      id: 28,
      text: "철수 책상 철책 철책상. 철수 책상은 철책인가 철책상인가. 철책도 아니고 철책상도 아니고 철수 책상 철책",
      difficulty: "hard"
    },
    {
      id: 29,
      text: "경찰청 철창살은 외철창살이고 검찰청 철창살은 쌍철창살이다. 외철창살이냐 쌍철창살이냐",
      difficulty: "hard"
    },
    {
      id: 30,
      text: "저기 저 콩깍지는 깐 콩깍지냐 안 깐 콩깍지냐. 깐 콩깍지면 까서 먹고 안 깐 콩깍지면 까서 먹어라",
      difficulty: "hard"
    },
    // **어려움 난이도 추가 (ID 36 ~ 40)**
    {
      id: 36,
      text: "중앙청 창살은 쌍창살, 시청 창살은 외창살. 쌍창살이냐 외창살이냐, 창살 없는 창문이냐",
      difficulty: "hard"
    },
    {
      id: 37,
      text: "시냇가에 심겨진 싱싱한 식물은 식물의 식상한 식상함을 식상하게 식상시켰다",
      difficulty: "hard"
    },
    {
      id: 38,
      text: "저기 저 뚝방 위에 있는 통나무는 썩은 통나무냐 안 썩은 통나무냐",
      difficulty: "hard"
    },
    {
      id: 39,
      text: "생각한다는 생각은 생각하지 않는 생각, 생각을 생각하면 생각할 수 없는 생각을 생각하게 된다",
      difficulty: "hard"
    },
    {
      id: 40,
      text: "한돈에 한 돈짜리 한약 한 대와 한 돈에 두 돈짜리 한약 두 대를 먹어라",
      difficulty: "hard"
    }
];