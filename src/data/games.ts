import coinFlipImg from "/coin_flip.png";
import timer from "/timer.png";
import diceImg from "/dice.png";
import rpsImg from "/rps.png";
import swallowImg from "/swallow.png";
import trackImg from "/track.png";
import rouiletteImg from "/roulette.png"; 
import cardImg from "/card.png";  
import lottoImg from "/lotto.png";
import balanceImg from "/balance.png";
import ladderImg from "/ladder.png";
import bingoImg from "/bingo.png";
import quizImg from "/quiz.png";
import to48Img from "/1to48.png";
import swordImg from "/sword.png";
import timingImg from "/timing.png";
import wisesayImg from "/wisesay.png";
import slotImg from "/slot.png";
import korlangImg from "/korlang.png";
import telepathyImg from "/telepathy.png";
import liarImg from "/liar.png";
import memoryImg from "/memory.png";
import colorImg from "/color.png";
import versusImg from "/versus.png";
import pinballImg from "/pinball.png";
import reflexesImg from "/reflexes.png";
import ifelseImg from "/ifelse.png";
import moleImg from "/mole.png";
import mathImg from "/math.png";
import puzzleImg from "/puzzle.png";

export type GameMeta = {
  id: string;
  name: string;
  path: string;
  image?: string;
  emoji?: string;
  imageSize?: "small" | "medium" | "large";
};

export const GAME_LIST: GameMeta[] = [
  // Page 1
  { id: "dice", name: "주사위굴리기", path: "/games/dice", image: diceImg },
  { id: "namepick", name: "제비뽑기", path: "/games/namepick", image: swallowImg },
  { id: "rock", name: "안내면진거", path: "/games/rock", image: rpsImg },
  { id: "roulette", name: "돌려돌림판", path: "/games/roulette", image: rouiletteImg },

  { id: "flip", name: "앞?뒤?", path: "/games/flip", image: coinFlipImg },
  { id: "order", name: "1빠정하기", path: "/games/order", image: trackImg },
  // { id: "liar", name: "개발중..", path: "/games/liar", image: liarImg }, //라이어게임
  // { id: "telepathy", name: "개발중..", path: "/games/telepathy", image: telepathyImg, imageSize: "large" }, //초성텔레파시

  { id: "balance", name: "밸런스월드컵", path: "/games/balance", image: balanceImg },
  // { id: "ifelse", name: "개발중..", path: "/games/color", image: ifelseImg }, //만약에?
  { id: "quiz", name: "퀴즈퀴즈", path: "/games/quiz", image: quizImg },
  // { id: "goandno", name: "개발중..", path: "/games/color", image: versusImg }, //한다?안한다?

  // { id: "ladder", name: "개발중..", path: "/games/ladder", image: ladderImg }, //사다리타기
  { id: "card", name: "카드뽑기", path: "/games/card", image: cardImg },
  { id: "lotto", name: "로또번호생성", path: "/games/lotto", image: lottoImg },
  { id: "timer", name: "타이머", path: "/games/timer", image: timer },
  
  // Page 2
  // { id: "reflexes", name: "개발중..", path: "/games/color", image: reflexesImg }, //반사신경
  { id: "speed", name: "1 to 48", path: "/games/speed", image: to48Img, imageSize: "large" },
  // { id: "mole", name: "개발중..", path: "/games/color", image: moleImg }, //두더지
  // { id: "color", name: "개발중..", path: "/games/color", image: colorImg }, //색깔맞추기
  
  { id: "timing", name: "타이밍캐치", path: "/games/timing", image: timingImg },
  // { id: "math", name: "개발중..", path: "/games/color", image: mathImg }, //암산의달인
  // { id: "memory", name: "개발중..", path: "/games/memory", image: memoryImg }, //기억력테스트
  // { id: "puzzle", name: "개발중..", path: "/games/color", image: puzzleImg }, //2048퍼즐

  { id: "reading", name: "나도아나운서", path: "/games/reading", image: korlangImg },
  { id: "str", name: "무기강화하기", path: "/games/str", image: swordImg }, 
  // { id: "slot", name: "개발중..", path: "/games/slot", image: slotImg }, //슬롯777
  // { id: "pinball", name: "개발중..", path: "/games/color", image: pinballImg }, //핀볼

  { id: "bingo", name: "빙고", path: "/games/bingo", image: bingoImg },
  { id: "wisesay", name: "명언 모음집", path: "/games/wisesay", image: wisesayImg },
]