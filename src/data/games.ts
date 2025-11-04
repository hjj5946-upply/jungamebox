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
  { id: "flip", name: "앞?뒤?", path: "/games/flip", image: coinFlipImg }, //완료
  { id: "dice", name: "주사위", path: "/games/dice", image: diceImg }, //완료
  { id: "timer", name: "타이머", path: "/games/timer", image: timer }, //완료
  { id: "namepick", name: "제비뽑기", path: "/games/namepick", image: swallowImg }, //완료
  
  { id: "order", name: "1빠정하기", path: "/games/order", image: trackImg }, //완료
  { id: "rock", name: "안내면진거", path: "/games/rock", image: rpsImg }, //완료
  { id: "roulette", name: "돌려돌림판", path: "/games/roulette", image: rouiletteImg }, //완료
  { id: "card", name: "카드뽑기", path: "/games/card", image: cardImg }, //완료
  
  { id: "lotto", name: "로또번호생성", path: "/games/lotto", image: lottoImg }, //완료
  { id: "balance", name: "밸런스 게임", path: "/games/balance", image: balanceImg }, //완료
  { id: "speed", name: "1 to 48", path: "/games/speed", image: to48Img, imageSize: "large" }, //완료
  { id: "bingo", name: "빙고", path: "/games/bingo", image: bingoImg  }, //완료

  { id: "str", name: "강화하기", path: "/games/str", image: swordImg }, //완료
  { id: "timing", name: "타이밍", path: "/games/timing", image: timingImg }, //완료
  { id: "ladder", name: "사다리타기", path: "/games/ladder", image: ladderImg }, //추가예정(사다리타기)
  { id: "quiz", name: "퀴즈", path: "/games/quiz", image: quizImg }, //추가예정(퀴즈)
  
  // Page 2
  { id: "telepathy", name: "개발중", path: "/games/telepathy" }, //텔레파시  초성 게임
  { id: "Liar", name: "개발중", path: "/games/Liar" }, //라이어 게임
  { id: "recall", name: "개발중", path: "/games/recall" }, //제시어 연상 퀴즈
]