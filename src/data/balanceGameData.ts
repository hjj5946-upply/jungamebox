// 항목 타입 정의
export type Item = {
    name: string;
    image?: string;
  };
  
  export type Category = {
    id: number;
    name: string;
    items: Item[];
  };
  
  export type TournamentRound = "32" | "64";
  
  // 아이스크림 항목
  const iceCreamItems: Item[] = [
    { name: "요맘때", image: "/vanilla.png" },
    { name: "와일드바디", image: "/chocolate.png" },
    { name: "설레임" },
    { name: "깐토리" },
    { name: "투게더" },
    { name: "빵빠레" },
    { name: "더블비얀코" },
    { name: "엑설런트" },
    { name: "하겐다즈" },
    { name: "빠삐코" },
    { name: "뽕따" },
    { name: "스크류바" },
    { name: "거북이" },
    { name: "거북알" },
    { name: "엔초" },
    { name: "쿠앤크" },
    { name: "옥동자" },
    { name: "메가톤" },
    { name: "호두마루" },
    { name: "탱귤탱귤" },
    { name: "셀렉션" },
    { name: "죠스바" },
    { name: "수박바" },
    { name: "메로나" },
    { name: "폴라포" },
    { name: "돼지바" },
    { name: "보석바" },
    { name: "비비빅" },
    { name: "아맛나" },
    { name: "월드콘" },
    { name: "붕어싸만코" },
    { name: "쌍쌍바" },
    { name: "빵또아" },
    { name: "서주아이스바" },
    { name: "바밤바" },
    { name: "조안나" },
    { name: "누가바" },
    { name: "캔디바" },
    { name: "찰옥수수" },
    { name: "구구콘" },
    { name: "부라보콘" },
    { name: "와" },
    { name: "고드름" },
    { name: "파워캡" },
  ];
  
  // 영화 장르 항목
  const movieItems: Item[] = [
    { name: "액션" },
    { name: "코미디" },
    { name: "로맨스" },
    { name: "스릴러" },
    { name: "SF" },
    { name: "판타지" },
    { name: "공포" },
    { name: "드라마" },
    { name: "로맨틱코미디" },
    { name: "액션코미디" },
    { name: "범죄" },
    { name: "미스터리" },
    { name: "전쟁" },
    { name: "음악영화" },
    { name: "뮤지컬" },
    { name: "애니메이션" },
    { name: "실사" },
    { name: "다큐멘터리" },
    { name: "스파이" },
    { name: "탐정" },
    { name: "좀비" },
    { name: "뱀파이어" },
    { name: "슈퍼히어로" },
    { name: "반영웅" },
    { name: "우주" },
    { name: "바다" },
    { name: "시대극" },
    { name: "현대극" },
    { name: "어드벤처" },
    { name: "호러" },
    { name: "멜로" },
  ];
  
  // 카테고리 목록
  export const categories: Category[] = [
    {
      id: 1,
      name: "아이스크림",
      items: iceCreamItems,
    },
    {
      id: 2,
      name: "영화",
      items: movieItems,
    },
  ];