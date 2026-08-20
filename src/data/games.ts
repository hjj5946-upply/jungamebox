import timer from "../assets/timer.webp";
import diceImg from "../assets/dice.webp";
import rpsImg from "../assets/rps.webp";
import swallowImg from "../assets/swallow.webp";
import trackImg from "../assets/track.webp";
import rouiletteImg from "../assets/roulette.webp"; 
import cardImg from "../assets/card.webp";  
import lottoImg from "../assets/lotto.webp";
import balanceImg from "../assets/balance.webp";
import bingoImg from "../assets/bingo.webp";
import quizImg from "../assets/quiz.webp";
import to48Img from "../assets/1to48.webp";
import swordImg from "../assets/sword.webp";
import timingImg from "../assets/timing.webp";
import wisesayImg from "../assets/wisesay.webp";
import korlangImg from "../assets/korlang.webp";
// import ladderImg from "../assets/ladder.webp";
// import telepathyImg from "../assets/telepathy.webp";
import liarImg from "../assets/liar.webp";
import memoryImg from "../assets/memory.webp";
import colorImg from "../assets/color.webp";
// import versusImg from "../assets/versus.webp";
// import pinballImg from "../assets/pinball.webp";
import reflexesImg from "../assets/reflexes.webp";
import ifelseImg from "../assets/ifelse.webp";
// import moleImg from "../assets/mole.webp";
import mathImg from "../assets/math.webp";
// import puzzleImg from "../assets/puzzle.webp";
import sudokuImg from "../assets/sudoku.webp";

export type GameMeta = {
  id: string;
  name: string;
  path: string;
  image?: string;
  emoji?: string;
  imageSize?: "small" | "medium" | "large";
};

// 배열 순서 = 홈 그리드 표시 순서 (좌→우, 그 다음 아래 행).
// GameGrid 의 PAGE_SIZE = 16 이므로 16개마다 페이지가 넘어간다.
// 아래 빈 줄 묶음은 4열 그리드의 한 행에 대응한다.
export const GAME_LIST: GameMeta[] = [
  // ─── Page 1 (16개) ───
  { id: "reflexes", name: "반사신경", path: "/games/reflexes", image: reflexesImg },
  { id: "str", name: "무기강화하기", path: "/games/str", image: swordImg },
  { id: "timing", name: "타이밍캐치", path: "/games/timing", image: timingImg },
  { id: "roulette", name: "돌려돌림판", path: "/games/roulette", image: rouiletteImg },

  { id: "balance", name: "밸런스월드컵", path: "/games/balance", image: balanceImg },
  { id: "dice", name: "주사위굴리기", path: "/games/dice", image: diceImg },
  { id: "rock", name: "안내면진거", path: "/games/rock", image: rpsImg },
  { id: "lotto", name: "로또번호생성", path: "/games/lotto", image: lottoImg },

  { id: "bingo", name: "빙고", path: "/games/bingo", image: bingoImg },
  { id: "reading", name: "나도아나운서", path: "/games/reading", image: korlangImg },
  { id: "card", name: "카드뽑기", path: "/games/card", image: cardImg },
  { id: "sudoku", name: "스도쿠", path: "/games/sudoku", image: sudokuImg },

  { id: "speed", name: "1 to 48", path: "/games/speed", image: to48Img, imageSize: "large" },
  { id: "memory", name: "기억력테스트", path: "/games/memory", image: memoryImg },
  { id: "math", name: "암산의 달인", path: "/games/math", image: mathImg },
  { id: "liar", name: "라이어게임", path: "/games/liar", image: liarImg },

  // ─── Page 2 (8개) ───
  { id: "namepick", name: "제비뽑기", path: "/games/namepick", image: swallowImg },
  { id: "order", name: "1빠정하기", path: "/games/order", image: trackImg },
  { id: "quiz", name: "퀴즈퀴즈", path: "/games/quiz", image: quizImg },
  { id: "ifelse", name: "만약에..", path: "/games/ifelse", image: ifelseImg },

  { id: "color", name: "스투룹테스트", path: "/games/color", image: colorImg },
  { id: "timer", name: "타이머", path: "/games/timer", image: timer },
  { id: "wisesay", name: "명언 모음집", path: "/games/wisesay", image: wisesayImg },
  { id: "catsudoku", name: "색상 스도쿠", path: "/games/catsudoku", emoji: "🐱" },

  // ─── 미노출 (주석 해제 시 노출됨) ───
  // 행 정렬을 흐트러뜨리지 않도록 아래에 모아둠. 해제하면 배열 끝에 붙으므로
  // 원하는 위치에 노출하려면 위 목록의 해당 자리로 옮길 것.
  //
  // 라우트·구현 있음 → 주석만 풀면 바로 동작:
  // { id: "pinball", name: "핀볼룰렛", path: "/games/pinball", image: pinballImg },
  // { id: "ladder", name: "사다리타기", path: "/games/ladder", image: ladderImg },
  //
  // 이미지 자산만 있고 구현 없음 → 풀면 깨짐:
  // { id: "telepathy", name: "개발중..", path: "/games/telepathy", image: telepathyImg, imageSize: "large" }, //초성텔레파시
  // { id: "mole", name: "개발중..", path: "/games/mole", image: moleImg }, //두더지
  // { id: "puzzle", name: "개발중..", path: "/games/puzzle", image: puzzleImg }, //2048퍼즐
  // { id: "versus", name: "개발중..", path: "/games/versus", image: versusImg },
]