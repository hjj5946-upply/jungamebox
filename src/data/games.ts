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
  { id: "balance", name: "밸런스 게임", path: "/games/balance", image: balanceImg },
  
  { id: "random-question", name: "랜덤 질문", path: "/games/random-question" },
  { id: "team", name: "팀나누기", path: "/games/team" },
  { id: "bingo", name: "빙고", path: "/games/bingo" },
  { id: "mad", name: "랜덤문장", path: "/games/mad" },
  
  { id: "word", name: "단어랜덤", path: "/games/word" }, //보류
  { id: "mission", name: "미션뽑기", path: "/games/mission" }, //보류
  { id: "quiz", name: "퀴즈", path: "/games/quiz" }, //보류
  { id: "emoji", name: "이모지룰렛", path: "/games/emoji" }, //보류
  { id: "sound", name: "효과음", path: "/games/sound" }, //보류
  { id: "extra1", name: "추가1", path: "/games/extra1" },

  // Page 2
  { id: "extra2", name: "추가2", path: "/games/extra2" },
];