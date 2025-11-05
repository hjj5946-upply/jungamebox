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
  { id: "flip", name: "앞?뒤?", path: "/games/flip", image: coinFlipImg },
  { id: "dice", name: "주사위굴리기", path: "/games/dice", image: diceImg },
  { id: "timer", name: "타이머", path: "/games/timer", image: timer },
  { id: "namepick", name: "제비뽑기", path: "/games/namepick", image: swallowImg },
  
  { id: "order", name: "1빠정하기", path: "/games/order", image: trackImg },
  { id: "rock", name: "안내면진거", path: "/games/rock", image: rpsImg },
  { id: "roulette", name: "돌려돌림판", path: "/games/roulette", image: rouiletteImg },
  { id: "card", name: "카드뽑기", path: "/games/card", image: cardImg },
  
  { id: "lotto", name: "로또번호생성", path: "/games/lotto", image: lottoImg },
  { id: "balance", name: "밸런스 게임", path: "/games/balance", image: balanceImg },
  { id: "speed", name: "1 to 48", path: "/games/speed", image: to48Img, imageSize: "large" },
  { id: "bingo", name: "빙고", path: "/games/bingo", image: bingoImg },

  { id: "str", name: "무기강화하기", path: "/games/str", image: swordImg }, 
  { id: "timing", name: "타이밍캐치", path: "/games/timing", image: timingImg },
  { id: "quiz", name: "퀴즈퀴즈", path: "/games/quiz", image: quizImg },
  { id: "wisesay", name: "명언 모음집", path: "/games/wisesay", image: wisesayImg },
  
  // Page 2
  { id: "reading", name: "나도아나운서", path: "/games/reading", image: korlangImg },
  { id: "telepathy", name: "개발중", path: "/games/telepathy", image: telepathyImg }, //텔레파시  초성 게임
  { id: "liar", name: "개발중", path: "/games/liar", image: liarImg }, //라이어 게임
  { id: "ladder", name: "개발중", path: "/games/ladder", image: ladderImg }, //사다리타기

  { id: "slot", name: "개발중", path: "/games/slot", image: slotImg }, //슬롯머신 3릴슬롯
  { id: "memory", name: "개발중", path: "/games/memory", image: memoryImg }, //기억력 게임
]