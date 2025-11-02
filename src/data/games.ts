import coinFlipImg from "/coin_flip.png";
import timer from "/timer.png";
import diceImg from "/dice.png";
import rpsImg from "/rps.png";
import swallowImg from "/swallow.png";
import trackImg from "/track.png";

export type GameMeta = {
  id: string;
  name: string;
  path: string;
  image?: string;
  emoji?: string;
  imageSize?: "small" | "medium" | "large";
};

export const GAME_LIST: GameMeta[] = [
  { id: "flip", name: "앞?뒤?", path: "/games/flip", image: coinFlipImg },
  { id: "roulette", name: "룰렛", path: "/games/roulette" },
  { id: "balance", name: "밸런스 게임", path: "/games/balance" },
  { id: "random-question", name: "랜덤 질문", path: "/games/random-question" },
  { id: "dice", name: "주사위", path: "/games/dice", image: diceImg },
  { id: "timer", name: "타이머", path: "/games/timer", image: timer },
  { id: "namepick", name: "제비뽑기", path: "/games/namepick", image: swallowImg },
  { id: "word", name: "단어랜덤", path: "/games/word" },
  { id: "mission", name: "미션뽑기", path: "/games/mission" },
  { id: "quiz", name: "퀴즈", path: "/games/quiz" },
  { id: "team", name: "팀나누기", path: "/games/team" },
  { id: "card", name: "카드뽑기", path: "/games/card" },
  { id: "emoji", name: "이모지룰렛", path: "/games/emoji" },
  { id: "sound", name: "효과음", path: "/games/sound" },
  { id: "order", name: "1빠누구?", path: "/games/order", image: trackImg },
  { id: "rock", name: "안내면진거", path: "/games/rock", image: rpsImg },
  { id: "bingo", name: "빙고", path: "/games/bingo" },
  { id: "lotto", name: "로또뽑기", path: "/games/lotto" },
  { id: "mad", name: "랜덤문장", path: "/games/mad" },
  { id: "draw", name: "사다리타기", path: "/games/draw" },
  // 21번째부터는 2페이지에서 보여야 함
  { id: "extra1", name: "추가1", path: "/games/extra1" },
  { id: "extra2", name: "추가2", path: "/games/extra2" },
];