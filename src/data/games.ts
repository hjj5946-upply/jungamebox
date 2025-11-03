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

  { id: "ladder", name: "사다리타기", path: "/games/ladder", image: ladderImg }, //추가예정(사다리타기)
  { id: "quiz", name: "퀴즈", path: "/games/quiz", image: quizImg }, //추가예정(퀴즈)
  { id: "timing", name: "타이밍", path: "/games/timing", image: timingImg }, //추가예정(막대(가운데타이밍), 숫자(정확한숫자))
  
  // Page 2
  { id: "team", name: "개발중", path: "/games/team" }, //보류(팀나누기)
  { id: "mad", name: "개발중", path: "/games/mad" }, //보류(랜덤문장)
  { id: "word", name: "개발중", path: "/games/word" }, //보류
  { id: "mission", name: "개발중", path: "/games/mission" }, //삭제 > 텔레파시  초성 게임
  { id: "random-question", name: "개발중", path: "/games/random-question" }, //삭제 > 라이어 게임
  { id: "emoji", name: "개발중", path: "/games/emoji" }, //삭제 > 제시어 연상 퀴즈
];